# Demo evidence

The authoritative, updateable evidence artifact is:
https://github.com/shobhitb19/enterprise-guardrails-demo/issues/1

It is intentionally separate from protected main: results can be recorded
without weakening main's human-review gate or opening a release PR.

## Bootstrap observations

- Exact authenticated login: `shobhitb19`; repository public; admin permission.
- Repository secret scanning and push protection reported `enabled`.
- Actions enabled; CodeQL default setup not configured (advanced workflow supplied).
- Copilot appears in GraphQL `suggestedActors` as `copilot-swe-agent`.
  This is not yet evidence of a completed coding-agent task.
- Local TypeScript build and five API integration tests passed.

Ruleset enforcement, real scan findings, Autofix generation, actual agent work
and an inert blocked push are **not established by these bootstrap observations**.
See the live issue for final measured results, exact URLs, failures and limitations.

No fake SARIF, simulated agent commits, real secrets, customer materials,
production resources, or organization/enterprise policy changes are used.
