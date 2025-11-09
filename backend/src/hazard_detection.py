import ee
from src.feature_extraction import _mndwi, _nbr, _ndwi, delta, auto_threshold
from src.alphaearth import alphaearth_change_score

# Rule Based detection of hazards no specialized models for now 
def detect_flood(pre_img, post_img, aoi=None, scale=30, return_mask: bool = False):
    pre_mndwi = _mndwi(pre_img)
    post_mndwi = _mndwi(post_img)
    delta_mndwi = delta(pre_mndwi, post_mndwi, "MNDWI")
    flood_mask = auto_threshold(delta_mndwi, "otsu").rename("MNDWI_mask")
    positive_gain = delta_mndwi.gt(0)
    elevation = ee.Image("USGS/SRTMGL1_003")
    low_lying = elevation.lt(40)
    historical = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence").gt(30)
    hydro_context = low_lying.Or(historical)
    refined_mask = flood_mask.And(positive_gain).And(hydro_context)
    # Compute mean of mask (fraction flooded)
    stats = refined_mask.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=aoi or refined_mask.geometry(),
        scale=scale,
        maxPixels=1e7,
        bestEffort=True
    )
    flooded_area_pct = ee.Number(stats.get("MNDWI_mask")).multiply(100)

    # Classify severity
    severity = ee.Algorithms.If(
        flooded_area_pct.lt(10), "none",
        ee.Algorithms.If(flooded_area_pct.lt(40), "moderate", "severe")
    )
    result = {
        "hazard": "flood",
        "damage_pct": flooded_area_pct.getInfo(),
        "severity": severity.getInfo()
    }
    return (result, refined_mask) if return_mask else result

def detect_wildfire(pre_img, post_img, aoi=None, scale=30, return_mask: bool = False):
    pre_nbr = _nbr(pre_img)
    post_nbr = _nbr(post_img)
    dnbr = delta(pre_nbr, post_nbr, "NBR")
    # Apply USGS thresholds
    wildfire_mask = dnbr.gt(0.27).rename("NBR_mask")
    stats = wildfire_mask.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=aoi or wildfire_mask.geometry(),
        scale=scale,
        maxPixels=1e7,
        bestEffort=True
    )
    burn_pct = ee.Number(stats.get("NBR_mask")).multiply(100)
    severity = ee.Algorithms.If(
        burn_pct.lt(10), "none",
        ee.Algorithms.If(burn_pct.lt(30), "low",
        ee.Algorithms.If(burn_pct.lt(50), "moderate", "high"))
    )
    result = {
        "hazard": "wildfire",
        "damage_pct": burn_pct.getInfo(),
        "severity": severity.getInfo()
    }
    return (result, wildfire_mask) if return_mask else result


def compute_rgb_delta(pre_img, post_img):
    """Compute average absolute RGB difference between pre and post images."""
    band_list = pre_img.bandNames().getInfo()
    if {"B4", "B3", "B2"}.issubset(set(band_list)):
        rgb_bands = ["B4", "B3", "B2"]
    elif {"SR_B4", "SR_B3", "SR_B2"}.issubset(set(band_list)):
        rgb_bands = ["SR_B4", "SR_B3", "SR_B2"]
    elif {"sur_refl_b01", "sur_refl_b04", "sur_refl_b03"}.issubset(set(band_list)):
        rgb_bands = ["sur_refl_b01", "sur_refl_b04", "sur_refl_b03"]
    else:
        raise ValueError("Could not resolve RGB bands for the provided imagery.")
    pre_rgb = pre_img.select(rgb_bands)
    post_rgb = post_img.select(rgb_bands)
    diff = post_rgb.subtract(pre_rgb).abs()
    delta_rgb = diff.reduce(ee.Reducer.mean()).rename("RGB_DELTA")
    return delta_rgb

def detect_roof_damage(pre_img, post_img, aoi=None, scale=10, return_mask: bool = False):
    delta_rgb = compute_rgb_delta(pre_img, post_img)
    mask = delta_rgb.gt(0.2)
    stats = mask.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=aoi or mask.geometry(),
        scale=scale,
        maxPixels=1e7,
        bestEffort=True
    )
    damage_pct = ee.Number(stats.get("RGB_DELTA")).multiply(100)
    severity = ee.Algorithms.If(
        damage_pct.lt(10), "none",
        ee.Algorithms.If(damage_pct.lt(30), "low",
        ee.Algorithms.If(damage_pct.lt(50), "moderate", "high"))
    )
    result = {
        "hazard": "roof",
        "damage_pct": damage_pct.getInfo(),
        "severity": severity.getInfo()
    }
    return (result, mask) if return_mask else result
