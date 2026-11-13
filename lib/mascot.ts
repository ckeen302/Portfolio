/**
 * Whether the cat is out on the page. There is only one cat, so while the Mascot
 * has it somewhere else, the pixel room does not draw it on the sill or the desk.
 */
let away = false;
const listeners = new Set<() => void>();

export const mascot = {
  /** True while the cat's paw is up at the MyBambino dragonfly, so the dragonfly can dodge it. */
  swat: false,
  get away() {
    return away;
  },
  setAway(next: boolean) {
    if (next === away) return;
    away = next;
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
