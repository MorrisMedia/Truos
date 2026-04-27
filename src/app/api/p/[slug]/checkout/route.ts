import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { APP_URL } from '@/lib/config';
import { stripe, PLANS, priceIdForPlan, isStripeConfigured } from '@/lib/stripe';
import { getPartnerBySlug } from '@/lib/affiliate';

// Partner-attributed Stripe Checkout.
// GET /api/p/[slug]/checkout
// - Looks up the AffiliatePartner by slug
// - Applies their coupon to the Bundle·LP price automatically
// - Marks the session metadata with partnerId so the webhook can record attribution
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.redirect(`${APP_URL}/p/${params.slug}?err=stripe_not_configured`, { status: 303 });
  }
  const partner = await getPartnerBySlug(params.slug);
  if (!partner || !partner.active) {
    return NextResponse.redirect(`${APP_URL}/?err=partner_not_found`, { status: 303 });
  }

  const plan = 'Bundle·LP';
  const cfg = PLANS[plan];
  const priceId = priceIdForPlan(plan);
  if (!cfg || !priceId) {
    return NextResponse.redirect(`${APP_URL}/p/${params.slug}?err=price_not_set`, { status: 303 });
  }

  const session = await auth();
  let customerId: string | undefined;
  let userId: string | undefined;
  if (session?.user?.id) {
    userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = existing.data[0]?.id ?? (await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      })).id;
    }
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/p/${params.slug}?canceled=1`,
    discounts: [{ coupon: partner.couponCode }],
    ...(customerId ? { customer: customerId } : { customer_creation: 'always' }),
    ...(userId ? { client_reference_id: userId } : {}),
    metadata: {
      plan,
      partnerId: partner.id,
      partnerSlug: partner.slug,
      courseIds: cfg.courseIds.join(','),
      ...(userId ? { userId } : {}),
    },
    payment_intent_data: {
      metadata: {
        plan,
        partnerId: partner.id,
        courseIds: cfg.courseIds.join(','),
        ...(userId ? { userId } : {}),
      },
    },
  });

  if (!checkout.url) {
    return NextResponse.redirect(`${APP_URL}/p/${params.slug}?err=session_no_url`, { status: 303 });
  }
  return NextResponse.redirect(checkout.url, { status: 303 });
}
