# Architektur für Codex E – Langdokumentation

## Steuerung
Ein Codex-Hauptagent ist verantwortlich. Sechs optionale Teilrollen:
1. researcher: Quellen, Fakten, Gegenprüfung, Claim-IDs.
2. story_designer: Gesamtbogen, Dramaturgie, Skript.
3. asset_researcher: reale Medien, Herkunft, Rechte, Freigabe.
4. motion_designer: Karten, Diagramme, technische Animationen, Remotion.
5. audio_director: tatsächlich verfügbare Stimme, Wort-Timings, Ton.
6. quality_reviewer: unabhängige Endkontrolle von Fakten, Film und Ton.

Keine zusätzlichen parallelen Agentendienste nötig.

## Vorhandene Repositories (separat, nicht bereits integriert)
- doku-visual-agent: Pexels-/Wikimedia-Suche und visueller Reviewbericht; noch kein vollautomatisch rechtsgeprüfter Asset-Import.
- Technik-Kanal: Remotion, Qwen-TTS und Exportprüfung; zunächst nur Quellbausteine, keine nachgewiesene direkte Verbindung.
- Geschichte-Kanal: Themen- und Storytelling-Gates.
- Claud-Youtube: dokumentarische Sprecher-/Beleg-/Motion-Experimente.

Bestehende Funktionen nur anhand konkreter Tests wiederverwenden. Keine Dateien in diesen Repos im Rahmen dieser Bereinigung ändern.

## Geplante Module
1. Quellensuche und Claim-Matrix: konkrete Primärquellen und Abrufnachweise.
2. Asset-Adapter: lizenzierte Aufnahmen mit visueller Prüfung; Übergabe aus doku-visual-agent.
3. Redaktions-/Skriptmodul: Szene nach Aussage, nicht nach zufälligem Bild.
4. Audio-Adapter: lokale Qwen-Stimme oder andere autorisierte Quelle; echtes Audio-Alignment.
5. Render-Modul: einheitliche 16:9-Remotion-Timeline, Animationen, Karten und Dokumente.
6. QA-Modul: formale Prüfung plus vollständige tatsächliche Film- und Tonkontrolle.
7. Auswertung: Nach Veröffentlichung Zuschauerbindung prüfen; neue Regeln erst aus echter Beobachtung ableiten.

## Datenvertrag und Freigaben
Alle Video-Daten liegen in documentaries/<slug>. Claim-, Asset- und Szenen-IDs verweisen aufeinander. Der Validator verweigert Freigabe bei fehlenden Belegen, ungeklärten Rechten, nicht auflösbaren Szenenreferenzen, falschem Format oder offenen release.json-Stufen. Ein technischer PASS belegt jedoch nicht die tatsächliche Wahrheit oder Lizenzlage.

## MCP-Politik
GitHub bei Bedarf; lokaler Codezugriff sonst direkt. Pexels/Wikimedia über bereits vorhandene API-Adapter. Remotion und FFmpeg ohne eigenen MCP. Google Flow optional, kein nachgewiesener MCP-Zugriff. Kostenpflichtige Provider nur nach ausdrücklicher Freigabe. Keine doppelte Architektur für denselben Dienst.

## Geplante Milestones
A: Doku-Projektvertrag und Tests (in dieser Iteration).
B: beweisbar funktionierender Asset-Import mit Rechtecheck.
C: echte Langdoku-Szene mit Sprecher und synchronisierten Belegen.
D: vollständig gerenderter 8–12-Minuten-Pilot mit Review-Bericht.
E: iterative Qualitätsoptimierung und vorsichtige Automatisierung.

Keine fertige komplette Pipeline behaupten, solange B–D fehlen.
