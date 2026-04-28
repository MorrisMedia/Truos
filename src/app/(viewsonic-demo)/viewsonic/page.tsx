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

export default function ViewSonicEntry() {
  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <img src="/viewsonic/viewsonic-mark.svg" alt="ViewSonic" style={{ height: 48 }} />
        </div>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>DEMO ENVIRONMENT</div>
        <h1 style={{ fontSize: 40, letterSpacing: '-0.025em', marginBottom: 12, fontWeight: 500 }}>
          ViewSonic AI Academy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 40 }}>
          Pick a view to step into the experience. Real ViewSonic team — illustrative data.
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          {([
            { id: 'admin' as const,   name: 'View as Admin',   sub: 'Sarah Chen · CHRO' },
            { id: 'manager' as const, name: 'View as Manager', sub: 'Marcus Reyes · Sales Director, Americas' },
            { id: 'learner' as const, name: 'View as Learner', sub: 'Priya Patel · Marketing Specialist' },
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
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{p.sub}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
