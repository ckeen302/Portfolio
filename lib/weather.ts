/**
 * The weather over Newark, DE right now, for the window in the pixel room. It is the
 * National Weather Service's latest observation from Wilmington Airport (KILG), the
 * nearest station, about ten miles away. Until an answer arrives, or if none does,
 * the sky is fair. Adding ?weather=rain (or any other sky) to the address shows that
 * sky instead, for looking at each one.
 */
export type Sky = "fair" | "cloudy" | "overcast" | "fog" | "rain" | "snow" | "storm";

const SKIES: readonly string[] = ["fair", "cloudy", "overcast", "fog", "rain", "snow", "storm"];
const SOURCE = "https://api.weather.gov/stations/KILG/observations/latest";
const KEY = "ck-sky";
const FRESH = 15 * 60 * 1000; // ask again after fifteen minutes
const STALE = 3 * 60 * 60 * 1000; // an observation older than this says nothing about now

type Observation = { timestamp?: string; textDescription?: string | null; icon?: string | null; cloudLayers?: { amount?: string }[] | null };

/** Turn the station's wording ("Light Rain and Fog/Mist", "Mostly Cloudy") into one of the skies the room can draw. */
export function skyFrom(seen: Observation): Sky {
  const icon = seen.icon?.split("/").pop()?.split("?")[0] ?? "";
  const said = `${seen.textDescription ?? ""} ${icon}`.toLowerCase();
  if (/thunder|tsra/.test(said)) return "storm";
  if (/snow|sleet|flurr|blizzard|ice pellets|wintry/.test(said)) return "snow";
  if (/rain|drizzle|shower|fzra/.test(said)) return "rain";
  if (/fog|mist|haze|smoke/.test(said)) return "fog";
  if (/mostly cloudy|bkn/.test(said)) return "cloudy";
  if (/partly|few|clear|fair|sunny|skc|sct/.test(said)) return "fair";
  if (/cloudy|overcast|ovc/.test(said)) return "overcast";
  const cover = (seen.cloudLayers ?? []).map((layer) => layer.amount);
  return cover.includes("OVC") ? "overcast" : cover.includes("BKN") ? "cloudy" : "fair";
}

let sky: Sky = "fair";
const listeners = new Set<() => void>();
const set = (next: Sky) => {
  if (next === sky) return;
  sky = next;
  listeners.forEach((fn) => fn());
};

export const weather = {
  get sky() {
    return sky;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** Keep the sky in step with the real weather for as long as the page is open. Returns a stop function. */
export function followWeather() {
  const forced = new URLSearchParams(window.location.search).get("weather");
  if (forced && SKIES.includes(forced)) {
    set(forced as Sky);
    return () => {};
  }
  let stopped = false;
  const check = async () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { sky: string; at: number } | null;
      if (saved && Date.now() - saved.at < FRESH && SKIES.includes(saved.sky)) {
        set(saved.sky as Sky);
        return;
      }
    } catch {
      // storage can be unavailable (private windows): just ask
    }
    try {
      const res = await fetch(SOURCE, { referrerPolicy: "no-referrer" });
      if (!res.ok || stopped) return;
      const seen = ((await res.json()) as { properties?: Observation }).properties ?? {};
      if (stopped || !seen.timestamp || Date.now() - Date.parse(seen.timestamp) > STALE) return;
      const next = skyFrom(seen);
      set(next);
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ sky: next, at: Date.now() }));
      } catch {
        // it will simply be asked for again
      }
    } catch {
      // offline, or the service is down: the sky stays as it is
    }
  };
  void check();
  const timer = window.setInterval(check, FRESH);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}
