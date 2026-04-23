import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  const userId = session.user.id;
  const [entitlements, certificates, purchases] = await Promise.all([
    prisma.courseEntitlement.findMany({ where: { userId }, orderBy: { grantedAt: 'desc' } }),
    prisma.certificate.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' } }),
    prisma.purchase.findMany({ where: { userId, status: 'completed' }, orderBy: { paidAt: 'desc' } }),
  ]);

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '56px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 12 }}>ACCOUNT</div>
          <h1 style={{ fontSize: 40, letterSpacing: '-0.025em' }}>{session.user.name ?? session.user.email}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{session.user.email}</p>
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="panel" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>COURSE ACCESS · {entitlements.length}</div>
            {entitlements.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No paid entitlements yet. AI·101 is free for everyone.</div>
            ) : entitlements.map(e => {
              const c = findCourse(e.courseId);
              return (
                <div key={e.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <div>
                    <div>{c?.code} — {c?.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Source: {e.source}{e.expiresAt ? ` · expires ${new Date(e.expiresAt).toISOString().slice(0, 10)}` : ''}
                    </div>
                  </div>
                  <Link className="nav-link" href={`/courses/${e.courseId}`}>Open {Icons.arrow}</Link>
                </div>
              );
            })}
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>CERTIFICATES · {certificates.length}</div>
            {certificates.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No certificates yet. Finish a course to earn one.</div>
            ) : certificates.map(c => {
              const course = findCourse(c.courseId);
              return (
                <div key={c.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <div>
                    <div>{course?.code} — {course?.title}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.verificationHash}</div>
                  </div>
                  <Link className="nav-link" href={`/certificates/${c.courseId}`}>View {Icons.arrow}</Link>
                </div>
              );
            })}
          </div>
          <div className="panel" style={{ padding: 24, gridColumn: '1 / -1' }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>PURCHASES · {purchases.length}</div>
            {purchases.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No purchases yet.</div>
            ) : purchases.map(p => (
              <div key={p.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <div>
                  <div>{p.courseIds.map(id => findCourse(id)?.code).filter(Boolean).join(' + ')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.paidAt ? new Date(p.paidAt).toISOString().slice(0, 10) : '—'}
                  </div>
                </div>
                <div className="mono">${(p.amount / 100).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Link className="btn btn-ghost" href="/sign-out">Sign out</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
