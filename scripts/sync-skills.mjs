import { mkdtemp, mkdir, cp, access, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT, config } from "./core.mjs";
import { run } from "./render.mjs";
const temp = await mkdtemp(join(tmpdir(), "codex-e-skills-"));
let installed = 0;
try {
  await run("git", ["init", temp]);
  await run("git", [
    "-C",
    temp,
    "remote",
    "add",
    "origin",
    `https://github.com/${config.skillsSource.repository}.git`,
  ]);
  await run("git", [
    "-C",
    temp,
    "fetch",
    "--depth=1",
    "origin",
    config.skillsSource.commit,
  ]);
  await run("git", ["-C", temp, "checkout", "--detach", "FETCH_HEAD"]);
  const actual = (await run("git", ["-C", temp, "rev-parse", "HEAD"])).trim();
  if (actual !== config.skillsSource.commit)
    throw new Error("Skill-Quellversion stimmt nicht überein.");
  await mkdir(join(ROOT, ".agents/skills"), { recursive: true });
  for (const name of config.skillsSource.names) {
    const dest = join(ROOT, ".agents/skills", name);
    try {
      await access(dest);
      console.log(`Bereits vorhanden, unverändert: ${name}`);
      continue;
    } catch {
      /* Install only absent folders. */
    }
    await cp(join(temp, "skills", name), dest, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
    installed++;
  }
  await writeFile(
    join(ROOT, ".agents/skills/remotion-installed.json"),
    JSON.stringify(
      { repository: config.skillsSource.repository, commit: actual },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${installed} Skills installiert. In einem neuen Codex-Turn im Repository verfügbar.`,
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
