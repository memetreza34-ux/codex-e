# Werkzeuge und Befehle

Remotion ist der primäre Produktionsweg. Die installierten Pakete und festen Versionen stehen in package.json und package-lock.json, Skill-Quellen in workspace.config.json. Dieser Arbeitsordner enthält keine zusätzliche Studio-Webseite.

## Lokaler Produktionsweg

| Aufgabe                     | Werkzeug / Ablage                                                             |
| --------------------------- | ----------------------------------------------------------------------------- |
| Animation und Schnitt       | Remotion, React und TypeScript unter src/remotion                             |
| Räumliche Objekte           | Three.js, React Three Fiber und @remotion/three                               |
| Detaillierte eigene Modelle | Blender-Quellen unter scripts/blender; lokale GLB-Dateien unter public/assets |
| Bilder und Medien           | Lokale Dateien unter public/assets; Herkunft in media/manifest.json           |
| Ton und technische Prüfung  | FFmpeg und FFprobe                                                            |
| Exporte und Sichtprüfung    | Lokale MP4s, Kontaktbögen und QA-Berichte unter renders/                      |

Node.js ab 22.13, Git, FFmpeg und FFprobe werden verwendet. Chrome wird lokal erkannt; alternativ REMOTION_BROWSER_EXECUTABLE setzen. Blender ist für neue Blender-Modelle erforderlich. Bereits vorhandene GLB-Dateien lassen sich ohne erneuten Blender-Export verwenden.

## Befehle

