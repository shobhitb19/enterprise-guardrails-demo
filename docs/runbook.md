# Ten-minute hybrid live/prepared demo

Repository: https://github.com/shobhitb19/enterprise-guardrails-demo

**Start with [the live evidence issue](https://github.com/shobhitb19/enterprise-guardrails-demo/issues/1).**
It records actual PR, scan, ruleset and agent URLs, plus any unsupported features.
Do not replace an unavailable result with fabricated output.

## Before the session

Use the `shobhitb19` account. Arrange a second human collaborator with permission
to approve PRs; authors cannot approve their own work. Do not lower the one-approval
gate if that person is unavailable. Preload the links from the evidence issue.
Keep the prepared demo PRs unmerged. Do not run or deploy the insecure branch.
Use only a verified inert custom-pattern fixture for push protection.

| Time | Show | Say / fallback |
|---|---|---|
| 0:00-1:00 | Main ruleset, no bypass actors, one approval, CI and CodeQL | These are repository rules on a personal account, not centrally enforced enterprise policies. |
| 1:00-2:00 | Replay a previously verified blocked push of an inert fixture | This is prevention before GitHub accepts the commit. If no fixture has been verified, show enabled settings and explicitly skip the blocked-push claim. Never bypass. |
| 2:00-3:30 | Prepared human security PR and actual CodeQL path-injection alert | Passing functional tests do not establish security. Open the alert and show its real trace. If Autofix is unavailable, state that precisely. |
| 3:30-5:00 | Actual Autofix suggestion, review its diff, then the human gates | AI suggestions require review. Do not apply a fix to the prepared vulnerable PR during the baseline demo; keep it reproducible. If no generated suggestion exists, discuss a proposed fix as human-authored, not Autofix. |
| 5:00-6:00 | Create/assign the bounded category-filter task | The real coding agent runs asynchronously. It needs account entitlement and repository access; Autofix is a separate feature and does not require a Copilot subscription. |
| 6:00-8:30 | Previously completed, real agent-authored PR, tests and activity | Verify author identity and actual job logs. If agent work did not complete, show its genuine state and use the bounded issue as the fallback, not an impersonated agent PR. |
| 8:30-10:00 | Human PR and agent PR gates side by side | Neither authorship path bypasses required checks or independent human review. Organization/enterprise policy enforcement, identity controls and broad policy management are out of scope. |

## Reset

Do not merge demonstration PRs. Refresh their actual check runs before presenting.
A new rehearsal can rerun CI using workflow dispatch; PR scans should be rerun
on the actual PR head if needed. Do not claim a main-branch run scanned a PR.
For a fresh agent run, create a new issue using `docs/agent-task.md`; check the
current subscription/usage before assigning. Leave the previously prepared PR
open so its result is immediately available.

For push replay, follow the guarded steps in [setup](setup.md). A blocked commit
must remain local and unpushed. Never click a bypass URL, disable protection,
or force-push/delete main to reset. Do not grant the demo actor a bypass.
