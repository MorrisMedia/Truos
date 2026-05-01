// Server-side course access check — single source of truth for paid gating
import { prisma } from './prisma';
import { isPaidCourse } from '@/content/courses';
import { isStaffEmail } from './config';

export interface AccessResult {
  allowed: boolean;
  reason: 'free' | 'staff' | 'entitlement' | 'subscription' | 'org_grant' | 'paywall' | 'needs_auth' | 'not_found';
}

export async function canAccessCourse(userId: string | null, email: string | null, courseId: number): Promise<AccessResult> {
  // Staff bypass — works even for free courses (they'd pass anyway, but it's explicit)
  if (isStaffEmail(email)) return { allowed: true, reason: 'staff' };

  // Every course now requires a signed-in user, including AI·101.
  // Course content is free; the account is the gate.
  if (!userId) return { allowed: false, reason: 'needs_auth' };

  // AI·101 (and any other non-paid course) is unlocked for any authed user.
  if (!isPaidCourse(courseId)) return { allowed: true, reason: 'free' };

  // Org-level "all courses free" — covers HomeLife Media employees and any future tenant
  // with autoGrantAll=true. Short-circuits before per-course entitlement checks so adding
  // new Truos+ courses requires zero per-user backfill.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { orgId: true, org: { select: { autoGrantAll: true } } },
  });
  if (user?.org?.autoGrantAll) return { allowed: true, reason: 'org_grant' };

  // Check entitlement
  const ent = await prisma.courseEntitlement.findFirst({
    where: {
      userId,
      courseId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  if (ent) return { allowed: true, reason: 'entitlement' };

  // Check team subscription (user's org has active subscription)
  if (user?.orgId) {
    const sub = await prisma.subscription.findFirst({
      where: {
        orgId: user.orgId,
        status: { in: ['active', 'trialing'] },
        currentPeriodEnd: { gt: new Date() },
      },
    });
    if (sub) return { allowed: true, reason: 'subscription' };
  }

  return { allowed: false, reason: 'paywall' };
}

export async function recordProgress(userId: string, courseId: number, moduleIdx: number, lessonIdx: number, score: number) {
  return prisma.lessonProgress.upsert({
    where: { userId_courseId_moduleIdx_lessonIdx: { userId, courseId, moduleIdx, lessonIdx } },
    create: { userId, courseId, moduleIdx, lessonIdx, score },
    update: { score, completedAt: new Date() },
  });
}

export async function getCourseProgress(userId: string, courseId: number): Promise<{ completed: number; total: number }> {
  const rows = await prisma.lessonProgress.findMany({
    where: { userId, courseId },
    select: { moduleIdx: true, lessonIdx: true },
  });
  // Caller needs to know course's total lesson count; return done + caller computes %
  return { completed: rows.length, total: 0 };
}
