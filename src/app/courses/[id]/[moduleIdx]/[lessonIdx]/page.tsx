import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { findCourse } from '@/content/courses';
import { getLesson } from '@/content';
import { canAccessCourse } from '@/lib/access';
import { LessonPlayer } from '@/components/LessonPlayer';

export default async function LessonPage({ params }: { params: { id: string; moduleIdx: string; lessonIdx: string } }) {
  const courseId = Number(params.id);
  const moduleIdx = Number(params.moduleIdx);
  const lessonIdx = Number(params.lessonIdx);

  const course = findCourse(courseId);
  const lesson = getLesson(courseId, moduleIdx, lessonIdx);
  if (!course || !lesson) notFound();

  const session = await auth();
  const access = await canAccessCourse(session?.user?.id ?? null, session?.user?.email ?? null, courseId);
  if (!access.allowed) redirect(`/checkout?plan=${encodeURIComponent(course.code)}`);

  return <LessonPlayer course={course} lesson={lesson} userId={session?.user?.id ?? null} />;
}
