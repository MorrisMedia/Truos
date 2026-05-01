import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrgContext } from '@/lib/org';

export async function Footer() {
  const session = await auth();
  const ctx = session?.user?.id ? await getOrgContext(session.user.id) : null;
  const showLeague = ctx?.orgSlug === 'hlm';
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 0 32px', color: 'var(--text-muted)', fontSize: 13 }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="logo">
                <div className="logo-mark">T</div>
                <span>Truos</span>
              </div>
            </Link>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>© 2026 TRUOS · truos.ai</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <Link className="nav-link" href="/plus">Truos+</Link>
            <Link className="nav-link" href="/methodology">Methodology</Link>
            <Link className="nav-link" href="/glossary">Glossary</Link>
            <Link className="nav-link" href="/verify">Verify a cert</Link>
            {showLeague && <Link className="nav-link" href="/homelife">🏆 TRUOS LEAGUE</Link>}
            <a className="nav-link" href="mailto:hello@truos.ai">Contact</a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: 12, lineHeight: 1.6, color: 'var(--text-dim)', maxWidth: 780 }}>
          Built on <Link href="/methodology" style={{ color: 'var(--text-muted)', textDecoration: 'underline', textDecorationColor: 'var(--border-strong)', textUnderlineOffset: 3 }}>Merrill&rsquo;s First Principles of Instruction</Link>.
          Every Truos lesson uses the same 5-phase scaffold (think → understand → learn → apply → quiz) and spaced retrieval practice so what you learn actually sticks.
          {' '}<Link href="/methodology" style={{ color: 'var(--accent)' }}>Read how our courses are built →</Link>
        </div>
      </div>
    </footer>
  );
}
