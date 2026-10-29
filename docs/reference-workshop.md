# Referenzwerkstatt

Diese Werkstatt liefert überprüfbare Zeitmarken und Vergleichsbilder. Sie erkennt keine Gestaltung automatisch als korrekt und identifiziert keine verwendete Originalsoftware.

## Einrichten und messen

```sh
npm run reference:setup
npm run reference:fetch -- https://www.tiktok.com/@timswissen/video/7700173076608158998 --id spanier
npm run reference:analyze -- work/reference-inputs/spanier/reference.mp4 --out work/reference-analysis/spanier-neu --reference-id timswissen-spanier --interval 1 --audio
```

Python ab 3.12 ist erforderlich. REFERENCE_PYTHON kann einen konkreten Interpreter wählen. Die Installation liegt ausschließlich in .tools/reference-venv; toolkit/reference-lock.txt bindet alle Versionen. Auf diesem Host wurde Python 3.12 verwendet. Das zuvor vorhandene globale yt-dlp war defekt und wird nicht überschrieben.

fetch liest nur öffentliche Quellen ohne Cookies. Zugangsschranken werden nicht umgangen. Ansonsten eine zulässig verfügbare lokale Datei direkt an analyze übergeben. Referenzvideos, Frames, Audiodateien und Transkripte bleiben im Git-ignorierten work/. Neue Ausgabeordner verhindern das Überschreiben bestehender Analysen. Fremde Referenzmedien werden nicht als Produktionsassets registriert.

Ergebnisse: manifest.json, shots.json, zeitmarkierte Einzelbilder, Kontaktbögen und optional Mono-WAV plus 100-ms-Pegelfenster. PySceneDetect liefert visuelle Schnittkandidaten. Objektwechsel auf unverändertem Hintergrund können unentdeckt bleiben; jeder Kandidat benötigt Betrachtung. Frame/FPS-Zeiten sind bei variabler Bildrate näherungsweise.

## Wortzeiten

```sh
npm run reference:transcribe -- work/reference-inputs/spanier/reference.mp4 --out work/reference-analysis/spanier-worte --model tiny --language de
```

Diese optionale Funktion benötigt ein bereits installiertes lokales openai-whisper. REFERENCE_WHISPER_PYTHON kann dessen Interpreter wählen. Sie installiert keinen Cloudzugang. Modellgewichte werden beim ersten Aufruf öffentlich nach .tools/models/whisper geladen; tiny benötigt hier etwa 72 MB. Transkripte sind fehleranfällige Schätzungen und bleiben lokal. Weder exakte Sprecheridentität noch gehörte Qualität daraus ableiten.

## Gestaltung übertragen

1. Bilder und Übergänge tatsächlich betrachten; beobachtete Zeitstellen und Grenzen notieren.
2. Objektanteil und Position, Schriftrollen, Rollenetiketten, Akzentzustände, Materialien und Wechsel der Medien getrennt erfassen.
3. Ein eigenes Skript mit demselben Grad an visueller Auflösung entwickeln.
4. Mit look-development eigene Stilbilder und eine kurze Bewegungsprobe vergleichen. Keine zusätzliche Nutzer-Freigabe allein wegen dieses Ablaufs einholen.
5. Mit audio-timing die eigentliche Sprecherfassung und den Schnitt verbinden; einen stummen Test als solchen kennzeichnen.
6. Längeren Film erst aus geprüften Bausteinen zusammensetzen. Sichtung und Tonprüfung dokumentieren.

Aktuelle eigene Auswertung: references/timswissen/measured-study.md. Bilder des Referenzkanals bleiben lokal. Das erzeugte Kalender-Stilbild unter public/assets/art-direction ist eine eigene KI-Materialvorlage, kein Quellframe oder fertiger Film.

## Prüfungen

```sh
.tools/reference-venv/bin/python -m unittest discover -s tests -p 'test_reference_analysis.py'
npm test
npm run media:verify
```

Offizielle Quellen: [yt-dlp](https://github.com/yt-dlp/yt-dlp), [PySceneDetect](https://www.scenedetect.com/docs/latest/), [OpenAI Whisper](https://github.com/openai/whisper). Eingesetzte Versionen sind in den Lockdateien und tatsächlichen lokalen Berichten dokumentiert.
