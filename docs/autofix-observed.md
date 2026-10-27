# Actual Copilot Autofix suggestion, not an applied fix

Observed in the signed-in GitHub PR UI on 2026-10-27:

- [Human-initiated security PR](https://github.com/shobhitb19/enterprise-guardrails-demo/pull/4)
- [Actual alert comment and suggestion](https://github.com/shobhitb19/enterprise-guardrails-demo/pull/4#discussion_r4384155688)
- [CodeQL alert 1](https://github.com/shobhitb19/enterprise-guardrails-demo/security/code-scanning/1):
  `js/path-injection`, **high**, `src/app.ts:45`, `refs/pull/4/merge`.
- [Unedited screenshot of the expanded suggestion](evidence/autofix-suggestion.png)

GitHub displayed **Suggested changeset 1**, **Commit suggestion**, and
**Copilot uses AI. Check for mistakes.** The suggested change replaces the
`join` import with `resolve, sep` and adds the following containment check:

```typescript
const documentsRoot = resolve(process.cwd(), "demo-documents");
const candidatePath = resolve(documentsRoot, filename);
if (candidatePath !== documentsRoot && !candidatePath.startsWith(documentsRoot + sep)) {
  json(response, 403, { error: "Forbidden document path" });
  return;
}
readFile(candidatePath, "utf8", (error, content) => {
```

This is a transcription of the actual UI suggestion, **not** a human-authored
patch passed off as Autofix. It has not been committed, validated as a complete
security fix, or merged. Keep the original PR open and unchanged for replay.
Reviewers should still consider traversal tests, absolute paths and symlink
behavior; an AI suggestion is not proof of complete remediation.

The historical-alert REST endpoints for `/alerts/1/autofix` returned
`404 No suggested fix found`. The official API documents those endpoints for
default-branch alerts. This alert exists only on a PR; its suggestion was
verified in the PR UI instead. Do not infer missing Copilot entitlement or
broaden token scopes from that REST response or the CLI's generic scope hint.

Repository settings showed **Copilot Autofix: On** and **Agentic autofix: Off**.
This demonstration uses the PR suggestion feature, not agentic backlog remediation.
Copilot Autofix does not require a GitHub Copilot subscription; the separate
category-filter coding-agent run depends on its own account access.
