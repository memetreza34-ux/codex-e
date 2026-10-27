import {
  readFile,
  readdir,
  mkdir,
  writeFile,
  rename,
  rm,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const config = JSON.parse(
  await readFile(join(ROOT, "workspace.config.json"), "utf8"),
);
export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const briefSchema = z
  .object({
    id: slugSchema,
    title: z.string().trim().min(3).max(140),
    topic: z.string().trim().min(10).max(4000),
    audience: z.string().trim().min(3).max(300),
    duration: z.number().int().min(5).max(600),
    format: z.enum(["16:9", "9:16", "1:1"]),
    style: z.string().trim().min(3).max(700),
    compositionId: z
      .enum(config.scenes.map((s) => s.id))
      .nullable()
      .default(null),
  })
  .strict();
export const renderSchema = z
  .object({
    compositionId: z.enum(config.scenes.map((s) => s.id)),
    quality: z.enum(["preview", "final"]).default("preview"),
  })
  .strict();
export async function projects() {
  await mkdir(join(ROOT, "projects"), { recursive: true });
  const entries = await readdir(join(ROOT, "projects"), {
    withFileTypes: true,
  });
  const result = [];
  for (const e of entries) {
    if (!e.isDirectory() || !slugSchema.safeParse(e.name).success) continue;
    try {
      result.push(
        briefSchema.parse(
          JSON.parse(
            await readFile(
              join(ROOT, "projects", e.name, "brief.json"),
              "utf8",
            ),
          ),
        ),
      );
    } catch {
      /* Ignore folders without a valid brief. */
    }
  }
  return result;
}
export async function saveProject(
  input,
  { overwrite = false, directory = join(ROOT, "projects") } = {},
) {
  const brief = briefSchema.parse(input);
  await mkdir(directory, { recursive: true });
  const folder = join(directory, brief.id);
  if (!overwrite) await mkdir(folder);
  else await mkdir(folder, { recursive: true });
  const temporary = join(folder, `.brief-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify(brief, null, 2) + "\n", {
      flag: "wx",
    });
    await rename(temporary, join(folder, "brief.json"));
  } finally {
    await rm(temporary, { force: true });
  }
  return brief;
}
