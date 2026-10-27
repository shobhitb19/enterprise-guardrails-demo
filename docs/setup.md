# Setup and safe replay

## Account and bootstrap

All GitHub commands must run as `shobhitb19`, not the shell's default account.
Use a process-local token from the existing keyring; never print it, put it in a
remote URL/file, or switch global authentication.

```powershell
$env:GH_TOKEN = (gh auth token --hostname github.com --user shobhitb19)
if ($LASTEXITCODE -ne 0) { throw "Required account token unavailable" }
if ((gh api user --jq .login) -ne "shobhitb19") { throw "Wrong account" }
```

Install with `npm ci`; validate with `npm test`. Bootstrap clean code to main
**before** enabling the no-bypass ruleset. Never push the insecure demo to main.
Use the GitHub CLI credential helper only for the current git process:

```powershell
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin HEAD:main
```

This bootstrap command is **not** a replay command once protection is active.
Do not disable controls to use it again.

## Rules and scanning

`npm run guardrails:inspect` is read-only and independently verifies account,
public visibility, default branch and administration permission.

After both stable checks `CI` and `CodeQL` have succeeded on main HEAD:

```powershell
node scripts/guardrails.mjs --apply --confirm-repository=shobhitb19/enterprise-guardrails-demo
```

The script only targets this repository. It creates/updates the named ruleset,
with no bypass actors, requiring one independent approval, stale-review
dismissal, last-push approval, resolved conversations, up-to-date `CI`/`CodeQL`
checks from GitHub Actions, and no main deletion or force push. It enables
secret scanning/push protection and reads back the result. It never silently
falls back when the API rejects a setting.

The configuration also requests a CodeQL merge rule for error-level results
and high-or-critical security alerts. Check the real ruleset: this is distinct
from requiring a successful CodeQL **analysis job**. If the scanning merge rule
is unavailable, document that exact failure; do not call advisory alerts a gate.

One human approval is retained even if the repository owner is the only
collaborator. Invite/arrange an independent reviewer separately; do not
self-approve, impersonate another person, or add an actor bypass.

## Safe blocked-push fixture

The signed-in `shobhitb19` settings did not expose custom-pattern controls.
No custom pattern was created. Instead, the checked-in replay script uses a
**locally generated, non-issued** GitHub-format fixture. Its CRC32/base62 checksum
follows [GitHub's published token format](https://github.blog/engineering/platform-security/behind-githubs-new-authentication-token-formats/).
The generated value returned HTTP 401 before the test, and GitHub actually
rejected the push for secret scanning. The exact final script was exercised.
This does not assume that arbitrary fake PATs or public example strings work.

```powershell
node scripts/secret-probe.mjs
node scripts/secret-probe.mjs --verify-block --confirm-repository=shobhitb19/enterprise-guardrails-demo
```

The first invocation only prints usage. The explicit rehearsal:

- Verifies the exact account, origin, public repository, enabled push protection,
  active no-bypass main ruleset, required approval/checks and scanning rule.
- Generates an inert fixture in memory; requires HTTP 401 from GitHub before
  constructing a local-only commit. It never uses or mints a real credential.
- Stores the fixture only in local Git objects on `demo/local-secret-probe`;
  it does not add a fixture to the working tree or any published artifact.
- Attempts to update **already-protected main** as an additional containment
  measure, and verifies main remains unchanged.
- Reports success only for an explicit secret-scanning block naming the detected
  type. A rules-only failure is not accepted. The output redacts both the
  generated string and the bypass URL.

The verified local replay commit is recorded in the transcript. It deliberately
has no GitHub commit URL. Never push this local branch, use `--all`, push tags,
follow a bypass URL, weaken the main rules, or publish the fixture.

For comparison, a separate `demo/local-rules-probe` contains a no-content commit
that was rejected by the **branch rules**. That is distinct evidence, not the
secret-scanning demo. Both local refs must remain local.

## Security PR and Autofix

Prepare the insecure example on an isolated branch from the baseline. Its
read-file route is deliberately unsafe; do not deploy, merge, or run it against
real files. Open a human-authored demo PR and wait for actual CodeQL results.
Only call the path-injection alert verified when GitHub reports the rule ID,
source location and actual PR ref. Only call Autofix generated when its real
status and suggestion exist. A human-written explanation is not Autofix evidence.

## Coding agent

Create an issue from [the bounded task](agent-task.md). Check `suggestedActors`
for `copilot-swe-agent`, then use GitHub's documented API or the assignee UI.
An assignable bot alone does not prove a task can complete. Confirm assignment,
actual agent session/PR, author identity and successful checks. A local Copilot
editing session must not be presented as a GitHub coding-agent run.

The prepared run is issue 2 / PR 3; its real agent session finished. Issue 5 is
unassigned for the live moment. Assign it via its Assignees menu, selecting
Copilot, then return to the previously completed PR while the new run works.
Do not assign it before the live demo unless intentionally rehearsing again.

Agent PR Actions runs may initially require human action. Inspect the complete
diff first, then rerun the actual CI/CodeQL runs as `shobhitb19`. The tested
same-repository agent PR did not support the fork-only REST approval endpoint.
Rerunning a workflow is not an approving PR review or a merge authorization.

## Publishing artifacts without weakening protected main

The clean application, CI, CodeQL, initial runbook and setup configuration were
bootstrapped to main before enforcement. The finalized runbook, screenshots,
redacted transcripts and replay script are published on `demo/presenter-artifacts`,
linked from evidence issue 1. No extra implementation/release PR is needed.
Do not turn off main's rules to update documentation: use a genuinely reviewed
PR later if those final artifacts should be promoted to main.

## Official references

- [Rules API](https://docs.github.com/en/rest/repos/rules)
- [Code scanning merge protection](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/set-merge-protection)
- [Copilot Autofix](https://docs.github.com/en/code-security/concepts/code-scanning/copilot-autofix-for-code-scanning)
- [Define custom patterns](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/customize-leak-detection/define-custom-patterns)
- [Real coding-agent API](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-via-the-api)

GitHub features and labels evolve. Record actual observed responses in the
evidence issue rather than inferring availability from documentation alone.
