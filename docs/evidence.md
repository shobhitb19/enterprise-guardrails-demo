# Demo evidence

The authoritative, updateable evidence artifact is:
https://github.com/shobhitb19/enterprise-guardrails-demo/issues/1

It is intentionally separate from protected main: results can be recorded
without weakening main's human-review gate or opening a release PR.

## Verified on 2026-10-27

| Surface | Actual result | Evidence |
|---|---|---|
| Account and baseline | Public repository, exact `shobhitb19` identity with admin access; synthetic API built and five integration tests passed | Main commit `d254c79ffff47d852eaf8a080efc6adadc93beed` |
| Main CI | Successful | [CI run](https://github.com/shobhitb19/enterprise-guardrails-demo/actions/runs/40430221413) |
| Main CodeQL | Successful real analysis, no fabricated SARIF | [CodeQL run](https://github.com/shobhitb19/enterprise-guardrails-demo/actions/runs/40430221294) |
| Main ruleset | Active, no bypass actors; current account cannot bypass; one independent approval, stale-review dismissal, last-push approval, resolved conversations, CI/CodeQL from GitHub Actions, no deletion/force-push | [Ruleset 25924715](https://github.com/shobhitb19/enterprise-guardrails-demo/rules/25924715), [screenshot](evidence/main-rules.png) |
| Rules enforcement | Direct no-content main update rejected with GH013; main unchanged | [Sanitized transcript](evidence/rules-block.txt) |
| Push protection | Enabled; generated, non-issued checksum-valid fixture first returned HTTP 401; actual push rejected explicitly by GITHUB PUSH PROTECTION for GitHub Personal Access Token | [Redacted transcript](evidence/secret-block.txt), [replay script](../scripts/secret-probe.mjs) |
| Secret fixture containment | Fixture exists only in local Git objects on `demo/local-secret-probe`; that ref was not pushed; main unchanged; repository secret-alert count remains zero | [Generated API snapshot](evidence/verification.json) |
| Human security PR | Open, unmerged; functional CI passes | [PR 4](https://github.com/shobhitb19/enterprise-guardrails-demo/pull/4), [CI](https://github.com/shobhitb19/enterprise-guardrails-demo/actions/runs/40430948831) |
| Actual security alert | CodeQL `js/path-injection`, high, `src/app.ts:45`, PR 4 merge ref | [Alert 1](https://github.com/shobhitb19/enterprise-guardrails-demo/security/code-scanning/1) |
| Code scanning gate | Analysis job succeeds, separate security-result check fails, UI explicitly states the alert blocks merge | [Security check](https://github.com/shobhitb19/enterprise-guardrails-demo/runs/121948458990), [screenshot](evidence/security-merge-block.png) |
| Actual Autofix | Suggested changeset visible in the PR UI; not committed or merged | [Observed suggestion and limitations](autofix-observed.md), [screenshot](evidence/autofix-suggestion.png) |
| Real coding agent | Issue assigned successfully; genuine Copilot session finished and created the filtering change | [Issue 2](https://github.com/shobhitb19/enterprise-guardrails-demo/issues/2), [session](https://github.com/shobhitb19/enterprise-guardrails-demo/sessions/645e34d7-73d1-4f1c-8054-8b9daa759247), [successful agent workflow](https://github.com/shobhitb19/enterprise-guardrails-demo/actions/runs/40430388403), [completion screenshot](evidence/agent-finished.png) |
| Real agent PR | Bot-authored, finished work, open draft, unmerged; CI/CodeQL pass; seven integration tests also passed locally at actual agent head `c4dfe5505ffcfb1dc6dd3fb10c91b3fa53707855` | [PR 3](https://github.com/shobhitb19/enterprise-guardrails-demo/pull/3), [CI](https://github.com/shobhitb19/enterprise-guardrails-demo/actions/runs/40430732264), [CodeQL](https://github.com/shobhitb19/enterprise-guardrails-demo/actions/runs/40430732375), [review gate screenshot](evidence/agent-review-gate.png) |
| Fresh live task | Unassigned, ready for assignment during the demo | [Issue 5](https://github.com/shobhitb19/enterprise-guardrails-demo/issues/5) |

## Important prerequisites and boundaries

The only human collaborator currently returned by the repository API is its
owner. **Arrange a second human collaborator with write access before presenting
an actual approval.** The owner cannot approve their own security PR; the agent
PR also explicitly requires human review. Neither prepared PR has been approved
or merged, and no gate was relaxed.

Agent PR workflows initially required action. After inspecting its entire
two-file diff, the presenter reran CI and CodeQL as the human account; both
succeeded. The fork-workflow approval REST endpoint returned 403 because this
is a same-repository agent PR, not a fork. The successful reruns are actual
GitHub job results, not claimed approval of the PR.

The signed-in personal-account settings page did not expose custom-pattern
controls. The blocked-push demonstration therefore uses a **locally generated,
non-issued** GitHub-format fixture. Its CRC32/base62 checksum follows
[GitHub's published format](https://github.blog/engineering/platform-security/behind-githubs-new-authentication-token-formats/).
Safety was checked with HTTP 401 before pushing, and actual detection was
measured twice, including with the final single-fixture script. This is not
an assumption that any arbitrary fake PAT triggers push protection.

The secret probe targets already-protected main as an additional containment
measure, checks main is unchanged, and distinguishes secret rejection from
rules-only rejection. It redacts the fixture and bypass URL. The matching
fixture is deliberately absent from every published file and screenshot.

The human PR is human-initiated/local Copilot-assisted work, not a claim that no
AI helped write it. The comparison PR is genuinely authored by GitHub's cloud
coding agent, as its author, session and timeline show.

The API snapshot is timestamped historical evidence, not a promise that later
settings or runs cannot change. Screenshots are actual unedited captures.
There is no claim of an applied/validated Autofix, granted second-human approval,
merged agent feature, or organization/enterprise enforcement.

No fake SARIF, simulated agent commits, real secrets, customer materials,
production resources, or organization/enterprise policy changes are used.
