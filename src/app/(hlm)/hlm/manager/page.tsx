import Link from 'next/link';
import { requireHlmRole } from '../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { MetricCard } from '../_components/MetricCard';
import { DepartmentBar } from '../_components/DepartmentBar';

export const dynamic = 'force-dynamic';

export default async function ManagerPulse() {
  const { user, membership } = await requireHlmRole('org_manager');

  if (!membership.departmentId) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        You are not assigned to a department. Contact an admin to be assigned.
      </div>
    );
  }

  const dept = membership.dept;

  // Team members in this dept
  const teamMemberships = await prisma.orgMembership.findMany({
    where: {
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      joinedAt: { not: null },
    },
    include: { user: true },
  });

  const teamUserIds = teamMemberships.map((m) => m.userId).filter(Boolean) as string[];
  const teamSize = teamUserIds.length;

  // Progress
  const progressByUser = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: teamUserIds } },
    _count: { id: true },
  });
  const activeSet = new Set(progressByUser.map((p) => p.userId));
  const activeLearners = activeSet.size;
  const activationPct = teamSize > 0 ? Math.round((activeLearners / teamSize) * 100) : 0;

  // Certs
  const certsEarned = await prisma.certificate.count({
    where: { userId: { in: teamUserIds } },
  });

  const notStarted = teamSize - activeLearners;

  // Week progress
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weeklyProgress = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: teamUserIds }, completedAt: { gte: weekAgo } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 3,
  });

  const topUsers =
    weeklyProgress.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: weeklyProgress.map((w) => w.userId) } },
          select: { id: true, name: true, email: true },
        })
      : [];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
            {dept?.name ?? 'My Department'}
          </div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
            Team pulse
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
            }}
          />
          LIVE
        </div>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <MetricCard label="Team members" value={teamSize} />
        <MetricCard label="Active learners" value={activeLearners} />
        <MetricCard label="Team activation" value={`${activationPct}%`} />
        <MetricCard label="Certificates earned" value={certsEarned} />
      </div>

      {/* Dept bar */}
      {teamSize > 0 && (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px 28px',
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
            {dept?.name ?? 'Department'} activation
          </h2>
          <DepartmentBar
            name={dept?.name ?? 'Team'}
            pct={activationPct}
            count={activeLearners}
            total={teamSize}
            flag={activationPct >= 75 ? 'win' : activationPct < 20 ? 'risk' : undefined}
          />
        </div>
      )}

      {/* Quick win / nudge CTA */}
      {notStarted > 0 && (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: 'var(--warn)' }}>
              Quick win
            </div>
            <div style={{ fontSize: 15, marginTop: 4 }}>
              {notStarted} team member{notStarted !== 1 ? 's' : ''} haven&apos;t started yet
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              A single nudge can get 60% of stragglers to start within 48 hours.
            </div>
          </div>
          <Link
            href="/hlm/manager/nudge"
            style={{
              padding: '10px 18px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Send nudge →
          </Link>
        </div>
      )}

      {/* Top learners */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px 24px',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>
          Top learners this week
        </h3>
        {weeklyProgress.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No lesson activity this week yet.
          </div>
        ) : (
          weeklyProgress.map((w, i) => {
            const u = topUsers.find((u) => u.id === w.userId);
            return (
              <div
                key={w.userId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 13,
                  borderBottom:
                    i < weeklyProgress.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span>
                  <span
                    style={{
                      color: 'var(--text-dim)',
                      marginRight: 8,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {i + 1}
                  </span>
                  {u?.name ?? u?.email ?? 'Unknown'}
                </span>
                <span
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                >
                  {w._count.id} lessons
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
