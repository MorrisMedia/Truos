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
      <Testimonials />
      <Credibility />
      <FinalCTA />
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="home-hero" style={{ padding: '96px 0 64px', position: 'relative', overflow: 'hidden' }}>
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
          <span style={{ color: 'var(--accent)' }}>●</span>&nbsp;&nbsp;AI FLUENCY · BUILT FOR THE 90% WHO AREN&rsquo;T ENGINEERS
        </div>
        <h1 className="home-h1" style={{ maxWidth: 920, marginBottom: 28 }}>
          AI fluency you can <span className="serif" style={{ fontStyle: 'italic' }}>actually finish</span>.
        </h1>
        <p className="home-lead" style={{ fontSize: 20, color: 'var(--text-muted)', maxWidth: 640, marginBottom: 40, lineHeight: 1.45 }}>
          Four credentials. 116 lessons. Start from zero in AI·101 — finish with a shipped AI workflow you defended in AI·104.
          Plus the <Link href="/plus" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>Truos+ suite</Link> for tool-specific mastery (Copilot, coming: Gemini, ChatGPT, Notion).
        </p>
        <div className="home-hero-ctas" style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <Link className="btn btn-primary btn-lg" href="/checkout?plan=AI·101">Start AI·101 {Icons.arrow}</Link>
          <Link className="btn btn-ghost btn-lg" href="#pricing">See pricing</Link>
        </div>
        <div className="home-trust-row" style={{
          display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap',
          color: 'var(--text-muted)', fontSize: 13,
          paddingTop: 24, borderTop: '1px solid var(--border)', marginTop: 24,
        }}>
          <TrustStat label="CREDENTIALS" value="4" />
          <TrustStat label="LESSONS" value="116" />
          <TrustStat label="LIFETIME ACCESS" value="∞" />
          <TrustStat label="GUARANTEE" value="30-DAY" />
        </div>
      </div>
    </section>
  );
}

function TrustStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 24, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.025em', fontFamily: 'var(--font-mono)' }}>{value}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

function CourseCatalog() {
  return (
    <section id="courses" className="home-section" style={{ padding: '96px 0' }}>
      <div className="container">
        <div className="home-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>THE CURRICULUM</div>
            <h2 className="home-h2" style={{ maxWidth: 640 }}>Four courses. Designed to be <span className="serif" style={{ fontStyle: 'italic' }}>finished</span>.</h2>
          </div>
          <div style={{ color: 'var(--text-muted)', maxWidth: 360, fontSize: 15 }}>
            Each course is a series of 2–3 minute lessons. Read, engage, quiz. Earn a certificate at the end.
          </div>
        </div>
        <div className="home-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
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
                </div>
              </div>
              <h3 style={{ fontSize: 32, marginBottom: 8, letterSpacing: '-0.025em' }}>{c.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 420, fontSize: 15 }}>{c.subtitle}</p>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: 'var(--text-dim)', fontSize: 13, flexWrap: 'wrap' }}>
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

