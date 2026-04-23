'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { GLOSSARY_MATCH_STRINGS, findGlossaryEntry, type GlossaryEntry } from '@/content/glossary';

/**
 * Interactive inline term: underlined hint in the lesson body.
 * Hover or focus (keyboard / tap) to reveal a plain-language tooltip.
 */
export function GlossaryTerm({
  entry,
  display,
}: {
  entry: GlossaryEntry;
  display: string;
}) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const hostRef = useRef<HTMLSpanElement | null>(null);

  // Close on outside click / Escape (for tap-to-open on touch devices)
  useEffect(() => {
    if (!open) return;
    function onDocDown(e: MouseEvent) {
      if (!hostRef.current) return;
      if (!hostRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span
      ref={hostRef}
      className="glossary-term"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="glossary-term__trigger"
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          // On touch devices, tap toggles the tooltip without navigating.
          e.preventDefault();
          setOpen(v => !v);
        }}
      >
        {display}
      </button>
      {open && (
        <span role="tooltip" id={tipId} className="glossary-term__tip">
          <span className="glossary-term__tip-head">
            <span className="glossary-term__tip-term">{entry.term}</span>
            <span className="glossary-term__tip-cat">{entry.category}</span>
          </span>
          <span className="glossary-term__tip-body">{entry.short}</span>
          <Link
            className="glossary-term__tip-link"
            href={`/glossary#${entry.id}`}
            onClick={() => setOpen(false)}
          >
            Full definition →
          </Link>
        </span>
      )}
    </span>
  );
}

/**
 * Walk a paragraph of plain text and return React nodes with glossary terms
 * auto-wrapped in <GlossaryTerm>. Each unique term is wrapped at most once
 * per paragraph so the UI doesn't get noisy.
 */
export function renderWithGlossary(text: string, key?: string | number): ReactNode {
  const nodes: ReactNode[] = [];
  const seen = new Set<string>(); // entry.id → already wrapped once
  let i = 0;
  let n = 0;

  while (i < text.length) {
    const match = findNextMatch(text, i, seen);
    if (!match) {
      nodes.push(text.slice(i));
      break;
    }
    if (match.start > i) nodes.push(text.slice(i, match.start));
    nodes.push(
      <GlossaryTerm
        key={`g-${key ?? ''}-${n++}`}
        entry={match.entry}
        display={text.slice(match.start, match.end)}
      />,
    );
    seen.add(match.entry.id);
    i = match.end;
  }

  return nodes;
}

function findNextMatch(
  text: string,
  from: number,
  seen: Set<string>,
): { start: number; end: number; entry: GlossaryEntry } | null {
  let best: { start: number; end: number; entry: GlossaryEntry } | null = null;

  for (const needle of GLOSSARY_MATCH_STRINGS) {
    const entry = findGlossaryEntry(needle);
    if (!entry || seen.has(entry.id)) continue;

    const idx = indexOfWord(text, needle, from);
    if (idx === -1) continue;

    if (!best || idx < best.start || (idx === best.start && needle.length > best.end - best.start)) {
      best = { start: idx, end: idx + needle.length, entry };
    }
  }
  return best;
}

// Case-insensitive whole-word match. "JSON" matches "JSON" but not "Jason".
// "API" matches "API" and "APIs" (handled via aliases), but not "naive" inside "naïve".
function indexOfWord(haystack: string, needle: string, from: number): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let i = from;
  while (i <= h.length - n.length) {
    const found = h.indexOf(n, i);
    if (found === -1) return -1;
    const before = found === 0 ? '' : haystack[found - 1];
    const after = found + n.length >= haystack.length ? '' : haystack[found + n.length];
    if (!isWordChar(before) && !isWordChar(after)) return found;
    i = found + 1;
  }
  return -1;
}

function isWordChar(c: string): boolean {
  if (!c) return false;
  return /[A-Za-z0-9_]/.test(c);
}
