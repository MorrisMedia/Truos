import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CERT_QUIZ_PASS_THRESHOLD } from '@/lib/cert-quiz';
import { CERT_HASH_SECRET } from '@/lib/config';
import { LESSONS } from '@/content/lessons';
import { findCourse } from '@/content/courses';
import { sendEmail } from '@/lib/email';
import { certEarnedEmail } from '@/lib/emails/templates';

const Body = z.object({
  courseId: z.number().int(),
  score: z.number().int().min(0).max(100),
});

function buildHash(userId: string, courseId: number, issuedAt: Date): string {
  const raw = `${userId}:${courseId}:${issuedAt.toISOString()}:${CERT_HASH_SECRET}`;
  const h = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
  return `0x${h.slice(0, 4)}-${h.slice(4, 8)}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { courseId, score } = parsed.data;

  const course = findCourse(courseId);
  if (!course) return NextResponse.json({ error: 'course_not_found' }, { status: 404 });

  // Pass gate
  if (score < Math.round(CERT_QUIZ_PASS_THRESHOLD * 100)) {
    return NextResponse.json({ error: 'did_not_pass', score }, { status: 400 });
  }

  // Must have completed every lesson in the course
  const totalLessons = Object.keys(LESSONS).filter(k => k.startsWith(`${courseId}-`)).length;
  const completed = await prisma.lessonProgress.count({ where: { userId: session.user.id, courseId } });
  if (completed < totalLessons) {
    return NextResponse.json({ error: 'lessons_incomplete', completed, totalLessons }, { status: 400 });
  }

  // Free-course cert gate: preserves the "AI Mastery" brand by requiring any paid entitlement.
  // Course content stays free; the credential is earned by buying in somewhere.
  if (course.tier === 'free') {
    const now = new Date();
    const paidEntitlement = await prisma.courseEntitlement.count({
      where: {
        userId: session.user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
    let hasPaid = paidEntitlement > 0;
    if (!hasPaid) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { orgId: true } });
      if (user?.orgId) {
        const sub = await prisma.subscription.count({
          where: {
            orgId: user.orgId,
            status: { in: ['active', 'trialing'] },
            currentPeriodEnd: { gt: now },
          },
        });
        hasPaid = sub > 0;
      }
    }
    if (!hasPaid) {
      return NextResponse.json(
        { error: 'cert_requires_upgrade', upgradeUrl: '/#pricing' },
        { status: 402 },
      );
    }
  }

  // Issue or fetch the cert
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, hash: existing.verificationHash, alreadyIssued: true });
  }

  const issuedAt = new Date();
  const cert = await prisma.certificate.create({
    data: {
      userId: session.user.id,
      courseId,
      issuedAt,
      verificationHash: buildHash(session.user.id, courseId, issuedAt),
    },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/dashboard');
  revalidatePath('/account');

  // Transactional email — fire-and-forget
  sendEmail({
    to: session.user.email,
    userId: session.user.id,
    kind: 'cert_earned',
    payload: certEarnedEmail({
      name: session.user.name ?? null,
      userId: session.user.id,
      courseId,
      verificationHash: cert.verificationHash,
    }),
  }).catch(err => console.error('[email] cert_earned failed', err));

  return NextResponse.json({ ok: true, hash: cert.verificationHash });
}
