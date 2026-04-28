import Link from 'next/link';
import { requireHlmRole } from '../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { MetricCard } from '../_components/MetricCard';
import { DepartmentBar } from '../_components/DepartmentBar';

export const dynamic = 'force-dynamic';

export default async function AdminPulse() {
  await requireHlmRole('org_admin');

  const org = await prisma.organization.findFirst({ where: { name: 'HomeLife Media' } });
  if (!org) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        Org not found. Run: <code>npx ts-node --project tsconfig.json prisma/seed-hlm.ts</code>
      </div>
    );
  }

  // All memberships
  const allMemberships = await prisma.orgMembership.findMany({ where: { orgId: org.id } });
  const joinedMemberships = allMemberships.filter((m) => m.joinedAt);
  const joinedUserIds = joinedMemberships.map((m) => m.userId).filter(Boolean) as string[];

  const invitedCount = allMemberships.length;
  const joinedCount = joinedMemberships.length;

  // Active learners (≥1 lesson progress)
  const progressByUser = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: joinedUserIds } },
    _count: { id: true },
  });
  const activeSet = new Set(progressByUser.map((p) => p.userId));
  const activeLearners = activeSet.size;
  const activationPct = joinedCount > 0 ? Math.round((activeLearners / joinedCount) * 100) : 0;

  // Certs earned
  const certsEarned = await prisma.certificate.count({
    where: { userId: { in: joinedUserIds } },
  });

  // Activation by dept
  const depts = await prisma.orgDepartment.findMany({ where: { orgId: org.id } });
  const deptStats = depts
    .map((dept) => {
      const deptMembers = joinedMemberships.filter(
        (m) => m.departmentId === dept.id && m.userId,
      );
      const deptUserIds = deptMembers.map((m) => m.userId as string);
      const activated = deptUserIds.filter((id) => activeSet.has(id)).length;
      const total = deptUserIds.length;
      const pct = total > 0 ? Math.round((activated / total) * 100) : 0;
      return { dept, activated, total, pct };
    })
    .filter((d) => d.total > 0)
    .sort((a, b) => b.pct - a.pct);

  const riskDepts = deptStats.filter((d) => d.pct < 20);

  // Top learners this week
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weeklyProgress = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: joinedUserIds }, completedAt: { gte: weekAgo } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
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
      {/* Header */}
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
            HomeLife Media
          </div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
            Org pulse
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

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <MetricCard label="Active learners" value={activeLearners} />
        <MetricCard label="Org-wide activation" value={`${activationPct}%`} />
        <MetricCard label="Certificates earned" value={certsEarned} />
        <MetricCard
          label="Members"
          value={`${joinedCount}/${invitedCount}`}
          sublabel="joined / invited"
        />
      </div>

      {/* Activation by dept */}
      {deptStats.length > 0 && (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px 28px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 500 }}>Activation by department</h2>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Live
            </span>
          </div>
          {deptStats.map((d) => (
            <DepartmentBar
              key={d.dept.id}
              name={d.dept.name}
              pct={d.pct}
              count={d.activated}
              total={d.total}
              flag={d.pct >= 75 ? 'win' : d.pct < 20 ? 'risk' : undefined}
            />
          ))}
        </div>
      )}

      {deptStats.length === 0 && (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px 28px',
            marginBottom: 24,
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          No members have joined departments yet.{' '}
          <Link href="/hlm/admin/onboard" style={{ color: 'var(--accent)' }}>
            Invite your team →
          </Link>
        </div>
      )}

      {/* Risk list + Top learners */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500 }}>Risk list</h3>
            <span
              style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              ({riskDepts.length})
            </span>
          </div>
          {riskDepts.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--success)' }}>
              All departments above 20% activation ✓
            </div>
          ) : (
            riskDepts.map((d) => (
              <Link
                key={d.dept.id}
                href="/hlm/admin/people"
                style={{
                  display: 'block',
                  padding: '8px 0',
                  fontSize: 13,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ color: 'var(--danger)' }}>▸</span>{' '}
                {d.total - d.activated} in {d.dept.name} — {d.pct}% activation
              </Link>
            ))
          )}
        </div>

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
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {w._count.id} lessons
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CTA if no members */}
      {joinedCount === 0 && (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
              Get started
            </div>
            <div style={{ fontSize: 16, marginTop: 4, fontWeight: 500 }}>
              Invite your team to start training
            </div>
          </div>
          <Link
            href="/hlm/admin/onboard"
            style={{ fontSize: 13, color: 'var(--accent)' }}
          >
            Onboard now →
          </Link>
        </div>
      )}
    </div>
  );
}
