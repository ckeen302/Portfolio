"use client";

import { useEffect, useRef } from "react";
import { LOW, SETS, TONES } from "@/lib/chords";
import { DEX } from "@/lib/dex";
import { BAMBINO, DDS, UD, type Logo } from "@/lib/logos";
import { mascot } from "@/lib/mascot";
import { DAY, NIGHT, type Pal } from "@/lib/palette";
import { player } from "@/lib/player";
import { CHARIZARD, PIKACHU, type Sprite } from "@/lib/sprites";
import { getTheme, subscribeTheme } from "@/lib/theme";

/**
 * Pixel art drawn by hand on small canvases, in the same palette as the room:
 *   chordapp  ChordCraft, redrawn in pixels
 *   pokeapp   PokéIQ, redrawn in pixels
 *   ud / bambino / dds  the company logos in the Experience section
 * They run at a low frame rate, pause off screen, and follow day / night.
 */

export type PixelKind = "chordapp" | "pokeapp" | "hopapp" | "ud" | "bambino" | "dds";

const SIZE: Record<PixelKind, [number, number]> = {
  chordapp: [192, 120],
  pokeapp: [192, 120],
  hopapp: [192, 120],
  ud: [80, 56],
  bambino: [80, 56],
  dds: [80, 56],
};
const LABEL: Record<PixelKind, string> = {
  chordapp: "A pixel-art version of ChordCraft: a prompt is typed, Generate is pressed, eight chords appear in the piano roll and play back.",
  pokeapp: "A pixel-art version of PokéIQ cycling through five tabs of the real site: a Pokédle solved in four guesses, a PokéGuessr round (a place, the map opened from the corner, a pin dropped, the result), a battle between Pikachu and Charizard, a Who's That Pokémon quiz, and the Pokédex scrolling slowly from Bulbasaur on.",
  hopapp: "A pixel-art version of Monster Hop: a monster is picked on the menu, Play is pressed, and it bounces up from platform to platform, picking up a gem and shooting a flying enemy.",
  ud: "The University of Delaware logo, redrawn in pixels.",
  bambino: "The MyBambino logo, redrawn in pixels.",
  dds: "The Domain Driven Solutions logo, redrawn in pixels.",
};

type Draw = (r: (x: number, y: number, w: number, h: number, c: string | number) => void, t: number, tick: number) => void;

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const ease = (x: number) => {
  const k = x < 0 ? 0 : x > 1 ? 1 : x;
  return k * k * (3 - 2 * k);
};

/* 3×5 pixel letters ------------------------------------------------------- */
const FONT: Record<string, string> = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111", "4": "101101111001001",
  "5": "111100111001111", "6": "111100111101111", "7": "111001001001001", "8": "111101111101111", "9": "111101111001111",
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111",
  F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010",
  K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "111101101101111",
  P: "111101111100100", Q: "111101101111001", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010",
  Z: "111001010100111", ",": "000000000010100", ".": "000000000000010", "%": "101001010100101", "+": "000010111010000",
  "-": "000000111000000", "'": "010010000000000", "^": "000010101111000", "?": "111001010000010", "!": "010010010000010", "/": "001001010100100", ":": "000010000010000", " ": "000000000000000",
};
const text = (r: Parameters<Draw>[0], s: string, x: number, y: number, c: string | number) => {
  let cx = x;
  for (const ch of s) {
    const g = FONT[ch];
    if (g) for (let i = 0; i < 15; i++) if (g[i] === "1") r(cx + (i % 3), y + Math.floor(i / 3), 1, 1, c);
    cx += ch === "," || ch === "." || ch === ":" ? 3 : 4;
  }
};
const width = (s: string) => [...s].reduce((n, ch) => n + (ch === "," || ch === "." || ch === ":" ? 3 : 4), 0) - 1;
const frame = (r: Parameters<Draw>[0], x: number, y: number, w: number, h: number, c: string | number) => {
  r(x, y, w, 1, c);
  r(x, y + h - 1, w, 1, c);
  r(x, y, 1, h, c);
  r(x + w - 1, y, 1, h, c);
};