function Testimonials() {
  const items = [
    { img: '/start/sandra-k.jpg', name: 'Sandra K.',  role: 'RN · Houston, TX',           quote: 'Zero tech background. Now I’m the person my hospital calls about AI.' },
    { img: '/start/priya-m.jpg',  name: 'Priya M.',   role: 'Ops Manager · Chicago, IL',  quote: '$50k on an MBA taught me less than this did. Promoted in 60 days.' },
    { img: '/start/marcus-t.jpg', name: 'Marcus T.',  role: 'Consultant · Finance',       quote: 'Capstone alone opened 3 client conversations. ROI is genuinely insane.' },
  ];
  return (
    <section className="home-section" style={{ padding: '96px 0', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>OUTCOMES</div>
          <h2 className="home-h2" style={{ maxWidth: 720 }}>What changes when you actually <span className="serif" style={{ fontStyle: 'italic' }}>finish</span>.</h2>
        </div>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {items.map((t) => (
            <div key={t.name} className="panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--bg)' }}>
              <p style={{ fontSize: 17, lineHeight: 1.45, color: 'var(--text)' }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <img src={t.img} alt={t.name} width={44} height={44} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credibility() {
  const frameworks = [
    {
      num: 'FRAMEWORK 01',
      title: 'Merrill’s First Principles of Instruction',
      body: 'Every lesson follows a 5-phase scaffold: think → understand → learn → apply → quiz, organized around a real problem.',
      used: ['Harvard Business School', 'U.S. Military training', 'Wharton Exec Ed'],
      cite: 'Merrill, M. D. (2002). Educational Tech R&D, 50(3).',
    },
    {
      num: 'FRAMEWORK 02',
      title: 'Cognitive Load Theory',
      body: 'Working memory is finite. Lessons are deliberately short and chunked — no busy slides, no buried point. Every sentence earns its keep.',
      used: ['MITx · MIT OpenCourseWare', 'Stanford Online', 'Carnegie Mellon OLI'],
      cite: 'Sweller, J. (1988). Cognitive Science, 12(2).',
    },
    {
      num: 'FRAMEWORK 03',
      title: 'Retrieval Practice',
      body: 'Active recall beats re-reading by 40–60% in long-term retention. Every third lesson opens with a Quick Recall; modules end with interleaved review.',
      used: ['Yale Medical School', 'Khan Academy', 'Wash. U. (where the science was published)'],
      cite: 'Roediger & Karpicke (2006). Psychological Science, 17(3).',
    },
  ];
  return (
    <section className="home-section" style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>WHY IT WORKS</div>
          <h2 className="home-h2" style={{ maxWidth: 760, margin: '0 auto 14px' }}>
            The same learning science<br /><span className="serif" style={{ fontStyle: 'italic' }}>used at Harvard, MIT, and Yale.</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 640, margin: '0 auto', lineHeight: 1.55 }}>
            Every Truos lesson is built on three peer-reviewed frameworks from instructional design — not hunches, not engagement hacks. Citable, defensible, and the reason what you learn actually sticks.
          </p>
        </div>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {frameworks.map((f) => (
            <div key={f.num} className="panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg-panel)' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em' }}>{f.num}</div>
              <h3 style={{ fontSize: 19, letterSpacing: '-0.015em', lineHeight: 1.25 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55 }}>{f.body}</p>
              <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>SAME APPROACH USED AT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--text)' }}>
                  {f.used.map((u) => <span key={u}>{u}</span>)}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>{f.cite}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/methodology" style={{ color: 'var(--accent)', fontSize: 14, borderBottom: '1px solid currentColor', paddingBottom: 2 }}>
            Read the full methodology {Icons.arrow}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const cards = [
    { id: 101, code: 'AI·101', name: 'AI Foundations',           price: 199,  priceLabel: '$199',   cta: 'Unlock for $199',  lessons: 20, hours: 1,   href: '/checkout?plan=AI·101' },
    { id: 102, code: 'AI·102', name: 'AI Prompt Mastery',        price: 499,  priceLabel: '$499',    cta: 'Unlock for $499',   lessons: 24, hours: 1.5, href: '/checkout?plan=AI·102' },
    { id: 103, code: 'AI·103', name: 'Applied AI at Work',       price: 999,  priceLabel: '$999',    cta: 'Unlock for $999',   lessons: 32, hours: 2,   href: '/checkout?plan=AI·103' },
    { id: 104, code: 'AI·104', name: 'AI Workflow Mastery',      price: 1499, priceLabel: '$1,499',  cta: 'Unlock for $1,499', lessons: 40, hours: 2.5, featured: true, href: '/checkout?plan=AI·104' },
  ];
  return (
    <section id="pricing" className="home-section" style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>PRICING</div>
          <h2 className="home-h2" style={{ maxWidth: 720 }}>Pay once. <span className="serif" style={{ fontStyle: 'italic' }}>Keep it forever.</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 640, marginTop: 12, lineHeight: 1.5 }}>
            Lifetime access to every course you buy. No subscriptions, no renewals. 30-day money-back guarantee on every purchase.
          </p>
        </div>

        <div className="eyebrow" style={{ marginBottom: 20 }}>INDIVIDUAL CREDENTIALS</div>
        <div className="home-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
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

        <div className="home-bundle" style={{
          padding: 32,
          background: 'color-mix(in oklab, var(--accent) 6%, var(--bg-panel))',
          border: '1px solid rgba(212,245,71,0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, alignItems: 'center',
        }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 10 }}>SAVE $500 · BEST VALUE</div>
            <div style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.2 }}>Get all three paid credentials</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, marginBottom: 12 }}>
              AI·102 + AI·103 + AI·104. 96 lessons, ~6h total. Lifetime access. Includes the capstone project.
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span> 30-day money back</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span> Lifetime updates</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span> Verifiable certificates</span>
            </div>
          </div>
          <div className="home-bundle-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: 'var(--text-dim)', textDecoration: 'line-through' }}>$2,997</div>
              <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em' }}>$2,497</div>
            </div>
            <Link className="btn btn-primary btn-lg" href="/checkout?plan=Bundle" style={{ width: '100%', justifyContent: 'center' }}>
              Get the bundle {Icons.arrow}
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Need a team plan?{' '}
            <a href="mailto:hello@truos.ai?subject=Truos%20for%20Teams" style={{ color: 'var(--accent)' }}>Contact us {Icons.arrow}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="home-section" style={{ padding: '120px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="panel" style={{
          padding: 40,
          maxWidth: 720,
          margin: '0 auto 48px',
          background: 'var(--bg-panel)',
          textAlign: 'left',
          display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <img src="/start/sandra-k.jpg" alt="Sandra K." width={64} height={64} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
          <div style={{ flex: '1 1 280px' }}>
            <p style={{ fontSize: 17, lineHeight: 1.5, marginBottom: 8 }}>
              &ldquo;Zero tech background. Now I&rsquo;m the person my hospital calls about AI.&rdquo;
            </p>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sandra K. · RN · Houston, TX</div>
          </div>
        </div>
        <h2 className="home-h2" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
          Today, you can be one <span className="serif" style={{ fontStyle: 'italic' }}>of them.</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.5 }}>
          AI·101 takes about an hour.
        </p>
        <div className="home-final-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary btn-lg" href="/checkout?plan=AI·101">Start AI·101 {Icons.arrow}</Link>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-dim)' }}>30-day money-back guarantee · No coding required · Lifetime access</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 0 32px', color: 'var(--text-muted)', fontSize: 13 }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="home-footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="logo">
                <div className="logo-mark">T</div>
                <span>Truos</span>
              </div>
            </Link>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>© 2026 TRUOS · truos.ai</span>
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <Link className="nav-link" href="/plus">Truos+</Link>
            <Link className="nav-link" href="/methodology">Methodology</Link>
            <Link className="nav-link" href="/glossary">Glossary</Link>
            <Link className="nav-link" href="/verify">Verify a cert</Link>
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
