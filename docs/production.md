# Produktionsablauf im Arbeitsordner

1. **Auftrag:** Arman beschreibt die Animation direkt in Codex. Ein neues Projekt unter projects/<slug>/ anlegen; npm run project:new kann das Briefing vorbereiten.
2. **Recherche:** Zentrale Aussagen und Referenzen prüfen, direkte Quellen in sources.md festhalten.
3. **Storyboard:** Erkenntnis, sichtbare Objekte, Bewegung, Timing und Übergänge im Projektordner beschreiben. Bei unklarer Richtung zunächst eine überzeugende kurze Szene entwickeln.
4. **Bildsprache prüfen:** Bei einem Referenzformat zuerst eigene Stilbilder für typische Einstellungen und einen kurzen Bewegungstest mit look-development prüfen. Objektgröße, Materialien, Textrollen und Übergänge anhand tatsächlicher Referenzstellen vergleichen. Das ist eine interne Arbeitsprüfung, keine zusätzliche Nutzerfreigabe.
5. **Animation:** Code unter src/remotion/scenes bearbeiten und in registry.ts sowie workspace.config.json registrieren. Vorlagen an das Thema anpassen.
6. **Ton:** Nur falls gewünscht vorhandene Aufnahmen oder tatsächlich verfügbare Sprachwerkzeuge nutzen. Das Timing an der echten Audiodatei ausrichten.
7. **Vorschau und Export:** npm run render -- SzenenID erzeugt eine Vorschau. Mit --final volle Auflösung. Die Dateien liegen unter renders/.
8. **Prüfung:** Kontaktbogen und relevante Stellen im MP4 prüfen, Ton bei Bedarf anhören, konkrete Befunde in review.md dokumentieren. Die automatische QA setzt die visuelle Abnahme zunächst auf pending.

## Beispielauftrag

> Nutze $explainer-director für dieses Thema. Entwickle eine verständliche kurze Szene, setze sie in Remotion um und zeige mir die geprüfte Animation.

Die Rollen researcher, story_designer, art_director, motion_designer, audio_director und quality_reviewer stehen für gezielte Aufgaben bereit, wenn die Sitzung Delegation erlaubt. Sie starten nicht von selbst.

Kein eigener Webauftritt und keine Bedienoberfläche gehören zum normalen Produktionsablauf. Remotions vorhandenes Vorschauwerkzeug kann bei Bedarf mit npm run preview geöffnet werden.

[Referenzwerkstatt](reference-workshop.md) liefert lokale Bildstichproben, Schnittkandidaten und optionale Wortzeiten. $audio-timing verbindet die eigene Sprecherfassung mit Objektaktionen. Werkzeugdetails und Befehle stehen zentral in [tools.md](tools.md).
