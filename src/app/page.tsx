import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Icons } from '@/components/icons';
import { BASE_COURSES } from '@/content/courses';

export default function HomePage() {
  return (
    <>
      <Nav variant="home" />
      <Hero />
      <CourseCatalog />
      <Pillars />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section style={{ padding: '96px 0 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        opacity: 0.6,
      }} />
      <div className="container" style={{ position: 'relative' }}>
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          <span style={{ color: 'var(--accent)' }}>●</span>&nbsp;&nbsp;AI FLUENCY FOR COMMERCIAL TEAMS
        </div>
        <h1 style={{ maxWidth: 920, marginBottom: 28 }}>
          AI fluency your <span className="serif" style={{ fontStyle: 'italic' }}>whole team</span> can finish.
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text-muted)', maxWidth: 640, marginBottom: 40, lineHeight: 1.45 }}>
          Four core courses, 116 lessons. Start from zero tech knowledge in 101. Finish with a shipped AI workflow in 104.
          Plus the <Link href="/plus" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>Truos+ suite</Link> for tool-specific mastery (Copilot, coming: Gemini, ChatGPT, Notion).
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 72 }}>
          <Link className="btn btn-primary btn-lg" href="/courses/101/0/0">Try a lesson {Icons.arrow}</Link>
          <Link className="btn btn-ghost btn-lg" href="#pricing">See pricing</Link>
        </div>
        <div className="eyebrow" style={{ marginBottom: 18 }}>TRUSTED BY COMMERCIAL TEAMS AT</div>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center', opacity: 0.55, flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: 17, fontWeight: 500 }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.1em' }}>NORTHWIND</span>
          <span className="serif" style={{ fontSize: 22 }}>Meridian &amp; Co.</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>kepler/labs</span>
          <span style={{ fontWeight: 600 }}>Halcyon</span>
          <span style={{ fontStyle: 'italic' }}>Wayfinder</span>
          <span style={{ fontWeight: 700, letterSpacing: '0.15em', fontSize: 14 }}>SIGNAL / OS</span>
        </div>
      </div>
    </section>
  );
}

