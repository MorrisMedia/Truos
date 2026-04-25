import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 0 32px', color: 'var(--text-muted)', fontSize: 13 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
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
          <a className="nav-link" href="mailto:hello@truos.ai">Contact</a>
        </div>
      </div>
    </footer>
  );
}
