import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const python = join(
  root,
  ".tools/reference-venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
if (!existsSync(python))
  throw new Error("npm run reference:setup zuerst ausführen.");
const mode = process.argv[2];
if (!["analyze", "fetch"].includes(mode))
  throw new Error("analyze oder fetch erforderlich.");
const r = spawnSync(
  python,
  [join(root, "scripts/reference", `${mode}.py`), ...process.argv.slice(3)],
  { cwd: root, stdio: "inherit" },
);
if (r.error) throw r.error;
process.exit(r.status === null ? 1 : r.status);
