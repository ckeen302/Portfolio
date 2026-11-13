"use client";

import { useEffect, useRef } from "react";
import { CAT_GROUND, CAT_H, CAT_W, CAT_X, MOUSE_FEET, MOUSE_GROUND, MOUSE_H, MOUSE_W, RUN_FEET, BALL, TRAINER_FEET, TRAINER_GROUND, TRAINER_H, TRAINER_W, paintBall, paintCat, paintMouse, paintRear, paintSide, paintTrainer, type Mark, type Pose } from "@/lib/cat";
import { mascot } from "@/lib/mascot";
import { DAY, NIGHT } from "@/lib/palette";
import { sfx } from "@/lib/sfx";
import { getTheme } from "@/lib/theme";

/**
 * The cat, out of its room. There is one cat, and it only ever appears in five
 * places, each chosen because the cat looks right there and has something to do:
 *
 *   bat    on the top corner of the ChordCraft screen: lying there, swatting at the notes
 *   watch  on the top corner of the PokéIQ screen: sitting, watching the battle
 *   badge  under the MyBambino dragonfly: up on its hind legs, swiping at it (the dragonfly dodges)
 *   peek   behind the first skill slot: peeking over it, ducking when you come near
 *   perch  on the mailbox in Contact: sitting on it, tail over the edge
 *
 * It never crosses the page. It gets about behind things: it comes up from
 * behind the edge it is going to sit on (or walks out from behind the badge),
 * and goes back down behind it when it leaves. It stays while its spot is
 * comfortably on screen; when that spot has scrolled too near the top or bottom
 * and another is in view, it goes down behind this one and comes up at that one.
 * When the room is back on screen it goes down and is home again.
 *
 * It watches the pointer, reacts when the pointer is on it, and can be petted
 * with a click. It is one small canvas laid over the page, so it never moves or
 * covers any text.
 *
 * On the mailbox there is also a mouse. Every so often it comes up over the edge
 * the cat is sitting on; the cat chases it along that edge to the name tag, where
 * it gets away, and then back again to the far end, where it gets away again.
 * The cat sits back down where it was. It never catches it.
 *
 * On the PokéIQ screen a trainer comes up behind the same edge now and then and throws
 * a ball at the cat. It bounces off the cat's head. The cat does not react at all.
 */

type Spot = { el: HTMLElement; pose: Pose };
/** A point on the page (not the window) that the cat's feet are on. */
type Pt = [number, number];
type Step = { ms: number } & (
  | { kind: "rise"; at: Pt; pose: Pose } // coming up from behind the edge it will sit on
  | { kind: "sink"; at: Pt; pose: Pose } // going back down behind it
  | { kind: "slip"; from: Pt; to: Pt; edge: number } // walking out from behind the badge, or back behind it
  | { kind: "turn"; at: Pt; pose: Pose; arriving: boolean; flip: number } // between side-on and facing us
  | { kind: "duck" } // the peeking cat drops out of sight
);

const FUR = "#f4f0dc";
const SHADE = "#d3ccb4";
const MOUSE_FUR = "#a2a69c";
const MOUSE_PAW = "#7b7f77";
// The chase: how long the cat rests between two of them, and how soon the first comes (ms).
const REST = 9000;
const FIRST = 2200;
/** 0 to 1 with a quick start and a short brake at the end, for a run from standing to a stop. */
const dash = (u: number) => {
  const a = 0.18;
  const b = 0.14;
  const v = 1 / (1 - a / 2 - b / 2);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < a) return (v * u * u) / (2 * a);
  if (u < 1 - b) return v * (u - a / 2);
  return 1 - (v * (1 - u) * (1 - u)) / (2 * b);
};

