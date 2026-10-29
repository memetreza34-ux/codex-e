# Prüfung des Arbeitsordners

Die eigene Weboberfläche, ihr Server und ihre Abhängigkeiten wurden auf Armans Klarstellung entfernt. Erhalten sind die Produktionswerkzeuge, Skills, Agenten-Rollen, Projektablagen und Video-Beispiele.

Erfolgreich geprüft: npm run check, die beiden verbleibenden Tests, npm run doctor und ein neu gerenderter Testframe über die verbleibende Render-Pipeline. Die GitHub-CI prüft eine frische Installation, die Projektkonfiguration, Tests und einen gerenderten Frame unter Linux.

Die drei Beispielanimationen wurden als echte MP4-Dateien mit Prüfbildern exportiert. WebsiteSzene und AfrikaStudie enthalten eine Audiospur; eine gehörte Audioabnahme wird nicht behauptet. DatenErklaert verwendet illustrative Beispieldaten. Die AfrikaStudie wurde in voller Hochformat-Auflösung exportiert; die Prüfung und Korrektur zweier beschädigter Frames ist in projects/africa-study/review.md dokumentiert. Generierte Exporte bleiben lokal unter renders/.

Die acht Agenten-Konfigurationen wurden strukturell geprüft; sie sind Rollen und keine laufenden Agenten. Für die Einrichtung wurden keine zusätzlichen externen KI-Dienste mit API-Schlüsseln angelegt.

Die vierte Beispielanimation AfrikaReise ist 35 Sekunden lang und in voller Hochformat-Auflösung exportiert. Alle 1050 Bilder wurden auf den bekannten Kachelfehler geprüft; es waren keine Reparaturen nötig. Der genaue Prüfumfang und die Speicherumgehung stehen in projects/africa-journey/review.md.

Die Erweiterung für vollständige Erklärformate wurde mit npm run check, npm test, npm run doctor und den drei Skill-Creator-Validierungen geprüft. Vorhanden sind zwölf Remotion-Skills, fünf ergänzende externe Skills und sieben eigene Produktions-Skills sowie acht Rollen. Der neue Skill-Sync wurde zusätzlich in einem isolierten temporären Ordner mit einer frischen Installation auf festem Commit und einem Wiederholungslauf nach lokaler Änderung geprüft; die Änderung blieb erhalten. Der Website-Formatpilot ist ein vollständiger Filmplan, noch kein neu gerenderter Film.

Die eigenständige fünfte Animation PopcornLabor wurde als 24-Sekunden-Makroszene exportiert. Alle 720 Frames wurden dekodiert; die zeitliche Ausreißerprüfung meldete keine Kandidaten. Der konkrete Prüfumfang steht in projects/popcorn-lab/review.md.

## Hybrid-Medienerweiterung, 28. Oktober 2026

