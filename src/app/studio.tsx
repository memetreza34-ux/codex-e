import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import config from "../../studio.config.json";
import { sceneComponents } from "../remotion/registry";

type Brief = {
  id: string;
  title: string;
  topic: string;
  audience: string;
  duration: number;
  format: "16:9" | "9:16" | "1:1";
  style: string;
  compositionId: string | null;
};
type Report = {
  file: string;
  contactSheet: string;
  poster?: string;
  duration: number;
  size: number;
  video: { width: number; height: number };
  checkedAt: string;
  visualReview: string;
};
type Job = {
  id: string;
  compositionId: string;
  status: "rendering" | "done" | "failed";
  log: string;
  error: string | null;
  report: Report | null;
};
type Health = {
  ok: boolean;
  checks: { name: string; ok: boolean; detail: string; required: boolean }[];
};
const tabs = [
  ["studio", "Filmstudio"],
  ["briefs", "Briefings"],
  ["exports", "Exporte"],
  ["tools", "Werkzeugkasten"],
] as const;
const roles = [
  ["Recherche", "Prüft Aussagen und Quellen."],
  ["Story", "Formt eine verständliche Erklärung."],
  ["Regie", "Legt Bildsprache und Blickführung fest."],
  ["Motion", "Baut die Szene und ihre Bewegung."],
  ["Audio", "Verbindet Stimme, Timing und Klang."],
  ["Prüfung", "Prüft Bild, Aussage und Export."],
];
const time = (frame: number, fps = 30) =>
  `${Math.floor(frame / fps / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor((frame / fps) % 60)
    .toString()
    .padStart(2, "0")}`;
const blank: Brief = {
  id: "",
  title: "",
  topic: "",
  audience: "Neugierige Einsteiger",
  duration: 30,
  format: "16:9",
  style:
    "Zusammenhängende Szenen, klare Diagramme, Bewegung zeigt Ursache und Wirkung.",
  compositionId: null,
};
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || "Die Anfrage konnte nicht abgeschlossen werden.",
    );
  return data;
}
const post = (input: unknown) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(input),
});

