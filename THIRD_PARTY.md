# Quellen, Lizenzen und Medien

- **Remotion:** https://www.remotion.dev/docs/license — unterliegt eigenen Lizenzbedingungen. Eine funktionsfähige Installation ist keine Zusage über kostenfreie kommerzielle Nutzung für jede Teamgröße.
- **Offizielle Skills:** https://github.com/remotion-dev/skills, Commit `30d4553ecd46fbc5212fd0ff006ae43af522158b`. Lokal durch den offiziellen Installer bzw. `npm run skills:sync` installiert; nicht im Repository mitveröffentlicht.
- **React, Three.js, Zod und weitere Pakete:** Quellen und Versionen in `package-lock.json`; die jeweiligen Paketlizenzen gelten.
- **DM Sans, Fraunces, IBM Plex Mono:** über Fontsource, jeweils SIL Open Font License. `npm ci` kopiert benötigte Schriftdateien und zugehörige Lizenzen lokal nach `public/fonts`.
- **FORM-Beispielseite und animierte Grafiken:** eigene prozedurale Illustration. Die Marke und Seite sind fiktiv.
- **Demo-Ton:** synthetisch lokal erzeugte Töne; keine Fremdaufnahme und keine geklonte Stimme.
- **Afrika-Karte:** aus Natural Earth Admin 0, Maßstab 1:110 Mio., auf Afrika reduziert. Public Domain: https://www.naturalearthdata.com/about/terms-of-use/. Datensatz und Hinweise stehen in `projects/africa-study/sources.md`.
- **Referenzvideos:** werden verlinkt und als gestalterische Referenz betrachtet, nicht heruntergeladen oder in Ausgaben übernommen.

Für zukünftige Projektassets jeweils Quelle, Urheber, Erlaubnis/Lizenz und eventuelle Einschränkungen dokumentieren. Diese Notiz erteilt keine Lizenz an fremden Werken.

- Ergänzende Skills: Anthropic canvas-design und HeyGen HyperFrames-Bundles, festgelegte Herkunft und Commits unter extraSkillsSources in workspace.config.json. Die jeweiligen Upstream-Lizenzen gelten; die importierten Bundles werden nicht mitveröffentlicht.

- Weitere offizielle Skills: heygen-com/skills und higgsfield-ai/skills mit festen Commits in workspace.config.json; Bundles bleiben Git-ignore. Installation ist keine Accountverbindung.
- HeyGen CLI v0.11.0: https://github.com/heygen-com/heygen-cli/releases/tag/v0.11.0 — optionales lokales Werkzeug, plattformspezifische SHA-256 im toolkit/media-tools.lock.json; Binärdatei wird nicht mitveröffentlicht.
- Medienbibliothek: [vollständige Einzelquellen](media/CREDITS.md), Urheber, Rechte und Prüfsummen in media/manifest.json. NASA Apollo 17: Public Domain gemäß angegebenem Commons-Rechtenachweis. Uhrillustration: Vijay Verma / 3dicons, CC0. HDRI Studio Small 09: Sergej Majboroda / Poly Haven, CC0. Powered by Poly Haven für genutzte API-Metadaten.
- Eigenes Uhrmodell: scripts/blender/make-clock.py und public/assets/library/studio-clock.glb, prozedural erstellt, keine Fremdmodelle oder Fremdtexturen eingebettet. Blender selbst unterliegt seinen eigenen Lizenzbedingungen: https://www.blender.org/about/license/.

- **Schalttag:** eigener prozeduraler Papierkalender und eigene synthetische Klänge. Bereits registriertes NASA-Apollo-17-Foto und eigenes Uhrmodell wiederverwendet. Fachquellen und Näherungen unter projects/leap-day/sources.md. Keine Originalmedien oder Stimme des Referenzkanals übernommen.