- 31 lokale Skills: zwölf Remotion, zehn ergänzende importierte und neun eigene. Zehn Rollen konfiguriert, keine zusätzlichen Agenten gestartet. Die beiden neuen eigenen Skills bestehen quick_validate; skills:sync erhält alle vorhandenen Ordner.
- HeyGen CLI v0.11.0 repo-lokal mit festgelegtem SHA-256 installiert und Versionsaufruf geprüft. HeyGen und Higgsfield melden Anmeldebedarf; keine externe Generierung durchgeführt. Der HeyGen-Pluginanschluss ist unbestätigt. Dies war ein historischer Sitzungsstand; neue lokale Statusberichte stehen unter work/provider-status.json. Deklarative Anforderungen: toolkit/providers.json.
- Blender 5.2.2 LTS erzeugte die eigene Uhr mit drei benannten Zeiger-Eltern. GLB-Struktur: 78 Knoten, 75 Meshes, sieben Materialien. Blender-Prüfbild und tatsächlicher Remotion-Uhrframe angesehen.
- Vier registrierte Medien bestehen die Prüfsummen- und Formatprüfung. Die freigestellte PNG besitzt 803.556 vollständig transparente Pixel von 1.638.400. Zwei ungeeignete Foto-Kandidaten wurden aus der Produktionsbibliothek entfernt und nur ihre Ablehnungsgründe dokumentiert.
- Erster Remotion-Uhrframe enthielt kein Objekt: innerhalb der verzögerten Canvas erzeugte Wartebedingungen reichten für den ersten Frame nicht aus. Die äußere Komponente hält jetzt den Render bis zum Laden und Zeichnen von GLB und HDRI an. Eine gezielte Helligkeitsprüfung im Objektbereich unterscheidet das leere Prüfbild vom tatsächlichen Uhrmotiv und läuft in CI.
- HybridAssets exportiert: 270 Frames, neun Sekunden, 1080 × 1920, H.264, ohne Ton. Acht Stichproben aus dem tatsächlichen MP4 plus separater Uhrframe geprüft. Das ist eine technische Medienstudie, keine vollständige Lernvideo-Abnahme. Keine vollständige Echtzeit-Sichtung behauptet.
- npm run check, fünf Node-Tests, media:verify und die gezielte Uhrbildprüfung bestanden. Maschinenlesbarer Nachweis: toolkit/media-verification.json. CI-Status gesondert prüfen; lokale Erfolge sind kein Beleg für bereits gelaufene GitHub Actions.

## Referenzwerkstatt und Bereinigung · 29. Oktober 2026

- Vertiefte Spanier-Studie: 79 zeitmarkierte Stichproben, sieben Kontaktbögen und zwei Einzelbilder betrachtet. Zwei automatische Schnittkandidaten sind keine vollständige semantische Szenenliste. Lokales Whisper tiny erzeugte ungeprüfte Wortzeiten; Originalsoftware und gehörte Tonqualität bleiben unbekannt.
- Isolierte Python-3.12-Umgebung mit festgelegten yt-dlp-/PySceneDetect-Abhängigkeiten installiert. Der zuvor vorhandene globale yt-dlp-Aufruf war defekt; er wurde nicht global verändert. Einrichtung, öffentliches Fetch-Smoke, tatsächliche Videoanalyse und lokale Whisper-Transkription ausgeführt. Rohreferenzen und Gewichte bleiben Git-ignore.
- 33 Skills: zwölf Remotion, zehn ergänzende importierte und elf eigene. Neu: look-development und audio-timing; beide mit quick_validate geprüft. Zehn konfigurierte Rollen bleiben erhalten. In dieser Arbeit wurden tatsächlich Teilaufgaben delegiert und ihre Ergebnisse integriert.
- Renderpfade auf einen gemeinsamen Kern zurückgeführt. Bestehende Exporte werden erhalten; neue Ausgaben besitzen eindeutige IDs. Neun Node-Tests inklusive Planung, Audio-Pfadgrenze und Ausgabeschutz bestanden. Fünf Python-Tests zu Framezeiten, Analysegrenzen und Erhalt vorhandener Ausgaben bestanden.
- Host-/Anmeldestatus aus versionierten Dateien entfernt: aktueller Bericht nur work/provider-status.json, Anforderungen in toolkit/providers.json. Doktor prüft keine nicht sichtbaren Host-Pluginverbindungen.
- Eigene KI-Materialvorlage mit nativem Bildwerkzeug erzeugt und samt vollständigem Prompt lokal im Repo gespeichert. Neues eigenes schlichtes Uhrmodell:72 Knoten,69 Meshes,sechs Materialien. Insgesamt sechs Medien im Register technisch geprüft.
- UhrStilstudie: neun Sekunden,270 Frames,1080×1920,H.264,stumm. Acht Export-Stichproben plus Einzelbild betrachtet; alle270Frames decodiert. Keine vollständige Echtzeit-, Sprecher- oder 1:1-Abnahme behauptet. Einzelheiten unter projects/style-match/review.md.
