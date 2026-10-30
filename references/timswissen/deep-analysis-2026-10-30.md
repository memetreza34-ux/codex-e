# Detailanalyse und Machbarkeit · 30. Oktober 2026

Referenz: [Spanier, @timswissen](https://www.tiktok.com/@timswissen/video/7700173076608158998). Basis bleibt die zuvor dokumentierte lokale 576×1024-Fassung mit 30 fps und 2225 Frames. Zusätzlich zur alten Übersicht wurden fünf engere Bildfolgen betrachtet: insgesamt 66 Bilder in Abständen von drei bis sechs Frames, etwa 0,1–0,2 Sekunden. Diese Auswahl untersucht konkrete Übergänge, keine lückenlose Echtzeit-Sichtung. Bilder und Rohvideo bleiben lokal unter work/reference-analysis/deep-2026-10-30/.

## Was die genaueren Bildfolgen zeigen

| Betrachtetes Fenster         | Beobachtete Veränderung                                                                                                                                                                                                  | Reproduzierbarer eigener Aufbau                                                                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4,4–5,4 s, Frames132–162     | Heft wird deutlich kleiner und verschwindet. Die Personenpille erscheint bereits. Danach kommt die Uhr zunächst gedimmt, dann klar ins Bild; ihre Zeiger laufen zum neuen Zustand.                                       | Ausgangsobjekt verkleinern und ausblenden; Personenidentität erhalten; Eingang aus Transparenz/Unschärfe und passender Größe aufbauen. Objekt, Rollenpille und Zeiger getrennt animieren.                                                     |
| 10,8–12,2 s, Frames324–366   | Zeitpille verschwindet, Rollenbezug wechselt. Ab11,1s erscheint die kleine Dose über der noch sichtbaren Uhr. Um11,4s ist die Dose klar, die Uhr weitgehend weg. Zwei Personenetiketten ordnen sich links/rechts an.     | Zeitbadge, Teilnehmer und Hauptobjekt erhalten getrennte Zeitfenster. Überlappender Wechsel mit Skalierung und Deckkraft; Teilnehmer-Anker neu anordnen. Keine einzelne Animation auf die ganze Szene anwenden.                               |
| 34,8–37,3 s, Frames1044–1119 | Kurze Satzteile erscheinen nacheinander. Vorige Teile werden gedimmt oder verlassen den Platz. Uhr, Sonnenmotiv und der abschließende grüne Kursivakzent tragen verschiedene Aspekte derselben Aussage.                  | Semantische Textabschnitte an der eigenen Sprecherfassung schneiden; helles aktuelles Wort/Satzstück, zurückgenommener Kontext, gesonderter Kursivakzent. Text und Objektlayout zusammen führen.                                              |
| 53,0–55,2 s, Frames1590–1656 | Erst ganze Tischszene mit Personenbezügen. Zwischen etwa53,8 und54,4s rückt das Bild näher und wird unscharf. Ein scharfes Speiseobjekt mit anderer Schnittdarstellung sowie eine feine Bezeichnungslinie treten hervor. | Kontextbild als Hintergrundebene; Zoom und Unschärfe separat steuern. Eigenes freigestelltes Detailasset darüber aufbauen. Beschriftung über einen eigenen Anker setzen. Der sichtbare Effekt benötigt keine vollständige 3D-Tischsimulation. |
| 73,0–74,1 s, Frames2190–2223 | Kurzer heller Vorspann und kursiver grüner Text werden schrittweise aufgedeckt. Die Dose verschwindet über Größe/Transparenz, die Flaggenkachel kommt zurück; Text dimmt zum Ende.                                       | Eigener erzählerischer Rückbezug und wiederkehrendes Anfangsobjekt. Schriftaufdeckung separat vom Objektwechsel; kurzer Schlusszustand statt langer Abspannkarte.                                                                             |

Die genannten Zeitpunkte grenzen sichtbare Zustände aus Stichproben ein. Exakte Startframes, Original-Keyframes, Federwerte oder Bezier-Kurven sind damit nicht identifiziert.

## Bildaufbau und Materialien

Die beiden früher gemessenen Uhrbilder liegen bei ungefähr53–60% Bildbreite. Das ist kein Universalmaß: Sandwich und Karten nutzen andere Größen, die Tischszenen die gesamte Bildfläche. Wichtig ist die Hierarchie aus Hauptobjekt, Bezugsperson und knapper Zusatzinformation.

Vier zusätzliche Farbproben wurden als Median rechteckiger Bereiche in Frame300 genommen:

| Probe in der decodierten Datei  | Pixelbereich x,y,w,h | Median RGB / Hex      |
| ------------------------------- | -------------------- | --------------------- |
| Ruhiger Hintergrund oben links  | 20,30,75,90          | 32,35,32 / #202320    |
| Ruhiger Hintergrund unten links | 15,860,85,90         | 32,35,32 / #202320    |
| Heller Bereich des Zifferblatts | 300,300,30,35        | 232,229,217 / #e8e5d9 |
| Grüner Bereich der Zeitkapsel   | 270,620,25,12        | 190,255,80 / #beff50  |

Diese Werte sind Videopixel einschließlich Beleuchtung und Kompression, keine ausgelesene Markenpalette oder direkt übertragbare Material-Albedos. Der endgültige Render muss gegen das Referenzbild abgeglichen werden; Licht und Tonemapping verändern Materialfarben.

Die Uhr hat einen gerundeten dunklen Rand, ein warmes Zifferblatt und weiche Zeiger-/Kontaktschatten. Beim grünen Sektor sind Füllung, klare Kante und Lichtschein als unterschiedliche Wirkungen zu gestalten. Ein blassgrünes Dreieck allein trifft den Eindruck nicht.

Die Kursivschrift ist schlanker und kontrastreicher als unsere synthetisch geneigte Fraunces. Die exakte Originalschrift ist weiterhin unbekannt. Für die nächste Annäherung einen echten Kursivschnitt anhand eigener Vergleichswörter prüfen, statt nur font-style:italic auf die vorhandene Schrift zu setzen.

Die Hintergrundzeichnungen sind locker verteilt und nicht als gleichmäßiges sichtbares Raster angeordnet. Zeichnung, Vignette, lokaler grüner Lichtschein und Schatten sollen unabhängig einstellbar bleiben.

## Rollen sind Erzählstruktur

Die Personenpillen kennzeichnen wiederkehrende Beteiligte mit wiedererkennbarem Symbol und aktivem bzw. ruhigem Zustand. Zeit, Ereignis und Objektbezeichnung sind andere Etikettarten.

Unsere Uhrprobe verwendete eine Rollenpille für das Ereignis „Abfahrt“. Das trifft die beobachtete Semantik nicht. Im eigenen Aufbau künftig ParticipantPill(roleId,icon,label,state) und ContextBadge(kind,value,anchor) trennen. Die Teilnehmeridentität bleibt über Objekt- und Medienwechsel hinweg erhalten.

## Strenge Beurteilung unserer bisherigen Arbeit

- Uhrgröße und Freiraum der letzten Probe liegen näher an der Referenz.
- Zifferblatt, Rand, Zeigerschatten und Mittelpunkt wirken noch kühler/flacher bzw. technischer.
- Der Zeitsektor braucht eine getrennt gestaltete Kontur und Lichtwirkung.
- Kursivschrift und Pillen müssen nach tatsächlicher Form statt nur Farbähnlichkeit abgestimmt werden.
- Die gleichförmig gekachelte Bühne wirkt generisch.
- Die stumme Uhrprobe zeigt nur einen Bildtyp. Vollbild-Kontext, Cutout, Grafik, Erzählrollen und Sprecherfassung fehlen als durchgehende Folge.
- Das KI-Kalenderbild liefert Materialdetails, seine warme braune Studiofläche und große Komposition sind keine passende fertige Kanaleinstellung.

## Technische Machbarkeit

Sehr ähnliche sichtbare Bildsprache ist mit Remotion, freigestellten eigenen Rasterassets, Masken, Schatten und gezielt eingesetztem 3D machbar. Viele beobachtete Wirkungen können als 2.5D-Compositing reproduziert werden: Bilder als getrennte Ebenen mit Größe, Position, Masken und Unschärfe animieren. Das ist ein möglicher eigener Produktionsweg, kein Beleg für die Software des Originalkanals.

Die vorhandenen Werkzeuge reichen. Mehr Skills oder ein Avatar-Dienst beseitigen die aktuellen gestalterischen Lücken nicht automatisch. Benötigt werden ein zusammenpassender Satz eigener Assets, präzisere Typografie, semantische Rollen und eine fertige eigene Sprecherfassung mit geprüftem Timing.

Pixelgleiche Ergebnisse sind ohne identifizierte Originalassets, Schrift, Effekte und genaue Zeitkurven nicht belegt. Originalsoftware, verwendete Bild-/Sprachmodelle und gehörte Stimme/Musik bleiben unverifiziert. Die automatische Whisper-Schätzung ersetzt kein Anhören.

## Nächster sinnvoller Formatnachweis

Ein zusammenhängendes18-Sekunden-Beispiel mit eigener Alltagssituation: realistischer heißer Tassen-Cutout und Teilnehmer(0–5s), grafischer Schnitt mit Wärmeabgabe(5–11s), ganzer Cafétisch mit denselben Rollen(11–16s), Rückkehr derselben nun lauwarmen Tasse(16–18s). Zwei eigene Rasterassets, eine eigene Grafik und vorhandene Werkzeuge reichen als Basis. Sachangaben für eine tatsächliche Produktion separat belegen.

Der Nachweis muss unterschiedliche Bildtypen und denselben Erzählzusammenhang verbinden. Eine weitere isolierte Uhrbewegung kann nur den Uhr-Look prüfen.

## Verworfene Messung

Ein automatischer Helligkeits-Tracker wurde im Uhr-/Dosenwechsel ausprobiert. Überlagerung und grüner Sektor teilten seine Maske; er wählte teilweise Objektfragmente. Daraus wurden keine Skalierungskurven, Zentren oder Original-Easings übernommen. Die Rohmessung bleibt als ungeprüftes Arbeitsmaterial lokal.
