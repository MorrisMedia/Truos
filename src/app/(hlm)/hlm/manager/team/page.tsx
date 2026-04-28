import { requireHlmRole } from '../../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { PeopleTable } from '../../_components/PeopleTable';

export const dynamic = 'force-dynamic';

const COURSES = [101, 102, 103, 104];
const LESSONS_PER_COURSE = 20;

export default async function ManagerTeam() {
  const { membership } = await requireHlmRole('org_manager');

  if (!membership.departmentId) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        You are not assigned to a department.
      </div>
    );
  }

  const memberships = await prisma.orgMembership.findMany({
    where: {
      orgId: membership.orgId,
      departmentId: membership.departmentId,
    },
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
      if (cert) return { courseId: cid, status: 'cert' as const, date: cert.issuedAt };
      const lessons = allProgress.filter((p) => p.userId === m.userId && p.courseId === cid);
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

  const dept = await prisma.orgDepartment.findUnique({
    where: { id: membership.departmentId },
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
          {dept?.name ?? 'My Team'}
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Team</h1>
      </div>
      <PeopleTable rows={rows} depts={dept ? [{ id: dept.id, name: dept.name }] : []} />
    </div>
  );
}
