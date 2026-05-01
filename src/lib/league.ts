// TRUOS LEAGUE — points + standings + activity feed for org-tenant scoreboards.
// All values derived from Certificate / LessonProgress — no points column anywhere.
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { findCourse, ALL_COURSES } from '@/content/courses';

// ---------- Points ----------

export function pointsForCourse(courseId: number): number {
  const c = findCourse(courseId);
  if (!c) return 0;
  if (c.suite === 'base') return Math.max(0, courseId - 100); // 101→1 ... 104→4
  return 2; // any 'plus' course (current + future)
}

export function speedRunBonus(): number {
  return 2;
}

// ---------- Helpers ----------

function obfuscateName(name: string | null, fallbackEmail: string): string {
  const display = (name?.trim() || fallbackEmail.split('@')[0]).split(' ');
  const first = display[0] ?? '';
  const lastInitial = display.length > 1 ? display[display.length - 1][0] + '.' : '';
  return [first, lastInitial].filter(Boolean).join(' ');
}

function startOfPTDay(d: Date): string {
  // Pacific Time YYYY-MM-DD bucket (handles DST via Intl)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(d);
}

// ---------- Standings ----------

export interface DivisionStanding {
  divisionId: string;
  slug: string;
  name: string;
  color: string | null;
  emoji: string | null;
  members: number;
  points: number;
  pointsToday: number;
  lastCertAtMs: number | null; // ms since epoch — Date doesn't survive unstable_cache JSON round-trip
  onFire: boolean; // 3+ certs in last 24h
  trashTalk: string | null;
  trashTalkAtMs: number | null;
  spark: number[]; // points per day, last 14 days
}

async function _getStandings(orgId: string): Promise<DivisionStanding[]> {
  const divisions = await prisma.orgDivision.findMany({
    where: { orgId },
    include: {
      members: {
        select: {
          id: true,
          certificates: {
            select: { courseId: true, issuedAt: true },
          },
        },
      },
    },
  });

  const now = new Date();
  const todayPT = startOfPTDay(now);
  const fourteen: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    fourteen.push(startOfPTDay(d));
  }

  const standings: DivisionStanding[] = divisions.map(div => {
    let points = 0;
    let pointsToday = 0;
    let lastCertAt: Date | null = null;
    let recentCerts = 0;
    const spark = new Array(14).fill(0);

    for (const m of div.members) {
      for (const c of m.certificates) {
        const pts = pointsForCourse(c.courseId);
        points += pts;
        const day = startOfPTDay(c.issuedAt);
        if (day === todayPT) pointsToday += pts;
        if (!lastCertAt || c.issuedAt > lastCertAt) lastCertAt = c.issuedAt;
        const ageHrs = (now.getTime() - c.issuedAt.getTime()) / 36e5;
        if (ageHrs <= 24) recentCerts++;
        const dayIdx = fourteen.indexOf(day);
        if (dayIdx >= 0) spark[dayIdx] += pts;
      }
    }

    return {
      divisionId: div.id,
      slug: div.slug,
      name: div.name,
      color: div.color,
      emoji: div.emoji,
      members: div.members.length,
      points,
      pointsToday,
      lastCertAtMs: lastCertAt ? lastCertAt.getTime() : null,
      onFire: recentCerts >= 3,
      trashTalk: div.trashTalk,
      trashTalkAtMs: div.trashTalkAt ? div.trashTalkAt.getTime() : null,
      spark,
    };
  });

  // Sort: points DESC, then most recent cert, then name
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const at = a.lastCertAtMs ?? 0;
    const bt = b.lastCertAtMs ?? 0;
    if (bt !== at) return bt - at;
    return a.name.localeCompare(b.name);
  });
  return standings;
}

export const getStandings = (orgId: string) =>
  unstable_cache(() => _getStandings(orgId), ['league:standings', orgId], { revalidate: 60, tags: [`league:${orgId}`] })();

// ---------- Activity Feed ----------

export interface ActivityEntry {
  id: string;
  userDisplayName: string;
  divisionName: string | null;
  divisionColor: string | null;
  divisionEmoji: string | null;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  basePoints: number;
  bonusPoints: number;
  speedRun: boolean;
  issuedAtMs: number;
  certHash: string;
}

