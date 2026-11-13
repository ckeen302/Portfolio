/**
 * The cat away from its room. This file is only the drawing: given a pose and a
 * moment in time it returns a small grid of characters, one per pixel, and the
 * Mascot component paints that grid wherever the cat is sitting on the page.
 *
 *   "."  empty        "0"  fur          "s"  fur in shade     "o"  orange (collar, nose)
 *   "k"  eyes         "K"  the outline  "i"  ink (z z z, ?)   "h"  a heart
 *
 * The cat is drawn without an outline and gets one at the end, so every pose
 * reads on the cream page by day and on the dark page by night.
 *
 * paintCat draws it settled in a spot (facing us); paintSide draws it from the
 * side for getting between spots and for chasing the mouse along the mailbox:
 * a four-frame gallop, a walk, and a crouch. paintMouse draws that mouse.
 */

export const CAT_W = 30;
export const CAT_H = 38;
/** Where the cat's left side and the surface it sits on are inside the grid. */
export const CAT_X = 8;
export const CAT_GROUND = 27;

export type Pose = "sleep" | "bat" | "watch" | "badge" | "peek" | "perch";
export type CatMoment = {
  pose: Pose;
  /** Seconds since the cat settled in this spot. */
  t: number;
  /** Seconds the pointer has been over the cat, or -1. */
  hover: number;
  /** Seconds since it was last petted (clicked), or -1. */
  pet: number;
  /** Arriving, staying, or leaving, and how far through that it is (0 to 1). */
  phase: "in" | "idle" | "out";
  p: number;
  /** Which way the pointer is (-1 left, 1 right, 0 ahead) when it is nearby, so the cat can watch it. */
  gaze?: number | null;
  /** Something it has just noticed, shown above its head while it sits. */
  mark?: Mark;
};
export type Mark = "what" | "bang";

type Grid = string[][];
const put = (g: Grid, x: number, y: number, ch: string) => {
  if (ch !== "." && x >= 0 && y >= 0 && x < CAT_W && y < CAT_H) g[y][x] = ch;
};
/** Draws rows of characters; rows at or below `stop` are left out (the cat is behind an edge there). */
const blit = (g: Grid, rows: string[], x: number, y: number, stop = CAT_H) =>
  rows.forEach((line, j) => {
    if (y + j < stop) for (let i = 0; i < line.length; i++) put(g, x + i, y + j, line[i]);
  });
const bar = (g: Grid, x: number, y: number, w: number, h: number, ch: string) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, ch);
};

// The head is 9 wide on an 11-wide body. Eyes and nose slide a pixel to look left or right.
const EARS = [".0.......0.", ".00.....00.", ".000000000.", ".000000000."];
const row = (marks: [number, string][]) => {
  const a = [...".000000000."];
  for (const [i, ch] of marks) if (i > 0 && i < 10) a[i] = ch;
  return a.join("");
};
type Eyes = "open" | "shut";
const head = (look: number, eyes: Eyes) => [
  ...EARS,
  eyes === "open" ? row([[3 + look, "k"], [7 + look, "k"]]) : row([[2, "k"], [3, "k"], [7, "k"], [8, "k"]]),
  row([[5 + look, "o"]]),
];
// Sitting up (drawn one pixel further left than the head): chin, collar, then a round,
// chubby body with a faint line between the front legs.
const SITTING = ["..000000000..", "...ooooooo...", "..000000000..", ".00000000000.", "0000000000000", "0000000000000", "000000s000000", ".00000s00000."];
// Lying down with its chin on its paws: the shoulders, a little wider than the head.
const LOAF = [".00000000000.", "0000000000000", "0000000000000"];
// Curled up asleep: the back rises behind the head.
const CURL = ["........0000000..", "......00000000000", ".....000000000000", "00000000000000000", "00000000000000000", "00000000000000000"];

