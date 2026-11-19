# Codex E – Documentary Production

Codex-Arbeitsordner für eigenständige deutschsprachige YouTube-Dokumentationen. Ziel: 8–12 Minuten, 16:9, nachvollziehbare Recherche, saubere Medienrechte, hochwertige Motion Graphics und eine tatsächlich geprüfte fertige MP4. Keine Shorts-Fabrik, kein zusätzliches Dashboard und keine neuen kostenpflichtigen Abos.

## Schon vorhanden
- Remotion, React und Three.js mit funktionierenden Beispielkompositionen sowie FFmpeg-Kommandos und technischen Tests.
- Alte 9:16-Animationsstudien als Regressionstests und Ideenarchiv. Das sind ausdrücklich keine fertigen Langdokus.
- Der Nutzer hat weitere Repositories: doku-visual-agent (Bild-/B-Roll-Suche), Technik-Kanal (Render/Voice), Geschichte-Kanal (Story-/Quellen-Gates), Claud-Youtube (Artikel-/Audio-/Remotion-Experimente). Sie werden nicht automatisch übernommen oder verändert.

## Neue Doku-Struktur
- Sechs sinnvolle Codex-Agentenrollen statt zehn gleichzeitig konfigurierten Rollen.
- Drei eigene Kern-Skills: documentary-research, documentary-story, documentary-rights.
- Nur fünf ausgewählte offizielle Remotion-Skills werden beim optionalen Skill-Sync zusätzlich bezogen.
- Neues Projekt-CLI mit Quellen-, Asset-, Szenen- und Freigabemanifest.
- Keine automatische Veröffentlichung. Ein neuer Projektordner ist absichtlich zunächst NICHT freigegeben.

## Schnellstart
Benötigt Node.js ab 22.13, FFmpeg/FFprobe und Git. Für Remotion sind NPM-Abhängigkeiten notwendig.

    npm ci
    npm run check
    npm test
    npm run doctor
    npm run doku:new -- erste-doku "Die Technik hinter unseren Daten"
    npm run doku:status -- erste-doku
    npm run doku:check -- erste-doku

Hinweis: doku:check meldet zunächst Fehler und liefert Exitcode 1, solange echte Quellen, Nutzungsrechte, Szenen und die sieben Freigaben fehlen. Das ist ein Sicherheitsmerkmal, keine Fehlfunktion.

## Was noch fehlt
Der neue Doku-Freigabeprozess und Validator sind eine Grundlage, aber die 8–12-Minuten-Remotion-Komposition, vollständige Integration von doku-visual-agent und TTS mit Wort-Timing sind noch nicht implementiert. Kein MCP-Zugang zu Google Flow wird behauptet und es wurde noch keine Langdoku gerendert.

## Dokumentation
- docs/documentary-runbook.md: Produktion von A bis Z
- docs/documentary-architecture.md: Rollen, Module, Datenflüsse, Integrationsgrenzen
- docs/cleanup-audit.md: Audit und tatsächlich entfernte Teile
- docs/production.md: alter Animationsworkflow, nur Legacy-Referenz

Lokale Exporte gehören in renders/ oder documentaries/<slug>/exports/. Fremde Medien, Stimmaufnahmen oder API-Schlüssel gehören nicht ins öffentliche GitHub-Repository.
