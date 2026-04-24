import type { ApplyStep } from '@/content/types';
import { CopyPrompt, looksLikePrompt } from './CopyPrompt';
import { renderWithGlossary } from './GlossaryTerm';

export function ApplyStepView({
  step, selected, setSelected, submitted,
}: {
  step: ApplyStep;
  selected: number | null;
  setSelected: (n: number | null) => void;
  submitted: boolean;
}) {
  const correctIdx = step.options.findIndex(o => o.correct);
  const correctOpt = correctIdx >= 0 ? step.options[correctIdx] : null;

  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>APPLY</div>
      <h1 style={{ fontSize: 36, marginBottom: 16, letterSpacing: '-0.03em' }}>{step.title}</h1>
      <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.5 }}>{step.scenario}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              textAlign: 'left', padding: 20, borderRadius: 12,
              border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
              background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'transparent',
              fontSize: 15, lineHeight: 1.5, transition: 'all 0.15s',
              cursor: submitted ? 'default' : 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border-strong)'),
                background: showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'transparent',
                display: 'grid', placeItems: 'center', fontSize: 12, color: 'var(--accent-ink)', flexShrink: 0, marginTop: 1,
              }}>
                {showCorrect ? '✓' : showWrong ? '✕' : isSelected ? '●' : ''}
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && selected != null && step.options[selected].feedback && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
            {step.options[selected].correct ? 'CORRECT' : 'NOT QUITE'}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>
            {renderWithGlossary(step.options[selected].feedback ?? '', `apply-fb-${selected}`)}
          </div>
        </div>
      )}
      {submitted && correctOpt && looksLikePrompt(correctOpt.text) && (
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--text-muted)' }}>TRY THE WINNING PROMPT</div>
          <CopyPrompt text={correctOpt.text} />
        </div>
      )}
    </div>
  );
}
