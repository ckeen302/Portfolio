/** Tiny square-wave blips for menus and buttons. Off until the visitor turns sound on. */
let on = false;
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

const tone = (freq: number, at: number, dur: number) => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.045, ctx.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + at);
  osc.stop(ctx.currentTime + at + dur + 0.02);
};

export const sfx = {
  get on() {
    return on;
  },
  toggle() {
    on = !on;
    if (on) {
      ctx ??= new AudioContext();
      void ctx.resume();
      tone(660, 0, 0.06);
      tone(990, 0.07, 0.09);
    }
    listeners.forEach((fn) => fn());
  },
  move() {
    if (on) tone(520, 0, 0.035);
  },
  select() {
    if (!on) return;
    tone(660, 0, 0.05);
    tone(1040, 0.06, 0.08);
  },
  type() {
    if (on) tone(380, 0, 0.012);
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
