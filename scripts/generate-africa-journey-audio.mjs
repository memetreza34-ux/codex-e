import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/audio", { recursive: true });
const rate = 48000,
  seconds = 35,
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
const bells = [
  [0.4, 261.63],
  [1.5, 392],
  [2.2, 523.25],
  [3.8, 659.25],
  [7.4, 523.25],
  [7.95, 587.33],
  [8.5, 659.25],
  [9.7, 783.99],
  [12.35, 659.25],
  [15.1, 392],
  [16.1, 523.25],
  [17.8, 783.99],
  [20.7, 587.33],
  [23.6, 440],
  [24.5, 523.25],
  [26.1, 659.25],
  [29.1, 392],
  [30.5, 523.25],
  [31.8, 523.25],
  [31.8, 659.25],
  [31.8, 783.99],
];
const whooshes = [0.1, 3.65, 11.9, 12.3, 20.1, 20.65, 28.4, 29.0];
let seed = 34008,
  noiseLow = 0,
  previous = 0;
for (let i = 0; i < count; i++) {
  const t = i / rate;
  seed = (1664525 * seed + 1013904223) >>> 0;
  const noise = seed / 2147483648 - 1;
  noiseLow = noiseLow * 0.85 + noise * 0.15;
  let value =
    0.01 * Math.sin(2 * Math.PI * 130.81 * t) +
    0.005 * Math.sin(2 * Math.PI * 196 * t);
  for (const [start, hz] of bells) {
    const dt = t - start;
    if (dt >= 0 && dt < 1.7)
      value +=
        (1 - Math.exp(-dt * 110)) *
        Math.exp(-dt * 5.5) *
        0.09 *
        (Math.sin(2 * Math.PI * hz * dt) +
          0.13 * Math.sin(2 * Math.PI * hz * 2.002 * dt));
  }
  for (const start of whooshes)
    value += Math.exp(-(((t - start - 0.17) / 0.18) ** 2)) * noiseLow * 0.19;
  if (t > 14.6 && t < 17.2) {
    const dt = (t - 14.6) % 0.267;
    value += Math.exp(-dt * 90) * noiseLow * 0.12;
  }
  if (t > 22 && t < 27.5)
    value += noiseLow * 0.03 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.6 * t));
  value *= Math.min(1, t / 0.3, (seconds - t) / 1.2);
  const sample = Math.round(Math.max(-1, Math.min(1, value)) * 32767);
  out.writeInt16LE(sample, 44 + i * 4);
  out.writeInt16LE(Math.round(sample * 0.92 + previous * 0.08), 46 + i * 4);
  previous = sample;
}
await writeFile("public/audio/africa-journey.wav", out);
