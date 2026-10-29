# Skills und Rollen

Die folgende Zuordnung verbindet konkrete Produktionsaufgaben mit den vorhandenen Arbeitsanleitungen. Installationsbefehle, Werkzeuge und Anbieteranforderungen stehen zentral in [tools.md](tools.md). workspace.config.json führt die festgelegten Quellen und konfigurierten Rollen.

| Aufgabe                 | Skill / Rolle                                             | Erwartetes Ergebnis                                                                      |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Referenz verstehen      | reference-breakdown / reference_analyst                   | Tatsächlich beobachtete Einstellungen mit Zeitmarken; Beobachtung und Vermutung getrennt |
| Film entwickeln         | explainer-director, shortform-dramaturgy / story_designer | Durchgehendes Skript mit Frage, sichtbarer Erklärung und Auflösung                       |
| Bildfolge planen        | visual-storyboard, object-choreography / art_director     | Passende Objekte, Zustandswechsel und Übergänge                                          |
| Stilbilder entwickeln   | canvas-design und verfügbare Bildwerkzeuge / art_director | Eigene Entwürfe für Komposition und Bildsprache                                          |
| Medien auswählen        | hybrid-media / asset_researcher                           | Visuell geprüfte Foto-, Illustrations- oder Modellwahl mit belegter Herkunft             |
| Objekte bauen           | blender-props / motion_designer                           | Editierbares Modell mit Materialien und benannten beweglichen Teilen                     |
| Medien zusammenführen   | hybrid-media / compositing_artist                         | Konsistente Perspektive, Licht, Schatten und Freistellkanten                             |
| Animieren               | motion-design und Remotion-Skills / motion_designer       | Framebasierte Bewegung und reproduzierbarer Schnitt                                      |
| Ton entwickeln          | audio_director und tatsächlich verfügbare Medienwerkzeuge | Zum Bild passender Ton und dokumentierte Mischung                                        |
| Filmzusammenhang prüfen | format_editor                                             | Konkrete redaktionelle Änderungen am gesamten Ablauf                                     |
| Abnehmen                | render-qa / quality_reviewer                              | Tatsächlicher Export, Sichtprüfung und gegebenenfalls gehörte Tonprüfung                 |

## Ergänzende Skill-Bundles

Die importierten Anleitungen ergänzen den vorhandenen Produktionsweg:

- Die offiziellen Remotion-Skills behandeln Umsetzung, Medien, Vorschau und Export im vorhandenen Stack.
- Anthropic canvas-design unterstützt eigene statische Bildkompositionen.
- HyperFrames und media-use behandeln einen ergänzenden HTML-Video-Ansatz und dessen Medienarbeit.
- Die HeyGen-Skills behandeln optionale Präsenter, Avatare und Übersetzungen.
- Die Higgsfield-Skills behandeln zusätzliche Mediengenerierung und Faceless-Verfahren.

Die Toolwahl folgt der konkreten Bildaufgabe. Ein Präsenter ersetzt keine Objektanimation; ein installierter Skill belegt weder eine Laufzeitinstallation noch eine Accountverbindung. Quellen, feste Commits und Importumfang stehen ausschließlich in workspace.config.json; die jeweiligen Upstream-Lizenzen gelten.

## Einsatz der Rollen

Dateien unter .codex/agents beschreiben spezialisierte Rollen. Sie sind keine automatisch laufenden Prozesse und erweitern keine Modell-, Tool- oder Accountberechtigungen. Delegation folgt dem autorisierten Auftrag und den aktiven Sitzungsregeln. Klare Zuständigkeiten und getrennte Dateien verhindern gegenseitiges Überschreiben.

Eigene Abläufe liegen unter .agents/skills. Neue lokale Skills werden bei entsprechender Workspace-Erkennung in einem neuen Codex-Turn entdeckt; sie können vorher anhand ihrer SKILL.md gezielt verwendet werden. Fremde Bundles bleiben Git-ignore und lassen sich über den dokumentierten Sync wiederherstellen.

## Ergänzende Qualitätsarbeit

- look-development / art_director, compositing_artist: eigene Stilbilder und kurzer Bewegungstest anhand der Referenz.
- audio-timing / audio_director: eigene Sprecherfassung mit sichtbaren Aktionen verbinden.
