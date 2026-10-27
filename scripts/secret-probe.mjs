import { execFileSync, spawnSync } from "node:child_process";
import { randomInt } from "node:crypto";

const repository = "shobhitb19/enterprise-guardrails-demo";
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Read-only default: no fixture created and no push attempted.");
  console.log(`Explicit rehearsal: node scripts/secret-probe.mjs --verify-block --confirm-repository=${repository}`);
  process.exit(0);
}
if (args.length !== 2 || !args.includes("--verify-block") || !args.includes(`--confirm-repository=${repository}`)) {
  throw new Error("Refusing unknown arguments or unconfirmed repository");
}

const token = execFileSync("gh", ["auth", "token", "--hostname", "github.com", "--user", "shobhitb19"], {
  encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
}).trim();
if (!token) throw new Error("Required account token unavailable");
const env = { ...process.env, GH_TOKEN: token };
function api(path) {
  return JSON.parse(execFileSync("gh", ["api", path], {
    env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
  }));
}
function git(command, input) {
  return execFileSync("git", command, {
    env, input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"]
  }).trim();
}
if (api("user").login !== "shobhitb19") throw new Error("Wrong GitHub identity");
if (api(`repos/${repository}`).visibility !== "public") throw new Error("Unexpected repository visibility");
if (git(["remote", "get-url", "origin"]) !== `https://github.com/${repository}.git`) {
  throw new Error("Refusing unexpected origin");
}
const main = api(`repos/${repository}/commits/main`).sha;
const listed = api(`repos/${repository}/rulesets`);
const ruleset = listed.find((item) => item.name === "Main - human review and verified checks");
if (!ruleset) throw new Error("Required main ruleset is missing");
const rules = api(`repos/${repository}/rulesets/${ruleset.id}`);
if (rules.enforcement !== "active" || rules.bypass_actors.length !== 0 ||
    rules.current_user_can_bypass !== "never" ||
    !rules.conditions.ref_name.include.includes("refs/heads/main") ||
    rules.conditions.ref_name.exclude.length !== 0 ||
    !rules.rules.some((rule) => rule.type === "pull_request" && rule.parameters.required_approving_review_count >= 1) ||
    !rules.rules.some((rule) => rule.type === "required_status_checks") ||
    !rules.rules.some((rule) => rule.type === "code_scanning")) {
  throw new Error("Refusing probe without verified no-bypass main protection");
}
const security = api(`repos/${repository}`).security_and_analysis;
if (security.secret_scanning_push_protection?.status !== "enabled") {
  throw new Error("Push protection is not enabled");
}

function crc32(text) {
  let crc = 0xffffffff;
  for (const byte of Buffer.from(text)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function encode(value, alphabet) {
  let result = "";
  do {
    result = alphabet[value % 62] + result;
    value = Math.floor(value / 62);
  } while (value > 0);
  return result.padStart(6, alphabet[0]);
}
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const body = "DEMOinert" + Array.from({ length: 21 }, () => alphabet[randomInt(62)]).join("");
// GitHub documents CRC32/base62 checksums. These strings are generated here, never issued.
const fixture = `ghp_${body}${encode(crc32(body), alphabet)}`;
const response = await fetch("https://api.github.com/user", {
  headers: { authorization: `Bearer ${fixture}`, "user-agent": "synthetic-guardrails-probe" },
  signal: AbortSignal.timeout(15000)
});
if (response.status !== 401) throw new Error("Fixture safety preflight did not return HTTP 401; no push attempted");
const fixtureFile = [
  "SYNTHETIC, NON-ISSUED FIXTURE. RETURNED HTTP 401 BEFORE THIS PROBE.",
  `INERT_FIXTURE=${fixture}`
].join("\n") + "\n";
const blob = git(["hash-object", "-w", "--stdin"], fixtureFile);
const entries = git(["ls-tree", `${main}^{tree}`]);
const tree = git(["mktree"], `${entries}\n100644 blob ${blob}\tdemo-inert-fixture.txt\n`);
const commit = git(["commit-tree", tree, "-p", main],
  "Local-only synthetic secret-scanning probe - never bypass\n\nCo-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>\n");
git(["update-ref", "refs/heads/demo/local-secret-probe", commit]);
const push = spawnSync("git", [
  "-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential",
  "push", "origin", `${commit}:refs/heads/main`
], { env, encoding: "utf8", timeout: 120000 });
let output = `${push.stdout ?? ""}\n${push.stderr ?? ""}`;
output = output.replaceAll(fixture, "[INERT FIXTURE REDACTED]");
output = output.replace(/https:\/\/github\.com\/\S*unblock-secret\S*/g, "[BYPASS URL OMITTED - DO NOT USE]");
output = output.replace(/[ \t]+$/gm, "");
console.log(output.trim());
const unchanged = api(`repos/${repository}/commits/main`).sha === main;
if (push.error) throw new Error(`Push execution failed: ${push.error.message}`);
if (push.status === 0 || !unchanged) throw new Error("Unexpected main update; stop and inspect");
const secretBlocked = /PUSH PROTECTION|SECRET SCANNING/i.test(output) &&
  /GitHub Personal Access Token/i.test(output);
console.log(JSON.stringify({
  main_unchanged: unchanged,
  local_ref: "refs/heads/demo/local-secret-probe",
  local_commit: commit,
  fixture_authentication: "Generated, non-issued fixture returned HTTP 401",
  secret_scanning_block_verified: secretBlocked
}, null, 2));
if (!secretBlocked) {
  throw new Error("Only a non-secret rejection was observed. Do NOT present this as a verified secret block.");
}
