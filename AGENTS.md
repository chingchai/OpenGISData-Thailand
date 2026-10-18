## Agent skills

### Issue tracker

Track issues and specs in GitHub Issues for
`chingchai/OpenGISData-Thailand`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout. See `docs/agents/domain.md`.

## Repository layout

Keep published GeoJSON files at the repository root to preserve download URLs.
Place application code and app-specific guides in `apps/<app>/`. Before editing an
app, read its `CLAUDE.md` when present. Keep shared deployment guides in
`docs/deployment/` and shared Nginx templates in `deploy/nginx/`. When moving
files, update callers and links and run `python3 scripts/check_repo_layout.py`.
