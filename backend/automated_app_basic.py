import os
from typing import Dict, List, Literal, Optional

import ee
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, FieldValidationInfo, field_validator

from src.hazard_detection import detect_flood, detect_roof_damage, detect_wildfire
from src.claim_decision import decide_claim
from src.preprocessing import get_imagery, to_geometry
from src.summarizer import summarize_claim_decision
from src.validation import (
    cross_sensor_check,
    meteorology_check,
    spatial_coherence_check,
    confidence_score,
)

load_dotenv()

app = FastAPI(title="Automated Damage Claims from Satellite Imagery")

GEE_PROJECT = os.getenv("GEE_PROJECT")
SUPPORTED_HAZARDS = {"flood": detect_flood, "wildfire": detect_wildfire, "roof": detect_roof_damage}
DEFAULT_SCALES = {"flood": 30, "wildfire": 30, "roof": 10}


def initialize_gee() -> None:
    """Ensure Earth Engine is initialized once per process."""
    if getattr(initialize_gee, "_initialized", False):
        return
    kwargs = {"project": GEE_PROJECT} if GEE_PROJECT else {}
    try:
        ee.Initialize(**kwargs)
    except Exception as exc:  # pragma: no cover - relies on EE runtime
        raise RuntimeError(
            "Failed to initialize Earth Engine. Run `earthengine authenticate` and set GEE_PROJECT if required."
        ) from exc
    initialize_gee._initialized = True  # type: ignore[attr-defined]


class PreprocessingWindow(BaseModel):
    start: str = Field(..., description="Start date in YYYY-MM-DD")
    end: str = Field(..., description="End date in YYYY-MM-DD")

    @field_validator("end")
    @classmethod
    def validate_order(cls, v, info: FieldValidationInfo):
        start = info.data.get("start")
        if start and v < start:
            raise ValueError("end date must be after start date")
        return v


class preprocessing_schema(BaseModel):
    aoi: List[float] = Field(..., min_items=4, max_items=4, description="Bounding box [minLon, minLat, maxLon, maxLat]")
    pre: PreprocessingWindow
    post: PreprocessingWindow
    satellite: Optional[Literal["sentinel2", "landsat8", "landsat9", "modis"]] = None
    max_cloud: Optional[int] = Field(None, ge=0, le=100)
    reducer: Optional[Literal["median", "mosaic"]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "aoi": [-95.7, 29.5, -95.0, 29.9],
                "pre": {"start": "2017-08-01", "end": "2017-08-10"},
                "post": {"start": "2017-08-29", "end": "2017-09-07"},
            }
        }


class hazard_detection_schema(BaseModel):
    hazard: Optional[Literal["flood", "wildfire", "roof"]] = None
    scale: Optional[int] = Field(None, description="Nominal EE reducer scale in meters")


class claim_decision_schema(BaseModel):
    include_summary: Optional[bool] = None
    include_tiles: Optional[bool] = None


class orchestrator_schema(BaseModel):
    preprocessing: preprocessing_schema
    hazard: Optional[hazard_detection_schema] = None
    claim: Optional[claim_decision_schema] = None

    class Config:
        json_schema_extra = {
            "example": {
                "preprocessing": {
                    "aoi": [-95.7, 29.5, -95.0, 29.9],
                    "pre": {"start": "2017-08-01", "end": "2017-08-10"},
                    "post": {"start": "2017-08-29", "end": "2017-09-07"}
                },
                "hazard": {"hazard": "roof"}
            }
        }


def _get_imagery_pair(config: preprocessing_schema) -> Dict[str, Dict]:
    aoi_geom = to_geometry(config.aoi)
    satellite = config.satellite or "sentinel2"
    max_cloud = config.max_cloud if config.max_cloud is not None else 30
    reducer = config.reducer or "median"

    def _assert_bands(image, label: str):
        bands = image.bandNames().getInfo()
        if not bands:
            raise ValueError(
                f"No usable imagery found for {label} window. "
                f"Try expanding the date range or increasing max_cloud."
            )
        return bands

    pre = get_imagery(
        aoi_geom,
        start_date=config.pre.start,
        end_date=config.pre.end,
        satellite=satellite,
        max_cloud=max_cloud,
        reducer=reducer,
    )
    post = get_imagery(
        aoi_geom,
        start_date=config.post.start,
        end_date=config.post.end,
        satellite=satellite,
        max_cloud=max_cloud,
        reducer=reducer,
    )
    _assert_bands(pre["image"], "pre-event")
    _assert_bands(post["image"], "post-event")
    return {"pre": pre, "post": post, "geometry": aoi_geom}


