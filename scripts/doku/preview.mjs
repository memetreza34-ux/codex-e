import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ROOT } from "../core.mjs";
import { assertNewExport, browserPath, qaMedia, run } from "../render.mjs";

const dimension = z.number().int().min(64).max(7680).multipleOf(4);
const previewFps = z.number().min(1).max(120);
const composition = "DokuSchnitt";

export function timelineFps(timeline, override) {
  if (override !== undefined) return previewFps.parse(Number(override));
  if (timeline.global_start_time?.rate)
    return previewFps.parse(timeline.global_start_time.rate);
  const rates = new Set();
  function collect(item) {
    if (item?.source_range?.duration?.rate)
      rates.add(item.source_range.duration.rate);
    for (const child of item?.children ?? []) collect(child);
  }
  collect(timeline.tracks);
  if (rates.size === 1) return previewFps.parse([...rates][0]);
  throw new Error("Bildrate nicht eindeutig. Gib sie mit --fps an.");
}

function remotion(args, onData) {
  return run(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["exec", "--", "remotion", ...args],
    { onData },
  );
}

function renderFlags() {
  const browser = browserPath();
  const gl =
    process.env.REMOTION_GL ||
    (process.platform === "darwin" ? "angle" : "swangle");
  return [
    "--disable-shared-memory-capture",
    "--log=error",
    `--gl=${gl}`,
    ...(browser ? [`--browser-executable=${browser}`] : []),
  ];
}

export async function importTimeline(directory, input, options, onData) {
  const source = await realpath(resolve(input));
  if (extname(source).toLowerCase() !== ".otio")
    throw new Error("Die Vorschau erwartet eine .otio-Datei.");
  const timeline = JSON.parse(await readFile(source, "utf8"), (key, value) => {
    if (
      key === "target_url" &&
      typeof value === "string" &&
      value.startsWith("file:")
    ) {
      const file = new URL(value);
      if (file.hostname)
        throw new Error("Die Vorschau erwartet lokale Dateien.");
      fileURLToPath(file);
    }
    if (
      key === "target_url" &&
      typeof value === "string" &&
      (value.startsWith("//") ||
        value.startsWith("\\\\") ||
        (/^[a-z][a-z0-9+.-]*:/i.test(value) &&
          !value.startsWith("file:") &&
          !/^[a-z]:[\\/]/i.test(value)))
    )
      throw new Error(
        "Die Vorschau verwendet lokale Medien. Entferne die Netzwerkquelle aus der Timeline.",
      );
    return value;
  });
  if (timeline?.OTIO_SCHEMA !== "Timeline.1")
    throw new Error("OpenTimelineIO-Timeline fehlt.");
  const width = dimension.parse(Number(options.width ?? 1920));
  const height = dimension.parse(Number(options.height ?? 1080));
  const fps = timelineFps(timeline, options.fps);
  const folder = await mkdtemp(join(directory, "remotion-"));
  const rootFile = join(folder, "Root.tsx");
  const entry = join(folder, "index.ts");
  const publicDir = join(folder, "public");
  await mkdir(publicDir);
  await writeFile(
    rootFile,
    'import { Composition } from "remotion";\nexport const Root = () => <></>;\n',
  );
  await writeFile(
    entry,
    'import { registerRoot } from "remotion";\nimport { Root } from "./Root";\nregisterRoot(Root);\n',
  );
  await remotion(
    [
      "open-timeline",
      "import",
      source,
      `--root-file=${rootFile}`,
      `--composition=${composition}`,
      `--width=${width}`,
      `--height=${height}`,
      `--public-dir=${publicDir}`,
      `--fps=${fps}`,
      ...(options["media-dir"]
        ? [`--media-dir=${await realpath(resolve(options["media-dir"]))}`]
        : []),
    ],
    onData,
  );
  return { entry, publicDir, fps };
}

export async function renderTimeline(directory, input, options, onData) {
  const { entry, publicDir, fps } = await importTimeline(
    directory,
    input,
    options,
    onData,
  );
  const output = join(
    ROOT,
    "renders",
    `${options.project}-${randomUUID()}-${options.final ? "final" : "preview"}.mp4`,
  );
  await mkdir(dirname(output), { recursive: true });
  await assertNewExport(output);
  await remotion(
    [
      "render",
      entry,
      composition,
      output,
      `--public-dir=${publicDir}`,
      "--codec=h264",
      `--scale=${options.final ? 1 : 0.5}`,
      `--crf=${options.final ? 18 : 24}`,
      ...renderFlags(),
    ],
    onData,
  );
  const report = await qaMedia(output);
  const [frames, seconds] = report.video.r_frame_rate.split("/").map(Number);
  if (Math.abs(frames / seconds - fps) > 0.001) {
    throw new Error(
      `Export verwendet ${report.video.r_frame_rate} statt ${fps} fps.`,
    );
  }
  return { output, entry, publicDir, report };
}

export async function renderEvidence(input, project, onData) {
  const props = await realpath(resolve(input));
  const output = join(
    ROOT,
    "renders",
    `${project}-${randomUUID()}-quellenbeleg.mov`,
  );
  await mkdir(dirname(output), { recursive: true });
  await assertNewExport(output);
  await remotion(
    [
      "render",
      "src/remotion/doku/index.tsx",
      "Quellenbeleg",
      output,
      `--props=${props}`,
      "--codec=prores",
      "--prores-profile=4444",
      "--pixel-format=yuva444p10le",
      "--image-format=png",
      ...renderFlags(),
    ],
    onData,
  );
  return output;
}