async function _getActivityFeed(orgId: string, limit = 30): Promise<ActivityEntry[]> {
  const certs = await prisma.certificate.findMany({
    where: { user: { orgId } },
    orderBy: { issuedAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          division: { select: { name: true, color: true, emoji: true } },
          progress: { select: { courseId: true, completedAt: true } },
        },
      },
    },
  });

  return certs.map(c => {
    const course = findCourse(c.courseId);
    const base = pointsForCourse(c.courseId);
    // Speed run: first lesson on this course → cert in <48h
    const firstLesson = c.user.progress
      .filter(p => p.courseId === c.courseId)
      .reduce<Date | null>((acc, p) => (acc && p.completedAt > acc ? acc : p.completedAt), null);
    const speedRun = !!firstLesson && (c.issuedAt.getTime() - firstLesson.getTime()) / 36e5 < 48;
    return {
      id: c.id,
      userDisplayName: obfuscateName(c.user.name, c.user.email),
      divisionName: c.user.division?.name ?? null,
      divisionColor: c.user.division?.color ?? null,
      divisionEmoji: c.user.division?.emoji ?? null,
      courseId: c.courseId,
      courseCode: course?.code ?? `#${c.courseId}`,
      courseTitle: course?.title ?? '',
      basePoints: base,
      bonusPoints: speedRun ? speedRunBonus() : 0,
      speedRun,
      issuedAtMs: c.issuedAt.getTime(),
      certHash: c.verificationHash,
    };
  });
}

export const getActivityFeed = (orgId: string, limit = 30) =>
  unstable_cache(() => _getActivityFeed(orgId, limit), ['league:feed', orgId, String(limit)], { revalidate: 60, tags: [`league:${orgId}`] })();

// ---------- MVP of the Week ----------

export interface MVP {
  userId: string;
  displayName: string;
  divisionName: string | null;
  divisionColor: string | null;
  divisionEmoji: string | null;
  pointsThisWeek: number;
  certsThisWeek: number;
  topCourseCode: string;
}

async function _getMVP(orgId: string): Promise<MVP | null> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 36e5);
  const certs = await prisma.certificate.findMany({
    where: { user: { orgId }, issuedAt: { gte: sevenDaysAgo } },
    orderBy: { issuedAt: 'desc' },
    include: {
      user: {
        select: {
          id: true, name: true, email: true,
          division: { select: { name: true, color: true, emoji: true } },
        },
      },
    },
  });
  if (certs.length === 0) return null;

  type Tally = { user: typeof certs[0]['user']; pts: number; count: number; topCourseId: number; topCoursePts: number; latest: Date };
  const byUser = new Map<string, Tally>();
  for (const c of certs) {
    const pts = pointsForCourse(c.courseId);
    const t = byUser.get(c.user.id) ?? { user: c.user, pts: 0, count: 0, topCourseId: c.courseId, topCoursePts: 0, latest: c.issuedAt };
    t.pts += pts;
    t.count++;
    if (pts > t.topCoursePts) { t.topCoursePts = pts; t.topCourseId = c.courseId; }
    if (c.issuedAt > t.latest) t.latest = c.issuedAt;
    byUser.set(c.user.id, t);
  }
  const ranked = [...byUser.values()].sort((a, b) => b.pts - a.pts || b.latest.getTime() - a.latest.getTime());
  const top = ranked[0];
  return {
    userId: top.user.id,
    displayName: obfuscateName(top.user.name, top.user.email),
    divisionName: top.user.division?.name ?? null,
    divisionColor: top.user.division?.color ?? null,
    divisionEmoji: top.user.division?.emoji ?? null,
    pointsThisWeek: top.pts,
    certsThisWeek: top.count,
    topCourseCode: findCourse(top.topCourseId)?.code ?? `#${top.topCourseId}`,
  };
}

export const getMVP = (orgId: string) =>
  unstable_cache(() => _getMVP(orgId), ['league:mvp', orgId], { revalidate: 60, tags: [`league:${orgId}`] })();

// ---------- Streak (per user) ----------

export async function userStreakDays(userId: string): Promise<number> {
  const rows = await prisma.lessonProgress.findMany({
    where: { userId },
    select: { completedAt: true },
    orderBy: { completedAt: 'desc' },
    take: 60,
  });
  if (rows.length === 0) return 0;
  const days = new Set(rows.map(r => startOfPTDay(r.completedAt)));
  let streak = 0;
  let cursor = new Date();
  for (;;) {
    const day = startOfPTDay(cursor);
    if (days.has(day)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow today to be empty if we already have yesterday
      if (streak === 0 && days.has(startOfPTDay(new Date(cursor.getTime() - 864e5)))) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

// ---------- Total possible ----------

export const MAX_POSSIBLE_POINTS = ALL_COURSES.reduce((sum, c) => sum + pointsForCourse(c.id), 0);
