type Props = {
  label: string;
  value: string | number;
  delta?: { direction: 'up' | 'down'; magnitude: string; positive?: boolean };
  sublabel?: string;
};

export function MetricCard({ label, value, delta, sublabel }: Props) {
  const deltaColor =
    delta?.positive === false
      ? 'var(--danger)'
      : delta?.direction === 'up'
        ? 'var(--success)'
        : 'var(--warn)';

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: 124,
      }}
    >
      <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: '-0.025em',
          lineHeight: 1.05,
          marginTop: 6,
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          style={{
            fontSize: 12,
            color: deltaColor,
            fontFamily: 'var(--font-mono)',
            marginTop: 4,
          }}
        >
          {delta.direction === 'up' ? '↑' : '↓'} {delta.magnitude}
        </div>
      )}
      {sublabel && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 'auto' }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
