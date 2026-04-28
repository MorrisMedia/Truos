import Link from 'next/link';
import { requireHlmRole } from '../../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { PeopleTable } from '../../_components/PeopleTable';

export const dynamic = 'force-dynamic';

const COURSES = [101, 102, 103, 104];
const LESSONS_PER_COURSE = 20; // estimate per course

export default async function AdminPeople() {
  await requireHlmRole('org_admin');

  const org = await prisma.organization.findFirst({ where: { name: 'HomeLife Media' } });
  if (!org) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        Org not found. Run the seed script first.
      </div>
    );
  }

  const memberships = await prisma.orgMembership.findMany({
    where: { orgId: org.id },
    include: { user: true, dept: true },
    orderBy: { invitedAt: 'desc' },
  });

  const userIds = memberships.map((m) => m.userId).filter(Boolean) as string[];

  const [allProgress, allCerts] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId: { in: userIds } } }),
    prisma.certificate.findMany({ where: { userId: { in: userIds } } }),
  ]);

  const rows = memberships.map((m) => {
    const courses = COURSES.map((cid) => {
      if (!m.userId) return { courseId: cid, status: 'none' as const };
      const cert = allCerts.find((c) => c.userId === m.userId && c.courseId === cid);
      if (cert) {
        return { courseId: cid, status: 'cert' as const, date: cert.issuedAt };
      }
      const lessons = allProgress.filter(
        (p) => p.userId === m.userId && p.courseId === cid,
      );
      if (lessons.length > 0) {
        const pct = Math.min(100, Math.round((lessons.length / LESSONS_PER_COURSE) * 100));
        return { courseId: cid, status: 'progress' as const, pct };
      }
      return { courseId: cid, status: 'none' as const };
    });

    return {
      id: m.id,
      userId: m.userId,
      name: m.user?.name ?? null,
      email: m.user?.email ?? m.inviteEmail ?? '',
      dept: m.dept?.name ?? null,
      deptId: m.departmentId ?? null,
      orgRole: m.orgRole,
      joinedAt: m.joinedAt,
      invitedAt: m.invitedAt,
      pending: !m.joinedAt,
      courses,
    };
  });

  const depts = await prisma.orgDepartment.findMany({
    where: { orgId: org.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 24,
        }}
      >
        <div>
          <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
            Roster
          </div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
            People
          </h1>
        </div>
        <Link
          href="/hlm/admin/onboard"
          style={{
            padding: '8px 16px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + Add people
        </Link>
      </div>

      <PeopleTable rows={rows} depts={depts} />
    </div>
  );
}
