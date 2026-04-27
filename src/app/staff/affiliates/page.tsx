import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Nav } from '@/components/Nav';
import { Icons } from '@/components/icons';
import { prisma } from '@/lib/prisma';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { computePartnerPrice, formatCents, getPartnerStats } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';

async function createPartner(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('Forbidden');

  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
  const name = String(formData.get('name') ?? '').trim();
  const heroImageUrl = String(formData.get('heroImageUrl') ?? '').trim() || null;
  const heroHeadline = String(formData.get('heroHeadline') ?? '').trim() || null;
  const bio = String(formData.get('bio') ?? '').trim() || null;
  const couponCode = String(formData.get('couponCode') ?? '').trim().toUpperCase();
  const couponPercentOffRaw = String(formData.get('couponPercentOff') ?? '').trim();
  const revenueSharePct = Number(formData.get('revenueSharePct') ?? '30');
  const bundlePriceCents = 49500;

  if (!slug || !name || !couponCode) throw new Error('slug, name, and couponCode are required');
  const couponPercentOff = couponPercentOffRaw ? Math.max(0, Math.min(100, Number(couponPercentOffRaw))) : null;
  if (!couponPercentOff || couponPercentOff <= 0) throw new Error('couponPercentOff (1–100) is required');
  if (!Number.isFinite(revenueSharePct) || revenueSharePct < 0 || revenueSharePct > 100) {
    throw new Error('revenueSharePct must be 0–100');
  }

  // Create the Stripe coupon if it doesn't exist (best-effort; if it already exists with a different value, fail loudly).
  if (isStripeConfigured() && stripe) {
    try {
      const existing = await stripe.coupons.retrieve(couponCode).catch(() => null);
      if (!existing) {
        await stripe.coupons.create({ id: couponCode, name: couponCode, duration: 'once', percent_off: couponPercentOff });
        await stripe.promotionCodes.create({ coupon: couponCode, code: couponCode });
      }
    } catch (err: any) {
      throw new Error(`Stripe coupon ${couponCode} could not be created: ${err?.message ?? err}`);
    }
  }

  await prisma.affiliatePartner.create({
    data: {
      slug, name, heroImageUrl, heroHeadline, bio,
      couponCode, couponPercentOff, bundlePriceCents,
      revenueSharePct, active: true,
    },
  });
  redirect('/staff/affiliates');
}

export default async function AffiliatesPage() {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const partners = await prisma.affiliatePartner.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
  });

  const statsList = await Promise.all(partners.map((p) => getPartnerStats(p.id).then((s) => ({ partner: p, stats: s }))));

  const totals = statsList.reduce(
    (acc, { stats }) => ({
      revenue: acc.revenue + stats.totalRevenueCents,
      share: acc.share + stats.totalShareCents,
      due: acc.due + stats.dueCents,
      sales: acc.sales + stats.purchaseCount,
    }),
    { revenue: 0, share: 0, due: 0, sales: 0 },
  );

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '32px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 10 }}>STAFF · AFFILIATES</div>
            <h1 style={{ fontSize: 36, letterSpacing: '-0.025em' }}>Affiliate partners</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Each partner has a public LP at <span className="mono">/p/&lt;slug&gt;</span> and a Stripe coupon auto-applied at checkout.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/staff" className="btn btn-ghost btn-sm">← Overview</Link>
            <Link href="#new" className="btn btn-primary btn-sm">+ Add partner</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            <Kpi label="ATTRIBUTED REVENUE" value={formatCents(totals.revenue)} />
            <Kpi label="SHARE TO PARTNERS" value={formatCents(totals.share)} />
            <Kpi label="PAYOUT DUE" value={formatCents(totals.due)} accent />
            <Kpi label="SALES" value={totals.sales.toString()} />
          </div>

          {partners.length === 0 ? (
            <div className="panel" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No partners yet. <Link href="#new" style={{ color: 'var(--accent)' }}>Add the first one →</Link>
            </div>
          ) : (
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-strong)' }}>
                    {['Partner', 'Slug · Code', 'Discount', 'Share %', 'Sales', 'Revenue', 'Owed', ''].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statsList.map(({ partner, stats }) => {
                    const price = computePartnerPrice(partner);
                    return (
                      <tr key={partner.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 500 }}>{partner.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{partner.active ? '' : 'INACTIVE · '}created {partner.createdAt.toISOString().slice(0, 10)}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          <div>/p/{partner.slug}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{partner.couponCode}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{price.discountLabel || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatCents(price.regularCents)} → {formatCents(price.finalCents)}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{partner.revenueSharePct}%</td>
                        <td style={{ padding: '14px 16px' }}>{stats.purchaseCount}</td>
                        <td style={{ padding: '14px 16px' }}>{formatCents(stats.totalRevenueCents)}</td>
                        <td style={{ padding: '14px 16px', color: stats.dueCents > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {formatCents(stats.dueCents)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <Link href={`/staff/affiliates/${partner.id}`} className="btn btn-ghost btn-sm">Open {Icons.arrow}</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div id="new" className="panel" style={{ padding: 28, marginTop: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>+ NEW PARTNER</div>
            <form action={createPartner} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Field label="SLUG (URL: /p/<slug>)" hint="lowercase, hyphens only">
                <input name="slug" required placeholder="joerogan" style={fieldStyle} />
              </Field>
              <Field label="PARTNER NAME">
                <input name="name" required placeholder="Joe Rogan" style={fieldStyle} />
              </Field>
              <Field label="HERO IMAGE URL" hint="optional — falls back to initials">
                <input name="heroImageUrl" placeholder="https://truos.ai/p/joerogan/hero.jpg" style={fieldStyle} />
              </Field>
              <Field label="HERO HEADLINE" hint="optional">
                <input name="heroHeadline" placeholder="Joe's listeners get the full credential stack at a special price." style={fieldStyle} />
              </Field>
              <Field label="BIO LINE" hint="optional, shown under headline">
                <input name="bio" placeholder="A 4-credential AI track designed for working professionals — endorsed by Joe." style={fieldStyle} />
              </Field>
              <Field label="COUPON CODE" hint="created in Stripe if missing">
                <input name="couponCode" required placeholder="JOEROGAN" style={fieldStyle} />
              </Field>
              <Field label="DISCOUNT %" hint="1–100, applied to $495 bundle">
                <input name="couponPercentOff" type="number" min={1} max={100} required placeholder="50" style={fieldStyle} />
              </Field>
              <Field label="REVENUE SHARE %" hint="paid to partner of net revenue">
                <input name="revenueSharePct" type="number" min={0} max={100} defaultValue={30} required style={fieldStyle} />
              </Field>
              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary">Create partner {Icons.arrow}</button>
                <span style={{ marginLeft: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  Stripe coupon + promotion code will be created if they don&rsquo;t already exist.
                </span>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel" style={{ padding: 18 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{hint}</span>}
    </label>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-panel)',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
};
