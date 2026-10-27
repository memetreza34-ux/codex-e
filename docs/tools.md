# Werkzeuge im Arbeitsordner

| Aufgabe                   | Werkzeug / Ablage                                                  |
| ------------------------- | ------------------------------------------------------------------ |
| 2D-Animation und Video    | Remotion, React, TypeScript unter src/remotion                     |
| Räumliche Modelle         | Three.js, React Three Fiber und @remotion/three                    |
| Rendern                   | npm run render -- SzenenID, zusätzlich --final für volle Auflösung |
| Technische Prüfung        | FFprobe, Kontaktbögen und QA-Bericht über npm run qa               |
| Ton                       | FFmpeg und npm run audio:normalize                                 |
| Wiederverwendbare Abläufe | Vier eigene Skills unter .agents/skills                            |
| Remotion-Wissen           | Zwölf offizielle Skills, npm run skills:sync                       |
| Spezialrollen             | Sechs Projektagenten unter .codex/agents                           |
| Einrichtung prüfen        | npm run doctor                                                     |
| Vorschau bei Bedarf       | Remotions vorhandenes Werkzeug, npm run preview                    |

## Verbundene Dienste

Bildgenerierung, Figma, Adobe, Sprachdienste und Online-Recherche werden über die tatsächlich verfügbaren Tools des Codex-Hosts genutzt. Account-Verbindungen lassen sich nicht als Ordnerdatei mitliefern. Keine Verfügbarkeit behaupten, ohne die Tools zu prüfen. Zugangsdaten werden nicht im Repository gespeichert.

Neue Illustrationen, Tondateien oder Modelle nach public/assets/<projekt>/ ablegen und Herkunft sowie Nutzungsrechte dokumentieren. Für mathematische Spezialanimationen ist Manim eine mögliche Erweiterung; es ist nicht als installiert ausgewiesen. HyperFrames ist eine mögliche Alternative für konkrete Projekte und keine Voraussetzung dieses Arbeitsordners.

## Reproduzierbarkeit

Alle Remotion-Pakete sind auf 4.0.539 festgelegt. Die offiziellen Skills sind auf Git-Commit 30d4553ecd46fbc5212fd0ff006ae43af522158b fixiert. skills:sync installiert fehlende Ordner und überschreibt keine lokalen Änderungen. Die Fremd-Skills werden nicht im Repository erneut veröffentlicht.

Zod ist bewusst auf 4.6.7 überschrieben, um GHSA-mrhx-c7xc-m3w5 zu beheben. Remotion erwartet derzeit exakt 4.5.4 und kann deshalb eine Versionswarnung ausgeben. Eingabevalidierung und reale Exporte wurden mit der gepatchten Version geprüft. Bei Remotion-Updates die Abweichung erneut beurteilen.

Chrome wird lokal erkannt. Alternativ REMOTION_BROWSER_EXECUTABLE setzen. Shared-Memory-Capture bleibt deaktiviert, da hier bei System-Chrome bereits gekachelte Frames aufgetreten sind.

Wenn Remotions Vorschau geöffnet wird, stehen in einem passenden Browser dessen WebMCP-Werkzeuge zum Lesen und Steuern der Timeline bereit. Es wird dafür kein eigener Dienst eingerichtet.

## Quellen

- https://learn.chatgpt.com/docs/build-skills
- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://www.remotion.dev/docs/ai/skills
- https://www.remotion.dev/docs/ai/webmcp
- https://www.remotion.dev/docs/license
- https://github.com/advisories/GHSA-mrhx-c7xc-m3w5
