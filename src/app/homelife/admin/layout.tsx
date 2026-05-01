import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrgContext, getOrgBySlug } from '@/lib/org';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HomeLifeAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/homelife/admin');
  const ctx = await getOrgContext(session.user.id);
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) redirect('/');
  if (ctx.orgId !== hlm.id || ctx.orgRole !== 'owner') redirect('/homelife');

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '36px 0 12px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/homelife" className="nav-link" style={{ fontSize: 13, marginBottom: 12, display: 'inline-block' }}>← TRUOS LEAGUE</Link>
          <h1 style={{ fontSize: 32, letterSpacing: '-0.025em' }}>HomeLife admin</h1>
          <nav style={{ display: 'flex', gap: 18, marginTop: 16, fontSize: 14, flexWrap: 'wrap' }}>
            <Link href="/homelife/admin" className="nav-link">Overview</Link>
            <Link href="/homelife/admin/divisions" className="nav-link">Divisions</Link>
            <Link href="/homelife/admin/members" className="nav-link">Members</Link>
            <Link href="/homelife/admin/invite" className="nav-link">Invite</Link>
            <Link href="/homelife/admin/trash-talk" className="nav-link">Trash-talk</Link>
            <Link href="/homelife" className="nav-link" style={{ marginLeft: 'auto', color: 'var(--accent)' }}>🏆 View scoreboard →</Link>
          </nav>
        </div>
      </section>
      <section style={{ padding: '32px 0 64px' }}>
        <div className="container">{children}</div>
      </section>
      <Footer />
    </>
  );
}
