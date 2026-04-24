import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { findCourse } from '@/content/courses';
import { LESSONS } from '@/content/lessons';
import { getRecap, buildRecapQuestions } from '@/content/recaps';
import { canAccessCourse } from '@/lib/access';
import { ModuleRecap } from '@/components/ModuleRecap';

export const dynamic = 'force-dynamic';

export default async function ModuleRecapPage({
  params,
}: {
  params: { id: string; moduleIdx: string };
}) {
  const courseId = Number(params.id);
  const moduleIdx = Number(params.moduleIdx);

  const course = findCourse(courseId);
  if (!course) notFound();

  const recap = getRecap(courseId, moduleIdx);
  if (!recap) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const access = await canAccessCourse(session.user.id, session.user.email, courseId);
  if (!access.allowed) redirect(`/checkout?plan=${encodeURIComponent(course.code)}`);

  const questions = buildRecapQuestions(recap);

  const nextModuleFirstKey = `${courseId}-${moduleIdx + 1}-0`;
  const nextModuleFirstLessonKey = LESSONS[nextModuleFirstKey] ? nextModuleFirstKey : null;

  const moduleName = course.modules[moduleIdx]?.name ?? `Module ${moduleIdx + 1}`;

  return (
    <ModuleRecap
      courseId={courseId}
      moduleIdx={moduleIdx}
      moduleName={moduleName}
      questions={questions}
      nextModuleFirstLessonKey={nextModuleFirstLessonKey}
    />
  );
}