const GLYPH = {
  z: ["iiii", "..i.", ".i..", "iiii"],
  what: ["ii.", "..i", ".i.", "...", ".i."],
  bang: [".i.", ".i.", ".i.", "...", ".i."],
  heart: [".h.h.", "hhhhh", "hhhhh", ".hhh.", "..h.."],
};
export function paintCat({ pose, t, hover, pet, phase, p, gaze = null, mark }: CatMoment): string[] {
  const g: Grid = Array.from({ length: CAT_H }, () => new Array<string>(CAT_W).fill("."));
  const over: [string[], number, number][] = []; // drawn last, with no outline
  const X = CAT_X;
  const G = CAT_GROUND;
  const hov = hover >= 0;
  const blink: Eyes = t % 4.3 < 0.17 ? "shut" : "open";
  const sway = [0, 1, 1, 0, -1, -1][Math.floor(t * 4.5) % 6];
  let top = G - 14; // the top of the cat's ears, for whatever floats above it

  if (pose === "sleep") {
    // curled up: the back is a mound behind the head, the tail wraps along the front
    top = G - 9;
    blit(g, CURL, X - 1, G - 6);
    if (hov || phase !== "idle") {
      // awake: head lifted, eyes open
      blit(g, head(0, blink), X, G - 10);
      top = G - 10;
      if (hov && hover < 1.5) over.push([GLYPH.what, X + 13, G - 17]);
    } else {
      // asleep: it breathes, and z z z drift away
      const out = Math.floor(t / 1.25) % 2;
      blit(g, head(0, "shut"), X, G - 9 + out);
      top = G - 9 + out;
      if (t % 6.3 > 6.05) put(g, X + 9, G - 9 + out, "."); // an ear twitches in its sleep
      for (let i = 0; i < 2; i++) {
        const q = (t / 2.1 + i * 0.5) % 1;
        if (q < 0.88) over.push([GLYPH.z, X + 12 + Math.round(q * 5), G - 13 - Math.round(q * 9)]);
      }
    }
    bar(g, X + 6, G - 1, 8, 1, "s");
    put(g, X + 14, G - 2, "s");
  } else if (pose === "bat") {
    // lying on top of a screen with its front paws over the edge, one of them swatting
    top = G - 8;
    blit(g, LOAF.slice(1), X - 1, G - 2);
    blit(g, head(hov ? 0 : gaze ?? 1, blink), X, G - 8);
    const f = Math.floor(t * 6) % 8;
    bar(g, X + 2, G, 2, hov ? 1 : 2, "0");
    bar(g, X + 7 + (hov ? 0 : [0, 1, 1, 0, -1, -1, 0, 0][f]), G, 2, hov ? 1 : [3, 5, 6, 5, 5, 6, 4, 3][f], "0");
    // the tail, up behind it
    bar(g, X + 12, G - 3, 2, 1, "0");
    bar(g, X + 14, G - 8, 1, 6, "0");
    bar(g, X + 14 + sway, G - 10, 1, 2, "0");
    if (hov && hover < 1.5) over.push([GLYPH.what, X + 17, G - 16]);
  } else if (pose === "peek") {
    // behind an edge: ears and eyes come up over it, and duck when you get close
    let rise = phase === "in" ? Math.round(5 * p) : phase === "out" ? Math.round(5 * (1 - p)) : 5;
    const c = t % 8.5;
    if (phase === "idle" && c > 6.6 && c < 7.3) rise = 2;
    if (hov && phase === "idle") rise = hover < 0.12 ? 3 : 1;
    const look = phase === "idle" && !hov ? gaze ?? [-1, 0, 1, 0][Math.floor(t / 1.4) % 4] : 0;
    top = G - rise;
    blit(g, head(look, blink).slice(0, 5), X, G - rise, CAT_GROUND);
    if (rise >= 4) {
      bar(g, X + 1, G, 2, 1, "0");
      bar(g, X + 8, G, 2, 1, "0");
    }
  } else {
    // sitting up, facing us: watching a screen, swiping at the dragonfly, or perched on the mailbox
    const happy = hov && hover > 0.25;
    // every so often it washes a paw, and a little later it yawns
    const c = phase === "idle" && !hov && pose !== "badge" ? t % 13 : 0;
    const washing = c > 6.4 && c < 8.2;
    const yawning = c > 10.6 && c < 11.5;
    let look = 0;
    if (!hov && phase === "idle" && !washing && !yawning) {
      if (gaze !== null) look = gaze;
      else if (pose === "watch") look = [-1, -1, 0, 1, 1, 0][Math.floor(t / 0.55) % 6];
      else if (pose === "badge") look = -1; // the dragonfly is up to its left
    }
    blit(g, SITTING, X - 1, G - 8);
    const lick = washing && Math.floor(t * 5) % 2 === 0;
    blit(g, head(washing ? 1 : look, happy || washing || yawning ? "shut" : blink), X, G - 14 + (lick ? 1 : 0));
    if (washing) {
      // a front paw comes up to its cheek, and the head dips to it
      bar(g, X + 8, G - 9, 2, 3, "0");
      bar(g, X + 9, G - 6, 2, 3, "0");
    }
    if (yawning) bar(g, X + 4, G - 8, 3, 2, "k");
    if (mark) over.push([GLYPH[mark], X + 4, G - 21]);

    if (pose === "badge") {
      // tail curled on the ground beside it
      bar(g, X + 12, G - 1, 3, 1, "0");
      if (t % 3.4 < 0.4) put(g, X + 15, G - 2, "0");
      else bar(g, X + 14, G - 3, 1, 2, "0");
    } else {
      // tail hanging over the edge it sits on
      bar(g, X + 9, G, 1, 5, "0");
      bar(g, X + 9 + sway, G + 5, 1, 2, "0");
    }
  }
  if (phase === "in" && p < 0.5 && pose !== "peek") {
    // a little dust where it has just landed
    put(g, X - 4, CAT_GROUND - 1, "s");
    put(g, X + 15, CAT_GROUND - 2, "s");
  }
  if (pet >= 0 && pet < 0.95 && phase !== "out") over.push([GLYPH.heart, X + 3, top - 6 - Math.round(pet * 7)]);

  outline(g, pose === "peek");
  for (const [rows, x, y] of over) blit(g, rows, x, y);
  return g.map((line) => line.join(""));
}


