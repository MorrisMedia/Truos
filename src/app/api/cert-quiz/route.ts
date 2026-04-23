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

  return NextResponse.json({ ok: true, hash: cert.verificationHash });
}
