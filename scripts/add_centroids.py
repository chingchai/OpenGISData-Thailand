#!/usr/bin/env python3
"""Add WGS84 lat/lon from each feature's area-weighted LAEA centroid."""

import argparse
import json
import math
from pathlib import Path
import re

import pyproj
from pyproj import Transformer
import shapely
from shapely.geometry import Point, shape
from shapely.ops import transform
from shapely.validation import explain_validity


ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "subdistricts": "tam_code",
    "districts": "amp_code",
    "provinces": "pro_code",
    "reg_royin": "reg_royin",
    "reg_nesdb": "reg_nesdb",
}
PROJECTION = "+proj=laea +lat_0=13 +lon_0=101 +datum=WGS84 +units=m +no_defs"
FORWARD = Transformer.from_crs("EPSG:4326", PROJECTION, always_xy=True)
INVERSE = Transformer.from_crs(PROJECTION, "EPSG:4326", always_xy=True)
PROPERTIES = re.compile(
    r'("type"\s*:\s*"Feature"\s*,\s*"properties"\s*:\s*)\{([^{}]*)\}'
)


def projected_geometry(geometry):
    """Validate the computation inputs without repairing or relocating geometry."""
    original = shape(geometry)
    if original.geom_type not in ("Polygon", "MultiPolygon") or original.is_empty:
        raise ValueError("Centroids require a nonempty Polygon or MultiPolygon")
    if not all(math.isfinite(value) for point in shapely.get_coordinates(original) for value in point):
        raise ValueError("Geometry contains nonfinite coordinates")
    projected = transform(FORWARD.transform, original)
    if not all(math.isfinite(value) for point in shapely.get_coordinates(projected) for value in point):
        raise ValueError("Projected geometry contains nonfinite coordinates")
    if not math.isfinite(projected.area) or projected.area <= 0:
        raise ValueError("Projected geometry must have finite positive area")
    return original, projected


def centroid_from_projected(projected):
    center = projected.centroid
    lon, lat = INVERSE.transform(center.x, center.y, errcheck=True)
    if not (math.isfinite(lat) and math.isfinite(lon)):
        raise ValueError("Centroid coordinates must be finite")
    return lat, lon


def calculate_centroid(geometry):
    """Return unrounded (latitude, longitude) in WGS84, weighted by polygon area."""
    _, projected = projected_geometry(geometry)
    return centroid_from_projected(projected)


def update_properties(text, coordinates):
    """Patch only feature properties, preserving all existing formatting and bytes."""
    values = iter(coordinates)

    def replace(match):
        body = match[2]
        lat, lon = next(values)
        for key, value in (("lat", lat), ("lon", lon)):
            if not math.isfinite(value):
                raise ValueError("Centroid coordinates must be finite")
            value_text = json.dumps(round(value, 6), allow_nan=False)
            existing = re.search(r'"' + key + r'"\s*:\s*', body)
            if existing:
                _, length = json.JSONDecoder().raw_decode(body[existing.end():])
                body = body[:existing.end()] + value_text + body[existing.end() + length:]
            else:
                content = body.rstrip()
                suffix = body[len(content):]
                separator = "," if content.strip() else ""
                if "\n" in body:
                    indent_match = re.search(r'\n([ \t]*)"', body)
                    indent = indent_match[1] if indent_match else "  "
                    content += f'{separator}\n{indent}"{key}": {value_text}'
                else:
                    content += f'{separator} "{key}": {value_text}'
                body = content + suffix
        return match[1] + "{" + body + "}"

    result, count = PROPERTIES.subn(replace, text)
    if count != len(coordinates):
        raise ValueError("Expected one flat properties object per feature")
    return result


