import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';
import { LESSONS } from '@/content/lessons';
import { canAccessCourse } from '@/lib/access';
import { pickCertQuestions, CERT_QUIZ_QUESTION_COUNT } from '@/lib/cert-quiz';
import { CertQuizPlayer } from '@/components/CertQuizPlayer';
import { Icons } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function CertQuizPage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const course = findCourse(courseId);
  if (!course) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect(`/sign-up?callbackUrl=${encodeURIComponent(`/courses/${courseId}/cert-quiz`)}`);

  // Must have access to the course
  const access = await canAccessCourse(session.user.id, session.user.email, courseId);
  if (!access.allowed) redirect(`/checkout?plan=${encodeURIComponent(course.code)}`);

  // Must have finished every lesson before attempting cert quiz
  const totalLessons = Object.keys(LESSONS).filter(k => k.startsWith(`${courseId}-`)).length;
  const done = await prisma.lessonProgress.count({ where: { userId: session.user.id, courseId } });
  if (done < totalLessons) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--warn)', marginBottom: 16 }}>NOT READY YET</div>
          <h1 style={{ fontSize: 32, marginBottom: 12, letterSpacing: '-0.025em' }}>Finish the lessons first.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 24 }}>
            You&apos;ve completed {done} of {totalLessons} lessons in {course.code}.
            The certification quiz unlocks once you&apos;ve finished every lesson.
          </p>
          <Link className="btn btn-primary" href={`/courses/${courseId}`}>
            Back to course {Icons.arrow}
          </Link>
        </div>
      </div>
    );
  }

  // Check if already certified
  const existingCert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existingCert) redirect(`/certificates/${courseId}`);

  // Seed from user+course so retries get the same 10 questions until passed
  // (use Date to force rotation if we want variety; for v1, keep deterministic per user+course)
  const seed = Math.abs(hash(session.user.id + ':' + courseId));
  const questions = pickCertQuestions(courseId, seed, CERT_QUIZ_QUESTION_COUNT);

  // Free-course cert gate preview: check up front if the user will be able to claim
  // the certificate at the end, so we can set expectations before they start.
  let hasPaidEntitlement = true;
  if (course.tier === 'free') {
    const now = new Date();
    const entCount = await prisma.courseEntitlement.count({
      where: {
        userId: session.user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
    hasPaidEntitlement = entCount > 0;
    if (!hasPaidEntitlement) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { orgId: true } });
      if (user?.orgId) {
        const sub = await prisma.subscription.count({
          where: {
            orgId: user.orgId,
            status: { in: ['active', 'trialing'] },
            currentPeriodEnd: { gt: now },
          },
        });
        hasPaidEntitlement = sub > 0;
      }
    }
  }

  return <CertQuizPlayer course={course} questions={questions} hasPaidEntitlement={hasPaidEntitlement} />;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
