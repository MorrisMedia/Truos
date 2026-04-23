'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Course, Lesson, EngageStep, QuizStep } from '@/content/types';
import { Icons } from './icons';
import { CopyPrompt, looksLikePrompt } from './CopyPrompt';
import { renderWithGlossary } from './GlossaryTerm';

// localStorage key for mid-lesson resume state
function stateKey(courseId: number, moduleIdx: number, lessonIdx: number, userId: string | null): string {
  return `truos:lesson:${userId ?? 'guest'}:${courseId}-${moduleIdx}-${lessonIdx}`;
}

export function LessonPlayer({ course, lesson, userId }: { course: Course; lesson: Lesson; userId: string | null }) {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);
  const [resumed, setResumed] = useState(false);

  // Restore mid-lesson state from localStorage (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = stateKey(course.id, lesson.moduleIdx, lesson.lessonIdx, userId);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        const si = Math.max(0, Math.min(lesson.steps.length - 1, Number(saved.stepIdx ?? 0)));
        if (si > 0) {
          setStepIdx(si);
          setCorrectCount(Number(saved.correctCount ?? 0));
          setHearts(Number(saved.hearts ?? 5));
          setResumed(true);
        }
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state on every step advance
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = stateKey(course.id, lesson.moduleIdx, lesson.lessonIdx, userId);
    try {
      if (stepIdx === 0 && correctCount === 0 && hearts === 5) return;
      localStorage.setItem(key, JSON.stringify({ stepIdx, correctCount, hearts, t: Date.now() }));
    } catch {
      // ignore
    }
  }, [stepIdx, correctCount, hearts, course.id, lesson.moduleIdx, lesson.lessonIdx, userId]);

  const step = lesson.steps[stepIdx];
  const progress = ((stepIdx + (submitted ? 1 : 0.3)) / lesson.steps.length) * 100;

  const submit = () => {
    if (selected == null) return;
    setSubmitted(true);
    const s = step as EngageStep | QuizStep;
    if ('options' in s && s.options[selected]) {
      if (s.options[selected].correct) setCorrectCount(c => c + 1);
      else setHearts(h => Math.max(0, h - 1));
    }
  };

  const advance = async () => {
    setSelected(null);
    setSubmitted(false);
    if (stepIdx < lesson.steps.length - 1) {
      setStepIdx(stepIdx + 1);
      return;
    }
    // Lesson complete — record progress if authed, then navigate
    const score = Math.round((correctCount / Math.max(1, lesson.steps.filter(s => s.type !== 'read').length)) * 100);
    if (userId) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: course.id,
            moduleIdx: lesson.moduleIdx,
            lessonIdx: lesson.lessonIdx,
            score,
          }),
        });
      } catch (e) {
        // best effort — still navigate
      }
    }
    // clear resume state — lesson is done, no need to restore
    try {
      localStorage.removeItem(stateKey(course.id, lesson.moduleIdx, lesson.lessonIdx, userId));
    } catch {
      // ignore
    }
    router.push(`/courses/${course.id}/complete?m=${lesson.moduleIdx}&l=${lesson.lessonIdx}&score=${score}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chrome */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
        <Link className="btn btn-ghost btn-sm" href={`/courses/${course.id}`} aria-label="Exit">{Icons.x}</Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <span style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {stepIdx + 1} / {lesson.steps.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--danger)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ opacity: i < hearts ? 1 : 0.2 }}>♥</span>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ padding: '24px 24px 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span>{lesson.courseCode} &nbsp;/&nbsp; {lesson.moduleName.toUpperCase()} &nbsp;/&nbsp; LESSON {String(lesson.lessonIndex).padStart(2, '0')}</span>
          {resumed && (
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  try { localStorage.removeItem(stateKey(course.id, lesson.moduleIdx, lesson.lessonIdx, userId)); } catch {}
                }
                setStepIdx(0); setCorrectCount(0); setHearts(5); setSelected(null); setSubmitted(false); setResumed(false);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.08em' }}
            >
              RESUMED · RESTART?
            </button>
          )}
        </div>
      </div>

      {/* Step */}
      <div style={{ flex: 1, padding: '40px 24px 120px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        {step.type === 'read' && <ReadStepView step={step} />}
        {step.type === 'engage' && <EngageStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
        {step.type === 'quiz' && <QuizStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
      </div>

      {/* Footer */}
      <div style={{
        position: 'sticky', bottom: 0,
        borderTop: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--bg) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {step.type === 'read' ? '1 MIN READ' : step.type === 'engage' ? 'INTERACTIVE' : 'QUICK CHECK'}
          </div>
          {step.type === 'read' ? (
            <button className="btn btn-primary btn-lg" onClick={advance}>Continue {Icons.arrow}</button>
          ) : !submitted ? (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={selected == null}
              style={{ opacity: selected == null ? 0.4 : 1, pointerEvents: selected == null ? 'none' : 'auto' }}>
              Check answer
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={advance}>
              {stepIdx < lesson.steps.length - 1 ? 'Next step' : 'Finish lesson'} {Icons.arrow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadStepView({ step }: { step: Extract<Lesson['steps'][number], { type: 'read' }> }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>READ</div>
      <h1 style={{ fontSize: 40, marginBottom: 32, letterSpacing: '-0.03em' }}>{step.title}</h1>
      {step.body.map((p, i) => {
        const prompts = extractPromptsFromParagraph(p);
        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', margin: 0 }}>
              {renderWithGlossary(p, `body-${i}`)}
            </p>
            {prompts.map((pr, j) => <CopyPrompt key={j} text={pr} />)}
          </div>
        );
      })}
      {step.callout && (
        <div style={{ marginTop: 32, padding: 24, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{step.callout.label}</div>
          <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.4 }}>
            {renderWithGlossary(step.callout.text, 'callout')}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Find quoted substrings in a paragraph that look like LLM prompts.
 * Handles straight quotes. Ignores very short quoted phrases.
 */
function extractPromptsFromParagraph(p: string): string[] {
  const matches: string[] = [];
  const re = /"([^"]{30,})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(p)) !== null) {
    matches.push(m[0]);
  }
  return matches;
}

function EngageStepView({ step, selected, setSelected, submitted }: { step: EngageStep; selected: number | null; setSelected: (n: number | null) => void; submitted: boolean }) {
  const correctIdx = step.options.findIndex(o => o.correct);
  const correctOpt = correctIdx >= 0 ? step.options[correctIdx] : null;
  const correctLooksLikePrompt = !!correctOpt && looksLikePrompt(correctOpt.text);

  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>ENGAGE</div>
      <h1 style={{ fontSize: 36, marginBottom: 16, letterSpacing: '-0.03em' }}>{step.title}</h1>
      <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.5 }}>{step.prompt}</p>
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
      {submitted && selected != null && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
            {step.options[selected].correct ? 'CORRECT' : 'NOT QUITE'}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>
            {renderWithGlossary(step.options[selected].feedback ?? '', `engage-fb-${selected}`)}
          </div>
        </div>
      )}
      {submitted && correctOpt && correctLooksLikePrompt && (
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--text-muted)' }}>TRY THE WINNING PROMPT</div>
          <CopyPrompt text={correctOpt.text} />
        </div>
      )}
    </div>
  );
}

function QuizStepView({ step, selected, setSelected, submitted }: { step: QuizStep; selected: number | null; setSelected: (n: number | null) => void; submitted: boolean }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>QUICK CHECK</div>
      <h1 style={{ fontSize: 32, marginBottom: 32, letterSpacing: '-0.025em', lineHeight: 1.2 }}>{step.prompt}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              textAlign: 'left', padding: 20, borderRadius: 12, minHeight: 100,
              border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
              background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
              fontSize: 15, lineHeight: 1.5, transition: 'all 0.15s',
              cursor: submitted ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && selected != null && (
        <>
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid ' + (step.options[selected].correct ? 'var(--accent)' : 'var(--warn)') }}>
            <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
              {step.options[selected].correct ? 'CORRECT' : 'LEARN'}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55 }}>
              {renderWithGlossary(step.answerNote, 'quiz-note')}
            </div>
          </div>
          {(() => {
            const winner = step.options.find(o => o.correct);
            return winner && looksLikePrompt(winner.text) ? (
              <div style={{ marginTop: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--text-muted)' }}>TRY THE WINNING PROMPT</div>
                <CopyPrompt text={winner.text} />
              </div>
            ) : null;
          })()}
        </>
      )}
    </div>
  );
}
