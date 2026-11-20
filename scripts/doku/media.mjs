import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  link,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { z } from "zod";
import { slugSchema } from "../core.mjs";
import { run } from "../render.mjs";

const text = z.string().trim().min(1);
const mediaSchema = z.object({
  id: slugSchema,
  name: text,
  file: text,
  source: text,
  rights: text,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  size: z.number().int().positive(),
  duration: z.number().positive(),
  timecode: text.nullable(),
  video: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      fps: text,
      duration: z.number().positive(),
      start: z.number().nonnegative().default(0),
    })
    .nullable(),
  audio: z
    .object({
      channels: z.number().int().positive(),
      duration: z.number().positive(),
      start: z.number().nonnegative().default(0),
    })
    .nullable(),
});

export async function writeNew(file, data) {
  const temporary = join(dirname(file), `.doku-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify(data, null, 2) + "\n", {
      flag: "wx",
    });
    await link(temporary, file);
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error(`Datei existiert bereits: ${file}`);
    throw error;
  } finally {
    await rm(temporary, { force: true });
  }
}

async function hashFile(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function ingest(directory, { id, input, source, rights }) {
  slugSchema.parse(id);
  text.parse(source);
  text.parse(rights);
  const file = await realpath(resolve(input));
  const before = await stat(file);
  if (
    !before.isFile() ||
    ![".mp4", ".mov", ".wav"].includes(extname(file).toLowerCase())
  ) {
    throw new Error(
      "Als Drehmaterial werden lokale MP4-, MOV- und WAV-Dateien unterstützt.",
    );
  }
  const raw = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,width,height,avg_frame_rate,channels,duration,start_time:stream_disposition=attached_pic:stream_tags=timecode:format=duration,start_time:format_tags=timecode",
    "-of",
    "json",
    file,
  ]);
  const { streams, format } = JSON.parse(raw);
  const video = streams.find(
    (stream) =>
      stream.codec_type === "video" && !stream.disposition?.attached_pic,
  );
  const audio = streams.find((stream) => stream.codec_type === "audio");
  if (!audio && !video)
    throw new Error("Die Datei enthält weder Drehbild noch Ton.");
  const sha256 = await hashFile(file);
  const after = await stat(file);
  if (
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs ||
    before.ino !== after.ino
  ) {
    throw new Error("Die Aufnahme wurde während des Imports verändert.");
  }
  const duration = Number(format.duration);
  const fileStart = Number(format.start_time) || 0;
  const trackStart = (stream) => {
    const time = Number(stream.start_time);
    return Number.isFinite(time) ? Math.max(0, time - fileStart) : 0;
  };
  const media = mediaSchema.parse({
    id,
    name: basename(file),
    file,
    source,
    rights,
    sha256,
    size: after.size,
    duration,
    timecode:
      video?.tags?.timecode ||
      format.tags?.timecode ||
      streams.find((stream) => stream.tags?.timecode)?.tags.timecode ||
      null,
    video: video
      ? {
          width: video.width,
          height: video.height,
          fps: video.avg_frame_rate,
          duration: Number(video.duration) || duration,
          start: trackStart(video),
        }
      : null,
    audio: audio
      ? {
          channels: audio.channels,
          duration: Number(audio.duration) || duration,
          start: trackStart(audio),
        }
      : null,
  });
  const target = join(directory, "assets");
  await mkdir(target, { recursive: true });
  await writeNew(join(target, `${id}.json`), media);
  return media;
}

export async function readAsset(directory, id) {
  slugSchema.parse(id);
  const media = mediaSchema.parse(
    JSON.parse(await readFile(join(directory, "assets", `${id}.json`), "utf8")),
  );
  if (id !== media.id || (await hashFile(media.file)) !== media.sha256) {
    throw new Error(
      `Die registrierte Aufnahme ${id} wurde verändert. Importiere die neue Fassung unter einer neuen ID.`,
    );
  }
  return media;
}

export async function transcribe(directory, id, modelPath, onData) {
  const media = await readAsset(directory, id);
  if (!media.audio)
    throw new Error(`Die Aufnahme ${id} enthält keine Tonspur.`);
  const model = await realpath(resolve(modelPath));
  const output = join(directory, "transcripts");
  await mkdir(output, { recursive: true });
  const temporary = await mkdtemp(join(directory, "transcribe-"));
  try {
    const wav = join(temporary, "audio.wav");
    await run("ffmpeg", [
      "-v",
      "error",
      "-i",
      media.file,
      "-map",
      "0:a:0",
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",
      wav,
    ]);
    const result = join(temporary, "result");
    await run(
      "whisper-cli",
      ["-m", model, "-l", "de", "-f", wav, "-oj", "-of", result, "-ng"],
      { onData },
    );
    const raw = JSON.parse(await readFile(`${result}.json`, "utf8"));
    if (raw.result?.language !== "de")
      throw new Error(
        "Whisper hat kein deutsches Transkript geliefert. Ein mehrsprachiges GGML-Modell verwenden.",
      );
    const segments = z
      .array(
        z.object({
          offsets: z.object({
            from: z.number().int().nonnegative(),
            to: z.number().int().nonnegative(),
          }),
          text: z.string(),
        }),
      )
      .parse(raw.transcription)
      .filter(({ offsets }) => offsets.to > offsets.from)
      .map(({ offsets, text }) => ({
        fromMs: offsets.from,
        toMs: offsets.to,
        text: text.trim(),
      }));
    const file = join(output, `${id}.json`);
    await writeNew(file, {
      asset: id,
      sha256: media.sha256,
      language: "de",
      audioStartMs: Math.round(media.audio.start * 1000),
      model: basename(model),
      review: "pending",
      segments,
    });
    return file;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
