export function Logo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className="logo">
      <div className="logo-mark">T</div>
      <span>Truos</span>
      {size === 'lg' && (
        <span className="mono muted" style={{ fontSize: 11, marginLeft: 8, letterSpacing: '0.08em' }}>ACADEMY</span>
      )}
    </div>
  );
}
