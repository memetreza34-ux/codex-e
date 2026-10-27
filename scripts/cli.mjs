import { access, readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { ROOT, config, saveProject, slugSchema } from "./core.mjs";
import { run, renderVideo, qaMedia, browserPath } from "./render.mjs";
export async function doctor() {
  const checks = [];
  const [major, minor] = process.versions.node.split(".").map(Number);
  checks.push({
    name: "Node.js",
    ok: major > 22 || (major === 22 && minor >= 13),
    detail: process.versions.node,
    required: true,
  });
  for (const name of ["ffmpeg", "ffprobe", "git"]) {
    try {
      const result = await run(name, [
        name === "git" ? "--version" : "-version",
      ]);
      checks.push({
        name,
        ok: true,
        detail: result.split("\n")[0],
        required: true,
      });
    } catch {
      checks.push({
        name,
        ok: false,
        detail:
          name === "git"
            ? "Git installieren."
            : "FFmpeg installieren: brew install ffmpeg (macOS).",
        required: true,
      });
    }
  }
  const browser = browserPath();
  checks.push({
    name: "Chrome",
    ok: Boolean(browser),
    detail:
      browser ||
      "Remotion lädt bei Bedarf Chrome Headless Shell. System-Chrome oder REMOTION_BROWSER_EXECUTABLE empfohlen.",
    required: false,
  });
  let skills = 0;
  for (const name of config.skillsSource.names) {
    try {
      await access(join(ROOT, ".agents/skills", name, "SKILL.md"));
      skills++;
    } catch {
      /* Optional until skills:sync is run. */
    }
  }
  checks.push({
    name: "Remotion-Skills",
    ok: skills === 12,
    detail: `${skills}/12 lokal installiert; npm run skills:sync`,
    required: false,
  });
  const agents = (await readdir(join(ROOT, ".codex/agents"))).filter((f) =>
    f.endsWith(".toml"),
  );
  checks.push({
    name: "Studio-Agenten",
    ok: agents.length === 6,
    detail: `${agents.length} Projektrollen konfiguriert`,
    required: true,
  });
  return { ok: checks.filter((c) => c.required).every((c) => c.ok), checks };
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "doctor") {
    const result = await doctor();
    console.table(
      result.checks.map(({ name, ok, detail }) => ({
        Werkzeug: name,
        Status: ok ? "bereit" : "einrichten",
        Detail: detail,
      })),
    );
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (command === "render") {
    const report = await renderVideo(
      {
        compositionId: args[0] || config.scenes[0].id,
        quality: args.includes("--final") ? "final" : "preview",
      },
      { onData: (t) => process.stdout.write(t) },
    );
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (command === "qa") {
    if (!args[0]) throw new Error("npm run qa -- renders/datei.mp4");
    console.log(JSON.stringify(await qaMedia(resolve(args[0])), null, 2));
    return;
  }
  if (command === "new") {
    const id = slugSchema.parse(args[0]);
    const brief = {
      id,
      title: args.slice(1).join(" ") || id,
      topic: "Das Thema dieses Films wird im Briefing konkretisiert.",
      audience: "Neugierige Einsteiger",
      duration: 30,
      format: "16:9",
      style:
        "Klare, zusammenhängende Erkläranimation. Bewegung zeigt Ursache und Wirkung.",
      compositionId: null,
    };
    await saveProject(brief);
    console.log(`Briefing angelegt: projects/${id}/brief.json`);
    return;
  }
  if (command === "audio") {
    if (!args[0] || !args[1])
      throw new Error("npm run audio:normalize -- quelle.wav ziel.wav");
    if (resolve(args[0]) === resolve(args[1]))
      throw new Error("Quelle und Ziel müssen verschieden sein.");
    await run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-n",
      "-i",
      resolve(args[0]),
      "-af",
      "loudnorm=I=-16:TP=-1.5:LRA=9",
      "-ar",
      "48000",
      resolve(args[1]),
    ]);
    console.log("Audio normalisiert.");
    return;
  }
  throw new Error(
    "Befehle: doctor, render [ID] [--final], qa DATEI, new SLUG TITEL, audio QUELLE ZIEL",
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)
)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
