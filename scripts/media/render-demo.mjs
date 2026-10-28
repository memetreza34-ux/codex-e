import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./library.mjs";
import { run, browserPath, qaMedia } from "../render.mjs";
const directory = join(ROOT, "work/hybrid-demo");
await mkdir(directory, { recursive: true });
await mkdir(join(ROOT, "renders"), { recursive: true });
const browser = browserPath();
const parts = [];
for (let start = 0; start < 270; start += 90) {
  const file = join(directory, `part-${start}.mp4`);
  await run("npm", [
    "exec",
    "--",
    "remotion",
    "render",
    "src/remotion/index.ts",
    "HybridAssets",
    file,
    "--codec=h264",
    "--image-format=png",
    "--disable-shared-memory-capture",
    "--concurrency=1",
    "--crf=18",
    "--overwrite",
    "--log=error",
    `--frames=${start}-${start + 89}`,
    `--gl=${process.platform === "darwin" ? "angle" : "swangle"}`,
    ...(browser ? [`--browser-executable=${browser}`] : []),
  ]);
  parts.push(file);
  console.log(`Medienstudie: Frames ${start}–${start + 89} gerendert.`);
}
const list = join(directory, "parts.txt");
await writeFile(
  list,
  parts.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n") +
    "\n",
);
const output = join(ROOT, "renders/HybridAssets-final.mp4");
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
  "-c",
  "copy",
  "-movflags",
  "+faststart",
  output,
]);
console.log(
  await qaMedia(output, {
    expected: { width: 1080, height: 1920, duration: 9 },
  }),
);
