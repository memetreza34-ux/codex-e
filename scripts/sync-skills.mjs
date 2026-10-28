import { mkdtemp, mkdir, cp, access, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT, config } from "./core.mjs";
import { run } from "./render.mjs";
const sources = [
  {
    ...config.skillsSource,
    skills: config.skillsSource.names.map((name) => ({
      name,
      path: `skills/${name}`,
    })),
  },
  ...(config.extraSkillsSources || []),
];
const used = new Set();
let installed = 0;
for (const source of sources) {
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository) ||
    !/^[a-f0-9]{40}$/.test(source.commit)
  )
    throw new Error(
      "Skill-Quelle braucht ein GitHub-Repository und einen festen Commit.",
    );
  const absent = [];
  for (const skill of source.skills) {
    if (
      !/^[a-z0-9][a-z0-9-]*$/.test(skill.name) ||
      !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(skill.path) ||
      skill.path.includes("..") ||
      used.has(skill.name)
    )
      throw new Error(`Ungültiger oder doppelter Skill: ${skill.name}`);
    used.add(skill.name);
    try {
      await access(join(ROOT, ".agents/skills", skill.name, "SKILL.md"));
      console.log(`Vorhanden, unverändert: ${skill.name}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      absent.push(skill);
    }
  }
  if (!absent.length) continue;
  const temp = await mkdtemp(join(tmpdir(), "codex-e-skills-"));
  try {
    await run("git", ["init", temp]);
    await run("git", [
      "-C",
      temp,
      "remote",
      "add",
      "origin",
      `https://github.com/${source.repository}.git`,
    ]);
    await run("git", [
      "-C",
      temp,
      "fetch",
      "--depth=1",
      "--filter=blob:none",
      "origin",
      source.commit,
    ]);
    await run("git", ["-C", temp, "sparse-checkout", "init", "--cone"]);
    await run("git", [
      "-C",
      temp,
      "sparse-checkout",
      "set",
      ...absent.map((s) => s.path),
    ]);
    await run("git", ["-C", temp, "checkout", "--detach", "FETCH_HEAD"]);
    const actual = (await run("git", ["-C", temp, "rev-parse", "HEAD"])).trim();
    if (actual !== source.commit)
      throw new Error("Skill-Quellversion stimmt nicht überein.");
    await mkdir(join(ROOT, ".agents/skills"), { recursive: true });
    for (const skill of absent) {
      await cp(
        join(temp, skill.path),
        join(ROOT, ".agents/skills", skill.name),
        { recursive: true, errorOnExist: true, force: false },
      );
      installed++;
      console.log(`Installiert: ${skill.name} (${actual.slice(0, 8)})`);
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
console.log(
  `${installed} neue Skills installiert. Bestehende Dateien wurden nicht verändert. Neue Skills werden im nächsten Codex-Turn mit diesem Arbeitsordner erkannt.`,
);
