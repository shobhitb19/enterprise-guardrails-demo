# Repository guardrails: human and agent changes

A public, synthetic GitHub governance demonstration under the personal account
`shobhitb19`. The small building-materials catalogue is deliberately generic:
no customer content, credentials, cloud deployments, or production integrations.

```powershell
npm ci
npm test
npm start
Invoke-RestMethod http://127.0.0.1:3000/products
```

Requires Node.js 22 or later. The server binds to loopback only. Prices are
synthetic integer USD cents. Routes: `GET /health`, `GET /products`, and
`GET /products/MAT-001`.

## Demo artifacts

- [10-minute presenter runbook](docs/runbook.md)
- [Setup and safe replay](docs/setup.md)
- [Verified evidence and feature gaps](docs/evidence.md)
- [Main ruleset configuration](docs/main-ruleset.json)
- [Bounded real-agent task](docs/agent-task.md)

**Scope:** repository rules, CI, CodeQL, secret scanning/push protection, and
human review. Organization and enterprise policy enforcement is **not**
demonstrated by this personal-account repository.

An independent human reviewer is a prerequisite: the repository owner cannot
approve their own PR. The prepared security and agent PRs must remain unmerged.
An alert, an Autofix suggestion, a passing scan job, and an enforced merge gate
are distinct things; use the evidence page rather than assuming any is present.