function CourseCatalog() {
  return (
    <section id="courses" style={{ padding: '96px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>THE CURRICULUM</div>
            <h2 style={{ maxWidth: 640 }}>Four courses. Designed to be <span className="serif" style={{ fontStyle: 'italic' }}>finished</span>.</h2>
          </div>
          <div style={{ color: 'var(--text-muted)', maxWidth: 360, fontSize: 15 }}>
            Each course is a series of 2–3 minute lessons. Read, engage, quiz. Earn a certificate at the end.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {BASE_COURSES.map((c) => (
            <Link key={c.id} href={`/courses/${c.id}`} className="panel" style={{
              padding: 32, textDecoration: 'none',
              background: c.capstone ? 'linear-gradient(140deg, #16181C, #0f100f 60%, #1a1d14)' : 'var(--bg-panel)',
              borderColor: c.capstone ? 'rgba(212,245,71,0.25)' : undefined,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div className="code" style={{ fontSize: 13, color: c.capstone ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.08em' }}>{c.code}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {c.capstone && <span className="badge accent">CAPSTONE</span>}
                  {c.tier === 'paid' ? <span className="badge paid">${c.price}</span> : <span className="badge success">FREE</span>}
                </div>
              </div>
              <h3 style={{ fontSize: 32, marginBottom: 8, letterSpacing: '-0.025em' }}>{c.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 420, fontSize: 15 }}>{c.subtitle}</p>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                <span className="mono">{c.lessons} LESSONS</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
                <span className="mono">~{c.hours}H</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
                <span className="mono">{c.modules.length} MODULES</span>
                <span style={{ marginLeft: 'auto', color: c.capstone ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  View {Icons.arrow}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    { icon: Icons.book,    title: 'Read, engage, quiz',          body: 'Every lesson is a short read, a hands-on moment, and a check. Finishable in a lunch break.' },
    { icon: Icons.shield,  title: 'Commercial-first examples',   body: 'Not toy demos. Pipeline notes, QBR decks, campaign briefs — the work your team actually ships.' },
    { icon: Icons.chart,   title: 'Org-level visibility',        body: "Admins see who's progressing, who's stuck, and how fluency is compounding across the team." },
    { icon: Icons.sparkle, title: 'Ends in a capstone',          body: 'AI·104 asks each learner to design and roll out a real AI workflow to their team. The Truos Capstone.' },
  ];
  return (
    <section style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 16 }}>WHY TRUOS</div>
        <h2 style={{ maxWidth: 720, marginBottom: 72 }}>
          Built for the <span className="serif" style={{ fontStyle: 'italic' }}>90% </span>
          of your org who aren&apos;t engineers.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {items.map((it, i) => (
            <div key={i} style={{ padding: 32, borderRight: i < 3 ? '1px solid var(--border)' : 'none', background: 'var(--bg-panel)' }}>
              <div style={{ color: 'var(--accent)', marginBottom: 24 }}>{it.icon}</div>
              <h3 style={{ fontSize: 17, marginBottom: 12, letterSpacing: '-0.015em' }}>{it.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55 }}>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const cards = [
    { id: 101, code: 'AI·101', name: 'Getting Started with AI',  price: 0,    priceLabel: 'Free',    cta: 'Start free',        lessons: 20, hours: 1,   href: '/courses/101/0/0' },
    { id: 102, code: 'AI·102', name: 'Practical Prompting',      price: 499,  priceLabel: '$499',    cta: 'Unlock for $499',   lessons: 24, hours: 1.5, href: '/checkout?plan=AI·102' },
    { id: 103, code: 'AI·103', name: 'AI at Work',               price: 999,  priceLabel: '$999',    cta: 'Unlock for $999',   lessons: 32, hours: 2,   href: '/checkout?plan=AI·103' },
    { id: 104, code: 'AI·104', name: 'The Truos Capstone',       price: 1499, priceLabel: '$1,499',  cta: 'Unlock for $1,499', lessons: 40, hours: 2.5, featured: true, href: '/checkout?plan=AI·104' },
  ];
  return (
    <section id="pricing" style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>PRICING</div>
          <h2 style={{ maxWidth: 720 }}>Pay once. <span className="serif" style={{ fontStyle: 'italic' }}>Keep it forever.</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 640, marginTop: 12, lineHeight: 1.5 }}>
            Individuals buy courses outright — lifetime access, no renewals. Teams get everything on a monthly per-seat subscription.
          </p>
        </div>

        <div className="eyebrow" style={{ marginBottom: 20 }}>FOR INDIVIDUALS · LIFETIME ACCESS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {cards.map((c) => (
            <div key={c.id} className="panel" style={{
              padding: 24,
              background: c.featured ? 'linear-gradient(160deg, #16181C, #1a1d14)' : 'var(--bg-panel)',
              borderColor: c.featured ? 'rgba(212,245,71,0.3)' : 'var(--border)',
              position: 'relative',
            }}>
              {c.featured && <div style={{ position: 'absolute', top: -10, right: 20 }} className="badge accent">CAPSTONE</div>}
              <div className="mono" style={{ fontSize: 11, color: c.featured ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>{c.code}</div>
              <div style={{ fontSize: 20, letterSpacing: '-0.015em', marginBottom: 8, minHeight: 48, lineHeight: 1.2 }}>{c.name}</div>
              <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 6 }}>{c.priceLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                {c.lessons} lessons · ~{c.hours}h · lifetime
              </div>
              <Link className={`btn ${c.price === 0 ? 'btn-primary' : 'btn-ghost'} btn-sm`} href={c.href} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                {c.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="panel" style={{
          padding: 24, marginBottom: 48,
          background: 'color-mix(in oklab, var(--accent) 6%, var(--bg-panel))',
          borderColor: 'rgba(212,245,71,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8 }}>SAVE $500 · FULL BUNDLE</div>
            <div style={{ fontSize: 22, letterSpacing: '-0.015em', marginBottom: 4 }}>AI·102 + AI·103 + AI·104</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>All three paid courses, lifetime. 96 lessons, ~20h total.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'line-through' }}>$2,997</div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em' }}>$2,497</div>
            </div>
            <Link className="btn btn-primary" href="/checkout?plan=Bundle">Get the bundle {Icons.arrow}</Link>
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 20 }}>FOR TEAMS · MONTHLY PER SEAT</div>
        <div className="panel" style={{
          padding: 32,
          background: 'linear-gradient(160deg, #16181C, #1a1d14)',
          borderColor: 'rgba(212,245,71,0.3)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>TEAM PLAN</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em' }}>$99</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>/ seat / month</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, marginBottom: 20 }}>
              Everything included. All four base courses (AI·101–104) and <strong style={{ color: 'var(--text)' }}>the full Truos+ suite</strong>.
              Org admin dashboard, team progress reporting, seat management.
            </p>
            <Link className="btn btn-primary" href="/checkout?plan=Team">Start team trial {Icons.arrow}</Link>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 12 }}>Minimum 5 seats. Enterprise (200+ seats, SSO, data residency): contact sales.</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>INCLUDED</div>
            {[
              'Base curriculum AI·101–104 (116 lessons)',
              'Full Truos+ suite (Copilot 101, Copilot + Excel, + future courses)',
              'Org admin dashboard & seat management',
              'Team progress & reporting',
              'Certificates of completion (verifiable)',
              'Single sign-on (Google / Microsoft)',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="teams" style={{ padding: '120px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ maxWidth: 800, margin: '0 auto 24px', fontSize: 56, letterSpacing: '-0.03em' }}>
          Give your team a <span className="serif" style={{ fontStyle: 'italic' }}>shared baseline</span>.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 540, margin: '0 auto 40px' }}>
          Stop having the same &quot;how should we be using AI?&quot; conversation every Monday.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link className="btn btn-primary btn-lg" href="/checkout?plan=Team">Start team trial</Link>
          <Link className="btn btn-ghost btn-lg" href="/sign-up">Create free account</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
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
          <Link className="nav-link" href="/glossary">Glossary</Link>
          <Link className="nav-link" href="/verify">Verify a cert</Link>
          <a className="nav-link" href="mailto:hello@truos.ai">Contact</a>
        </div>
      </div>
    </footer>
  );
}
