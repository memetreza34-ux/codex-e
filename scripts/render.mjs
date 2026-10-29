import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { access, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import {
  join,
  basename,
  dirname,
  relative,
  resolve,
  isAbsolute,
} from "node:path";
import { ROOT, config, renderSchema } from "./core.mjs";
export function run(command, args, { onData = () => {}, cwd = ROOT } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const collect = (data) => {
      const text = data.toString();
      output = (output + text).slice(-100000);
      onData(text);
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve(output)
        : reject(
            new Error(`${command} beendet mit ${code}: ${output.slice(-2500)}`),
          ),
    );
  });
}
export function browserPath() {
  const paths = [
    process.env.REMOTION_BROWSER_EXECUTABLE,
    ...(process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : process.platform === "win32"
        ? ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"]
        : [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
          ]),
  ];
  return paths.find((p) => p && existsSync(p));
}
export async function inspectMedia(file) {
  const raw = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,codec_name,width,height,r_frame_rate:format=duration,size",
    "-of",
    "json",
    file,
  ]);
  const meta = JSON.parse(raw),
    video = meta.streams.find((s) => s.codec_type === "video");
  if (!video) throw new Error("Die Datei enthält keine Videospur.");
  return {
    duration: Number(meta.format.duration),
    size: Number(meta.format.size),
    video,
    audio: meta.streams.some((s) => s.codec_type === "audio"),
  };
}
export async function qaMedia(file, { expected } = {}) {
  const media = await inspectMedia(file);
  if (!(media.duration > 0)) throw new Error("Videolänge ungültig.");
  if (
    expected &&
    (media.video.width !== expected.width ||
      media.video.height !== expected.height ||
      Math.abs(media.duration - expected.duration) > 0.2)
  )
    throw new Error(
      "Exportformat oder Dauer stimmt nicht mit der Szene überein.",
    );
  const sheet = file.replace(/\.[^.]+$/, "-sheet.jpg");
  const poster = file.replace(/\.[^.]+$/, "-poster.jpg");
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    file,
    "-vf",
    `fps=8/${media.duration},scale=480:-1,tile=4x2`,
    "-frames:v",
    "1",
    sheet,
  ]);
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(media.duration * 0.85),
    "-i",
    file,
    "-vf",
    "scale=960:-1",
    "-frames:v",
    "1",
    poster,
  ]);
  const report = {
    ...media,
    file: basename(file),
    contactSheet: basename(sheet),
    poster: basename(poster),
    checkedAt: new Date().toISOString(),
    visualReview: "pending",
    note: "Technische Prüfung abgeschlossen. Bild, Bewegung und Ton müssen visuell bzw. hörend beurteilt werden.",
  };
  await writeFile(
    file.replace(/\.[^.]+$/, ".qa.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  return report;
}
export function createRenderPlan(
  input,
  {
    id = randomUUID(),
    root = ROOT,
    audio = "composition",
    platform = process.platform,
    browser = browserPath(),
    gl = process.env.REMOTION_GL ||
      (platform === "darwin" ? "angle" : "swangle"),
  } = {},
) {
  const { compositionId, quality } = renderSchema.parse(input);
  if (typeof id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/.test(id))
    throw new Error("Export-ID darf keine Pfadbestandteile enthalten.");
  const scene = config.scenes.find((item) => item.id === compositionId);
  const scale = quality === "preview" ? 0.5 : 1;
  const expected = {
    width: Math.round(scene.width * scale),
    height: Math.round(scene.height * scale),
    duration: scene.durationInFrames / scene.fps,
  };
  if (expected.width % 2 || expected.height % 2)
    throw new Error("H.264-Export benötigt gerade Bildabmessungen.");
  const chunks = [];
  for (let from = 0; from < scene.durationInFrames; from += 90)
    chunks.push({ from, to: Math.min(from + 89, scene.durationInFrames - 1) });
  let audioPath = null;
  if (audio !== null && audio !== "composition") {
    if (typeof audio !== "string" || !audio || audio.includes("\0"))
      throw new Error("Ton muss eine Datei in public/audio sein.");
    audioPath = resolve(root, "public", audio);
    const rel = relative(resolve(root, "public/audio"), audioPath);
    if (
      !rel ||
      rel === ".." ||
      rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
      isAbsolute(rel)
    )
      throw new Error("Ton muss in public/audio liegen.");
  }
  const name = `${compositionId}-${id}-${quality}`;
  return {
    compositionId,
    quality,
    root,
    scene,
    scale,
    expected,
    chunks,
    browser,
    gl,
    concurrency: platform === "darwin" ? 1 : 2,
    crf: quality === "preview" ? 24 : 18,
    audioMode:
      audio === null
        ? "silent"
        : audio === "composition"
          ? "composition"
          : "external",
    audioPath,
    directory: join(root, "work", name),
    output: join(root, "renders", `${name}.mp4`),
  };
}
export function remotionRenderArgs(
  plan,
  output,
  { chunk, audioOnly = false } = {},
) {
  return [
    "exec",
    "--",
    "remotion",
    "render",
    "src/remotion/index.ts",
    plan.compositionId,
    output,
    `--codec=${audioOnly ? "wav" : "h264"}`,
    "--disable-shared-memory-capture",
    `--concurrency=${plan.concurrency}`,
    "--log=error",
    `--gl=${plan.gl}`,
    ...(audioOnly
      ? []
      : [
          "--image-format=png",
          `--scale=${plan.scale}`,
          `--crf=${plan.crf}`,
          "--muted",
        ]),
    ...(chunk ? [`--frames=${chunk.from}-${chunk.to}`] : []),
    ...(plan.browser ? [`--browser-executable=${plan.browser}`] : []),
  ];
}
export function muxRenderArgs(plan, list, audioFile) {
  return [
    "-hide_banner",
    "-loglevel",
    "error",
    "-n",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    list,
    ...(audioFile
      ? [
          "-i",
          audioFile,
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-af",
          "apad",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
        ]
      : ["-map", "0:v:0", "-an"]),
    "-c:v",
    "copy",
    "-t",
    String(plan.expected.duration),
    "-movflags",
    "+faststart",
    plan.output,
  ];
}
export async function assertNewExport(output) {
  for (const file of [
    output,
    output.replace(/\.[^.]+$/, "-sheet.jpg"),
    output.replace(/\.[^.]+$/, "-poster.jpg"),
    output.replace(/\.[^.]+$/, ".qa.json"),
  ]) {
    try {
      await access(file);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    throw new Error(`Export bereits vorhanden, neue ID verwenden: ${file}`);
  }
}
export async function renderVideo(
  input,
  { onData = () => {}, ...options } = {},
) {
  const plan = createRenderPlan(input, options);
  await assertNewExport(plan.output);
  if (plan.audioPath) {
    const [base, target] = await Promise.all([
      realpath(join(plan.root, "public/audio")),
      realpath(plan.audioPath),
    ]);
    const rel = relative(base, target);
    if (
      !rel ||
      rel === ".." ||
      rel.startsWith("../") ||
      rel.startsWith("..\\") ||
      isAbsolute(rel)
    )
      throw new Error("Tonverknüpfung verlässt public/audio.");
  }
  await mkdir(dirname(plan.output), { recursive: true });
  await mkdir(dirname(plan.directory), { recursive: true });
  await mkdir(plan.directory);
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const parts = [];
  for (const chunk of plan.chunks) {
    const output = join(plan.directory, `part-${chunk.from}.mp4`);
    await run(command, remotionRenderArgs(plan, output, { chunk }), {
      onData,
      cwd: plan.root,
    });
    parts.push(output);
    onData(
      `${plan.compositionId}: ${chunk.to + 1}/${plan.scene.durationInFrames} Frames\n`,
    );
  }
  let audioFile = plan.audioPath;
  if (plan.audioMode === "composition") {
    audioFile = join(plan.directory, "composition.wav");
    await run(
      command,
      remotionRenderArgs(plan, audioFile, { audioOnly: true }),
      { onData, cwd: plan.root },
    );
  }
  const list = join(plan.directory, "parts.txt");
  await writeFile(
    list,
    parts.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n") +
      "\n",
    { flag: "wx" },
  );
  await run("ffmpeg", muxRenderArgs(plan, list, audioFile), {
    onData,
    cwd: plan.root,
  });
  return qaMedia(plan.output, { expected: plan.expected });
}
export async function savedExports() {
  await mkdir(join(ROOT, "renders"), { recursive: true });
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(join(ROOT, "renders"));
  const results = [];
  for (const name of files.filter((f) => f.endsWith(".qa.json"))) {
    try {
      results.push(
        JSON.parse(await readFile(join(ROOT, "renders", name), "utf8")),
      );
    } catch {
      /* Ignore interrupted report writes. */
    }
  }
  return results.sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
}
