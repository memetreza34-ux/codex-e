import {
  readFile,
  readdir,
  mkdir,
  writeFile,
  rename,
  rm,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const config = JSON.parse(
  await readFile(join(ROOT, "studio.config.json"), "utf8"),
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
export function within(root, child) {
  const path = resolve(root, child),
    rel = relative(root, path);
  if (rel === ".." || rel.startsWith(`..${sep}`) || resolve(child) === child)
    throw new Error("Ungültiger Dateipfad.");
  return path;
}
export function originAllowed(origin, host, port) {
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  if (!hosts.has(host)) return false;
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && hosts.has(url.host);
  } catch {
    return false;
  }
}
export function byteRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]))
    throw new Error("Ungültiger Byte-Bereich.");
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!suffix) throw new Error("Ungültiger Byte-Bereich.");
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= size ||
    end < start
  )
    throw new Error("Byte-Bereich außerhalb der Datei.");
  return { start, end };
}
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
