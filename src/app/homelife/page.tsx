import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getOrgBySlug, getOrgContext } from '@/lib/org';
import { getStandings, getActivityFeed, getMVP } from '@/lib/league';
import { Ticker } from './_components/Ticker';
import { Standings } from './_components/Standings';
import { MVPCard } from './_components/MVPCard';
import { ActivityFeed } from './_components/ActivityFeed';
import './_components/league.css';

export const metadata: Metadata = {
  title: 'TRUOS LEAGUE — HomeLife Media',
  robots: { index: false, follow: true },
};

// Hits Prisma in render — must run at request time, not build time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomeLifeScoreboard() {
  const org = await getOrgBySlug('hlm');
  if (!org) notFound();

  const [standings, feed, mvp, session] = await Promise.all([
    getStandings(org.id),
    getActivityFeed(org.id, 30),
    getMVP(org.id),
    auth(),
  ]);
  const ctx = await getOrgContext(session?.user?.id ?? null);
  const showAdminLink = ctx.isOwner && ctx.orgId === org.id;
  const showTeamLink = ctx.isManager && ctx.orgId === org.id;

  const totalMembers = standings.reduce((s, r) => s + r.members, 0);
  const totalPoints = standings.reduce((s, r) => s + r.points, 0);

  return (
    <div className="hl-root">
      <Ticker feed={feed} standings={standings} />

      <header className="hl-header">
        <div className="hl-container">
          <div className="hl-eyebrow">{org.name} · Truos × HLM</div>
          <h1 className="hl-title">TRUOS <span className="league">LEAGUE</span></h1>
          <p className="hl-sub">
            Season 1 · Started May 2026 · Resets Aug 1
            {showAdminLink && <> · <Link href="/homelife/admin/divisions">admin →</Link></>}
            {showTeamLink && !ctx.isOwner && <> · <Link href="/homelife/team">team →</Link></>}
            <> · <Link href="/dashboard">my dashboard →</Link></>
          </p>
        </div>
      </header>

      <main className="hl-main">
        <div className="hl-container">
          <section className="hl-section">
            <MVPCard mvp={mvp} />
          </section>

          <section className="hl-section">
            <h2 className="hl-section-title">Standings · {standings.length} divisions · {totalMembers} {totalMembers === 1 ? 'member' : 'members'} · {totalPoints} pts total</h2>
            <Standings rows={standings} />
          </section>

          <section className="hl-section">
            <h2 className="hl-section-title">Live Feed</h2>
            <ActivityFeed feed={feed} />
          </section>
        </div>
      </main>

      <footer className="hl-footer">
        <div className="hl-container">
          SEASON 1 · STARTED MAY 2026 · RESETS AUG 1
          <Link href="/">Truos</Link>
          <Link href="/methodology">Methodology</Link>
        </div>
      </footer>
    </div>
  );
}
