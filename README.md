# Papierhelden

Ein handgezeichneter 2D-Action-Dungeon-Crawler für das Handy (Touch, Querformat), von oben gesehen. Du bist eine zerknüllte Seite, ein verworfener Entwurf. Die Welt ist ein abgebrochenes Buch, und der Rotstift streicht sie Kapitel für Kapitel aus.

## Aufbau

- `src/`: Quellcode (reines JavaScript, ein 2D-Canvas, keine Frameworks). `build.sh` setzt alle `src/*.js` und `src/h_head.html` zu einer einzigen `public/index.html` zusammen.
- `worker/index.js`: Cloudflare Worker, liefert `public/` aus und reicht `/ws` an das Durable Object `Dorf` weiter (Mehrspieler-Anwesenheit nur im Hub, nur Positionen).
- `wrangler.jsonc`: Static Assets plus Durable Object.
- `public/musik/`: hier liegen die MP3-Dateien (siehe unten). Fehlt eine Datei, spielt ein kleiner eingebauter Ersatz.

## Lokal ausprobieren

```
npm install
npm run dev        # baut und startet http://localhost:8787
```

## Veröffentlichen

```
npm run deploy
```

## Musik

Die Stücke kommen als MP3 nach `public/musik/` (nahtlos loopbar, instrumental, 1:30 bis 2:30). Dateinamen:

| Datei | Wann | Prompt |
|---|---|---|
| `hub.mp3` | Dorf, Titelbild | Cozy adventure village theme, warm acoustic guitar, pizzicato strings, glockenspiel and soft whistle, hopeful and playful, 90 BPM, loopable, no vocals |
| `bereich1.mp3` | Bibliothek | Mysterious exploration, music box, harpsichord, low cello drones, soft brushed percussion, creeping curiosity, 80 BPM, loopable, no vocals |
| `bereich2.mp3` | Tintenmeer | Dark epic exploration, wide choir pads, cello ostinato, distant taiko drums, ominous but beautiful, 100 BPM, loopable, no vocals |
| `boss1.mp3` | Bosskämpfe | Intense orchestral boss battle, driving strings, brass stabs, snare rolls, urgent rhythmic motif, 140 BPM, loopable, no vocals |
| `finalboss.mp3` | Rotstift | Epic final battle, full orchestra, organ, huge drums, choir, main hero motif in minor key building to a climax, 150 BPM, loopable, no vocals |
| `story.mp3` | Zwischenszenen | Emotional cinematic scene, solo piano and warm strings, slow, sad but hopeful, 60 BPM, no vocals |
| `sieg.mp3` | Sieg, Abspann | Uplifting victory and credits, gentle variation of the village theme, glockenspiel, strings, soft brass, warm and resolved, 100 BPM, no vocals |

Gemeinsames Hauptthema (fünf Töne): D, F, A, G, E. Der eingebaute Ersatz spielt es in jeder Stimmung.

## Admin-Feld

Am Desktop mit F2, auf dem Handy fünfmal schnell auf den Titel tippen (Titelbild) oder fünfmal auf die Lebensleiste im Spiel.