/* map pin ----------------------------------------------------------------- */
const pin = (r: Parameters<Draw>[0], x: number, y: number, c: string | number, lift: number) => {
  const py = y - 6 - Math.round(lift);
  r(x - 1, y, 3, 1, "k"); // shadow
  r(x - 2, py, 5, 4, "k");
  r(x - 1, py - 1, 3, 6, "k");
  r(x - 1, py, 3, 4, c);
  r(x, py + 4, 1, 2, c);
  r(x, py + 1, 1, 1, 0);
};
/* ChordCraft, redrawn in pixels ------------------------------------------ */
// Each chord's rows in the piano roll: row 13 is middle C, one row per semitone going up.
const ROWS = SETS.map((s) => s.names.map((n) => TONES[n].map((m) => 13 - (m - LOW))));
// While the visitor plays a progression out loud the screen follows the music; afterwards its
// own clock carries on from where the music left it.
let held: { set: number; a: number } | null = null;
let shift = 0;
const MOODS = ["DREAMY", "SAD", "EPIC", "JAZZ", "UPLIFTING"];
const chordapp: Draw = (r, t, tick) => {
  const live = player.now();
  if (!live && held) {
    shift = held.set * 10 + held.a - t;
    held = null;
  }
  const set = live ? live.set : Math.floor((t + shift) / 10) % SETS.length;
  const a = live ? 3.1 + live.at : (t + shift) % 10;
  if (live) held = { set, a };
  else player.setCue(set);
  const S = SETS[set];
  const rows = ROWS[set];
  const made = a < 2.2 ? 0 : Math.min(8, Math.floor((a - 2.2) / 0.09) + 1); // chords written so far
  const play = (a - 3.1) / 6.3; // 0..1 across the eight chords
  const bar = play >= 0 && play < 1 ? Math.floor(play * 8) : -1;

  r(0, 0, 192, 120, 3);
  // top bar
  r(0, 0, 192, 10, "k");
  text(r, "CHORD", 4, 3, 0);
  text(r, "CRAFT", 24, 3, "o");
  r(66, 2, 40, 7, "o");
  text(r, "GENERATOR", 68, 3, "k");
  text(r, "SONGS", 112, 3, 1);
  text(r, "PRESETS", 138, 3, 1);
  // sidebar
  r(0, 10, 45, 110, "k");
  text(r, "KEY", 4, 14, 2);
  frame(r, 4, 21, 37, 9, 2);
  text(r, S.key, 7, 23, 0);
  text(r, "MOOD", 4, 35, 2);
  MOODS.forEach((m, i) => {
    const on = i === S.mood;
    if (on) r(4, 42 + i * 10, 37, 8, "o");
    else frame(r, 4, 42 + i * 10, 37, 8, 3);
    text(r, m, 6, 44 + i * 10, on ? "k" : 1);
  });
  const pressed = a >= 1.8 && a < 2.2;
  r(4, 101, 37, 12, pressed ? "y" : "o");
  r(4, 112, 37, 1, pressed ? "o" : 0);
  text(r, "GENERATE", 7, 104, "k");
  // prompt
  frame(r, 49, 14, 139, 10, 2);
  const typed = S.prompt.slice(0, Math.floor(a * 13));
  text(r, typed, 52, 17, 0);
  if (tick % 4 < 2 && a < 2.4) r(52 + width(typed) + 2, 17, 1, 5, "o");
  // chord tiles
  for (let i = 0; i < 8; i++) {
    const x = 49 + i * 17.5;
    const on = i === bar;
    if (i < made) {
      r(Math.round(x), 28, 15, 13, on ? "o" : "k");
      if (!on) frame(r, Math.round(x), 28, 15, 13, 2);
      text(r, S.names[i], Math.round(x) + Math.floor((15 - width(S.names[i])) / 2), 32, on ? "k" : 0);
    } else frame(r, Math.round(x), 28, 15, 13, "k");
  }
  // piano roll
  r(49, 46, 139, 58, "k");
  for (let row = 0; row < 14; row++) {
    const y = 47 + row * 4;
    const black = [1, 3, 6, 8, 10].includes((13 - row) % 12);
    const sounding = bar >= 0 && rows[bar].includes(row);
    r(50, y, black ? 4 : 6, 3, sounding ? "o" : black ? 3 : 0);
    if (!black) r(57, y, 130, 3, 3);
  }
  for (let i = 0; i <= 8; i++) r(57 + Math.round(i * 16.25), 47, 1, 56, "k");
  rows.forEach((chord, i) => {
    if (i >= made) return;
    const x = 58 + Math.round(i * 16.25);
    const c = i === bar ? "o" : 1; // only the chord that is sounding is lit; the rest stay green, as in ChordCraft
    chord.forEach((row) => r(x, 47 + row * 4, 15, 3, c));
  });
  if (bar >= 0) r(57 + Math.round(play * 130), 46, 1, 58, 0);
  if (!made && a > 0.2) text(r, "NO PROGRESSION YET", 86, 72, 2);
  // transport
  r(49, 108, 139, 10, "k");
  r(51, 109, 9, 8, bar >= 0 ? "y" : "o");
  r(54, 111, 1, 4, "k");
  r(55, 112, 1, 2, "k");
  r(56, 113, 1, 1, "k");
  text(r, `${S.bpm} BPM`, 64, 111, 0);
  r(100, 113, 60, 1, 2);
  r(100 + Math.round(Math.max(0, Math.min(1, play)) * 58), 111, 2, 5, "o");
  text(r, "MIDI", 168, 111, 1);
};

