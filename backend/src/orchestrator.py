"""
    Orchestrates the entire pipeline into one for two features: 
    1. Automated Damage Claims from Satellite/Aerial Imagery
    2. Real-Time Risk Scoring Platform (Flood, Wildfire, Storm, Drought)
"""
import argparse
import json
import os
from typing import Dict, Tuple
from dotenv import load_dotenv

import ee

from src.preprocessing import get_imagery, to_geometry
from src.hazard_detection import detect_flood, detect_roof_damage, detect_wildfire
from src.claim_decision import decide_claim
from src.summarizer import summarize_claim_decision
from src.validation import (
    cross_sensor_check,
    meteorology_check,
    spatial_coherence_check,
    confidence_score,
)


load_dotenv()

HAZARD_DETECTORS = {
    "flood": detect_flood,
    "wildfire": detect_wildfire,
    "roof": detect_roof_damage,
}


def initialize_gee(project: str = None) -> None:
    """Initialize a GEE session, optionally using a specific project."""
    kwargs = {"project": project} if project else {}
    try:
        ee.Initialize(**kwargs)
    except Exception as exc:
        raise RuntimeError(
            "Earth Engine initialization failed. Make sure you ran `earthengine authenticate` or set credentials."
        ) from exc


def fetch_pre_post_imagery(
    aoi, pre_window: Tuple[str, str], post_window: Tuple[str, str], satellite: str, max_cloud: int, reducer: str
) -> Dict[str, Dict]:
    """Fetch pre- and post-event composites."""
    pre_imagery = get_imagery(
        aoi=aoi,
        start_date=pre_window[0],
        end_date=pre_window[1],
        satellite=satellite,
        max_cloud=max_cloud,
        reducer=reducer,
    )
    post_imagery = get_imagery(
        aoi=aoi,
        start_date=post_window[0],
        end_date=post_window[1],
        satellite=satellite,
        max_cloud=max_cloud,
        reducer=reducer,
    )
    return {"pre": pre_imagery, "post": post_imagery}


def detect_hazard(pre_image, post_image, hazard: str, aoi_geom, scale: int, include_mask: bool = False):
    """Dispatch to the requested hazard detector."""
    detector = HAZARD_DETECTORS.get(hazard)
    if detector is None:
        raise ValueError(f"Hazard '{hazard}' not supported. Choose from {list(HAZARD_DETECTORS)}.")
    if include_mask:
        result, mask = detector(pre_image, post_image, aoi=aoi_geom, scale=scale, return_mask=True)
        return result, mask
    return detector(pre_image, post_image, aoi=aoi_geom, scale=scale), None


def run_validation_checks(aoi_geom, pre_dates, post_dates, mask_image, scale: int):
    """Execute validation routines and consolidate confidence scoring."""
    if mask_image is None:
        return {
            "cross_sensor": 0.0,
            "meteorology": 0.0,
            "spatial_coherence": 0.0,
            "confidence": {"confidence_score": 0.0, "label": "Unknown"},
        }
    try:
        cross = cross_sensor_check(aoi_geom, pre_dates[0], post_dates[0], scale=scale)
        met = meteorology_check(aoi_geom, post_dates)
        coherence = spatial_coherence_check(aoi_geom, mask_image, scale=scale)
        conf = confidence_score(cross, met, coherence)
        return {
            "cross_sensor": round(cross, 2),
            "meteorology": round(met, 2),
            "spatial_coherence": round(coherence, 2),
            "confidence": conf,
        }
    except Exception as exc:
        return {
            "error": str(exc),
            "cross_sensor": 0.0,
            "meteorology": 0.0,
            "spatial_coherence": 0.0,
            "confidence": {"confidence_score": 0.0, "label": "Unknown"},
        }


def run_pipeline(
    hazard: str,
    aoi,
    pre_dates: Tuple[str, str],
    post_dates: Tuple[str, str],
    satellite: str,
    max_cloud: int,
    reducer: str,
    scale: int,
) -> Dict:
    """Wire preprocessing → hazard detection → claim decision → summary."""
    imagery = fetch_pre_post_imagery(aoi, pre_dates, post_dates, satellite, max_cloud, reducer)
    hazard_result, mask = detect_hazard(
        imagery["pre"]["image"], imagery["post"]["image"], hazard, aoi, scale, include_mask=True
    )
    validation = run_validation_checks(aoi, pre_dates, post_dates, mask, scale)
    claim_result = decide_claim(hazard_result, validation)
    summary = summarize_claim_decision(claim_result)
    return {
        "hazard": hazard_result,
        "claim": claim_result,
        "summary": summary,
        "validation": validation,
        "visualization": {
            "pre_tile": imagery["pre"]["url_template"],
            "post_tile": imagery["post"]["url_template"],
            "dataset": imagery["pre"]["dataset"],
            "bands": imagery["pre"]["vis_params"]["bands"],
        },
    }


def parse_args():
    """Keep CLI simple while still allowing quick experiments."""
    parser = argparse.ArgumentParser(description="Run the AlphaEarth insurance pipeline end-to-end.")
    parser.add_argument("--hazard", choices=HAZARD_DETECTORS.keys(), default="flood", help="Hazard to evaluate.")
    parser.add_argument("--gee-project", default=os.getenv("GEE_PROJECT"), help="Optional Earth Engine project ID.")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output.")
    return parser.parse_args()


def main():
    args = parse_args()
    initialize_gee(args.gee_project)

    # Fixed demo parameters to keep the example easy to follow.
    aoi_geom = to_geometry([-122.55, 37.60, -122.30, 37.90])  # San Francisco Bay
    pre_dates = ("2023-10-01", "2023-12-31")
    post_dates = ("2024-01-05", "2024-01-20")
    satellite = "sentinel2"
    max_cloud = 60
    reducer = "median"
    scale = 30

    results = run_pipeline(
        hazard=args.hazard,
        aoi=aoi_geom,
        pre_dates=pre_dates,
        post_dates=post_dates,
        satellite=satellite,
        max_cloud=max_cloud,
        reducer=reducer,
        scale=scale,
    )

    indent = 2 if args.pretty else None
    print(json.dumps(results, indent=indent, default=str))
    print("\nSummary:\n", results["summary"])


if __name__ == "__main__":
    main()
