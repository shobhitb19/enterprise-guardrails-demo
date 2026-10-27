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

Preferred: repository Settings > Advanced Security > Secret Protection >
Custom patterns. If available, create a dedicated pattern named
`Synthetic guardrails demo - inert`, matching
`DEMO_GUARDRAILS_INERT_[A-Z0-9]{24}`. Generate a matching inert string **locally**
and put it only in the pattern's sample field and the local replay commit.
Save and dry-run, publish, and enable push protection for that specific pattern.
Do not paste any credential, customer data, or GitHub token.

Do not assume an arbitrary fake PAT triggers push protection. Some supported
provider formats require validity or checksum checks; public examples may be
excluded. If custom patterns are unavailable, use only a supported fixture
whose safety and detection were separately verified. Otherwise skip replay and
record the limitation.

Create a separate local branch from the clean baseline, add only a named
synthetic fixture file, and commit it locally. Attempt to push that branch
using the verified account helper above. Accept the rehearsal as verified only
when GitHub rejects it **for secret scanning**, not for branch protection or
authentication. Confirm the remote branch does not exist. Keep the local
commit as the replay artifact; do not bypass, push with `--all`, or push tags.
Never put the matching fixture in this documentation.

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

## Official references

- [Rules API](https://docs.github.com/en/rest/repos/rules)
- [Code scanning merge protection](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/set-merge-protection)
- [Copilot Autofix](https://docs.github.com/en/code-security/concepts/code-scanning/copilot-autofix-for-code-scanning)
- [Define custom patterns](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/customize-leak-detection/define-custom-patterns)
- [Real coding-agent API](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-via-the-api)

GitHub features and labels evolve. Record actual observed responses in the
evidence issue rather than inferring availability from documentation alone.
