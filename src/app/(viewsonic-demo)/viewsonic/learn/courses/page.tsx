import { SEED } from '../../_data/seed';

export default function LearnerCourses() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Available to you</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 24 }}>Courses</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {SEED.courses.map((c) => (
          <div key={c.id} style={{
            padding: 24,
            background: 'var(--bg-panel)',
            border: c.tier === 'plus' ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{c.code}</span>
                {c.tier === 'plus' && <span style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>✦ PLUS</span>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{c.subtitle}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                {c.lessons} lessons  ·  {c.hours}h
              </div>
            </div>
            <button style={{
              padding: '8px 16px',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
              marginLeft: 24, cursor: 'pointer',
            }}>Start ➜</button>
          </div>
        ))}
      </div>
    </div>
  );
}
