import { SEED } from '../../_data/seed';
import { CertThumb } from '../../_components/CertThumb';

const PRIYA_CERTS = [
  { courseId: 101, hash: '0x4F2A-1C9E', issuedAt: '2026·03·12' },
  { courseId: 102, hash: '0x8B14-3D77', issuedAt: '2026·04·02' },
  { courseId: 103, hash: '0x2E89-A411', issuedAt: '2026·04·19' },
];

export default function LearnerCertificates() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Earned & verifiable</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 24 }}>Your certificates</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {PRIYA_CERTS.map((c) => {
          const course = SEED.courses.find((cc) => cc.id === c.courseId)!;
          return (
            <div key={c.courseId}>
              <CertThumb courseCode={course.code} courseTitle={course.title} hash={c.hash} issuedAt={c.issuedAt} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 12 }}>
                <a href="#" style={{ color: 'var(--text-muted)' }}>Download PDF</a>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <a href="#" style={{ color: 'var(--accent)' }}>Share to LinkedIn ↗</a>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <a href={`/verify/${c.hash}`} style={{ color: 'var(--text-muted)' }}>Verify</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
