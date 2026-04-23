import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { findCourse } from '@/content/courses';
import { getLesson } from '@/content';
import { prisma } from '@/lib/prisma';
import { LESSONS } from '@/content/lessons';
import { Icons } from '@/components/icons';

export default async function LessonCompletePage({ params, searchParams }: {
  params: { id: string };
  searchParams: { m?: string; l?: string; score?: string };
}) {
  const courseId = Number(params.id);
  const moduleIdx = Number(searchParams.m ?? '0');
  const lessonIdx = Number(searchParams.l ?? '0');
  const score = Number(searchParams.score ?? '100');

  const course = findCourse(courseId);
  const lesson = getLesson(courseId, moduleIdx, lessonIdx);
  if (!course || !lesson) notFound();

  const session = await auth();
  const userName = session?.user?.name ?? 'learner';

  const totalLessons = Object.keys(LESSONS).filter(k => k.startsWith(`${courseId}-`)).length;
  const done = session?.user?.id
    ? await prisma.lessonProgress.count({ where: { userId: session.user.id, courseId } })
    : 1;
  const courseComplete = done >= totalLessons;

  // next lesson in the course
  let nextHref = `/courses/${courseId}`;
  const curModule = course.modules[moduleIdx];
  if (curModule && lessonIdx + 1 < curModule.lessons.length) {
    nextHref = `/courses/${courseId}/${moduleIdx}/${lessonIdx + 1}`;
  } else if (moduleIdx + 1 < course.modules.length) {
    nextHref = `/courses/${courseId}/${moduleIdx + 1}/0`;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 24 }}>LESSON COMPLETE</div>
        <h1 style={{ fontSize: 48, marginBottom: 20 }}>
          Nicely done{userName !== 'learner' ? <>, <span className="serif" style={{ fontStyle: 'italic' }}>{userName}</span></> : null}.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 40, lineHeight: 1.5 }}>
          You finished &quot;{lesson.title}&quot;.
        </p>
        <div className="panel" style={{ padding: 24, marginBottom: 32, textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>COURSE PROGRESS</div>
            <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{done}/{totalLessons}</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>SCORE</div>
            <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{score}%</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>STATUS</div>
            <div style={{ fontSize: 22, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              {courseComplete ? '✨ Done' : 'Keep going'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link className="btn btn-ghost" href={`/courses/${courseId}`}>Back to course</Link>
          {courseComplete ? (
            <Link className="btn btn-primary" href={`/courses/${courseId}/cert-quiz`}>Take certification quiz {Icons.arrow}</Link>
          ) : (
            <Link className="btn btn-primary" href={nextHref}>Next lesson {Icons.arrow}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
