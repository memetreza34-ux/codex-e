import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createRenderPlan,
  remotionRenderArgs,
  muxRenderArgs,
  assertNewExport,
} from "../scripts/render.mjs";
const input = { compositionId: "Schalttag", quality: "final" };
const options = { id: "test", browser: "/test/chrome", platform: "darwin" };

test("Langer Film wird ohne Lücken, Doppelbilder oder Überhang geplant", () => {
  const plan = createRenderPlan(input, options);
  const frames = plan.chunks.flatMap(({ from, to }) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i),
  );
  assert.deepEqual(
    frames,
    Array.from({ length: 900 }, (_, i) => i),
  );
  assert.ok(plan.chunks.every(({ from, to }) => to - from < 90));
  assert.equal(plan.expected.duration, 30);
  const uneven = createRenderPlan(
    { compositionId: "AfrikaReise", quality: "final" },
    options,
  );
  assert.equal(uneven.chunks.at(-1).to, 1049);
  assert.equal(uneven.chunks.at(-1).to - uneven.chunks.at(-1).from + 1, 60);
});

test("Vorschau und Vollauflösung teilen dieselben stabilen Render-Einstellungen", () => {
  const preview = createRenderPlan({ compositionId: "Schalttag" }, options),
    final = createRenderPlan(input, options);
  assert.deepEqual(preview.expected, { width: 540, height: 960, duration: 30 });
  assert.deepEqual(final.expected, { width: 1080, height: 1920, duration: 30 });
  for (const plan of [preview, final]) {
    const args = remotionRenderArgs(plan, "/tmp/result.mp4", {
      chunk: plan.chunks[0],
    });
    assert.ok(args.includes("--concurrency=1"));
    assert.ok(args.includes("--gl=angle"));
    assert.ok(args.includes("--disable-shared-memory-capture"));
    assert.ok(args.includes("--muted"));
    assert.ok(args.includes("--frames=0-89"));
  }
  const args = remotionRenderArgs(final, "/tmp/audio.wav", { audioOnly: true });
  assert.ok(args.includes("--codec=wav"));
  assert.ok(!args.includes("--muted"));
  assert.ok(!args.some((arg) => arg.startsWith("--frames=")));
});

test("Fremde Szenen, Export-Pfadtricks und externe Audio-Pfade werden abgewiesen", () => {
  assert.throws(() => createRenderPlan({ compositionId: "unknown" }, options));
  assert.throws(
    () => createRenderPlan(input, { ...options, id: "../secret" }),
    /Export-ID/,
  );
  for (const audio of [
    "../private.wav",
    "/etc/passwd",
    "audio/../../private.wav",
    "audio-other/test.wav",
  ])
    assert.throws(
      () => createRenderPlan(input, { ...options, audio }),
      /public\/audio/,
    );
  assert.equal(
    createRenderPlan(input, { ...options, audio: "audio/leap-day.wav" })
      .audioMode,
    "external",
  );
  assert.equal(
    createRenderPlan(input, { ...options, audio: null }).audioMode,
    "silent",
  );
});

test("Ausgabe und Quellen bleiben beim Zusammenfügen geschützt", async () => {
  const root = await mkdtemp(join(tmpdir(), "codex-e-render-"));
  try {
    const file = join(root, "film.mp4");
    await writeFile(file, "existing video");
    await assert.rejects(assertNewExport(file), /bereits vorhanden/);
    assert.equal(await readFile(file, "utf8"), "existing video");
    const orphan = join(root, "other-poster.jpg");
    await writeFile(orphan, "existing review");
    await assert.rejects(
      assertNewExport(join(root, "other.mp4")),
      /bereits vorhanden/,
    );
    const plan = createRenderPlan(input, options),
      args = muxRenderArgs(plan, "parts.txt", "full.wav");
    assert.ok(args.includes("-n"));
    assert.ok(!args.includes("-y"));
    assert.equal(args[args.indexOf("-t") + 1], "30");
    assert.equal(args.filter((arg) => arg === "full.wav").length, 1);
    assert.ok(args.includes("apad"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
