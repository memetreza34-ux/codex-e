import { access } from "node:fs/promises";
import { join } from "node:path";
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
  `Geprüft: ${ids.size} Szenen, ${saved.length} Briefings, lokale Schriften und Demo-Ton.`,
);
