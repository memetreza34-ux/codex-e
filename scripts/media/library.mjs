import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, join, relative, extname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
export const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const licenses = new Set([
  "public-domain",
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "project-owned",
  "permission-recorded",
]);
const kinds = new Set([
  "photograph",
  "illustration",
  "ai-generated",
  "model",
  "environment",
  "audio",
  "video",
]);
export function validateRecord(asset) {
  if (!slug.test(asset.id || "")) throw new Error("Asset-ID ungültig.");
  if (!kinds.has(asset.kind))
    throw new Error("Medientyp fehlt oder ist ungültig.");
  if (!licenses.has(asset.license))
    throw new Error("Nutzungsrecht muss ausdrücklich dokumentiert werden.");
  for (const field of ["title", "author", "sourcePage"])
    if (typeof asset[field] !== "string" || !asset[field].trim())
      throw new Error(`${field} fehlt.`);
  if (
    asset.kind === "ai-generated" &&
    (!asset.generation?.tool || !asset.generation?.prompt)
  )
    throw new Error("KI-Assets brauchen Werkzeug und Prompt.");
  if (asset.license === "public-domain" && !asset.rightsReason)
    throw new Error("Begründung für Public Domain fehlt.");
  if (asset.kind === "photograph" && asset.generation)
    throw new Error(
      "KI-generierte Bilder dürfen nicht als Fotografie eingeordnet werden.",
    );
  if (asset.kind === "ai-generated" && asset.license !== "project-owned")
    throw new Error(
      "KI-Asset braucht projektspezifische Herkunft statt fremder Fotolizenz.",
    );
  if (asset.license === "permission-recorded" && !asset.permissionNote)
    throw new Error("Erlaubnisnachweis fehlt.");
  if (asset.license.startsWith("CC") && !asset.licenseUrl)
    throw new Error("Lizenzlink fehlt.");
  return asset;
}
export function assetPath(path, root = ROOT) {
  const full = resolve(root, path),
    rel = relative(resolve(root, "public/assets"), full);
  if (!rel || rel.startsWith("..") || resolve(full) === resolve(root))
    throw new Error("Asset muss innerhalb public/assets liegen.");
  return full;
}
export async function loadManifest(root = ROOT) {
  try {
    return JSON.parse(
      await readFile(join(root, "media/manifest.json"), "utf8"),
    );
  } catch (e) {
    if (e.code === "ENOENT") return { version: 1, assets: [] };
    throw e;
  }
}
export async function registerAsset(record, root = ROOT) {
  validateRecord(record);
  const full = assetPath(record.path, root),
    bytes = await readFile(full),
    sha256 = createHash("sha256").update(bytes).digest("hex"),
    manifest = await loadManifest(root);
  const old = manifest.assets.find((a) => a.id === record.id);
  if (old) {
    if (old.sha256 !== sha256 || old.path !== record.path)
      throw new Error(`Asset ${record.id} ist bereits anders registriert.`);
    return old;
  }
  const saved = {
    ...record,
    sha256,
    bytes: bytes.length,
    registeredAt: new Date().toISOString(),
  };
  manifest.assets.push(saved);
  await mkdir(join(root, "media"), { recursive: true });
  await writeFile(
    join(root, "media/manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  return saved;
}
export async function importAssets(plan, root = ROOT) {
  const result = [];
  for (const entry of plan.assets) {
    validateRecord(entry);
    const full = assetPath(entry.path, root);
    try {
      await access(full);
      const saved = (await loadManifest(root)).assets.find(
        (a) => a.id === entry.id,
      );
      if (!saved)
        throw new Error(
          `Vorhandene Datei ist nicht registriert: ${entry.path}`,
        );
      const hash = createHash("sha256")
        .update(await readFile(full))
        .digest("hex");
      if (hash !== saved.sha256 || saved.path !== entry.path)
        throw new Error(
          `Lokale Änderung erhalten, Import abgebrochen: ${entry.id}`,
        );
      result.push(saved);
      continue;
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    const url = new URL(entry.downloadUrl);
    if (url.protocol !== "https:")
      throw new Error("Nur HTTPS-Medienquellen sind erlaubt.");
    const response = await fetch(url, {
      headers: { "User-Agent": "CodexE-AnimationStudio/1.0" },
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error(`${entry.id}: HTTP ${response.status}`);
    const buffers = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 64 * 1024 * 1024) throw new Error("Asset über 64 MB.");
      buffers.push(chunk);
    }
    const bytes = Buffer.concat(buffers);
    if (
      entry.expectedMd5 &&
      createHash("md5").update(bytes).digest("hex") !== entry.expectedMd5
    )
      throw new Error("Download-Prüfsumme stimmt nicht.");
    const extension = extname(full).toLowerCase();
    if (
      [".jpg", ".jpeg"].includes(extension) &&
      !(bytes[0] === 255 && bytes[1] === 216)
    )
      throw new Error("Quelle ist keine JPEG-Datei.");
    if (
      extension === ".png" &&
      bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
    )
      throw new Error("Quelle ist keine PNG-Datei.");
    if (
      extension === ".hdr" &&
      !bytes.subarray(0, 16).toString().startsWith("#?")
    )
      throw new Error("Quelle ist keine HDR-Datei.");
    if (
      ![
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".glb",
        ".hdr",
        ".exr",
        ".mp4",
        ".mov",
        ".wav",
        ".mp3",
        ".ogg",
      ].includes(extension)
    )
      throw new Error("Nicht unterstütztes Medienformat.");
    await mkdir(resolve(full, ".."), { recursive: true });
    await writeFile(full, bytes, { flag: "wx" });
    result.push(await registerAsset(entry, root));
  }
  return result;
}
export async function verifyAssets(root = ROOT) {
  const report = [];
  for (const item of (await loadManifest(root)).assets) {
    validateRecord(item);
    const file = assetPath(item.path, root),
      bytes = await readFile(file);
    if (createHash("sha256").update(bytes).digest("hex") !== item.sha256)
      throw new Error(`Asset verändert: ${item.id}`);
    let details = {};
    if (item.kind === "model") {
      if (
        bytes.toString("ascii", 0, 4) !== "glTF" ||
        bytes.readUInt32LE(4) !== 2 ||
        bytes.readUInt32LE(8) !== bytes.length
      )
        throw new Error(`Ungültiges GLB: ${item.id}`);
      const length = bytes.readUInt32LE(12);
      const json = JSON.parse(bytes.toString("utf8", 20, 20 + length));
      details = {
        nodes: json.nodes?.length || 0,
        meshes: json.meshes?.length || 0,
        materials: json.materials?.length || 0,
      };
    } else {
      const data = JSON.parse(
        execFileSync(
          "ffprobe",
          [
            "-v",
            "error",
            "-show_entries",
            "stream=codec_name,width,height,pix_fmt:format=duration",
            "-of",
            "json",
            file,
          ],
          { encoding: "utf8" },
        ),
      );
      const stream = data.streams?.[0] || {};
      if (
        ["photograph", "illustration", "ai-generated", "environment"].includes(
          item.kind,
        ) &&
        !(stream.width > 0 && stream.height > 0)
      )
        throw new Error(`Kein gültiges Bild: ${item.id}`);
      details = {
        ...stream,
        ...(data.format?.duration
          ? { duration: Number(data.format.duration) }
          : {}),
      };
    }
    report.push({
      id: item.id,
      kind: item.kind,
      license: item.license,
      checksum: "ok",
      ...details,
    });
  }
  return report;
}
export async function writeCredits(root = ROOT) {
  const lines = [
    "# Medienquellen",
    "",
    "Automatisch aus media/manifest.json erstellt. Neue Assets dort registrieren.",
    "",
  ];
  for (const a of (await loadManifest(root)).assets) {
    lines.push(
      `- **${a.title}** (${a.kind}) — ${a.author}. ${a.license}. [Quelle](${a.sourcePage})${a.licenseUrl ? ` · [Lizenz](${a.licenseUrl})` : ""}. Datei: ${a.path}. Änderungen: ${a.changes || "keine; lokaler Download"}.`,
    );
  }
  lines.push(
    "",
    "HDRI-Metadaten: Powered by Poly Haven — https://polyhaven.com .",
    "",
  );
  await mkdir(join(root, "media"), { recursive: true });
  await writeFile(join(root, "media/CREDITS.md"), lines.join("\n"));
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [cmd, arg] = process.argv.slice(2);
  try {
    if (cmd === "import") {
      if (!arg) throw new Error("Importplan fehlt.");
      console.log(
        (
          await importAssets(JSON.parse(await readFile(resolve(arg), "utf8")))
        ).map((a) => ({ id: a.id, path: a.path, license: a.license })),
      );
      await writeCredits();
    } else if (cmd === "verify") console.table(await verifyAssets());
    else if (cmd === "credits") await writeCredits();
    else
      throw new Error(
        "media:import -- PLAN.json, media:verify oder media:credits",
      );
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
