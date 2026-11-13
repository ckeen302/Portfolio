"use client";

import { useEffect, useRef } from "react";
import { CAT_GROUND, CAT_H, CAT_W, paintCat } from "@/lib/cat";
import { DAY, NIGHT } from "@/lib/palette";
import { getTheme, subscribeTheme } from "@/lib/theme";

const TOP = CAT_GROUND - 22; // the first row with anything in it (the "?" over its head)
const ROWS = 30; // down to the end of its tail

/** The cat on the page-not-found screen: sitting, puzzled, with a "?" over its head. */
export function LostCat() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current?.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const began = performance.now();
    const draw = () => {
      const P = getTheme() === "night" ? NIGHT : DAY;
      const color: Record<string, string> = { "0": "#f4f0dc", s: "#d3ccb4", o: P.o, k: P.k, K: P.k, i: P.i };
      const t = reduce.matches ? 0.9 : (performance.now() - began) / 1000;
      const rows = paintCat({ pose: "perch", t, hover: -1, pet: -1, phase: "idle", p: 0, gaze: [-1, 0, 1, 0][Math.floor(t / 1.2) % 4], mark: "what" });
      g.clearRect(0, 0, CAT_W, ROWS);
      rows.slice(TOP, TOP + ROWS).forEach((line, y) => {
        for (let x = 0; x < line.length; x++) {
          if (line[x] === ".") continue;
          g.fillStyle = color[line[x]];
          g.fillRect(x, y, 1, 1);
        }
      });
    };
    draw();
    const timer = reduce.matches ? 0 : window.setInterval(draw, 110);
    const off = subscribeTheme(draw);
    return () => {
      window.clearInterval(timer);
      off();
    };
  }, []);
  return <canvas ref={ref} className="lost__cat" width={CAT_W} height={ROWS} aria-hidden="true" />;
}
