# Werkzeugsatz für vollständige Erklärfilme

## Tatsächlich vorhanden

- Zwölf offizielle Remotion-Skills, auf dem im workspace.config.json genannten Commit. Der abgefragte aktuelle Hauptzweig entsprach am 28. Oktober 2026 diesem bereits installierten Commit.
- Zehn installierte externe Skills: canvas-design von Anthropic sowie hyperframes, hyperframes-cli, hyperframes-registry und media-use von HeyGen; dazu heygen-video, heygen-avatar, heygen-translate sowie higgsfield-generate und higgsfield-faceless-video. Herkunft und feste Commits stehen unter extraSkillsSources in workspace.config.json. Die offiziellen Installer wurden mit den festen Commits verwendet.
- Neun eigene Produktions-Skills: die vier ursprünglichen plus reference-breakdown, shortform-dramaturgy, object-choreography, hybrid-media und blender-props. Insgesamt 31 lokale Skills.
- Zehn konfigurierte Rollen: sechs ursprüngliche plus reference_analyst, format_editor, asset_researcher und compositing_artist. Konfigurationen sind keine bereits laufenden zusätzlichen Agenten. Modell, Tools und Berechtigungen werden nicht erweitert.
- Ausführbare Werkzeuge am Host geprüft: Node.js, Python, FFmpeg/FFprobe, yt-dlp, Agent Reach und Higgsfield CLI. Ein vorhandener CLI-Pfad beweist weder Accountanmeldung noch Guthaben oder getestete Generierung. Manim wurde nicht als installierte Laufzeit gefunden.

## Zuständigkeit

| Schritt             | Skill / Rolle                                          | Konkretes Ergebnis                                                    |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| Machart verstehen   | reference-breakdown / reference_analyst                | Beobachtungen mit Zeitmarken, abgeleiteter Formatleitfaden            |
| Film entwickeln     | shortform-dramaturgy / story_designer                  | vollständiges Skript und Auflösung                                    |
| Bilder planen       | visual-storyboard, object-choreography / art_director  | Objektliste, Zustandswechsel und Übergänge                            |
| Stilbilder          | canvas-design, vorhandene Bildwerkzeuge                | eigene statische Entwürfe für Bildkomposition                         |
| Animieren           | Remotion-Skills, motion-design / motion_designer       | editierbare Szenen mit reproduzierbarem Timing                        |
| Ton                 | audio_director, tatsächlich verfügbare Medienwerkzeuge | echte Aufnahmen, Effektplan und geprüfte Mischung                     |
| Zusammenhang prüfen | format_editor                                          | konkrete redaktionelle Änderungen am ganzen Film                      |
| Abnehmen            | render-qa / quality_reviewer                           | tatsächliche Vorschau, Sichtprüfung und dokumentierte Einschränkungen |

## Grenzen und Installation

Remotion bleibt der vorhandene getestete Renderpfad. Die HyperFrames-Skills sind zusätzliches Wissen; eine HyperFrames-Laufzeit, ein Cloudkonto oder ein Bezahlplan wurden nicht eingerichtet oder als funktionsfähig ausgegeben. Es wurde keine eigene Webseite oder Bedienoberfläche gebaut.

npm run skills:sync installiert fehlende externe Skills mit festen Commits und erhält bestehende Ordner. Neue lokale Skills werden in einem neuen Codex-Turn mit diesem Arbeitsordner entdeckt. Sie lassen sich zuvor gezielt anhand ihrer SKILL.md verwenden. Fremde Skill-Bundles bleiben Git-ignore; es gelten die jeweiligen Lizenzen der Ursprungsrepositories.

Agent Reach meldet Version 1.6.0 als verfügbares Update gegenüber 1.5.0. Es wurde kein globales Update ausgeführt. Offizielle Anleitung: https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/update.md .

## Medienauswahl und Compositing

Die neuen Skills hybrid-media und blender-props verbinden den Formatleitfaden mit echten Fotos, Illustrationen und beweglichen Modellen. asset_researcher entscheidet über Qualität und Herkunft; compositing_artist stimmt Licht und Bildkomposition ab. Die Rollen sind konfiguriert, in diesem Auftrag aber nicht als zusätzliche Agenten gestartet worden.

Der [praktische Ablauf](hybrid-media.md) und das [Quellenregister](../media/CREDITS.md) enthalten die eingesetzten Medien. Blender baut ein eigenes animierbares GLB. HeyGen ist lokal installiert; HeyGen und Higgsfield melden Anmeldebedarf. Zusätzliche Skills wurden installiert, externe Generierungen nicht ausgeführt.
