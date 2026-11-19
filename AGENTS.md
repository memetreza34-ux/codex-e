# Codex E – Dokumentations-Produktionssystem

## Ziel
Ein einzelner Hauptagent (Codex) entwickelt und steuert deutschsprachige 8–12-Minuten-YouTube-Dokumentationen (16:9, Full HD, 30 fps). Themen können Technik, Internet, Wirtschaft, Geschichte und außergewöhnliche reale Ereignisse umfassen. Starke Originalrecherche und sinnvolle Visualisierung vor Masse.

## Arbeitsregeln
1. Vor jeder Aufgabe README.md und docs/documentary-runbook.md lesen; Dateien dieses Repositories nicht außerhalb des beauftragten Bereichs löschen.
2. Neue Langdoku ausschließlich über npm run doku:new mit eindeutigem Slug anlegen. Bestehende Projekte nicht überschreiben.
3. Vor dem Skript Primärquellen sammeln; jede zentrale überprüfbare Aussage mit Claim-ID, Quellentitel, Publisher, URL und Abrufdatum erfassen. KI-Texte sind keine Belege.
4. Vor finaler Bildproduktion Skript und Claim-Liste redaktionell prüfen; Gegenpositionen fair einordnen, keine erfundenen Zitate und kein nacherzähltes fremdes Doku-Skript.
5. Bilder: bevorzugt belegbare Originalaufnahmen/Archivmaterial. Stockbilder nicht als Originalereignisse darstellen. Generierte Rekonstruktionen deutlich kennzeichnen.
6. Jedes externe Medium mit Urheber, Lizenz/Nutzungsgrundlage, Original-URL, Änderungsangaben und manueller Freigabe dokumentieren. Rechte niemals aufgrund eines API-Metadatenfeldes allein zusagen.
7. Echte Sprachdatei für Timing verwenden. Keine geschätzten Wortzeiten als gemessene synchronisierte Zeiten ausgeben.
8. Vor Abschluss vollständige MP4 mit Ton ansehen/hören; überprüfbare Reviewbefunde mit Timecodes festhalten. Technische QA ersetzt keine redaktionelle QA.
9. Keine automatischen Uploads, externen Käufe, Abos, fremden Kontoverbindungen oder kostenpflichtigen API-Jobs ohne ausdrückliche Autorisierung.
10. Vorhandene 9:16-Testkompositionen sind Legacy-Regressionstests. Sie werden nicht für neue Videos verwendet und nicht ohne grünes Ersatzsystem entfernt.

## Rollen
Nur bei echter Entlastung Unteraufgaben delegieren. Die sechs definierten Rollen sind researcher, story_designer, asset_researcher, motion_designer, audio_director und quality_reviewer. Sie besitzen keine eigenen Konten oder zusätzlichen Toolrechte.

## Skills und Tools
- documentary-research für Fakten-/Claim-Recherche.
- documentary-story für dramaturgische 16:9-Langdokus.
- documentary-rights für Medienrecht und Provenienz.
- motion-design und ausgewählte Remotion-Skills für visuelle Erklärung.
- render-qa für exportbezogene Prüfung.

Remotion, FFmpeg und Blender sind lokale Programme, keine Pflicht-MCPs. Nutze vorhandene Projektwerkzeuge oder API-Adapter statt duplizierter MCP-Server. Ein echter Dienstzugang muss vor der Ausführung geprüft werden.

## Freigabestufen
Thema → Quellen/Claims → Skript → Szene/Asset → Rechte → echtes Audio → Render → Vollfilm-Review → Nutzerfreigabe. Die Datei release.json enthält alle sieben Freigabestati. Wer eine Phase nicht tatsächlich überprüft hat, belässt sie auf pending. npm run doku:check validiert nur formale Anforderungen und Referenzen, nicht die Wahrheit oder Rechtslage.

## Praktische Befehle
- npm ci, npm run check, npm test, npm run doctor
- npm run doku:new -- slug "Titel"
- npm run doku:status -- slug
- npm run doku:check -- slug
- npm run render -- DatenErklaert (nur technische Alt-Demo)

Wichtige Referenzen: docs/documentary-architecture.md, docs/documentary-runbook.md, docs/cleanup-audit.md.
