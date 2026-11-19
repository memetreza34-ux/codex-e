# codex-e: Audit und Bereinigung

## Vorher
Der Repository-Stand besaß 33 vorgesehene Skills (elf eigene, zwölf Remotion, zehn ergänzende externe Bundles), zehn Rollen, mehrere Hochformat-Experimente, 3D-Assets sowie eine funktionierende Remotion-Werkstatt. Eine vollständige Langdoku-Pipeline war noch nicht vorhanden.

## Tatsächlich in diesem Review-Branch geändert
- Rollen von zehn auf sechs zielgerichtete Doku-Rollen reduziert.
- Vier redundante Agent-Dateien entfernt: art-director, compositing-artist, format-editor und reference-analyst.
- Die beiden Dateien des Kurzform-Skills shortform-dramaturgy entfernt.
- Externe optionale Skill-Imports für HyperFrames, HeyGen, Higgsfield und Anthropic Canvas aus dem automatischen Sync entfernt.
- Remotion-Skill-Sync auf fünf Kernanleitungen reduziert.
- Drei neue Doku-Skills und einen formalen Project-/Release-Check ergänzt.
- README und AGENTS.md auf dokumentarische Videos ausgerichtet.

## Bewusst noch erhalten
- Alte 9:16-Demos und Beispielmedien: sie werden in Remotion-Konfiguration, Referenz-/Framechecks und CI genutzt. Entfernen ohne Ersatztests würde den funktionierenden Code beschädigen.
- Optionale Medienprovider-Skripte: vorhanden, aber kein automatischer Kauf/Accountzugang. Zuerst Abhängigkeiten abklären, dann separat entkoppeln.
- Andere GitHub-Repositories und Git-Historie: nicht angetastet.

## Nicht behauptet
Keine externen Konten oder Abos geändert, keinen Google-Flow-MCP eingerichtet, keine TTS-Verbindung oder komplette Langdoku erzeugt. Ein JSON-Check ist keine Fakten- oder Bildrechtsprüfung.

## Nächster sicherer Abbau
Erst Langdoku-Komposition bauen, CI und kompletten 8–12-Minuten-Pilot testen; anschließend die nicht mehr benötigten Demo- und Providerkomponenten mitsamt Abhängigkeiten in einem weiteren separaten PR entfernen. So bleibt der Hauptbranch jederzeit wiederherstellbar.
