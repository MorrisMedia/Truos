import { requireHlmRole } from '../../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { NudgeComposer } from '../../_components/NudgeComposer';

export const dynamic = 'force-dynamic';

export default async function ManagerNudge() {
  const { user, membership } = await requireHlmRole('org_manager');

  if (!membership.departmentId) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        You are not assigned to a department.
      </div>
    );
  }

  const org = await prisma.organization.findUnique({ where: { id: membership.orgId } });

  // Team members who have joined
  const teamMemberships = await prisma.orgMembership.findMany({
    where: {
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      joinedAt: { not: null },
    },
    include: { user: true },
  });

  const teamUserIds = teamMemberships.map((m) => m.userId).filter(Boolean) as string[];

  // Who has started any course
  const started = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: teamUserIds } },
  });
  const startedSet = new Set(started.map((s) => s.userId));

  // Stragglers = joined but haven't started
  const stragglers = teamMemberships
    .filter((m) => m.userId && !startedSet.has(m.userId))
    .map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user?.name ?? null,
      email: m.user?.email ?? m.inviteEmail ?? '',
    }));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
          Re-engage
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
          Nudge stragglers
        </h1>
        {stragglers.length > 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            {stragglers.length} team member{stragglers.length !== 1 ? 's' : ''} haven&apos;t
            started any course yet.
          </p>
        )}
      </div>
      <NudgeComposer
        members={stragglers}
        managerName={user.name ?? user.email}
        orgName={org?.name ?? 'HomeLife Media'}
      />
    </div>
  );
}
