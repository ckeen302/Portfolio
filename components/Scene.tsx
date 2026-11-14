"use client";

import { useEffect, useRef } from "react";
import { LOW } from "@/lib/chords";
import { mascot } from "@/lib/mascot";
import { DAY, NIGHT } from "@/lib/palette";
import { player } from "@/lib/player";
import { getTheme, setTheme, subscribeTheme } from "@/lib/theme";
import { sfx } from "@/lib/sfx";
import { followWeather, weather } from "@/lib/weather";

/**
 * The pixel room, drawn by hand as rectangles on a 164×96 canvas and scaled
 * up with crisp pixels. Out of the window it is day (sun, drifting clouds, a small bird flying past now and then) or
 * night (moon, stars) to match the theme, which follows the real sky. Everything in it is original. It runs at a low frame
 * rate on purpose: code scrolls on the monitor, the hands type, stars
 * twinkle, steam rises, and the cat flicks its tail. Click the desk lamp to
 * switch the whole site between day and night. Click the cat and it hops off
 * the sill, walks over and jumps up on the desk, knocking the mug off on the
 * way. There it sits in front of the monitor, on the keyboard, so the screen
 * fills with nonsense. Click it again to send it back to the sill.
 *
 * The window also shows the real weather over Newark (lib/weather.ts): more cloud, an
 * overcast sky, fog, rain, snow or a thunderstorm. Click the MIDI keyboard and it plays
 * a chord progression (lib/player.ts), lighting the keys of each chord as it sounds;
 * click one of its keys and it plays that note. The monitor, the map and the helmet
 * are shortcuts, with a small label on hover. At night the cat sleeps on the sill and
 * the monitor lights the desk.
 */

const W = 164;
const H = 96;

