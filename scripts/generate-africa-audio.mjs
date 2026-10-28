import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/audio", { recursive: true });
const rate = 48000,
  seconds = 14,
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
let seed = 4221,
  smoothed = 0,
  previous = 0;
for (let i = 0; i < count; i++) {
  const t = i / rate;
  seed = (1664525 * seed + 1013904223) >>> 0;
  const noise = (seed / 4294967296) * 2 - 1;
  smoothed = smoothed * 0.83 + noise * 0.17;
  let value =
    0.004 * Math.sin(2 * Math.PI * 130.81 * t) +
    0.0025 * Math.sin(2 * Math.PI * 196 * t);
  for (const [sec, hz] of [
    [0.6, 523.25],
    [3.16, 659.25],
    [5.62, 783.99],
    [8.08, 880],
    [10.74, 523.25],
    [10.74, 659.25],
    [10.74, 783.99],
  ]) {
    const dt = t - sec;
    if (dt >= 0 && dt < 1.8)
      value +=
        (1 - Math.exp(-dt * 90)) *
        Math.exp(-dt * 5.8) *
        0.025 *
        (Math.sin(2 * Math.PI * hz * dt) +
          0.17 * Math.sin(2 * Math.PI * hz * 2.002 * dt));
  }
  for (const sec of [0.12, 0.95, 3.03, 5.48, 7.96, 10.4])
    value += Math.exp(-(((t - sec - 0.15) / 0.17) ** 2)) * smoothed * 0.055;
  value *= 4 * Math.min(1, t / 0.45, (seconds - t) / 0.75);
  const sample = Math.round(Math.max(-1, Math.min(1, value)) * 32767);
  out.writeInt16LE(sample, 44 + i * 4);
  out.writeInt16LE(Math.round(sample * 0.9 + previous * 0.1), 46 + i * 4);
  previous = sample;
}
await writeFile("public/audio/africa-study.wav", out);
