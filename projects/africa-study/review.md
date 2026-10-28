# Abnahme der Afrika-Studie

- Export: `renders/AfrikaStudie-final.mp4`, H.264, 1080 × 1920, 30 fps, 420 Bilder, 14,016 Sekunden inklusive AAC-Audio.
- Gestaltung anhand tatsächlich geöffneter TikTok-Videos entwickelt. Eigene Geometrie, Papierstruktur, Grafiken und synthetische Soundeffekte; keine übernommene Videoaufnahme.
- Kontrollbilder für Ägypten, Nigeria, Südafrika und Schlussbild betrachtet. Abschließend die Kontaktübersicht der exportierten MP4 geprüft: Titel, Karte, Beschriftungen und Abschluss bleiben lesbar.
- Im ersten Export waren Frame 289 und 312 gekachelt. Beide wurden mit unverändertem Szenencode einzeln in voller Auflösung neu gerendert und mit FFmpeg an genau ihren Positionen eingesetzt. Die Audiospur wurde unverändert kopiert.
- Alle 420 Bilder der korrigierten Datei dekodiert und eine feste Kartenregion auf den beobachteten Kachelfehler geprüft: keine auffälligen Frames, minimale mittlere Helligkeit 201 statt 61 in den beschädigten Bildern. Dieser gezielte Test ersetzt keine umfassende visuelle Prüfung jedes Pixels.
- Ton technisch geprüft: Stereo, 48 kHz, Spitze ungefähr −12,8 dBFS; keine gehörte Tonabnahme behauptet. Die Szene hat keine Erzählstimme.
- Codeprüfung, zwei vorhandene Tests, Werkzeugprüfung und `git diff --check` erfolgreich.
- Darstellung vereinfacht: Kleine Inselstaaten fehlen im Maßstab. Die Zahl 54 bezieht sich auf afrikanische UN-Mitglieder und wird aus der UN-Quelle übernommen.

Die macOS-Pipeline verwendet vorsorglich nur einen Render-Tab. Die eindeutige Ursache des sporadischen Chrome-Aufnahmefehlers bleibt offen; die korrigierte Ausgabedatei wurde separat geprüft.
