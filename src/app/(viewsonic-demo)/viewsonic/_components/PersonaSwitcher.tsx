'use client';

import Link from 'next/link';
import { useState } from 'react';

const PERSONAS = [
  { id: 'admin',   name: 'Sarah Chen',     role: 'CHRO',                          href: '/viewsonic/admin?persona=admin' },
  { id: 'manager', name: 'Marcus Reyes',   role: 'Sales Director, Americas',      href: '/viewsonic/manager?persona=manager' },
  { id: 'learner', name: 'Priya Patel',    role: 'Marketing Specialist',          href: '/viewsonic/learn?persona=learner' },
] as const;

export function PersonaSwitcher({ current }: { current: 'admin' | 'manager' | 'learner' }) {
  const [open, setOpen] = useState(false);
  const active = PERSONAS.find((p) => p.id === current) ?? PERSONAS[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          color: 'var(--text)',
        }}
      >
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-hover)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
        }}>
          {active.name.split(' ').map((s) => s[0]).join('')}
        </span>
        <span>{active.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          minWidth: 280,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: 8,
          zIndex: 50,
        }}>
          <div className="eyebrow" style={{ padding: '6px 10px', color: 'var(--text-dim)' }}>
            VIEW AS
          </div>
          {PERSONAS.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: p.id === current ? 'var(--bg-hover)' : 'transparent',
              }}
              onClick={() => setOpen(false)}
            >
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.role}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
