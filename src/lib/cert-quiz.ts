// Build a pool of multiple-choice questions from a course's lessons.
// Used by the dedicated cert-quiz feature to assemble a real final exam
// (10 questions pulled across the whole course), not just 1 quiz at the end.

import { LESSONS } from '@/content/lessons';
import type { EngageStep, QuizStep } from '@/content/types';

export interface CertQuestion {
  id: string;          // "courseId-moduleIdx-lessonIdx-step-<idx>"
  courseId: number;
  lessonTitle: string;
  moduleName: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
  explanation?: string;
  kind: 'engage' | 'quiz';
}

export function buildQuestionPool(courseId: number): CertQuestion[] {
  const pool: CertQuestion[] = [];
  const prefix = `${courseId}-`;

  for (const [key, lesson] of Object.entries(LESSONS)) {
    if (!key.startsWith(prefix)) continue;
    lesson.steps.forEach((step, stepIdx) => {
      if (step.type === 'engage') {
        const s = step as EngageStep;
        pool.push({
          id: `${key}-s${stepIdx}`,
          courseId,
          lessonTitle: lesson.title,
          moduleName: lesson.moduleName,
          prompt: s.prompt,
          options: s.options.map(o => ({ text: o.text, correct: o.correct })),
          explanation: s.options.find(o => o.correct)?.feedback,
          kind: 'engage',
        });
      } else if (step.type === 'quiz') {
        const s = step as QuizStep;
        pool.push({
          id: `${key}-s${stepIdx}`,
          courseId,
          lessonTitle: lesson.title,
          moduleName: lesson.moduleName,
          prompt: s.prompt,
          options: s.options.map(o => ({ text: o.text, correct: o.correct })),
          explanation: s.answerNote,
          kind: 'quiz',
        });
      }
    });
  }

  return pool;
}

// Deterministic-ish shuffle by seed (so a given user sees consistent random set per attempt)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let m = a.length;
  let s = seed;
  while (m > 0) {
    s = (s * 9301 + 49297) % 233280;
    const i = Math.floor((s / 233280) * m--);
    [a[m], a[i]] = [a[i], a[m]];
  }
  return a;
}

export function pickCertQuestions(courseId: number, seed: number, n = 10): CertQuestion[] {
  const pool = buildQuestionPool(courseId);
  const shuffled = seededShuffle(pool, seed);
  const picked = shuffled.slice(0, Math.min(n, shuffled.length));
  // Also shuffle each question's options so the correct answer isn't always in the same slot
  return picked.map((q, i) => ({
    ...q,
    options: seededShuffle(q.options, seed + i * 31),
  }));
}

export const CERT_QUIZ_QUESTION_COUNT = 10;
export const CERT_QUIZ_PASS_THRESHOLD = 0.7; // 70%
