import Link from 'next/link';
import { cookies } from 'next/headers';
import { DemoBanner } from './_components/DemoBanner';
import { PersonaSwitcher } from './_components/PersonaSwitcher';

export default function ViewSonicLayout({ children }: { children: React.ReactNode }) {
  const personaCookie = cookies().get('vs_demo_persona')?.value;
  const persona = (personaCookie === 'admin' || personaCookie === 'manager' || personaCookie === 'learner')
    ? personaCookie : 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <Link href="/viewsonic" style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <img src="/viewsonic/viewsonic-mark.svg" alt="ViewSonic" style={{ height: 26 }} />
          <span style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>×</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 5,
              background: 'var(--text)', color: 'var(--accent)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12,
            }}>T</div>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Truos</span>
          </div>
          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            AI Academy
          </span>
        </Link>
        <PersonaSwitcher current={persona} />
      </header>
      <DemoBanner />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
