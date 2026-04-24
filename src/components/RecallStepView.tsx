import type { RecallStep } from '@/content/types';

export function RecallStepView({
  step, selected, setSelected, submitted,
}: {
  step: RecallStep;
  selected: number | null;
  setSelected: (n: number | null) => void;
  submitted: boolean;
}) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>QUICK RECALL</div>
      <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.025em' }}>{step.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
        Before we move on — one thing from earlier.
      </p>
      <p style={{ fontSize: 18, lineHeight: 1.5, marginBottom: 24 }}>{step.prompt}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              textAlign: 'left', padding: 18, borderRadius: 12, minHeight: 80,
              border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
              background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
              fontSize: 15, lineHeight: 1.5, cursor: submitted ? 'default' : 'pointer',
            }}>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'var(--bg-panel)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)' }}>
          {step.answerNote}
        </div>
      )}
    </div>
  );
}
