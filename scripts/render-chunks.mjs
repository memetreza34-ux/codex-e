import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { ROOT, config } from "./core.mjs";
import { run, browserPath, qaMedia } from "./render.mjs";
const [id, audio] = process.argv.slice(2);
const scene = config.scenes.find((item) => item.id === id);
if (!scene) throw new Error("Bekannte Szenen-ID erforderlich.");
const audioPath = audio ? resolve(ROOT, "public", audio) : null;
if (
  audioPath &&
  relative(join(ROOT, "public/audio"), audioPath).startsWith("..")
)
  throw new Error("Ton muss in public/audio liegen.");
const directory = join(ROOT, "work", `${id}-chunks-${Date.now()}`);
await mkdir(directory, { recursive: true });
await mkdir(join(ROOT, "renders"), { recursive: true });
const browser = browserPath(),
  parts = [];
for (let start = 0; start < scene.durationInFrames; start += 90) {
  const end = Math.min(start + 89, scene.durationInFrames - 1),
    file = join(directory, `part-${start}.mp4`);
  await run("npm", [
    "exec",
    "--",
    "remotion",
    "render",
    "src/remotion/index.ts",
    id,
    file,
    "--codec=h264",
    "--image-format=png",
    "--disable-shared-memory-capture",
    "--concurrency=1",
    "--crf=18",
    "--muted",
    "--log=error",
    `--frames=${start}-${end}`,
    `--gl=${process.platform === "darwin" ? "angle" : "swangle"}`,
    ...(browser ? [`--browser-executable=${browser}`] : []),
  ]);
  parts.push(file);
  console.log(`${id}: ${end + 1}/${scene.durationInFrames} Frames`);
}
const list = join(directory, "parts.txt");
await writeFile(
  list,
  parts.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n") +
    "\n",
);
const output = join(ROOT, "renders", `${id}-final.mp4`);
await run("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  list,
  ...(audioPath
    ? [
        "-i",
        audioPath,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
      ]
    : []),
  "-c:v",
  "copy",
  "-t",
  String(scene.durationInFrames / scene.fps),
  "-movflags",
  "+faststart",
  output,
]);
console.log(
  await qaMedia(output, {
    expected: {
      width: scene.width,
      height: scene.height,
      duration: scene.durationInFrames / scene.fps,
    },
  }),
);
