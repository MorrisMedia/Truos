'use client';

import { useState } from 'react';
import { SEED } from '../_data/seed';

const TEMPLATES = [
  { id: 'friendly', label: 'Friendly reminder',     body: 'Hey {{first}} — saw you haven\'t started AI Foundations yet. Just an hour. No coding. You\'ll thank yourself.' },
  { id: 'deadline', label: 'Deadline approaching',  body: 'Hi {{first}} — Q2 deadline for AI Foundations is 30 days out. Most reps finish in under 90 minutes.' },
  { id: 'manager',  label: 'Manager check-in',      body: '{{first}}, this is {{me}}. AI Foundations is a 1-hour first step toward the team certification. Carving out time this week?' },
];

export function NudgeComposer() {
  const [template, setTemplate] = useState(TEMPLATES[1]);
  const [sent, setSent] = useState(false);

  const stragglers = SEED.people
    .filter((p) => p.departmentId === 'sales-amer')
    .filter((p) => !SEED.progress.some((pr) => pr.personId === p.id))
    .slice(0, 12);

  if (sent) {
    return (
      <div style={{ maxWidth: 600, margin: '64px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>✓</div>
        <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginTop: 12 }}>12 reminders queued.</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>
          Sending in the next 5 minutes. We&apos;ll notify you when 6+ open the email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Pick a template</h2>
        <div style={{ display: 'flex', gap: 8 }}>
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

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Preview</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {template.body.replace('{{first}}', 'Jordan').replace('{{me}}', 'Marcus')}
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Recipients</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stragglers.length} people</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {stragglers.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', fontSize: 12 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.initials}</span>
              {p.name ?? p.initials}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setSent(true)}
          style={{
            padding: '12px 24px',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Send 12 reminders →
        </button>
      </div>
    </div>
  );
}
