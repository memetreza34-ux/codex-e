import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
await mkdir("public/fonts", { recursive: true });
for (const [family, files] of Object.entries({
  "dm-sans": [
    "dm-sans-latin-400-normal.woff2",
    "dm-sans-latin-700-normal.woff2",
  ],
  fraunces: ["fraunces-latin-400-normal.woff2"],
  "ibm-plex-mono": ["ibm-plex-mono-latin-400-normal.woff2"],
})) {
  const root = dirname(require.resolve(`@fontsource/${family}/package.json`));
  for (const file of files)
    await copyFile(join(root, "files", file), join("public/fonts", file));
  await copyFile(
    join(root, "LICENSE"),
    join("public/fonts", `${family}-LICENSE.txt`),
  );
}
console.log("Lokale Schriften bereit: DM Sans, Fraunces, IBM Plex Mono.");
await mkdir("public/audio", { recursive: true });
const rate = 48000,
  count = rate * 14,
  bytes = Buffer.alloc(44 + count * 4);
bytes.write("RIFF");
bytes.writeUInt32LE(bytes.length - 8, 4);
bytes.write("WAVEfmt ", 8);
bytes.writeUInt32LE(16, 16);
bytes.writeUInt16LE(1, 20);
bytes.writeUInt16LE(2, 22);
bytes.writeUInt32LE(rate, 24);
bytes.writeUInt32LE(rate * 4, 28);
bytes.writeUInt16LE(4, 32);
bytes.writeUInt16LE(16, 34);
bytes.write("data", 36);
bytes.writeUInt32LE(count * 4, 40);
let seed = 82,
  last = 0;
const clicks = [1.7, 5.25, 6.25, 6.71, 7.18, 10.48],
  chimes = [
    [5.35, 523.25],
    [6.3, 659.25],
    [6.77, 783.99],
    [7.23, 1046.5],
    [10.5, 523.25],
    [10.5, 659.25],
    [10.5, 783.99],
  ];
for (let i = 0; i < count; i++) {
  const t = i / rate;
  seed = (1664525 * seed + 1013904223) >>> 0;
  const noise = (seed / 4294967296) * 2 - 1;
  let value = 0;
  for (const hz of [130.8128, 196, 261.6256])
    value += 0.0105 * Math.sin(2 * Math.PI * hz * t);
  for (const sec of clicks) {
    const v = t - sec;
    if (v >= 0 && v < 0.3)
      value +=
        Math.exp(-v * 42) *
        (0.054 * Math.sin(2 * Math.PI * 1700 * v) + noise * 0.033);
  }
  for (const [sec, hz] of chimes) {
    const v = t - sec;
    if (v >= 0 && v < 1.5)
      value +=
        (1 - Math.exp(-v * 70)) *
        Math.exp(-v * 5.8) *
        0.033 *
        Math.sin(2 * Math.PI * hz * v);
  }
  for (const sec of [3.75, 6.02, 8.15, 10.2])
    value += Math.exp(-(((t - sec - 0.22) / 0.19) ** 2)) * noise * 0.03;
  value *= Math.min(1, t / 0.7, (14 - t) / 0.7);
  const sample = Math.round(Math.max(-1, Math.min(1, value)) * 32767);
  bytes.writeInt16LE(sample, 44 + i * 4);
  bytes.writeInt16LE(Math.round(sample * 0.94 + last * 0.06), 46 + i * 4);
  last = sample;
}
await writeFile("public/audio/website-sound.wav", bytes);
console.log("Synthetischer Demo-Ton lokal erzeugt.");

await import("./generate-africa-audio.mjs");

await import("./generate-africa-journey-audio.mjs");

await import("./generate-popcorn-audio.mjs");

await import("./generate-leap-audio.mjs");