def generate(check=False):
    report = {
        "input_crs": "OGC:CRS84 (longitude, latitude; WGS84)",
        "projection": PROJECTION,
        "output_crs": "EPSG:4326 (lat and lon properties; WGS84)",
        "always_xy": True,
        "method": "Area-weighted centroid of each feature's own projected geometry; holes subtract area",
        "rounding": {"decimal_places": 6, "rule": "Python round (nearest, ties to even)", "storage": "JSON number"},
        "versions": {"shapely": shapely.__version__, "geos": shapely.geos_version_string,
                     "pyproj": pyproj.__version__, "proj": pyproj.proj_version_str},
        "containment": "Projected geometry covers centroid (boundary included). Unrounded uses original projected centroid; rounded projects the stored WGS84 point back to LAEA.",
        "invalid_geometry_policy": "Report input/projected invalidity; compute finite positive-area geometry without repair. Invalid inputs may have unreliable centroids.",
        "outside_centroid_policy": "Preserve computed centroid even outside geometry; never relocate",
        "datasets": {},
    }
    outputs = {}
    for name, id_key in FILES.items():
        path = ROOT / f"{name}.geojson"
        original_bytes = path.read_bytes()
        text = original_bytes.decode("utf-8")
        document = json.loads(text)
        crs_name = document.get("crs", {}).get("properties", {}).get("name")
        if crs_name != "urn:ogc:def:crs:OGC:1.3:CRS84":
            raise ValueError(f"Unexpected input CRS in {name}: {crs_name}")
        coordinates = []
        summary = {"features": len(document["features"]), "invalid_input": [],
                   "invalid_projected": [], "outside_unrounded": [], "outside_rounded": []}
        for index, feature in enumerate(document["features"]):
            identity = {"feature_index": index, "id": feature["properties"][id_key]}
            try:
                original, projected = projected_geometry(feature["geometry"])
                lat, lon = centroid_from_projected(projected)
            except (ValueError, pyproj.exceptions.ProjError) as error:
                raise ValueError(f"{name} feature {identity}: {error}") from error
            if not original.is_valid:
                summary["invalid_input"].append(dict(identity, reason=explain_validity(original)))
            if not projected.is_valid:
                summary["invalid_projected"].append(dict(identity, reason=explain_validity(projected)))
            rounded = round(lat, 6), round(lon, 6)
            coordinates.append(rounded)
            if not projected.covers(projected.centroid):
                summary["outside_unrounded"].append(identity)
            rounded_point = Point(*FORWARD.transform(rounded[1], rounded[0], errcheck=True))
            if not projected.covers(rounded_point):
                summary["outside_rounded"].append(identity)
        updated = update_properties(text, coordinates)
        expected = json.loads(text)
        for feature, (lat, lon) in zip(expected["features"], coordinates):
            feature["properties"].update(lat=lat, lon=lon)
        if json.loads(updated) != expected:
            raise ValueError(f"Unexpected change outside lat/lon in {name}")
        # New fields must be the only byte changes on first generation.
        if all("lat" not in f["properties"] and "lon" not in f["properties"] for f in document["features"]):
            stripped = re.sub(r',(?:\n[ \t]*| )"(?:lat|lon)": -?[0-9]+(?:\.[0-9]+)?', "", updated)
            if stripped.encode("utf-8") != original_bytes:
                raise ValueError(f"Unexpected byte changes outside new fields in {name}")
        for field in ("invalid_input", "invalid_projected", "outside_unrounded", "outside_rounded"):
            summary[field + "_count"] = len(summary[field])
        report["datasets"][name] = summary
        outputs[path] = updated.encode("utf-8")
    report_path = ROOT / "docs/data/centroid-report.json"
    outputs[report_path] = (json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")
    # Complete every computation and validation before mutating any dataset.
    if check:
        for path, value in outputs.items():
            if not path.exists() or path.read_bytes() != value:
                raise ValueError(f"Generated output differs: {path.relative_to(ROOT)}")
    else:
        for path, value in outputs.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(value)
    print(json.dumps({name: {key: value for key, value in summary.items() if key == "features" or key.endswith("_count")}
                      for name, summary in report["datasets"].items()}, indent=2))
    print("Verified outputs" if check else "Updated outputs")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify all outputs without writing")
    generate(parser.parse_args().check)
