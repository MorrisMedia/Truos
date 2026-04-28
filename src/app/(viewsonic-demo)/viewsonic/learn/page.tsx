import { SEED } from '../_data/seed';
import { CertThumb } from '../_components/CertThumb';

export default function LearnerHome() {
  const me = SEED.people.find((p) => p.id === 'p_priya')!;
  const completed = [
    { courseId: 101, hash: '0x4F2A-1C9E', issuedAt: '2026·03·12' },
    { courseId: 102, hash: '0x8B14-3D77', issuedAt: '2026·04·02' },
    { courseId: 103, hash: '0x2E89-A411', issuedAt: '2026·04·19' },
  ];
  const inProgressCourse = SEED.courses.find((c) => c.id === 104)!;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <div className="serif" style={{ fontSize: 32, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
        ✦ Welcome back, {me.name?.split(' ')[0]}
      </div>

      <div style={{
        marginTop: 40,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        textAlign: 'left',
      }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Pick up where you left off</div>
        <div style={{ fontSize: 20, marginTop: 6, fontWeight: 500 }}>{inProgressCourse.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Lesson 12 of 24 — Frameworks for repeatable output</div>
        <div style={{ marginTop: 16, height: 6, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: '50%', height: '100%', background: 'var(--accent)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>50%</span>
          <button style={{
            padding: '8px 16px', background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Resume ➜</button>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>Your earned credentials</h2>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{completed.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {completed.map((c) => {
            const course = SEED.courses.find((cc) => cc.id === c.courseId)!;
            return <CertThumb key={c.courseId} courseCode={course.code} courseTitle={course.title} hash={c.hash} issuedAt={c.issuedAt} />;
          })}
        </div>
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <a href="#" style={{ fontSize: 13, color: 'var(--accent)' }}>Share to LinkedIn ↗</a>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'left' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 14 }}>Up next, recommended for Marketing</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {[104, 105].map((id) => {
            const c = SEED.courses.find((cc) => cc.id === id)!;
            return (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.title} {c.tier === 'plus' && <span style={{ marginLeft: 8, fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>✦ PLUS</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.lessons} lessons · {c.hours}h</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>▢</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 40, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Streak: 11 days  ·  Hours this month: 7.3
      </div>
    </div>
  );
}
