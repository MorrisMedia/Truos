import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';
import { isStaffEmail } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function StaffUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const q = (searchParams?.q ?? '').trim();

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' as const } },
          { name: { contains: q, mode: 'insensitive' as const } },
          { id: q },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: q ? 100 : 50,
    include: {
      org: { select: { id: true, name: true } },
      _count: {
        select: {
          progress: true,
          certificates: true,
          purchases: true,
          entitlements: true,
        },
      },
    },
  });

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/staff" className="nav-link" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icons.arrowLeft} Staff overview
          </Link>
          <h1 style={{ fontSize: 40, letterSpacing: '-0.025em' }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
            Search, view progress, grant course access manually.
          </p>
        </div>
      </section>

      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <form method="get" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by email, name, or user id..."
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 6,
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
            {q && <Link href="/staff/users" className="btn btn-ghost">Clear</Link>}
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="eyebrow">{q ? `RESULTS · ${users.length}` : `RECENT · ${users.length}`}</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click a row to view detail and grant access</span>
          </div>

          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 90px 90px 90px 90px 140px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
              <span>EMAIL · NAME</span>
              <span>ORG</span>
              <span style={{ textAlign: 'right' }}>PURCHASES</span>
              <span style={{ textAlign: 'right' }}>ENTITLEMENTS</span>
              <span style={{ textAlign: 'right' }}>LESSONS</span>
              <span style={{ textAlign: 'right' }}>CERTS</span>
              <span style={{ textAlign: 'right' }}>SIGNED UP</span>
            </div>
            {users.length === 0 ? (
              <div style={{ padding: 32, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
                {q ? `No users matching "${q}".` : 'No users yet.'}
              </div>
            ) : users.map((u, i) => (
              <Link
                key={u.id}
                href={`/staff/users/${u.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px 90px 90px 90px 90px 140px',
                  padding: '14px 20px',
                  borderBottom: i === users.length - 1 ? 'none' : '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: 13,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.name ?? u.email}
                    {isStaffEmail(u.email) && (
                      <span className="mono" style={{ fontSize: 9, color: 'var(--accent)', border: '1px solid var(--accent)', padding: '1px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>STAFF</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {u.org ? u.org.name : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                </div>
                <span className="mono" style={{ textAlign: 'right' }}>{u._count.purchases}</span>
                <span className="mono" style={{ textAlign: 'right' }}>{u._count.entitlements}</span>
                <span className="mono" style={{ textAlign: 'right' }}>{u._count.progress}</span>
                <span className="mono" style={{ textAlign: 'right' }}>{u._count.certificates}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right' }}>
                  {new Date(u.createdAt).toISOString().slice(0, 10)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
