# Produktionsablauf – aktuell

Für neue Doku-Projekte gilt ausschließlich docs/documentary-runbook.md zusammen mit AGENTS.md und docs/documentary-architecture.md.

## Neue Projekte
1. npm run doku:new -- mein-thema "Ein aussagekräftiger Titel"
2. Fakten, Quellen und Claims recherchieren; keine Fakebelege.
3. Eigenständige Dramaturgie und Sprechertext freigeben.
4. Szenen mit echten Originalmedien, nachgewiesenen Rechten oder klaren erklärenden Animationen planen.
5. Tatsächliches Audio und reale Wortzeiten verwenden.
6. Szenen mittels Remotion/FFmpeg produzieren.
7. Vollständigen Export sehen/hören, Rechte und Fakten kontrollieren, sieben manuelle Freigabestufen dokumentieren.
8. npm run doku:check -- mein-thema (nur Strukturkontrolle, kein Upload).

## Legacy
Die früheren Animationsexperimente und Befehle npm run render und npm run qa bleiben für technische Regressionstests erhalten. Sie dürfen nicht als vollständig funktionierende Langdoku-Produktion ausgegeben werden.

Stand: Die neue Doku-Projektprüfung ist implementiert, die universelle Langdoku-Timeline und TTS-/Asset-Integrationen sind weitere Entwicklungsschritte.
