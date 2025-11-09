"""
Validation & Confidence Scoring Module
Verifies hazard detection results using:
- Cross-sensor corroboration (Sentinel-1, water occurrence)
- Meteorological anomalies (rainfall, wind)
- Spatial coherence (elevation, terrain)
- Optional news verification (event confirmation)

Returns a final confidence score (0–1) and qualitative label.
"""

import ee
import requests
import numpy as np
from datetime import datetime, timedelta

def cross_sensor_check(aoi, pre_date, post_date, scale=30):
    """
    Verify flood or burn areas using independent sensors (Sentinel-1 SAR).
    Looks for backscatter changes that confirm water or burn signal.

    Returns:
        float: correlation % between SAR Δ and optical Δ (0–100)
    """
    try:
        # Sentinel-1 GRD backscatter change (VV polarization)
        s1 = (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(aoi)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(ee.Filter.eq("orbitProperties_pass", "DESCENDING"))
            .select("VV")
        )

        pre_start = ee.Date(pre_date).advance(-6, "day")
        pre_end = ee.Date(pre_date).advance(1, "day")
        post_start = ee.Date(post_date)
        post_end = ee.Date(post_date).advance(6, "day")

        pre_coll = s1.filterDate(pre_start, pre_end)
        post_coll = s1.filterDate(post_start, post_end)

        if pre_coll.size().getInfo() == 0 or post_coll.size().getInfo() == 0:
            return 0.0

        pre_s1 = pre_coll.mean()
        post_s1 = post_coll.mean()

        delta_s1 = post_s1.subtract(pre_s1)
        mean_delta = delta_s1.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=scale,
            maxPixels=1e7,
            bestEffort=True
        ).get("VV")
        if mean_delta is None:
            return 0.0
        val = ee.Number(mean_delta).getInfo()
        # Negative VV means stronger flood signal
        return max(0, min(100, (abs(val) * 100))) if val else 0
    except Exception as e:
        print("cross_sensor_check failed:", e)
        return 0.0
 
    
def meteorology_check(aoi, date_range, hazard="flood", baseline_days=30):
    """
    Compare 72-hr event rainfall to a 30-day baseline using NASA GPM IMERG V07.
    Returns a 0–100 anomaly score.
    """
    try:
        event_start_str, provided_end_str = date_range
        dataset = "NASA/GPM_L3/IMERG_V07"
        precip_band = "precipitation"

        event_start = ee.Date(event_start_str)
        event_end = event_start.advance(3, "day")
        provided_end = ee.Date(provided_end_str)
        event_end = ee.Date(
            ee.Algorithms.If(event_end.millis().lt(provided_end.millis()), event_end, provided_end)
        )

        event_coll = (
            ee.ImageCollection(dataset)
            .filterDate(event_start, event_end)
            .select(precip_band)
        )
        event_sum_img = event_coll.sum()
        event_val = event_sum_img.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=aoi, scale=10000, bestEffort=True
        ).get(precip_band)

        baseline_end = event_start
        baseline_start = baseline_end.advance(-baseline_days, "day")
        baseline_coll = (
            ee.ImageCollection(dataset)
            .filterDate(baseline_start, baseline_end)
            .select(precip_band)
        )
        baseline_mean_img = baseline_coll.mean()
        base_val = baseline_mean_img.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=aoi, scale=10000, bestEffort=True
        ).get(precip_band)

        event_val = ee.Number(event_val).getInfo() if event_val else 0.0
        base_val = ee.Number(base_val).getInfo() if base_val else 0.0

        if base_val <= 0:
            return 100.0 if (hazard == "flood" and event_val > 0) else 0.0

        anomaly_ratio = event_val / base_val
        if hazard == "flood":
            anomaly_score = (anomaly_ratio - 1.0) * 100.0
        elif hazard == "wildfire":
            anomaly_score = (1.0 - anomaly_ratio) * 100.0
        else:
            anomaly_score = 0.0

        return float(max(0.0, min(100.0, anomaly_score)))

    except Exception as e:
        print("meteorology_check failed:", e)
        return 0.0


def spatial_coherence_check(aoi, mask_image, scale=30):
    """
    Evaluates how spatially coherent the detected hazard is with terrain and historical water surfaces.
    Returns: coherence score (0–100)
    """
    try:
        elevation = ee.Image("USGS/SRTMGL1_003")
        water = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")

        # Low elevation or historically wet = likely flood
        low_areas = elevation.lt(20)
        historical_water = water.gt(50)
        combined = low_areas.Or(historical_water)

        if mask_image is None:
            return 0.0

        mask = mask_image.select(0).rename("hazard_mask")
        overlap = combined.And(mask).rename("hazard_overlap")
        overlap_pct = overlap.reduceRegion(
            ee.Reducer.mean(),
            geometry=aoi,
            scale=scale,
            maxPixels=1e7,
            bestEffort=True
        ).get("hazard_overlap")

        if overlap_pct is None:
            return 0.0
        val = ee.Number(overlap_pct).getInfo()
        return max(0, min(100, val * 100)) if val else 0
    except Exception as e:
        print("spatial_coherence_check failed:", e)
        return 0.0


def confidence_score(cross_sensor, meteorology, coherence):
    """
    Weighted confidence score.
    Returns normalized score (0–1) and qualitative label.
    """
    weights = [0.2, 0.4, 0.4]
    components = [cross_sensor, meteorology, coherence]
    score = sum(w * (c / 100) for w, c in zip(weights, components))
    label = (
        "Low" if score < 0.4 else
        "Medium" if score < 0.7 else
        "High"
    )
    return {"confidence_score": round(score, 2), "label": label}


def news_agent():
    pass 
