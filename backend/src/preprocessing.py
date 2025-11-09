"""
Preprocessing utilities for fetching pre/post imagery from Google Earth Engine
without downloading rasters. Supports multiple satellites and returns a
Leaflet/MapLibre-ready tile URL template for visualization.

Satellites supported (pick via `satellite` arg):
- 'sentinel2'  -> COPERNICUS/S2_SR_HARMONIZED (10–20m, best general-purpose)
- 'landsat8'   -> LANDSAT/LC08/C02/T1_L2    (30m)
- 'landsat9'   -> LANDSAT/LC09/C02/T1_L2    (30m)
- 'modis'      -> MODIS/061/MOD09GA         (250–500m SR)

Usage example:
    import ee
    from src.preprocessing import get_imagery, to_geometry

    ee.Initialize(project='YOUR_GCP_PROJECT_ID')

    aoi = to_geometry([-119.8, 34.1, -119.4, 34.5])  # bbox [minx,miny,maxx,maxy]
    res = get_imagery(
        aoi=aoi,
        start_date='2025-07-01',
        end_date='2025-07-10',
        satellite='sentinel2',
        max_cloud=20
    )
    print(res['dataset'])
    print(res['url_template'])  # add as raster tile layer in your web map
"""

from typing import Dict, Optional, Union
import ee

# ---------- AOI helpers ----------

def to_geometry(aoi: Union[ee.Geometry, dict, list]) -> ee.Geometry:
    """
    Convert various AOI inputs into an ee.Geometry.
    - If list of 4 numbers: treated as [minx, miny, maxx, maxy] bbox in EPSG:4326
    - If dict: treated as GeoJSON geometry
    - If ee.Geometry: returned as-is
    """
    if isinstance(aoi, ee.Geometry):
        return aoi
    if isinstance(aoi, list) and len(aoi) == 4:
        return ee.Geometry.Rectangle(aoi)
    if isinstance(aoi, dict):
        return ee.Geometry(aoi)
    raise ValueError("Unsupported AOI type. Use ee.Geometry, GeoJSON dict, or [minx,miny,maxx,maxy] list.")


# ---------- Cloud masking & scaling ----------

def _mask_s2_sr_scl(img: ee.Image) -> ee.Image:
    """
    Mask clouds, shadows, cirrus, snow/ice using the Sentinel-2 SCL band.
    Also scales reflectance to ~[0,1] by dividing by 10000.
    """
    scl = img.select('SCL')
    mask = (
        scl.neq(3)   # cloud shadow
        .And(scl.neq(7))   # unclassified
        .And(scl.neq(8))   # cloud medium prob
        .And(scl.neq(9))   # cloud high prob
        .And(scl.neq(10))  # thin cirrus
        .And(scl.neq(11))  # snow/ice
    )
    scaled = img.divide(10000)
    return scaled.updateMask(mask)


def _mask_landsat_l2(img: ee.Image) -> ee.Image:
    """
    Basic mask for Landsat Collection 2 Level-2:
    - QA_PIXEL bits commonly used:
      bit 1: Dilated Cloud
      bit 2: Cirrus
      bit 3: Cloud
      bit 4: Cloud Shadow
      bit 5: Snow
    Scales SR_* bands approximately to [0,1] by dividing by 10000 for quick-look.
    """
    qa = img.select('QA_PIXEL')
    dilated = qa.bitwiseAnd(1 << 1).neq(0)
    cirrus  = qa.bitwiseAnd(1 << 2).neq(0)
    cloud   = qa.bitwiseAnd(1 << 3).neq(0)
    shadow  = qa.bitwiseAnd(1 << 4).neq(0)
    snow    = qa.bitwiseAnd(1 << 5).neq(0)
    mask = dilated.Or(cirrus).Or(cloud).Or(shadow).Or(snow).Not()

    # Approximate scaling for SR bands
    sr_band_list = img.bandNames().filter(ee.Filter.stringStartsWith("item", "SR_B"))
    sr = img.select(sr_band_list).divide(10000)
    other_bands = img.bandNames().removeAll(sr_band_list)
    others = img.select(other_bands)
    scaled = sr.addBands(others, overwrite=True)
    return scaled.updateMask(mask)


