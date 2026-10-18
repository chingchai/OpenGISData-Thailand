#!/usr/bin/env python3
"""Add postcode arrays from the pinned Thailand Geography JSON snapshot."""

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
SOURCE_COMMIT = "b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b"
SOURCE_URL = (
    "https://raw.githubusercontent.com/thailand-geography-data/"
    f"thailand-geography-json/{SOURCE_COMMIT}/src/geography.json"
)
SOURCE_SHA256 = "04169f87d7b7a21b0a5e14f05b7fe16bab22e7bd9ee5340a7517c6170156f113"
FILES = {
    "subdistricts": "tam_code",
    "districts": "amp_code",
    "provinces": "pro_code",
    "reg_royin": "reg_royin",
    "reg_nesdb": "reg_nesdb",
}
PROPERTIES = re.compile(
    r'("type"\s*:\s*"Feature"\s*,\s*"properties"\s*:\s*)\{([^{}]*)\}'
)


def names(row, source=False):
    keys = (
        ("provinceNameTh", "districtNameTh", "subdistrictNameTh")
        if source else ("pro_th", "amp_th", "tam_th")
    )
    return tuple(" ".join(row[key].split()) for key in keys)


def match_subdistrict(properties, by_code, by_name):
    candidates = by_code.get(properties["tam_code"], [])
    exact = [
        row for row in candidates
        if names(row, source=True) == names(properties)
        and str(row["provinceCode"]) == properties["pro_code"]
        and str(row["districtCode"]) == properties["amp_code"]
    ]
    if len(exact) == 1:
        return exact[0], "code_and_names"
    # A conflicting existing code needs review, even when a name matches elsewhere.
    if candidates:
        return None, "code_name_conflict"
    candidates = [
        row for row in by_name.get(names(properties), [])
        if str(row["provinceCode"]) == properties["pro_code"]
        and str(row["districtCode"]) == properties["amp_code"]
    ]
    if len(candidates) == 1:
        return candidates[0], "unique_names_and_parent_codes"
    return None, "no_unique_match"


def update_properties(text, postcodes):
    values = iter(postcodes)

    def replace(match):
        body = re.sub(r',\s*"postcode"\s*:\s*\[[^\]]*\]', "", match[2])
        content = body.rstrip()
        suffix = body[len(content):]
        addition = json.dumps(next(values), ensure_ascii=False)
        if "\n" in body:
            indent = re.search(r'\n([ \t]*)"', body)[1]
            content += f',\n{indent}"postcode": {addition}'
        else:
            content += f', "postcode": {addition}'
        return match[1] + "{" + content + suffix + "}"

    result, count = PROPERTIES.subn(replace, text)
    if count != len(postcodes):
        raise ValueError("Expected one flat properties object per feature")
    return result


def generate(source_path, check=False):
    raw = source_path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != SOURCE_SHA256:
        raise ValueError("Source differs from the documented pinned snapshot")
    source = json.loads(raw)
    by_code, by_name = defaultdict(list), defaultdict(list)
    for row in source:
        if not re.fullmatch(r"[0-9]{5}", str(row["postalCode"])):
            raise ValueError(f"Invalid postalCode for {row['subdistrictCode']}")
        by_code[str(row["subdistrictCode"])].append(row)
        by_name[names(row, source=True)].append(row)

    texts = {name: (ROOT / f"{name}.geojson").read_text() for name in FILES}
    documents = {name: json.loads(value) for name, value in texts.items()}
    rollups = {name: defaultdict(set) for name in FILES if name != "subdistricts"}
    values, methods, exceptions = [], Counter(), []
    for index, feature in enumerate(documents["subdistricts"]["features"]):
        properties = feature["properties"]
        row, method = match_subdistrict(properties, by_code, by_name)
        methods[method] += 1
        codes = [str(row["postalCode"])] if row else []
        values.append(codes)
        for name, groups in rollups.items():
            groups[properties[FILES[name]]].update(codes)
        if method != "code_and_names":
            exceptions.append({
                "feature_index": index,
                "area": {key: properties[key] for key in (
                    "tam_code", "tam_th", "amp_code", "amp_th", "pro_code", "pro_th"
                )},
                "method": method,
                "postcode": codes,
                "source_subdistrict_code": str(row["subdistrictCode"]) if row else None,
                "code_candidates": [
                    {key: candidate[key] for key in (
                        "provinceNameTh", "districtNameTh", "subdistrictNameTh", "postalCode"
                    )}
                    for candidate in by_code.get(properties["tam_code"], [])
                ],
            })

    report = {
        "source_url": SOURCE_URL,
        "source_sha256": SOURCE_SHA256,
        "retrieved_date": "2026-10-18",
        "source_records": len(source),
        "match_methods": dict(sorted(methods.items())),
        "datasets": {},
        "exceptions": exceptions,
    }
    outputs = {}
    for name, document in documents.items():
        codes = values if name == "subdistricts" else [
            sorted(rollups[name][feature["properties"][FILES[name]]])
            for feature in document["features"]
        ]
        updated = update_properties(texts[name], codes)
        expected = json.loads(texts[name])
        for feature, postcode in zip(expected["features"], codes):
            feature["properties"]["postcode"] = postcode
        if json.loads(updated) != expected:
            raise ValueError(f"Unexpected change outside postcode in {name}")
        outputs[ROOT / f"{name}.geojson"] = updated
        report["datasets"][name] = {
            "features": len(codes),
            "with_postcode": sum(bool(value) for value in codes),
            "empty_postcode": sum(not value for value in codes),
            "empty_features": [
                {key: value for key, value in feature["properties"].items()
                 if key in (FILES[name], "tam_th", "amp_th", "pro_th")}
                for feature, postcode in zip(document["features"], codes)
                if not postcode
            ],
        }

    report_path = ROOT / "docs/data/postcode-report.json"
    outputs[report_path] = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    for path, value in outputs.items():
        if check:
            if not path.exists() or path.read_text() != value:
                raise ValueError(f"Generated output differs: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(value)
    print(json.dumps({
        name: {key: value for key, value in summary.items() if key != "empty_features"}
        for name, summary in report["datasets"].items()
    }, ensure_ascii=False, indent=2))
    print("Verified outputs" if check else "Updated outputs")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Downloaded pinned geography.json")
    parser.add_argument("--check", action="store_true", help="Verify without writing")
    args = parser.parse_args()
    generate(args.source, args.check)
