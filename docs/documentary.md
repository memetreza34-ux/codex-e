# Doku mit eigenem Material

## Drehen und sichten

Eine konkrete Frage pro Sequenz hilft bei der Auswahl. Eine gefilmte Handlung braucht Einstellungen, die Ort, Ablauf und Detail zeigen. Bei Interviews Raumton und Fragen mit aufnehmen. Aussagen mit Fundstelle oder Quell-Timecode belegen. [BBC Academy – Five Shot Sequence](https://www.youtube.com/watch?v=TJ7SRLHw02o) · [Mark Bone – dokumentarische Szene drehen](https://www.youtube.com/watch?v=FvozfEQ5UeY&t=325s) · [Documentary Film Academy – Paper Edit](https://www.youtube.com/watch?v=U0YLUnga_2g&t=1079s)

`npm ci` richtet die festgeschriebenen Pakete ein. FFmpeg und FFprobe sind für Import und QA nötig. Für ein lokales deutsches Transkript werden `whisper-cli` und ein mehrsprachiges GGML-Modell benötigt. Auf dem Mac liefert `brew install whisper-cpp` das CLI. Das Modell separat aus der offiziellen Sammlung laden und dessen Prüfsumme vergleichen. [whisper.cpp](https://github.com/ggml-org/whisper.cpp) · [Mehrsprachiges Tiny-Modell mit SHA-256](https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-tiny.bin)

```sh
npm run doku -- ingest pilot /absoluter/pfad/Interview.mov interview --source 'Eigene Aufnahme, 19.11.2026' --rights 'Eigene Produktion'
npm run doku -- transcribe pilot interview --model /absoluter/pfad/ggml-tiny.bin
```

Import erfasst Bild, Ton, Länge, eingebetteten Quell-Timecode, Herkunft, Rechte und SHA-256. Codex E referenziert die Originaldateien an ihrem Speicherort. Arbeitsdaten liegen in `work/doku/pilot/`. Drehmaterial und Transkripte bleiben lokal. Für große Aufnahmen kann Kdenlive eigene Proxys anlegen. Das Transkript liefert Millisekunden ab Anfang der extrahierten Tonspur. `audioStartMs` gibt deren Start in der Quelldatei an. Das Transkript bleibt bis zur Sichtung als `pending` markiert. [Kdenlive – Proxy-Clips](https://docs.kdenlive.org/en/getting_started/configure_kdenlive/configuration_proxy_clips.html)

## Einen Rohschnitt übergeben

O-Töne mit In/Out und Fundstelle auswählen. In einer JSON-Datei die `fps` des Schnitts und jede Spur mit ihren Clips eintragen. `at` ist der erste Frame in der Timeline. `in` ist der erste Quellframe, `out` der erste Frame danach. Bei 25 fps entsprechen 800 ms 20 Schnittframes. Quell-Timecodes aus der Kamera bleiben als Metadaten erhalten.

```json
{
  "title": "Interview und Einstieg",
  "fps": 25,
  "tracks": [
    {
      "kind": "Video",
      "name": "Bild",
      "clips": [{ "asset": "interview", "at": 0, "in": 20, "out": 145 }]
    },
    {
      "kind": "Audio",
      "name": "O-Ton",
      "clips": [
        {
          "asset": "interview",
          "at": 0,
          "in": 20,
          "out": 145,
          "evidence": "Interview, Antwort zu Frage 1"
        }
      ]
    }
  ]
}
```

```sh
npm run doku -- timeline pilot /absoluter/pfad/schnitt.json
npm run doku -- preview pilot work/doku/pilot/schnitt.otio
```

Die `.otio` in Kdenlive über das Menü **Datei** importieren. Clips und Track-Lücken bleiben in der Timeline adressierbar. Eine dort überarbeitete `.otio` kann ebenfalls an `preview` übergeben werden. Die Mediendateien müssen lokal verfügbar sein. Bei relativen Referenzen aus einem anderen Ordner hilft `--media-dir`. Titel aus `evidence` und Quellenangaben liegen in den OTIO-Clipmetadaten. Ihre Darstellung hängt vom Schnittprogramm ab. [Kdenlive – OpenTimelineIO](https://docs.kdenlive.org/en/user_interface/menu/file_menu.html)

Der Vorschau-Befehl nutzt den nativen Remotion-Import und legt dessen bearbeitbare Komposition samt lokaler Medienkopien in `work/doku/<projekt>/remotion-*/` ab. Der JSON-Bericht enthält den Einstiegspunkt und die zugehörige `publicDir`. Für den Studio-Aufruf `npx remotion studio <entry> --public-dir=<publicDir>` verwenden. `--final` rendert mit voller Auflösung. `--width` und `--height` setzen das Format, `--fps` kann die importierte Bildrate vorgeben. Der QA-Bericht unterscheidet Tonspur, exakt stumme Spur und gemessenen Pegel. Bei der Abnahme auf O-Ton, Synchronität, Belege und Verständlichkeit achten. Farbkorrekturen, Übergänge und Effekte je nach Schnittprogramm im Editor kontrollieren. [Remotion – Import und Grenzen](https://www.remotion.dev/docs/opentimeline/import)

## Quellen im Film zeigen

Für eine vorhandene Einstellung kann Remotion eine transparente Quellenzeile erzeugen. In einer JSON-Datei etwa `{"headline":"Auszug aus dem Bericht","source":"Herausgeber · Datum · Seite 4","fps":25,"seconds":5}` speichern. Das MOV als obere Bildspur in den Schnitt legen.

```sh
npm run doku -- evidence pilot /absoluter/pfad/einblendung.json
```

## Werkzeuge und Updates

- Remotion Studio WebMCP kann in einem kompatiblen Browser die Vorschau, Auswahl und Renderaufträge steuern. Für Transkripte im Browser sind ein Zusatzpaket und ein mehrsprachiges Modell nötig. [Remotion WebMCP](https://www.remotion.dev/docs/ai/webmcp)
- Kdenlive bietet Schnitt, Proxys und OTIO-Austausch. Premiere mit Text-Based Editing ist eine Option, wenn der Schnitt bereits dort liegt. [Kdenlive](https://kdenlive.org/download/) · [Premiere](https://helpx.adobe.com/in/premiere/desktop/edit-projects/edit-video-using-text-based-editing/overview-of-text-based-editing.html)
- Flow bietet Transkription und Zusammenbau, Adobe Quick Cut Highlight-Fassungen. MapLibre, QGIS und Blender können einzelne Karten oder räumliche Grafiken ergänzen. Für das Basisprojekt reichen die lokalen Befehle. [Adobe Quick Cut](https://www.adobe.com/adobe-connectors/adobe-for-chatgpt.html) · [MapLibre](https://maplibre.org/maplibre-gl-js/docs/) · [QGIS](https://qgis.org/) · [Blender](https://www.blender.org/)
- Kdenlive MCP und MakeMyClip sind Kandidaten für weitere Tests. Prüfpunkte sind Timecodes, getrennte Spuren und wiederholter Export auf macOS. [Kdenlive MCP](https://github.com/AMMIROSOH/Kdenlive-mcp) · [MakeMyClip](https://github.com/MakeMyClip/editor)
- Dependabot sucht täglich nach Remotion-Updates und bündelt sie in einem Pull Request. Alle `remotion`- und `@remotion/*`-Pakete auf denselben exakten Stand bringen. Vor der Übernahme Projektprüfung, Tests und einen Import mit Bild und Ton ausführen. [Remotion – Versionsabgleich](https://www.remotion.dev/docs/upgrade)
