import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const repository = "shobhitb19/enterprise-guardrails-demo";
const args = process.argv.slice(2);
const allowed = new Set(["--apply", `--confirm-repository=${repository}`]);
if (args.some((arg) => !allowed.has(arg))) {
  throw new Error("Unknown argument. Default is read-only; see docs/setup.md.");
}
const token = execFileSync("gh", ["auth", "token", "--hostname", "github.com", "--user", "shobhitb19"], {
  encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
}).trim();
if (!token) throw new Error("No keyring token for shobhitb19");
const env = { ...process.env, GH_TOKEN: token };

function api(path, method = "GET", body) {
  const command = ["api", path, "--method", method];
  if (body !== undefined) command.push("--input", "-");
  const output = execFileSync("gh", command, {
    env, encoding: "utf8", input: body === undefined ? undefined : JSON.stringify(body),
    stdio: ["pipe", "pipe", "pipe"]
  });
  return output.trim() ? JSON.parse(output) : null;
}

if (api("user").login !== "shobhitb19") throw new Error("Refusing wrong GitHub identity");
const repo = api(`repos/${repository}`);
if (repo.visibility !== "public" || !repo.permissions?.admin || repo.default_branch !== "main") {
  throw new Error("Expected public demo repository, main default branch, and administrator permission");
}
const existing = api(`repos/${repository}/rulesets`);
console.log(JSON.stringify({
  repository: repo.html_url,
  security_and_analysis: repo.security_and_analysis,
  rulesets: existing,
  mode: args.includes("--apply") ? "apply" : "read-only"
}, null, 2));

if (args.includes("--apply")) {
  if (!args.includes(`--confirm-repository=${repository}`)) {
    throw new Error("Mutations require the exact --confirm-repository argument");
  }
  const head = api(`repos/${repository}/commits/main`);
  const checks = api(`repos/${repository}/commits/${head.sha}/check-runs?per_page=100`).check_runs;
  for (const name of ["CI", "CodeQL"]) {
    if (!checks.some((check) => check.name === name && check.conclusion === "success" && check.app?.id === 15368)) {
      throw new Error(`Refusing enforcement: ${name} has not succeeded from GitHub Actions on main HEAD`);
    }
  }
  const ruleset = JSON.parse(readFileSync(new URL("../docs/main-ruleset.json", import.meta.url), "utf8"));
  const matching = existing.filter((item) => item.name === ruleset.name);
  if (matching.length > 1) throw new Error("Ambiguous ruleset names; inspect manually");
  const path = `repos/${repository}/rulesets${matching.length ? `/${matching[0].id}` : ""}`;
  const result = api(path, matching.length ? "PUT" : "POST", ruleset);
  console.log(JSON.stringify({ ruleset: result._links?.html?.href, id: result.id, enforcement: result.enforcement }));
  api(`repos/${repository}`, "PATCH", {
    security_and_analysis: {
      secret_scanning: { status: "enabled" },
      secret_scanning_push_protection: { status: "enabled" }
    }
  });
  console.log(JSON.stringify(api(`repos/${repository}/rulesets/${result.id}`), null, 2));
  console.log(JSON.stringify(api(`repos/${repository}`).security_and_analysis, null, 2));
}
