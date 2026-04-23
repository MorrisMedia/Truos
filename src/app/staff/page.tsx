import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';
import { Sparkline } from '@/components/Sparkline';
import { getStaffOverview, formatCents, formatCentsExact } from '@/lib/staff-analytics';

export const dynamic = 'force-dynamic';

export default async function StaffOverviewPage() {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const overview = await getStaffOverview();

  const kpis: { label: string; value: string; sub?: string }[] = [
    { label: 'Revenue (all time)', value: formatCents(overview.revenue.allTimeCents), sub: `${formatCents(overview.revenue.last30DaysCents)} last 30d` },
    { label: 'MRR', value: formatCents(overview.revenue.mrrCents), sub: `${overview.counts.activeSubs} active subs` },
    { label: 'Users', value: overview.counts.users.toString(), sub: `+${overview.activity.signupsLast30} in 30d` },
    { label: 'Orgs', value: overview.counts.orgs.toString(), sub: `${overview.counts.totalSubs} total subs` },
    { label: 'Purchases', value: overview.counts.completedPurchases.toString(), sub: `+${overview.activity.purchasesLast30} in 30d` },
    { label: 'Active codes', value: overview.counts.activeCodes.toString(), sub: `${overview.activity.redemptionsLast30} redeemed 30d` },
    { label: 'Certificates', value: overview.counts.certificates.toString() },
    { label: 'Lessons done', value: overview.counts.lessonsCompleted.toLocaleString() },
  ];

  const activity = mergeActivity(overview);

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>STAFF · TRUOS OPS</div>
            <h1 style={{ fontSize: 44, letterSpacing: '-0.025em' }}>Overview</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>Global analytics, revenue, and activity across Truos and Truos+.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/staff/users" className="btn btn-ghost btn-sm">Users</Link>
            <Link href="/staff/orgs" className="btn btn-ghost btn-sm">Organizations</Link>
            <Link href="/staff/codes" className="btn btn-ghost btn-sm">Comp codes</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 48px' }}>
        <div className="container">
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {kpis.map(k => (
              <div key={k.label} className="panel" style={{ padding: 18 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{k.label.toUpperCase()}</div>
                <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{k.value}</div>
                {k.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* Signups sparkline */}
          <div className="panel" style={{ padding: 20, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div className="eyebrow">SIGNUPS · LAST 30 DAYS</div>
                <div style={{ fontSize: 22, marginTop: 4 }}>
                  {overview.activity.signupsLast30}
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 12 }}>
                    {overview.activity.signupsLast7} this week
                  </span>
                </div>
              </div>
            </div>
            <Sparkline data={overview.signupsByDay} height={72} />
            <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginTop: 6 }}>
              <span>{overview.signupsByDay[0]?.day}</span>
              <span>{overview.signupsByDay[overview.signupsByDay.length - 1]?.day}</span>
            </div>
          </div>

          {/* Course popularity */}
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>COURSE TRACTION</div>
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 90px 90px 90px 110px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                <span>CODE</span>
                <span>TITLE</span>
                <span style={{ textAlign: 'right' }}>ACCESS</span>
                <span style={{ textAlign: 'right' }}>PURCHASES</span>
                <span style={{ textAlign: 'right' }}>STARTED</span>
                <span style={{ textAlign: 'right' }}>CERTS</span>
                <span style={{ textAlign: 'right' }}>COMPLETION</span>
              </div>
              {overview.coursePopularity.map(c => (
                <div key={c.courseId} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 90px 90px 90px 110px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 12, color: c.suite === 'plus' ? 'var(--accent)' : 'var(--text)' }}>{c.code}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.title}</span>
                  <span style={{ textAlign: 'right' }} className="mono">{c.entitlements}</span>
                  <span style={{ textAlign: 'right' }} className="mono">{c.purchases}</span>
                  <span style={{ textAlign: 'right' }} className="mono">{c.starters}</span>
                  <span style={{ textAlign: 'right' }} className="mono">{c.completers}</span>
                  <span className="mono" style={{ textAlign: 'right', color: c.completionRate > 0 ? 'var(--accent)' : 'var(--text-dim)' }}>
                    {c.starters > 0 ? `${Math.round(c.completionRate * 100)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Two-column: activity feed + quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
            <div className="panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="eyebrow">ACTIVITY FEED</div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Latest 20 events</span>
              </div>
              {activity.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nothing yet — site is freshly deployed.</div>
              ) : activity.map((ev, i) => (
                <div key={ev.key} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', fontSize: 13 }}>
                  <span className="mono" style={{ fontSize: 10, color: badgeColor(ev.kind), letterSpacing: '0.08em' }}>{ev.kind.toUpperCase()}</span>
                  <span>{ev.text}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatRelative(ev.when)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="panel" style={{ padding: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>QUICK ACTIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link className="btn btn-primary btn-sm" href="/staff/codes">Create comp code {Icons.arrow}</Link>
                  <Link className="btn btn-ghost btn-sm" href="/staff/users">Search users · grant access</Link>
                  <Link className="btn btn-ghost btn-sm" href="/staff/orgs">View organizations</Link>
                  <Link className="btn btn-ghost btn-sm" href="/staff/orgs/new">Create new organization</Link>
                </div>
              </div>
              <div className="panel" style={{ padding: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>ACCESS MODEL</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  A user can access a course if ANY is true:
                  <ol style={{ paddingLeft: 16, margin: '10px 0' }}>
                    <li>Course is AI·101 (always free)</li>
                    <li>Staff email (in TRUOS_SUPERADMINS env)</li>
                    <li>Has CourseEntitlement row (purchase, comp code, or manual grant)</li>
                    <li>Org has active Subscription</li>
                  </ol>
                  Grant manual access from <Link href="/staff/users" className="nav-link">Users</Link>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

// ---- activity helpers ----

type ActivityEvent = {
  key: string;
  kind: 'signup' | 'purchase' | 'redemption';
  text: string;
  when: Date;
};

function mergeActivity(overview: Awaited<ReturnType<typeof getStaffOverview>>): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const u of overview.recentSignups) {
    events.push({
      key: `signup:${u.id}`,
      kind: 'signup',
      text: `${u.name ?? u.email} signed up`,
      when: new Date(u.createdAt),
    });
  }
  for (const p of overview.recentPurchases) {
    events.push({
      key: `purchase:${p.id}`,
      kind: 'purchase',
      text: `${p.userEmail ?? 'user'} purchased course(s) ${p.courseIds.join(', ')} — ${formatCentsExact(p.amount)}`,
      when: p.paidAt ? new Date(p.paidAt) : new Date(),
    });
  }
  for (const r of overview.recentRedemptions) {
    events.push({
      key: `redeem:${r.id}`,
      kind: 'redemption',
      text: `${r.userEmail ?? 'user'} redeemed ${r.code}`,
      when: new Date(r.redeemedAt),
    });
  }
  return events.sort((a, b) => b.when.getTime() - a.when.getTime()).slice(0, 20);
}

function badgeColor(kind: ActivityEvent['kind']): string {
  if (kind === 'purchase') return 'var(--accent)';
  if (kind === 'redemption') return 'var(--warn)';
  return 'var(--text-muted)';
}

function formatRelative(d: Date): string {
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const min = 60 * 1000, hr = 60 * min, day = 24 * hr;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m`;
  if (diff < day) return `${Math.floor(diff / hr)}h`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
  return d.toISOString().slice(0, 10);
}
