import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function StaffOrgsPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const q = (searchParams?.q ?? '').trim();

  const where = q
    ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { id: q }] }
    : {};

  const orgs = await prisma.organization.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: q ? 100 : 50,
    include: {
      _count: { select: { members: true } },
      subscription: true,
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 40, letterSpacing: '-0.025em' }}>Organizations</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
                Customer orgs, seats, and subscription state.
              </p>
            </div>
            <Link href="/staff/orgs/new" className="btn btn-primary">New organization {Icons.arrow}</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <form method="get" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name or org id..."
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
            {q && <Link href="/staff/orgs" className="btn btn-ghost">Clear</Link>}
          </form>

          <div className="eyebrow" style={{ marginBottom: 12 }}>
            {q ? `RESULTS · ${orgs.length}` : `ALL ORGANIZATIONS · ${orgs.length}`}
          </div>

          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 140px 140px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
              <span>NAME</span>
              <span style={{ textAlign: 'right' }}>MEMBERS</span>
              <span style={{ textAlign: 'right' }}>SEATS</span>
              <span style={{ textAlign: 'right' }}>STATUS</span>
              <span style={{ textAlign: 'right' }}>CREATED</span>
            </div>
            {orgs.length === 0 ? (
              <div style={{ padding: 32, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
                {q ? `No orgs matching "${q}".` : 'No organizations yet. Create the first one.'}
              </div>
            ) : orgs.map((o, i) => (
              <Link
                key={o.id}
                href={`/staff/orgs/${o.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 120px 140px 140px',
                  padding: '14px 20px',
                  borderBottom: i === orgs.length - 1 ? 'none' : '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: 13,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div>{o.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{o.id}</div>
                </div>
                <span className="mono" style={{ textAlign: 'right' }}>{o._count.members}</span>
                <span className="mono" style={{ textAlign: 'right' }}>
                  {o.subscription ? o.subscription.seats : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                </span>
                <span className="mono" style={{ fontSize: 11, textAlign: 'right', color: subColor(o.subscription?.status) }}>
                  {o.subscription ? o.subscription.status.toUpperCase() : 'NO SUB'}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right' }}>
                  {new Date(o.createdAt).toISOString().slice(0, 10)}
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

function subColor(status?: string): string {
  if (!status) return 'var(--text-dim)';
  if (status === 'active' || status === 'trialing') return 'var(--accent)';
  if (status === 'past_due') return 'var(--warn)';
  return 'var(--danger)';
}
