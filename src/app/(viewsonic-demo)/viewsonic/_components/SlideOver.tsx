'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
};

export function SlideOver({ open, onClose, title, children, width = 480 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,11,13,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 60,
        }}
      />
      <aside
        role="dialog"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width,
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          transform: `translateX(${open ? '0' : '100%'})`,
          transition: 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1)',
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {title && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
            <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
      </aside>
    </>
  );
}
