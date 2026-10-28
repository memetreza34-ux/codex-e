---
name: blender-props
description: "Erzeuge hochwertige, wiederverwendbare Blender-Objekte für Remotion, mit Materialien, animierbaren Knoten, GLB-Export und kontrollierten Prüfbildern."
---

Vorhandene Blender-Version mit blender --version prüfen. scripts/blender/make-clock.py zeigt den getesteten Weg. Im Hintergrundprozess eine eigene Szene erstellen; keine geöffneten Nutzerdateien überschreiben, keine globalen Add-ons oder Einstellungen ändern.

Die Silhouette und wesentliche Teile zuerst modellieren. Kanten beveln und Materialien passend zu realer Oberfläche einstellen. Kleine Details nur ergänzen, wenn sie in der Zielauflösung lesbar sind. HDRI aus der registrierten Bibliothek für nachvollziehbare Beleuchtung verwenden. Fremde Modelle nur mit dokumentierter Herkunft übernehmen.

Bewegliche Teile separat und eindeutig benennen. Vorne liegt beim Uhrbeispiel in Blender -Y, oben +Z; der GLB-Export konvertiert nach Y-up und Front +Z. Zeiger-Eltern heißen hour_hand, minute_hand und second_hand. Rotation im Film absolut pro Frame setzen, keine aufeinander aufbauenden Inkremente. Maßstab und Pivot kontrollieren.

Python-Quelle unter scripts/blender, GLB unter public/assets/library ablegen. Modell mit project-owned oder belegten Fremdrechten registrieren. Blender-Vorschaubild und tatsächlichen Three.js-Render ansehen: Material und Beleuchtung können abweichen. Beschriftung, Z-Fighting und verdeckte Teile prüfen. Ein erfolgreicher Export ist keine visuelle Abnahme.

Im bestehenden Remotion-Pfad ModelAsset plus AssetEnvironment nutzen. Kein zweites Studio oder Dashboard bauen. Für Modelle mit externen Texturen deren lokale Dateien und Herkunft ebenfalls aufnehmen. Das vorhandene Uhrmodell enthält nur prozedurale Materialien und Meshes.
