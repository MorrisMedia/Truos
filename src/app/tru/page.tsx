'use client';

import { useEffect, useRef, useState } from 'react';

// Sidesteps Vercel's stale edge 404 cache for this path.

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETING: Msg = {
  role: 'assistant',
  content:
    "I'm TRU. I'll get you fluent enough with AI to use it confidently at work — about 30 to 45 minutes, all in this chat.\n\nBefore we start, three quick things:\n\n1. Your first name?\n2. Who sent you this link?\n3. What's your role / what do you do day-to-day?\n\nDrop all three and we'll go.",
};

export default function TruPage() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // On mount: if URL has ?s=<id>, load that session from server.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('s');
    if (!sid) {
      setLoadingSession(false);
      return;
    }
    setSessionId(sid);
    fetch(`/api/tru/session/${encodeURIComponent(sid)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages as Msg[]);
        }
      })
      .catch(() => {
        // ignore — fall back to greeting
      })
      .finally(() => setLoadingSession(false));
  }, []);

  // Sync URL with sessionId once we have one.
  useEffect(() => {
    if (!sessionId) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('s') === sessionId) return;
    params.set('s', sessionId);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [sessionId]);

  // Autoscroll: keep the latest turn visible. Stays out of the way if the
  // user has scrolled up to read earlier content.
  useEffect(() => {
    const scroller = scrollRef.current;
    const bottom = bottomRef.current;
    if (!scroller || !bottom) return;
    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (distanceFromBottom < 160) {
      bottom.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, streaming]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 220) + 'px';
  }, [input]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const next: Msg[] = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }];
    setMessages(next);
    setInput('');
    setStreaming(true);

    // Sniff intro answers from the FIRST user message and pass as meta for logging.
    let meta: { name?: string; sender?: string; role?: string } | undefined;
    if (messages.length === 1) {
      const lines = text.split(/\n|;|·|•/).map((l) => l.trim()).filter(Boolean);
      meta = {
        name: lines[0]?.slice(0, 80),
        sender: lines[1]?.slice(0, 80),
        role: lines[2]?.slice(0, 160),
      };
    }

    try {
      const res = await fetch('/api/tru/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(0, -1).map(({ role, content }) => ({ role, content })),
          meta,
          sessionId: sessionId ?? undefined,
        }),
      });

      const newSid = res.headers.get('X-Tru-Session-Id');
      if (newSid && newSid !== sessionId) setSessionId(newSid);

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => '');
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: `Couldn't reach TRU (${res.status}). ${err.slice(0, 200)}`,
          };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `Network hiccup: ${msg}. Send your message again.`,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  function reset() {
    if (!confirm('Start a fresh conversation? You\'ll get a new save link.')) return;
    setMessages([GREETING]);
    setSessionId(null);
    window.history.replaceState(null, '', window.location.pathname);
  }

  async function copyLink() {
    if (!sessionId) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <main
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--text)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'var(--bg-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 22,
              letterSpacing: '-0.02em',
            }}
          >
            TRU
          </span>
          <span
            className="eyebrow"
            style={{ color: 'var(--text-dim)' }}
          >
            TRUOS · RAPID AI ONBOARDING
          </span>
        </div>
        <button
          onClick={reset}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
          }}
        >
          Reset
        </button>
      </header>

      {sessionId && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 20px',
            background: 'rgba(212, 245, 71, 0.08)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                whiteSpace: 'nowrap',
                fontWeight: 600,
              }}
            >
              SAVE YOUR CHAT LINK
            </span>
            <span
              style={{
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              to continue where you left off
            </span>
          </div>
          <button
            onClick={copyLink}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: copied ? 'var(--accent-ink)' : 'var(--text)',
              background: copied ? 'var(--accent)' : 'transparent',
              padding: '6px 12px',
              border: '1px solid ' + (copied ? 'var(--accent)' : 'var(--border-strong)'),
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              flexShrink: 0,
              transition: 'all 120ms ease',
            }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '32px 20px 24px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {loadingSession ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 14, padding: '40px 0' }}>
              Loading your conversation…
            </div>
          ) : (
            messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                content={m.content}
                streaming={streaming && i === messages.length - 1}
              />
            ))
          )}
          <div ref={bottomRef} aria-hidden style={{ height: 1 }} />
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 20px 24px',
          background: 'var(--bg-elevated)',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder={streaming ? 'TRU is replying…' : 'Type a message — Enter to send, Shift+Enter for newline'}
            disabled={streaming}
            style={{
              flex: 1,
              resize: 'none',
              padding: '12px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-panel)',
              color: 'var(--text)',
              fontSize: 15,
              lineHeight: 1.45,
              outline: 'none',
              minHeight: 44,
              maxHeight: 220,
            }}
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            style={{
              height: 44,
              padding: '0 18px',
              borderRadius: 'var(--radius)',
              background: input.trim() && !streaming ? 'var(--accent)' : 'var(--bg-hover)',
              color: input.trim() && !streaming ? 'var(--accent-ink)' : 'var(--text-dim)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              cursor: input.trim() && !streaming ? 'pointer' : 'default',
              transition: 'background 120ms ease',
            }}
          >
            Send
          </button>
        </div>
        <div
          style={{
            maxWidth: 720,
            margin: '8px auto 0',
            fontSize: 11,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          Private link · not saved on Truos servers · don&apos;t paste confidential info
        </div>
      </div>
    </main>
  );
}

function Bubble({
  role,
  content,
  streaming,
}: {
  role: 'user' | 'assistant';
  content: string;
  streaming: boolean;
}) {
  const isTru = role === 'assistant';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        className="eyebrow"
        style={{
          color: isTru ? 'var(--accent)' : 'var(--text-dim)',
          fontSize: 10,
        }}
      >
        {isTru ? 'TRU' : 'YOU'}
      </div>
      <div
        style={{
          fontSize: 15.5,
          lineHeight: 1.55,
          color: isTru ? 'var(--text)' : 'var(--text)',
          opacity: !content && streaming ? 0.6 : 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content || (streaming ? 'thinking…' : '')}
        {streaming && content && <span style={{ opacity: 0.5 }}>▍</span>}
      </div>
    </div>
  );
}
