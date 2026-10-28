import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function checkClockFrame(file) {
  const pixels = execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      file,
      "-vf",
      "scale=270:480,crop=200:220:35:85,format=gray",
      "-frames:v",
      "1",
      "-f",
      "rawvideo",
      "pipe:1",
    ],
    { maxBuffer: 1024 * 1024 },
  );
  if (pixels.length !== 200 * 220)
    throw new Error("Prüfbereich des Uhrbilds fehlt.");
  const average = pixels.reduce((sum, value) => sum + value, 0) / pixels.length;
  const bright = pixels.filter((value) => value > 100).length / pixels.length;
  if (average < 60 || bright < 0.25)
    throw new Error(
      "3D-Uhr fehlt oder ist unlesbar dunkel. Prüfe die Lade-Wartebedingung vor ThreeCanvas.",
    );
  return {
    averageLuma: Number(average.toFixed(1)),
    brightFraction: Number(bright.toFixed(3)),
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (!process.argv[2]) throw new Error("Pfad zum gerenderten Uhrbild fehlt.");
  console.log(checkClockFrame(resolve(process.argv[2])));
}
