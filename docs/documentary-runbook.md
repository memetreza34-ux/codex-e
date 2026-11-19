# Doku-Produktion von A bis Z

Nur 16:9-YouTube-Langvideos, zuerst ein 8–12-Minuten-Pilot. Der Film muss eigenständig, verständlich und quellenbasiert sein.

## 1. Projekt anlegen
    npm run doku:new -- mein-thema "Warum Unterseekabel das Internet tragen"
    npm run doku:status -- mein-thema

Neue Ordner unter documentaries/<slug>/ enthalten:
- brief.json: Format, Titel, Länge, Veröffentlichungsregel.
- claims.json: prüfbare Behauptungen, Quellen, menschliche Freigabe.
- assets.json: Medien, Urheber, Herkunft, Lizenz, Freigabe.
- scenes.json: Sprechabschnitt, Visualtyp, referenzierte Claim-/Asset-IDs, Sekunden.
- release.json: sieben zunächst offene Freigabestufen.
- script.md und review.md: Sprechertext und echte Reviewnotizen.

Keine Fakequellen oder voreiligen Freigaben.

## 2. Recherche und Skript
Von einer klaren Frage aus recherchieren, Primärquellen priorisieren und jede große Behauptung mit direktem Nachweis speichern. Verfasse eine spannende, aber faire Story: Hook → Problem/Konflikt → Untersuchung → Wendepunkt → Auflösung. Sprechertext gegen Quellen prüfen und als genehmigten Text für die TTS-Phase einfrieren.

## 3. Medien und Bildsprache
Vor jeder Szene entscheiden, welche Form eine Aussage am besten sichtbar macht: Originalfoto, B-Roll, Karte, Dokument, eigene 2D/3D-Erklärung oder Datenanimation. Nicht wahllos KI-Bilder erzeugen. Bei Fremdmaterial Originalquelle, Urheber, Lizenz, Nutzung und eventuelle Persönlichkeitsrechte überprüfen. Bei generierten Bildern Provenienz/Kennzeichnung ergänzen. Medien lokal, nicht öffentlich in GitHub speichern.

## 4. Sprecher und Schnitt
Freigegebene Sprachfassung wirklich erzeugen und hören. Remotion-Timeline mit echten Timingdaten synchronisieren; Musik nur mit dokumentierter Lizenz. FFmpeg für technische Bearbeitung. Szenen nicht länger stehen lassen, als Inhalt oder Spannung tragen.

## 5. Qualitätsprüfung
Originalquellen und Medienrechte kontrollieren. Alle Szenen, den vollständigen Film sowie die ganze Tonspur prüfen. In review.md konkrete Zeitstempel/Probleme dokumentieren. Danach die passenden release.json-Stufen manuell freigeben. Kein automatischer Upload.

    npm run doku:check -- mein-thema

Diese Prüfung sperrt standardmäßig unvollständige Projekte; sie beweist keine redaktionelle Qualität. Freigaben sind nur nach echten manuellen Tests zulässig.

## Stand der Umsetzung
Diese Iteration liefert den Projekt-/Prüfprozess. Recherche-Adapter, vollständige Langdoku-Komposition, Qwen-/Whisper-Handoff und echte Pilotproduktion sind die nächsten technischen Arbeitsschritte. Sie werden erst als fertig gemeldet, wenn ausgeführt und getestet.