/** Every empty pixel that touches the cat (or the mouse) becomes its outline. */
function outline(g: Grid, behindEdge = false) {
  const solid = (x: number, y: number) => "0sokmfcj".includes(g[y]?.[x] ?? ".");
  const edge: [number, number][] = [];
  for (let y = 0; y < g.length; y++)
    for (let x = 0; x < g[0].length; x++)
      if (g[y][x] === "." && (solid(x + 1, y) || solid(x - 1, y) || solid(x, y + 1) || solid(x, y - 1))) edge.push([x, y]);
  // where the cat is behind an edge, that edge is its outline: none is drawn below it
  for (const [x, y] of edge) if (!behindEdge || y < CAT_GROUND || g[y - 1]?.[x] === "0") g[y][x] = "K";
}

// From the side, facing right, 16 wide: the head and body are the same in every frame;
// the tail and the legs change. Legs on the far side of the body are drawn in shade.
const SIDE = [
  ".........0....0.",
  ".........000000.",
  ".........000000.",
  ".........0000k0.",
  "...000000000000.",
  "...000000000000.",
  "...0000000ooo...",
  "...0000000000...",
];
const BELLY = ["...0000000000...", "....00000000...."];
// Galloping: stretched out in the air, front paws down, gathered up, pushing off.
const GALLOP = [
  ["..00000000000000", "00..00000000..00", "................", "................"],
  ["...0000000000...", "....00000000.00.", "..ss........00..", ".ss.........00.."],
  ["...0000000000...", "....00000000....", "......0s0s......", "......0..s......"],
  ["...0000000000.ss", "....00000000.ss.", "...00...........", "..00............"],
];
// Walking: where the near and the far legs are in each of the four steps (the body lifts on 1 and 3).
const STRIDE: { near: number[]; far: number[]; lift: number }[] = [
  { near: [4, 11], far: [6, 9], lift: 0 },
  { near: [5, 10], far: [], lift: 1 },
  { near: [6, 9], far: [4, 11], lift: 0 },
  { near: [5, 10], far: [], lift: 1 },
];
const TAIL_BACK: [number, number][] = [[0, 2], [1, 2], [1, 3], [2, 3], [2, 4]];
const TAIL_UP: [number, number][] = [[1, 0], [1, 1], [1, 2], [2, 2], [2, 3], [2, 4]];
const TAIL_CURL: [number, number][] = [[2, 0], [1, 0], [1, 1], [1, 2], [2, 3], [2, 4]];
/** The feet of the side-on cat are under this column, so it can turn and tip around them. */
export const RUN_FEET = CAT_X + 6;

