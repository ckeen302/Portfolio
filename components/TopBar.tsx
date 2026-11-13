"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { nav, site } from "@/content/site";
import { sfx } from "@/lib/sfx";
import { followSky, getTheme, setTheme, subscribeTheme } from "@/lib/theme";
import { PxDown, PxMoon, PxSun } from "./Px";

/** The bar across the top: name, section links, sound and day/night switches, résumé. */
export function TopBar() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "day" as const);
  const sound = useSyncExternalStore(sfx.subscribe, () => sfx.on, () => false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => followSky(), []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 16);
      let current = "";
      for (const n of nav) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = n.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="top" data-scrolled={scrolled || undefined}>
      <div className="top__in">
        <a className="brand" href="#top">
          <span className="brand__mark">CK</span>
          <b>{site.name}</b>
          <span className="brand__role">{site.role}</span>
        </a>

        <nav className="top__nav" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? "true" : undefined} onMouseEnter={() => sfx.move()}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="top__right">
          <span className="open">
            <i aria-hidden="true" />
            {site.status}
          </span>
          <button type="button" className="chip" onClick={() => sfx.toggle()} aria-pressed={sound}>
            Sound {sound ? "on" : "off"}
          </button>
          <button
            type="button"
            className="chip chip--icon"
            onClick={() => {
              sfx.select();
              setTheme(theme === "night" ? "day" : "night");
            }}
            aria-label={theme === "night" ? "Switch to day" : "Switch to night"}
          >
            {theme === "night" ? <PxSun size={16} /> : <PxMoon size={16} />}
          </button>
          <a className="btn" href={site.resume} target="_blank" rel="noopener" onClick={() => sfx.select()}>
            Résumé <PxDown />
          </a>
        </div>
      </div>
    </header>
  );
}
