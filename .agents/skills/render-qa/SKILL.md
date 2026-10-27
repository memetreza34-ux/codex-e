---
name: render-qa
description: Rendere und prüfe eine Codex-E-Szene mit MP4, Kontaktbogen und technischem QA-Bericht vor der Lieferung.
---

Verwende `npm run doctor` bei einer neuen Umgebung und `npm run render -- SzenenID` für die Vorschau. `--final` exportiert die volle Auflösung. Der Export erzeugt MP4, `-sheet.jpg` und `.qa.json` unter `renders/`.

Die Konfiguration bevorzugt einen vorhandenen Chrome und deaktiviert Shared-Memory-Capture, weil hier bei System-Chrome bereits gekachelte Bildfehler aufgetreten sind. Diese Einstellung nicht ohne konkrete Prüfung entfernen.

Sehe den Kontaktbogen und gezielte Stellen im tatsächlichen MP4 an. Prüfe Lesbarkeit, Kollisionen, Anfang/Ende und die entscheidenden Bewegungen. Wenn Ton vorhanden ist, höre ihn an; technische Pegel allein beweisen keine Verständlichkeit. Bei einer reinen Sichtprüfung keine gehörte Tonprüfung behaupten.

Der automatische Bericht setzt `visualReview` auf `pending`. Nach einer echten Prüfung das Ergebnis mit Datum und konkretem Umfang im Projekt-`review.md` dokumentieren. Ein technischer Erfolg darf nicht als automatische kreative Abnahme erscheinen.

Liefere eine direkt sichtbare oder abspielbare Vorschau plus Link zur fertigen Datei. Gib relevante Einschränkungen konkret an.
