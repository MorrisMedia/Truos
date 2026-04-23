import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export default async function StaffOverviewPage() {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const [users, orgs, activeSubs, purchases, codes, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.subscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.purchase.count({ where: { status: 'completed' } }),
    prisma.compCode.count({ where: { disabledAt: null } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { email: true, name: true, createdAt: true } }),
  ]);

  const stats: Array<[string, number | string]> = [
    ['Users', users],
    ['Organizations', orgs],
    ['Active subs', activeSubs],
    ['Purchases', purchases],
    ['Active codes', codes],
  ];

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '56px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>STAFF · TRUOS OPS</div>
          <h1 style={{ fontSize: 44, letterSpacing: '-0.025em' }}>Overview</h1>
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 48 }}>
            {stats.map(([label, value]) => (
              <div key={label} className="panel" style={{ padding: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="eyebrow">RECENT SIGNUPS</div>
                <Link href="/staff/users" className="nav-link">View all {Icons.arrow}</Link>
              </div>
              {recentUsers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No users yet.</div>
              ) : (
                recentUsers.map((u, i) => (
                  <div key={i} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div>{u.name ?? u.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {new Date(u.createdAt).toISOString().slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="eyebrow">QUICK ACTIONS</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link className="btn btn-ghost" href="/staff/codes">Create comp code</Link>
                <Link className="btn btn-ghost" href="/staff/users">Search users · grant access</Link>
                <Link className="btn btn-ghost" href="/staff/orgs">View organizations</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
