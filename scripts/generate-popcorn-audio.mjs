import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/audio", { recursive: true });
const rate = 48000,
  seconds = 24,
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
let seed = 97113,
  low = 0,
  previous = 0;
for (let i = 0; i < count; i++) {
  const t = i / rate;
  seed = (1664525 * seed + 1013904223) >>> 0;
  const noise = seed / 2147483648 - 1;
  low = 0.86 * low + 0.14 * noise;
  let x =
    0.007 * Math.sin(2 * Math.PI * 110 * t) +
    0.003 * Math.sin(2 * Math.PI * 165 * t);
  for (const start of [2.95, 8.8, 12.9])
    x += Math.exp(-(((t - start - 0.18) / 0.19) ** 2)) * low * 0.18;
  if (t > 9 && t < 16) {
    const h = Math.min(1, (t - 9) / 6);
    x +=
      low * h * 0.035 +
      Math.sin(2 * Math.PI * (55 * (t - 9) + 2.4 * (t - 9) ** 2)) * 0.012 * h;
  }
  const dt = t - 16.03;
  if (dt >= 0 && dt < 0.8) {
    x +=
      Math.sin(2 * Math.PI * (110 * dt - 35 * dt * dt)) *
        0.37 *
        Math.exp(-dt * 24) +
      noise * 0.28 * Math.exp(-dt * 42);
    for (const d of [0.022, 0.057, 0.092])
      if (dt > d) x += noise * 0.12 * Math.exp(-(dt - d) * 100);
  }
  for (const [start, hz] of [
    [19.1, 440],
    [19.35, 554.37],
    [19.7, 659.25],
    [22.2, 880],
  ]) {
    const dt = t - start;
    if (dt >= 0 && dt < 1.4)
      x +=
        (1 - Math.exp(-dt * 70)) *
        Math.exp(-dt * 5) *
        Math.sin(2 * Math.PI * hz * dt) *
        0.05;
  }
  x *= Math.min(1, t / 0.4, (seconds - t) / 0.8);
  const sample = Math.round(Math.max(-0.92, Math.min(0.92, x)) * 32767);
  out.writeInt16LE(sample, 44 + i * 4);
  out.writeInt16LE(Math.round(sample * 0.94 + previous * 0.06), 46 + i * 4);
  previous = sample;
}
await writeFile("public/audio/popcorn-lab.wav", out);
