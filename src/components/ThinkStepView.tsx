import type { ThinkStep } from '@/content/types';

export function ThinkStepView({ step }: { step: ThinkStep }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>THINK</div>
      <h1 style={{ fontSize: 36, marginBottom: 24, letterSpacing: '-0.03em' }}>{step.title}</h1>
      <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 20 }}>{step.scenario}</p>
      <div style={{ padding: 24, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--text-muted)' }}>TAKE 5 SECONDS</div>
        <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.4 }}>{step.prompt}</div>
      </div>
    </div>
  );
}
