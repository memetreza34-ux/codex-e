import {
  readFile,
  writeFile,
  mkdir,
  mkdtemp,
  rm,
  access,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { ROOT } from "./library.mjs";
const lock = JSON.parse(
  await readFile(join(ROOT, "toolkit/media-tools.lock.json"), "utf8"),
).heygen;
const target = join(ROOT, ".tools/bin/heygen");
try {
  await access(target);
  console.log(
    "Vorhandene HeyGen-Datei unverändert. " +
      execFileSync(target, ["--version"], { encoding: "utf8" }).trim(),
  );
} catch (e) {
  if (e.code !== "ENOENT") throw e;
  const entry = lock.assets[`${process.platform}-${process.arch}`];
  if (!entry)
    throw new Error(
      "Für diese Plattform bitte den offiziellen HeyGen-Installer verwenden.",
    );
  const temp = await mkdtemp(join(tmpdir(), "codex-e-heygen-"));
  try {
    const url = `${lock.repository}/releases/download/v${lock.version}/${entry.name}`,
      r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`HeyGen-Download: HTTP ${r.status}`);
    const data = Buffer.from(await r.arrayBuffer());
    if (createHash("sha256").update(data).digest("hex") !== entry.sha256)
      throw new Error("HeyGen-Prüfsumme stimmt nicht.");
    const archive = join(temp, "release.tar.gz");
    await writeFile(archive, data);
    const files = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" })
      .trim()
      .split("\n");
    const binary = files.find((f) => f === "heygen" || f === "./heygen");
    if (!binary) throw new Error("HeyGen-Binärdatei fehlt im Archiv.");
    execFileSync("tar", ["-xzf", archive, "-C", temp, binary]);
    await mkdir(join(ROOT, ".tools/bin"), { recursive: true });
    await writeFile(target, await readFile(join(temp, binary)), {
      flag: "wx",
      mode: 0o755,
    });
    console.log(
      "Lokal installiert: " +
        execFileSync(target, ["--version"], { encoding: "utf8" }).trim(),
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
console.log(
  "Keine Anmeldung und keine kostenpflichtige Generierung ausgeführt.",
);
