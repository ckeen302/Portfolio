"use client";

import { useEffect } from "react";
import { sfx } from "@/lib/sfx";

/**
 * Page-level motion, in one small script:
 *  - [data-reveal]  steps into place once when scrolled into view
 *  - [data-focus]   the item nearest the middle of the screen gets .is-focus
 *  - buttons        make a small blip on hover and click when sound is on
 */
export function Fx() {
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const focus = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle("is-focus", entry.isIntersecting);
      },
      { rootMargin: "-38% 0px -38% 0px" },
    );
    document.querySelectorAll("[data-focus]").forEach((el) => focus.observe(el));

    // Buttons blip when sound is on.
    const isButton = (t: EventTarget | null) => (t as Element | null)?.closest?.(".btn, .chip, .top__nav a") ?? null;
    let hovered: Element | null = null;
    const onOver = (e: Event) => {
      const el = isButton(e.target);
      if (el && el !== hovered) sfx.move();
      hovered = el;
    };
    const onClick = (e: Event) => {
      if (isButton(e.target)) sfx.select();
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("click", onClick, { passive: true });

    return () => {
      reveal.disconnect();
      focus.disconnect();
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