/* PokéIQ, redrawn in pixels ---------------------------------------------- */
const LW = 180;
const LH = 78;
const isle = new Uint8Array(LW * LH);
{
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = (x - xi) * (x - xi) * (3 - 2 * (x - xi));
    const v = (y - yi) * (y - yi) * (3 - 2 * (y - yi));
    const h = (p: number, q: number) => hash(p * 41 + q * 113 + 9);
    return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
  };
  for (let y = 0; y < LH; y++)
    for (let x = 0; x < LW; x++) {
      const f = 0.6 * noise(x / 26 + 2, y / 20 + 5) + 0.4 * noise(x / 10 + 8, y / 9 + 1);
      const edge = Math.min(1, Math.min(x, LW - 1 - x, y, LH - 1 - y) / 10);
      const v = f * (0.5 + 0.5 * edge);
      isle[y * LW + x] = v > 0.6 ? 2 : v > 0.47 ? 1 : 0;
    }
}
const onIsle = (x: number, y: number): [number, number] => {
  for (let rad = 0; rad < 40; rad++)
    for (let dy = -rad; dy <= rad; dy++)
      for (let dx = -rad; dx <= rad; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px > 6 && px < LW - 6 && py > 10 && py < LH - 4 && isle[py * LW + px]) return [px, py];
      }
  return [x, y];
};
const GUESSES = ([[44, 30, 96, 48], [130, 26, 92, 44]] as const).map(([a, b, c, d]) => [...onIsle(a, b), ...onIsle(c, d)] as [number, number, number, number]);
// The tabs shown, in the order they have on the real site.
const TABS = ["POKEDLE", "GUESSR", "BATTLE", "QUIZZES", "POKEDEX"];
// Charizard and Pikachu (lib/sprites.ts), as runs of same-coloured pixels.
type Run = [number, number, number, string];
const runs = (s: Sprite): Run[] => {
  const out: Run[] = [];
  s.rows.forEach((line, y) => {
    let x = 0;
    while (x < line.length) {
      const ch = line[x];
      let n = 1;
      while (x + n < line.length && line[x + n] === ch) n += 1;
      if (ch !== ".") out.push([x, y, n, ch === "#" ? "k" : s.colors[parseInt(ch, 36)]]);
      x += n;
    }
  });
  return out;
};
const FAR = runs(CHARIZARD);
const NEAR = runs(PIKACHU);
const blit = (r: Parameters<Draw>[0], sprite: Run[], x: number, y: number, flash?: string | number) => {
  for (const [sx, sy, n, c] of sprite) r(x + sx, y + sy, n, 1, flash ?? c);
};
const spark = (r: Parameters<Draw>[0], x: number, y: number) => {
  r(x - 5, y, 11, 1, "o");
  r(x, y - 5, 1, 11, "o");
  r(x - 2, y - 2, 5, 5, "o");
  r(x - 1, y - 1, 3, 3, 0);
};
const MOVES = ["THUNDERBOLT", "QUICK ATTACK", "IRON TAIL", "VOLT TACKLE"];
const MOVE_INK = ["y", 1, 2, "o"];
const GREEN = "#5fbf6a";
type R = Parameters<Draw>[0];
// How long each tab is shown, in seconds: Pokédle, PokéGuessr, Battle, the quiz, the Pokédex.
const SHOWN = [6.6, 8, 7, 5.4, 9];
// The Pokédex entries as runs of pixels, and the colour of each type's label.
const DEX_ART = DEX.map((d) => runs(d.art));
const TYPE_INK: Record<string, string | number> = { GRASS: GREEN, POISON: "#b98ad0", FIRE: "o", FLYING: 1, WATER: "s", BUG: "y" };
const QUIZ = ["RAICHU", "PIKACHU", "PICHU", "PLUSLE"];
const size = (s: Sprite): [number, number] => [Math.max(...s.rows.map((line) => line.length)), s.rows.length];
const LOOP = SHOWN.reduce((n, d) => n + d, 0);
/** The world map, drawn into any rectangle (the small map in the corner, the open one, the result). */
const world = (r: R, x: number, y: number, w: number, h: number) => {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const v = isle[Math.min(LH - 1, Math.floor((j / h) * LH)) * LW + Math.min(LW - 1, Math.floor((i / w) * LW))];
      r(x + i, y + j, 1, 1, v === 2 ? "d" : v === 1 ? 1 : 3);
    }
  frame(r, x - 1, y - 1, w + 2, h + 2, "k");
};
const pointer = (r: R, x: number, y: number) => {
  [1, 2, 3, 4, 5, 3, 1].forEach((n, j) => r(x - 1, y + j - 1, n + 2, 1, "k"));
  [1, 2, 3, 4, 2].forEach((n, j) => r(x, y + j, n, 1, 0));
};
const tree = (r: R, x: number, y: number) => {
  r(x + 2, y, 6, 2, 3);
  r(x, y + 2, 10, 6, 3);
  r(x + 1, y + 8, 8, 1, 3);
  r(x + 2, y + 2, 3, 2, 2);
  r(x + 4, y + 9, 2, 3, "k");
};
/** The place to be guessed: a route seen from above, with the player standing on the path. */
const place = (r: R) => {
  r(0, 10, 192, 110, 1);
  for (let i = 0; i < 46; i++) r(Math.floor(hash(i) * 190), 12 + Math.floor(hash(i + 60) * 104), 2, 1, 2);
  // a pond
  r(14, 30, 36, 18, 2);
  r(16, 32, 32, 14, "s");
  r(22, 36, 8, 1, 0);
  r(34, 41, 6, 1, 0);
  // the path, with a turn up to the house
  r(0, 62, 126, 16, 2);
  r(0, 64, 124, 12, 0);
  r(108, 46, 18, 20, 2);
  r(110, 46, 14, 30, 0);
  // the house
  r(126, 18, 48, 4, "o");
  r(122, 22, 56, 10, "o");
  r(122, 30, 56, 2, "k");
  r(126, 32, 48, 16, 0);
  r(126, 47, 48, 1, "k");
  r(112, 34, 10, 12, "k");
  r(113, 35, 8, 11, 3);
  r(132, 36, 8, 6, 3);
  r(160, 36, 8, 6, 3);
  r(146, 36, 8, 12, "k");
  // a fence and a sign
  for (let x = 130; x < 190; x += 6) r(x, 54, 2, 6, 0);
  r(130, 56, 60, 1, 0);
  r(94, 52, 10, 6, 0);
  r(98, 58, 2, 4, "k");
  r(96, 54, 6, 1, "k");
  // trees along the top and the bottom, and flowers
  [0, 12, 24, 58, 70, 82].forEach((x) => tree(r, x, 12));
  [2, 16, 30, 44, 58, 72, 150, 164, 178].forEach((x, i) => tree(r, x, 84 + (i % 2) * 4));
  [0, 14, 28, 42, 56].forEach((x) => tree(r, x + 4, 104));
  [[60, 50], [66, 54], [72, 49], [140, 70], [146, 74], [100, 90], [106, 94]].forEach(([x, y]) => {
    r(x, y, 2, 2, "o");
    r(x, y + 2, 2, 1, 2);
  });
  // the player, from behind: cap, hair, jacket, bag
  r(79, 77, 10, 2, 2);
  r(80, 60, 8, 3, "o");
  r(80, 63, 8, 3, "k");
  r(79, 66, 10, 8, 3);
  r(81, 67, 6, 6, "y");
  r(80, 74, 3, 4, "k");
  r(85, 74, 3, 4, "k");
};
const lerp = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);
// Pokédle: the guesses, and for each of the seven columns 0 wrong, 1 close, 2 right (and whether the answer is lower)
const DLE_NAMES = ["GYARADOS", "GARCHOMP", "RAICHU", "PIKACHU"];
const DLE = [[2, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 1], [2, 2, 2, 1, 1, 1, 1], [2, 2, 2, 2, 2, 2, 2]];
const DLE_DOWN = [3, 4];
const pokeapp: Draw = (r, t, tick) => {
  let a = t % LOOP;
  let mode = 0;
  while (a >= SHOWN[mode]) a -= SHOWN[mode++];

  if (mode === 1) {
    // PokéGuessr, as it is played: look at the place, open the map in the corner, drop a pin, guess
    const g = GUESSES[Math.floor(t / LOOP) % GUESSES.length];
    const dist = Math.hypot(g[2] - g[0], g[3] - g[1]);
    if (a < 3.9) {
      place(r);
      r(72, 10, 48, 10, "k");
      text(r, "ROUND 3/5", 79, 13, 0);
      r(152, 12, 38, 9, "k");
      text(r, "SCORE", 155, 14, 2);
      text(r, "0", 183, 14, "y");
      const open = ease((a - 1.6) / 0.5); // the map grows when the pointer is on it
      const mx = lerp(130, 78, open);
      const my = lerp(84, 48, open);
      const mw = lerp(56, 108, open);
      const mh = lerp(24, 60, open);
      world(r, mx, my, mw, mh);
      const px = mx + Math.round((g[0] / LW) * mw);
      const py = my + Math.round((g[1] / LH) * mh);
      const pinned = a >= 3;
      if (pinned) pin(r, px, py, 0, a < 3.25 ? (1 - (a - 3) / 0.25) * 8 : 0);
      const pressed = a >= 3.75;
      r(mx - 1, 110, mw + 2, 9, pinned ? (pressed ? "y" : GREEN) : "k");
      const say = pinned ? "GUESS" : open > 0.5 ? "PLACE YOUR PIN ON THE MAP" : "PLACE YOUR PIN";
      text(r, say, mx + Math.floor((mw - width(say)) / 2), 112, pinned ? "k" : 2);
      // the pointer: over to the map, to the spot, down to the button
      const stops: [number, number, number][] = [[0, 104, 58], [1, 104, 58], [1.6, 158, 96], [2.2, 158, 96], [2.9, px, py], [3.25, px, py], [3.7, mx + mw / 2, 114], [9, mx + mw / 2, 114]];
      const i = stops.findIndex((s) => s[0] > a) - 1;
      const k = ease((a - stops[i][0]) / (stops[i + 1][0] - stops[i][0]));
      pointer(r, lerp(stops[i][1], stops[i + 1][1], k), lerp(stops[i][2], stops[i + 1][2], k));
    } else {
      // the result: the whole map, a line from the guess to the real place, and the points
      const v = a - 3.9;
      r(0, 10, 192, 110, 3);
      world(r, 6, 13, 180, 80);
      const at = (x: number, y: number): [number, number] => [6 + Math.round((x / LW) * 180), 13 + Math.round((y / LH) * 80)];
      const [x0, y0] = at(g[0], g[1]);
      const [x1, y1] = at(g[2], g[3]);
      const steps = Math.round(Math.hypot(x1 - x0, y1 - y0));
      const reach = ease((v - 0.3) / 0.9);
      for (let s = 2; s < steps * reach; s++) if (s % 3 !== 2) r(Math.round(x0 + ((x1 - x0) * s) / steps), Math.round(y0 + ((y1 - y0) * s) / steps), 1, 1, 0);
      pin(r, x0, y0, 0, 0);
      if (v > 1.2) pin(r, x1, y1, "o", v < 1.5 ? (1 - (v - 1.2) / 0.3) * 10 : 0);
      r(72, 10, 48, 10, "k");
      text(r, "ROUND 3", 83, 13, 0);
      r(0, 95, 192, 25, "k");
      const pts = v > 1.4 ? Math.round(5000 * Math.exp(-dist / 60) * ease((v - 1.4) / 1)) : 0;
      text(r, `${pts.toLocaleString("en-US")} PTS`, 6, 99, "y");
      r(6, 107, 96, 3, 3);
      r(6, 107, Math.round(96 * (pts / 5000)), 3, GREEN);
      if (v > 1.4) {
        text(r, "ROUTE 1, KANTO", 6, 113, 0);
        text(r, `${Math.round(dist / 4)} SQUARES AWAY`, 70, 113, 2);
      }
      r(134, 100, 52, 11, GREEN);
      text(r, "NEXT ROUND", 141, 103, "k");
    }
  } else if (mode === 0) {
    // Pokédle: a name is typed, and its row turns over one square at a time
    r(0, 10, 192, 110, 3);
    text(r, "GUESS THE MYSTERY POKEMON", 46, 14, 0);
    const n = Math.min(3, Math.floor(a / 1.4)); // the guess being made
    const u = a - n * 1.4;
    const solved = a > 5.4;
    frame(r, 40, 22, 112, 11, solved ? GREEN : "o");
    if (solved) text(r, "SOLVED IN 4 OF 8", 44 + Math.floor((104 - width("SOLVED IN 4 OF 8")) / 2), 25, GREEN);
    else if (u < 0.6) {
      const typed = DLE_NAMES[n].slice(0, Math.ceil((u / 0.5) * DLE_NAMES[n].length));
      text(r, typed, 44, 25, 0);
      if (tick % 4 < 2) r(45 + width(typed) + 1, 25, 1, 5, "o");
    } else text(r, `GUESS ${Math.min(4, n + 2)} OF 8`, 44, 25, 2);
    text(r, "POKEMON", 6, 37, 2);
    ["GEN", "TY1", "TY2", "HT", "WT", "COL", "STG"].forEach((h, i) => text(r, h, 50 + i * 20 + Math.floor((18 - width(h)) / 2), 37, 2));
    for (let j = 0; j < 4; j++) {
      const y = 45 + j * 13;
      const done = j < n || (j === n && u >= 0.6);
      frame(r, 6, y, 42, 11, done ? 2 : "k");
      if (done) text(r, DLE_NAMES[j], 9, y + 3, 0);
      for (let i = 0; i < 7; i++) {
        const x = 50 + i * 20;
        if (!(j < n || (j === n && u >= 0.6 + i * 0.1))) {
          frame(r, x, y, 18, 11, "k");
          continue;
        }
        const v = DLE[j][i];
        r(x, y, 18, 11, v === 2 ? GREEN : v === 1 ? "y" : "k");
        if (v === 0) frame(r, x, y, 18, 11, 2);
        if (v === 2) {
          r(x + 6, y + 6, 2, 2, "k");
          r(x + 8, y + 4, 2, 2, "k");
          r(x + 10, y + 2, 2, 2, "k");
          r(x + 5, y + 4, 1, 2, "k");
        } else if (DLE_DOWN.includes(i)) {
          // the answer is lower: an arrow pointing down
          const c = v === 1 ? "k" : 2;
          r(x + 8, y + 2, 2, 4, c);
          r(x + 6, y + 5, 6, 1, c);
          r(x + 7, y + 6, 4, 1, c);
          r(x + 8, y + 7, 2, 1, c);
        } else r(x + 7, y + 5, 4, 1, v === 1 ? "k" : 2);
      }
    }
    text(r, "GREEN: RIGHT   YELLOW: CLOSE", 6, 100, 2);
    r(6, 108, 180, 1, "k");
    text(r, "DAILY   PRACTICE   ARCHIVE", 6, 112, 2);
  } else if (mode === 2) {
    // Battle: Pikachu and Charizard trade hits, health bars drain, a move is picked each turn
    r(0, 10, 192, 110, 3);
    const turn = Math.floor(a / 1.4);
    const u = a % 1.4;
    const foe = Math.max(0.06, 1 - 0.22 * (turn + ease((u - 0.48) / 0.4)));
    const you = Math.max(0.2, 1 - 0.09 * (turn + ease((u - 1.13) / 0.27)));
    const lungeYou = u > 0.3 && u < 0.48;
    const hitFoe = u >= 0.48 && u < 0.78;
    const lungeFoe = u > 0.95 && u < 1.13;
    const hitYou = u >= 1.13;
    const bob = Math.floor(t * 2) % 2;
    // the field: the ground runs back to a horizon
    r(0, 46, 192, 38, "k");
    r(0, 46, 192, 1, 2);
    [54, 64, 76].forEach((y) => r(0, y, 192, 1, 3));
    for (let i = -3; i < 10; i++) for (let y = 47; y < 84; y += 2) r(96 + Math.round((i - 3.5) * (10 + (y - 46) * 0.9)), y, 1, 1, 3);
    const label = `TURN ${1 + turn}`;
    r(100, 12, 30, 9, "k");
    text(r, label, 115 - Math.floor(width(label) / 2), 14, 2);
    // far side
    r(6, 12, 90, 16, "k");
    frame(r, 6, 12, 90, 16, 2);
    text(r, "CHARIZARD", 9, 15, 0);
    text(r, "LV50", 93 - width("LV50"), 15, 2);
    r(9, 22, 84, 4, 3);
    r(9, 22, Math.round(84 * foe), 4, foe < 0.3 ? "o" : GREEN);
    r(134, 55, 42, 3, 3);
    const fx = 124 + (lungeFoe ? -4 : hitFoe ? (tick % 2 ? 2 : -1) : 0);
    const fy = 10 + (lungeFoe ? 3 : hitFoe ? 0 : bob);
    blit(r, FAR, fx, fy, hitFoe && tick % 2 ? 0 : undefined);
    if (hitFoe && u < 0.66) spark(r, 154, 36);
    // near side
    r(28, 80, 36, 3, 3);
    const nx = 20 + (lungeYou ? 4 : hitYou ? (tick % 2 ? -2 : 1) : 0);
    const ny = 36 + (lungeYou ? -3 : hitYou ? 0 : 1 - bob);
    blit(r, NEAR, nx, ny, hitYou && tick % 2 ? 0 : undefined);
    if (hitYou && u < 1.3) spark(r, 46, 62);
    r(98, 62, 90, 16, "k");
    frame(r, 98, 62, 90, 16, 2);
    text(r, "PIKACHU", 101, 65, 0);
    text(r, "LV50", 185 - width("LV50"), 65, 2);
    r(101, 72, 84, 4, 3);
    r(101, 72, Math.round(84 * you), 4, GREEN);
    // what just happened, then the four moves
    const cur = turn % 4;
    r(6, 85, 180, 10, "k");
    frame(r, 6, 85, 180, 10, 0);
    text(r, u < 0.3 ? "WHAT WILL PIKACHU DO" : u < 0.95 ? `PIKACHU USED ${MOVES[cur]}` : "CHARIZARD USED FLAMETHROWER", 10, 88, 0);
    MOVES.forEach((m, i) => {
      const x = 6 + (i % 2) * 91;
      const y = 97 + Math.floor(i / 2) * 11;
      r(x, y, 89, 10, MOVE_INK[i]);
      text(r, m, x + 4, y + 3, "k");
      if (i === cur && tick % 4 < 3) frame(r, x, y, 89, 10, 0);
    });
  } else if (mode === 3) {
    // the quiz: Who's that Pokémon? A shadow on a burst of colour, four names, then the answer
    r(0, 10, 192, 110, 3);
    const known = a >= 2.6;
    text(r, "WHO'S THAT POKEMON?", 6, 14, 0);
    const score = `SCORE ${known ? "800" : "700"}`;
    text(r, score, 186 - width(score), 14, "y");
    const spin = Math.floor(t * 3) % 2;
    for (let y = 0; y < 76; y += 2)
      for (let x = 0; x < 88; x += 2) {
        const band = Math.floor(((Math.atan2(y - 38, x - 44) + Math.PI) / Math.PI) * 9) + spin;
        r(6 + x, 22 + y, 2, 2, band % 2 ? "o" : "y");
      }
    frame(r, 6, 22, 88, 76, "k");
    const [pw, ph] = size(PIKACHU);
    blit(r, NEAR, 50 - Math.floor(pw / 2), 58 - Math.floor(ph / 2) + (known ? Math.floor(t * 2) % 2 : 0), known ? undefined : "k");
    if (known) {
      r(7, 86, 86, 11, "k");
      text(r, "IT'S PIKACHU!", 50 - Math.floor(width("IT'S PIKACHU!") / 2), 89, "y");
    }
    QUIZ.forEach((name, i) => {
      const y = 22 + i * 19;
      const right = i === 1;
      const on = a >= 2.1 && right;
      r(100, y, 86, 16, known && right ? GREEN : on ? 0 : "k");
      if (!(known && right) && !on) frame(r, 100, y, 86, 16, 2);
      text(r, name, 106, y + 6, on || (known && right) ? "k" : 0);
      if (known && right) {
        r(172, y + 8, 2, 2, "k");
        r(174, y + 6, 2, 2, "k");
        r(176, y + 4, 2, 2, "k");
        r(170, y + 6, 2, 2, "k");
      }
    });
    if (a > 1.3 && a < 2.6) pointer(r, lerp(120, 150, ease((a - 1.3) / 0.7)), lerp(84, 50, ease((a - 1.3) / 0.7)));
    r(6, 102, 180, 4, "k");
    r(6, 102, Math.round(180 * (1 - Math.min(a, 2.6) / 5.4)), 4, known ? GREEN : "o");
    text(r, known ? "CORRECT  STREAK 8" : "STREAK 7", 6, 111, known ? GREEN : 2);
    text(r, "QUESTION 8/10", 186 - width("QUESTION 8/10"), 111, 2);
  } else if (mode === 4) {
    // the Pokédex: the entries from No. 0001 on, three to a row, scrolling slowly past
    r(0, 10, 192, 110, 3);
    const pitch = 57;
    const most = Math.ceil(DEX.length / 3) * pitch - 74;
    const scroll = Math.max(0, Math.min(most, (a - 0.8) * 17));
    DEX.forEach((d, i) => {
      const x = 6 + (i % 3) * 60;
      const y = 47 + Math.floor(i / 3) * pitch - Math.round(scroll);
      if (y > 120 || y + 54 < 44) return;
      r(x, y, 57, 54, "k");
      frame(r, x, y, 57, 54, 2);
      text(r, `NO.${String(i + 1).padStart(4, "0")}`, x + 3, y + 3, 2);
      blit(r, DEX_ART[i], x + 14, y + 8);
      text(r, d.name, x + 3, y + 39, 0);
      let px = x + 3;
      d.types.forEach((type) => {
        r(px, y + 46, width(type) + 2, 6, TYPE_INK[type]);
        text(r, type, px + 1, y + 46, "k");
        px += width(type) + 4;
      });
    });
    // the top of the page stays put over the list
    r(0, 10, 192, 35, 3);
    text(r, "POKE", 6, 14, 0);
    text(r, "DEX", 22, 14, "o");
    text(r, "1,025 POKEMON", 186 - width("1,025 POKEMON"), 14, 2);
    frame(r, 6, 22, 180, 10, 2);
    text(r, "SEARCH NAME OR NUMBER", 10, 25, 2);
    let cx = 6;
    ["FIRE", "WATER", "GRASS", "BUG", "FLYING", "POISON"].forEach((name) => {
      r(cx, 35, width(name) + 4, 8, TYPE_INK[name]);
      text(r, name, cx + 2, 37, "k");
      cx += width(name) + 7;
    });
    // how far down the list it has got
    r(188, 47, 2, 72, "k");
    r(188, 47 + Math.round((scroll / most) * 52), 2, 20, "o");
  }

  // the site's bar and its tabs, over whatever is showing
  r(0, 0, 192, 10, "k");
  r(2, 2, 6, 6, "o");
  r(2, 5, 6, 1, "k");
  r(4, 4, 2, 2, 0);
  let tx = 14;
  TABS.forEach((name, i) => {
    const on = i === mode;
    text(r, name, tx, 3, on ? 0 : 2);
    if (on) r(tx, 9, width(name), 1, "o");
    tx += width(name) + 7;
  });
};

