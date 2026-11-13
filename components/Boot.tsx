"use client";

import { useEffect } from "react";

/**
 * The start-up screen: the CK mark drops in, then the screen opens onto the
 * page. It is in the page from the first paint and plays in CSS alone (under a
 * second), so nothing waits on it. A small script in the layout switches it
 * off before paint on every visit after the first in a browser session; this
 * component only lets a click or a key press skip it.
 */
export function Boot() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.boot === "off") return;
    let timer = 0;
    const stop = () => {
      window.removeEventListener("pointerdown", end, true);
      window.removeEventListener("keydown", end, true);
      window.clearTimeout(timer);
    };
    function end() {
      root.dataset.boot = "off";
      stop();
    }
    window.addEventListener("pointerdown", end, true);
    window.addEventListener("keydown", end, true);
    timer = window.setTimeout(end, 1100);
    return stop;
  }, []);

  return (
    <div className="boot" aria-hidden="true">
      <span className="boot__half" />
      <span className="boot__half" />
      <svg className="boot__mark" viewBox="0 0 16 16" shapeRendering="crispEdges" focusable="false">
        <rect width="16" height="16" fill="var(--frame)" />
        <path fill="var(--inv)" d="M2 4h5v2h-3v4h3v2h-5zM9 4h2v3h1v-1h1v-2h2v2h-1v1h-1v2h1v1h1v2h-2v-2h-1v-1h-1v3h-2z" />
        <rect x="2" y="13" width="12" height="1" fill="var(--or)" />
      </svg>
    </div>
  );
}
