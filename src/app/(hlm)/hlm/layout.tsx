import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HlmLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/sign-in?callbackUrl=/hlm');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      >
        <Link
          href="/hlm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
        >
          {/* HLM wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
              }}
            >
              HomeLife Media
            </span>
            <span
              style={{
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: 2,
              }}
            >
              Truos AI Training
            </span>
          </div>
          {/* Truos badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '3px 10px',
              borderRadius: 4,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 9,
              }}
            >
              T
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Truos
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>{session.user.email}</span>
          <Link href="/sign-out" style={{ color: 'var(--accent)', fontSize: 12 }}>
            Sign out
          </Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
