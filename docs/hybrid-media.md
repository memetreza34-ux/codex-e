# Fotos, Illustrationen und Modelle verbinden

Die Medienwahl folgt der Aussage im Skript und dem [Referenzleitfaden](../references/timswissen/format-guide.md). Fotos zeigen reale Erscheinung, Illustrationen vereinfachen und Modelle ermöglichen Perspektivwechsel oder bewegliche Teile. Entscheidend sind passende Objekte und sichtbare Veränderungen.

## Praktischer Ablauf

1. Briefing, Bildfolge und Art Direction klären. Die Skills reference-breakdown, shortform-dramaturgy und object-choreography unterstützen die Planung; [toolkit.md](toolkit.md) ordnet Rollen und Ergebnisse zu.
2. Kandidaten tatsächlich ansehen. Hauptmotiv, Hintergrund, Auflösung, Material, Freistellkanten und störende Schrift prüfen. Ungeeignete Kandidaten nicht als Produktionsassets übernehmen; media/rejected-candidates.json hält bisherige Entscheidungen fest.
3. Quelle, Urheber, Medientyp, Rechte und Änderungen erfassen. Echte Fotografie und KI-Bilder getrennt benennen. Public Domain braucht einen konkreten Nachweis; es ist keine automatische Gleichsetzung mit CC0. Neue KI-Bilder als ai-generated mit tatsächlichem Werkzeug und Prompt registrieren.
4. Dateien lokal unter public/assets ablegen und mit scripts/media/library.mjs registrieren. Der [Startimport](../media/bootstrap.json) enthält drei externe Medien; der [Medienbestand](../media/manifest.json) führt auch das eigene Uhrmodell. Vorhandene lokal veränderte Dateien werden beim Import erhalten; der Import bricht ab.
5. Prüfsummen und Formate kontrollieren, Credits erzeugen und die Medien in Remotion einbauen. Alle dafür vorgesehenen Befehle stehen in [tools.md](tools.md).
6. Perspektive, Licht, Schatten, Größe und Farben zusammen abstimmen. Repräsentative Frames und den tatsächlichen Export auf Kollisionen, Materialfehler und lesbare Bewegung prüfen. Technische QA ersetzt keine gestalterische Abnahme.

## Vorhandene Integrationsbausteine

- **MediaHero** lädt lokale Fotos oder Illustrationen aus public/ und unterstützt framebasierte Bildbewegung.
- **ModelAsset** lädt lokale GLB-Dateien. Benannte Knoten lassen sich absolut pro Frame drehen; keine aufeinander aufbauenden Echtzeit-Inkremente verwenden.
- **AssetEnvironment** lädt eine lokale HDRI für Modellreflexionen und Beleuchtung.

Die äußeren Wartebedingungen für GLB und HDRI müssen vor dem Mount von ThreeCanvas entstehen. Clock in HybridAssets und Stage in LeapDay zeigen das Muster. Ein erst innerhalb der verzögert gemounteten Canvas erzeugter delayRender kann für den ersten Frame zu spät kommen. onReady beendet die äußere Wartebedingung nach Laden und Zeichnen.

Das eigene Uhrmodell entsteht aus scripts/blender/make-clock.py und enthält benannte Eltern für Stunden-, Minuten- und Sekundenzeiger. Die Blender-Achsen werden beim GLB-Export nach Y-up konvertiert. Blender-Vorschaubild und tatsächlichen Three.js-Render getrennt prüfen, weil Material und Licht abweichen können.

## Beispiele und Quellen

HybridAssets ist eine neunsekündige technische Integrationsstudie aus Foto, freigestellter Illustration und Modell. Sie enthält keinen Ton und ist kein vollständiger Lernfilm. Schalttag verwendet die Bausteine in einer zusammenhängenden 30-Sekunden-Erklärung mit eigenem synthetischen Ton. Projektbezogene Skripte, Bildfolgen und Prüfungen liegen unter projects/.

Das registrierte NASA-Apollo-17-Bild ist ein Foto; die freigestellte Uhr von Vijay Verma / 3dicons ist eine Illustration. Die HDRI stammt von Poly Haven; die animierbare Studiouhr ist ein eigenes Modell. Vollständige Einzelquellen, Rechte und Änderungen stehen in [media/CREDITS.md](../media/CREDITS.md) und [media/manifest.json](../media/manifest.json).

## Generierte Medien

Für neue Bilder oder Bildbearbeitungen ein tatsächlich verfügbares passendes Werkzeug verwenden. Ergebnisse projektlokal speichern und Alpha erhalten. Zusätzliche Anbieter vor dem konkreten Auftrag auf Einrichtung, Anmeldung und Kosten prüfen. Installierte Anleitungen belegen keine erfolgreiche Generierung.

Anbieteranforderungen und Statusprüfung sind zentral in [tools.md](tools.md) und [toolkit/providers.json](../toolkit/providers.json) dokumentiert. Ein aktueller CLI-Bericht gehört unter ignoriertes work/provider-status.json. Hostwerkzeuge und Plugin-Verbindungen müssen im aktiven Auftrag separat geprüft werden.
