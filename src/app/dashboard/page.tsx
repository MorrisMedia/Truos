import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ALL_COURSES, BASE_COURSES, PLUS_COURSES } from '@/content/courses';
import { LESSONS } from '@/content/lessons';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  const userId = session.user.id;
  const progressRows = await prisma.lessonProgress.findMany({ where: { userId }, select: { courseId: true } });
  const entitlements = await prisma.courseEntitlement.findMany({
    where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { courseId: true },
  });
  const entSet = new Set(entitlements.map(e => e.courseId));

  // Subscription check (for team)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } });
  const hasSubscription = user?.orgId ? !!(await prisma.subscription.findFirst({
    where: { orgId: user.orgId, status: { in: ['active', 'trialing'] }, currentPeriodEnd: { gt: new Date() } },
  })) : false;

  // count progress per course
  const progressByCourse = new Map<number, number>();
  progressRows.forEach(r => progressByCourse.set(r.courseId, (progressByCourse.get(r.courseId) ?? 0) + 1));

  function hasAccess(courseId: number): boolean {
    if (courseId === 101) return true;
    if (session?.user?.isStaff) return true;
    if (entSet.has(courseId)) return true;
    if (hasSubscription) return true;
    return false;
  }

  return (
    <>
      <Nav variant="course" />
      <section style={{ padding: '56px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 12 }}>YOUR DASHBOARD</div>
          <h1 style={{ fontSize: 48, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Hi{session.user.name ? <>, <span className="serif" style={{ fontStyle: 'italic' }}>{session.user.name}</span></> : null}.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 17 }}>Pick up where you left off — or start something new.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 20 }}>BASE CURRICULUM</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 48 }}>
            {BASE_COURSES.map(c => {
              const total = Object.keys(LESSONS).filter(k => k.startsWith(`${c.id}-`)).length;
              const done = progressByCourse.get(c.id) ?? 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              const access = hasAccess(c.id);
              return (
                <Link key={c.id} href={access ? `/courses/${c.id}` : `/checkout?plan=${c.code}`} className="panel" style={{
                  padding: 28, textDecoration: 'none',
                  background: access ? 'var(--bg-panel)' : 'color-mix(in oklab, var(--bg-panel) 70%, transparent)',
                  opacity: access ? 1 : 0.85,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div className="code" style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.08em' }}>{c.code}</div>
                    {c.tier === 'paid' && !access && <span className="badge paid">${c.price}</span>}
                    {access && done > 0 && pct < 100 && <span className="badge accent">{pct}%</span>}
                    {access && pct === 100 && <span className="badge success">COMPLETE</span>}
                  </div>
                  <h3 style={{ fontSize: 24, marginBottom: 8, letterSpacing: '-0.02em' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{c.subtitle}</p>
                  <div className="progress-bar" style={{ marginBottom: 12 }}><span style={{ width: `${pct}%` }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{done} / {total} lessons</span>
                    <span>{access ? (done > 0 ? 'Continue' : 'Start') : `Unlock for $${c.price}`} {Icons.arrow}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="eyebrow" style={{ marginBottom: 20 }}>TRUOS<span style={{ color: 'var(--accent)' }}>+</span> · TOOL-SPECIFIC MASTERY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {PLUS_COURSES.map(c => {
              const total = Object.keys(LESSONS).filter(k => k.startsWith(`${c.id}-`)).length;
              const done = progressByCourse.get(c.id) ?? 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              const access = hasAccess(c.id);
              return (
                <Link key={c.id} href={access ? `/courses/${c.id}` : `/checkout?plan=${c.code}`} className="panel" style={{ padding: 28, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div className="code" style={{ color: 'var(--accent)', fontSize: 12, letterSpacing: '0.08em' }}>{c.code}</div>
                    {!access && <span className="badge paid">${c.price}</span>}
                    {access && pct > 0 && pct < 100 && <span className="badge accent">{pct}%</span>}
                    {access && pct === 100 && <span className="badge success">COMPLETE</span>}
                  </div>
                  <h3 style={{ fontSize: 24, marginBottom: 8, letterSpacing: '-0.02em' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{c.subtitle}</p>
                  <div className="progress-bar" style={{ marginBottom: 12 }}><span style={{ width: `${pct}%` }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{done} / {total} lessons</span>
                    <span>{access ? (done > 0 ? 'Continue' : 'Start') : `Unlock for $${c.price}`} {Icons.arrow}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
