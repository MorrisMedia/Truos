// Module recap configuration, derived from the LESSONS map.
// One recap per (courseId, moduleIdx). Each recap pulls the `quiz` step
// from every lesson in the module; questions are interleaved at render time.

import { LESSONS } from './lessons';
import type { QuizStep, Lesson } from './types';

export interface RecapConfig {
  courseId: number;
  moduleIdx: number;
  lessonKeys: string[]; // in teaching order
}

let _cache: Record<string, RecapConfig> | null = null;

function buildAll(): Record<string, RecapConfig> {
  const groups: Record<string, string[]> = {};
  for (const key of Object.keys(LESSONS)) {
    const [cid, mi] = key.split('-');
    const mk = `${cid}-${mi}`;
    (groups[mk] = groups[mk] ?? []).push(key);
  }
  const out: Record<string, RecapConfig> = {};
  for (const mk of Object.keys(groups)) {
    const [cid, mi] = mk.split('-');
    out[mk] = {
      courseId: Number(cid),
      moduleIdx: Number(mi),
      lessonKeys: groups[mk].sort((a, b) => {
        const ai = Number(a.split('-')[2]);
        const bi = Number(b.split('-')[2]);
        return ai - bi;
      }),
    };
  }
  return out;
}

export function allRecaps(): Record<string, RecapConfig> {
  if (!_cache) _cache = buildAll();
  return _cache;
}

export function getRecap(courseId: number, moduleIdx: number): RecapConfig | null {
  return allRecaps()[`${courseId}-${moduleIdx}`] ?? null;
}

export interface RecapQuestion {
  sourceLessonKey: string;
  sourceLessonTitle: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export function buildRecapQuestions(config: RecapConfig): RecapQuestion[] {
  return config.lessonKeys.map(key => {
    const lesson: Lesson | undefined = LESSONS[key];
    if (!lesson) throw new Error(`Recap refers to missing lesson: ${key}`);
    const quiz = lesson.steps.find((s): s is QuizStep => s.type === 'quiz');
    if (!quiz) throw new Error(`Lesson ${key} has no quiz step`);
    return {
      sourceLessonKey: key,
      sourceLessonTitle: lesson.title,
      prompt: quiz.prompt,
      options: quiz.options,
      answerNote: quiz.answerNote,
    };
  });
}
