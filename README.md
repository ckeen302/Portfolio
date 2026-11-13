# Caden Keen — portfolio (handheld RPG)

A single-page portfolio built with Next.js and TypeScript in an original 8-bit style. The pixel room is drawn by hand on a 2D canvas; there are no UI or animation libraries.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Change what it says

All text lives in [`content/site.ts`](content/site.ts), worded as on the résumé. Edit that file and every section updates.

- **Résumé:** replace `public/Caden_Keen_Resume.pdf`.
- **Pixel art:** the project screens and the company logos are drawn in `components/Pixels.tsx`. The battle sprites live in `lib/sprites.ts` and the logos in `lib/logos.ts`.

## Publish

The site is live at https://ckeen302.github.io/Portfolio/. Every push to `main` rebuilds and republishes it (`.github/workflows/deploy.yml`); it takes about a minute.

## What's where

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Page composition |
| `app/globals.css` | All styling, including the day and night palettes |
| `components/Scene.tsx` | The animated pixel room (click the lamp for night mode; click the cat to send it to the desk and back; click the MIDI keyboard to play chords) |
| `components/Boot.tsx` | The start-up screen, shown once per browser session |
| `components/Mascot.tsx` | The cat out of its room: it turns up in each section (mark a spot with `data-cat`) |
| `lib/cat.ts` | How the cat is drawn in each pose (`node mocks/cat-preview.cjs` renders them all) |
| `components/Pixels.tsx` | The pixel versions of ChordCraft and PokéIQ, and the company logos |
| `lib/chords.ts`, `lib/player.ts` | The chord progressions and the chiptune player behind the Play button on ChordCraft |
| `lib/weather.ts` | The real weather over Newark, DE for the room's window (add `?weather=rain`, `snow`, `storm`, `fog`, `overcast`, `cloudy` or `fair` to the address to see each) |
| `components/Dialog.tsx` | The dialog box that types its lines out |
| `components/Menu.tsx` | The cursor menu used in the hero and contact sections |
| `components/TopBar.tsx` | Name, section links, sound and day/night switches |
| `lib/sfx.ts` | Optional button blips (off by default) |
| `lib/theme.ts` | Day / night: follows the real sky over Newark, DE; a visitor's own choice lasts for their session |
| `mocks/` | The design mockups that were considered |
