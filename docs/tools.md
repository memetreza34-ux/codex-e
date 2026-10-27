# Werkzeuge und Erweiterungen

| Aufgabe                        | Im Basissystem                                  | Verwendung                                                                  |
| ------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------- |
| Szene und Animation            | Remotion, React, TypeScript                     | Framebasierte Komponenten, Vorschau und Export                              |
| Live-Vorschau                  | Remotion Player                                 | Direkt im lokalen Arbeitsplatz                                              |
| Timeline                       | Remotion Studio                                 | Button „Timeline öffnen“ oder `npm run studio`                              |
| 3D                             | Three.js, React Three Fiber, @remotion/three    | Eigene räumliche Modelle und Diagramme; bei Bedarf eine 3D-Szene hinzufügen |
| Schnitt und Ton                | FFmpeg / FFprobe                                | Normalisierung, Metadaten, Kontaktbögen                                     |
| Quellen und Versionsverwaltung | Browser/Websuche im Codex-Host, Git             | Projektspezifische sources.md, nachvollziehbare Änderungen                  |
| Skills                         | 4 Studio-Skills + 12 offizielle Remotion-Skills | Automatische Auswahl im Repository oder gezielter Aufruf                    |
| Agenten                        | 6 Projektrollen                                 | Recherche, Story, Regie, Motion, Audio, Prüfung                             |

## Optionale Dienste

Bildgenerierung, Figma, Adobe, Sprachdienste und Online-Recherche hängen von den verbundenen Tools des jeweiligen Codex-Hosts ab. Dieses Repository kann keine Account-Verbindungen oder Plattform-Berechtigungen mitliefern. Prüfe die tatsächlich angebotenen Tools, bevor du ihre Verwendung versprichst. Zugangsdaten gehören in die lokale Umgebung, niemals ins Repository. Es gibt absichtlich keine vorgetäuschte „KI generieren“-Schaltfläche.

- **Bildgenerierung:** Für eigene Illustrationen und Texturen. Freigegebene Ausgaben nach `public/assets/<projekt>/` kopieren und Herkunft dokumentieren.
- **Figma:** Wenn ein konkretes Design übernommen werden soll. Nur die tatsächlich verwendeten Elemente und erlaubten Assets importieren.
- **Stimme:** Vorhandene Sprachtools oder eigene Aufnahmen; die echten Dateien bilden die Grundlage für das Timing. Der lokale Export benötigt keinen Sprachdienst.
- **Manim:** Eine mögliche spätere Erweiterung für anspruchsvolle Mathematik. Nicht Bestandteil der installierten Basis und nicht als eingerichtet ausgewiesen. Gerenderte Manim-Clips können als Videodateien in Remotion integriert werden.
- **HyperFrames:** Alternative für HTML-basierte Produktionen, keine Voraussetzung für dieses Remotion-Studio. Eine zusätzliche Laufzeit erst für ein konkretes Projekt ergänzen.

## Chrome

Auf macOS wird vorhandenes Google Chrome bevorzugt. Alternativ `REMOTION_BROWSER_EXECUTABLE` im Start-Terminal setzen. Ohne System-Chrome kann Remotion seine Headless-Shell herunterladen. Bei Darstellungsproblemen `npm run doctor` und Kontaktbogen prüfen. Shared-Memory-Capture bleibt deaktiviert, weil es hier bei System-Chrome bereits zu gekachelten Frames geführt hat.

## Remotion im Browser steuern

Die gestartete Remotion-Timeline bietet in einem kompatiblen Browser WebMCP-Werkzeuge an. Im lokalen Test waren unter anderem Kompositionen auflisten, Frame suchen, Wiedergabe starten/pausieren, Fehler und Canvas lesen sowie Hilfslinien verfügbar. Sie werden durch Remotion bereitgestellt und brauchen keinen zusätzlichen alten Remotion-MCP-Server. Die konkrete Werkzeugliste hängt von Studio-Version und Browser-Host ab; nicht als überall verfügbare Account-Verbindung behandeln.

Dokumentation: https://www.remotion.dev/docs/ai/webmcp

## Quellen der Einrichtung

- Codex-Projekt-Skills: https://learn.chatgpt.com/docs/build-skills
- Codex-Agenten: https://learn.chatgpt.com/docs/agent-configuration/subagents
- Offizielle Remotion-Skills: https://www.remotion.dev/docs/ai/skills
- Remotion Player: https://www.remotion.dev/docs/player
- Remotion-Lizenz: https://www.remotion.dev/docs/license

Die Version der offiziellen Skills ist in `studio.config.json` auf einen Git-Commit festgelegt. `npm run skills:sync` installiert fehlende Skills und überschreibt keine lokalen Änderungen. Die unveränderten Fremd-Skills werden nicht erneut im Git-Repository veröffentlicht.

## Abhängigkeiten

Alle Remotion-Pakete sind auf 4.0.539 festgelegt. Zod ist bewusst auf 4.6.7 überschrieben, um GHSA-mrhx-c7xc-m3w5 zu beheben. Remotion erwartet derzeit exakt 4.5.4 und kann deshalb eine Versionswarnung ausgeben. Die im Studio verwendete Eingabevalidierung und der reale Demo-Export wurden mit der gepatchten Version geprüft; bei künftigen Remotion-Updates diese Abweichung erneut beurteilen. Quelle: https://github.com/advisories/GHSA-mrhx-c7xc-m3w5
