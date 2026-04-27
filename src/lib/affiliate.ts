import { prisma } from './prisma';

export interface PartnerPrice {
  regularCents: number;
  finalCents: number;
  discountCents: number;
  discountLabel: string; // "50% off" or "$200 off"
}

export function computePartnerPrice(p: {
  bundlePriceCents: number;
  couponPercentOff: number | null;
  couponAmountOffCents: number | null;
}): PartnerPrice {
  const regularCents = p.bundlePriceCents;
  let discountCents = 0;
  let discountLabel = '';
  if (p.couponPercentOff != null && p.couponPercentOff > 0) {
    discountCents = Math.round((regularCents * p.couponPercentOff) / 100);
    discountLabel = `${p.couponPercentOff}% off`;
  } else if (p.couponAmountOffCents != null && p.couponAmountOffCents > 0) {
    discountCents = p.couponAmountOffCents;
    discountLabel = `${formatCents(discountCents)} off`;
  }
  const finalCents = Math.max(0, regularCents - discountCents);
  return { regularCents, finalCents, discountCents, discountLabel };
}

export function computeShareCents(amountCents: number, sharePct: number): number {
  return Math.floor((amountCents * sharePct) / 100);
}

export function formatCents(c: number): string {
  return `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: c % 100 === 0 ? 0 : 2 })}`;
}

export async function getPartnerBySlug(slug: string) {
  if (!slug) return null;
  return prisma.affiliatePartner.findUnique({ where: { slug } });
}

export async function getPartnerById(id: string) {
  return prisma.affiliatePartner.findUnique({
    where: { id },
    include: {
      attributions: { orderBy: { createdAt: 'desc' }, take: 200 },
      payouts: { orderBy: { paidAt: 'desc' } },
    },
  });
}

export async function getPartnerStats(partnerId: string) {
  const [agg, paidAgg, refunded] = await Promise.all([
    prisma.affiliateAttribution.aggregate({
      where: { partnerId, status: { in: ['purchase', 'paid'] } },
      _sum: { amountCents: true, shareCents: true },
      _count: true,
    }),
    prisma.affiliateAttribution.aggregate({
      where: { partnerId, status: 'paid' },
      _sum: { shareCents: true },
    }),
    prisma.affiliateAttribution.aggregate({
      where: { partnerId, status: 'refunded' },
      _sum: { amountCents: true },
      _count: true,
    }),
  ]);
  const totalRevenueCents = agg._sum.amountCents ?? 0;
  const totalShareCents = agg._sum.shareCents ?? 0;
  const paidOutCents = paidAgg._sum.shareCents ?? 0;
  const dueCents = totalShareCents - paidOutCents;
  return {
    purchaseCount: agg._count,
    totalRevenueCents,
    totalShareCents,
    paidOutCents,
    dueCents,
    refundedCount: refunded._count,
    refundedAmountCents: refunded._sum.amountCents ?? 0,
  };
}