/* company logos, redrawn in pixels --------------------------------------- */
type LogoRun = [number, number, number, string];
const logoRuns = (rows: string[]): LogoRun[] => {
  const out: LogoRun[] = [];
  rows.forEach((line, y) => {
    let x = 0;
    while (x < line.length) {
      const ch = line[x];
      let n = 1;
      while (x + n < line.length && line[x + n] === ch) n += 1;
      if (ch !== ".") out.push([x, y, n, ch]);
      x += n;
    }
  });
  return out;
};
const logo = (l: Logo): Draw => {
  const base = logoRuns(l.rows);
  const sprite = l.sprite ? logoRuns(l.sprite.rows) : [];
  return (r, t) => {
    // no backdrop: the logo sits straight on the card. Every few seconds a highlight sweeps across it
    const sweep = ((t % 5) / 1.3) * 150 - 10;
    const paint = (list: LogoRun[], ox: number, oy: number) => {
      for (const [x, y, n, c] of list) {
        r(ox + x, oy + y, n, 1, c);
        if (c !== "0" && c !== "i") continue;
        const lo = Math.max(x, Math.ceil(sweep - 2 - y));
        const hi = Math.min(x + n - 1, Math.floor(sweep + 2 - y));
        if (hi >= lo) r(ox + lo, oy + y, hi - lo + 1, 1, c === "i" ? "o" : "y");
      }
    };
    paint(base, 0, 0);
    l.dots?.forEach(([x, y], i) => r(x, y, 1, 1, (i + l.dots!.length - (Math.floor(t * 4) % l.dots!.length)) % l.dots!.length === 0 ? "i" : "o"));
    // the dragonfly hovers, and darts up out of reach when the cat swipes at it
    if (l.sprite) paint(sprite, l.sprite.x - (mascot.swat ? 2 : 0), l.sprite.y + (mascot.swat ? -3 : Math.floor(t * 1.6) % 2));
  };
};

