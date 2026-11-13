"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";
import { PxMore } from "./Px";

type Seg = { text: string; hl: boolean };
const parse = (line: string): Seg[] => line.split("*").map((text, i) => ({ text, hl: i % 2 === 1 }));

/** The dialog box: types a line out one character at a time. Click, Enter or Space moves on. */
export function Dialog({ who, lines }: { who: string; lines: readonly string[] }) {
  const [idx, setIdx] = useState(0);
  const [n, setN] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  const segs = parse(lines[idx]);
  const total = segs.reduce((s, x) => s + x.text.length, 0);
  const done = n >= total;

  // Type the current line.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(total);
      return;
    }
    if (done) return;
    const id = window.setInterval(() => {
      if (!visible.current) return;
      setN((v) => {
        if (v % 3 === 0) sfx.type();
        return Math.min(total, v + 1);
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [idx, total, done]);

  const next = useCallback(() => {
    sfx.move();
    if (!done) setN(total);
    else {
      setIdx((i) => (i + 1) % lines.length);
      setN(0);
    }
  }, [done, total, lines.length]);

  // Move on by itself after a pause, but only while it is on screen.
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => {
      if (visible.current && !document.hidden) {
        setIdx((i) => (i + 1) % lines.length);
        setN(0);
      }
    }, 7000);
    return () => window.clearTimeout(id);
  }, [done, idx, lines.length]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let left = n;
  return (
    <div
      className="box dialog"
      ref={root}
      role="button"
      tabIndex={0}
      aria-label={`${lines[idx].replace(/\*/g, "")} Press Enter for the next line.`}
      onClick={next}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          next();
        }
      }}
    >
      <span className="who">{who}</span>
      <div className="in">
        <div className="dialog__stack" aria-hidden="true">
          {/* The full line, invisible, holds the box at its final height while the text types. */}
          <p className="dialog__ghost">{lines.reduce((a, b) => (a.length > b.length ? a : b)).replace(/\*/g, "")}</p>
          <p>
            {segs.map((s, i) => {
              const take = Math.max(0, Math.min(s.text.length, left));
              left -= take;
              const text = s.text.slice(0, take);
              return s.hl ? <em key={i}>{text}</em> : <span key={i}>{text}</span>;
            })}
          </p>
        </div>
        <span className="dialog__meta" aria-hidden="true">
          {idx + 1}/{lines.length}
        </span>
        <PxMore className="more" size={16} />
      </div>
    </div>
  );
}
