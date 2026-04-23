import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';
import { ALL_COURSES, findCourse } from '@/content/courses';
import { isStaffEmail } from '@/lib/config';

export const dynamic = 'force-dynamic';

async function grantAccess(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const userId = String(formData.get('userId'));
  const courseId = Number(formData.get('courseId'));
  const note = String(formData.get('note') ?? '').trim() || 'manual_grant';
  if (!userId || !courseId) throw new Error('missing user or course');

  await prisma.courseEntitlement.upsert({
    where: { userId_courseId_source: { userId, courseId, source: 'manual_grant' } },
    create: { userId, courseId, source: 'manual_grant', sourceId: note.slice(0, 100) },
    update: { sourceId: note.slice(0, 100), expiresAt: null, grantedAt: new Date() },
  });

  revalidatePath(`/staff/users/${userId}`);
}

async function revokeEntitlement(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const id = String(formData.get('id'));
  const userId = String(formData.get('userId'));
  await prisma.courseEntitlement.delete({ where: { id } }).catch(() => undefined);
  revalidatePath(`/staff/users/${userId}`);
}

async function detachFromOrg(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const userId = String(formData.get('userId'));
  await prisma.user.update({ where: { id: userId }, data: { orgId: null } });
  revalidatePath(`/staff/users/${userId}`);
}

async function attachToOrg(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const userId = String(formData.get('userId'));
  const orgId = String(formData.get('orgId')).trim();
  if (!orgId) return;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new Error('org not found');
  await prisma.user.update({ where: { id: userId }, data: { orgId } });
  revalidatePath(`/staff/users/${userId}`);
}

