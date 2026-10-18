import contextlib
import io
import json
import math
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from shapely.geometry import MultiPolygon, Polygon, box, mapping
from shapely.ops import transform

from scripts import add_centroids as centroids


def wgs84(projected):
    return mapping(transform(centroids.INVERSE.transform, projected))


class CentroidTests(unittest.TestCase):
    def assert_projected_centroid(self, geometry, x, y):
        lat, lon = centroids.calculate_centroid(wgs84(geometry))
        expected_lon, expected_lat = centroids.INVERSE.transform(x, y)
        # PROJ's ellipsoidal LAEA inverse round trip has millimetre-scale error.
        self.assertAlmostEqual(lat, expected_lat, delta=1e-7)
        self.assertAlmostEqual(lon, expected_lon, delta=1e-7)

    def test_unequal_multipolygon_parts_are_weighted_by_area(self):
        small = box(-500, -500, 500, 500)
        large = box(9000, -1000, 11000, 1000)
        self.assert_projected_centroid(MultiPolygon([small, large]), 8000, 0)

    def test_offcenter_hole_subtracts_area(self):
        shell = list(box(0, 0, 10000, 10000).exterior.coords)
        hole = list(box(1000, 1000, 3000, 3000).exterior.coords)
        expected = (100 * 5000 - 4 * 2000) / 96
        self.assert_projected_centroid(Polygon(shell, [hole]), expected, expected)

    def test_latitude_longitude_order_and_no_relocation(self):
        geometry = MultiPolygon([box(-11000, -1000, -9000, 1000),
                                 box(9000, -1000, 11000, 1000)])
        source = wgs84(geometry)
        lat, lon = centroids.calculate_centroid(source)
        self.assertAlmostEqual(lat, 13, places=7)
        self.assertAlmostEqual(lon, 101, places=7)
        _, projected = centroids.projected_geometry(source)
        self.assertFalse(projected.covers(projected.centroid))
        self.assert_projected_centroid(geometry, 0, 0)

    def test_rejects_empty_zero_area_and_nonfinite_geometry(self):
        invalid_inputs = [mapping(MultiPolygon([])),
                          wgs84(Polygon([(0, 0), (0, 0), (0, 0), (0, 0)])),
                          {"type": "Polygon", "coordinates": [[[math.inf, 13], [101, 14], [102, 13], [math.inf, 13]]]}]
        for geometry in invalid_inputs:
            with self.subTest(geometry=geometry), self.assertRaises(ValueError):
                centroids.calculate_centroid(geometry)

    def test_only_properties_change_preserving_crs_geometry_bytes_and_order(self):
        for properties in ['{ "postcode": ["10100"] }', '{\n  "postcode": ["10100"]\n}']:
            text = ('{"crs":{"properties":{"name":"CRS84"}},"features":['
                    '{"type":"Feature","properties":' + properties + ','
                    '"geometry":{"type":"Point","coordinates":[1.2300,2.000]}}]}')
            updated = centroids.update_properties(text, [(13.123456789, 101.987654321)])
            expected = json.loads(text)
            expected["features"][0]["properties"].update(lat=13.123457, lon=101.987654)
            self.assertEqual(json.loads(updated), expected)
            self.assertIn('"coordinates":[1.2300,2.000]', updated)
            self.assertTrue(updated.index('"postcode"') < updated.index('"lat"') < updated.index('"lon"'))
            self.assertEqual(centroids.update_properties(updated, [(13.123456789, 101.987654321)]), updated)
            changed = centroids.update_properties(updated, [(14, 102)])
            self.assertEqual(changed, updated.replace('13.123457', '14').replace('101.987654', '102'))

    def make_datasets(self, root):
        geometry = wgs84(MultiPolygon([box(-1000, -1000, 1000, 1000)]))
        for name, id_key in centroids.FILES.items():
            document = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": [{"type": "Feature",
                "properties": {id_key: name, "postcode": ["10100"]}, "geometry": geometry}]}
            (root / f"{name}.geojson").write_text(json.dumps(document))

    def test_check_is_read_only_and_detects_stale_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_datasets(root)
            with patch.object(centroids, "ROOT", root), contextlib.redirect_stdout(io.StringIO()):
                with self.assertRaisesRegex(ValueError, "Generated output differs"):
                    centroids.generate(check=True)
                self.assertFalse((root / "docs").exists())
                centroids.generate()
                before = {path: path.read_bytes() for path in root.rglob("*") if path.is_file()}
                with patch.object(Path, "write_bytes", side_effect=AssertionError("check wrote output")):
                    centroids.generate(check=True)
                centroids.generate()
                self.assertEqual(before, {path: path.read_bytes() for path in before})
                dataset = root / "provinces.geojson"
                dataset.write_text(dataset.read_text().replace('"lat": 13.0', '"lat": 14.0'))
                with self.assertRaisesRegex(ValueError, "Generated output differs"):
                    centroids.generate(check=True)

    def test_validation_of_all_datasets_precedes_any_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_datasets(root)
            path = root / "reg_nesdb.geojson"
            document = json.loads(path.read_text())
            document["features"][0]["geometry"]["coordinates"] = []
            path.write_text(json.dumps(document))
            before = {path: path.read_bytes() for path in root.iterdir()}
            with patch.object(centroids, "ROOT", root), self.assertRaises(ValueError):
                centroids.generate()
            self.assertEqual(before, {path: path.read_bytes() for path in before})
            self.assertFalse((root / "docs").exists())


if __name__ == "__main__":
    unittest.main()
