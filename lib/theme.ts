/**
 * Day / night theme, kept on <html data-theme> so CSS and the pixel room can both read it.
 * It follows the real sky over Newark, DE: day while the sun is up there, night once it
 * has set. A visitor can still switch it; their choice lasts for that browser session,
 * and the next visit starts from the real sky again.
 */
export type Theme = "day" | "night";

const KEY = "ck-theme";
const listeners = new Set<() => void>();

/**
 * Is the sun above the horizon in Newark, DE at this moment? A low-precision solar
 * position, good to a few minutes at sunrise and sunset. It is written to stand
 * alone, because the layout also runs it as text before the first paint.
 */
export function sunUp(ms: number): boolean {
  const rad = Math.PI / 180;
  const lat = 39.6837 * rad;
  const lon = -75.7497;
  const d = ms / 86400000 - 10957.5; // days since noon UTC on 1 Jan 2000
  const g = (357.529 + 0.98560028 * d) * rad;
  const L = (280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const e = (23.439 - 0.00000036 * d) * rad;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const lst = (18.697374558 + 24.06570982441908 * d) * 15 + lon; // local sidereal time, degrees
  const alt = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(lst * rad - ra));
  return alt > -0.833 * rad;
}

export function getTheme(): Theme {
  if (typeof document === "undefined") return "day";
  return document.documentElement.dataset.theme === "night" ? "night" : "day";
}

/** The visitor's own choice for this browser session, if they have made one. */
function chosen(): Theme | null {
  try {
    const saved = sessionStorage.getItem(KEY);
    return saved === "night" || saved === "day" ? saved : null;
  } catch {
    return null; // storage can be unavailable (private windows)
  }
}

function apply(t: Theme) {
  if (document.documentElement.dataset.theme === t) return;
  document.documentElement.dataset.theme = t;
  listeners.forEach((fn) => fn());
}

/** The visitor switches the theme themselves (the lamp, the button, the quick menu). */
export function setTheme(t: Theme) {
  try {
    sessionStorage.setItem(KEY, t);
  } catch {
    // the theme still applies for this page
  }
  apply(t);
}

/**
 * Keep the theme in step with the real sky over Newark, checking once a minute,
 * for as long as the visitor has not chosen for themselves. Returns a stop function.
 */
export function followSky() {
  const sync = () => {
    if (!chosen()) apply(sunUp(Date.now()) ? "day" : "night");
  };
  sync();
  const timer = window.setInterval(sync, 60000);
  return () => window.clearInterval(timer);
}

export function subscribeTheme(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
