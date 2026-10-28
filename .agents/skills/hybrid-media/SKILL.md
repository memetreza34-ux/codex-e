---
name: hybrid-media
description: "Plane und kombiniere echte Fotos, freigestellte Illustrationen, KI-Bilder und 3D-Modelle für kurze Erklärfilme mit konsistenter Bildsprache."
---

Lies Briefing, Referenzleitfaden und media/manifest.json. Wähle das Medium nach der Aussage: Fotos für reale Erscheinung, Illustrationen zum Vereinfachen, Modelle für Perspektivwechsel und bewegliche Teile. Nutze nicht automatisch Geometrie-Grundformen für jedes Objekt. HeyGen eignet sich optional für sichtbare Sprecher; ein Avatar verbessert keinen objektbasierten Wissensfilm von selbst.

Für jedes neue Asset zunächst Quelle, Urheber, Medientyp und Nutzungsrecht erfassen. Öffne Kandidaten vor der Verwendung. Prüfe Hauptmotiv, störende Schrift, Hintergrund, Material, Auflösung und Freistellkanten. Ungeeignete Treffer bleiben Kandidaten statt Produktionsassets. media/rejected-candidates.json hält die konkrete Entscheidung fest. Echte Fotografie und KI-Bilder immer auseinanderhalten.

Neue Bildgenerierung oder Bildbearbeitung mit dem verfügbaren nativen Bildwerkzeug ausführen. Projektgebundene Ergebnisse nach public/assets kopieren; Prompt und Werkzeug in generation erfassen. Alpha erhalten. Zusätzliche Anbieter nur nach Prüfung von Anmeldung, Auftrag und Kosten einsetzen. CLI-Installation oder Skills beweisen keine erfolgreiche Generierung. Keine Zugangsdaten einchecken.

Medien über scripts/media/library.mjs importieren bzw. registerAsset registrieren. Herkunft, Lizenz, Änderungen und Prüfsumme gehören ins Register. CC0 und Public Domain unterscheiden; letzteres braucht rightsReason. Bei unklaren Rechten ein geeignetes anderes Asset auswählen. media:verify und media:credits ausführen.

Fotos und Cutouts mit MediaHero, GLB mit ModelAsset und HDRI mit AssetEnvironment verwenden. Alle Medien lokal laden. Bei ThreeCanvas die äußeren delayRender-Wartebedingungen vor dem Canvas-Mount erzeugen und über onReady der Lader beenden; HybridAssets zeigt das getestete Muster. Perspektive, Licht, Schatten, Größe und Farben zusammen abstimmen. Animation aus useCurrentFrame ableiten. Ein sichtbarer Zustandswechsel soll eine Aussage erklären. Ein Foto bleibt ein Foto, auch wenn es leicht gezoomt wird.

Repräsentative Frames und Export prüfen. Ein kurzer Medientest ist kein fertiges Lernvideo. Tatsächlich geprüfte Bildqualität, Ton und offene Punkte getrennt dokumentieren.
