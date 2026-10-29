import { spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const candidates = [
  process.env.REFERENCE_WHISPER_PYTHON,
  join(root, ".tools/whisper-venv/bin/python"),
  "python3",
  "/Applications/Xcode.app/Contents/Developer/usr/bin/python3",
].filter(Boolean);
const python = candidates.find(
  (command) =>
    spawnSync(
      command,
      [
        "-c",
        "import whisper; import sys; sys.exit(0 if sys.version_info >= (3,9) else 1)",
      ],
      { stdio: "ignore", timeout: 20000 },
    ).status === 0,
);
if (!python)
  throw new Error(
    "Vorhandenes lokales Whisper fehlt. Optional separat installieren und REFERENCE_WHISPER_PYTHON setzen; kein API-Fallback.",
  );
const r = spawnSync(
  python,
  [join(root, "scripts/reference/transcribe.py"), ...process.argv.slice(2)],
  { cwd: root, stdio: "inherit" },
);
if (r.error) throw r.error;
process.exit(r.status === null ? 1 : r.status);