/* Monster Hop, redrawn in pixels ----------------------------------------- */
const LIME = "#9bd94a";
const VIOLET = "#b98ad0";
// Gloop, the first monster: one eye, an antenna, four little feet.
const GLOOP = ["....g....", "....g....", "..ggggg..", ".ggggggg.", ".gg000gg.", ".gg0k0gg.", ".ggggggg.", ".ggggggg.", ".g.g.g.g."];
const stampRows = (r: R, rows: string[], x: number, y: number, ink: Record<string, string | number>) =>
  rows.forEach((line, j) => {
    for (let i = 0; i < line.length; i++) if (line[i] !== ".") r(x + i, y + j, 1, 1, ink[line[i]]);
  });
const GLOOP_INK = { g: LIME, "0": 0, k: "k" };
// The five monsters on the menu, as the colour of each.
const AVATARS = [LIME, VIOLET, "o", "s", 0];
const HOP = 0.62; // seconds from one platform to the next
const RISE = 15; // how much higher each platform is
const ledgeX = (k: number) => 24 + Math.floor(hash(k * 3 + 1) * 130);
const hopapp: Draw = (r, t, tick) => {
  const a = t % 13;
  // the dusk sky, with a few fireflies
  r(0, 0, 192, 120, 3);
  for (let y = 60; y < 120; y += 2) for (let x = (y / 2) % 2; x < 192; x += Math.max(2, Math.floor((126 - y) / 8))) r(x, y, 1, 1, 2);
  for (let i = 0; i < 14; i++) if (hash(i * 5 + Math.floor(t * 1.2)) > 0.3) r(Math.floor(hash(i) * 190), Math.floor(hash(i + 30) * 100), 1, 1, i % 3 ? 0 : "y");

  const playing = a >= 2.4;
  const g = playing ? a - 2.4 : 0; // seconds into the run
  const k = Math.floor(g / HOP); // the platform it last bounced off
  const u = (g % HOP) / HOP;
  const cam = (k + ease(u)) * RISE; // how far the view has climbed
  const toY = (h: number) => 96 - (h - cam);

  // the hills it starts from, left behind as it climbs
  const ground = 104 + Math.round(cam);
  if (ground < 120) {
    for (let x = 0; x < 192; x++) r(x, ground + Math.round(4 * Math.sin(x / 22) + 2 * Math.sin(x / 9 + 1)), 1, 120, "k");
    [30, 118, 150].forEach((x) => {
      r(x, ground - 7, 1, 8, "k");
      r(x - 1, ground - 4, 3, 4, "k");
      r(x - 2, ground - 1, 5, 2, "k");
    });
  }
  // platforms: the ones it uses, and others either side
  for (let j = k - 2; j < k + 9; j++) {
    if (j < 0) continue;
    const y = toY(j * RISE);
    const bounced = playing && j === k && u < 0.25 ? 1 : 0;
    r(ledgeX(j), y + bounced, 16, 3, GREEN);
    r(ledgeX(j) + 1, y + bounced, 14, 1, 0);
    const other = 8 + Math.floor(hash(j * 7 + 4) * 160);
    if (Math.abs(other - ledgeX(j)) > 22) {
      r(other, y - 7, 16, 3, GREEN);
      r(other + 1, y - 7, 14, 1, 0);
    }
  }
  // a gem to pick up on the fourth platform, and a flying enemy over the eighth
  if (k < 4) {
    const y = toY(4 * RISE) - 7 - (tick % 4 < 2 ? 1 : 0);
    r(ledgeX(4) + 7, y, 3, 5, "y");
    r(ledgeX(4) + 6, y + 1, 5, 3, "y");
    r(ledgeX(4) + 7, y + 1, 1, 1, 0);
  }
  const foeY = toY(8 * RISE) - 16;
  const foeX = ledgeX(8) + 4 + Math.round(10 * Math.sin(t * 2));
  const shotAt = 6.2 * HOP; // when it fires, and the shot takes a third of a second to land
  if (g < shotAt + 0.33) {
    const flap = tick % 4 < 2 ? 0 : 2;
    r(foeX, foeY, 9, 6, VIOLET);
    r(foeX - 4, foeY + flap, 4, 2, VIOLET);
    r(foeX + 9, foeY + flap, 4, 2, VIOLET);
    r(foeX + 2, foeY + 2, 2, 2, 0);
    r(foeX + 5, foeY + 2, 2, 2, 0);
    r(foeX + 2, foeY - 1, 1, 1, VIOLET);
    r(foeX + 6, foeY - 1, 1, 1, VIOLET);
  } else if (g < shotAt + 0.75) spark(r, foeX + 4, foeY + 3);

  // the monster: across and up to the next platform in an arc
  const mx = playing ? lerp(ledgeX(k), ledgeX(k + 1), ease(u)) + 4 : 92;
  const my = playing ? toY(k * RISE + RISE * u + 17 * Math.sin(Math.PI * u)) - 9 : 87 - Math.round(3 * Math.abs(Math.sin(t * 4)));
  if (playing && g >= shotAt && g < shotAt + 0.33) {
    const p = (g - shotAt) / 0.33;
    r(lerp(mx + 4, foeX + 4, p), lerp(my, foeY + 6, p), 2, 3, "y");
  }
  stampRows(r, GLOOP, mx, my, GLOOP_INK);

  if (playing) {
    // the score, the zone it is in, and what it has just earned
    const score = k * 10 + (k >= 4 ? 50 : 0) + (g >= shotAt + 0.33 ? 150 : 0);
    r(3, 3, 72, 16, "k");
    text(r, String(score), 6, 5, 0);
    text(r, `${k * 2} M DUSK MEADOW`, 6, 12, 2);
    r(172, 3, 7, 7, "k");
    r(182, 3, 7, 7, "k");
    r(184, 5, 1, 3, 0);
    r(186, 5, 1, 3, 0);
    r(174, 5, 2, 3, 0);
    if (g < 1.8) {
      text(r, "ZONE 1", 96 - Math.floor(width("ZONE 1") / 2), 30, 2);
      text(r, "DUSK MEADOW", 96 - Math.floor(width("DUSK MEADOW") / 2), 38, GREEN);
    }
    const gemAt = 4 * HOP;
    if (g >= gemAt && g < gemAt + 0.8) text(r, "+50", mx - 2, my - 8 - Math.round((g - gemAt) * 8), "y");
    if (g >= shotAt + 0.33 && g < shotAt + 1.2) text(r, "+150", foeX - 2, foeY - 6 - Math.round((g - shotAt) * 6), "y");
  } else {
    // the menu: the name, the monster picked, the five to choose from, and Play
    r(52, 8, 88, 104, "k");
    frame(r, 52, 8, 88, 104, 2);
    text(r, "MONSTER", 64, 14, GREEN);
    text(r, "HOP", 96, 14, 0);
    text(r, "BOUNCE THROUGH", 68, 23, 2);
    text(r, "THE NIGHT", 78, 30, 2);
    r(58, 39, 76, 22, 3);
    stampRows(r, GLOOP, 63, 45 - (tick % 8 < 4 ? 1 : 0), GLOOP_INK);
    text(r, "YOUR MONSTER", 78, 43, 2);
    text(r, "GLOOP", 78, 51, GREEN);
    AVATARS.forEach((ink, i) => {
      const x = 59 + i * 15;
      r(x, 65, 13, 13, 3);
      if (i === 0) frame(r, x, 65, 13, 13, GREEN);
      r(x + 3, 68, 7, 7, ink);
      r(x + 5, 70, 1, 2, "k");
      r(x + 8, 70, 1, 2, "k");
    });
    const pressed = a >= 1.9;
    r(58, 83, 76, 13, pressed ? "y" : GREEN);
    text(r, "PLAY", 89, 87, "k");
    text(r, "NO BEST YET", 74, 101, 2);
    if (a > 0.8) pointer(r, lerp(150, 100, ease((a - 0.8) / 0.8)), lerp(60, 90, ease((a - 0.8) / 0.8)));
  }
};

