import { CHORD_TIME, PLAY_TIME, SETS, TONES } from "./chords";

/**
 * Plays one of the chord progressions out loud on an electric piano: each chord is
 * struck once, all its notes together, over its root an octave down. The sound is
 * made here (a sine wave shaped by a second one, bright as the key is struck and
 * mellow as it rings), so nothing is loaded, and nothing sounds until the visitor
 * presses Play. Everything that shows the music (the pixel ChordCraft, the keyboard
 * in the room) reads `player.now()`.
 */
let ctx: AudioContext | null = null;
let run: { set: number; t0: number; out: GainNode; timer: number } | null = null;
let cue = 0; // the progression the pixel screen is showing, which Play will start
let asked = 0; // counts presses of Play, so a slow start cannot overlap a newer one
let struck: { midi: number; at: number }[] = []; // keys the visitor has just played by hand
const LIT = 320; // how long a played key stays lit (ms)
const listeners = new Set<() => void>();
const tell = () => listeners.forEach((fn) => fn());

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** One struck key: it rings for `dur` seconds, fading, and is let go at the end. */
function key(to: AudioNode, midi: number, at: number, dur: number, level: number) {
  if (!ctx) return;
  const f = hz(midi);
  const tone = ctx.createOscillator();
  const bite = ctx.createOscillator(); // bends the tone: the bark of the hammer, gone in a moment
  const depth = ctx.createGain();
  const gain = ctx.createGain();
  tone.frequency.value = f;
  bite.frequency.value = f;
  depth.gain.setValueAtTime(f * 1.6, at);
  depth.gain.exponentialRampToValueAtTime(f * 0.25, at + 0.35);
  bite.connect(depth).connect(tone.frequency);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(level, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(level * 0.3, at + dur);
  gain.gain.linearRampToValueAtTime(0.0001, at + dur + 0.12);
  tone.connect(gain).connect(to);
  tone.start(at);
  bite.start(at);
  tone.stop(at + dur + 0.15);
  bite.stop(at + dur + 0.15);
}

function stop() {
  if (!run || !ctx) return;
  const { out, timer } = run;
  run = null;
  window.clearTimeout(timer);
  out.gain.cancelScheduledValues(ctx.currentTime);
  out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
  out.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
  window.setTimeout(() => out.disconnect(), 120);
  tell();
}

async function play(set: number) {
  stop();
  const mine = ++asked;
  try {
    ctx ??= new AudioContext();
    await ctx.resume();
  } catch {
    return; // no sound in this browser
  }
  if (mine !== asked || ctx.state !== "running") return; // pressed again meanwhile, or the browser will not play
  const out = ctx.createGain();
  out.gain.value = 0.22;
  out.connect(ctx.destination);

  const t0 = ctx.currentTime + 0.08;
  SETS[set].names.forEach((name, i) => {
    const tones = TONES[name];
    const at = t0 + i * CHORD_TIME;
    const ring = i === 7 ? CHORD_TIME * 1.6 : CHORD_TIME; // the last chord is left to ring
    key(out, tones[0] - 12, at, ring, 0.5);
    tones.forEach((m, n) => key(out, m, at + n * 0.012, ring, tones.length > 3 ? 0.28 : 0.34)); // rolled very slightly, as a hand would
  });
  const timer = window.setTimeout(stop, (PLAY_TIME + 0.6) * 1000);
  run = { set, t0, out, timer };
  tell();
}

export const player = {
  get playing() {
    return run !== null;
  },
  /** The pixel screen says which progression it is showing. */
  setCue(set: number) {
    cue = set;
  },
  /** What is sounding at this moment, or null when nothing is playing. */
  now(): { set: number; at: number; chord: number; notes: readonly number[]; lead: number } | null {
    if (!run || !ctx) return null;
    const at = Math.min(PLAY_TIME - 0.001, Math.max(0, ctx.currentTime - run.t0));
    const chord = Math.floor(at / CHORD_TIME);
    const notes = TONES[SETS[run.set].names[chord]];
    return { set: run.set, at, chord, notes, lead: notes[0] }; // the root is the brightest key
  },
  toggle() {
    if (run) stop();
    else void play(cue);
  },
  /** The visitor plays one key themselves. */
  async strike(midi: number) {
    try {
      ctx ??= new AudioContext();
      await ctx.resume();
    } catch {
      return;
    }
    if (ctx.state !== "running") return;
    const out = ctx.createGain();
    out.gain.value = 0.3;
    out.connect(ctx.destination);
    key(out, midi, ctx.currentTime + 0.01, 0.9, 0.5);
    window.setTimeout(() => out.disconnect(), 1400);
    struck.push({ midi, at: performance.now() });
    tell();
    window.setTimeout(tell, LIT + 30); // so a room that is standing still redraws once the key goes dark
  },
  /** The keys played by hand that are still lit. */
  held(): number[] {
    const now = performance.now();
    struck = struck.filter((s) => now - s.at < LIT);
    return struck.map((s) => s.midi);
  },
  stop,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

if (typeof document !== "undefined") {
  // leaving the tab stops the music
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
}
