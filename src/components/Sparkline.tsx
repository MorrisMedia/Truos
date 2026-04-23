// Lightweight SVG sparkline — no deps. Server-renderable.
interface Props {
  data: { day: string; count: number }[];
  height?: number;
  color?: string;
}

export function Sparkline({ data, height = 56, color = 'var(--accent)' }: Props) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map(d => d.count));
  const w = 100;
  const h = 100;
  const stepX = w / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = h - (d.count / max) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const fillPath = `${linePath} L ${((data.length - 1) * stepX).toFixed(2)},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <path d={fillPath} fill={color} fillOpacity="0.12" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
