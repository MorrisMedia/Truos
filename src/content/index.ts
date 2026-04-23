export * from './types';
export * from './courses';
export { LESSONS } from './lessons';
import { LESSONS } from './lessons';
import type { Lesson } from './types';

export function getLesson(courseId: number, moduleIdx: number, lessonIdx: number): Lesson | null {
  return LESSONS[`${courseId}-${moduleIdx}-${lessonIdx}`] || null;
}

export function totalLessonCount(): number {
  return Object.keys(LESSONS).length;
}
