'use client';

import { useState } from 'react';

type Member = { id: string; name: string | null; email: string; userId: string | null };
type Props = { members: Member[]; managerName: string; orgName: string };

const TEMPLATES = [
  {
    id: 'friendly',
    label: 'Friendly reminder',
    body: "Hey {{first}} — saw you haven't started AI Foundations yet. Just an hour. No coding. You'll thank yourself.",
  },
  {
    id: 'deadline',
    label: 'Deadline approaching',
    body: 'Hi {{first}} — the team deadline for AI Foundations is coming up. Most people finish in under 90 minutes.',
  },
  {
    id: 'manager',
    label: 'Manager check-in',
    body: "{{first}}, this is {{me}}. AI Foundations is a 1-hour first step. Can you carve out time this week?",
  },
];

export function NudgeComposer({ members, managerName, orgName }: Props) {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [selected, setSelected] = useState<Set<string>>(new Set(members.map((m) => m.id)));
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0) return;
    setSending(true);
    try {
      await fetch('/api/hlm/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: [...selected],
          template: template.body,
          managerName,
          orgName,
        }),
      });
      setSent(true);
    } catch {
      alert('Error sending nudges. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 520, margin: '64px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>✓</div>
        <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginTop: 12 }}>
          {selected.size} reminder{selected.size !== 1 ? 's' : ''} sent.
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>
          Nudges are on their way. You&apos;ll see their progress update in the Team tab.
        </p>
        <button
          onClick={() => setSent(false)}
          style={{
            marginTop: 20,
            padding: '8px 16px',
            fontSize: 13,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--text)',
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  const previewFirst = members[0]?.name?.split(' ')[0] ?? 'Alex';

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Template picker */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}>Template</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                borderRadius: 999,
                border: '1px solid var(--border)',
                background: template.id === t.id ? 'var(--accent)' : 'var(--bg-panel)',
                color: template.id === t.id ? 'var(--accent-ink)' : 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginBottom: 10,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Preview
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {template.body
            .replace('{{first}}', previewFirst)
            .replace('{{me}}', managerName)}
        </div>
      </div>

      {/* Recipients */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}
        >
          <div style={{ fontSize: 13, fontWeight: 500 }}>Recipients</div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {selected.size} selected
          </div>
        </div>

        {members.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--success)' }}>
            All team members have started a course. 🎉
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 8,
            }}
          >
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: selected.has(m.id) ? 'var(--bg-hover)' : 'var(--bg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 12,
                  color: 'var(--text)',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: selected.has(m.id) ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: selected.has(m.id) ? 'var(--accent-ink)' : 'var(--text-muted)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 9,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {(m.name ?? m.email).slice(0, 2).toUpperCase()}
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.name ?? m.email}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Send button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSend}
          disabled={sending || selected.size === 0}
          style={{
            padding: '12px 24px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            cursor: sending || selected.size === 0 ? 'default' : 'pointer',
            opacity: sending || selected.size === 0 ? 0.6 : 1,
            border: 'none',
          }}
        >
          {sending
            ? 'Sending…'
            : `Send ${selected.size} nudge${selected.size !== 1 ? 's' : ''} →`}
        </button>
      </div>
    </div>
  );
}