export function App() {
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("studio"),
    [sceneId, setSceneId] = useState(config.scenes[0].id),
    [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [briefs, setBriefs] = useState<Brief[]>([]),
    [health, setHealth] = useState<Health | null>(null),
    [exports, setExports] = useState<Report[]>([]),
    [jobs, setJobs] = useState<Job[]>([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState<Brief>(blank),
    [editing, setEditing] = useState(false),
    [quality, setQuality] = useState<"preview" | "final">("preview");
  const player = useRef<PlayerRef>(null),
    scene = config.scenes.find((s) => s.id === sceneId)!,
    running = jobs.some((j) => j.status === "rendering");
  useEffect(() => {
    Promise.all([
      api<Brief[]>("/api/projects"),
      api<Health>("/api/status"),
      api<Report[]>("/api/exports"),
      api<Job[]>("/api/jobs"),
    ])
      .then(([b, h, e, j]) => {
        setBriefs(b);
        setHealth(h);
        setExports(e);
        setJobs(j);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (event: { detail: { frame: number } }) =>
      setFrame(event.detail.frame);
    const play = () => setPlaying(true),
      pause = () => setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("play", play);
    p.addEventListener("pause", pause);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("play", play);
      p.removeEventListener("pause", pause);
    };
  }, [sceneId, tab]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      Promise.all([api<Job[]>("/api/jobs"), api<Report[]>("/api/exports")])
        .then(([j, e]) => {
          setJobs(j);
          setExports(e);
          if (j[0]?.status === "done")
            setNotice(
              "Export fertig. Video und Prüfbilder stehen unter Exporte bereit.",
            );
          if (j[0]?.status === "failed") {
            setNotice("");
            setError(j[0].error || "Der Export ist fehlgeschlagen.");
          }
        })
        .catch((e) => setError(e.message));
    }, 1800);
    return () => clearInterval(timer);
  }, [running]);
  const changeScene = (id: string) => {
    setSceneId(id);
    setFrame(0);
    setPlaying(false);
  };
  async function render() {
    setError("");
    setBusy(true);
    try {
      const job = await api<Job>(
        "/api/render",
        post({ compositionId: sceneId, quality }),
      );
      setJobs((j) => [job, ...j]);
      setNotice("Der Export läuft. Du kannst hier weiterarbeiten.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function timeline() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ url: string }>("/api/editor", post({}));
      window.location.href = `${result.url}/${sceneId}`;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/projects/${form.id}` : "/api/projects";
      await api(url, { ...post(form), method });
      setBriefs(await api("/api/projects"));
      setEditing(true);
      setNotice(
        "Briefing gespeichert. Codex kann daraus die Szene entwickeln.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function newBrief() {
    setForm({ ...blank });
    setEditing(false);
    setTab("briefs");
    setNotice("");
    setError("");
  }
  function downloadBrief() {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `${form.id || "briefing"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="app-shell">
      <aside className="rail">
        <a className="brand" href="/" aria-label="Codex E Startseite">
          <span className="brand-mark">
            e<span>↗</span>
          </span>
          <span>
            codex e<small>ERKLÄRFILMSTUDIO</small>
          </span>
        </a>
        <div className="rail-caption">ARBEITSPLATZ</div>
        <nav aria-label="Hauptnavigation">
          {tabs.map(([id, label], i) => (
            <button
              key={id}
              className={tab === id ? "nav-item selected" : "nav-item"}
              onClick={() => {
                setTab(id);
                setError("");
              }}
            >
              <span className="nav-icon">{["◫", "▤", "↗", "⌘"][i]}</span>
              {label}
              {id === "exports" && exports.length > 0 && (
                <span className="count">{exports.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="rail-footer">
          <span className={`status-dot ${health?.ok ? "ready" : ""}`} />
          <span>
            {health
              ? health.ok
                ? "Lokal bereit"
                : "Einrichtung prüfen"
              : "Umgebung prüfen …"}
          </span>
          <p>
            Deine Dateien bleiben in
            <br />
            diesem Projekt.
          </p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span className="breadcrumb">
            Arbeitsplatz <span>/</span> {tabs.find((t) => t[0] === tab)?.[1]}
          </span>
          <a
            className="repo-link"
            href="https://github.com/memetreza34-ux/codex-e"
            target="_blank"
            rel="noreferrer"
          >
            Repository ↗
          </a>
          <button className="button secondary" onClick={newBrief}>
            ＋ Neues Briefing
          </button>
        </header>
        {error && (
          <div className="message error" role="alert">
            {error}
            <button
              onClick={() => setError("")}
              aria-label="Fehlermeldung schließen"
            >
              ×
            </button>
          </div>
        )}
        {notice && (
          <div className="message notice" role="status">
            {notice}
            <button
              onClick={() => setNotice("")}
              aria-label="Hinweis schließen"
            >
              ×
            </button>
          </div>
        )}
        {tab === "studio" && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">VON DER IDEE ZUM VERSTEHEN</div>
                <h1>Zeig, wie es funktioniert.</h1>
                <p>Eine gute Szene erklärt durch das, was sich verändert.</p>
              </div>
              <div className="project-badge">
                <span className="status-dot ready" />
                Arbeitskopie <span className="mono">LOCAL</span>
              </div>
            </section>
            <div className="workspace">
              <section className="viewer-panel">
                <div className="panel-head">
                  <label htmlFor="scene">AKTUELLE SZENE</label>
                  <select
                    id="scene"
                    value={sceneId}
                    onChange={(e) => changeScene(e.target.value)}
                  >
                    {config.scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <span className="mono dim">
                    {scene.width} × {scene.height}
                  </span>
                </div>
                <div className="player-stage">
                  <Player
                    key={sceneId}
                    ref={player}
                    component={sceneComponents[sceneId]}
                    durationInFrames={scene.durationInFrames}
                    fps={scene.fps}
                    compositionWidth={scene.width}
                    compositionHeight={scene.height}
                    style={{ width: "100%" }}
                    controls={false}
                    loop
                    clickToPlay
                    showVolumeControls={false}
                  />
                </div>
                <div className="transport">
                  <button
                    className="play-button"
                    aria-label={
                      playing ? "Wiedergabe pausieren" : "Wiedergabe starten"
                    }
                    onClick={() => {
                      if (playing) player.current?.pause();
                      else player.current?.play();
                    }}
                  >
                    {playing ? "Ⅱ" : "▶"}
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Zum Anfang"
                    onClick={() => player.current?.seekTo(0)}
                  >
                    ↤
                  </button>
                  <span className="mono timecode">
                    {time(frame, scene.fps)}{" "}
                    <span>/ {time(scene.durationInFrames, scene.fps)}</span>
                  </span>
                  <input
                    aria-label="Abspielposition"
                    className="scrub"
                    type="range"
                    min={0}
                    max={scene.durationInFrames - 1}
                    value={frame}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      player.current?.seekTo(next);
                      setFrame(next);
                    }}
                  />
                  <span className="mono dim">{scene.fps} FPS</span>
                  <button
                    className="text-button"
                    onClick={timeline}
                    disabled={busy}
                  >
                    Timeline öffnen ↗
                  </button>
                </div>
                <div className="scene-strip">
                  <div className="strip-title">
                    <span>SZENENABLAUF</span>
                    <span className="mono dim">
                      {scene.beats.length} Schritte ·{" "}
                      {scene.durationInFrames / scene.fps} s
                    </span>
                  </div>
                  <div className="beats">
                    {scene.beats.map((beat, i) => (
                      <button
                        key={beat.from}
                        className={`beat ${frame >= beat.from && frame < beat.to ? "active" : ""}`}
                        style={{ flex: beat.to - beat.from }}
                        onClick={() => {
                          player.current?.seekTo(beat.from);
                          setFrame(beat.from);
                        }}
                      >
                        <span className="beat-line" />
                        <span className="mono">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <strong>{beat.label}</strong>
                        <small>{time(beat.from, scene.fps)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              <aside className="inspector">
                <div className="eyebrow">DIE SZENE</div>
                <h2>{scene.title}</h2>
                <p>{scene.subtitle}</p>
                <div className="tags">
                  {scene.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="separator" />
                <div className="eyebrow">EXPORT</div>
                <label className="field-label" htmlFor="quality">
                  Qualität
                </label>
                <select
                  id="quality"
                  className="full-select"
                  value={quality}
                  onChange={(e) =>
                    setQuality(e.target.value as "preview" | "final")
                  }
                >
                  <option value="preview">Vorschau · halbe Auflösung</option>
                  <option value="final">Final · volle Auflösung</option>
                </select>
                <p className="hint">
                  MP4 mit Ton, Prüfbilder und technischer Bericht.
                </p>
                <button
                  className="button primary full"
                  onClick={render}
                  disabled={busy || running}
                >
                  {running ? "Export läuft …" : "Video exportieren ↗"}
                </button>
                {jobs[0] && (
                  <div className={`job-mini ${jobs[0].status}`} role="status">
                    <span className="status-dot" />
                    {jobs[0].status === "rendering"
                      ? "Wird gerendert und geprüft"
                      : jobs[0].status === "done"
                        ? "Export fertig"
                        : "Export fehlgeschlagen"}
                    {jobs[0].status === "done" && (
                      <button
                        className="text-button"
                        onClick={() => setTab("exports")}
                      >
                        Ansehen →
                      </button>
                    )}
                    {jobs[0].error && <p>{jobs[0].error}</p>}
                  </div>
                )}
                <div className="separator" />
                <div className="eyebrow">ALS NÄCHSTES</div>
                <p className="next-copy">
                  Ein Thema festlegen. Eine Szene entwickeln. Erst dann den Film
                  ausbauen.
                </p>
                <button className="text-button" onClick={newBrief}>
                  Briefing anlegen →
                </button>
              </aside>
            </div>
            <section className="workflow">
              <div className="section-heading">
                <h2>Ein Studio. Sechs Perspektiven.</h2>
                <span>Rollen für die Zusammenarbeit mit Codex</span>
              </div>
              <div className="role-strip">
                {roles.map(([name, desc]) => (
                  <div key={name}>
                    <div className="role-symbol">{name.slice(0, 1)}</div>
                    <strong>{name}</strong>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === "briefs" && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">VOR DER ERSTEN SZENE</div>
                <h1>Was soll verständlich werden?</h1>
                <p>Ein konkretes Briefing gibt der Animation ihre Richtung.</p>
              </div>
            </section>
            <div className="brief-layout">
              <section className="brief-list">
                <h2>Deine Briefings</h2>
                {briefs.map((brief) => (
                  <button
                    key={brief.id}
                    className={`brief-item ${form.id === brief.id ? "active" : ""}`}
                    onClick={() => {
                      setForm(brief);
                      setEditing(true);
                      setNotice("");
                    }}
                  >
                    <strong>{brief.title}</strong>
                    <span>
                      {brief.duration} s · {brief.format}
                    </span>
                    <small>
                      {brief.compositionId
                        ? "Beispielszene vorhanden"
                        : "Bereit für Storyboard und Umsetzung"}
                    </small>
                  </button>
                ))}
                <button className="button secondary full" onClick={newBrief}>
                  ＋ Neues Briefing
                </button>
              </section>
              <form
                className="brief-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save();
                }}
              >
                <div className="panel-head">
                  <span>
                    {editing ? "BRIEFING BEARBEITEN" : "NEUES BRIEFING"}
                  </span>
                  <span className="mono dim">{form.id || "ENTWURF"}</span>
                </div>
                <div className="form-body">
                  <label>
                    Titel
                    <input
                      required
                      minLength={3}
                      maxLength={140}
                      value={form.title}
                      placeholder="Zum Beispiel: Warum lädt eine Webseite?"
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm((f) => ({
                          ...f,
                          title,
                          ...(!editing
                            ? {
                                id: title
                                  .toLowerCase()
                                  .normalize("NFD")
                                  .replace(/[\u0300-\u036f]/g, "")
                                  .replace(/ß/g, "ss")
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-|-$/g, "")
                                  .slice(0, 80),
                              }
                            : {}),
                        }));
                      }}
                    />
                  </label>
                  <label>
                    Was soll der Zuschauer danach verstehen?
                    <textarea
                      required
                      minLength={10}
                      maxLength={4000}
                      rows={4}
                      value={form.topic}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, topic: e.target.value }))
                      }
                      placeholder="Eine konkrete Frage und eine verständliche Antwort."
                    />
                  </label>
                  <label>
                    Für wen ist der Film?
                    <input
                      required
                      minLength={3}
                      maxLength={300}
                      value={form.audience}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, audience: e.target.value }))
                      }
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Länge in Sekunden
                      <input
                        required
                        type="number"
                        min={5}
                        max={600}
                        value={form.duration}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            duration: Number(e.target.value),
                          }))
                        }
                      />
                    </label>
                    <label>
                      Format
                      <select
                        value={form.format}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            format: e.target.value as Brief["format"],
                          }))
                        }
                      >
                        <option>16:9</option>
                        <option>9:16</option>
                        <option>1:1</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Bildsprache und Referenz
                    <textarea
                      required
                      minLength={3}
                      maxLength={700}
                      rows={3}
                      value={form.style}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, style: e.target.value }))
                      }
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      className="button primary"
                      disabled={busy || !form.id}
                    >
                      {busy ? "Speichern …" : "Briefing speichern"}
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={downloadBrief}
                    >
                      JSON herunterladen ↗
                    </button>
                  </div>
                  <p className="hint">
                    Speichert unter projects/{form.id || "projekt"}/brief.json.
                    Die Animation wird anschließend mit Codex entwickelt.
                  </p>
                </div>
              </form>
            </div>
          </>
        )}
        {tab === "exports" && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">AUS DEM STUDIO</div>
                <h1>Deine Exporte.</h1>
                <p>Fertige Videos mit Prüfbildern und technischen Daten.</p>
              </div>
            </section>
            {jobs.some(
              (j) => j.status === "rendering" || j.status === "failed",
            ) && (
              <div className="render-jobs">
                {jobs
                  .filter((j) => j.status !== "done")
                  .map((job) => (
                    <details key={job.id} className="job-detail">
                      <summary>
                        {job.compositionId} ·{" "}
                        {job.status === "rendering"
                          ? "Export läuft"
                          : "Fehlgeschlagen"}
                      </summary>
                      <pre>
                        {job.error ||
                          job.log
                            .replace(/\u001b\[[0-9;]*m/g, "")
                            .slice(-5000) ||
                          "Render wird vorbereitet …"}
                      </pre>
                    </details>
                  ))}
              </div>
            )}
            {exports.length === 0 ? (
              <div className="empty-state">
                <span>↗</span>
                <h2>Der erste Export wartet.</h2>
                <p>
                  Wähle im Filmstudio eine Szene und klicke auf „Video
                  exportieren“.
                </p>
                <button
                  className="button primary"
                  onClick={() => setTab("studio")}
                >
                  Zum Filmstudio
                </button>
              </div>
            ) : (
              <div className="exports-grid">
                {exports.map((item) => (
                  <article className="export-card" key={item.file}>
                    <video
                      controls
                      preload="metadata"
                      src={`/renders/${item.file}`}
                      poster={`/renders/${item.poster || item.contactSheet}`}
                    />
                    <div>
                      <h2>
                        {config.scenes.find((scene) =>
                          item.file.startsWith(scene.id + "-"),
                        )?.title || item.file}
                      </h2>
                      <p className="mono">
                        {item.video.width} × {item.video.height} ·{" "}
                        {item.duration.toFixed(1)} s ·{" "}
                        {(item.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      <p className="review-note">
                        Technisch geprüft · visuelle Abnahme offen
                      </p>
                      <div className="export-links">
                        <a href={`/renders/${item.file}`} download>
                          MP4 herunterladen ↗
                        </a>
                        <a
                          href={`/renders/${item.contactSheet}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Prüfbilder ↗
                        </a>
                        <a
                          href={`/renders/${item.file.replace(/\.mp4$/, ".qa.json")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Prüfbericht ↗
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
        {tab === "tools" && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">DIE GRUNDLAGE</div>
                <h1>Bereit zum Produzieren.</h1>
                <p>
                  Lokale Werkzeuge, wiederverwendbare Abläufe und spezialisierte
                  Rollen.
                </p>
              </div>
              <button
                className="button secondary"
                onClick={() =>
                  api<Health>("/api/status")
                    .then(setHealth)
                    .catch((e) => setError(e.message))
                }
              >
                Erneut prüfen ↻
              </button>
            </section>
            <div className="tool-grid">
              {health?.checks.map((check) => (
                <article className="tool-card" key={check.name}>
                  <span className={`status-dot ${check.ok ? "ready" : ""}`} />
                  <h2>{check.name}</h2>
                  <span className="tool-status">
                    {check.ok
                      ? "Bereit"
                      : check.required
                        ? "Einrichtung nötig"
                        : "Optional einrichten"}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <div className="tool-notes">
              <h2>Was im Repository steckt</h2>
              <p>
                Vier Studio-Skills für Regie, Storyboard, Gestaltung und
                Abnahme. Zwölf offizielle Remotion-Skills werden mit{" "}
                <code>npm run skills:sync</code> lokal installiert. Sechs
                Agenten-Rollen liegen unter <code>.codex/agents</code>.
              </p>
              <p>
                Bildgenerierung, Figma und Sprachdienste kannst du über deine
                verbundenen Codex-Tools nutzen. Das Studio ruft diese Dienste
                nicht selbst auf. Schnittstellen und Erweiterungen stehen in{" "}
                <code>docs/tools.md</code>.
              </p>
              <p>
                Für das nächste Projekt:{" "}
                <code>npm run project:new -- mein-film Mein Film</code>
              </p>
            </div>
          </>
        )}
        <footer className="bottom-note">
          <span>CODEX E · LOKALES ERKLÄRFILMSTUDIO</span>
          <span>Erst verständlich. Dann beeindruckend.</span>
        </footer>
      </main>
    </div>
  );
}
