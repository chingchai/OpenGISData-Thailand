from pathlib import Path
import os
import re
import subprocess
import tempfile
import unittest

from scripts.check_repo_layout import local_link_errors, stale_path_errors


class RepositoryLayoutTests(unittest.TestCase):
    def test_documented_tpmap_git_update_refreshes_served_copy(self):
        repository = Path(__file__).resolve().parents[1]
        for name in ("README.md", "DEPLOYMENT.md"):
            with self.subTest(document=name), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                source = root / "apps/tpmap-dashboard"
                served = root / "tpmap_act"
                source.mkdir(parents=True)
                served.mkdir()
                (source / "household-dashboard.html").write_text("updated dashboard")
                (served / "household-dashboard.html").write_text("old dashboard")
                stubs = root / "bin"
                stubs.mkdir()
                for command, body in {
                    "sudo": 'exec "$@"', "git": "exit 0", "systemctl": "exit 0"
                }.items():
                    path = stubs / command
                    path.write_text("#!/bin/bash\n" + body + "\n")
                    path.chmod(0o755)
                document = (repository / "apps/tpmap-dashboard" / name).read_text()
                block = re.search(
                    r"```bash\n(cd /var/www/tpmap-household-dashboard\nsudo git pull.*?)```",
                    document, re.S,
                )
                self.assertIsNotNone(block)
                commands = block[1].replace("/var/www/tpmap-household-dashboard", str(root))
                subprocess.run(
                    ["bash", "-e", "-c", commands], check=True, capture_output=True,
                    env=dict(os.environ, PATH=str(stubs) + os.pathsep + os.environ["PATH"]),
                )
                self.assertEqual((served / "household-dashboard.html").read_text(), "updated dashboard")

    def test_relative_links_resolve_from_document_location(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            docs = root / "docs/deployment"
            docs.mkdir(parents=True)
            (root / "README.md").write_text("Home")
            (docs / "README.md").write_text(
                "[Home](../../README.md) [Missing](./missing.md)\n"
                "[External](https://example.com/page) [Section](#section)\n"
                "```markdown\n[Sample](./example.md)\n```\n"
            )
            self.assertEqual(local_link_errors(root), [
                "docs/deployment/README.md: missing local link ./missing.md"
            ])

    def test_moved_source_paths_are_distinct_from_service_names(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            script = root / "deploy.sh"
            script.write_text(
                "cd /var/www/OpenGISData-Thailand/procurement-system/server\n"
                "cd /var/www/OpenGISData-Thailand/apps/procurement-system/server\n"
                "pm2 restart procurement-api\n"
                "echo https://example.com/procurement/api\n"
            )
            self.assertEqual(stale_path_errors(root), [
                "deploy.sh:1: old repository source path"
            ])

    def test_migration_guide_can_document_old_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            guide = root / "docs/deployment/MIGRATION.md"
            guide.parent.mkdir(parents=True)
            guide.write_text("Old /var/www/OpenGISData-Thailand/procurement-system/server")
            self.assertEqual(stale_path_errors(root), [])


if __name__ == "__main__":
    unittest.main()
