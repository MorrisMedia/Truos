/* =============================================================
   LANDING PAGE — marketing, catalog, pricing
   ============================================================= */

function LandingNav({ onNav }) {
  return (
    <nav className="nav">
      <Logo />
      <div className="nav-links">
        <a className="nav-link" href="#courses">Courses</a>
        <a className="nav-link" href="#pricing">Pricing</a>
        <a className="nav-link" href="#teams">For teams</a>
        <a className="nav-link" onClick={() => onNav('admin')} style={{ cursor: 'pointer' }}>Sign in</a>
        <button className="btn btn-primary btn-sm" onClick={() => onNav('checkout')}>
          Start free {icons.arrow}
        </button>
      </div>
    </nav>
  );
}

function Hero({ onNav }) {
  return (
    <section style={{ padding: '96px 0 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        opacity: 0.6,
      }}/>
      <div className="container" style={{ position: 'relative' }}>
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          <span style={{ color: 'var(--accent)' }}>●</span>&nbsp;&nbsp;AI FLUENCY FOR COMMERCIAL TEAMS
        </div>
        <h1 style={{ maxWidth: 920, marginBottom: 28 }}>
          AI fluency your <span className="serif" style={{ fontStyle: 'italic' }}>whole team</span> can finish.
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text-muted)', maxWidth: 640, marginBottom: 40, lineHeight: 1.45 }}>
          Four courses, 116 lessons. Start from zero tech knowledge in 101. Finish with a shipped AI workflow in 104.
          Built for commercial teams — sales, marketing, CS, ops, finance.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 72 }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNav('lesson')}>
            Try a lesson {icons.arrow}
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNav('admin')}>
            Book a team demo
          </button>
        </div>

        <div className="eyebrow" style={{ marginBottom: 18 }}>TRUSTED BY COMMERCIAL TEAMS AT</div>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center', opacity: 0.55, flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.1em' }}>NORTHWIND</span>
          <span className="serif" style={{ fontSize: 22 }}>Meridian &amp; Co.</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>kepler/labs</span>
          <span style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Halcyon</span>
          <span style={{ fontStyle: 'italic', fontWeight: 500 }}>Wayfinder</span>
          <span style={{ fontWeight: 700, letterSpacing: '0.15em', fontSize: 14 }}>SIGNAL / OS</span>
        </div>
      </div>
    </section>
  );
}

