import { mkdir, realpath } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { ROOT, slugSchema } from "../core.mjs";
import { ingest, transcribe } from "./media.mjs";
import { exportTimeline } from "./timeline.mjs";
import { renderEvidence, renderTimeline } from "./preview.mjs";

const commands = {
  ingest: { source: { type: "string" }, rights: { type: "string" } },
  transcribe: { model: { type: "string" } },
  timeline: { output: { type: "string" } },
  preview: {
    "media-dir": { type: "string" },
    width: { type: "string" },
    height: { type: "string" },
    fps: { type: "string" },
    final: { type: "boolean" },
  },
  evidence: {},
};

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!Object.hasOwn(commands, command))
    throw new Error(
      "npm run doku -- ingest | transcribe | timeline | preview | evidence (siehe docs/documentary.md)",
    );
  const { values, positionals } = parseArgs({
    args,
    options: commands[command],
    allowPositionals: true,
  });
  const [projectInput, input, asset] = positionals;
  const project = slugSchema.parse(projectInput);
  if (!input || positionals.length !== (command === "ingest" ? 3 : 2)) {
    throw new Error(
      "Projekt und Eingabe angeben. Bei ingest zusätzlich eine Medien-ID angeben.",
    );
  }
  const directory = join(ROOT, "work", "doku", project);
  await mkdir(directory, { recursive: true });
  if ((await realpath(directory)) !== resolve(directory))
    throw new Error("Der Doku-Arbeitsordner darf keine Verknüpfung sein.");
  const progress = (value) => process.stderr.write(value);
  let result;
  switch (command) {
    case "ingest":
      if (!values.source?.trim() || !values.rights?.trim())
        throw new Error(
          "Mit --source und --rights Quelle und Nutzungsrecht angeben.",
        );
      result = await ingest(directory, {
        id: asset,
        input,
        source: values.source,
        rights: values.rights,
      });
      break;
    case "transcribe": {
      const model = values.model ?? process.env.DOKU_WHISPER_MODEL;
      if (!model)
        throw new Error(
          "Mit --model den Pfad zu einem mehrsprachigen GGML-Modell angeben.",
        );
      result = {
        transcript: await transcribe(directory, input, model, progress),
      };
      break;
    }
    case "timeline":
      result = {
        timeline: await exportTimeline(
          directory,
          resolve(input),
          values.output && resolve(values.output),
        ),
      };
      break;
    case "preview":
      result = await renderTimeline(
        directory,
        input,
        { ...values, project },
        progress,
      );
      break;
    case "evidence":
      result = { output: await renderEvidence(input, project, progress) };
      break;
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
