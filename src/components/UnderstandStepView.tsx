import type { UnderstandStep } from '@/content/types';
import { renderWithGlossary } from './GlossaryTerm';
import { CopyPrompt } from './CopyPrompt';

function extractPromptsFromParagraph(p: string): string[] {
  const matches: string[] = [];
  const re = /"([^"]{30,})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(p)) !== null) matches.push(m[0]);
  return matches;
}

export function UnderstandStepView({ step }: { step: UnderstandStep }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>UNDERSTAND</div>
      <h1 style={{ fontSize: 40, marginBottom: 32, letterSpacing: '-0.03em' }}>{step.title}</h1>
      {step.body.map((p, i) => {
        const prompts = extractPromptsFromParagraph(p);
        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', margin: 0 }}>
              {renderWithGlossary(p, `understand-${i}`)}
            </p>
            {prompts.map((pr, j) => <CopyPrompt key={j} text={pr} />)}
          </div>
        );
      })}
      {step.analogy && (
        <div style={{ marginTop: 32, padding: 24, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{step.analogy.label}</div>
          <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.4 }}>
            {renderWithGlossary(step.analogy.text, 'understand-analogy')}
          </div>
        </div>
      )}
    </div>
  );
}
