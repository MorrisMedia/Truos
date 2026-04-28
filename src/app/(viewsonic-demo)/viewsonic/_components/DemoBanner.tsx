export function DemoBanner() {
  return (
    <div style={{
      background: 'var(--accent)',
      color: 'var(--accent-ink)',
      padding: '6px 24px',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      textAlign: 'center',
    }}>
      Demo environment · all data illustrative · no real emails sent
    </div>
  );
}
