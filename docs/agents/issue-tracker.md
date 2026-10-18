# Issue tracker

Issues and specs live in GitHub Issues for
`chingchai/OpenGISData-Thailand`. Use the `gh` CLI from this repo.

## Operations

- Create issues with `gh issue create --title "..." --body-file <file>`.
- Read issues with `gh issue view <number> --json number,title,body,labels,comments`.
- List issues with `gh issue list`, using state and label filters as needed.
- Comment with `gh issue comment <number> --body-file <file>`.
- Apply or remove labels with `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close issues with `gh issue close <number> --comment "..."`.

Publishing to the issue tracker means creating a GitHub issue.
Fetching a relevant ticket means reading its GitHub issue.

## Pull requests as a triage surface

PRs as a request surface: no.
