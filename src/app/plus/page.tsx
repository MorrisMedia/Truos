import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';
import { PLUS_COURSES } from '@/content/courses';

export default function TruosPlusPage() {
  return (
    <>
      <Nav variant="plus" />

      <section style={{ padding: '72px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 20 }}>
            TRUOS<span style={{ fontWeight: 700 }}>+</span> · TOOL-SPECIFIC MASTERY
          </div>
          <h1 style={{ maxWidth: 900, marginBottom: 20, fontSize: 56, letterSpacing: '-0.03em' }}>
            One tool. One workflow. <span className="serif" style={{ fontStyle: 'italic' }}>Real depth.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 640, lineHeight: 1.5 }}>
            Standalone courses that go deep on the specific AI tools your team actually uses. Approachable for anyone,
            regardless of base Truos experience. Lifetime access per course; team plans include everything.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 0 72px' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 20 }}>AVAILABLE NOW</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 48 }}>
            {PLUS_COURSES.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`} className="panel" style={{
                padding: 32, textDecoration: 'none',
                background: 'var(--bg-panel)', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                  <div className="code" style={{ fontSize: 13, color: 'var(--accent)', letterSpacing: '0.08em' }}>{c.code}</div>
                  <span className="badge paid">${c.price}</span>
                </div>
                <h3 style={{ fontSize: 30, marginBottom: 10, letterSpacing: '-0.025em' }}>{c.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>{c.subtitle}</p>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  <span className="mono">{c.lessons} LESSONS</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
                  <span className="mono">~{c.hours}H</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
                  <span className="mono">{c.modules.length} MODULES</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    View {Icons.arrow}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div className="panel" style={{ padding: 24, borderStyle: 'dashed' }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>COMING SOON</div>
              <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                ChatGPT Pro · Notion AI · Claude for Work · Gemini + Docs. Suggest the next one: <a href="mailto:hello@truos.ai" style={{ color: 'var(--accent)' }}>hello@truos.ai</a>.
              </div>
            </div>
            <div className="panel" style={{ padding: 24, background: 'color-mix(in oklab, var(--accent) 6%, var(--bg-panel))', borderColor: 'rgba(212,245,71,0.25)' }}>
              <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 10 }}>
                TEAMS GET EVERY TRUOS<span style={{ fontWeight: 700 }}>+</span> COURSE
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.55 }}>
                The team plan ($99/seat/mo) includes every Truos+ course — current and future — automatically.
              </div>
              <Link className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} href="/checkout?plan=Team">
                See team plan {Icons.arrow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
