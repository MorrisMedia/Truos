// Course + lesson types

export type CourseSuite = 'base' | 'plus';
export type CourseTier = 'free' | 'paid';

export interface CourseModule {
  name: string;
  lessons: string[];
}

export interface Course {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  lessons: number;
  hours: number;
  tier: CourseTier;
  suite: CourseSuite;
  price: number;
  capstone?: boolean;
  modules: CourseModule[];
}

// -------- Lesson steps --------

// Canonical step types (Merrill's First Principles + Retrieval Practice).
export interface ThinkStep {
  type: 'think';
  title: string;
  scenario: string;
  prompt: string;
}

export interface UnderstandStep {
  type: 'understand';
  title: string;
  body: string[];
  analogy?: { label: string; text: string };
}

export interface LearnStep {
  type: 'learn';
  title: string;
  body: string[];
  watchFor: string;
}

export interface ApplyStep {
  type: 'apply';
  title: string;
  scenario: string;
  options: { text: string; correct: boolean; feedback?: string }[];
}

export interface QuizStep {
  type: 'quiz';
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export interface RecallStep {
  type: 'recall';
  title: string;
  recallingLessonKey: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export type LessonStep =
  | ThinkStep
  | UnderstandStep
  | LearnStep
  | ApplyStep
  | QuizStep
  | RecallStep;

export interface Lesson {
  courseId: number;
  courseCode: string;
  suite: CourseSuite;
  moduleIdx: number;
  lessonIdx: number;
  moduleName: string;
  lessonIndex: number;
  totalInModule: number;
  title: string;
  steps: LessonStep[];
  isModuleEnd?: boolean;
}
