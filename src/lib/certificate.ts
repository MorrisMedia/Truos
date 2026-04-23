import crypto from 'crypto';
import { prisma } from './prisma';
import { CERT_HASH_SECRET } from './config';
import { findCourse } from '@/content/courses';
import { LESSONS } from '@/content/lessons';

function buildHash(userId: string, courseId: number, issuedAt: Date): string {
  const raw = `${userId}:${courseId}:${issuedAt.toISOString()}:${CERT_HASH_SECRET}`;
  const h = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
  // Format: 0xXXXX-XXXX
  return `0x${h.slice(0, 4)}-${h.slice(4, 8)}`;
}

/**
 * If user has completed every lesson of a course, ensure a Certificate exists and return it.
 * Call this at the end of the final lesson quiz.
 */
export async function maybeIssueCertificate(userId: string, courseId: number) {
  const course = findCourse(courseId);
  if (!course) return null;

  // Count total lessons + user's progress rows
  const totalLessons = Object.keys(LESSONS).filter(k => k.startsWith(`${courseId}-`)).length;
  const completed = await prisma.lessonProgress.count({ where: { userId, courseId } });
  if (completed < totalLessons) return null;

  const existing = await prisma.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return existing;

  const issuedAt = new Date();
  const verificationHash = buildHash(userId, courseId, issuedAt);

  return prisma.certificate.create({
    data: { userId, courseId, issuedAt, verificationHash },
  });
}
