import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, basename } from "node:path";
import { createServer as createViteServer } from "vite";
import {
  ROOT,
  config,
  projects,
  saveProject,
  renderSchema,
  slugSchema,
  originAllowed,
  within,
  byteRange,
} from "./core.mjs";
import { renderVideo, savedExports } from "./render.mjs";
import { doctor } from "./cli.mjs";
const port = Number(process.env.STUDIO_PORT || 3140),
  editorPort = port + 1;
const vite = await createViteServer({
  root: ROOT,
  server: { middlewareMode: true, ws: { port: port + 2, host: "127.0.0.1" } },
  appType: "spa",
});
const jobs = new Map();
let active = null,
  editor = null,
  openingEditor = null;
function json(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(value));
}
async function body(req) {
  if (!String(req.headers["content-type"] || "").startsWith("application/json"))
    throw Object.assign(new Error("JSON erforderlich."), { status: 415 });
  let text = "";
  for await (const part of req) {
    text += part;
    if (Buffer.byteLength(text) > 20000)
      throw Object.assign(new Error("Briefing zu groß."), { status: 413 });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("Ungültiges JSON."), { status: 400 });
  }
}
async function openEditor() {
  if (openingEditor) return openingEditor;
  openingEditor = (async () => {
    if (!editor) {
      editor = spawn(
        process.platform === "win32" ? "npm.cmd" : "npm",
        [
          "exec",
          "--",
          "remotion",
          "studio",
          "src/remotion/index.ts",
          `--port=${editorPort}`,
          "--no-open",
        ],
        { cwd: ROOT, stdio: "ignore", detached: process.platform !== "win32" },
      );
      editor.on("exit", () => {
        editor = null;
      });
      editor.on("error", () => {
        editor = null;
      });
    }
    for (let i = 0; i < 100; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${editorPort}`, {
          signal: AbortSignal.timeout(500),
        });
        if (response.ok) return `http://localhost:${editorPort}`;
      } catch {
        /* Wait for Remotion's local server. */
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(
      "Timeline startet noch. Erneut öffnen oder npm run studio ausführen.",
    );
  })().finally(() => {
    openingEditor = null;
  });
  return openingEditor;
}
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/renders/")
  ) {
    if (!originAllowed(req.headers.origin, req.headers.host, port))
      return json(res, 403, {
        error: "Nur lokale Studio-Anfragen sind erlaubt.",
      });
  }
  try {
    if (url.pathname === "/api/status" && req.method === "GET")
      return json(res, 200, { ...(await doctor()), scenes: config.scenes });
    if (url.pathname === "/api/projects" && req.method === "GET")
      return json(res, 200, await projects());
    if (url.pathname === "/api/projects" && req.method === "POST")
      return json(res, 201, await saveProject(await body(req)));
    if (url.pathname.startsWith("/api/projects/") && req.method === "PUT") {
      const id = slugSchema.parse(url.pathname.split("/").at(-1));
      const input = await body(req);
      if (input.id !== id)
        return json(res, 400, { error: "Projekt-ID stimmt nicht überein." });
      await stat(join(ROOT, "projects", id, "brief.json"));
      return json(res, 200, await saveProject(input, { overwrite: true }));
    }
    if (url.pathname === "/api/exports" && req.method === "GET")
      return json(res, 200, await savedExports());
    if (url.pathname === "/api/jobs" && req.method === "GET")
      return json(res, 200, [...jobs.values()].reverse());
    if (url.pathname === "/api/render" && req.method === "POST") {
      const input = renderSchema.parse(await body(req));
      if (active)
        return json(res, 409, {
          error: "Ein Export läuft bereits. Bitte warte auf dessen Abschluss.",
        });
      const id = Date.now().toString(36),
        job = {
          id,
          ...input,
          status: "rendering",
          createdAt: new Date().toISOString(),
          log: "",
          report: null,
          error: null,
        };
      jobs.set(id, job);
      active = id;
      renderVideo(input, {
        id,
        onData: (t) => {
          job.log = (job.log + t).slice(-12000);
        },
      })
        .then((report) => {
          job.report = report;
          job.status = "done";
        })
        .catch((error) => {
          job.status = "failed";
          job.error = error.message;
        })
        .finally(() => {
          active = null;
        });
      return json(res, 202, job);
    }
    if (url.pathname === "/api/editor" && req.method === "POST") {
      await body(req);
      return json(res, 200, { url: await openEditor() });
    }
    if (url.pathname.startsWith("/renders/") && req.method === "GET") {
      const name = decodeURIComponent(url.pathname.slice(9));
      if (
        name !== basename(name) ||
        !/^[-a-zA-Z0-9]+(?:\.qa)?\.(mp4|jpg|json)$/.test(name)
      )
        return json(res, 400, { error: "Ungültige Exportdatei." });
      const file = within(join(ROOT, "renders"), name),
        info = await stat(file);
      let range;
      try {
        range = byteRange(req.headers.range, info.size);
      } catch {
        res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
        res.end();
        return;
      }
      const headers = {
        "Content-Type": name.endsWith(".mp4")
          ? "video/mp4"
          : name.endsWith(".jpg")
            ? "image/jpeg"
            : "application/json",
        "Accept-Ranges": "bytes",
        "Content-Disposition": `inline; filename="${name}"`,
      };
      if (range) {
        res.writeHead(206, {
          ...headers,
          "Content-Length": range.end - range.start + 1,
          "Content-Range": `bytes ${range.start}-${range.end}/${info.size}`,
        });
        createReadStream(file, range).pipe(res);
      } else {
        res.writeHead(200, { ...headers, "Content-Length": info.size });
        createReadStream(file).pipe(res);
      }
      return;
    }
    if (url.pathname.startsWith("/api/"))
      return json(res, 404, { error: "Nicht gefunden." });
    vite.middlewares(req, res, () => {
      res.writeHead(404);
      res.end();
    });
  } catch (error) {
    const status =
      error.name === "ZodError"
        ? 400
        : error.code === "EEXIST"
          ? 409
          : error.code === "ENOENT"
            ? 404
            : error.status || 500;
    json(res, status, {
      error:
        status === 409
          ? "Dieses Projekt existiert bereits."
          : status === 400
            ? "Bitte überprüfe die Eingaben."
            : error.message,
    });
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Codex E Studio: http://localhost:${port}`),
);
async function close() {
  if (editor) {
    try {
      if (process.platform === "win32") editor.kill("SIGTERM");
      else process.kill(-editor.pid, "SIGTERM");
    } catch {
      /* The editor may already have exited. */
    }
  }
  await vite.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
