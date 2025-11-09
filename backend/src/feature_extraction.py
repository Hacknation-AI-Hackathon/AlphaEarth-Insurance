
from typing import Iterable
import ee

def _select_first_available(image: ee.Image, candidates: Iterable[str]) -> ee.Image:
    """
    Select the first band present from the list of candidates.
    Falls back gracefully if certain sensors lack a requested band.
    """
    band_names = image.bandNames().getInfo()
    for band in candidates:
        if band in band_names:
            return image.select(band)
    raise ValueError(f"None of the requested bands {list(candidates)} exist in image (bands: {band_names}).")


def _ndwi(image: ee.Image) -> ee.Image:
    """
    Compute NDWI (Normalized Difference Water Index).
    NDWI = (Green - NIR) / (Green + NIR)
      Sentinel-2:  Green=B3, NIR=B8
      Landsat L2:  Green=SR_B3, NIR=SR_B5
    """
    green = _select_first_available(image, ("B3", "SR_B3", "sur_refl_b04"))
    nir = _select_first_available(image, ("B8", "SR_B5", "sur_refl_b02"))
    return image.normalizedDifference([green.bandNames().get(0), nir.bandNames().get(0)]).rename('NDWI')


def _nbr(image: ee.Image) -> ee.Image:
    """
    Compute NBR (Normalized Burn Ratio).
    NBR = (NIR - SWIR2) / (NIR + SWIR2)
      Sentinel-2:  NIR=B8, SWIR2=B12
      Landsat L2:  NIR=SR_B5, SWIR2=SR_B7
    """
    nir = _select_first_available(image, ("B8", "SR_B5", "sur_refl_b02"))
    swir2 = _select_first_available(image, ("B12", "SR_B7", "sur_refl_b07"))
    return image.normalizedDifference([nir.bandNames().get(0), swir2.bandNames().get(0)]).rename('NBR')


def _mndwi(image: ee.Image) -> ee.Image:
    """
    Compute MNDWI (Modified Normalized Difference Water Index).
    MNDWI = (Green - SWIR1) / (Green + SWIR1)
      Sentinel-2:  Green=B3, SWIR1=B11
      Landsat L2:  Green=SR_B3, SWIR1=SR_B6
    """
    green = _select_first_available(image, ("B3", "SR_B3", "sur_refl_b04"))
    swir1 = _select_first_available(image, ("B11", "SR_B6", "sur_refl_b06"))
    return image.normalizedDifference([green.bandNames().get(0), swir1.bandNames().get(0)]).rename('MNDWI')


def delta(pre_img: ee.Image, post_img: ee.Image, band_name: str) -> ee.Image:
    """
    Compute the difference (post - pre) for a given spectral index band.
    Example usage:
        dndwi = delta(pre_ndwi, post_ndwi, 'NDWI')
    Returns:
        ee.Image with one band named 'delta_<band_name>'
    """
    pre_band = pre_img.select(band_name)
    post_band = post_img.select(band_name)
    diff = post_band.subtract(pre_band).rename(f"delta_{band_name}")
    return diff


def auto_threshold(image: ee.Image, method: str = "otsu", scale: int = 30) -> ee.Image:
    """
    Compute an automatic threshold mask for a single-band image (e.g., delta index)
    using Otsu's method to separate foreground (damage/water/burn) and background.
    
    Parameters:
        image  : ee.Image (single-band)
        method : currently only supports 'otsu'
        scale  : nominal scale in meters for reducer
    
    Returns:
        ee.Image binary mask (1 = affected, 0 = unaffected)
    
    Example:
        flood_mask = auto_threshold(delta_mndwi, "otsu")
    """
    band_names = image.bandNames().getInfo() or []
    if not band_names:
        raise ValueError("auto_threshold requires an image with at least one band.")
    band = band_names[0]
    
    if method.lower() != "otsu":
        raise ValueError("Currently only 'otsu' method is supported.")
    
    # Compute histogram of pixel values (client-side for stability)
    hist_dict = image.select(band).reduceRegion(
        reducer=ee.Reducer.histogram(maxBuckets=256),
        geometry=image.geometry(),
        scale=scale,
        bestEffort=True
    ).get(band)

    if hist_dict is None:
        raise ValueError("Histogram computation failed; ensure the image has valid data over the geometry.")

    hist_info = ee.Dictionary(hist_dict).getInfo()
    histogram = hist_info.get("histogram")
    bins = hist_info.get("bucketMeans")

    if not histogram or not bins:
        raise ValueError("Histogram data is empty; cannot compute threshold.")

    total = sum(histogram)
    if total == 0:
        raise ValueError("Histogram has zero total counts; cannot compute threshold.")

    total_mean = sum(b * h for b, h in zip(bins, histogram)) / total
    weight_bg = 0.0
    sum_bg = 0.0
    max_between = -1.0
    threshold_value = bins[0]

    for bin_value, count in zip(bins, histogram):
        weight_bg += count
        if weight_bg == 0:
            continue
        weight_fg = total - weight_bg
        if weight_fg == 0:
            break
        sum_bg += bin_value * count
        mean_bg = sum_bg / weight_bg
        mean_fg = (total_mean * total - sum_bg) / weight_fg
        between = weight_bg * weight_fg * (mean_bg - mean_fg) ** 2
        if between > max_between:
            max_between = between
            threshold_value = bin_value

    mask = image.gt(ee.Number(threshold_value))
    return mask.rename(f"{band}_mask")