| Befehl                                                    | Ergebnis                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm ci`                                                  | Paketversionen installieren und lokale Demo-Ressourcen vorbereiten                        |
| `npm run skills:sync`                                     | Fehlende externe Skills aus festgelegten Commits installieren; bestehende Ordner erhalten |
| `npm run doctor`                                          | Grundwerkzeuge, installierte Skills und konfigurierte Rollen prüfen                       |
| `npm run project:new -- mein-film Mein Film`              | Projektbriefing anlegen                                                                   |
| `npm run render -- SzenenID`                              | MP4-Vorschau mit Prüfbildern und QA-Bericht                                               |
| `npm run render -- SzenenID --final`                      | Volle registrierte Auflösung exportieren                                                  |
| `node scripts/render-chunks.mjs SzenenID audio/datei.wav` | Export in 90-Frame-Abschnitten mit anschließend zusammenhängend hinzugefügtem Ton         |
| `npm run qa -- renders/datei.mp4`                         | Vorhandenen Export technisch prüfen und Prüfbilder erzeugen                               |
| `npm run audio:normalize -- quelle.wav ziel.wav`          | Audiodatei normalisieren                                                                  |
| `npm run media:import -- media/bootstrap.json`            | Dokumentierte externe Startassets importieren                                             |
| `npm run media:verify`                                    | Prüfsummen und Medienformate im Register prüfen                                           |
| `npm run media:credits`                                   | Quellenliste aus dem Register erzeugen                                                    |
| `npm run media:demo`                                      | Neunsekündige technische Medienstudie exportieren                                         |
| `npm run media:doctor`                                    | Lokale Medienwerkzeuge prüfen; Bericht nur unter work/provider-status.json speichern      |
| `npm run media:doctor -- --accounts`                      | Zusätzlich lesende CLI-Accountprüfungen ausführen; keine Generierung                      |
| `npm run media:setup`                                     | Festgelegte HeyGen-CLI mit SHA-256-Prüfung ausschließlich unter .tools installieren       |
| `npm run heygen -- --help`                                | Repo-lokale HeyGen-CLI aufrufen                                                           |
| `npm run preview`                                         | Bei Bedarf das vorhandene Remotion-Vorschauwerkzeug öffnen                                |
| `npm run check` / `npm test`                              | Code, Projektstruktur und Werkzeugtests prüfen                                            |

Die Bildqualität muss zusätzlich am tatsächlichen Export beurteilt werden. Ein erfolgreicher Typecheck, ein vorhandener Account oder ein technischer QA-Bericht belegen keinen gelungenen Film.

## Optionale Anbieter und Hostwerkzeuge

Die reproduzierbaren Anforderungen stehen in [toolkit/providers.json](../toolkit/providers.json). Diese Datei enthält keine aktuellen Login- oder Verbindungsbehauptungen. Der aktuelle lokale CLI-Prüfbericht liegt unter work/provider-status.json und bleibt Git-ignore.

- HeyGen kann über eine repo-lokale CLI und gegebenenfalls über ein verfügbares Host-Plugin eingesetzt werden. Ein Providerkonto und eine Anmeldung sind für Generierungsaufträge erforderlich. `npm run heygen -- auth login --oauth` ist eine optionale interaktive Anmeldung durch den Nutzer; media:setup führt sie nicht aus.
- Higgsfield ist ein optionaler zusätzlicher Medienanbieter. CLI-Einrichtung, Anmeldung und verfügbares Generierungsverfahren vor dem konkreten Einsatz prüfen. Das Repository installiert die CLI nicht global.
- Native Bildgenerierung, Sprachdienste, Adobe, Figma und andere Hostwerkzeuge müssen im aktiven Codex-Auftrag verfügbar sein. Eine lokale Node-CLI kann ihre Verfügbarkeit oder Plugin-Verbindung nicht feststellen.
- Die HyperFrames-Skills sind ergänzendes Wissen. skills:sync richtet keine HyperFrames-Laufzeit, kein Cloudkonto und keinen Bezahlplan ein.

Keine Zugangsdaten oder Login-Sitzungen ins Repository schreiben. Anbieter nur innerhalb des autorisierten Auftrags und mit geklärter Einrichtung/Kosten einsetzen. Die Status- und Einrichtungskommandos führen keine externen Generierungsjobs aus.

## Reproduzierbarkeit und bekannte Grenzen

Remotion-Pakete und Skill-Commits sind festgelegt. Zod ist bewusst auf 4.6.7 überschrieben, um GHSA-mrhx-c7xc-m3w5 zu beheben. Remotion erwartet derzeit 4.5.4 und kann eine Versionswarnung ausgeben. Bei Paketupdates die Abweichung erneut beurteilen; historische Exportnachweise stehen in [verification.md](verification.md).

Shared-Memory-Capture bleibt deaktiviert. Bei System-Chrome traten in früheren Prüfungen gekachelte Frames auf; der lokale macOS-Pfad verwendet deshalb einen Tab. Abschnittsweise Exporte und eine Sichtprüfung reduzieren das Risiko, beweisen aber keine abschließend geklärte Fehlerursache.

Historische Prüfungen vom 28. Oktober 2026 bestätigten Blender 5.2.2 LTS, HeyGen CLI v0.11.0 und Higgsfield CLI 0.1.40. Die damaligen CLI-Accountprüfungen meldeten Anmeldebedarf; externe Generierungen wurden nicht getestet. Das sind datierte Nachweise, kein aktueller Accountstatus. Ausführliche damalige Ergebnisse stehen in [verification.md](verification.md) und den jeweiligen Projektprüfungen.

## Weitere Anleitungen

- [Produktionsablauf](production.md)
- [Skills und Rollen](toolkit.md)
- [Praktische Medienintegration](hybrid-media.md)
- [Quellen und Lizenzen](../THIRD_PARTY.md)
- [Remotion Skills](https://www.remotion.dev/docs/ai/skills), [WebMCP](https://www.remotion.dev/docs/ai/webmcp), [Lizenz](https://www.remotion.dev/docs/license)
- [Zod-Sicherheitsmeldung](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)

## Referenzanalyse

[Referenzwerkstatt](reference-workshop.md): `reference:setup`, `reference:fetch`, `reference:analyze` und optional `reference:transcribe`. yt-dlp und PySceneDetect liegen versionsgebunden in einer lokalen Python-Umgebung; vorhandenes Whisper ist optional. Rohreferenzen, Transkripte und Analysebilder bleiben unter work/. Die Auswertung umfasst Kandidaten und Messwerte, keine automatische gestalterische oder gehörte Abnahme.

Alle Renderaufrufe delegieren an scripts/render.mjs. Neue Exporte besitzen eindeutige IDs statt einer festen ID-final.mp4; bestehende MP4 und Prüfbilder werden erhalten.
