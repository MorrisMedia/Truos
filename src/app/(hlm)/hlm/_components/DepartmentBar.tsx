type Props = {
  name: string;
  pct: number;
  count: number;
  total: number;
  flag?: 'risk' | 'win';
};

export function DepartmentBar({ name, pct, count, total, flag }: Props) {
  const fillColor =
    flag === 'risk'
      ? 'var(--danger)'
      : flag === 'win'
        ? 'var(--success)'
        : 'var(--accent)';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr 100px',
        gap: 16,
        alignItems: 'center',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {flag === 'risk' && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--danger)',
              flexShrink: 0,
            }}
          />
        )}
        {flag === 'win' && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              flexShrink: 0,
            }}
          />
        )}
        {name}
      </div>
      <div
        style={{
          height: 8,
          background: 'var(--bg-hover)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, pct))}%`,
            height: '100%',
            background: fillColor,
            opacity: flag === 'risk' ? 0.85 : 1,
            transition: 'width 600ms ease',
          }}
        />
      </div>
      <div
        style={{
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textAlign: 'right',
        }}
      >
        {pct}%{' '}
        <span style={{ color: 'var(--text-dim)' }}>
          {count}/{total}
        </span>
      </div>
    </div>
  );
}