function CourseCatalog({ onNav }) {
  return (
    <section id="courses" style={{ padding: '96px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>THE CURRICULUM</div>
            <h2 style={{ maxWidth: 640 }}>Four courses. Designed to be <span className="serif" style={{ fontStyle: 'italic' }}>finished</span>.</h2>
          </div>
          <div style={{ color: 'var(--text-muted)', maxWidth: 360, fontSize: 15 }}>
            Each course is a series of 5–10 minute lessons. Read, engage, quiz. Earn a certificate at the end.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {COURSES.map((c, i) => (
            <CourseCard key={c.id} course={c} onNav={onNav} featured={c.id === 104} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course, onNav, featured }) {
  const isPaid = course.tier === 'paid';
  return (
    <div
      onClick={() => onNav('course', { courseId: course.id })}
      className="panel"
      style={{
        padding: 32,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: featured ? 'linear-gradient(140deg, #16181C, #0f100f 60%, #1a1d14)' : 'var(--bg-panel)',
        borderColor: featured ? 'rgba(212,245,71,0.25)' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {featured && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle at top right, rgba(212,245,71,0.15), transparent 60%)', pointerEvents: 'none' }}/>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div className="code" style={{ fontSize: 13, color: featured ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {course.code}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {featured && <span className="badge accent">CAPSTONE</span>}
          {isPaid ? <span className="badge paid">${course.price}</span> : <span className="badge success">FREE</span>}
        </div>
      </div>

      <h3 style={{ fontSize: 32, marginBottom: 8, letterSpacing: '-0.025em' }}>{course.title}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 420, fontSize: 15 }}>{course.subtitle}</p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
        <span className="mono">{course.lessons} LESSONS</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }}/>
        <span className="mono">~{course.hours}H</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }}/>
        <span className="mono">{course.modules.length} MODULES</span>
        <span style={{ marginLeft: 'auto', color: featured ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          View {icons.arrow}
        </span>
      </div>
    </div>
  );
}

function Pillars() {
  const items = [
    { icon: icons.book, title: 'Read, engage, quiz', body: 'Every lesson is a short read, a hands-on moment, and a check. Finishable in a lunch break.' },
    { icon: icons.shield, title: 'Commercial-first examples', body: 'Not toy demos. Pipeline notes, QBR decks, campaign briefs — the work your team actually ships.' },
    { icon: icons.chart, title: 'Org-level visibility', body: 'Admins see who’s progressing, who’s stuck, and how fluency is compounding across the team.' },
    { icon: icons.sparkle, title: 'Ends in a capstone, not a quiz', body: 'AI·104 asks each learner to design and roll out a real AI workflow to their team. The Truos Capstone.' },
  ];
  return (
    <section style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 16 }}>WHY TRUOS</div>
        <h2 style={{ maxWidth: 720, marginBottom: 72 }}>
          Built for the <span className="serif" style={{ fontStyle: 'italic' }}>90% </span>
          of your org who aren't engineers.
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

function LessonPreview({ onNav }) {
  return (
    <section style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>HOW A LESSON FEELS</div>
          <h2 style={{ marginBottom: 24 }}>Read the idea. Try the idea. Prove you got it.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 32, lineHeight: 1.55 }}>
            Each lesson is three steps — a short piece of writing, a hands-on moment, and a quick check.
            No 45-minute videos. No empty mascots.
          </p>
          <button className="btn btn-primary" onClick={() => onNav('lesson')}>Try the first lesson {icons.arrow}</button>
        </div>
        <LessonPreviewCard />
      </div>
    </section>
  );
}

function LessonPreviewCard() {
  return (
    <div className="panel" style={{ padding: 28, boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AI·101 / WHAT IS AI, REALLY? / 01 OF 04</div>
        <div className="progress-bar" style={{ width: 80 }}><span style={{ width: '33%' }}/></div>
      </div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>READ</div>
      <h3 style={{ fontSize: 22, marginBottom: 14 }}>What is AI?</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
        AI is software that does things we used to need a human for. Writing a paragraph, summarizing a meeting, answering a question. It's a tool — not a person, not magic, and not hard to use.
      </p>
      <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-hover)', borderLeft: '2px solid var(--accent)', marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>MENTAL MODEL</div>
        <div style={{ fontSize: 14, fontStyle: 'italic' }} className="serif">
          An assistant that never takes a lunch break, has read almost everything, and will confidently try any task — sometimes well, sometimes badly.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>3 MIN READ</span>
        <span className="btn btn-primary btn-sm">Continue {icons.arrow}</span>
      </div>
    </div>
  );
}

function Pricing({ onNav }) {
  const tiers = [
    {
      name: 'Individual',
      price: '$29',
      unit: '/mo',
      body: 'For a single learner. Full access to 101–104. Certificates included.',
      features: ['All four courses', 'Certificates of completion', 'Personal progress tracking', 'Cancel anytime'],
      cta: 'Start 14-day trial',
      featured: false,
    },
    {
      name: 'Team',
      price: '$19',
      unit: '/seat/mo',
      body: 'For commercial teams of 5+. Admin dashboard, team leaderboards, dedicated CSM above 50 seats.',
      features: ['Everything in Individual', 'Org admin dashboard', 'Team progress & reporting', 'Custom case studies', 'SSO (Google / Microsoft)'],
      cta: 'Start team trial',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      unit: '',
      body: 'For orgs above 200 seats. SAML SSO, SCIM, custom tracks, co-branded certificates, data residency.',
      features: ['Everything in Team', 'SAML + SCIM', 'Co-branded certificates', 'Custom curriculum modules', 'Dedicated success engineer'],
      cta: 'Contact sales',
      featured: false,
    },
  ];
  return (
    <section id="pricing" style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ marginBottom: 56 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>PRICING</div>
          <h2 style={{ maxWidth: 720 }}>Simple. Per seat. <span className="serif" style={{ fontStyle: 'italic' }}>No surprises.</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {tiers.map((t, i) => (
            <div key={i} className="panel" style={{
              padding: 32,
              background: t.featured ? 'linear-gradient(160deg, #16181C, #1a1d14)' : 'var(--bg-panel)',
              borderColor: t.featured ? 'rgba(212,245,71,0.3)' : 'var(--border)',
              position: 'relative',
            }}>
              {t.featured && (
                <div style={{ position: 'absolute', top: -10, right: 24 }} className="badge accent">MOST POPULAR</div>
              )}
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}>{t.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.unit}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, marginBottom: 24, minHeight: 60 }}>{t.body}</p>
              <button className={`btn ${t.featured ? 'btn-primary' : 'btn-ghost'}`} style={{ width: '100%', marginBottom: 28 }} onClick={() => onNav('checkout', { plan: t.name })}>{t.cta}</button>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                {t.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--accent)', display: 'flex' }}>{icons.check}</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onNav }) {
  return (
    <section id="teams" style={{ padding: '120px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ maxWidth: 800, margin: '0 auto 24px', fontSize: 56, letterSpacing: '-0.03em' }}>
          Give your team a <span className="serif" style={{ fontStyle: 'italic' }}>shared baseline</span>.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 540, margin: '0 auto 40px' }}>
          Stop having the same "how should we be using AI?" conversation every Monday.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNav('checkout', { plan: 'Team' })}>Start team trial</button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNav('admin')}>See admin dashboard</button>
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
          <Logo />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>© 2026 TRUOS · truos.ai</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          <a className="nav-link">Security</a>
          <a className="nav-link">Privacy</a>
          <a className="nav-link">Terms</a>
          <a className="nav-link">Changelog</a>
        </div>
      </div>
    </footer>
  );
}

function Landing({ onNav }) {
  return (
    <div>
      <LandingNav onNav={onNav} />
      <Hero onNav={onNav} />
      <CourseCatalog onNav={onNav} />
      <Pillars />
      <LessonPreview onNav={onNav} />
      <Pricing onNav={onNav} />
      <CTA onNav={onNav} />
      <Footer />
    </div>
  );
}

Object.assign(window, { Landing });
