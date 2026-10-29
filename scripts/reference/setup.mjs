import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const candidates = [
  process.env.REFERENCE_PYTHON,
  "python3.12",
  "python3.13",
  "python3.14",
  "python3",
].filter(Boolean);
const python = candidates.find(
  (command) =>
    spawnSync(
      command,
      ["-c", "import sys;sys.exit(0 if sys.version_info >= (3,12) else 1)"],
      { stdio: "ignore" },
    ).status === 0,
);
if (!python)
  throw new Error(
    "Python >=3.12 fehlt. REFERENCE_PYTHON auf einen passenden Interpreter setzen.",
  );
await mkdir(join(root, ".tools"), { recursive: true });
for (const [command, args] of [
  [python, ["-m", "venv", join(root, ".tools/reference-venv")]],
  [
    join(
      root,
      ".tools/reference-venv",
      process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
    ),
    [
      "-m",
      "pip",
      "install",
      "--disable-pip-version-check",
      "-r",
      join(root, "toolkit/reference-lock.txt"),
    ],
  ],
]) {
  const r = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log(
  "Referenzanalyse lokal eingerichtet; keine Anmeldung und kein Modelldownload.",
);
