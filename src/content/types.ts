// Course + lesson types

export type CourseSuite = 'base' | 'plus';
export type CourseTier = 'free' | 'paid';

export interface CourseModule {
  name: string;
  lessons: string[]; // lesson titles
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

export interface ReadStep {
  type: 'read';
  title: string;
  body: string[];
  callout?: { label: string; text: string };
}

export interface EngageStep {
  type: 'engage';
  title: string;
  prompt: string;
  options: { text: string; correct: boolean; feedback?: string }[];
}

export interface QuizStep {
  type: 'quiz';
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export type LessonStep = ReadStep | EngageStep | QuizStep;

export interface Lesson {
  courseId: number;
  courseCode: string;
  suite: CourseSuite;
  moduleIdx: number;
  lessonIdx: number;
  moduleName: string;
  lessonIndex: number; // 1-based
  totalInModule: number;
  title: string;
  steps: LessonStep[];
}
