# Prepared coding-agent task

Title: Add category filtering to the synthetic catalogue with tests

Implement `GET /products?category=timber` in the existing TypeScript API.

Acceptance criteria:

- No category parameter preserves the existing complete catalogue response.
- Exact lowercase `timber`, `insulation`, and `masonry` return only matching products,
  in the original order and the existing `{ "products": [...] }` shape.
- Unknown, empty, mixed-case, and repeated category parameters return HTTP 400
  with `{ "error": "Invalid category" }`. A single category is supported, not a list.
- Product-by-ID and health behavior remain unchanged.
- Add integration tests for all three categories, missing category, and each
  invalid-input case. Run `npm test`.
- No new dependencies, workflows, credentials, deployments, repository settings,
  or changes to the separate security demo. Do not implement unrelated features.
- Open a PR and leave it unmerged for independent human review.

This task is intended for the real GitHub Copilot coding agent. A locally authored
PR must not be presented as a completed GitHub agent run.
