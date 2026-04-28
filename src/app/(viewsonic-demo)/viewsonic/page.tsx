import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function pickPersona(persona: 'admin' | 'manager' | 'learner') {
  'use server';
  cookies().set('vs_demo_persona', persona, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
  const dest = persona === 'admin' ? '/viewsonic/admin'
    : persona === 'manager' ? '/viewsonic/manager'
    : '/viewsonic/learn';
  redirect(dest);
}

const METHODS = [
  {
    title: 'Bite-sized video',
    body: '5–10 minute lessons. Lunch-break friendly. No filler — every minute earns its keep.',
    stat: '126 lessons',
  },
  {
    title: 'Interactive prompt labs',
    body: 'Learners write real prompts inside the lesson, get instant AI feedback, iterate until it clicks.',
    stat: 'in-browser',
  },
  {
    title: 'Role-based playbooks',
    body: 'Sales, marketing, CS, ops, finance — built from real workflows your teams already run.',
    stat: '5 tracks',
  },
  {
    title: 'Verifiable certificates',
    body: 'Public, shareable proof of skill. LinkedIn-ready URL. Hiring managers can verify in one click.',
    stat: 'on LinkedIn',
  },
];

export default function ViewSonicEntry() {
  return (
    <div style={{ padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <img src="/viewsonic/viewsonic-mark.svg" alt="ViewSonic" style={{ height: 80, maxWidth: '90%' }} />
          </div>

          {/* 3-word pitch */}
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 18, fontSize: 13, letterSpacing: '0.32em' }}>
            LOGIN ·&nbsp;&nbsp;WATCH ·&nbsp;&nbsp;CERTIFY
          </div>

          <h1 style={{ fontSize: 52, letterSpacing: '-0.025em', marginBottom: 14, fontWeight: 500, lineHeight: 1.02 }}>
            AI Academy for<br/>your whole team.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, lineHeight: 1.55, marginBottom: 14, maxWidth: 520, margin: '0 auto 14px' }}>
            One sign-in. Five courses. Every lesson under 10 minutes.
            Most ViewSonic team members earn their first AI certification by lunch on day one.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            Powered by
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 8px', borderRadius: 4,
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                background: 'var(--accent)', color: 'var(--accent-ink)',
                display: 'inline-grid', placeItems: 'center',
                fontWeight: 700, fontSize: 8, letterSpacing: 0,
              }}>T</span>
              <span style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '-0.01em', textTransform: 'none' }}>Truos</span>
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 36 }}>
            11,400+ certified · 4.9★ average · 30-day refund
          </div>

          <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: 10 }}>
            STEP INTO THE EXPERIENCE
          </div>

          <div style={{ display: 'grid', gap: 12, maxWidth: 520, margin: '0 auto' }}>
            {([
              { id: 'admin' as const,   name: 'View as Admin',   sub: 'Sarah Chen · CHRO',                       hint: 'See your whole org at a glance' },
              { id: 'manager' as const, name: 'View as Manager', sub: 'Marcus Reyes · Sales Director, Americas', hint: 'Track and nudge your team' },
              { id: 'learner' as const, name: 'View as Learner', sub: 'Priya Patel · Marketing Specialist',      hint: 'What your team members actually see' },
            ]).map((p) => (
              <form key={p.id} action={pickPersona.bind(null, p.id)}>
                <button type="submit" style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{p.sub}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.hint}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Training methods */}
        <div style={{ marginTop: 96, maxWidth: 1040, margin: '96px auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>HOW WE TRAIN</div>
            <h2 style={{ fontSize: 32, letterSpacing: '-0.02em', fontWeight: 500, lineHeight: 1.1 }}>
              Built for people who&apos;ve never used AI<br />
              <span style={{ color: 'var(--text-muted)' }}>and people who use it every day.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {METHODS.map((m) => (
              <div key={m.title} style={{
                padding: '24px 22px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                display: 'flex', flexDirection: 'column', gap: 10,
                minHeight: 200,
              }}>
                <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  {m.stat}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginTop: 'auto' }}>
                  {m.body}
                </p>
              </div>
            ))}
          </div>

          {/* Course strip */}
          <div style={{ marginTop: 32, padding: '24px 28px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500 }}>The 5-course curriculum</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                ~9 hours total · self-paced
              </span>
            </div>
            <div style={{ display: 'grid', gap: 0 }}>
              {[
                { code: 'AI·101', title: 'AI Foundations',     sub: 'Zero to using AI for real work', hours: '1h',   tier: 'Standard' },
                { code: 'AI·102', title: 'AI Prompt Mastery',  sub: 'The frameworks pros use',         hours: '1.5h', tier: 'Standard' },
                { code: 'AI·103', title: 'Applied AI at Work', sub: 'Sales · Marketing · CS · Ops',    hours: '2h',   tier: 'Standard' },
                { code: 'AI·104', title: 'AI Workflow Mastery',sub: 'Design and ship a real workflow', hours: '2.5h', tier: 'Plus' },
                { code: 'AI·105', title: 'AI Mastery Capstone',sub: 'Portfolio-worthy real project',   hours: '5h',   tier: 'Plus' },
              ].map((c, i, arr) => (
                <div key={c.code} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr auto auto', gap: 16, alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{c.code}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.sub}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{c.hours}</span>
                  <span style={{
                    fontSize: 9, padding: '2px 8px', borderRadius: 999,
                    background: c.tier === 'Plus' ? 'var(--accent)' : 'var(--bg-hover)',
                    color: c.tier === 'Plus' ? 'var(--accent-ink)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>
                    {c.tier === 'Plus' ? '✦ PLUS' : 'STD'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini pitch */}
          <div style={{ marginTop: 40, textAlign: 'center', maxWidth: 640, margin: '40px auto 0' }}>
            <p className="serif" style={{ fontSize: 22, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text)' }}>
              &ldquo;The bar shouldn&apos;t be &lsquo;learn AI.&rsquo; The bar should be &lsquo;your whole team is fluent by Q3.&rsquo;
              That&apos;s what this is built for.&rdquo;
            </p>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Truos × ViewSonic — pilot proposal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
