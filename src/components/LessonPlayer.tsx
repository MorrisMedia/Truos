'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Course, Lesson, ApplyStep, QuizStep, RecallStep } from '@/content/types';
import { Icons } from './icons';
import { ThinkStepView } from './ThinkStepView';
import { UnderstandStepView } from './UnderstandStepView';
import { LearnStepView } from './LearnStepView';
import { ApplyStepView } from './ApplyStepView';
import { RecallStepView } from './RecallStepView';
import { renderWithGlossary } from './GlossaryTerm';

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
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = stateKey(course.id, lesson.moduleIdx, lesson.lessonIdx, userId);
    try {
      if (stepIdx === 0 && correctCount === 0 && hearts === 5) return;
      localStorage.setItem(key, JSON.stringify({ stepIdx, correctCount, hearts, t: Date.now() }));
    } catch {}
  }, [stepIdx, correctCount, hearts, course.id, lesson.moduleIdx, lesson.lessonIdx, userId]);

  const step = lesson.steps[stepIdx];
  const progress = ((stepIdx + (submitted ? 1 : 0.3)) / lesson.steps.length) * 100;

  // Steps that require user interaction before advancing
  const isInteractive = step.type === 'apply' || step.type === 'quiz' || step.type === 'recall';
  const needsSubmit = isInteractive;

  const submit = () => {
    if (selected == null) return;
    setSubmitted(true);
    if ((step.type === 'apply' || step.type === 'quiz' || step.type === 'recall') && 'options' in step && step.options[selected]) {
      if (step.options[selected].correct) setCorrectCount(c => c + 1);
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
    const interactiveSteps = lesson.steps.filter(s => s.type === 'apply' || s.type === 'quiz' || s.type === 'recall').length;
    const score = Math.round((correctCount / Math.max(1, interactiveSteps)) * 100);
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
      } catch {}
    }
    try {
      localStorage.removeItem(stateKey(course.id, lesson.moduleIdx, lesson.lessonIdx, userId));
    } catch {}
    if (lesson.isModuleEnd) {
      router.push(`/courses/${course.id}/module-recap/${lesson.moduleIdx}`);
    } else {
      router.push(`/courses/${course.id}/complete?m=${lesson.moduleIdx}&l=${lesson.lessonIdx}&score=${score}`);
    }
  };

  const stepLabel =
    step.type === 'think' ? 'ACTIVATE' :
    step.type === 'understand' || step.type === 'learn' ? '1 MIN READ' :
    step.type === 'recall' ? 'QUICK RECALL' :
    step.type === 'apply' ? 'INTERACTIVE' :
    'QUICK CHECK';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      <div style={{ flex: 1, padding: '40px 24px 120px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        {step.type === 'think' && <ThinkStepView step={step} />}
        {step.type === 'understand' && <UnderstandStepView step={step} />}
        {step.type === 'learn' && <LearnStepView step={step} />}
        {step.type === 'apply' && <ApplyStepView step={step as ApplyStep} selected={selected} setSelected={setSelected} submitted={submitted} />}
        {step.type === 'recall' && <RecallStepView step={step as RecallStep} selected={selected} setSelected={setSelected} submitted={submitted} />}
        {step.type === 'quiz' && <QuizStepView step={step as QuizStep} selected={selected} setSelected={setSelected} submitted={submitted} />}
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
            {stepLabel}
          </div>
          {!needsSubmit ? (
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
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid ' + (step.options[selected].correct ? 'var(--accent)' : 'var(--warn)') }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
            {step.options[selected].correct ? 'CORRECT' : 'LEARN'}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>
            {renderWithGlossary(step.answerNote, 'quiz-note')}
          </div>
        </div>
      )}
    </div>
  );
}
