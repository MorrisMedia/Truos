import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { Nav } from '@/components/Nav';
import { Icons } from '@/components/icons';
import { prisma } from '@/lib/prisma';
import { computePartnerPrice, formatCents, getPartnerById, getPartnerStats } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';

async function recordPayout(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('Forbidden');

  const partnerId = String(formData.get('partnerId') ?? '');
  const totalCents = Math.round(Number(formData.get('totalDollars') ?? '0') * 100);
  const method = String(formData.get('method') ?? 'check').trim();
  const reference = String(formData.get('reference') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!partnerId || totalCents <= 0) throw new Error('partnerId and totalDollars > 0 are required');

  // Mark all unpaid attributions as paid until we hit totalCents.
  const unpaid = await prisma.affiliateAttribution.findMany({
    where: { partnerId, status: 'purchase' },
    orderBy: { createdAt: 'asc' },
  });
  let remaining = totalCents;
  const covered: string[] = [];
  for (const a of unpaid) {
    if (remaining <= 0) break;
    if (a.shareCents <= remaining) {
      covered.push(a.id);
      remaining -= a.shareCents;
    } else {
      break;
    }
  }

  const payout = await prisma.affiliatePayout.create({
    data: {
      partnerId,
      totalCents,
      attributionCount: covered.length,
      paidAt: new Date(),
      method,
      reference,
      notes,
    },
  });

  if (covered.length > 0) {
    await prisma.affiliateAttribution.updateMany({
      where: { id: { in: covered } },
      data: { status: 'paid', paidAt: new Date(), payoutId: payout.id },
    });
  }

  revalidatePath(`/staff/affiliates/${partnerId}`);
}

async function togglePartner(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('Forbidden');
  const partnerId = String(formData.get('partnerId') ?? '');
  if (!partnerId) throw new Error('missing partnerId');
  const p = await prisma.affiliatePartner.findUnique({ where: { id: partnerId } });
  if (!p) throw new Error('not found');
  await prisma.affiliatePartner.update({ where: { id: partnerId }, data: { active: !p.active } });
  revalidatePath(`/staff/affiliates/${partnerId}`);
  revalidatePath('/staff/affiliates');
}

export default async function PartnerDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const partner = await getPartnerById(params.id);
  if (!partner) notFound();
  const stats = await getPartnerStats(partner.id);
  const price = computePartnerPrice(partner);

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '28px 0 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link href="/staff/affiliates" className="nav-link" style={{ fontSize: 12 }}>← All partners</Link>
            <h1 style={{ fontSize: 32, letterSpacing: '-0.025em', marginTop: 8 }}>{partner.name}</h1>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)', marginTop: 6, flexWrap: 'wrap' }}>
              <span className="mono">/p/{partner.slug}</span>
              <span>·</span>
              <span className="mono">code: {partner.couponCode}</span>
              <span>·</span>
              <span>{price.discountLabel} ({formatCents(price.regularCents)} → {formatCents(price.finalCents)})</span>
              <span>·</span>
              <span>{partner.revenueSharePct}% revenue share</span>
              {!partner.active && <span style={{ color: 'var(--warn)' }}>· INACTIVE</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/p/${partner.slug}`} target="_blank" className="btn btn-ghost btn-sm">View LP {Icons.arrow}</Link>
            <form action={togglePartner}>
              <input type="hidden" name="partnerId" value={partner.id} />
              <button className="btn btn-ghost btn-sm" type="submit">{partner.active ? 'Deactivate' : 'Activate'}</button>
            </form>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
            <Kpi label="SALES" value={stats.purchaseCount.toString()} />
            <Kpi label="GROSS REVENUE" value={formatCents(stats.totalRevenueCents)} />
            <Kpi label="EARNED SHARE" value={formatCents(stats.totalShareCents)} />
            <Kpi label="PAID OUT" value={formatCents(stats.paidOutCents)} />
            <Kpi label="DUE" value={formatCents(stats.dueCents)} accent={stats.dueCents > 0} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="panel" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>RECENT ATTRIBUTIONS</div>
              {partner.attributions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No purchases yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                      <th style={thStyle}>DATE</th>
                      <th style={thStyle}>USER</th>
                      <th style={thStyle}>AMOUNT</th>
                      <th style={thStyle}>SHARE</th>
                      <th style={thStyle}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partner.attributions.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle}>{a.createdAt.toISOString().slice(0, 10)}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{a.userId ? a.userId.slice(0, 8) : '—'}</td>
                        <td style={tdStyle}>{formatCents(a.amountCents)}</td>
                        <td style={tdStyle}>{formatCents(a.shareCents)}</td>
                        <td style={{ ...tdStyle, color: a.status === 'paid' ? 'var(--text-muted)' : 'var(--accent)' }}>{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="panel" style={{ padding: 22 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>RECORD PAYOUT</div>
                <form action={recordPayout} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input type="hidden" name="partnerId" value={partner.id} />
                  <Field label="AMOUNT (USD)">
                    <input name="totalDollars" type="number" step="0.01" min={0} max={(stats.dueCents / 100).toFixed(2)} defaultValue={(stats.dueCents / 100).toFixed(2)} required style={fieldStyle} />
                  </Field>
                  <Field label="METHOD">
                    <select name="method" defaultValue="check" style={fieldStyle}>
                      <option value="check">Check</option>
                      <option value="wire">Wire</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe_transfer">Stripe transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="REFERENCE / TXID (OPTIONAL)">
                    <input name="reference" style={fieldStyle} />
                  </Field>
                  <Field label="NOTES (OPTIONAL)">
                    <textarea name="notes" rows={2} style={fieldStyle} />
                  </Field>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 6 }}>Mark paid {Icons.arrow}</button>
                </form>
              </div>

              <div className="panel" style={{ padding: 22 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>PAST PAYOUTS</div>
                {partner.payouts.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>None yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {partner.payouts.map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div>{formatCents(p.totalCents)} · {p.method}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.paidAt.toISOString().slice(0, 10)} · {p.attributionCount} sales · {p.reference ?? '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel" style={{ padding: 16 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 6px', textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-muted)' };
const tdStyle: React.CSSProperties = { padding: '10px 6px' };
const fieldStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-panel)',
  color: 'var(--text)',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
};
