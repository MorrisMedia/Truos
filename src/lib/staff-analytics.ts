// Server-side analytics aggregation for /staff dashboard.
import { prisma } from './prisma';
import { ALL_COURSES } from '@/content/courses';

export interface StaffOverview {
  counts: {
    users: number;
    orgs: number;
    activeSubs: number;
    totalSubs: number;
    completedPurchases: number;
    activeCodes: number;
    certificates: number;
    lessonsCompleted: number;
  };
  revenue: {
    allTimeCents: number;        // purchases + realized sub revenue is hard without invoice history; use purchases for all-time
    last30DaysCents: number;     // purchases last 30d
    mrrCents: number;            // active subs * seats * price
  };
  activity: {
    signupsLast7: number;
    signupsLast30: number;
    purchasesLast7: number;
    purchasesLast30: number;
    redemptionsLast30: number;
  };
  coursePopularity: CoursePopularity[];
  recentSignups: { id: string; email: string; name: string | null; createdAt: Date }[];
  recentPurchases: { id: string; userEmail: string | null; amount: number; courseIds: number[]; paidAt: Date | null }[];
  recentRedemptions: { id: string; userEmail: string | null; code: string; redeemedAt: Date }[];
  signupsByDay: { day: string; count: number }[];   // last 30 days
}

export interface CoursePopularity {
  courseId: number;
  code: string;
  title: string;
  tier: 'free' | 'paid';
  suite: 'base' | 'plus';
  entitlements: number;   // unique users with access via entitlement
  purchases: number;      // purchases that included this course
  starters: number;       // unique users who have at least one progress row
  completers: number;     // unique users with certificate
  completionRate: number; // completers / starters (0-1)
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getStaffOverview(): Promise<StaffOverview> {
  const d7 = daysAgo(7);
  const d30 = daysAgo(30);

  const [
    users,
    orgs,
    totalSubs,
    activeSubs,
    completedPurchases,
    activeCodes,
    certificates,
    lessonsCompleted,
    recentSignups,
    recentPurchasesRaw,
    recentRedemptionsRaw,
    signupsLast7,
    signupsLast30,
    purchasesLast7,
    purchasesLast30,
    redemptionsLast30,
    purchaseSumAll,
    purchaseSum30,
    activeSubsList,
    signupsRaw,
    entitlementsByCourse,
    purchasesByCourseRaw,
    progressByCourse,
    certsByCourse,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.purchase.count({ where: { status: 'completed' } }),
    prisma.compCode.count({ where: { disabledAt: null } }),
    prisma.certificate.count(),
    prisma.lessonProgress.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, email: true, name: true, createdAt: true },
    }),
    prisma.purchase.findMany({
      where: { status: 'completed' },
      orderBy: { paidAt: 'desc' },
      take: 8,
      select: {
        id: true,
        amount: true,
        courseIds: true,
        paidAt: true,
        user: { select: { email: true } },
      },
    }),
    prisma.compCodeRedemption.findMany({
      orderBy: { redeemedAt: 'desc' },
      take: 8,
      select: {
        id: true,
        redeemedAt: true,
        code: { select: { code: true } },
        user: { select: { email: true } },
      },
    }),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.user.count({ where: { createdAt: { gte: d30 } } }),
    prisma.purchase.count({ where: { status: 'completed', paidAt: { gte: d7 } } }),
    prisma.purchase.count({ where: { status: 'completed', paidAt: { gte: d30 } } }),
    prisma.compCodeRedemption.count({ where: { redeemedAt: { gte: d30 } } }),
    prisma.purchase.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
    prisma.purchase.aggregate({ where: { status: 'completed', paidAt: { gte: d30 } }, _sum: { amount: true } }),
    prisma.subscription.findMany({
      where: { status: { in: ['active', 'trialing'] } },
      select: { seats: true, stripePriceId: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: d30 } },
      select: { createdAt: true },
    }),
    prisma.courseEntitlement.groupBy({
      by: ['courseId'],
      _count: { userId: true },
    }),
    prisma.purchase.findMany({
      where: { status: 'completed' },
      select: { courseIds: true },
    }),
    prisma.lessonProgress.groupBy({
      by: ['courseId', 'userId'],
    }),
    prisma.certificate.groupBy({
      by: ['courseId'],
      _count: { userId: true },
    }),
  ]);

  const allTimeCents = purchaseSumAll._sum.amount ?? 0;
  const last30DaysCents = purchaseSum30._sum.amount ?? 0;

  // MRR: use $99/seat/mo as team price (placeholder per spec); fallback 0 for unknown prices
  const TEAM_SEAT_MONTHLY_CENTS = 9900;
  const mrrCents = activeSubsList.reduce((sum, s) => sum + TEAM_SEAT_MONTHLY_CENTS * s.seats, 0);

  // Signups-by-day series
  const byDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  signupsRaw.forEach(u => {
    const key = new Date(u.createdAt).toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  });
  const signupsByDay = Array.from(byDay.entries()).map(([day, count]) => ({ day, count }));

  // Course popularity
  const entMap = new Map<number, number>();
  entitlementsByCourse.forEach(row => entMap.set(row.courseId, row._count.userId));
  const purchaseCountByCourse = new Map<number, number>();
  for (const p of purchasesByCourseRaw) {
    for (const cid of p.courseIds) {
      purchaseCountByCourse.set(cid, (purchaseCountByCourse.get(cid) ?? 0) + 1);
    }
  }
  const starterSet = new Map<number, Set<string>>();
  for (const row of progressByCourse) {
    if (!starterSet.has(row.courseId)) starterSet.set(row.courseId, new Set());
    starterSet.get(row.courseId)!.add(row.userId);
  }
  const certMap = new Map<number, number>();
  certsByCourse.forEach(row => certMap.set(row.courseId, row._count.userId));

  const coursePopularity: CoursePopularity[] = ALL_COURSES.map(c => {
    const starters = starterSet.get(c.id)?.size ?? 0;
    const completers = certMap.get(c.id) ?? 0;
    return {
      courseId: c.id,
      code: c.code,
      title: c.title,
      tier: c.tier,
      suite: c.suite,
      entitlements: entMap.get(c.id) ?? 0,
      purchases: purchaseCountByCourse.get(c.id) ?? 0,
      starters,
      completers,
      completionRate: starters > 0 ? completers / starters : 0,
    };
  });

  const recentPurchases = recentPurchasesRaw.map(p => ({
    id: p.id,
    userEmail: p.user?.email ?? null,
    amount: p.amount,
    courseIds: p.courseIds,
    paidAt: p.paidAt,
  }));

  const recentRedemptions = recentRedemptionsRaw.map(r => ({
    id: r.id,
    userEmail: r.user?.email ?? null,
    code: r.code.code,
    redeemedAt: r.redeemedAt,
  }));

  return {
    counts: {
      users,
      orgs,
      activeSubs,
      totalSubs,
      completedPurchases,
      activeCodes,
      certificates,
      lessonsCompleted,
    },
    revenue: {
      allTimeCents,
      last30DaysCents,
      mrrCents,
    },
    activity: {
      signupsLast7,
      signupsLast30,
      purchasesLast7,
      purchasesLast30,
      redemptionsLast30,
    },
    coursePopularity,
    recentSignups,
    recentPurchases,
    recentRedemptions,
    signupsByDay,
  };
}

export function formatCents(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(dollars >= 10000 ? 0 : 1)}k`;
  return `$${dollars.toFixed(0)}`;
}

export function formatCentsExact(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