export type Gait = "walk" | "run" | "crouch" | "air";
/**
 * The cat from the side, facing right: a step of its walk or its gallop (frame 0 to 3),
 * crouched (about to jump, or just landed), or stretched out in the air.
 */
export function paintSide(gait: Gait, frame = 0, mark?: { glyph: Mark; mirror: boolean }): string[] {
  const g: Grid = Array.from({ length: CAT_H }, () => new Array<string>(CAT_W).fill("."));
  const X = CAT_X - 2;
  const f = ((frame % 4) + 4) % 4;
  let top = CAT_GROUND - 12; // the tips of its ears
  if (gait === "crouch") {
    top = CAT_GROUND - 10;
    blit(g, [...SIDE, "...0000000000...", "..00.00..00.00.."], X, CAT_GROUND - 10);
    TAIL_UP.forEach(([x, y]) => put(g, X + x, CAT_GROUND - 10 + y, "0"));
  } else if (gait === "walk") {
    const { near, far, lift } = STRIDE[f];
    const y = CAT_GROUND - 12 - lift;
    top = y;
    blit(g, [...SIDE, ...BELLY], X, y);
    far.forEach((x) => bar(g, X + x, y + 10, 1, 2 + lift, "s"));
    near.forEach((x) => bar(g, X + x, y + 10, 1, 2 + lift, "0"));
    (f < 2 ? TAIL_UP : TAIL_CURL).forEach(([tx, ty]) => put(g, X + tx, y + ty, "0"));
  } else {
    const k = gait === "air" ? 0 : f;
    const y = CAT_GROUND - 12 + (k === 2 ? 1 : 0);
    blit(g, [...SIDE, ...GALLOP[k]], X, y);
    TAIL_BACK.forEach(([tx, ty]) => put(g, X + tx, y + ty + (k % 2), "0"));
  }
  outline(g);
  // a "?" or "!" over its head; when the cat is shown facing left the whole drawing is flipped,
  // so the mark is drawn back to front here and comes out the right way round
  if (mark) blit(g, mark.mirror ? GLYPH[mark.glyph].map((line) => [...line].reverse().join("")) : GLYPH[mark.glyph], X + 10, top - 7);
  return g.map((line) => line.join(""));
}

// Up on its hind legs, from the side, facing right: head back, body upright, tail out behind for balance.
const REAR = [
  "......0....0....",
  "......000000....",
  "......000000....",
  "......0000k0....",
  "......000000....",
  ".....000000.....",
  ".....000ooo.....",
  "....0000000.....",
  "....0000000.....",
  "....0000000.....",
  "...00000000.....",
  "...0000000......",
  "...0000000......",
  "...0000000......",
  "...000.000......",
  "...00..000......",
];
// One front paw does the swiping: up and poised, coming down across, and down ([x, y] pixels).
// The other stays tucked against its chest the whole time (in shade).
const SWIPE: [number, number][][] = [
  [[10, 6], [11, 5], [11, 4], [12, 3], [12, 2], [13, 1], [13, 0], [14, 0], [14, -1], [13, -1]],
  [[10, 7], [11, 6], [12, 5], [13, 4], [14, 3], [14, 2], [15, 2], [15, 3]],
  [[10, 8], [11, 9], [12, 9], [12, 10]],
];
const TUCKED: [number, number][] = [[10, 8], [11, 9]];
/** The cat reared up and swiping (frame 0 to 2: paw right up, across, down), facing right. */
export function paintRear(frame = 0): string[] {
  const g: Grid = Array.from({ length: CAT_H }, () => new Array<string>(CAT_W).fill("."));
  const X = CAT_X - 2;
  const y = CAT_GROUND - 16;
  blit(g, REAR, X, y);
  TUCKED.forEach(([ax, ay]) => bar(g, X + ax, y + ay, 1, 2, "s"));
  SWIPE[frame % 3].forEach(([ax, ay]) => bar(g, X + ax, y + ay, 1, 2, "0"));
  [[2, 12], [1, 12], [0, 11], [0, 10], [1, 9]].forEach(([tx, ty]) => put(g, X + tx, y + ty, "0"));
  outline(g);
  return g.map((line) => line.join(""));
}

