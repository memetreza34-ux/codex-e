# Einen Erklärfilm produzieren

1. **Briefing:** Im Arbeitsplatz anlegen oder `npm run project:new -- mein-film Mein Film`. Thema, Zielgruppe, Format und gewünschte Erkenntnis benennen. Ein gespeichertes Briefing ist noch kein automatisch generierter Film.
2. **Recherche und Storyboard:** Codex im Repository mit `$explainer-director` ansprechen. Quellen unter `sources.md`, die Bildfolge unter `storyboard.md` festhalten.
3. **Gestaltung:** Eine passende visuelle Idee entwickeln. Die zwei beiliegenden Szenen zeigen Webseitenabläufe und Datenvergleiche; sie sind Startpunkte, keine verpflichtenden Vorlagen für jedes Thema.
4. **Szenenbau:** Komponenten in `src/remotion/scenes` entwickeln. In `registry.ts` und `studio.config.json` registrieren. Vorschau im Arbeitsplatz, Bearbeitung in der Remotion-Timeline.
5. **Ton:** Eigene Aufnahme, vorhandene Audiodatei oder einen tatsächlich verbundenen Sprachdienst verwenden. Für ein stilles Beispiel keine Stimme erzwingen. `npm run audio:normalize -- quelle.wav ziel.wav` normalisiert Sprache.
6. **Export:** Im Arbeitsplatz „Video exportieren“ wählen oder `npm run render -- WebsiteSzene`. Mit `--final` volle Auflösung. Pro Arbeitsplatz wird ein Export gleichzeitig ausgeführt.
7. **Abnahme:** Kontaktbogen und MP4 prüfen, Ton bei Bedarf anhören, Befunde in `review.md` festhalten. Automatische technische Prüfung und kreative Abnahme bleiben unterscheidbar.

## Übergabe an Codex

> Nutze $explainer-director für projects/mein-film. Entwickle eine verständliche Szene zu diesem Briefing, setze sie in Remotion um und zeige eine geprüfte Vorschau.

Wenn du bewusst parallel arbeiten möchtest:

> Lass researcher die Fakten und story_designer die Bildfolge prüfen. Teile die Aufgaben in getrennte Dateien auf und führe die Ergebnisse zusammen.

Die Agenten erben das in Codex gewählte Modell. Konfiguration und Skills werden wirksam, wenn das Repository als Projekt geöffnet ist; sie verändern keine globale Konfiguration und starten keine kostenpflichtigen Dienste.
