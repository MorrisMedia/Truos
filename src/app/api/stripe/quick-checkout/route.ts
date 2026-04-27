import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { APP_URL } from '@/lib/config';
import { stripe, PLANS, priceIdForPlan, isStripeConfigured } from '@/lib/stripe';

// Anonymous (or signed-in) one-click checkout.
// GET /api/stripe/quick-checkout?plan=Bundle·LP&ref=start
//
// Skips the in-app checkout/sign-in interstitial and goes straight to Stripe.
// If signed in, the session is attached to the user (existing /api/stripe/checkout flow).
// If anonymous, Stripe collects an email and the user creates their account on /checkout/success.
export async function GET(req: Request) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.redirect(`${APP_URL}/start?err=stripe_not_configured`, { status: 303 });
  }

  const url = new URL(req.url);
  const plan = (url.searchParams.get('plan') ?? 'Bundle·LP').trim();
  const ref = url.searchParams.get('ref') ?? '';

  const cfg = PLANS[plan];
  if (!cfg) return NextResponse.redirect(`${APP_URL}/start?err=unknown_plan`, { status: 303 });
  if (cfg.mode === 'subscription') {
    return NextResponse.redirect(`${APP_URL}/checkout?plan=${encodeURIComponent(plan)}`, { status: 303 });
  }
  const priceId = priceIdForPlan(plan);
  if (!priceId) return NextResponse.redirect(`${APP_URL}/start?err=price_not_set`, { status: 303 });

  const session = await auth();
  let customerId: string | undefined;
  let userId: string | undefined;
  let userEmail: string | undefined;

  if (session?.user?.id) {
    userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      userEmail = user.email;
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
    cancel_url: `${APP_URL}/start?canceled=1`,
    allow_promotion_codes: true,
    ...(customerId ? { customer: customerId } : { customer_creation: 'always' }),
    ...(userId ? { client_reference_id: userId } : {}),
    metadata: {
      plan,
      ref,
      courseIds: cfg.courseIds.join(','),
      ...(userId ? { userId } : {}),
    },
    payment_intent_data: {
      metadata: {
        plan,
        courseIds: cfg.courseIds.join(','),
        ...(userId ? { userId } : {}),
      },
    },
  });

  if (!checkout.url) {
    return NextResponse.redirect(`${APP_URL}/start?err=session_no_url`, { status: 303 });
  }
  return NextResponse.redirect(checkout.url, { status: 303 });
}
