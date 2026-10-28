# Medienwerkstatt für kurze Wissensfilme

Ziel ist die im Referenzleitfaden beobachtete Machart: ruhige dunkle Bühne, große erkennbare Objekte, kurze Beschriftungen und sichtbare Veränderungen. Fotos, Illustrationen und Modelle werden passend zur Aussage kombiniert. Ein Avatar oder ein weiterer Dienst löst die Gestaltung nicht automatisch.

## Getesteter lokaler Weg

1. Briefing und vollständige Bildfolge mit reference-breakdown, shortform-dramaturgy und object-choreography entwickeln.
2. Mit hybrid-media / asset_researcher geeignete Medien auswählen und tatsächlich ansehen. Unruhige Foto-Kandidaten wurden hier aussortiert; Entscheidungen stehen in media/rejected-candidates.json.
3. Herkunft erfassen. `npm run media:import -- media/bootstrap.json` lädt die drei externen Startassets. Das eigene GLB entsteht mit `blender --background --python scripts/blender/make-clock.py`. Das generierte Modell ist bereits im Register und Repository enthalten.
4. `npm run media:verify` und `npm run media:credits` ausführen. Das Register kontrolliert Herkunft, Prüfsummen, Bild-Metadaten und GLB-Struktur. Vorhandene lokal veränderte Dateien werden beim Import erhalten; der Import bricht ab.
5. Mit MediaHero, ModelAsset und AssetEnvironment einbauen. Alle Bilder, Modelle und Lichtdaten werden lokal geladen. Die Wartebedingungen für GLB und HDRI müssen im äußeren React-Baustein vor ThreeCanvas erzeugt werden; Clock in HybridAssets zeigt das Muster. Ein erst innerhalb der verzögert gemounteten Canvas erzeugter delayRender kann für den ersten Frame zu spät kommen. onReady beendet die äußere Wartebedingung nach Laden und Zeichnen. Benannte Modellknoten lassen sich absolut pro Frame drehen. Für diesen Weg ist kein Cloudkonto erforderlich.
6. Repräsentative Frames und Export ansehen. Zeiger, Material, Freistellkanten, Lesbarkeit und Schnittfolge prüfen. `npm run media:demo` rendert die geprüfte Studie in drei 90-Frame-Abschnitten. `scripts/media/check-frame.mjs` erkennt ein fehlendes Uhrmotiv im Prüfbild und läuft auch in CI. HybridAssets zeigt nur die Medienintegration in neun Sekunden und enthält keinen Ton.

## Enthaltene Medien

| Medium                   | Zweck                                    | Herkunft / Rechte                        |
| ------------------------ | ---------------------------------------- | ---------------------------------------- |
| Echtes Apollo-17-Foto    | Reale Oberfläche und Bilddetails         | NASA, Public Domain mit Einzelbegründung |
| Freigestellte Uhr        | Lesbare Illustration mit Alpha           | Vijay Verma / 3dicons, CC0               |
| Studio Small 09          | Reflexionen und Modellbeleuchtung        | Sergej Majboroda / Poly Haven, CC0       |
| Eigene Studiouhr als GLB | Perspektivwechsel und animierbare Zeiger | Eigene Blender-Quelle, project-owned     |

Das NASA-Foto ist keine KI-Grafik. Die Uhrillustration ist kein Foto. Neue KI-Bilder werden getrennt als ai-generated mit Werkzeug und Prompt registriert. Vollständige Quellen und Dateihashes: [Register](../media/manifest.json), [Credits](../media/CREDITS.md). Für weitergehende Nutzung gelten die dokumentierten Rechte der jeweiligen Quelle.

## Optionale Anbieter

| Werkzeug                     | Stand dieser Erweiterung                              | Sinnvoller Einsatz                                          |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| Native Codex-Bildgenerierung | Hostwerkzeug verfügbar; hier keine neue Generierung   | Neue Bilder, Cutouts, Hintergründe und gezielte Bearbeitung |
| Blender 5.2.2 LTS            | Eigenes Modell erstellt, GLB und Vorschaubild geprüft | Spezifische Objekte, Materialien, bewegliche Teile          |
| HeyGen CLI v0.11.0           | Lokal installiert; Anmeldung erforderlich             | Optionale Präsenter, Avatare und Übersetzungen              |
| HeyGen-Plugin                | Anschluss vorgeschlagen; Verbindung unbestätigt       | Nutzung über verfügbare verbundene Hostwerkzeuge            |
| Higgsfield CLI 0.1.40        | Vorhanden; Anmeldung erforderlich                     | Zusätzliche generierte Clips, Bilder und Faceless-Verfahren |
| HyperFrames                  | Skills installiert; Laufzeit nicht eingerichtet       | Ergänzender Ansatz für passende spätere Projekte            |

Keine bezahlten Jobs gestartet. Keine Schlüssel oder Login-Sitzungen im Repository. Status: toolkit/provider-status.json. Ein erfolgreicher Accountstatus wäre noch kein getesteter Generierungsjob.

```sh
npm run media:setup
npm run media:doctor -- --accounts
npm run heygen -- --help
npm run heygen -- auth login --oauth
```

Der letzte Befehl ist eine optionale interaktive Anmeldung durch den Nutzer, kein Schritt von media:setup. Higgsfield meldet den erforderlichen Login über seine vorhandene CLI. Anbieter erst einsetzen, wenn Auftrag, Anmeldung und anfallende Kosten geklärt sind. Remotion bleibt der primäre Renderpfad.

## Quellen der Werkzeuge

- [HeyGen CLI](https://developers.heygen.com/cli) und [offizielle Skills](https://developers.heygen.com/skills/overview)
- [Higgsfield Skills](https://github.com/higgsfield-ai/skills)
- [Poly Haven Lizenz](https://polyhaven.com/license), [öffentliche API](https://github.com/Poly-Haven/Public-API)
- [NASA-Foto mit Rechtenachweis](https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg)
- [Uhrillustration mit Rechtenachweis](https://commons.wikimedia.org/wiki/File:Clock-front-color.png)

Importierte Skills werden auf feste Commits gebunden, lokal installiert und nicht erneut mitveröffentlicht. Eigene Skills und Rollen bleiben im Repository editierbar. Neue Skills werden in einem neuen Codex-Turn mit diesem Ordner entdeckt.
