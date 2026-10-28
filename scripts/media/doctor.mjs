import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, delimiter } from "node:path";
import { ROOT, loadManifest } from "./library.mjs";
const locate = (name) =>
  (process.env.PATH || "")
    .split(delimiter)
    .map((p) => join(p, name))
    .find(existsSync);
const localHeygen = join(ROOT, ".tools/bin/heygen");
const rows = [];
for (const [name, args] of [
  ["ffmpeg", ["-version"]],
  ["ffprobe", ["-version"]],
  ["blender", ["--version"]],
  ["higgsfield", ["--version"]],
  ["heygen", ["--version"]],
]) {
  const path =
    name === "heygen" && existsSync(localHeygen) ? localHeygen : locate(name);
  const r = path
    ? spawnSync(path, args, { encoding: "utf8", timeout: 15000 })
    : null;
  rows.push({
    tool: name,
    installed: r?.status === 0,
    version:
      r?.status === 0
        ? (r.stdout || r.stderr).split("\n")[0]
        : "nicht installiert",
    versionChecked: r?.status === 0,
  });
}
const accounts = [];
if (process.argv.includes("--accounts"))
  for (const name of ["heygen", "higgsfield"]) {
    const path =
      name === "heygen" && existsSync(localHeygen) ? localHeygen : locate(name);
    if (!path) {
      accounts.push({ provider: name, state: "cli-missing" });
      continue;
    }
    const args =
      name === "heygen" ? ["auth", "status"] : ["account", "status", "--json"];
    const r = spawnSync(path, args, { encoding: "utf8", timeout: 25000 }),
      text = (r.stdout || "") + " " + (r.stderr || "");
    accounts.push({
      provider: name,
      state:
        r.status === 0
          ? "account-status-succeeded"
          : /not authenticated|not logged|session expired|auth login|no token|no session|not signed|no credentials/i.test(
                text,
              )
            ? "login-required"
            : "status-failed",
      generationTested: false,
    });
  }
const result = {
  checkedAt: new Date().toISOString(),
  localTools: rows,
  accounts,
  assets: (await loadManifest()).assets.map((a) => ({
    id: a.id,
    kind: a.kind,
  })),
  nativeImageGeneration:
    "Codex-Hostwerkzeug verfügbar; keine neue Generierung geprüft",
  heygenPlugin: "Verfügbar, Verbindung vom Nutzer noch nicht bestätigt",
};
console.table(rows);
if (accounts.length) console.table(accounts);
await writeFile(
  join(ROOT, "toolkit/provider-status.json"),
  JSON.stringify(result, null, 2) + "\n",
);