def _run_hazard(pre_img, post_img, hazard_key: str, scale: int, aoi_geom, include_mask: bool = False):
    detector = SUPPORTED_HAZARDS[hazard_key]
    if include_mask:
        return detector(pre_img, post_img, aoi=aoi_geom, scale=scale, return_mask=True)
    return detector(pre_img, post_img, aoi=aoi_geom, scale=scale), None


def _run_validation(aoi_geom, pre_window, post_window, mask_image, scale: int, hazard: str):
    if mask_image is None:
        return {
            "cross_sensor": 0.0,
            "meteorology": 0.0,
            "spatial_coherence": 0.0,
            "confidence": {"confidence_score": 0.0, "label": "Unknown"},
        }
    try:
        cross = cross_sensor_check(aoi_geom, pre_window[0], post_window[0], scale=scale)
        met = meteorology_check(aoi_geom, post_window, hazard=hazard)
        coherence = spatial_coherence_check(aoi_geom, mask_image, scale=scale)
        conf = confidence_score(cross, met, coherence)
        return {
            "cross_sensor": round(cross, 2),
            "meteorology": round(met, 2),
            "spatial_coherence": round(coherence, 2),
            "confidence": conf,
        }
    except Exception as exc:  # pragma: no cover
        return {
            "error": str(exc),
            "cross_sensor": 0.0,
            "meteorology": 0.0,
            "spatial_coherence": 0.0,
            "confidence": {"confidence_score": 0.0, "label": "Unknown"},
        }


def _build_response(config: orchestrator_schema) -> Dict:
    imagery = _get_imagery_pair(config.preprocessing)
    pre_dates = (config.preprocessing.pre.start, config.preprocessing.pre.end)
    post_dates = (config.preprocessing.post.start, config.preprocessing.post.end)
    hazard_cfg = config.hazard or hazard_detection_schema()
    claim_cfg = config.claim or claim_decision_schema()

    def evaluate(hazard_key: str, scale_override: Optional[int] = None):
        scale = scale_override or DEFAULT_SCALES.get(hazard_key, 30)
        hazard_result, mask = _run_hazard(
            imagery["pre"]["image"],
            imagery["post"]["image"],
            hazard_key,
            scale,
            imagery["geometry"],
            include_mask=True,
        )
        validation = _run_validation(
            imagery["geometry"],
            pre_dates,
            post_dates,
            mask,
            scale,
            hazard_key,
        )
        claim_result = decide_claim(hazard_result, validation)
        fused_score = claim_result.get("fused_score", 0.0)
        return {
            "hazard_key": hazard_key,
            "scale": scale,
            "hazard": hazard_result,
            "validation": validation,
            "claim": claim_result,
            "fused_score": fused_score,
        }

    if hazard_cfg.hazard:
        best = evaluate(hazard_cfg.hazard, hazard_cfg.scale)
        candidates = [best]
    else:
        candidates = [evaluate(key, hazard_cfg.scale) for key in SUPPORTED_HAZARDS.keys()]
        best = max(candidates, key=lambda item: item["fused_score"])

    hazard_result = best["hazard"]
    validation = best["validation"]
    claim_result = best["claim"]

    response = {
        "hazard": hazard_result,
        "validation": validation,
        "claim": claim_result,
        "ranked_hazards": [
            {
                "hazard": c["hazard_key"],
                "fused_score": c["fused_score"],
                "damage_pct": c["hazard"].get("damage_pct"),
                "confidence_label": c["claim"].get("confidence_label"),
            }
            for c in sorted(candidates, key=lambda item: item["fused_score"], reverse=True)
        ],
    }

    if claim_cfg.include_summary is not False:
        response["summary"] = summarize_claim_decision(claim_result)

    if claim_cfg.include_tiles is not False:
        response["visualization"] = {
            "pre_tile": imagery["pre"]["url_template"],
            "post_tile": imagery["post"]["url_template"],
            "dataset": imagery["pre"]["dataset"],
            "bands": imagery["pre"]["vis_params"]["bands"],
            "aoi": config.preprocessing.aoi,
        }

    return response


@app.post("/claim_processing_basic")
def claim_detection_basic(config: orchestrator_schema):
    """
    Rule-based pipeline (no ML) for automatic claim processing.
    Returns the full response payload so clients see summaries
    and visualization tiles alongside hazard/claim metadata.
    """
    initialize_gee()
    try:
        return _build_response(config)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))



if __name__ == "__main__":
    uvicorn.run("automated_app:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
