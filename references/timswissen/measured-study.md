# Vertiefte Referenzstudie · 29. Oktober 2026

Quelle: [Spanier, @timswissen](https://www.tiktok.com/@timswissen/video/7700173076608158998). Öffentlich zugängliche lokale Analysefassung: 576 × 1024, 30 fps, 2225 decodierte Frames, 74,167 Sekunden. 79 zeitmarkierte Stichproben in sieben Kontaktbögen über die gesamte Länge sowie Einzelbilder bei 10 und 35 Sekunden betrachtet. Keine vollständige Echtzeit- oder gehörte Sichtung behauptet. Rohvideo, Einzelbilder, Audio und Transkript bleiben unter work/reference-analysis/ und werden nicht veröffentlicht.

## Beobachtete Folge

Zeitgrenzen dieser Tabelle sind aus den Einsekunden-Stichproben angenähert, keine framegenaue Schnittliste.

| Bereich | Sichtbarer Wechsel / Methode                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| 0–3 s   | Flaggenauswahl, Hervorhebung, Flagge als Einzelobjekt; Sans mit grünem kursivem Akzent                      |
| 3,7–6 s | Offenes Heft mit Stift; danach Uhr mit kleinem Rollenetikett                                                |
| 7–8,5 s | Vollflächige Tisch-/Essensbildszene mit knapper Kontextpille                                                |
| 9–11 s  | Uhrzeit und grüner Sektor ändern sich; aktiver Zeit- und Rollenstatus                                       |
| 12–18 s | Brotdose, kleiner Zusatztext, Wechsel der Rollen, räumliche Anordnung grauer Gruppenmarker                  |
| 19–23 s | Freigestelltes realistisches Sandwich mit grünem kursivem Begriff; später Detailbezeichnung                 |
| 24–34 s | Uhr als Übergang; Karte mit räumlicher Linie, Hervorhebung und wandernden Ortsbezügen                       |
| 35–40 s | Uhr unter wechselnden kurzen Satzteilen; akzentuierter Einzelbegriff; Rollenetikett und Kontext ändern sich |
| 41–45 s | Kleine Vergleichsmarker, dann Rollenpille und Fußballobjekt                                                 |
| 46–52 s | Wiederkehrende Uhr in mehreren Größen und Positionen, Zeit und Sprecherbezug wechseln                       |
| 53–58 s | Vollflächige Tischszene, dann freigestelltes Speiseobjekt über unscharfem Kontext und markierte Portion     |
| 59–63 s | Tisch von oben, Rollen rundherum, einzelne Begriffe und kleine Gesprächsmarker                              |
| 64–73 s | Uhr, wechselnde Rollen und Gesprächspille; Brotdose kehrt als erzählerischer Rückbezug zurück               |

PySceneDetect meldet bei Standardschwelle nur zwei Schnittkandidaten: Frames 224 und 256, etwa 7,467 und 8,533 Sekunden. Das belegt gerade nicht, dass der Film nur drei inhaltliche Szenen hat. Die konstant dunkle Bühne und animierte Objektwechsel bleiben für einen einfachen Schnittdetektor weitgehend kontinuierlich.

## Konkrete Unterschiede zu unserem Schalttag-Clip

- Die Referenz zeigt eine erzählte Alltagssituation mit wiederkehrenden Rollen. Unsere Darstellung war stärker eine Folge allgemeiner Wissensüberschriften.
- Im Referenzbild bei 10 Sekunden misst die Uhr ungefähr 60 % der Bildbreite; bei 35 Sekunden rund 53 %. Das sind manuelle Abschätzungen an zwei Frames, keine universelle Kanalregel. Unser letzter Kalender und die Uhr füllten deutlich mehr Raum.
- Kurze Rollen-, Zeit- und Kontextetiketten sitzen nahe am Objekt. Die gleiche Uhr bleibt in mehreren Gedanken nützlich, während Text und Zustand wechseln.
- Helle Sans und grüne kursive Akzente übernehmen unterschiedliche Aufgaben. Mehrere Satzteile erscheinen nacheinander. Die exakte Schrift ist nicht identifiziert.
- Freigestellte realistische Objekte, vollflächige Bildszenen und schematische Grafiken wechseln sich ab. Alles ausschließlich mit eigener einfacher 3D-Geometrie zu lösen verengt das Format.
- Der Hintergrund enthält sehr zurückhaltende gezeichnete Symbole und Linien. Material, Schatten und ein lokaler Lichtschein verbinden die Gegenstände mit der Bühne.

## Sprache und Grenzen

Lokales Whisper tiny schätzt 221 Wörter bis ungefähr 73,66 Sekunden, rund drei Wörter pro Sekunde. Namen und mehrere Begriffe werden falsch erkannt. Das ist eine ungeprüfte technische Schätzung, kein korrigiertes Skript und kein Beleg für eine gehörte Stimm- oder Musikbeurteilung. Die konkrete Originalsoftware sowie verwendete Bild- und Sprachmodelle bleiben unbekannt.

## Umsetzung im Repo

- Eigene Bühne, Rollenpillen und Typografierollen in ExplainerStage.tsx und styles/explainer.ts.
- Eigenes schlichtes Uhrmodell mit schmalem dunklem Ring, ohne Ziffern und Beschriftung, als Variante desselben Blender-Builders.
- UhrStilstudie: neun Sekunden stumme eigene Bewegungsprobe; kleineres Hauptobjekt, zeitlicher Zustandswechsel, grüne Betonung und wechselnde Textrollen. Keine vollständige 1:1-Abnahme.
- Eigenes KI-Kalenderbild als Materialvorlage. Es zeigt bessere Papier-/Stoff-/Metall-Differenzierung, ist aber kein Referenzframe und seine Objektgröße keine gemessene Übereinstimmung.
- look-development und audio-timing verbinden Stilbilder und tatsächliche Sprecherfassung mit künftigen Filmen. Analysetools ersetzen die Betrachtung nicht.

## Weitere Vertiefung

[Detailanalyse vom30.Oktober](deep-analysis-2026-10-30.md) untersucht fünf Übergänge mit weiteren66Bildstichproben und dokumentiert Rollen-Semantik, Ebenenwechsel, Pixelproben und Grenzen der bisherigen eigenen Stilprobe.
