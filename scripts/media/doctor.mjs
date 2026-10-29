import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, delimiter } from "node:path";
import { ROOT, loadManifest } from "./library.mjs";

const locate = (name) =>
  (process.env.PATH || "")
    .split(delimiter)
    .map((path) => join(path, name))
    .find(existsSync);
const localHeygen = join(ROOT, ".tools/bin/heygen");
const toolPath = (name) =>
  name === "heygen" && existsSync(localHeygen) ? localHeygen : locate(name);
const requirements = JSON.parse(
  await readFile(join(ROOT, "toolkit/providers.json"), "utf8"),
);
const rows = [];
for (const [name, args] of [
  ["ffmpeg", ["-version"]],
  ["ffprobe", ["-version"]],
  ["blender", ["--version"]],
  ["higgsfield", ["--version"]],
  ["heygen", ["--version"]],
]) {
  const path = toolPath(name);
  const result = path
    ? spawnSync(path, args, { encoding: "utf8", timeout: 15000 })
    : null;
  rows.push({
    tool: name,
    installed: Boolean(path),
    version:
      result?.status === 0
        ? (result.stdout || result.stderr).split("\n")[0]
        : path
          ? "Version nicht lesbar"
          : "nicht gefunden",
    versionChecked: result?.status === 0,
  });
}

const accounts = [];
if (process.argv.includes("--accounts")) {
  for (const provider of requirements.providers.filter(
    (item) => item.accountStatusCommand,
  )) {
    const path = toolPath(provider.id);
    if (!path) {
      accounts.push({ provider: provider.id, state: "cli-missing" });
      continue;
    }
    const result = spawnSync(path, provider.accountStatusCommand, {
      encoding: "utf8",
      timeout: 25000,
    });
    const output = (result.stdout || "") + " " + (result.stderr || "");
    accounts.push({
      provider: provider.id,
      state:
        result.status === 0
          ? "account-status-succeeded"
          : /not authenticated|not logged|session expired|auth login|no token|no session|not signed|no credentials/i.test(
                output,
              )
            ? "login-required"
            : "status-unavailable",
      generationTested: false,
    });
  }
}
const result = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  requirements: "toolkit/providers.json",
  localTools: rows,
  accountsChecked: process.argv.includes("--accounts"),
  accounts,
  assets: (await loadManifest()).assets.map((asset) => ({
    id: asset.id,
    kind: asset.kind,
  })),
  hostIntegrations: {
    state: "not-checked",
    note: "Diese CLI erkennt weder Codex-Hostwerkzeuge noch Plugin-Verbindungen. Ihre Verfügbarkeit im aktiven Auftrag separat prüfen.",
  },
};
const output = join(ROOT, "work/provider-status.json");
await mkdir(join(ROOT, "work"), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.table(rows);
if (accounts.length) console.table(accounts);
console.log("Lokaler Prüfbericht: work/provider-status.json (Git-ignore).");
console.log(
  "Keine Generierung ausgeführt; Host- und Plugin-Verbindungen nicht geprüft.",
);
