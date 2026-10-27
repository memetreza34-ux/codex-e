# Codex E · Arbeitsordner für Animationen

Hier arbeitet Codex an Erklärfilmen. Der Ordner enthält Skills, Agenten-Rollen, Werkzeuge, Vorlagen und wiederverwendbaren Videocode. Es gibt keine eigene Webseite oder Studio-App.

## Inhalt

- **16 Skills:** vier eigene Produktions-Skills und zwölf lokal installierbare offizielle Remotion-Skills.
- **Sechs Agenten-Rollen:** Recherche, Storyboard, Gestaltung, Animation, Ton und Qualitätsprüfung.
- **Werkzeuge:** Remotion, React, TypeScript, Three.js, FFmpeg/FFprobe sowie lokale Render- und Prüfskripte.
- **Wiederverwendbarer Code:** zwei Beispielanimationen, offene Schriften und synthetischer Demo-Ton.
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

| Befehl                                           | Aufgabe                                                  |
| ------------------------------------------------ | -------------------------------------------------------- |
| `npm run doctor`                                 | Werkzeuge und Skills prüfen                              |
| `npm run project:new -- mein-film Mein Film`     | Projektbriefing anlegen                                  |
| `npm run render -- WebsiteSzene`                 | MP4-Vorschau, Prüfbilder und Bericht erzeugen            |
| `npm run render -- WebsiteSzene --final`         | Video in voller Auflösung exportieren                    |
| `npm run qa -- renders/datei.mp4`                | Vorhandenes Video technisch prüfen                       |
| `npm run audio:normalize -- quelle.wav ziel.wav` | Sprache normalisieren                                    |
| `npm run preview`                                | Bei Bedarf Remotions vorhandenes Vorschauwerkzeug öffnen |
| `npm run check` / `npm test`                     | Code und Arbeitsordner prüfen                            |

`preview` ist ein optionales Werkzeug von Remotion. Es wird nicht automatisch gestartet.

## Ordner

```text
.agents/skills/          Wiederverwendbare Arbeitsabläufe
.codex/agents/           Sechs Agenten-Rollen
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
