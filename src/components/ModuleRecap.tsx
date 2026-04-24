'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { RecapQuestion } from '@/content/recaps';
import { Icons } from './icons';

function interleave<T>(arr: T[]): T[] {
  if (arr.length <= 2) return arr.slice();
  const out: T[] = [];
  for (let offset = 0; offset < 2; offset++) {
    for (let i = offset; i < arr.length; i += 2) out.push(arr[i]);
  }
  return out;
}

export function ModuleRecap({
  courseId,
  moduleIdx,
  moduleName,
  questions,
  nextModuleFirstLessonKey,
}: {
  courseId: number;
  moduleIdx: number;
  moduleName: string;
  questions: RecapQuestion[];
  nextModuleFirstLessonKey: string | null;
}) {
  const router = useRouter();
  const [interleaved] = useState(() => interleave(questions));
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(interleaved.length).fill(null));

  const done = qIdx >= interleaved.length;
  const q = interleaved[qIdx];
  const correctCount = answers.reduce<number>((sum, a, i) => sum + (a != null && interleaved[i].options[a]?.correct ? 1 : 0), 0);
  const progress = ((qIdx + (submitted ? 1 : 0.3)) / interleaved.length) * 100;

  const submit = () => {
    if (selected == null) return;
    setSubmitted(true);
    setAnswers(a => {
      const next = [...a];
      next[qIdx] = selected;
      return next;
    });
  };
  const advance = () => {
    setSubmitted(false);
    setSelected(null);
    if (qIdx < interleaved.length - 1) setQIdx(qIdx + 1);
  };
  const continueCourse = () => {
    if (nextModuleFirstLessonKey) {
      const [, mi, li] = nextModuleFirstLessonKey.split('-');
      router.push(`/courses/${courseId}/${mi}/${li}`);
    } else {
      router.push(`/courses/${courseId}`);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>MODULE {moduleIdx + 1} RECAP · COMPLETE</div>
          <h1 style={{ fontSize: 42, letterSpacing: '-0.03em', marginBottom: 12 }}>
            {correctCount} / {interleaved.length}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 32 }}>
            You just practiced retrieving what you learned in {moduleName}. Active recall at spaced intervals is the single most evidence-backed way to make learning stick.
          </p>
          <button className="btn btn-primary btn-lg" onClick={continueCourse}>
            {nextModuleFirstLessonKey ? 'Continue to next module' : 'Back to course'} {Icons.arrow}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
        <Link className="btn btn-ghost btn-sm" href={`/courses/${courseId}`}>{Icons.x}</Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <span style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {qIdx + 1} / {interleaved.length}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px 24px 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          MODULE {moduleIdx + 1} RECAP · {moduleName.toUpperCase()}
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 24px 120px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>RECALL</div>
        <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.025em' }}>{q.prompt}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 28 }}>From: {q.sourceLessonTitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && opt.correct;
            const showWrong = submitted && isSelected && !opt.correct;
            return (
              <button key={i} onClick={() => !submitted && setSelected(i)} style={{
                textAlign: 'left', padding: 20, borderRadius: 12, minHeight: 100,
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
                background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
                fontSize: 15, lineHeight: 1.5, cursor: submitted ? 'default' : 'pointer',
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
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid ' + (q.options[selected].correct ? 'var(--accent)' : 'var(--warn)') }}>
            <div className="eyebrow" style={{ marginBottom: 8, color: q.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
              {q.options[selected].correct ? 'CORRECT' : 'LEARN'}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55 }}>{q.answerNote}</div>
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', bottom: 0, borderTop: '1px solid var(--border)', background: 'color-mix(in oklab, var(--bg) 85%, transparent)', backdropFilter: 'blur(12px)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          {!submitted ? (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={selected == null}
              style={{ opacity: selected == null ? 0.4 : 1, pointerEvents: selected == null ? 'none' : 'auto' }}>
              Check answer
            </button>
          ) : qIdx < interleaved.length - 1 ? (
            <button className="btn btn-primary btn-lg" onClick={advance}>Next {Icons.arrow}</button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => setQIdx(qIdx + 1)}>See results {Icons.arrow}</button>
          )}
        </div>
      </div>
    </div>
  );
}
