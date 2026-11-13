"use client";

import { useState } from "react";
import { sfx } from "@/lib/sfx";
import { PxCursor } from "./Px";

export type MenuItem = { label: string; href: string; count?: string | number; external?: boolean };

/** A cursor menu, like the one on an old RPG screen. Hover or use the arrow keys, then Enter. */
export function Menu({ items, label }: { items: MenuItem[]; label: string }) {
  const [sel, setSel] = useState(0);

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    setSel(next);
    sfx.move();
    e.currentTarget.querySelectorAll<HTMLAnchorElement>("a")[next]?.focus();
  };

  return (
    <nav className="box menu" aria-label={label}>
      <div className="in">
        <ul onKeyDown={onKeyDown}>
          {items.map((it, i) => (
            <li key={it.href} data-sel={i === sel || undefined}>
              <a
                href={it.href}
                target={it.external ? "_blank" : undefined}
                rel={it.external ? "noopener" : undefined}
                onMouseEnter={() => {
                  if (i !== sel) sfx.move();
                  setSel(i);
                }}
                onFocus={() => setSel(i)}
                onClick={() => sfx.select()}
              >
                <PxCursor className="menu__cur" size={28} />
                <span>{it.label}</span>
                {it.count !== undefined && <small>{it.count}</small>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
