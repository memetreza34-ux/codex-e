import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { slugSchema } from "../core.mjs";
import { readAsset, writeNew } from "./media.mjs";

export const fpsSchema = z.number().int().min(1).max(120);
const frame = z.number().int().min(0).max(2_147_483_647);
const text = z.string().trim().min(1);
const cutsSchema = z
  .object({
    title: text,
    fps: fpsSchema,
    tracks: z
      .array(
        z
          .object({
            kind: z.enum(["Video", "Audio"]),
            name: text,
            clips: z
              .array(
                z
                  .object({
                    asset: slugSchema,
                    name: text.optional(),
                    at: frame,
                    in: frame,
                    out: frame,
                    evidence: text.optional(),
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export function makeTimeline(input, assets) {
  const { fps, title, tracks } = cutsSchema.parse(input);
  if (!tracks.some(({ kind }) => kind === "Video"))
    throw new Error("Der Schnitt benötigt mindestens eine Bildspur.");
  const timestamp = (value) => ({
    OTIO_SCHEMA: "RationalTime.1",
    value,
    rate: fps,
  });
  const range = (start, duration) => ({
    OTIO_SCHEMA: "TimeRange.1",
    start_time: timestamp(start),
    duration: timestamp(duration),
  });
  const item = (schema, name, sourceRange) => ({
    OTIO_SCHEMA: schema,
    metadata: {},
    name,
    source_range: sourceRange,
    effects: [],
    markers: [],
    enabled: true,
    color: null,
  });
  const children = tracks.map(({ kind, name, clips }) => {
    const items = [];
    let cursor = 0;
    for (const clip of [...clips].sort((a, b) => a.at - b.at)) {
      const asset = assets.get(clip.asset);
      const stream = asset?.[kind === "Video" ? "video" : "audio"];
      if (!stream)
        throw new Error(`${clip.asset} hat keine passende Spur für ${name}.`);
      const start = Math.ceil((stream.start ?? 0) * fps - 1e-6);
      const end = Math.floor(
        ((stream.start ?? 0) + stream.duration) * fps + 1e-6,
      );
      if (clip.in < start || clip.out <= clip.in || clip.out > end)
        throw new Error(
          `Quellbereich für ${clip.asset} ist ungültig (${clip.in}–${clip.out}, maximal ${end}).`,
        );
      if (clip.at < cursor)
        throw new Error(
          `Clips auf ${name} überschneiden sich bei Frame ${clip.at}.`,
        );
      if (clip.at > cursor)
        items.push(item("Gap.1", "", range(0, clip.at - cursor)));
      const length = clip.out - clip.in;
      items.push({
        ...item("Clip.2", clip.name ?? asset.name, range(clip.in, length)),
        metadata: {
          codex_e: {
            asset: asset.id,
            source: asset.source,
            rights: asset.rights,
            sha256: asset.sha256,
            source_timecode: asset.timecode,
            evidence: clip.evidence ?? null,
          },
        },
        media_references: {
          DEFAULT_MEDIA: {
            OTIO_SCHEMA: "ExternalReference.1",
            metadata: {},
            name: "",
            available_range: range(start, end - start),
            available_image_bounds: null,
            target_url: pathToFileURL(asset.file).href,
          },
        },
        active_media_reference_key: "DEFAULT_MEDIA",
      });
      cursor = clip.at + length;
    }
    return { ...item("Track.1", name, null), kind, children: items };
  });
  return {
    OTIO_SCHEMA: "Timeline.1",
    metadata: {},
    name: title,
    global_start_time: timestamp(0),
    tracks: { ...item("Stack.1", "tracks", null), children },
  };
}

export async function exportTimeline(directory, input, output) {
  const cuts = cutsSchema.parse(JSON.parse(await readFile(input, "utf8")));
  const ids = new Set(
    cuts.tracks.flatMap((track) => track.clips.map((clip) => clip.asset)),
  );
  const assets = new Map();
  for (const id of ids) assets.set(id, await readAsset(directory, id));
  const file = output ?? join(directory, "schnitt.otio");
  await writeNew(file, makeTimeline(cuts, assets));
  return file;
}
