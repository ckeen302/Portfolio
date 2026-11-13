"use client";

import { useSyncExternalStore } from "react";
import { player } from "@/lib/player";

/** Plays the progression on the pixel ChordCraft screen out loud. Pressing it again stops it. */
export function PlayChords() {
  const playing = useSyncExternalStore(
    player.subscribe,
    () => player.playing,
    () => false,
  );
  return (
    <button type="button" className="screen__play" aria-pressed={playing} aria-label={playing ? "Stop the chords" : "Play these chords out loud"} onClick={() => player.toggle()}>
      <svg width="10" height="10" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path fill="currentColor" d={playing ? "M1 1h6v6h-6z" : "M1 0h2v1h2v1h2v1h1v2h-1v1h-2v1h-2v1h-2z"} />
      </svg>
      {playing ? "Stop" : "Play"}
    </button>
  );
}
