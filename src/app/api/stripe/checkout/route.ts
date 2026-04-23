import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { APP_URL } from '@/lib/config';
import { stripe, PLANS, priceIdForPlan, isStripeConfigured } from '@/lib/stripe';

// Creates a Stripe Checkout session and redirects the user.
// POST /api/stripe/checkout (form submission) with fields: plan, seats?
export async function POST(req: Request) {
  if (!isStripeConfigured() || !stripe) {
    return redirectBack('/checkout', 'stripe_not_configured');
  }
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(`${APP_URL}/sign-in?next=${encodeURIComponent('/checkout')}`);

  const form = await req.formData();
  const plan = String(form.get('plan') ?? '').trim();
  const seats = Math.max(5, Number(form.get('seats') ?? 5));

  const cfg = PLANS[plan];
  if (!cfg) return redirectBack('/checkout', 'unknown_plan');
  const priceId = priceIdForPlan(plan);
  if (!priceId) return redirectBack(`/checkout?plan=${encodeURIComponent(plan)}`, 'price_not_set');

  // Look up or create Stripe Customer for this user/org.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { org: true },
  });
  if (!user) return redirectBack('/checkout', 'no_user');

  let customerId: string | null = null;
  if (cfg.mode === 'subscription') {
    // Team: must attach to an org
    if (!user.orgId || !user.org) {
      return redirectBack(`/checkout?plan=Team&seats=${seats}`, 'no_org');
    }
    if (user.org.stripeCustomerId) {
      customerId = user.org.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.org.name,
        metadata: { orgId: user.org.id, userId: user.id },
      });
      await prisma.organization.update({
        where: { id: user.org.id },
        data: { stripeCustomerId: customer.id },
      });
      customerId = customer.id;
    }
  } else {
    // Individual purchase: create/find customer by email
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }
  }

  const lineItems: { price: string; quantity: number }[] = [
    { price: priceId, quantity: cfg.mode === 'subscription' ? seats : 1 },
  ];

  const checkout = await stripe.checkout.sessions.create({
    mode: cfg.mode,
    customer: customerId ?? undefined,
    line_items: lineItems,
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/checkout?plan=${encodeURIComponent(plan)}${cfg.mode === 'subscription' ? `&seats=${seats}` : ''}&canceled=1`,
    client_reference_id: session.user.id,
    allow_promotion_codes: true,
    metadata: {
      userId: session.user.id,
      orgId: user.orgId ?? '',
      plan,
      courseIds: cfg.courseIds.join(','),
      seats: String(seats),
    },
    ...(cfg.mode === 'subscription'
      ? { subscription_data: { metadata: { orgId: user.orgId ?? '', plan } } }
      : { payment_intent_data: { metadata: { userId: session.user.id, plan, courseIds: cfg.courseIds.join(',') } } }),
  });

  if (!checkout.url) return redirectBack('/checkout', 'session_no_url');
  return NextResponse.redirect(checkout.url, { status: 303 });
}

function redirectBack(path: string, err: string) {
  const sep = path.includes('?') ? '&' : '?';
  return NextResponse.redirect(`${APP_URL}${path}${sep}err=${encodeURIComponent(err)}`, { status: 303 });
}