/** The mouse the cat chases along the mailbox: from the side, facing right, a third the cat's length. */
export const MOUSE_W = 13;
export const MOUSE_H = 8;
/** The column under its middle, and the row of the surface it runs on. */
export const MOUSE_FEET = 8;
export const MOUSE_GROUND = 6;
// "m" its fur, "f" its feet, "k" the eye, "o" the nose, "t" the tail
const MOUSE = ["........mm...", "......mmmmm..", ".....mmmmkmo.", ".....mmmmmm.."];
const MOUSE_FEET_AT = ["......f..f...", ".......ff...."];
const MOUSE_TAIL: [number, number][][] = [
  [[1, 3], [2, 3], [3, 4], [4, 4]],
  [[1, 4], [2, 4], [3, 4], [4, 4]],
];
/** Two frames: feet apart with the tail up, feet together with the tail out behind. */
export function paintMouse(frame = 0): string[] {
  const g: Grid = Array.from({ length: MOUSE_H }, () => new Array<string>(MOUSE_W).fill("."));
  const f = frame % 2;
  blit(g, [...MOUSE, MOUSE_FEET_AT[f]], 0, 1);
  outline(g);
  MOUSE_TAIL[f].forEach(([x, y]) => put(g, x, y, "t")); // the tail is a thin line, with no outline
  return g.map((line) => line.join(""));
}

/**
 * The trainer who throws a ball at the cat on the PokéIQ screen: head and shoulders, from the
 * side, facing right, standing behind the edge. "c" cap, "s" skin, "j" jacket, "k" the eye.
 */
export const TRAINER_W = 13;
export const TRAINER_H = 13;
export const TRAINER_FEET = 5;
export const TRAINER_GROUND = 12;
const TRAINER = [
  "...cccc......",
  "..cccccc.....",
  "..cccccccc...",
  "..ssssks.....",
  "..ssssss.....",
  "...ssss......",
  "..jjjjjj.....",
  ".jjjjjjjj....",
  ".jjjjjjjj....",
  ".jjjjjjjj....",
  ".jjjjjjjj....",
];
// The throwing arm in each frame: at his side, drawn back over his shoulder, flung forward.
const TRAINER_ARM: [number, number, string][][] = [
  [[9, 7, "j"], [9, 8, "j"], [9, 9, "s"]],
  [[1, 6, "j"], [0, 5, "j"], [0, 4, "j"], [0, 3, "s"]],
  [[9, 7, "j"], [10, 6, "j"], [11, 5, "j"], [12, 4, "s"]],
];
export function paintTrainer(frame = 0): string[] {
  const g: Grid = Array.from({ length: TRAINER_H }, () => new Array<string>(TRAINER_W).fill("."));
  blit(g, TRAINER, 0, 1);
  TRAINER_ARM[frame % 3].forEach(([x, y, ch]) => put(g, x, y, ch));
  outline(g);
  return g.map((line) => line.join(""));
}
/** The ball he throws: 7 by 7 with its outline, its middle at (3, 3). */
export const BALL = 7;
export function paintBall(): string[] {
  const g: Grid = Array.from({ length: BALL }, () => new Array<string>(BALL).fill("."));
  blit(g, [".ooo.", "ooooo", "kk0kk", "00000", ".000."], 1, 1);
  outline(g);
  return g.map((line) => line.join(""));
}
