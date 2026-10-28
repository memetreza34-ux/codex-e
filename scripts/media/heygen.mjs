import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./library.mjs";
const binary = join(ROOT, ".tools/bin/heygen");
try {
  await access(binary);
} catch {
  console.error("Zuerst npm run media:setup ausführen.");
  process.exit(1);
}
const child = spawn(
  binary,
  process.argv.slice(2).length ? process.argv.slice(2) : ["--help"],
  { stdio: "inherit" },
);
child.on("error", (e) => {
  console.error(e.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
