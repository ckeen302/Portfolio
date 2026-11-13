"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "@/lib/sfx";
import { PxCheck, PxCopy } from "./Px";

/** Copies text to the clipboard and confirms in place. */
export function CopyButton({ text, className, children }: { text: string; className?: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    sfx.select();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked (permissions, insecure context): fall back to a hidden field.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" className={className} onClick={copy} data-copied={copied || undefined}>
      <span aria-live="polite">{copied ? "Copied" : children}</span>
      {copied ? <PxCheck /> : <PxCopy />}
    </button>
  );
}
