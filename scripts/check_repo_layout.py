#!/usr/bin/env python3
"""Check repository placement, local Markdown links and deployment source paths."""

import re
from pathlib import Path
import subprocess
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    "apps/tpmap-dashboard/README.md",
    "apps/tpmap-dashboard/household-dashboard.html",
    "apps/procurement-system/README.md",
    "apps/procurement-system/CLAUDE.md",
    "apps/procurement-system/client/package.json",
    "apps/procurement-system/server/package.json",
    "deploy/deploy.sh",
    "deploy/nginx/nginx.conf.example",
    "deploy/nginx/nginx.conf.complete",
    "deploy/nginx/nginx-procurement-tpmap.conf.example",
    "docs/deployment/README.md",
    "docs/deployment/MIGRATION.md",
    "provinces.geojson",
    "districts.geojson",
    "subdistricts.geojson",
    "reg_royin.geojson",
    "reg_nesdb.geojson",
)
LEGACY_ROOT = (
    "procurement-system", "tpmap_act", "deploy.sh", "install-tpmap.sh",
    "DEPLOY.md", "DEPLOYMENT-PROCUREMENT-TPMAP.md", "DEPLOYMENT_GUIDE.md",
    "DEPLOYMENT_GUIDE_FULL.md", "DEPLOYMENT_INSTRUCTIONS.md",
    "DEPLOYMENT_STANDALONE.md", "DEPLOY_TO_PRODUCTION.md",
    "INDICATOR-PROBLEMS-VERIFICATION.md", "INSTALL-COMMANDS.txt", "PR_DESCRIPTION.md",
    "nginx.conf.example", "nginx.conf.complete", "nginx-procurement-tpmap.conf.example",
)
IGNORED_PARTS = {".git", "node_modules", "__pycache__", ".venv", ".venv-centroids"}
LINK = re.compile(r'(?<!!)\[[^\]]+\]\(([^)]+)\)')
OLD_SOURCE_PATH = re.compile(
    r"OpenGISData-Thailand/(?:procurement-system|tpmap_act)(?:/|\b)"
    r"|\$(?:\{)?(?:PROJECT_ROOT|REPO_ROOT)(?:\})?/(?:procurement-system|tpmap_act)(?:/|\b)"
    r"|(?<!apps/)\bprocurement-system/(?:client|server)(?:/|\b)"
)


def source_files(root):
    return sorted(
        path for path in root.rglob("*")
        if path.is_file() and not IGNORED_PARTS.intersection(path.relative_to(root).parts)
    )


def local_link_errors(root):
    errors = []
    for path in source_files(root):
        if path.suffix.lower() != ".md":
            continue
        text = re.sub(r"^```[^\n]*\n.*?^```[^\n]*$", "", path.read_text(), flags=re.M | re.S)
        for match in LINK.finditer(text):
            target = match[1].strip().split(' "')[0].strip("<>")
            parsed = urlsplit(target)
            if not target or parsed.scheme or parsed.netloc or target.startswith(("#", "/")):
                continue
            if path == root / "README.md" and target in ("../../pulls", "../../issues"):
                continue
            if parsed.path and not (path.parent / unquote(parsed.path)).exists():
                errors.append(f"{path.relative_to(root)}: missing local link {target}")
    return errors


def stale_path_errors(root):
    errors = []
    excluded = {
        "docs/deployment/MIGRATION.md",
        "scripts/check_repo_layout.py",
        "tests/test_repo_layout.py",
    }
    for path in source_files(root):
        relative = path.relative_to(root).as_posix()
        if relative in excluded or relative.startswith("docs/history/"):
            continue
        if path.suffix not in (".md", ".sh", ".js", ".cjs", ".conf", ".example", ".complete", ".txt"):
            continue
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if OLD_SOURCE_PATH.search(line):
                errors.append(f"{relative}:{number}: old repository source path")
    return errors


def check(root=ROOT):
    errors = [f"Missing required path: {name}" for name in REQUIRED if not (root / name).exists()]
    errors += [f"Legacy root path remains: {name}" for name in LEGACY_ROOT if (root / name).exists()]
    errors += local_link_errors(root)
    errors += stale_path_errors(root)
    shell_files = [path for path in source_files(root) if path.suffix == ".sh"]
    for path in shell_files:
        result = subprocess.run(["bash", "-n", str(path)], capture_output=True, text=True)
        if result.returncode:
            errors.append(f"{path.relative_to(root)}: {result.stderr.strip()}")
    if errors:
        raise ValueError("\n".join(errors))
    print(f"Repository layout and local Markdown links verified; {len(shell_files)} shell scripts passed bash -n.")


if __name__ == "__main__":
    check()