type Line = [number, number, string | number, number?, number?, (string | number)?];
// Code on the main monitor: [indent, length, colour, gap to 2nd token, its length, its colour]
const CODE: Line[] = [
  [0, 9, "o"], [2, 14, 0], [2, 8, 0, 11, 7, "y"], [4, 13, 1], [4, 6, 0, 7, 9, "o"], [4, 10, 0], [2, 3, "o"],
  [0, 2, 0], [0, 0, 0], [0, 11, "y"], [2, 17, 0], [2, 9, 1], [0, 2, 0], [2, 12, 0], [4, 7, "y"], [4, 15, 0], [2, 4, "o"],
];
const SIDE: [number, number, string | number][] = [
  [24, 6, 1], [26, 9, 0], [26, 5, "y"], [24, 8, 1], [26, 6, 0], [26, 10, "o"], [24, 4, 1], [26, 7, 0], [26, 9, 0], [24, 5, 1], [26, 6, "y"], [26, 8, 0],
];
// A football helmet seen from the side, facing left, standing on the desk: B burgundy,
// D its shadow, Y gold (the stripe over the top, the W on the side, the face mask), K the
// opening for the face. Its whole base is on the bottom row, so it sits flat.
const HELMET = [
  "......YYYYYYY....",
  "....BBBBBBBBBBB..",
  "...BBBBBBBBBBBBB.",
  "..BBBBBBBBBBBBBBB",
  "..BBBBBYBYBYBBBBB",
  ".BBBBBBYBYBYBBBBB",
  ".BBBBBBBYBYBBBBBB",
  ".BBBBBBBBBBBBBBBD",
  ".BBKKKBBBBBBBBBBD",
  "YYYKKKKBBBBBBBBDD",
  "Y.YKKKKBBBBBBBDDD",
  "YYYYYKKBBBBBBDDD.",
];
// A small icon of Christ Pantocrator standing on the shelf, drawn after the sixth-century panel
// at Sinai: a sky, G the gold of the halo and of the book's cover, H hair and beard, K the eyes
// and the cross on the cover, S skin, s skin in shadow, R the robe, r its fold, O the stone at the
// centre of the cross. The right hand is raised in blessing; the left holds the book.
const ICON = [
  "aGGGGGa",
  "GGHHHGG",
  "GHSSSHG",
  "GHKSKHG",
  "GHSsSHG",
  "GHHHHHG",
  "RRHHHRR",
  "RRrHrRR",
  "RSSRGKG",
  "RSSRKOK",
  "RssRGKG",
  "RRRRGKG",
];
const ICON_INK: Record<string, string> = {
  a: "#7f96a0", G: "#f2c14e", H: "#5a3828", K: "#22161a", S: "#ecc9a0", s: "#c49370",
  R: "#38222f", r: "#5c4052", O: "#f26b3a",
};
const ICON_X = 138; // its left edge on the shelf
const SHELF = 17; // the top of the shelf board
const TOWER = 28; // left edge of the computer tower
const KEYS = 152; // left edge of the MIDI keyboard, which stands on end with middle C at the top
// For each semitone above a C: which white key it is, or (negative) the white key a black key follows.
const WHITE = [0, -1, 1, -2, 2, 3, -4, 4, -5, 5, -6, 6];
// The clouds that join the usual two when it is mostly cloudy, and the pair that drift under an
// overcast sky ([speed, starting point, y, width]); then the bolt in a thunderstorm ([dx, y, w, h]).
const MORE_CLOUDS = [[0.7, 8, 18, 12], [0.5, 30, 24, 11], [0.8, 15, 29, 10]];
const LOW_CLOUDS = [[0.5, 4, 22, 12], [0.35, 27, 30, 10]];
const BOLT = [[0, 12, 1, 4], [-1, 16, 1, 3], [-2, 19, 2, 1], [-2, 20, 1, 4], [-3, 24, 1, 3]];
// A small bird seen from the side, facing right, with its wing up and then down: k dark,
// o its orange breast, y the beak. By day one crosses the window every BIRD_EVERY seconds,
// taking BIRD_TAKES; the first sets off a few seconds after the room starts.
const BIRD = [
  ["..k...", "..kkk.", "kkkkky", ".kkoo.", "......"],
  ["......", "...kk.", "kkkkky", ".kkoo.", "..k..."],
];
const BIRD_EVERY = 17;
const BIRD_TAKES = 3.4;
const birdAt = (t: number) => (t + 12) % BIRD_EVERY; // seconds into the current crossing
const STARS = [[13, 15], [21, 20], [36, 14], [17, 29], [31, 33], [37, 25], [28, 40], [20, 36]];
const LAMP = { x0: 48, x1: 71, y0: 31, y1: 59 };
// The cat curled up asleep on the sill at night, facing us: two ears, eyes shut ("k"), a nose ("o"),
// its back rising behind its head, and its tail wrapped round in front ("d" is the line that draws it).
const CAT_ASLEEP = [
  ".........000000..",
  "0....0.000000000.",
  "00..00.0000000000",
  "00000000000000000",
  "0kk0kk0d000000000",
  "000o000d00000ddd0",
  "0000000dddddd0000",
  ".000000000000000.",
];
const SCALE = [0, 2, 4, 5, 7, 9, 11]; // semitones of the white keys above a C
// Delaware for the frame on the wall, traced from the state's real border: the arc across the
// top, the narrow neck below Wilmington, the bay shore running down to Cape Henlopen, the straight
// Atlantic coast and southern line, and the western border leaning a little as it goes north.
const DELAWARE = [
  ".###....",
  "###.....",
  "##......",
  "##......",
  "##......",
  "##......",
  "##......",
  "###.....",
  "####....",
  ".###....",
  ".###....",
  ".####...",
  ".#####..",
  ".#####..",
  ".######.",
  ".######.",
  ".######.",
  ".######.",
  ".#######",
];
// Rows where one county ends and the next begins (New Castle, Kent, Sussex).
const COUNTY_LINES = [8, 12];
// The cat's two seats ([left edge, feet]), the floor it walks on, and how long the trip takes.
const SEAT = { sill: [10, 46], desk: [73, 58] } as const;
const FLOOR = 90;
const TRIP = 2.8;
// The cat on the move, side view, 14 wide: a round body, a big head, a short tail and stubby legs.
// "0" is its fur, "o" the collar, "k" the eye.
const CAT_BODY = [
  ".......0....0.",
  "0......000000.",
  "00.....000000.",
  "00.....0000k0.",
  ".000000000000.",
  ".000000000000.",
  ".0000000ooo...",
  ".0000000000...",
  ".0000000000...",
  "..00000000....",
];
// The cat sitting, 11 wide, the same build as when it walks. On the desk it faces us;
// on the sill it looks out of the window, so we see it from behind (no face).
const CAT_SIT = [
  "..0.....0..",
  "..00...00..",
  "..0000000..",
  "..0k000k0..",
  "..000o000..",
  "..0000000..",
  "..ooooooo..",
  ".000000000.",
  "00000000000",
  "00000000000",
  "00000000000",
  "00000000000",
  ".000000000.",
];
const CAT_BACK = CAT_SIT.map((line, j) => (j === 3 || j === 4 ? "..0000000.." : line));
const CAT_FRAMES = [
  ["..............", ...CAT_BODY, "..00....00...."], // feet apart
  [...CAT_BODY, "....00.00.....", "....00.00....."], // feet together, a small bounce
  ["..............", ...CAT_BODY.slice(0, 9), "0.00000000.00.", ".............."], // mid-air, paws out
];

const hash = (n: number) => {
  const s = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return s - Math.floor(s);
};

