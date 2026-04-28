type Props = {
  courseCode: string;
  courseTitle: string;
  hash: string;
  issuedAt: string;
};

export function CertThumb({ courseCode, courseTitle, hash, issuedAt }: Props) {
  return (
    <div style={{
      background: 'var(--paper)',
      color: '#0A0B0D',
      borderRadius: 6,
      aspectRatio: '1.414 / 1',
      padding: 16,
      position: 'relative',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer',
    }}>
      <div aria-hidden style={{ position: 'absolute', inset: 6, border: '1px solid rgba(10,11,13,0.25)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: '#0A0B0D', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>T</div>
          <span style={{ fontSize: 9, fontWeight: 600 }}>Truos</span>
        </div>
        <div style={{ fontSize: 7, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#5B5F68' }}>{hash}</div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 7, color: '#5B5F68', letterSpacing: '0.18em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Certificate
        </div>
        <div className="serif" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, lineHeight: 1.15 }}>
          {courseTitle}
        </div>
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#5B5F68', marginTop: 6 }}>
          {courseCode}  ·  {issuedAt}
        </div>
      </div>
    </div>
  );
}
