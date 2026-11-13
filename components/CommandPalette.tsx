"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { nav, projects, site } from "@/content/site";
import { PxCursor } from "./Px";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: ReactNode;
  run: () => void | Promise<void>;
};

const open = (href: string) => {
  window.open(href, "_blank", "noopener");
};

/** ⌘K / Ctrl K quick menu: jump to a section, copy the email, open a link. */
export function CommandPalette() {
  const [shown, setShown] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const shownRef = useRef(false);

  const close = useCallback(() => {
    setShown(false);
    restore.current?.focus?.();
  }, []);

  const items = useMemo<Item[]>(
    () => [
      ...nav.map((n) => ({
        id: `go-${n.id}`,
        group: "Jump to",
        label: n.label,
        keywords: "section go to",
        icon: <PxCursor size={14} />,
        run: () => {
          document.getElementById(n.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      })),
      {
        id: "copy-email",
        group: "Contact",
        label: "Copy email address",
        hint: site.email,
        keywords: "mail contact reach",
        icon: <PxCursor size={14} />,
        run: async () => {
          await navigator.clipboard.writeText(site.email).catch(() => {});
          setToast("Email copied");
        },
      },
      {
        id: "email",
        group: "Contact",
        label: "Send an email",
        keywords: "mail contact hire",
        icon: <PxCursor size={14} />,
        run: () => {
          window.location.href = `mailto:${site.email}`;
        },
      },
      {
        id: "resume",
        group: "Contact",
        label: "Open résumé",
        hint: "PDF",
        keywords: "resume cv download pdf",
        icon: <PxCursor size={14} />,
        run: () => open(site.resume),
      },
      {
        id: "github",
        group: "Links",
        label: "GitHub",
        hint: "ckeen302",
        keywords: "code repos source",
        icon: <PxCursor size={14} />,
        run: () => open(site.links.github),
      },
      {
        id: "linkedin",
        group: "Links",
        label: "LinkedIn",
        keywords: "profile connect",
        icon: <PxCursor size={14} />,
        run: () => open(site.links.linkedin),
      },
      ...projects.map((p) => ({
        id: `live-${p.id}`,
        group: "Links",
        label: `${p.name} live site`,
        hint: p.host,
        keywords: `project demo ${p.kind}`,
        icon: <PxCursor size={14} />,
        run: () => open(p.links[0].href),
      })),
    ],
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.group} ${it.hint ?? ""} ${it.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Open / close
  useEffect(() => {
    const show = () => {
      restore.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setIndex(0);
      setShown(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (shownRef.current) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", show);
    };
  }, [close]);

  useEffect(() => {
    shownRef.current = shown;
  }, [shown]);

  useEffect(() => {
    if (!shown) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => input.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(id);
    };
  }, [shown]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [index, shown]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const run = (it: Item | undefined) => {
    if (!it) return;
    close();
    void it.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog.
      e.preventDefault();
      input.current?.focus();
    }
  };

  let lastGroup = "";

  return (
    <>
      {shown && (
        <div className="cmd" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="cmd__panel" role="dialog" aria-modal="true" aria-label="Quick menu" onKeyDown={onKeyDown}>
            <div className="cmd__search">
              <PxCursor size={16} />
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, copy my email, open a link…"
                aria-label="Search actions"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>esc</kbd>
            </div>
            <div className="cmd__list" id="cmd-list" role="listbox" ref={listRef}>
              {results.length === 0 && <p className="cmd__empty">Nothing matches “{query}”.</p>}
              {results.map((it, i) => {
                const head = it.group !== lastGroup ? it.group : null;
                lastGroup = it.group;
                return (
                  <div key={it.id} role="presentation">
                    {head && <div className="cmd__group">{head}</div>}
                    <button
                      type="button"
                      id={`cmd-${it.id}`}
                      role="option"
                      aria-selected={i === index}
                      data-active={i === index}
                      className="cmd__item"
                      tabIndex={-1}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => run(it)}
                    >
                      <span className="cmd__icon">{it.icon}</span>
                      <span className="cmd__label">{it.label}</span>
                      {it.hint && <span className="cmd__hint">{it.hint}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="cmd__foot">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> select
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="toast" role="status" aria-live="polite" data-show={toast ? "true" : undefined}>
        {toast}
      </div>
    </>
  );
}