export function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let P = getTheme() === "night" ? NIGHT : DAY;
    const r = (x: number, y: number, w: number, h: number, c: string | number, ctx = g) => {
      ctx.fillStyle = P[c];
      ctx.fillRect(x, y, w, h);
    };

    // Where the cat is, when its current trip started (room clock), and until when the typing stops.
    let cat: { at: "sill" | "desk"; start: number | null } = { at: "sill", start: null };
    let startled = 0;
    // The mug stands on the desk until the cat knocks it off; then it stays on the floor.
    let mug: { state: "desk" | "floor" } | { state: "fall"; start: number } = { state: "desk" };
    // Lines of code typed while the cat is on the keyboard (by line number) come out as nonsense.
    let mash: { from: number; to: number | null } | null = null;
    const lineAt = (t: number) => Math.floor(t * 1.1) + 12; // the line being typed at time t

    const arrive = (t: number) => {
      cat = { at: cat.at === "sill" ? "desk" : "sill", start: null };
      if (cat.at !== "desk") return;
      startled = t + 1.6;
      mash = { from: lineAt(t), to: null };
      if (mug.state === "desk") mug = { state: "floor" };
    };
    const leave = (t: number) => {
      if (cat.at === "desk" && mash) mash.to = lineAt(t) + 1;
    };

    // Under these skies the sun or the moon is hidden and the window is grey.
    const grey = () => weather.sky !== "fair" && weather.sky !== "cloudy";
    const birdOut = (t: number) => P === DAY && !grey() && birdAt(t) < BIRD_TAKES;
    // One key of the MIDI keyboard, lit: white keys are two rows deep, black keys lie across the joins.
    const lightKey = (midi: number, c: string) => {
      const n = midi - LOW;
      if (n < 0 || n > 17) return;
      const at = WHITE[n % 12];
      const k = Math.floor(n / 12) * 7 + (at < 0 ? -at - 1 : at);
      if (at < 0) {
        r(KEYS + 1, 53 + k * 3, 5, 2, c);
        return;
      }
      r(KEYS + 1, 51 + k * 3, 8, 2, c);
      if (k > 0 && (k - 1) % 7 !== 2 && (k - 1) % 7 !== 6) r(KEYS + 1, 50 + k * 3, 5, 2, "k"); // the black key above stays on top
    };

    const catSit = (x: number, y: number, t: number, onDesk: boolean) => {
      const blink = t % 4.2 < 0.2;
      (onDesk ? CAT_SIT : CAT_BACK).forEach((line, j) => {
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch !== ".") r(x + i, y - 13 + j, 1, 1, ch === "k" && blink ? "0" : ch);
        }
      });
      if (onDesk) {
        // tail up against the monitor, swishing
        const sway = [0, 1, 0, -1][Math.floor(t * 3) % 4];
        r(x - 1, y - 3, 1, 2, 0);
        r(x - 1, y - 9, 1, 6, 0);
        r(x - 1 + sway, y - 12, 1, 3, 0);
      } else if (birdOut(t) ? Math.floor(t * 6) % 2 === 0 : t % 3.4 < 0.35) {
        // on the sill the tail lies flat and flicks every few seconds, and twitches while a bird is in the window
        r(x + 11, y - 1, 4, 1, 0);
        r(x + 14, y - 2, 1, 1, 0);
      } else {
        r(x + 11, y - 1, 3, 1, 0);
        r(x + 13, y - 3, 1, 2, 0);
      }
    };
    const asleep = () => P === NIGHT && cat.at === "sill" && cat.start === null;
    const drawCat = (t: number, tick: number) => {
      if (asleep()) {
        // night: curled up on the sill, breathing slowly, with a z drifting up now and then
        const [x, y] = SEAT.sill;
        const breath = Math.floor(t / 1.3) % 2;
        CAT_ASLEEP.forEach((line, j) => {
          if (j === 0 && breath) return;
          for (let i = 0; i < line.length; i++) if (line[i] !== ".") r(x + i, y - 8 + j, 1, 1, line[i] === "d" ? 2 : line[i]);
        });
        const z = (t / 2.4) % 1;
        if (z < 0.8) {
          const zx = x + 6 + Math.round(z * 5);
          const zy = y - 13 - Math.round(z * 7);
          r(zx, zy, 3, 1, 0);
          r(zx + 1, zy + 1, 1, 1, 0);
          r(zx, zy + 2, 3, 1, 0);
        }
      } else if (cat.start === null) catSit(SEAT[cat.at][0], SEAT[cat.at][1], t, cat.at === "desk");
      else if (cat.at === "sill") catTrip(t - cat.start, 1, tick);
      else catTrip(TRIP - (t - cat.start), -1, tick);
    };
    const drawMug = (t: number) => {
      if (mug.state === "desk") {
        r(62, 53, 5, 5, 0);
        r(67, 54, 1, 3, 0);
        r(62, 57, 5, 1, 2);
        const s = Math.floor(t * 3); // steam
        r(63, 50 - (s % 3), 1, 2, 2);
        r(65, 48 - ((s + 1) % 3), 1, 2, 2);
      } else if (mug.state === "fall") {
        const p = Math.min(1, (t - mug.start) / 0.55);
        const x = Math.round(62 - 4 * p);
        const y = Math.round(53 + 38 * p * p);
        if (Math.floor(t * 8) % 2) {
          r(x, y, 5, 5, 0);
          r(x + 5, y + 1, 1, 3, 0);
        } else {
          r(x, y, 6, 4, 0);
          r(x + 2, y - 1, 3, 1, 0);
        }
      } else {
        // on its side on the floor, in a small puddle
        r(52, 95, 7, 1, 3);
        r(54, 94, 4, 1, 3);
        r(58, 92, 6, 4, 0);
        r(60, 91, 3, 1, 0);
        r(58, 92, 1, 4, 2);
      }
    };
    // x = left edge, y = feet. step 0 / 1 are the walk, 2 is mid-air; dir -1 faces left.
    const catWalk = (x: number, y: number, dir: 1 | -1, step: number) => {
      const left = Math.round(x);
      const top = Math.round(y) - 12;
      CAT_FRAMES[step].forEach((line, j) => {
        for (let i = 0; i < 14; i++) {
          const ch = line[dir === 1 ? i : 13 - i];
          if (ch !== ".") r(left + i, top + j, 1, 1, ch);
        }
      });
    };
    // The trip from sill to desk at v seconds in; the way back is the same trip run backwards.
    const catTrip = (v: number, dir: 1 | -1, tick: number) => {
      if (v < 0.45) {
        const p = v / 0.45;
        catWalk(8 + 8 * p, SEAT.sill[1] + (FLOOR - SEAT.sill[1]) * p * p - 6 * Math.sin(Math.PI * p) * (1 - p), dir, 2);
      } else if (v < 0.6) catWalk(16, FLOOR, dir, 0);
      else if (v < 2.1) catWalk(16 + (40 * (v - 0.6)) / 1.5, FLOOR, dir, tick % 2);
      else if (v < 2.25) catWalk(56, FLOOR, dir, 0);
      else {
        const p = Math.min(1, (v - 2.25) / (TRIP - 2.25));
        catWalk(56 + 15 * p, FLOOR - (FLOOR - SEAT.desk[1]) * p - 12 * Math.sin(Math.PI * p), dir, 2);
      }
    };

    // Everything that never moves, drawn once per theme onto a spare canvas.
    const base = document.createElement("canvas");
    base.width = W;
    base.height = H;
    const b = base.getContext("2d")!;
    const paintBase = () => {
      const q = (x: number, y: number, w: number, h: number, c: string | number) => r(x, y, w, h, c, b);
      // wall and floor
      q(0, 0, W, 66, 1);
      for (let j = 3; j < 60; j += 6) for (let i = j % 12 < 6 ? 2 : 6; i < W; i += 8) q(i, j, 1, 1, "d");
      q(0, 61, W, 1, 2);
      q(0, 62, W, 4, 3);
      q(0, 66, W, 30, 2);
      [73, 81, 89].forEach((y) => q(0, y, W, 1, 3));
      [[66, 6], [74, 22], [82, 12], [90, 28]].forEach(([y, o]) => {
        for (let i = o; i < W; i += 34) q(i, y, 1, y === 90 ? 6 : 7, 3);
      });
      // window: the sun by day, the moon by night (bars are drawn each frame, over the clouds)
      q(8, 10, 34, 36, "k");
      q(10, 12, 30, 32, grey() ? "g" : "s");
      if (grey()) {
        // the sun or the moon is behind the cloud
      } else if (P === NIGHT) {
        q(29, 16, 6, 8, 0);
        q(28, 17, 8, 6, 0);
        q(31, 18, 2, 2, 1);
        q(29, 21, 1, 1, 1);
      } else {
        q(29, 16, 6, 8, "y");
        q(28, 17, 8, 6, "y");
        [[31, 13, 2, 2], [31, 25, 2, 2], [37, 19, 2, 2], [27, 14, 1, 1], [36, 14, 1, 1], [27, 25, 1, 1], [36, 25, 1, 1]].forEach(([a, c, w, h]) => q(a, c, w, h, "y"));
      }
      q(6, 46, 38, 2, 0);
      q(6, 48, 38, 1, 3);
      // framed map of Delaware with its three counties, and a mark where Newark is
      q(49, 4, 18, 24, "k");
      q(50, 5, 16, 22, 0);
      DELAWARE.forEach((line, j) => {
        const from = line.indexOf("#");
        q(54 + from, 6 + j, line.lastIndexOf("#") - from + 1, 1, COUNTY_LINES.includes(j) ? 2 : 3);
      });
      q(54, 8, 1, 1, "o");
      // shelf: four books, the icon, a small plant
      q(124, SHELF, 36, 2, "k");
      q(127, SHELF + 2, 2, 3, 3);
      q(155, SHELF + 2, 2, 3, 3);
      ([[125, 3, 9, 3], [128, 2, 7, "o"], [130, 3, 10, "k"], [133, 2, 8, 0]] as [number, number, number, string | number][]).forEach(
        ([a, w, h, c]) => q(a, SHELF - h, w, h, c),
      );
      q(132, SHELF - 8, 1, 6, "o");
      ICON.forEach((line, j) => {
        for (let i = 0; i < line.length; i++) {
          b.fillStyle = ICON_INK[line[i]]; // its own colours, not the room's palette
          b.fillRect(ICON_X + i, SHELF - ICON.length + j, 1, 1);
        }
      });
      if (P === NIGHT) {
        // at night it sits in the dark like the rest of the shelf
        b.globalAlpha = 0.3;
        q(ICON_X, SHELF - ICON.length, ICON[0].length, ICON.length, 3);
        b.globalAlpha = 1;
      }
      q(149, SHELF - 4, 6, 4, "o");
      q(148, SHELF - 5, 8, 1, "o");
      q(151, SHELF - 10, 2, 5, 3);
      q(148, SHELF - 9, 3, 2, 3);
      q(153, SHELF - 12, 3, 3, 3);
      q(150, SHELF - 13, 2, 3, 3);
      // desk
      q(46, 58, 104, 3, "k");
      q(48, 61, 100, 2, 3);
      q(49, 63, 3, 21, "k");
      q(144, 63, 3, 21, "k");
      // lamp
      q(50, 56, 8, 2, "k");
      q(53, 40, 2, 16, "k");
      q(53, 38, 8, 2, "k");
      q(59, 33, 9, 3, "o");
      q(58, 36, 11, 2, "o");
      q(60, 38, 7, 1, "y");
      // monitor (the screen is filled in every frame)
      q(72, 20, 50, 32, "k");
      q(94, 52, 6, 4, "k");
      q(88, 56, 18, 2, "k");
      // a burgundy and gold football helmet on the desk
      HELMET.forEach((line, j) => {
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === ".") continue;
          b.fillStyle = ch === "B" ? "#7a1f2e" : ch === "D" ? "#531320" : P[ch === "Y" ? "y" : "k"];
          b.fillRect(126 + i, 46 + j, 1, 1);
        }
      });
      // the computer tower, on the floor under the window
      q(TOWER, 60, 13, 26, "k");
      q(TOWER + 2, 62, 9, 2, 3);
      q(TOWER + 2, 66, 9, 1, 3);
      q(TOWER + 2, 68, 9, 1, 3);
      [77, 79, 81, 83].forEach((y) => q(TOWER + 2, y, 9, 1, 3));
      // rug
      q(66, 84, 62, 8, 1);
      q(64, 86, 66, 4, 1);
      q(68, 85, 58, 1, 0);
      q(68, 90, 58, 1, 0);
      // a MIDI keyboard standing on end against the wall, dead straight: knobs and pads at the top, keys below
      const kx = KEYS;
      q(kx, 38, 10, 48, "k");
      q(kx + 1, 40, 8, 9, 3);
      q(kx + 2, 42, 2, 2, "o");
      q(kx + 6, 42, 2, 2, "y");
      [[2, 45], [6, 45], [2, 47], [6, 47]].forEach(([dx, y]) => q(kx + dx, y, 2, 1, 1));
      // eleven white keys, each three rows with a line between them
      for (let key = 0; key < 11; key++) {
        const y = 51 + key * 3;
        q(kx + 1, y, 8, 2, 0);
        q(kx + 1, y + 2, 8, 1, 1);
      }
      q(kx + 1, 84, 8, 1, "k");
      // black keys across the joins, two rows each, except after every E and B
      for (let key = 0; key < 10; key++) if (key % 7 !== 2 && key % 7 !== 6) q(kx + 1, 52 + key * 3 + 1, 5, 2, "k");
    };

    const frame = (t: number) => {
      g.drawImage(base, 0, 0);
      const tick = Math.floor(t * 8);

      // the cat's trip: it clips the mug just before it lands
      if (cat.start !== null) {
        const u = t - cat.start;
        if (cat.at === "sill" && u >= 2.5 && mug.state === "desk") mug = { state: "fall", start: t };
        if (u >= TRIP) arrive(t);
      }
      if (mug.state === "fall" && t - mug.start >= 0.55) mug = { state: "floor" };
      const onDesk = cat.at === "desk" && cat.start === null;

      // the MIDI keyboard: the keys of the chord being played light up, the note sounding brightest
      const live = player.now();
      if (live) live.notes.forEach((m) => lightKey(m, m === live.lead ? "y" : "o"));
      player.held().forEach((m) => lightKey(m, "o")); // and the keys the visitor is playing
      if (P === NIGHT) {
        // at night the monitor is the light in the room: a glow round it and along the desk
        g.globalAlpha = 0.07;
        r(62, 12, 70, 46, 0);
        g.globalAlpha = 0.2;
        r(64, 58, 66, 2, 0);
        g.globalAlpha = 1;
      }

      // out of the window: the real weather over Newark; then the window bars over it
      const sky = weather.sky;
      const dull = grey();
      const pane = (x: number, y: number, w: number, h: number, c: string | number = 0) => {
        const x0 = Math.max(10, x);
        const x1 = Math.min(40, x + w);
        const y0 = Math.max(12, y);
        const y1 = Math.min(44, y + h);
        if (x1 > x0 && y1 > y0) r(x0, y0, x1 - x0, y1 - y0, c);
      };
      const cloud = (x: number, y: number, w: number, c: string | number) => {
        pane(x + 2, y, w - 4, 1, c);
        pane(x, y + 1, w, 2, c);
        pane(x + 1, y + 3, w - 3, 1, c);
      };
      if (P === NIGHT && !dull) {
        STARS.forEach(([x, y], i) => {
          if (hash(i * 7 + Math.floor(t * 1.5)) > 0.22) r(x, y, 1, 1, 0);
        });
      }
      if (P === DAY && !dull) {
        [[t * 0.9, 34, 9], [t * 0.6 + 21, 15, 7]].forEach(([at, y, w]) => cloud(2 + Math.floor(at % 46), y, w, 0));
      }
      if (sky === "cloudy" || (dull && sky !== "fog")) {
        // bigger clouds, slow enough to sit over the sun or the moon for a while
        (dull ? LOW_CLOUDS : MORE_CLOUDS).forEach(([speed, from, y, w]) => cloud(-4 + Math.floor((t * speed + from) % 50), y, w, P === DAY && !dull ? 0 : "c"));
      }
      if (dull && sky !== "fog") {
        // a low, lumpy deck of cloud along the top of the window
        for (let x = 10; x < 40; x++) pane(x, 12, 1, 4 + Math.round(1.5 * Math.sin((x + t * 0.8) * 0.45) + 1.2 * Math.sin((x - t * 0.5) * 0.23 + 2)), "c");
      }
      if (sky === "fog") {
        // bands of fog sliding past at different speeds
        [16, 23, 31, 38].forEach((y, i) => {
          const at = Math.floor(t * (0.6 + i * 0.25) + i * 11) % 20;
          for (let x = -10 - at; x < 40; x += 20) pane(x, y, 14, 2, "c");
        });
      }
      if (sky === "rain" || sky === "storm") {
        for (let i = 0; i < (sky === "storm" ? 26 : 15); i++) {
          const fall = t * (22 + hash(i * 3) * 9);
          const x = 10 + (((hash(i * 7 + 2) * 30 - fall * 0.25) % 30) + 30) % 30;
          pane(Math.floor(x), 12 + Math.floor((hash(i * 5 + 1) * 32 + fall) % 32), 1, 3, "w");
        }
      }
      if (sky === "storm") {
        // lightning now and then: one flash, and a bolt that hangs for a moment
        const since = t % 7.5;
        const strike = Math.floor(t / 7.5);
        if (since < 0.12) {
          g.globalAlpha = 0.5;
          pane(10, 12, 30, 32, 0);
          g.globalAlpha = 1;
        }
        if (since < 0.36) BOLT.forEach(([dx, y, w, h]) => pane(16 + Math.floor(hash(strike) * 18) + dx, y, w, h, "y"));
      }
      if (sky === "snow") {
        for (let i = 0; i < 16; i++) {
          const x = 10 + (((hash(i * 7 + 2) * 30 + Math.sin(t * 0.8 + i) * 1.5) % 30) + 30) % 30;
          pane(Math.floor(x), 12 + Math.floor((hash(i * 5 + 1) * 32 + t * (4 + hash(i * 3) * 3)) % 32), 1, 1, 0);
        }
        // and it settles along the bottom of the window
        pane(10, 43, 30, 1, 0);
        pane(27, 42, 5, 1, 0);
        pane(35, 42, 4, 1, 0);
      }
      if (birdOut(t)) {
        // the bird: one way, then back the other way next time, at a different height each crossing
        const since = birdAt(t);
        const trip = Math.floor((t + 12) / BIRD_EVERY);
        const right = trip % 2 === 0;
        const x = Math.round(right ? 4 + since * 11 : 40 - since * 11);
        const y = 14 + Math.floor(hash(trip) * 6) + Math.round(Math.sin(since * 4) * 1.2);
        BIRD[tick % 4 < 2 ? 0 : 1].forEach((line, j) => {
          for (let i = 0; i < line.length; i++) {
            const ch = line[right ? i : line.length - 1 - i];
            if (ch !== ".") pane(x + i, y + j, 1, 1, ch);
          }
        });
      }
      r(24, 12, 2, 32, "k");
      r(10, 27, 30, 2, "k");

      // main monitor: code scrolls up one line at a time, the newest line types in
      r(74, 22, 46, 28, 3);
      const scroll = t * 1.1;
      const off = Math.floor(scroll);
      const typed = scroll - off;
      for (let i = 0; i < 13; i++) {
        const L = CODE[(i + off) % CODE.length];
        const y = 24 + i * 2;
        const last = i === 12;
        if (mash && i + off >= mash.from && (mash.to === null || i + off < mash.to)) {
          // a line of nonsense "words", a different length each time
          const n = i + off;
          const full = 16 + Math.floor(hash(n) * 27);
          const w = last ? Math.round(full * Math.min(1, typed * 1.5)) : full;
          for (let k = 0, j = 0; k < w; j++) {
            const len = Math.min(w - k, 2 + Math.floor(hash(n * 13 + j) * 5));
            r(76 + k, y, len, 1, hash(n * 7 + j) > 0.78 ? "y" : "o");
            k += len + 1;
          }
          continue;
        }
        const w1 = last ? Math.round(L[1] * Math.min(1, typed * 1.6)) : L[1];
        if (w1 > 0) r(76 + L[0], y, w1, 1, L[2]);
        if (L[3] !== undefined && (!last || typed > 0.62)) r(76 + L[0] + L[3], y, last ? Math.round(L[4]! * Math.min(1, (typed - 0.62) * 2.6)) : L[4]!, 1, L[5]!);
        if (last && tick % 4 < 2) r(76 + L[0] + w1 + 1, y, 1, 1, 0);
        const S = SIDE[(i + off) % SIDE.length];
        if (!last) r(76 + S[0] + ((i + off) % 3 ? 2 : 0), y, S[1], 1, S[2]);
      }

      // tower lights
      r(TOWER + 3, 72, 2, 2, "y");
      if (tick % 9 > 2) r(TOWER + 7, 72, 2, 2, "o");

      // on the desk: the mug, and the cat when it is sitting there (behind the developer's arm)
      if (mug.state === "desk") drawMug(t);
      const home = !mascot.away; // false while the cat is out on the page somewhere
      if (onDesk && home) drawCat(t, tick);

      // chair, then the developer seen from behind
      r(95, 80, 4, 5, "k");
      r(87, 85, 20, 2, "k");
      r(86, 87, 3, 2, "k");
      r(96, 87, 3, 2, "k");
      r(105, 87, 3, 2, "k");
      const busy = t < startled; // the cat just landed on the desk: the typing stops for a moment
      const lh = busy ? 0 : tick % 2;
      const rh = busy ? 0 : (tick + 1) % 2;
      r(78, 54, 8, 5, "o");
      r(108, 54, 8, 5, "o");
      r(77, 56 - lh, 2, 3, 0);
      r(115, 56 - rh, 2, 3, 0);
      r(85, 51, 24, 7, "o");
      r(87, 50, 20, 1, "o");
      r(91, 48, 12, 3, "o");
      r(91, 50, 12, 1, "k");
      r(84, 56, 26, 24, "k");
      r(83, 57, 28, 22, "k");
      r(85, 58, 24, 20, 3);
      r(87, 60, 20, 1, 2);
      r(87, 75, 20, 1, 2);
      const nod = busy || Math.floor(t * 0.45) % 6 === 0 ? 1 : 0; // a small nod now and then
      r(90, 36 + nod, 14, 13, "k");
      r(92, 35 + nod, 10, 1, "k");
      r(89, 38 + nod, 16, 9, "k");
      r(93, 37 + nod, 5, 1, 3);
      r(92, 38 + nod, 2, 1, 3);
      r(99, 39 + nod, 3, 1, 3);
      r(91, 33 + nod, 12, 1, 0);
      r(89, 34 + nod, 3, 1, 0);
      r(102, 34 + nod, 3, 1, 0);
      r(88, 35 + nod, 2, 4, 0);
      r(104, 35 + nod, 2, 4, 0);
      r(86, 39 + nod, 4, 7, "y");
      r(104, 39 + nod, 4, 7, "y");
      r(86, 39 + nod, 4, 1, "k");
      r(86, 45 + nod, 4, 1, "k");
      r(104, 39 + nod, 4, 1, "k");
      r(104, 45 + nod, 4, 1, "k");

      if (busy && tick % 4 < 3) {
        r(96, 25, 2, 4, "o");
        r(96, 30, 2, 1, "o");
      }

      // in front of everything: the cat on the sill or on its way, and the mug once it has left the desk
      if (!onDesk && (home || cat.start !== null)) drawCat(t, tick);
      if (mug.state !== "desk") drawMug(t);
    };

    let raf = 0;
    let last = 0;
    let clock = 0;
    let visible = true;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 110) return; // about 9 frames a second, like the hardware this imitates
      clock += Math.min(0.25, (now - last) / 1000);
      last = now;
      frame(clock);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        frame(3.3);
        return;
      }
      if (visible && !document.hidden) {
        last = performance.now() - 200;
        raf = requestAnimationFrame(loop);
      }
    };
    const repaint = () => {
      P = getTheme() === "night" ? NIGHT : DAY;
      paintBase();
      frame(clock || 3.3);
    };

    /** The note of the key under a point of the keyboard, or null on its knobs and pads. */
    const noteAt = (x: number, y: number): number | null => {
      if (y < 51 || y >= 84) return null;
      const j = Math.floor((y - 53) / 3); // the black key across this join, if the point is on it
      if (x <= KEYS + 6 && y >= 53 && (y - 53) % 3 < 2 && j <= 9 && j % 7 !== 2 && j % 7 !== 6) return LOW + Math.floor(j / 7) * 12 + SCALE[j % 7] + 1;
      const k = Math.min(10, Math.floor((y - 51) / 3));
      return LOW + Math.floor(k / 7) * 12 + SCALE[k % 7];
    };
    const tip = tipRef.current;
    const label = (text: string | null, x = 0, y = 0) => {
      if (!tip) return;
      tip.hidden = !text;
      if (!text) return;
      tip.textContent = text;
      tip.style.left = `${(x / W) * 100}%`;
      tip.style.top = `${(y / H) * 100}%`;
    };
    const at = (e: PointerEvent): [number, number] => {
      const rect = cv.getBoundingClientRect();
      return [((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H];
    };
    const hit = (e: PointerEvent): "lamp" | "cat" | "keys" | null => {
      const rect = cv.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      const y = ((e.clientY - rect.top) / rect.height) * H;
      if (cat.start === null && !mascot.away) {
        const [cx, cy] = SEAT[cat.at];
        if (x >= cx - 3 && x <= cx + 15 && y >= cy - 14 && y <= cy + 1) return "cat";
      }
      if (x >= KEYS - 1 && x <= KEYS + 11 && y >= 37 && y <= 87) return "keys";
      if (x >= LAMP.x0 && x <= LAMP.x1 && y >= LAMP.y0 && y <= LAMP.y1) return "lamp";
      return null;
    };
    const onMove = (e: PointerEvent) => {
      const what = hit(e);
      cv.style.cursor = what ? "pointer" : "";
      if (what === "keys") label("Play", KEYS + 5, 37);
      else if (what === "lamp") label("Day / Night", 62, 32);
      else label(null);
    };
    const onOut = () => {
      label(null);
    };
    const onClick = (e: PointerEvent) => {
      const what = hit(e);
      if (!what) return;
      if (what === "keys") {
        // a key plays its note; the knobs and pads above them start or stop the chord progression
        const note = noteAt(...at(e));
        if (note === null) player.toggle();
        else void player.strike(note);
        return;
      }
      sfx.select();
      if (what === "lamp") setTheme(getTheme() === "night" ? "day" : "night");
      else if (reduce.matches) {
        // no walking when motion is reduced: the cat is simply in the other seat
        leave(clock || 3.3);
        arrive(clock || 3.3);
        frame(clock || 3.3);
      } else {
        leave(clock);
        cat = { ...cat, start: clock };
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(cv);
    const off = subscribeTheme(repaint);
    const still = () => {
      if (reduce.matches) frame(clock || 3.3); // nothing else would redraw the room
    };
    const offMascot = mascot.subscribe(still);
    const offPlayer = player.subscribe(still);
    const offWeather = weather.subscribe(repaint);
    const stopWeather = followWeather();
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onOut);
    cv.addEventListener("pointerdown", onClick);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    repaint();
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      off();
      offMascot();
      offPlayer();
      offWeather();
      stopWeather();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onOut);
      cv.removeEventListener("pointerdown", onClick);
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className="scene" ref={wrap}>
      <canvas
        ref={ref}
        width={W}
        height={H}
        role="img"
        aria-label="Pixel art of a developer at a desk with a monitor, a football helmet, a lamp, a cat on the window sill looking outside, a framed map of Delaware, a MIDI keyboard standing against the wall, and a shelf with books, an icon of Christ and a plant. The window shows the current weather in Newark. Clicking the lamp switches between day and night and the keys of the keyboard play notes."
      />
      <div className="scene__glow" aria-hidden="true" />
      <span ref={tipRef} className="scene__tip" hidden aria-hidden="true" />
    </div>
  );
}