const DRAW: Record<PixelKind, Draw> = { chordapp, pokeapp, hopapp, ud: logo(UD), bambino: logo(BAMBINO), dds: logo(DDS) };

export function Pixels({ kind, className }: { kind: PixelKind; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [w, h] = SIZE[kind];

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let P: Pal = getTheme() === "night" ? NIGHT : DAY;
    const r = (x: number, y: number, bw: number, bh: number, c: string | number) => {
      g.fillStyle = P[c] ?? String(c); // palette key, or a sprite's own colour
      g.fillRect(x, y, bw, bh);
    };
    const draw = DRAW[kind];
    const paint = (t: number) => {
      g.clearRect(0, 0, cv.width, cv.height);
      draw(r, t, Math.floor(t * 8));
    };

    let raf = 0;
    let last = 0;
    let clock = 0;
    let visible = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 100) return;
      clock += Math.min(0.25, (now - last) / 1000);
      last = now;
      paint(clock);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        paint(4.4);
        return;
      }
      if (visible && !document.hidden) {
        last = performance.now() - 200;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(cv);
    const off = subscribeTheme(() => {
      P = getTheme() === "night" ? NIGHT : DAY;
      paint(clock || 4.4);
    });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    paint(4.4);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      off();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
    };
  }, [kind]);

  return <canvas ref={ref} className={className ? `px ${className}` : "px"} width={w} height={h} role="img" aria-label={LABEL[kind]} />;
}
