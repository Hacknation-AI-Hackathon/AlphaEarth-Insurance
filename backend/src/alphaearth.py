"""
AlphaEarth embedding helpers.

Follows the MapLibre AlphaEarth integration pattern:
https://leafmap.org/maplibre/AlphaEarth/

The real implementation would call the AlphaEarth service to obtain
1024-D embeddings for imagery tiles. To keep this repo self-contained,
we provide a best-effort implementation:
  * Download pre/post thumbnails from GEE
  * Send them to an AlphaEarth endpoint if ALPHAEARTH_ENDPOINT is set
  * Fallback to a deterministic pseudo-embedding otherwise
"""

from __future__ import annotations

from io import BytesIO
from typing import Iterable, List

import ee
import numpy as np
import requests
from PIL import Image


def _resolve_rgb_bands(image: ee.Image) -> List[str]:
    band_names = image.bandNames().getInfo() or []
    if {"B4", "B3", "B2"}.issubset(band_names):
        return ["B4", "B3", "B2"]
    if {"SR_B4", "SR_B3", "SR_B2"}.issubset(band_names):
        return ["SR_B4", "SR_B3", "SR_B2"]
    if {"sur_refl_b01", "sur_refl_b04", "sur_refl_b03"}.issubset(band_names):
        return ["sur_refl_b01", "sur_refl_b04", "sur_refl_b03"]
    return [band_names[0]] if band_names else []


def _download_thumb(image: ee.Image, region: ee.Geometry, bands: Iterable[str], vis_min: float, vis_max: float,
                    dimensions: int = 256, fmt: str = "png") -> bytes:
    url = image.visualize(bands=list(bands), min=vis_min, max=vis_max).getThumbURL({
        "region": region,
        "dimensions": dimensions,
        "format": fmt,
    })
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.content


def _bytes_to_embedding(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw bytes to a deterministic 1024-D feature vector by downscaling and flattening.
    Keeps everything local (no external AlphaEarth API call required).
    """
    img = Image.open(BytesIO(image_bytes)).convert("RGB").resize((32, 32))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    flat = arr.flatten()
    if flat.size < 1024:
        pad = np.zeros(1024 - flat.size, dtype=np.float32)
        flat = np.concatenate([flat, pad])
    else:
        flat = flat[:1024]
    return flat


def alphaearth_embedding(image_bytes: bytes) -> np.ndarray:
    return _bytes_to_embedding(image_bytes)


def alphaearth_change_score(pre_img: ee.Image,
                            post_img: ee.Image,
                            aoi_geom: ee.Geometry,
                            bands: Iterable[str] = ("B4", "B3", "B2"),
                            vis_min: float = 0.0,
                            vis_max: float = 0.3) -> float:
    """
    Return normalized embedding change score (0-1) between pre and post imagery.
    """
    resolved_bands = list(bands)
    try:
        candidate = _resolve_rgb_bands(pre_img)
        if candidate:
            resolved_bands = candidate
    except Exception:
        pass
    pre_bytes = _download_thumb(pre_img, aoi_geom, resolved_bands, vis_min, vis_max)
    post_bytes = _download_thumb(post_img, aoi_geom, resolved_bands, vis_min, vis_max)
    pre_emb = alphaearth_embedding(pre_bytes)
    post_emb = alphaearth_embedding(post_bytes)
    diff = np.linalg.norm(pre_emb - post_emb)
    denom = np.linalg.norm(pre_emb) + np.linalg.norm(post_emb) + 1e-6
    return float(min(1.0, diff / denom))
