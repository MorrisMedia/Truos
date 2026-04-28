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
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <Link href="/viewsonic" style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
          <img src="/viewsonic/viewsonic-mark.svg" alt="ViewSonic" style={{ height: 32 }} />
          <span style={{
            width: 1, height: 24, background: 'var(--border-strong)', display: 'inline-block',
          }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7,
              background: 'var(--text)', color: 'var(--accent)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16,
            }}>T</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>Truos</span>
              <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                AI Academy
              </span>
            </div>
          </div>
        </Link>
        <PersonaSwitcher current={persona} />
      </header>
      <DemoBanner />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
