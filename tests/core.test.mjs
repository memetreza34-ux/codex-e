import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { briefSchema, renderSchema, saveProject } from "../scripts/core.mjs";
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
