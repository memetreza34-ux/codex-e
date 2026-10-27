import { readFile, readdir, access } from "node:fs/promises";
import { join } from "node:path";
import { parse as toml } from "smol-toml";
import { parse as yaml } from "yaml";
import { z } from "zod";
import { ROOT, config, projects } from "./core.mjs";
const sceneSchema = z.object({
  id: z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/),
  width: z.number().int().positive().multipleOf(2),
  height: z.number().int().positive().multipleOf(2),
  fps: z.number().int().positive(),
  durationInFrames: z.number().int().positive(),
  posterFrame: z.number().int().nonnegative(),
  beats: z
    .array(
      z.object({
        label: z.string().min(1),
        from: z.number().int().nonnegative(),
        to: z.number().int().positive(),
      }),
    )
    .min(1),
});
const ids = new Set();
for (const raw of config.scenes) {
  const scene = sceneSchema.parse(raw);
  if (ids.has(scene.id)) throw new Error(`Doppelte Szene: ${scene.id}`);
  ids.add(scene.id);
  let next = 0;
  for (const beat of scene.beats) {
    if (beat.from !== next || beat.to <= beat.from)
      throw new Error(`Kapitel passen nicht: ${scene.id}`);
    next = beat.to;
  }
  if (next !== scene.durationInFrames || scene.posterFrame >= next)
    throw new Error(`Länge oder Poster ungültig: ${scene.id}`);
}
const agentNames = new Set();
for (const file of await readdir(join(ROOT, ".codex/agents"))) {
  if (!file.endsWith(".toml")) continue;
  const a = toml(await readFile(join(ROOT, ".codex/agents", file), "utf8"));
  for (const key of ["name", "description", "developer_instructions"])
    if (typeof a[key] !== "string" || !a[key].trim())
      throw new Error(`${file}: ${key} fehlt.`);
  if (agentNames.has(a.name)) throw new Error(`Doppelter Agent: ${a.name}`);
  agentNames.add(a.name);
}
toml(await readFile(join(ROOT, ".codex/config.toml"), "utf8"));
let skills = 0;
for (const dir of await readdir(join(ROOT, ".agents/skills"), {
  withFileTypes: true,
})) {
  if (!dir.isDirectory() || dir.name.startsWith("remotion-")) continue;
  const text = await readFile(
    join(ROOT, ".agents/skills", dir.name, "SKILL.md"),
    "utf8",
  );
  const front = text.match(/^---\n([\s\S]*?)\n---/);
  if (!front) throw new Error(`${dir.name}: Frontmatter fehlt.`);
  const meta = yaml(front[1]);
  if (meta.name !== dir.name || !meta.description)
    throw new Error(`${dir.name}: Name oder Beschreibung ungültig.`);
  yaml(
    await readFile(
      join(ROOT, ".agents/skills", dir.name, "agents/openai.yaml"),
      "utf8",
    ),
  );
  skills++;
}
const saved = await projects();
for (const brief of saved)
  if (brief.compositionId && !ids.has(brief.compositionId))
    throw new Error(`Szene fehlt für ${brief.id}`);
for (const file of [
  "public/fonts/dm-sans-latin-400-normal.woff2",
  "public/fonts/dm-sans-latin-700-normal.woff2",
  "public/fonts/fraunces-latin-400-normal.woff2",
  "public/audio/website-sound.wav",
])
  await access(join(ROOT, file));
console.log(
  `Geprüft: ${ids.size} Szenen, ${saved.length} Briefings, ${agentNames.size} Agenten, ${skills} Studio-Skills und lokale Medien.`,
);
