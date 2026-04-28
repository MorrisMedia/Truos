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
      <DemoBanner />
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <Link href="/viewsonic" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--text)', color: 'var(--accent)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13,
          }}>T</div>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>×</span>
          <img src="/viewsonic/viewsonic-mark.svg" alt="ViewSonic" style={{ height: 20 }} />
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            AI Academy
          </span>
        </Link>
        <PersonaSwitcher current={persona} />
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
