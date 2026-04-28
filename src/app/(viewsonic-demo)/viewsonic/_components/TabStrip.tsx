'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type Tab = { label: string; href: string };

export function TabStrip({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      background: 'var(--bg)',
    }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href ||
          (tab.href !== tabs[0]?.href && pathname.startsWith(tab.href + '/'));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '14px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: active ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 120ms ease, border-color 120ms ease',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
