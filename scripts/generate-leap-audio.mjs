import { spawnSync } from "node:child_process";
import { mkdir, writeFile, rename } from "node:fs/promises";
await mkdir("public/audio", { recursive: true });
const rate = 48000,
  seconds = 30,
  count = rate * seconds,
  out = Buffer.alloc(44 + count * 4);
out.write("RIFF");
out.writeUInt32LE(out.length - 8, 4);
out.write("WAVEfmt ", 8);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22);
out.writeUInt32LE(rate, 24);
out.writeUInt32LE(rate * 4, 28);
out.writeUInt16LE(4, 32);
out.writeUInt16LE(16, 34);
out.write("data", 36);
out.writeUInt32LE(count * 4, 40);
let seed = 9137,
  low = 0,
  previous = 0,
  peak = 0;
const plucks = [
  [0.35, 293.66],
  [1.5, 440],
  [3, 587.33],
  [5.1, 293.66],
  [6.7, 369.99],
  [8.3, 440],
  [10.95, 329.63],
  [11.92, 392],
  [12.88, 493.88],
  [13.85, 659.25],
  [15.3, 784],
  [20.88, 587.33],
  [21.2, 739.99],
  [21.54, 880],
  [24.15, 440],
  [25.2, 554.37],
  [26.4, 659.25],
  [28.8, 880],
];
for (let i = 0; i < count; i++) {
  const t = i / rate;
  seed = (1664525 * seed + 1013904223) >>> 0;
  const noise = seed / 2147483648 - 1;
  low = 0.91 * low + 0.09 * noise;
  let x =
    0.006 * Math.sin(2 * Math.PI * 146.83 * t) +
    0.004 * Math.sin(2 * Math.PI * 220 * t);
  for (const [start, hz] of plucks) {
    const d = t - start;
    if (d >= 0 && d < 1.4)
      x +=
        (1 - Math.exp(-d * 120)) *
        Math.exp(-d * 5) *
        (0.07 * Math.sin(2 * Math.PI * hz * d) +
          0.017 * Math.sin(2 * Math.PI * hz * 2 * d));
  }
  for (const start of [4.4, 10.4, 16.3, 23.65]) {
    const d = t - start;
    if (d > -0.25 && d < 0.6) {
      x += Math.exp(-(((d - 0.12) / 0.19) ** 2)) * low * 0.18;
    }
  }
  for (const start of [17.77, 19.4]) {
    const d = t - start;
    if (d >= 0 && d < 0.7)
      x +=
        (noise - low) * 0.07 * Math.exp(-d * 6) * (1 + Math.sin(d * 70)) * 0.5;
  }
  if (t > 10.5 && t < 16.2) {
    const d = (t - 10.5) % 0.24;
    x +=
      Math.exp(-d * 95) *
      (0.045 * noise + 0.018 * Math.sin(2 * Math.PI * 2200 * d));
  }
  const hit = t - 20.82;
  if (hit >= 0 && hit < 0.6)
    x +=
      0.22 *
        Math.sin(2 * Math.PI * (83 * hit - 32 * hit * hit)) *
        Math.exp(-hit * 17) +
      noise * 0.07 * Math.exp(-hit * 55);
  x *= Math.min(1, t / 0.2, (seconds - t) / 0.7);
  peak = Math.max(peak, Math.abs(x));
  const a = Math.round(Math.max(-0.94, Math.min(0.94, x)) * 32767);
  out.writeInt16LE(a, 44 + i * 4);
  out.writeInt16LE(Math.round(a * 0.96 + previous * 0.04), 46 + i * 4);
  previous = a;
}
await writeFile("public/audio/leap-day.wav", out);
console.log({ seconds, peak: Number(peak.toFixed(3)) });

const normalized = "public/audio/leap-day-normalized.wav";
const mix = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    "public/audio/leap-day.wav",
    "-af",
    "loudnorm=I=-18:TP=-1.5:LRA=11",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-c:a",
    "pcm_s16le",
    normalized,
  ],
  { encoding: "utf8" },
);
if (mix.status === 0) await rename(normalized, "public/audio/leap-day.wav");
else
  console.log(
    "Ohne FFmpeg-Normalisierung: synthetischer Originalmix erhalten.",
  );
