import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  within,
  originAllowed,
  briefSchema,
  renderSchema,
  saveProject,
  byteRange,
} from "../scripts/core.mjs";
const brief = {
  id: "test-film",
  title: "Wie eine Webseite entsteht",
  topic: "Ein Klick schickt eine Anfrage zum Server.",
  audience: "Einsteiger",
  duration: 30,
  format: "16:9",
  style: "Klare animierte Diagramme",
  compositionId: null,
};
test("Projekte speichern dauerhaft und überschreiben keine bestehenden Entwürfe", async () => {
  const directory = await mkdtemp(join(tmpdir(), "studio-test-"));
  try {
    await saveProject(brief, { directory });
    assert.equal(
      JSON.parse(
        await readFile(join(directory, "test-film/brief.json"), "utf8"),
      ).title,
      brief.title,
    );
    await assert.rejects(
      saveProject({ ...brief, title: "Unerwartet ersetzt" }, { directory }),
      { code: "EEXIST" },
    );
    assert.equal(
      JSON.parse(
        await readFile(join(directory, "test-film/brief.json"), "utf8"),
      ).title,
      brief.title,
    );
    await saveProject(
      { ...brief, title: "Bewusst bearbeitet" },
      { directory, overwrite: true },
    );
    assert.equal(
      JSON.parse(
        await readFile(join(directory, "test-film/brief.json"), "utf8"),
      ).title,
      "Bewusst bearbeitet",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("Projekt- und Render-Eingaben lehnen Pfadtricks und fremde Szenen ab", () => {
  assert.equal(
    briefSchema.safeParse({ ...brief, id: "../secret" }).success,
    false,
  );
  assert.equal(briefSchema.safeParse({ ...brief, duration: 0 }).success, false);
  assert.equal(
    briefSchema.safeParse({ ...brief, format: "4:3" }).success,
    false,
  );
  assert.equal(
    renderSchema.safeParse({ compositionId: "WebsiteSzene; echo hi" }).success,
    false,
  );
  assert.equal(
    renderSchema.safeParse({ compositionId: "WebsiteSzene", quality: "final" })
      .success,
    true,
  );
});
test("Exportpfade bleiben im ausgewählten Verzeichnis", () => {
  assert.equal(
    within("/tmp/studio-output", "scene.mp4"),
    "/tmp/studio-output/scene.mp4",
  );
  assert.throws(() => within("/tmp/studio-output", "../outside.mp4"));
  assert.throws(() => within("/tmp/studio-output", "/etc/passwd"));
});
test("Lokale Schreibzugriffe akzeptieren keine fremden Webseiten oder Hosts", () => {
  assert.equal(
    originAllowed("http://localhost:3140", "localhost:3140", 3140),
    true,
  );
  assert.equal(originAllowed(undefined, "127.0.0.1:3140", 3140), true);
  assert.equal(
    originAllowed("https://example.com", "localhost:3140", 3140),
    false,
  );
  assert.equal(
    originAllowed("http://localhost:3140", "attacker.example:3140", 3140),
    false,
  );
  assert.equal(
    originAllowed("http://localhost:3141", "localhost:3140", 3140),
    false,
  );
});
test("Videoseeking liefert begrenzte und offene Byte-Bereiche", () => {
  assert.deepEqual(byteRange("bytes=100-199", 1000), { start: 100, end: 199 });
  assert.deepEqual(byteRange("bytes=900-", 1000), { start: 900, end: 999 });
  assert.deepEqual(byteRange("bytes=-100", 1000), { start: 900, end: 999 });
  assert.deepEqual(byteRange("bytes=900-1200", 1000), { start: 900, end: 999 });
  assert.throws(() => byteRange("bytes=1500-", 1000));
  assert.throws(() => byteRange("bytes=200-100", 1000));
  assert.throws(() => byteRange("bytes=0-1,4-5", 1000));
});
