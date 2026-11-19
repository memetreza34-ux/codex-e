# Codex E: fokussierte Skills und Rollen

## Neue Dokus: kurze Werkzeugauswahl

| Produktionsschritt | Skill | Agentenrolle | Pflichtausgabe |
| --- | --- | --- | --- |
| Fakten und Quellen | documentary-research | researcher | Verifizierbare Claim-Matrix |
| Dramaturgie und Skript | documentary-story | story_designer | Eigenständiges, belegtes Skript |
| Archiv-/Stockmedien und Rechte | documentary-rights | asset_researcher | Nachvollziehbares Assetregister |
| Animation und Schnitt | motion-design / Remotion Best Practices | motion_designer | Tatsächliche Szene und Preview |
| Voice und Timing | audio-timing | audio_director | Tatsächliche Audiodatei, Wortzeiten |
| Endabnahme | render-qa | quality_reviewer | Vollfilm-Review mit Timecodes |

Codex bleibt der einzige Hauptagent. Rollen nur bei fachlichem Bedarf delegieren. Kein weiterer Agenten- oder KI-Abo-Dienst ist Voraussetzung.

## Installation und Grenzen
- Eigene Skills liegen versioniert im Repository unter .agents/skills.
- Optionaler Befehl npm run skills:sync importiert fünf festgelegte Remotion-Skills aus einem gepinnten GitHub-Commit, nur wenn noch nicht installiert.
- HeyGen, Higgsfield, HyperFrames und Canvas werden nicht mehr automatisch als Skills importiert.
- Remotion, FFmpeg und Blender sind lokale Programme, keine notwendigen MCP-Server.
- Google Flow ist kein verbindlich angebundener MCP und keine Grundvoraussetzung.

## Ausdrücklich nicht mehr für neue Dokus nutzen
- Kurzvideo-Skill shortform-dramaturgy (entfernt).
- Alte Referenzrollen art_director, compositing_artist, format_editor und reference_analyst (entfernt).
- Historische 9:16-Testkompositionen als Produktionsvorlage.

Das ausführliche Produktionsverfahren steht in documentary-runbook.md. Historische Skill- und Providerstudien stehen weiterhin in verification.md und hybrid-media.md, sind aber nicht mehr die operative Hauptanweisung.
