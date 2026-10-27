# Geprüfter Einrichtungsstand

Prüfung am 27. Oktober 2026, lokal auf macOS mit Node 24.15.0 und vorhandenem Google Chrome.

- Frische Installation mit `npm ci`: erfolgreich; Schriften und synthetischer Demo-Ton werden lokal erzeugt.
- `npm run check`: zwei Szenen, drei Projektbriefings, sechs Agenten-Konfigurationen und vier Studio-Skills geprüft.
- `npm test`: fünf Tests für dauerhaftes Speichern, Duplikatschutz, Eingabe- und Pfadprüfung, lokale Schreibzugriffe und Video-Bytebereiche bestanden.
- `npm run build`: erfolgreich. Der Build weist auf ein großes gemeinsames Player-Bundle hin; er ist für den lokalen Arbeitsplatz funktionsfähig.
- `npm run skills:sync`: auf die festgelegte Quellversion geprüft, vorhandene zwölf offizielle Skills unverändert beibehalten.
- Paketprüfung nach den Korrekturen: `npm audit` meldet keine bekannten Schwachstellen. Die dokumentierte Zod-Abweichung von Remotions erwarteter exakter Version bleibt bewusst bestehen.
- Die Website-Szene wurde über die CLI als echtes MP4 mit Tonspur, Kontaktbogen und Bericht exportiert. Kontaktbogen und Bildschirmvorschau wurden visuell geprüft; eine gehörte Audioabnahme wird nicht behauptet.
- Die Daten-Szene wurde über „Video exportieren“ im Arbeitsplatz exportiert. Format, Dauer, Bericht und Vorschaubild sind vorhanden; die Schlussgrafik wurde visuell geprüft.
- Im Browser: Wiedergabe, Szenenkapitel, Wechsel der Beispielszene, Erstellen/Speichern eines neuen Cache-Briefings und Anzeigen beider Exporte geprüft.
- HTTP-Prüfung: fremde Origin abgelehnt, unbekannte Szene abgelehnt, gespeichertes Briefing wiedergefunden, Video-Teilabruf mit Status 206 und Berichtabruf erfolgreich.
- „Timeline öffnen“ startet die Remotion-Timeline aus der Oberfläche und zeigt die beiden registrierten Szenen einschließlich Audiodatei. WebMCP-Werkzeuge wurden vom Browser angezeigt; daraus folgt keine automatische Freigabe ihrer schreibenden Aktionen.

Agenten-Dateien sind strukturell nach dem dokumentierten Codex-Schema geprüft. Es wurden für diese Einrichtung keine Agenten gestartet und keine externen KI-Dienste mit API-Schlüsseln eingerichtet. Neue Codex-Turns müssen im Repository laufen, damit dessen Skills und Rollen entdeckt werden.

Generierte Exporte liegen lokal unter `renders/` und werden absichtlich nicht mit Git veröffentlicht. Die GitHub-CI prüft Installation, Konfiguration, Tests, Build und einen einzelnen Remotion-Frame unabhängig unter Linux; ihr tatsächlicher Laufstatus ist auf GitHub zu prüfen.