export function Mascot() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const mouseCanvasRef = useRef<HTMLCanvasElement>(null);
  const trainerRef = useRef<HTMLDivElement>(null);
  const trainerCanvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const ballCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    const hit = hitRef.current;
    const g = cv?.getContext("2d");
    const mouse = mouseRef.current;
    const mg = mouseCanvasRef.current?.getContext("2d");
    const trainer = trainerRef.current;
    const tg = trainerCanvasRef.current?.getContext("2d");
    const ball = ballRef.current;
    const bg = ballCanvasRef.current?.getContext("2d");
    if (!wrap || !cv || !hit || !g || !mouse || !mg || !trainer || !tg || !ball || !bg) return;
    const spots: Spot[] = [...document.querySelectorAll<HTMLElement>("[data-cat]")].map((el) => ({ el, pose: el.dataset.cat as Pose }));
    if (!spots.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const room = document.querySelector(".scene canvas");
    const bar = document.querySelector(".top");
    const probe = document.createElement("canvas").getContext("2d");

    /** The size of one cat pixel on screen. */
    const size = () => (window.innerWidth <= 700 ? 3 : 4);
    const ceiling = () => bar?.getBoundingClientRect().bottom ?? 0;
    /** How much of the room is on screen (0 to 1): while enough of it is, the cat is at home in it. */
    const roomShowing = () => {
      if (!room) return 0;
      const r = room.getBoundingClientRect();
      if (!r.height) return 0;
      return Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / r.height;
    };

    /** The letters of a heading (not its box): the cat lies right on top of them. */
    const letters = (el: HTMLElement) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = range.getClientRects();
      const box = rects.length ? rects[rects.length - 1] : el.getBoundingClientRect();
      if (!probe) return { top: box.top, right: box.right };
      const cs = getComputedStyle(el);
      probe.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const text = el.textContent ?? "";
      const m = probe.measureText(cs.textTransform === "uppercase" ? text.toUpperCase() : text);
      const fontHeight = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      return { top: box.top + (box.height - fontHeight) / 2 + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent, right: box.right };
    };

    /** Where the cat's feet go in a spot, on the page: on top of the edge it sits on. */
    const placeOf = (s: Spot): Pt | null => {
      const reveal = s.el.closest("[data-reveal]");
      if (reveal && !reveal.classList.contains("is-in")) return null;
      const r = s.el.getBoundingClientRect();
      if (!r.width) return null;
      const S = size();
      const sx = window.scrollX;
      const sy = window.scrollY;
      const night = getTheme() === "night" ? 4 : 0; // screens have an outer line at night
      switch (s.pose) {
        case "sleep": {
          const t = letters(s.el);
          return [t.right - 10 * S + sx, t.top + sy];
        }
        case "bat":
          return [r.right - 17 * S + sx, r.top - night + sy];
        case "watch":
          // the left corner; on narrow screens the buttons sit above that corner, so it takes the right one
          return [(window.innerWidth > 980 ? r.left + 12 * S : r.right - 17 * S) + sx, r.top - night + sy];
        case "badge": {
          const logo = s.el.querySelector("canvas")?.getBoundingClientRect();
          // right under the dragonfly's lower wing, so the raised paw comes up to it
          // (on phones the cat is smaller and would stand on the banner's lettering, so it stands just past the logo)
          return logo && logo.width ? [(S === 3 ? logo.right + 6 * S : logo.left + (logo.width * 67) / 80 + 7 * S) + sx, logo.top + (logo.height * 51) / 56 + sy] : null;
        }
        case "peek":
          return [r.right - 13 * S + sx, r.top + sy];
        default:
          return [r.right - 20 * S + sx, r.top + sy];
      }
    };
    /** Where the logo's banner ends at the cat's height: the cat is hidden to the left of this. */
    const badgeEdge = (s: Spot) => {
      const logo = s.el.querySelector("canvas")?.getBoundingClientRect();
      return logo ? (size() === 3 ? logo.right - size() : logo.left + logo.width * 0.78) + window.scrollX : 0;
    };
    /** How tall the cat is in a spot, in cat pixels. */
    const tall = (s: Spot) => (s.pose === "peek" ? 7 : s.pose === "sleep" || s.pose === "bat" ? 12 : 16);
    /** A spot can be gone to when the whole cat would be on screen there, below the top bar. */
    const reach = (s: Spot): Pt | null => {
      const p = placeOf(s);
      if (!p) return null;
      const S = size();
      const x = p[0] - window.scrollX;
      const y = p[1] - window.scrollY;
      return y - tall(s) * S > ceiling() + 6 && y + 8 * S < window.innerHeight - 4 && x - 9 * S > 0 && x + 11 * S < window.innerWidth ? p : null;
    };
    const inView = (p: Pt) => {
      const y = p[1] - window.scrollY;
      return y > ceiling() - 2 * size() && y - 15 * size() < window.innerHeight;
    };

    let mode: "home" | "perch" | "travel" = "home";
    let spot: Spot | null = null; // where it is, or where it is headed
    let feet: Pt = [0, 0];
    // settled in a spot
    let settle: "in" | "idle" = "idle";
    let since = 0;
    let hoverAt = -1;
    let petAt = -1;
    let pointer: [number, number] | null = null;
    // on the move
    let steps: Step[] = [];
    let stepAt = 0;
    let painted = "";
    // chasing the mouse along the mailbox
    let chase: number | null = null; // when this chase began
    let nextChase = Infinity;
    let ranTo: Pt | null = null; // where the cat has got to
    let mousePainted = "";
    // the trainer and his ball, on the PokéIQ screen
    let throwAt: number | null = null; // when this throw began
    let nextThrow = Infinity;
    let trainerPainted = "";
    let ballPainted = "";

    /**
     * Where the cat should be: null is home (the room is back), a spot is that spot,
     * and undefined is "stay put" (nothing better is on screen yet).
     */
    const choose = (): Spot | null | undefined => {
      if (roomShowing() >= 0.3) return null;
      const H = window.innerHeight;
      if (mode === "perch" && spot) {
        // comfortable where it is: not too near the top bar, not too near the bottom
        const y = feet[1] - window.scrollY;
        if (y > ceiling() + tall(spot) * size() + 40 && y < H * 0.84 && reach(spot)) return spot;
      }
      let best: Spot | undefined;
      let nearest = Infinity;
      for (const s of spots) {
        const p = reach(s);
        if (!p) continue;
        const d = Math.abs(p[1] - window.scrollY - H * 0.46);
        if (d < nearest) {
          nearest = d;
          best = s;
        }
      }
      if (best) return best;
      return mode === "perch" && spot && inView(feet) ? spot : undefined;
    };

    const arrive = (now: number) => {
      steps = [];
      wrap.style.clipPath = "none";
      chase = null;
      mouse.hidden = true;
      nextChase = now + FIRST;
      throwAt = null;
      trainer.hidden = ball.hidden = true;
      nextThrow = now + 3000;
      if (!spot) {
        mode = "home";
        wrap.hidden = true;
        mascot.setAway(false);
        return;
      }
      mode = "perch";
      settle = reduce.matches ? "idle" : "in";
      since = now;
      painted = "";
      const at = placeOf(spot);
      if (at) feet = at;
      mascot.setAway(true);
      wrap.hidden = false;
      // the part of the canvas that is actually cat, for the pointer
      const S = size();
      const top = spot.pose === "peek" ? 6 : spot.pose === "sleep" || spot.pose === "bat" ? 11 : 15;
      const under = spot.pose === "peek" || spot.pose === "sleep" || spot.pose === "badge" ? 1 : 7;
      hit.style.left = `${(CAT_X - 2) * S}px`;
      hit.style.top = `${(CAT_GROUND - top) * S}px`;
      hit.style.width = `${(spot.pose === "sleep" ? 19 : 16) * S}px`;
      hit.style.height = `${(top + under) * S}px`;
      hit.style.pointerEvents = "auto";
    };

    /** Leave where it is (if that is on screen) and come out at the new spot, or go home (null). */
    const setOut = (to: Spot | null, now: number) => {
      const S = size();
      mascot.swat = false;
      const list: Step[] = [];
      throwAt = null;
      trainer.hidden = ball.hidden = true;
      if (chase !== null) {
        // called away in the middle of a chase: it leaves from wherever it has run to
        if (ranTo) feet = ranTo;
        chase = null;
        mouse.hidden = true;
      }
      if (mode === "perch" && spot && inView(feet)) {
        if (spot.pose === "peek") list.push({ kind: "duck", ms: 180 });
        else if (spot.pose === "badge") {
          list.push({ kind: "turn", ms: 200, at: feet, pose: spot.pose, arriving: false, flip: -1 });
          list.push({ kind: "slip", ms: 560, from: feet, to: [feet[0] - 16 * S, feet[1]], edge: badgeEdge(spot) });
        } else list.push({ kind: "sink", ms: 420, at: feet, pose: spot.pose });
      }
      if (to) {
        const at = placeOf(to);
        if (!at) return;
        if (to.pose === "badge") {
          list.push({ kind: "slip", ms: 640, from: [at[0] - 16 * S, at[1]], to: at, edge: badgeEdge(to) });
          list.push({ kind: "turn", ms: 200, at, pose: to.pose, arriving: true, flip: 1 });
        } else if (to.pose !== "peek") list.push({ kind: "rise", ms: 620, at, pose: to.pose });
        // (the peeking cat comes up by itself once it has "arrived")
      }
      spot = to;
      hoverAt = petAt = -1;
      hit.style.pointerEvents = "none";
      if (!list.length || reduce.matches) {
        arrive(now); // nothing to show, or no motion wanted
        return;
      }
      steps = list;
      stepAt = now;
      mode = "travel";
      painted = "";
      mascot.setAway(true);
      wrap.hidden = false;
    };

    /** Put the canvas so the cat's feet are on a point of the page, squashed as asked. */
    const put = (p: Pt, sx = 1, sy = 1) => {
      const S = size();
      wrap.style.width = `${CAT_W * S}px`;
      wrap.style.height = `${CAT_H * S}px`;
      wrap.style.transformOrigin = `${RUN_FEET * S}px ${CAT_GROUND * S}px`;
      wrap.style.transform = `translate3d(${(p[0] - RUN_FEET * S).toFixed(1)}px, ${(p[1] - CAT_GROUND * S).toFixed(1)}px, 0) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    };
    const draw = (rows: string[]) => {
      const P = getTheme() === "night" ? NIGHT : DAY;
      const color: Record<string, string> = { "0": FUR, s: SHADE, o: P.o, k: P.k, K: P.k, i: P.i, h: P.o };
      g.clearRect(0, 0, CAT_W, CAT_H);
      rows.forEach((line, y) => {
        for (let x = 0; x < line.length; x++) {
          const ch = line[x];
          if (ch === ".") continue;
          g.fillStyle = color[ch];
          g.fillRect(x, y, 1, 1);
        }
      });
    };
    /** Redraw only when the picture changes (the position changes every frame, the drawing far less often). */
    const show = (key: string, rows: () => string[]) => {
      const k = `${key}|${getTheme()}`;
      if (k === painted) return;
      painted = k;
      draw(rows());
    };
    const facing = (pose: Pose) => () => paintCat({ pose, t: 0, hover: -1, pet: -1, phase: "in", p: 1 });

    const travel = (now: number) => {
      let t = now - stepAt;
      while (steps.length && t >= steps[0].ms) {
        t -= steps[0].ms;
        stepAt += steps[0].ms;
        steps.shift();
      }
      const step = steps[0];
      if (!step) {
        arrive(now);
        return;
      }
      const p = t / step.ms;
      const S = size();
      wrap.style.clipPath = "none";
      if (step.kind === "rise" || step.kind === "sink") {
        // up from behind the edge it sits on (with a little bounce at the top), or back down behind it
        const deep = (CAT_GROUND - 6) * S; // far enough down that none of it shows
        const q = p - 1;
        const up = step.kind === "rise" ? 1 + 2.7 * q * q * q + 1.7 * q * q : 1 - p * p; // 0 hidden, 1 fully up
        const d = deep * (1 - up);
        put([step.at[0], step.at[1] + d]);
        // nothing below the edge shows until it is all the way up (then its tail or paws can hang over)
        if (d > 0.5) wrap.style.clipPath = `inset(0 0 ${((CAT_H - CAT_GROUND) * S + d).toFixed(1)}px 0)`;
        show(`face${step.pose}`, facing(step.pose));
      } else if (step.kind === "slip") {
        // walking out from behind the badge, or back behind it: whatever is left of its edge is hidden
        const x = step.from[0] + (step.to[0] - step.from[0]) * p;
        const flip = step.to[0] < step.from[0] ? -1 : 1;
        put([x, step.from[1]], flip, 1);
        const w = CAT_W * S;
        const shown = RUN_FEET * S + flip * (step.edge - x); // how far across the canvas the badge's edge is
        wrap.style.clipPath = flip > 0 ? `inset(0 0 0 ${Math.max(0, Math.min(w, shown)).toFixed(1)}px)` : `inset(0 ${Math.max(0, Math.min(w, w - shown)).toFixed(1)}px 0 0)`;
        const frame = Math.floor(t / 130) % 4;
        show(`walk${frame}`, () => paintSide("walk", frame));
      } else if (step.kind === "turn") {
        // turning between side-on and facing us: it narrows, and widens again as the other drawing
        const sideOn = step.arriving ? p < 0.5 : p >= 0.5;
        const width = 0.3 + 0.7 * Math.abs(1 - 2 * p);
        put(step.at, (sideOn ? step.flip : 1) * width, 1);
        if (sideOn) show("stand", () => paintSide("walk", 1));
        else show(`face${step.pose}`, facing(step.pose));
      } else {
        put(feet);
        show(`duck${Math.round(p * 5)}`, () => paintCat({ pose: "peek", t: 0, hover: -1, pet: -1, phase: "out", p }));
      }
    };

    /** The edge the cat sits on in Contact, on the page: null where it is too short to run along (phones). */
    const ledge = () => {
      if (!spot) return null;
      const S = size();
      const r = spot.el.getBoundingClientRect();
      const who = spot.el.querySelector(".who")?.getBoundingClientRect();
      const tag = (who ? who.right + 4 : r.left) + window.scrollX; // the right-hand end of the name tag and its shadow
      const seat = r.right - 20 * S + window.scrollX; // where the cat sits
      const left = tag + 11 * S; // where it pulls up, nose to the name tag
      return seat - left < 60 * S ? null : { y: r.top + window.scrollY, seat, left, hole: tag + 4 * S, drop: r.right - 5 * S + window.scrollX };
    };
    /** Put the mouse with its feet on a point of the page; `depth` is how far it is down behind the edge. */
    const putMouse = (x: number, y: number, flip: number, depth: number, frame: number) => {
      const S = size();
      mouse.style.width = `${MOUSE_W * S}px`;
      mouse.style.height = `${MOUSE_H * S}px`;
      mouse.style.transformOrigin = `${MOUSE_FEET * S}px ${MOUSE_GROUND * S}px`;
      mouse.style.transform = `translate3d(${(x - MOUSE_FEET * S).toFixed(1)}px, ${(y - MOUSE_GROUND * S + depth).toFixed(1)}px, 0) scale(${flip}, 1)`;
      mouse.style.clipPath = depth > 0.5 ? `inset(0 0 ${((MOUSE_H - MOUSE_GROUND) * S + depth).toFixed(1)}px 0)` : "none";
      mouse.hidden = false;
      const key = `${frame}|${getTheme()}`;
      if (key === mousePainted) return;
      mousePainted = key;
      const P = getTheme() === "night" ? NIGHT : DAY;
      const color: Record<string, string> = { m: MOUSE_FUR, f: MOUSE_PAW, k: P.k, K: P.k, o: P.o, t: P.o };
      mg.clearRect(0, 0, MOUSE_W, MOUSE_H);
      paintMouse(frame).forEach((line, j) => {
        for (let i = 0; i < line.length; i++) {
          if (line[i] === ".") continue;
          mg.fillStyle = color[line[i]];
          mg.fillRect(i, j, 1, 1);
        }
      });
    };
    const endChase = (now: number) => {
      chase = null;
      ranTo = null;
      mouse.hidden = true;
      wrap.style.clipPath = "none";
      hit.style.pointerEvents = "auto";
      settle = "in"; // it sits back down the way it does when it arrives
      since = now;
      painted = "";
      nextChase = now + REST;
    };
    /** One frame of the chase. False once it is over (or cannot go on) and the cat is sitting again. */
    const hunt = (now: number): boolean => {
      const L = ledge();
      if (chase === null || !L) {
        endChase(now);
        return false;
      }
      const S = size();
      const t = now - chase;
      const run = L.seat - L.left; // how far the cat runs each way
      const speed = 0.075 * S; // the mouse, in pixels a millisecond; the cat is a little faster
      const deep = MOUSE_GROUND * S; // far enough down that none of the mouse shows
      const m0 = L.seat - Math.min(Math.max(run * 0.42, 34 * S), 70 * S); // where the mouse first comes up
      const m1 = L.left + Math.min(Math.max(run * 0.3, 26 * S), 50 * S); // and where it comes up again, behind the cat
      const toHole = (m0 - L.hole) / speed; // its dash to the name tag
      const toDrop = (L.drop - m1) / speed; // and its dash to the far end
      // the moments the chase turns on
      const SPOTTED = 800; // the cat has seen it and winds up
      const OFF = SPOTTED + 300; // the cat is away, the mouse 150 ms before it
      const LOST = OFF + toHole + 100; // the cat pulls up at the name tag: the mouse went down a moment ago
      const BACK = LOST + 1500; // the mouse is out again behind it and the cat is after it
      const GONE = BACK + toDrop - 50; // the cat is back at its seat: the mouse went over the end
      const DONE = GONE + 450;
      if (t >= DONE) {
        endChase(now);
        return false;
      }
      const stride = (x: number) => Math.floor(Math.abs(x) / (6 * S)) % 4;
      const scurry = Math.floor(now / 70) % 2;
      const cat = (x: number, flip: number, key: string, rows: () => string[], width = 1) => {
        ranTo = [x, L.y];
        wrap.style.clipPath = "none";
        put(ranTo, flip * width, 1);
        show(key, rows);
      };

      // the mouse
      if (t < SPOTTED + 150) {
        // up over the edge some way along from the cat, and it freezes; then it turns to run
        const up = Math.min(1, t / 400);
        putMouse(m0, L.y, t < SPOTTED ? 1 : -1, deep * (1 - up) * (1 - up), 0);
      } else if (t < SPOTTED + 150 + toHole + 180) {
        // along the edge to the name tag, and down behind the edge beside it
        const ran = t - SPOTTED - 150;
        const down = Math.max(0, (ran - toHole) / 180);
        putMouse(Math.max(L.hole, m0 - speed * ran), L.y, -1, deep * down, down > 0 ? 0 : scurry);
      } else if (t < LOST + 500) mouse.hidden = true;
      else if (t < LOST + 1300) {
        // up again behind the cat's back, and off the other way just before the cat turns
        const up = Math.min(1, (t - LOST - 500) / 350);
        putMouse(m1, L.y, t < LOST + 1100 ? -1 : 1, deep * (1 - up) * (1 - up), 0);
      } else if (t < LOST + 1300 + toDrop + 180) {
        const ran = t - LOST - 1300;
        const down = Math.max(0, (ran - toDrop) / 180);
        putMouse(Math.min(L.drop, m1 + speed * ran), L.y, 1, deep * down, down > 0 ? 0 : scurry);
      } else mouse.hidden = true;

      // the cat
      const mark = (glyph: Mark, mirror: boolean) => ({ glyph, mirror });
      if (t < SPOTTED) {
        // still sitting: it looks along the edge, and then it has seen it
        const noticed = t > 450;
        cat(L.seat, 1, `spot${t > 350 ? 1 : 0}${noticed ? 1 : 0}${Math.floor(now / 83)}`, () =>
          paintCat({ pose: "perch", t: (now - since) / 1000, hover: -1, pet: -1, phase: "idle", p: 0, gaze: t > 350 ? -1 : 0, mark: noticed ? "bang" : undefined }),
        );
      } else if (t < OFF) {
        // it turns side-on to face along the edge, and crouches
        const p = (t - SPOTTED) / 200;
        if (p < 0.5) cat(L.seat, 1, "faceperch", facing("perch"), 0.3 + 0.7 * (1 - 2 * p));
        else cat(L.seat, -1, "crouch", () => paintSide("crouch"), p < 1 ? 0.3 + 0.7 * (2 * p - 1) : 1);
      } else if (t < LOST) {
        const u = (t - OFF) / (LOST - OFF);
        const x = L.seat - run * dash(u);
        if (u > 0.93) cat(x, -1, "crouch", () => paintSide("crouch"));
        else cat(x, -1, `run${stride(L.seat - x)}`, () => paintSide("run", stride(L.seat - x)));
      } else if (t < BACK) {
        const v = t - LOST;
        if (v < 250) cat(L.left, -1, "crouch", () => paintSide("crouch"));
        else if (v < 1000) cat(L.left, -1, "lost", () => paintSide("walk", 1, mark("what", true)));
        else if (v < 1200) {
          // it has heard it: round it comes
          const p = (v - 1000) / 200;
          cat(L.left, p < 0.5 ? -1 : 1, "stand", () => paintSide("walk", 1), 0.3 + 0.7 * Math.abs(1 - 2 * p));
        } else cat(L.left, 1, "found", () => paintSide("crouch", 0, mark("bang", false)));
      } else if (t < GONE) {
        const u = (t - BACK) / (GONE - BACK);
        const x = L.left + run * dash(u);
        if (u > 0.93) cat(x, 1, "crouch", () => paintSide("crouch"));
        else cat(x, 1, `run${stride(x - L.left)}`, () => paintSide("run", stride(x - L.left)));
      } else {
        // back at its seat, looking over the end; then it turns to face us again
        const v = t - GONE;
        const p = (v - 200) / 250;
        if (v < 200) cat(L.seat, 1, "crouch", () => paintSide("crouch"));
        else if (p < 0.5) cat(L.seat, 1, "stand", () => paintSide("walk", 1), 0.3 + 0.7 * (1 - 2 * p));
        else cat(L.seat, 1, "faceperch", facing("perch"), 0.3 + 0.7 * (2 * p - 1));
      }
      return true;
    };

    /** Paint one of the small extra drawings (the trainer, the ball) onto its own canvas. */
    const stamp = (ctx: CanvasRenderingContext2D, rows: string[]) => {
      const P = getTheme() === "night" ? NIGHT : DAY;
      const color: Record<string, string> = { c: P.o, o: P.o, s: "#ecc9a0", j: "#3f6f8a", "0": FUR, k: P.k, K: P.k };
      ctx.clearRect(0, 0, rows[0].length, rows.length);
      rows.forEach((line, j) => {
        for (let i = 0; i < line.length; i++) {
          if (line[i] === ".") continue;
          ctx.fillStyle = color[line[i]];
          ctx.fillRect(i, j, 1, 1);
        }
      });
    };
    /**
     * One frame of the trainer's throw, drawn around the cat while it goes on sitting as it was:
     * he comes up behind the edge the cat is on, winds up, throws; the ball arcs over, bounces
     * off the cat's head and drops behind the edge; he waits, gets nothing, and goes back down.
     */
    const pitch = (now: number) => {
      if (throwAt === null || !spot) return;
      const S = size();
      const t = now - throwAt;
      const r = spot.el.getBoundingClientRect();
      const dir = feet[0] - window.scrollX < r.left + r.width / 2 ? 1 : -1; // he stands on the far side of the cat
      const edge = feet[1];
      if (t >= 3300 || r.width < 70 * S) {
        throwAt = null;
        trainer.hidden = ball.hidden = true;
        nextThrow = now + 9000;
        return;
      }
      const tx = feet[0] + dir * Math.min(Math.max(r.width * 0.5, 40 * S), 80 * S);
      // the trainer
      const up = t < 450 ? t / 450 : t > 2800 ? 1 - (t - 2800) / 500 : 1;
      const depth = (TRAINER_GROUND - 1) * S * (1 - up) * (1 - up);
      const frame = t >= 500 && t < 950 ? 1 : t >= 950 && t < 1250 ? 2 : 0;
      trainer.style.width = `${TRAINER_W * S}px`;
      trainer.style.height = `${TRAINER_H * S}px`;
      trainer.style.transformOrigin = `${TRAINER_FEET * S}px ${TRAINER_GROUND * S}px`;
      trainer.style.transform = `translate3d(${(tx - TRAINER_FEET * S).toFixed(1)}px, ${(edge - TRAINER_GROUND * S + depth).toFixed(1)}px, 0) scale(${-dir}, 1)`;
      trainer.style.clipPath = `inset(0 0 ${((TRAINER_H - TRAINER_GROUND) * S + depth).toFixed(1)}px 0)`; // he is behind the edge: nothing shows below it
      trainer.hidden = false;
      const tk = `${frame}|${getTheme()}`;
      if (tk !== trainerPainted) {
        trainerPainted = tk;
        stamp(tg, paintTrainer(frame));
      }
      // the ball: in his hand, through the air, off the cat's head, down behind the edge
      const hand: Pt = [tx + dir * 5 * S, edge - 8 * S];
      const head: Pt = [feet[0] + dir * 6 * S, edge - 11 * S];
      let at: Pt | null = null;
      if (t >= 500 && t < 950) at = hand;
      else if (t >= 950 && t < 1550) {
        const p = (t - 950) / 600;
        at = [tx - dir * 6 * S + (head[0] - (tx - dir * 6 * S)) * p, edge - 9 * S + (head[1] - (edge - 9 * S)) * p - Math.sin(Math.PI * p) * 9 * S];
      } else if (t >= 1550 && t < 2300) {
        const p = (t - 1550) / 750;
        at = [head[0] + dir * 9 * S * p, head[1] - 7 * S * 4 * p * (0.45 - p)];
      }
      if (!at) {
        ball.hidden = true;
        return;
      }
      ball.style.width = ball.style.height = `${BALL * S}px`;
      ball.style.transform = `translate3d(${(at[0] - (BALL / 2) * S).toFixed(1)}px, ${(at[1] - (BALL / 2) * S).toFixed(1)}px, 0)`;
      const below = at[1] + (BALL / 2) * S - edge; // how much of it has dropped behind the edge
      ball.style.clipPath = below > 0 ? `inset(0 0 ${Math.min(BALL * S, below).toFixed(1)}px 0)` : "none";
      ball.hidden = false;
      const bk = getTheme();
      if (bk !== ballPainted) {
        ballPainted = bk;
        stamp(bg, paintBall());
      }
    };

    const perch = (now: number) => {
      if (!spot) return;
      if (spot.pose === "watch" && !reduce.matches) {
        if (throwAt === null && now >= nextThrow && settle === "idle" && hoverAt < 0) throwAt = now;
        pitch(now);
      }
      const at = placeOf(spot);
      if (at) feet = at; // stay on the spot if the page shifts under it
      const still = reduce.matches;
      if (spot.pose === "perch" && !still) {
        // the mouse shows itself when the cat is sitting quietly: not being petted, washing or yawning
        const c = ((now - since) / 1000) % 13;
        const quiet = settle === "idle" && hoverAt < 0 && (petAt < 0 || now - petAt > 1200) && !(c > 6.2 && c < 8.4) && !(c > 10.4 && c < 11.7);
        if (chase === null && now >= nextChase && quiet && ledge()) {
          chase = now;
          hit.style.pointerEvents = "none";
        }
        if (chase !== null && hunt(now)) return;
      }
      const lead = spot.pose === "sleep" ? 1100 : spot.pose === "peek" ? 320 : 240;
      if (spot.pose === "badge" && !still && settle === "idle" && hoverAt < 0 && (petAt < 0 || now - petAt > 1200)) {
        // at the dragonfly: up on its hind legs watching it, one paw lifted and held, a quick swipe, and again;
        // then down in a crouch for a moment. The dragonfly darts away as each swipe comes across.
        const s = ((now - since) / 1000) % 3.2;
        const k = s < 0.4 ? 2 : s < 0.95 ? 0 : s < 1.1 ? 1 : s < 1.35 ? 2 : s < 1.75 ? 0 : s < 1.9 ? 1 : s < 2.3 ? 2 : -1;
        mascot.swat = (s >= 0.95 && s < 1.3) || (s >= 1.75 && s < 2.1);
        put(feet, -1, 1);
        if (k < 0) show("crouch", () => paintSide("crouch"));
        else show(`rear${k}`, () => paintRear(k));
        return;
      }
      mascot.swat = false;
      put(feet);
      if (settle === "in" && now - since >= lead) {
        settle = "idle";
        since = now;
      }
      // which way the pointer is, when it is close enough to be worth watching
      let gaze: number | null = null;
      if (pointer && hoverAt < 0 && !still) {
        const r = hit.getBoundingClientRect();
        const dx = pointer[0] - (r.left + r.width / 2);
        const dy = pointer[1] - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 320) gaze = dx < -36 ? -1 : dx > 36 ? 1 : 0;
      }
      const pose = spot.pose;
      const phase = settle;
      const p = settle === "in" ? Math.min(1, (now - since) / lead) : 0;
      show(`${pose}${Math.floor(now / 83)}`, () =>
        paintCat({
          pose,
          t: still ? 0.9 : phase === "idle" ? (now - since) / 1000 : 0,
          hover: hoverAt < 0 ? -1 : (now - hoverAt) / 1000,
          pet: petAt < 0 ? -1 : (now - petAt) / 1000,
          phase,
          p,
          gaze,
        }),
      );
    };

    let raf = 0;
    let looked = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (mode !== "travel" && now - looked > 140) {
        looked = now;
        const want = choose();
        if (want !== undefined && want !== (mode === "home" ? null : spot)) setOut(want, now);
      }
      if (mode === "travel") travel(now);
      else if (mode === "perch") perch(now);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      pointer = e.pointerType === "mouse" ? [e.clientX, e.clientY] : null;
    };
    const onEnter = () => {
      if (mode === "perch" && settle === "idle") hoverAt = performance.now();
    };
    const onLeave = () => {
      hoverAt = -1;
    };
    let untouch = 0;
    const onPet = (e: PointerEvent) => {
      if (mode !== "perch") return;
      const now = performance.now();
      petAt = now;
      sfx.select();
      if (e.pointerType !== "mouse") {
        // no hover on a touch screen: a tap is both the hello and the pet
        hoverAt = now;
        window.clearTimeout(untouch);
        untouch = window.setTimeout(onLeave, 1700);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    hit.addEventListener("pointerenter", onEnter);
    hit.addEventListener("pointerleave", onLeave);
    hit.addEventListener("pointerdown", onPet);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(untouch);
      window.removeEventListener("pointermove", onMove);
      hit.removeEventListener("pointerenter", onEnter);
      hit.removeEventListener("pointerleave", onLeave);
      hit.removeEventListener("pointerdown", onPet);
      wrap.hidden = true;
      mouse.hidden = trainer.hidden = ball.hidden = true;
      mascot.setAway(false);
    };
  }, []);

  return (
    <>
      <div ref={wrapRef} className="mascot" hidden aria-hidden="true">
        <canvas ref={canvasRef} width={CAT_W} height={CAT_H} />
        <button ref={hitRef} type="button" tabIndex={-1} />
      </div>
      <div ref={mouseRef} className="mascot" hidden aria-hidden="true">
        <canvas ref={mouseCanvasRef} width={MOUSE_W} height={MOUSE_H} />
      </div>
      <div ref={trainerRef} className="mascot" hidden aria-hidden="true">
        <canvas ref={trainerCanvasRef} width={TRAINER_W} height={TRAINER_H} />
      </div>
      <div ref={ballRef} className="mascot" hidden aria-hidden="true">
        <canvas ref={ballCanvasRef} width={BALL} height={BALL} />
      </div>
    </>
  );
}
