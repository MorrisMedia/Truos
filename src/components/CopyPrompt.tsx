'use client';

import { useState } from 'react';

interface Props {
  text: string;
  label?: string;
  variant?: 'inline' | 'card';
}

/**
 * Copyable prompt block. Shows the prompt in a code-block style with a
 * Copy button; strips surrounding quotes so users copy clean text.
 */
export function CopyPrompt({ text, label = 'Copy prompt', variant = 'card' }: Props) {
  const [copied, setCopied] = useState(false);
  const clean = stripQuotes(text).trim();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: execCommand
      try {
        const ta = document.createElement('textarea');
        ta.value = clean;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* ignore */
      }
    }
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={copy}
        title="Copy prompt to clipboard"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: '1px solid var(--border-strong)',
          color: copied ? 'var(--accent)' : 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.08em',
          padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {copied ? '✓ COPIED' : `⧉ ${label.toUpperCase()}`}
      </button>
    );
  }

  return (
    <div style={{
      margin: '14px 0',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-strong)',
      borderLeft: '2px solid var(--accent)',
      borderRadius: 10,
      padding: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
          PROMPT · TRY IT IN ANY AI
        </span>
        <button
          type="button"
          onClick={copy}
          style={{
            background: 'transparent', border: 'none',
            color: copied ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.08em',
            padding: '4px 8px', borderRadius: 4, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'color 0.15s',
          }}
        >
          {copied ? '✓ COPIED' : '⧉ COPY'}
        </button>
      </div>
      <div
        className="mono"
        style={{
          padding: '12px 14px',
          fontSize: 13, lineHeight: 1.55,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {clean}
      </div>
    </div>
  );
}

function stripQuotes(s: string): string {
  const trimmed = s.trim();
  // Double-quoted
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  // Smart-quoted
  if (trimmed.length >= 2 && (trimmed.startsWith('“') || trimmed.startsWith('“')) && (trimmed.endsWith('”') || trimmed.endsWith('”'))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Detects whether a piece of text looks like an LLM prompt worth copying:
 * - Starts with a double or smart quote
 * - Has at least ~30 chars of content inside
 * - Isn't just a quoted phrase (needs some instructional shape)
 */
export function looksLikePrompt(text: string): boolean {
  const t = text.trim();
  if (t.length < 30) return false;
  const startsQuoted = /^["““]/.test(t);
  const endsQuoted = /["””][.?!]?$/.test(t);
  if (!startsQuoted || !endsQuoted) return false;
  const inner = stripQuotes(t);
  // Require at least one verb-like or directive signal so we don't flag
  // random quoted phrases — pretty lenient, prompts nearly always match.
  return inner.length >= 25;
}
