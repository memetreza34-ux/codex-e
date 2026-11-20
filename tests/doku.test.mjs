import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { ingest, readAsset } from "../scripts/doku/media.mjs";
import { ROOT } from "../scripts/core.mjs";
import { makeTimeline, exportTimeline } from "../scripts/doku/timeline.mjs";
import { importTimeline, timelineFps } from "../scripts/doku/preview.mjs";
import { qaMedia, run } from "../scripts/render.mjs";

test("OTIO übernimmt Beschnitt, Tonlücke und Beleg getrennt", () => {
  const assets = new Map([
    [
      "aufnahme",
      {
        id: "aufnahme",
        name: "A #1.mov",
        file: "/assets/A #1.mov",
        video: { duration: 4 },
        audio: { duration: 4 },
        source: "Eigener Dreh",
        rights: "Eigene Produktion",
        sha256: "a".repeat(64),
        timecode: "01:02:03:04",
      },
    ],
  ]);
  const cut = {
    title: "Test",
    fps: 25,
    tracks: [
      {
        kind: "Video",
        name: "Bild",
        clips: [{ asset: "aufnahme", at: 0, in: 20, out: 80 }],
      },
      {
        kind: "Audio",
        name: "O-Ton",
        clips: [
          { asset: "aufnahme", at: 12, in: 20, out: 55, evidence: "Antwort 1" },
        ],
      },
    ],
  };
  const timeline = makeTimeline(cut, assets);
  assert.equal(timelineFps(timeline), 25);
  assert.equal(timelineFps({ ...timeline, global_start_time: null }), 25);
  assert.equal(timelineFps(timeline, "24"), 24);
  const [video, audio] = timeline.tracks.children;
  assert.equal(video.children[0].source_range.start_time.value, 20);
  assert.equal(video.children[0].source_range.duration.value, 60);
  assert.equal(audio.children[0].OTIO_SCHEMA, "Gap.1");
  assert.equal(audio.children[0].source_range.duration.value, 12);
  assert.equal(
    audio.children[1].metadata.codex_e.source_timecode,
    "01:02:03:04",
  );
  assert.equal(audio.children[1].metadata.codex_e.evidence, "Antwort 1");
  assert.match(
    audio.children[1].media_references.DEFAULT_MEDIA.target_url,
    /A%20%231\.mov$/,
  );

  const clip = cut.tracks[0].clips[0];
  cut.tracks[0].clips.push({ ...clip, at: 59 });
  assert.throws(() => makeTimeline(cut, assets), /überschneiden/);
  cut.tracks[0].clips[1].at = 60;
  cut.tracks[0].clips[1].out = 101;
  assert.throws(() => makeTimeline(cut, assets), /Quellbereich/);
});

test("Drehmaterial schützt die Registrierung und prüft spätere Änderungen", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "codex-e-doku-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = join(directory, "Ton.wav");
  await run("ffmpeg", [
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "sine=440:duration=1",
    input,
  ]);
  const request = {
    id: "ton",
    input,
    source: "Lokale Aufnahme",
    rights: "Eigen",
  };
  const outcomes = await Promise.allSettled([
    ingest(directory, request),
    ingest(directory, request),
  ]);
  assert.equal(
    outcomes.filter(({ status }) => status === "fulfilled").length,
    1,
  );
  assert.match(
    outcomes.find(({ status }) => status === "rejected").reason.message,
    /existiert bereits/,
  );
  const media = await readAsset(directory, "ton");
  assert.equal(media.audio.channels, 1);
  assert.equal(media.video, null);
  await writeFile(
    input,
    Buffer.concat([await readFile(input), Buffer.from([1])]),
  );
  await assert.rejects(readAsset(directory, "ton"), /wurde verändert/);
});

test("Export-QA erkennt eine vorhandene stumme Spur", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "codex-e-ton-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = join(directory, "stumm.mp4");
  await run("ffmpeg", [
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "color=s=160x90:r=25:d=2",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=48000:cl=mono",
    "-shortest",
    "-c:v",
    "mpeg4",
    "-c:a",
    "aac",
    input,
  ]);
  const report = await qaMedia(input);
  assert.equal(report.audio, true);
  assert.deepEqual(report.audioLevels, {
    peakDbfs: null,
    rmsDbfs: null,
    signal: "silent",
  });
});

test("Remotions echter Import hält Bildrate, Beschnitt und Tonspur fest", async (t) => {
  const work = join(ROOT, "work");
  await mkdir(work, { recursive: true });
  const directory = await mkdtemp(join(work, "doku-native-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = join(directory, "Bild und Ton.mp4");
  await run("ffmpeg", [
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "color=s=160x96:r=25:d=2",
    "-f",
    "lavfi",
    "-i",
    "sine=440:duration=2",
    "-shortest",
    "-c:v",
    "mpeg4",
    "-c:a",
    "aac",
    input,
  ]);
  await ingest(directory, {
    id: "aufnahme",
    input,
    source: "Testaufnahme",
    rights: "Eigen",
  });
  const cuts = join(directory, "cuts.json");
  await writeFile(
    cuts,
    JSON.stringify({
      title: "Native Schnittprobe",
      fps: 25,
      tracks: [
        {
          kind: "Video",
          name: "Bild",
          clips: [{ asset: "aufnahme", at: 0, in: 9, out: 34 }],
        },
        {
          kind: "Audio",
          name: "O-Ton",
          clips: [{ asset: "aufnahme", at: 5, in: 10, out: 30 }],
        },
      ],
    }),
  );
  const timeline = await exportTimeline(directory, cuts);
  const imported = await importTimeline(directory, timeline, {
    width: "160",
    height: "96",
  });
  const folder = dirname(imported.entry);
  const root = await readFile(join(folder, "Root.tsx"), "utf8");
  const sequence = await readFile(
    join(folder, "DokuSchnittComposition.tsx"),
    "utf8",
  );
  assert.match(root, /fps=\{25\}/);
  assert.match(root, /durationInFrames=\{25\}/);
  assert.match(sequence, /trimBefore=\{9\}/);
  assert.match(sequence, /<Audio[\s\S]+from=\{5\}[\s\S]+trimBefore=\{10\}/);
});
