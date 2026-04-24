import type { LearnStep } from '@/content/types';
import { renderWithGlossary } from './GlossaryTerm';

export function LearnStepView({ step }: { step: LearnStep }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>LEARN</div>
      <h1 style={{ fontSize: 36, marginBottom: 28, letterSpacing: '-0.03em' }}>{step.title}</h1>
      {step.body.map((p, i) => (
        <p key={i} style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 20 }}>
          {renderWithGlossary(p, `learn-${i}`)}
        </p>
      ))}
      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'color-mix(in oklab, var(--warn) 8%, var(--bg-panel))', borderLeft: '2px solid var(--warn)' }}>
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--warn)' }}>WATCH FOR THIS</div>
        <div style={{ fontSize: 15, lineHeight: 1.55 }}>{renderWithGlossary(step.watchFor, 'learn-watch')}</div>
      </div>
    </div>
  );
}
