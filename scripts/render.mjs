import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, basename, dirname } from "node:path";
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
export async function renderVideo(
  input,
  { onData = () => {}, id = Date.now().toString(36) } = {},
) {
  const { compositionId, quality } = renderSchema.parse(input),
    scene = config.scenes.find((s) => s.id === compositionId);
  const output = join(ROOT, "renders", `${compositionId}-${id}-${quality}.mp4`);
  await mkdir(dirname(output), { recursive: true });
  const browser = browserPath();
  const args = [
    "exec",
    "--",
    "remotion",
    "render",
    "src/remotion/index.ts",
    compositionId,
    output,
    "--codec=h264",
    "--image-format=png",
    "--disable-shared-memory-capture",
    `--concurrency=${process.platform === "darwin" ? 1 : 2}`,
    "--log=error",
    `--scale=${quality === "preview" ? 0.5 : 1}`,
    `--crf=${quality === "preview" ? 24 : 18}`,
    `--gl=${process.env.REMOTION_GL || (process.platform === "darwin" ? "angle" : "swangle")}`,
  ];
  if (browser) args.push(`--browser-executable=${browser}`);
  await run(process.platform === "win32" ? "npm.cmd" : "npm", args, { onData });
  const scale = quality === "preview" ? 0.5 : 1;
  return qaMedia(output, {
    expected: {
      width: Math.round(scene.width * scale),
      height: Math.round(scene.height * scale),
      duration: scene.durationInFrames / scene.fps,
    },
  });
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
