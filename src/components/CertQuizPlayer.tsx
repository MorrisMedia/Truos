'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Course } from '@/content/types';
import type { CertQuestion } from '@/lib/cert-quiz';
import { CERT_QUIZ_PASS_THRESHOLD } from '@/lib/cert-quiz';
import { Icons } from './icons';

interface Props {
  course: Course;
  questions: CertQuestion[];
}

type Phase = 'intro' | 'quiz' | 'results';

export function CertQuizPlayer({ course, questions }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(questions.length).fill(null));
  const [finalizing, setFinalizing] = useState(false);

  const q = questions[qIdx];
  const progress = ((qIdx + (submitted ? 1 : 0.3)) / questions.length) * 100;
  const correctCount = answers.reduce<number>((sum, a, i) => sum + (a != null && questions[i].options[a]?.correct ? 1 : 0), 0);
  const pct = Math.round((correctCount / questions.length) * 100);
  const passed = pct >= Math.round(CERT_QUIZ_PASS_THRESHOLD * 100);

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
    if (qIdx < questions.length - 1) setQIdx(qIdx + 1);
    else setPhase('results');
  };

  const finalize = async () => {
    if (!passed || finalizing) return;
    setFinalizing(true);
    try {
      const res = await fetch('/api/cert-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, score: pct }),
      });
      if (res.ok) {
        router.push(`/certificates/${course.id}`);
        return;
      }
    } catch {
      /* ignore */
    }
    setFinalizing(false);
  };

  const retry = () => {
    setPhase('intro');
    setQIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers(new Array(questions.length).fill(null));
  };

  if (phase === 'intro') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>
            {course.code} · CERTIFICATION QUIZ
          </div>
          <h1 style={{ fontSize: 40, letterSpacing: '-0.025em', marginBottom: 16 }}>
            One final check.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, lineHeight: 1.55, marginBottom: 32 }}>
            <strong>{questions.length} questions</strong> drawn from every module of {course.title}. Score
            <strong> {Math.round(CERT_QUIZ_PASS_THRESHOLD * 100)}% or better</strong> to earn your certificate. You can retake
            it as many times as you need — no penalty.
          </p>
          <div className="panel" style={{ padding: 20, textAlign: 'left', marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>HOW IT WORKS</div>
            <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 20 }}>
              <li>Each question has one correct answer.</li>
              <li>You&apos;ll see immediate feedback after each submit.</li>
              <li>At the end you&apos;ll get your score and, if you passed, your certificate.</li>
            </ul>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link className="btn btn-ghost" href={`/courses/${course.id}`}>Back to course</Link>
            <button className="btn btn-primary btn-lg" onClick={() => setPhase('quiz')}>
              Start the quiz {Icons.arrow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 640 }}>
          <div className="eyebrow" style={{ color: passed ? 'var(--accent)' : 'var(--warn)', marginBottom: 16 }}>
            CERTIFICATION QUIZ · {passed ? 'PASSED' : 'NOT YET'}
          </div>
          <h1 style={{ fontSize: 48, letterSpacing: '-0.03em', marginBottom: 12 }}>
            {correctCount} / {questions.length} correct · {pct}%
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 32, lineHeight: 1.55 }}>
            {passed
              ? `You've passed the ${course.code} certification. One more click to claim your certificate.`
              : `You need ${Math.round(CERT_QUIZ_PASS_THRESHOLD * 100)}% to pass. Review the questions below, then try again.`}
          </p>

          <div style={{ marginBottom: 32 }}>
            {questions.map((qq, i) => {
              const a = answers[i];
              const right = a != null && qq.options[a]?.correct;
              return (
                <details key={qq.id} style={{ padding: 16, borderTop: '1px solid var(--border)', fontSize: 14 }}>
                  <summary style={{ cursor: 'pointer', display: 'flex', gap: 10 }}>
                    <span style={{ color: right ? 'var(--accent)' : 'var(--warn)', width: 18 }}>{right ? '✓' : '✕'}</span>
                    <span style={{ flex: 1 }}>{qq.prompt}</span>
                  </summary>
                  <div style={{ padding: '10px 0 0 28px', color: 'var(--text-muted)' }}>
                    {qq.options.map((opt, j) => (
                      <div key={j} style={{
                        padding: 6,
                        color: opt.correct ? 'var(--accent)' : a === j ? 'var(--warn)' : 'inherit',
                      }}>
                        {opt.correct ? '✓ ' : a === j ? '✕ ' : '○ '}{opt.text}
                      </div>
                    ))}
                    {qq.explanation && (
                      <div style={{ marginTop: 8, padding: 10, borderLeft: '2px solid var(--accent)', fontStyle: 'italic' }}>
                        {qq.explanation}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link className="btn btn-ghost" href={`/courses/${course.id}`}>Back to course</Link>
            {passed ? (
              <button className="btn btn-primary btn-lg" onClick={finalize} disabled={finalizing}>
                {finalizing ? 'Issuing certificate…' : 'Claim my certificate'} {Icons.arrow}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={retry}>Retake the quiz {Icons.arrow}</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // phase === 'quiz'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
        <Link className="btn btn-ghost btn-sm" href={`/courses/${course.id}`} aria-label="Exit">{Icons.x}</Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <span style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {qIdx + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px 24px 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {course.code} &nbsp;/&nbsp; CERTIFICATION QUIZ
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 28, marginBottom: 28, letterSpacing: '-0.025em', lineHeight: 1.25 }}>{q.prompt}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && opt.correct;
            const showWrong = submitted && isSelected && !opt.correct;
            return (
              <button key={i} onClick={() => !submitted && setSelected(i)} style={{
                textAlign: 'left', padding: '16px 20px', borderRadius: 10, minHeight: 60,
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
                background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
                fontSize: 15, lineHeight: 1.5, transition: 'all 0.15s',
                cursor: submitted ? 'default' : 'pointer',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 18 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt.text}</span>
              </button>
            );
          })}
        </div>
        {submitted && selected != null && q.explanation && (
          <div style={{ marginTop: 24, padding: 18, borderRadius: 10, background: 'var(--bg-panel)', borderLeft: '2px solid ' + (q.options[selected].correct ? 'var(--accent)' : 'var(--warn)') }}>
            <div className="eyebrow" style={{ marginBottom: 6, color: q.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
              {q.options[selected].correct ? 'CORRECT' : 'LEARN'}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>{q.explanation}</div>
          </div>
        )}
      </div>

      <div style={{
        position: 'sticky', bottom: 0,
        borderTop: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--bg) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            FROM: {q.moduleName.toUpperCase()}
          </div>
          {!submitted ? (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={selected == null}
              style={{ opacity: selected == null ? 0.4 : 1, pointerEvents: selected == null ? 'none' : 'auto' }}>
              Check answer
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={advance}>
              {qIdx < questions.length - 1 ? 'Next question' : 'See results'} {Icons.arrow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
