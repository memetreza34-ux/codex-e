# Codex E · Arbeitsordner für Animationen

Hier arbeitet Codex an Erklärfilmen. Der Ordner enthält Skills, Agenten-Rollen, Werkzeuge, Vorlagen und wiederverwendbaren Videocode. Es gibt keine eigene Webseite oder Studio-App.

## Inhalt

- **33 Skills:** elf eigene Produktions-Skills, zwölf offizielle Remotion-Skills und zehn ergänzende Skills von Anthropic, HeyGen und Higgsfield.
- **Zehn Agenten-Rollen:** Recherche, Referenzanalyse, Storyboard, Gestaltung, Animation, Ton, Formatredaktion, Medienauswahl, Compositing und Qualitätsprüfung.
- **Werkzeuge:** Remotion, React, TypeScript, Three.js, FFmpeg/FFprobe sowie lokale Render- und Prüfskripte.
- **Wiederverwendbarer Code:** acht Beispielanimationen, offene Schriften und synthetischer Demo-Ton. Darunter eine plastische Afrika-Karte, eine Reise mit Miniaturen und eine eigenständige Popcorn-Makroszene.
- **Projektablage:** Briefings, Quellen, Storyboards und Abnahmen unter projects/.

## Verwendung

Diesen Ordner in Codex öffnen und die gewünschte Animation beschreiben. Codex arbeitet direkt an den Dateien und verwendet passende Skills und Rollen. Dafür ist keine zusätzliche Oberfläche nötig.

Bei einer frischen Kopie:

```sh
npm ci
npm run skills:sync
npm run doctor
```

Node.js ab 22.13, Git, FFmpeg und FFprobe werden verwendet. Auf macOS installiert `brew install ffmpeg` die beiden Medienwerkzeuge. System-Chrome wird erkannt. Das Basissystem braucht keine API-Schlüssel.

## Befehle für Codex

| Befehl                                           | Aufgabe                                                    |
| ------------------------------------------------ | ---------------------------------------------------------- |
| `npm run doctor`                                 | Werkzeuge und Skills prüfen                                |
| `npm run project:new -- mein-film Mein Film`     | Projektbriefing anlegen                                    |
| `npm run render -- WebsiteSzene`                 | MP4-Vorschau, Prüfbilder und Bericht erzeugen              |
| `npm run render -- WebsiteSzene --final`         | Video in voller Auflösung exportieren                      |
| `npm run render -- AfrikaStudie --final`         | 14 Sekunden lange 3D-Kartenszene im Hochformat exportieren |
| `npm run render -- AfrikaReise --final`          | 35 Sekunden mit Nil, Stadt und Ozeanwellen exportieren     |
| `npm run qa -- renders/datei.mp4`                | Vorhandenes Video technisch prüfen                         |
| `npm run audio:normalize -- quelle.wav ziel.wav` | Sprache normalisieren                                      |
| `npm run preview`                                | Bei Bedarf Remotions vorhandenes Vorschauwerkzeug öffnen   |
| `npm run check` / `npm test`                     | Code und Arbeitsordner prüfen                              |

`preview` ist ein optionales Werkzeug von Remotion. Es wird nicht automatisch gestartet.

## Ordner

```text
.agents/skills/          Wiederverwendbare Arbeitsabläufe
.codex/agents/           Zehn Agenten-Rollen
AGENTS.md               Anweisungen für Codex in diesem Ordner
scripts/                Render, QA, Ton, Einrichtung und Werkzeugprüfung
src/remotion/           Wiederverwendbarer Animationscode
workspace.config.json   Szenen, Formate, Kapitel und Skill-Quellversion
projects/               Briefings, Quellen, Storyboards und Abnahmen
public/                 Ressourcen für die Videoproduktion
renders/                Generierte Videos und Prüfbilder (Git-ignore)
docs/                   Produktionsablauf und Werkzeughinweise
```

[Produktionsablauf](docs/production.md) · [Werkzeuge](docs/tools.md) · [Quellen und Lizenzen](THIRD_PARTY.md)

## Ganze Videoformate

[Werkzeugsatz](docs/toolkit.md), [beobachtete Machart](references/timswissen/observations.md) und [eigener Formatleitfaden](references/timswissen/format-guide.md) verbinden die Skills mit einem durchgehenden Produktionsablauf. Ein vollständiger neuer Filmplan zum bisherigen Website-Thema liegt unter projects/website-format-pilot/.

## Fotos, Modelle und optionale Anbieter

Die [Medienwerkstatt](docs/hybrid-media.md) ergänzt echte Fotos, transparente Illustrationen, HDRI-Licht und eigene Blender-Modelle. `HybridAssets` ist eine neunsekündige technische Medienstudie. [Medienquellen](media/CREDITS.md) und Prüfsummen liegen im Repository.

`npm run media:verify` prüft Assets. `npm run media:setup` installiert eine festgelegte HeyGen-CLI ausschließlich unter `.tools/`. `npm run media:doctor -- --accounts` prüft Werkzeuge und Accountstatus ohne Generierung. HeyGen und Higgsfield erfordern hier noch eine Anmeldung; es wurden keine bezahlten Generierungen gestartet.

## 30-Sekunden-Beispiel: Schalttag

`Schalttag` verbindet plastischen Papierkalender, laufende Blender-Uhr, echtes NASA-Foto und schematischen Erdumlauf zu einer zusammenhängenden Erklärung. Quellen, Skript und Bildfolge stehen unter projects/leap-day/.

```sh
node scripts/generate-leap-audio.mjs
node scripts/render-chunks.mjs Schalttag audio/leap-day.wav
```

Die Szene enthält eigene synthetische Klänge, keine Sprecherstimme. Der abschnittsweise Export nutzt einen Chrome-Tab und fügt den vollständigen Ton anschließend ohne Abschnittsversatz hinzu. Exporte bleiben lokal unter renders/.

## Referenznähe verbessern

Die [Referenzwerkstatt](docs/reference-workshop.md) ergänzt lokale Schnittanalyse, Bildstichproben und optionale Whisper-Wortzeiten. [Gemessene Beobachtungen](references/timswissen/measured-study.md) halten fest, was tatsächlich betrachtet wurde. `look-development` und `audio-timing` verbinden diese Ergebnisse mit eigenen Materialien und der eigentlichen Sprecherfassung.

Alle Renderbefehle nutzen jetzt denselben Kern. Neue Exporte erhalten eindeutige Namen; bestehende Videos werden erhalten. Aktueller Host-/Accountstatus liegt nur unter work/provider-status.json, deklarative Anforderungen unter toolkit/providers.json.
