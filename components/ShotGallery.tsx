"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Shot = { id: string; label: string; src: string; alt: string };

/** Tabbed screenshots that cross-fade, auto-advancing until the visitor picks one. */
export function ShotGallery({ shots }: { shots: readonly Shot[] }) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (visible.current && !document.hidden) setIndex((i) => (i + 1) % shots.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [auto, shots.length]);

  const pick = (i: number) => {
    setAuto(false);
    setIndex(i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + shots.length) % shots.length;
    pick(next);
    root.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div className="gallery" ref={root}>
      <div className="gallery__stage">
        {shots.map((s, i) => (
          <Image
            key={s.id}
            src={s.src}
            alt={s.alt}
            fill
            sizes="(min-width: 1100px) 700px, 100vw"
            data-on={i === index || undefined}
            aria-hidden={i === index ? undefined : true}
          />
        ))}
      </div>
      <div className="gallery__tabs" role="tablist" aria-label="Screens" onKeyDown={onKey}>
        {shots.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            tabIndex={i === index ? 0 : -1}
            data-auto={auto && i === index ? "true" : undefined}
            onClick={() => pick(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