def _scale_modis_sr(img: ee.Image) -> ee.Image:
    """
    MODIS surface reflectance scaling factor is 0.0001 for most SR bands.
    """
    sr_bands = ['sur_refl_b01','sur_refl_b02','sur_refl_b03','sur_refl_b04']
    sr = img.select(sr_bands).multiply(0.0001)
    other_bands = img.bandNames().removeAll(sr_bands)
    others = img.select(other_bands)
    return sr.addBands(others, overwrite=True)


# ---------- Core: get_imagery ----------

def get_imagery(
    aoi: Union[ee.Geometry, dict, list],
    start_date: str,
    end_date: str,
    satellite: str = 'sentinel2',
    max_cloud: int = 30,
    reducer: str = 'median',
    vis_bands: Optional[list] = None,
    vis_min: Optional[float] = None,
    vis_max: Optional[float] = None,
    palette: Optional[list] = None,
) -> Dict:
    """
    Build a cloud-masked composite for the chosen satellite over AOI and date range,
    and return a dict with:
      - 'image'        : the ee.Image composite (server-side object)
      - 'dataset'      : dataset ID used
      - 'vis_params'   : visualization params applied
      - 'url_template' : XYZ tile URL template for web maps (no downloads)

    Parameters
    ----------
    aoi : ee.Geometry | GeoJSON dict | [minx,miny,maxx,maxy]
    start_date, end_date : 'YYYY-MM-DD'
    satellite : 'sentinel2' | 'landsat8' | 'landsat9' | 'modis'
    max_cloud : cloud filter (only used where available, e.g. Sentinel-2)
    reducer   : 'median' | 'mosaic'
    """

    geom = to_geometry(aoi)

    # Map satellite presets
    sat = satellite.lower()
    if sat == 'sentinel2':
        dataset = 'COPERNICUS/S2_SR_HARMONIZED'
        coll = (ee.ImageCollection(dataset)
                .filterBounds(geom)
                .filterDate(start_date, end_date)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', max_cloud))
                .map(_mask_s2_sr_scl))
        default_bands = ['B4','B3','B2']  # RGB
        default_min, default_max = 0.02, 0.3

    elif sat == 'landsat8':
        dataset = 'LANDSAT/LC08/C02/T1_L2'
        coll = (ee.ImageCollection(dataset)
                .filterBounds(geom)
                .filterDate(start_date, end_date)
                .map(_mask_landsat_l2))
        default_bands = ['SR_B4','SR_B3','SR_B2']  # RGB
        default_min, default_max = 0.02, 0.3

    elif sat == 'landsat9':
        dataset = 'LANDSAT/LC09/C02/T1_L2'
        coll = (ee.ImageCollection(dataset)
                .filterBounds(geom)
                .filterDate(start_date, end_date)
                .map(_mask_landsat_l2))
        default_bands = ['SR_B4','SR_B3','SR_B2']
        default_min, default_max = 0.02, 0.3

    elif sat == 'modis':
        dataset = 'MODIS/061/MOD09GA'
        coll = (ee.ImageCollection(dataset)
                .filterBounds(geom)
                .filterDate(start_date, end_date)
                .map(_scale_modis_sr))
        # Approximate natural color: 1-4-3 or 1-4-3/1-3-4 depending on product
        default_bands = ['sur_refl_b01','sur_refl_b04','sur_refl_b03']
        default_min, default_max = 0.02, 0.3

    else:
        raise ValueError("Unsupported satellite. Use 'sentinel2', 'landsat8', 'landsat9', or 'modis'.")

    # Reduce to a single image
    if reducer == 'median':
        image = coll.median().clip(geom)
    elif reducer == 'mosaic':
        image = coll.mosaic().clip(geom)
    else:
        raise ValueError("Unsupported reducer. Use 'median' or 'mosaic'.")

    # Visualization parameters
    bands = vis_bands or default_bands
    vmin = default_min if vis_min is None else vis_min
    vmax = default_max if vis_max is None else vis_max
    vis_params = {'bands': bands, 'min': vmin, 'max': vmax}
    if palette:
        vis_params['palette'] = palette

    # Server-side visualization and tile URL template
    vis_img = image.visualize(**vis_params)
    map_id = ee.data.getMapId({'image': vis_img})
    url_template = map_id['tile_fetcher'].url_format

    return {
        'image': image,
        'dataset': dataset,
        'vis_params': vis_params,
        'url_template': url_template,
    }
    
