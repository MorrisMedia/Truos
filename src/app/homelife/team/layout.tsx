import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrgContext, getOrgBySlug, getDivisionLedBy } from '@/lib/org';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HomeLifeTeamLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/homelife/team');
  const ctx = await getOrgContext(session.user.id);
  const hlm = await getOrgBySlug('hlm');
  if (!hlm || ctx.orgId !== hlm.id) redirect('/homelife');
  if (!ctx.isManager) redirect('/homelife');

  const division = await getDivisionLedBy(session.user.id);
  if (!division && !ctx.isOwner) {
    return (
      <>
        <Nav variant="minimal" />
        <section style={{ padding: '60px 0' }}>
          <div className="container" style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: 28 }}>You&rsquo;re a manager but no division yet</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
              Marshall needs to assign you as the leader of a division in <Link href="/homelife/admin/divisions" className="nav-link">/homelife/admin/divisions</Link>.
            </p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '36px 0 12px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/homelife" className="nav-link" style={{ fontSize: 13, marginBottom: 12, display: 'inline-block' }}>← TRUOS LEAGUE</Link>
          <h1 style={{ fontSize: 32, letterSpacing: '-0.025em' }}>
            {division ? <>{division.emoji} {division.name} — team</> : 'Team console'}
          </h1>
          <nav style={{ display: 'flex', gap: 18, marginTop: 16, fontSize: 14 }}>
            <Link href="/homelife/team" className="nav-link">Roster</Link>
            <Link href="/homelife/team/trash-talk" className="nav-link">Trash-talk</Link>
            <Link href="/homelife/team/nudge" className="nav-link">Nudge</Link>
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
