import json
import unittest

from scripts.add_postcodes import match_subdistrict, names, update_properties


class PostcodeTests(unittest.TestCase):
    def setUp(self):
        self.area = {
            "tam_code": "100101", "tam_th": "พระบรมมหาราชวัง",
            "amp_code": "1001", "amp_th": "พระนคร",
            "pro_code": "10", "pro_th": "กรุงเทพมหานคร",
        }
        self.row = {
            "subdistrictCode": 100101, "subdistrictNameTh": "พระบรมมหาราชวัง",
            "districtCode": 1001, "districtNameTh": "พระนคร",
            "provinceCode": 10, "provinceNameTh": "กรุงเทพมหานคร",
            "postalCode": 10200,
        }

    def test_code_and_names_must_agree(self):
        result = match_subdistrict(self.area, {"100101": [self.row]}, {})
        self.assertEqual(result, (self.row, "code_and_names"))
        other = dict(self.row, subdistrictNameTh="พื้นที่อื่น")
        result = match_subdistrict(
            self.area, {"100101": [other]}, {names(self.area): [self.row]}
        )
        self.assertEqual(result, (None, "code_name_conflict"))

    def test_missing_code_can_match_unique_names_with_parent_codes(self):
        self.area["tam_code"] = "100199"
        result = match_subdistrict(self.area, {}, {names(self.area): [self.row]})
        self.assertEqual(result, (self.row, "unique_names_and_parent_codes"))
        self.area["amp_code"] = "1002"
        result = match_subdistrict(self.area, {}, {names(self.area): [self.row]})
        self.assertEqual(result, (None, "no_unique_match"))

    def test_ambiguous_names_stay_empty(self):
        result = match_subdistrict(self.area, {}, {names(self.area): [self.row] * 2})
        self.assertEqual(result, (None, "no_unique_match"))

    def test_only_feature_properties_change_and_rerun_is_identical(self):
        for properties in ['{ "tam_code": "100101" }', '{\n  "tam_code": "100101"\n}']:
            with self.subTest(properties=properties):
                text = ('{"crs":{"properties":{"name":"CRS84"}},"features":['
                        '{"type":"Feature","properties":' + properties + ','
                        '"geometry":{"type":"Point","coordinates":[1.2300,2.000]}}]}')
                updated = update_properties(text, [["10200"]])
                self.assertIn('"coordinates":[1.2300,2.000]', updated)
                expected = json.loads(text)
                expected["features"][0]["properties"]["postcode"] = ["10200"]
                self.assertEqual(json.loads(updated), expected)
                self.assertEqual(update_properties(updated, [["10200"]]), updated)
                empty = update_properties(updated, [[]])
                self.assertEqual(json.loads(empty)["features"][0]["properties"]["postcode"], [])

    def test_existing_postcode_keeps_position_and_later_fields(self):
        text = ('{"type":"Feature","properties":{"postcode": ["10100"], '
                '"lat": 13.123456, "lon": 101.123456},"geometry":null}')
        expected = text.replace('["10100"]', '["10200"]')
        self.assertEqual(update_properties(text, [["10200"]]), expected)
        self.assertEqual(update_properties(expected, [["10200"]]), expected)


if __name__ == "__main__":
    unittest.main()