export default async function StaffUserDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      org: { include: { subscription: true } },
      entitlements: { orderBy: { grantedAt: 'desc' } },
      purchases: { orderBy: { createdAt: 'desc' } },
      progress: { orderBy: { completedAt: 'desc' } },
      certificates: { orderBy: { issuedAt: 'desc' } },
      codeRedemptions: {
        orderBy: { redeemedAt: 'desc' },
        include: { code: { select: { code: true, label: true } } },
      },
    },
  });

  if (!user) notFound();

  const grantedCourseIds = new Set(user.entitlements.map(e => e.courseId));
  const grantableCourses = ALL_COURSES.filter(c => c.tier === 'paid' && !grantedCourseIds.has(c.id));

  // Progress per course
  const progressByCourse = new Map<number, number>();
  user.progress.forEach(p => {
    progressByCourse.set(p.courseId, (progressByCourse.get(p.courseId) ?? 0) + 1);
  });

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/staff/users" className="nav-link" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icons.arrowLeft} All users
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 36, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 12 }}>
                {user.name ?? user.email}
                {isStaffEmail(user.email) && (
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.08em' }}>STAFF</span>
                )}
              </h1>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{user.email}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                ID {user.id} · Joined {new Date(user.createdAt).toISOString().slice(0, 10)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 48px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Entitlements */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>COURSE ACCESS · {user.entitlements.length}</div>
              {user.entitlements.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  No explicit entitlements. User sees AI·101 (free) and any courses covered by their org subscription.
                </div>
              ) : user.entitlements.map((e, i) => {
                const course = findCourse(e.courseId);
                return (
                  <div key={e.id} style={{ padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '120px 1fr 140px auto', gap: 12, alignItems: 'center', fontSize: 13 }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{course?.code ?? `#${e.courseId}`}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{course?.title ?? 'Unknown course'}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{e.source}</span>
                    <form action={revokeEntitlement}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Revoke</button>
                    </form>
                  </div>
                );
              })}
            </div>

            {/* Purchases */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>PURCHASES · {user.purchases.length}</div>
              {user.purchases.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No purchases.</div>
              ) : user.purchases.map((p, i) => (
                <div key={p.id} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 100px 100px 140px', gap: 12, fontSize: 13, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 11 }}>{p.courseIds.join(', ')}</span>
                  <span className="mono" style={{ fontSize: 12 }}>${(p.amount / 100).toFixed(2)}</span>
                  <span className="mono" style={{ fontSize: 11, color: p.status === 'completed' ? 'var(--accent)' : 'var(--text-muted)' }}>{p.status}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right' }}>
                    {p.paidAt ? new Date(p.paidAt).toISOString().slice(0, 10) : '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Certificates */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>CERTIFICATES · {user.certificates.length}</div>
              {user.certificates.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No certificates earned yet.</div>
              ) : user.certificates.map((c, i) => {
                const course = findCourse(c.courseId);
                return (
                  <div key={c.id} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: 12, fontSize: 13, alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--accent)' }}>{course?.code ?? `#${c.courseId}`}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{course?.title}</span>
                    <Link href={`/verify/${c.verificationHash}`} className="mono nav-link" style={{ fontSize: 11 }}>Verify ↗</Link>
                  </div>
                );
              })}
            </div>

            {/* Progress summary */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>PROGRESS · {user.progress.length} LESSONS</div>
              {progressByCourse.size === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No lessons completed yet.</div>
              ) : Array.from(progressByCourse.entries()).map(([courseId, count], i) => {
                const course = findCourse(courseId);
                const pct = course ? Math.min(100, Math.round((count / course.lessons) * 100)) : 0;
                return (
                  <div key={courseId} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '120px 1fr 100px', gap: 12, fontSize: 13, alignItems: 'center' }}>
                    <span className="mono">{course?.code ?? `#${courseId}`}</span>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                      {count}/{course?.lessons ?? '?'} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: grant + org management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>GRANT COURSE ACCESS</div>
              {grantableCourses.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  User has entitlements for all paid courses already.
                </div>
              ) : (
                <form action={grantAccess} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input type="hidden" name="userId" value={user.id} />
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="eyebrow" style={{ fontSize: 10 }}>COURSE</span>
                    <select name="courseId" required style={fieldStyle}>
                      {grantableCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="eyebrow" style={{ fontSize: 10 }}>INTERNAL NOTE (OPTIONAL)</span>
                    <input name="note" placeholder="e.g. cohort-3, refund replacement" style={fieldStyle} />
                  </label>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 4 }}>Grant access {Icons.arrow}</button>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                    Creates CourseEntitlement with source = manual_grant. Permanent until revoked.
                  </div>
                </form>
              )}
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>ORGANIZATION</div>
              {user.org ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <Link href={`/staff/orgs/${user.org.id}`} className="nav-link" style={{ fontSize: 14 }}>{user.org.name}</Link>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{user.org.id}</div>
                  </div>
                  {user.org.subscription && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                      Subscription · <span className="mono" style={{ color: user.org.subscription.status === 'active' ? 'var(--accent)' : 'var(--warn)' }}>{user.org.subscription.status}</span> · {user.org.subscription.seats} seats
                    </div>
                  )}
                  <form action={detachFromOrg}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button type="submit" className="btn btn-ghost btn-sm">Detach from org</button>
                  </form>
                </>
              ) : (
                <form action={attachToOrg} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input type="hidden" name="userId" value={user.id} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Not in an organization. Paste an org id to attach, or{' '}
                    <Link href="/staff/orgs/new" className="nav-link">create one</Link>.
                  </div>
                  <input name="orgId" placeholder="org id" required style={fieldStyle} />
                  <button type="submit" className="btn btn-ghost btn-sm">Attach</button>
                </form>
              )}
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>COMP CODES REDEEMED · {user.codeRedemptions.length}</div>
              {user.codeRedemptions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>None.</div>
              ) : user.codeRedemptions.map((r, i) => (
                <div key={r.id} style={{ padding: '6px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: 12 }}>
                  <span className="mono" style={{ color: 'var(--accent)' }}>{r.code.code}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{r.code.label ?? ''}</span>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{new Date(r.redeemedAt).toISOString().slice(0, 10)}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 6,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-elevated)', color: 'var(--text)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
};
