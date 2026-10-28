import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assetPath,
  validateRecord,
  registerAsset,
  importAssets,
  verifyAssets,
} from "../scripts/media/library.mjs";
const asset = {
  id: "test-image",
  title: "Test",
  kind: "illustration",
  path: "public/assets/test.png",
  author: "Test author",
  sourcePage: "https://example.org/source",
  license: "CC0-1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};

test("Medienregister verhindert falsche Foto-Herkunft und unbelegte Rechte", () => {
  assert.throws(
    () =>
      validateRecord({
        ...asset,
        kind: "photograph",
        generation: { tool: "test", prompt: "image" },
      }),
    /Fotografie/,
  );
  assert.throws(
    () => validateRecord({ ...asset, kind: "ai-generated" }),
    /Werkzeug und Prompt/,
  );
  assert.throws(
    () => validateRecord({ ...asset, license: "unknown" }),
    /Nutzungsrecht/,
  );
  assert.throws(
    () => validateRecord({ ...asset, license: "public-domain" }),
    /Begründung/,
  );
  assert.throws(
    () => validateRecord({ ...asset, licenseUrl: undefined }),
    /Lizenzlink/,
  );
});

test("Import erhält lokale Bearbeitungen und meldet veränderte Medien", async () => {
  const root = await mkdtemp(join(tmpdir(), "codex-e-media-"));
  try {
    await mkdir(join(root, "public/assets"), { recursive: true });
    const file = assetPath(asset.path, root);
    await writeFile(file, "original");
    await registerAsset(asset, root);
    await writeFile(file, "lokale Bearbeitung");
    await assert.rejects(
      importAssets(
        {
          assets: [
            { ...asset, downloadUrl: "https://example.org/replacement.png" },
          ],
        },
        root,
      ),
      /Lokale Änderung/,
    );
    await assert.rejects(registerAsset(asset, root), /bereits anders/);
    await assert.rejects(verifyAssets(root), /Asset verändert/);
    assert.equal(await readFile(file, "utf8"), "lokale Bearbeitung");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Medienpfade bleiben im Asset-Ordner", () => {
  for (const path of [
    "../secret.png",
    "public/assets/../../secret.png",
    "/etc/passwd",
    "public/assets-other/test.png",
  ])
    assert.throws(() => assetPath(path, "/tmp/fixture"), /innerhalb/);
  assert.equal(
    assetPath(asset.path, "/tmp/fixture"),
    "/tmp/fixture/public/assets/test.png",
  );
});
