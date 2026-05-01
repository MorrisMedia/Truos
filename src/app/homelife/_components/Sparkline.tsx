export function Sparkline({ data, color = '#c4f439', width = 96, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((v, i) => `${(i * stepX).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`).join(' ');
  const last = data[data.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      {last > 0 && (
        <circle cx={width} cy={height - (last / max) * height} r="2" fill={color} />
      )}
    </svg>
  );
}
