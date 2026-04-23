import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export const dynamic = 'force-dynamic';

async function renameOrg(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const id = String(formData.get('id'));
  const name = String(formData.get('name') ?? '').trim();
  if (!id || !name) return;
  await prisma.organization.update({ where: { id }, data: { name } });
  revalidatePath(`/staff/orgs/${id}`);
}

async function addMember(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const orgId = String(formData.get('orgId'));
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No user found with email ${email}. User must sign up first.`);
  await prisma.user.update({ where: { id: user.id }, data: { orgId } });
  revalidatePath(`/staff/orgs/${orgId}`);
}

async function removeMember(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const userId = String(formData.get('userId'));
  const orgId = String(formData.get('orgId'));
  await prisma.user.update({ where: { id: userId }, data: { orgId: null } });
  revalidatePath(`/staff/orgs/${orgId}`);
}

async function upsertSubscription(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const orgId = String(formData.get('orgId'));
  const seats = Math.max(1, Number(formData.get('seats') ?? 5));
  const status = String(formData.get('status') ?? 'active');
  const daysValid = Math.max(1, Number(formData.get('daysValid') ?? 30));
  const priceId = String(formData.get('priceId') ?? 'manual');

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setUTCDate(currentPeriodEnd.getUTCDate() + daysValid);

  const existing = await prisma.subscription.findUnique({ where: { orgId } });
  if (existing) {
    await prisma.subscription.update({
      where: { orgId },
      data: { seats, status, currentPeriodEnd, stripePriceId: priceId },
    });
  } else {
    await prisma.subscription.create({
      data: {
        orgId,
        stripeSubscriptionId: `manual_${orgId}_${Date.now()}`,
        stripePriceId: priceId,
        seats,
        status,
        currentPeriodEnd,
      },
    });
  }
  revalidatePath(`/staff/orgs/${orgId}`);
}

async function cancelSubscription(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const orgId = String(formData.get('orgId'));
  await prisma.subscription.update({
    where: { orgId },
    data: { status: 'canceled', currentPeriodEnd: new Date() },
  }).catch(() => undefined);
  revalidatePath(`/staff/orgs/${orgId}`);
}

export default async function StaffOrgDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const org = await prisma.organization.findUnique({
    where: { id: params.id },
    include: {
      members: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, email: true, name: true, createdAt: true },
      },
      subscription: true,
    },
  });

  if (!org) notFound();

  const sub = org.subscription;

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/staff/orgs" className="nav-link" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icons.arrowLeft} All organizations
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 36, letterSpacing: '-0.025em' }}>{org.name}</h1>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                {org.id} · Created {new Date(org.createdAt).toISOString().slice(0, 10)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 48px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Members */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>MEMBERS · {org.members.length}{sub ? ` / ${sub.seats} SEATS` : ''}</div>
              {org.members.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No members yet. Add one from the panel on the right.</div>
              ) : org.members.map((m, i) => (
                <div key={m.id} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: 12, alignItems: 'center', fontSize: 13 }}>
                  <div>
                    <Link href={`/staff/users/${m.id}`} className="nav-link">{m.name ?? m.email}</Link>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {new Date(m.createdAt).toISOString().slice(0, 10)}
                  </span>
                  <form action={removeMember}>
                    <input type="hidden" name="userId" value={m.id} />
                    <input type="hidden" name="orgId" value={org.id} />
                    <button type="submit" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Remove</button>
                  </form>
                </div>
              ))}
            </div>

            {/* Subscription */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>SUBSCRIPTION</div>
              {sub ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Status · <span className="mono" style={{ color: sub.status === 'active' ? 'var(--accent)' : 'var(--warn)' }}>{sub.status}</span><br />
                  Seats · <span className="mono">{sub.seats}</span><br />
                  Price id · <span className="mono">{sub.stripePriceId}</span><br />
                  Current period end · <span className="mono">{new Date(sub.currentPeriodEnd).toISOString().slice(0, 10)}</span><br />
                  Sub id · <span className="mono" style={{ fontSize: 11 }}>{sub.stripeSubscriptionId}</span>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  No subscription. Members have no access to paid courses unless they have individual entitlements.
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>RENAME ORG</div>
              <form action={renameOrg} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="hidden" name="id" value={org.id} />
                <input name="name" defaultValue={org.name} required style={fieldStyle} />
                <button type="submit" className="btn btn-ghost btn-sm">Save</button>
              </form>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>ADD MEMBER BY EMAIL</div>
              <form action={addMember} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="hidden" name="orgId" value={org.id} />
                <input name="email" type="email" placeholder="user@company.com" required style={fieldStyle} />
                <button type="submit" className="btn btn-primary btn-sm">Add member {Icons.arrow}</button>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  User must have an account already. If they're in another org, they'll be moved here.
                </div>
              </form>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{sub ? 'UPDATE SUBSCRIPTION' : 'GRANT MANUAL SUBSCRIPTION'}</div>
              <form action={upsertSubscription} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="hidden" name="orgId" value={org.id} />
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>SEATS</span>
                  <input name="seats" type="number" min="1" defaultValue={sub?.seats ?? 5} style={fieldStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>STATUS</span>
                  <select name="status" defaultValue={sub?.status ?? 'active'} style={fieldStyle}>
                    <option value="active">active</option>
                    <option value="trialing">trialing</option>
                    <option value="past_due">past_due</option>
                    <option value="canceled">canceled</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>DAYS VALID FROM NOW</span>
                  <input name="daysValid" type="number" min="1" defaultValue={30} style={fieldStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>PRICE ID (OR "MANUAL")</span>
                  <input name="priceId" defaultValue={sub?.stripePriceId ?? 'manual'} style={fieldStyle} />
                </label>
                <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 4 }}>
                  {sub ? 'Update' : 'Grant subscription'} {Icons.arrow}
                </button>
              </form>
              {sub && sub.status !== 'canceled' && (
                <form action={cancelSubscription} style={{ marginTop: 10 }}>
                  <input type="hidden" name="orgId" value={org.id} />
                  <button type="submit" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', width: '100%' }}>Cancel subscription</button>
                </form>
              )}
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
