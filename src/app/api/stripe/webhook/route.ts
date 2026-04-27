import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe, PLANS } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';
import { accessGrantedEmail } from '@/lib/emails/templates';
import { computeShareCents } from '@/lib/affiliate';

export const runtime = 'nodejs';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(req: Request) {
  if (!stripe || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (e: any) {
    console.error('[stripe] bad signature', e?.message);
    return NextResponse.json({ error: 'bad_signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // no-op; we only care about these events
        break;
    }
  } catch (err: any) {
    console.error('[stripe] webhook handler error', event.type, err?.message);
    return NextResponse.json({ error: 'handler_failed', message: err?.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(s: Stripe.Checkout.Session) {
  const userId = s.metadata?.userId || s.client_reference_id;
  const plan = s.metadata?.plan;
  const partnerId = s.metadata?.partnerId;
  const courseIds = (s.metadata?.courseIds ?? '').split(',').filter(Boolean).map(Number);

  // Affiliate attribution — fire regardless of whether userId is present yet.
  if (partnerId && s.payment_status === 'paid') {
    try {
      const partner = await prisma.affiliatePartner.findUnique({ where: { id: partnerId } });
      if (partner) {
        const amount = s.amount_total ?? 0;
        const share = computeShareCents(amount, partner.revenueSharePct);
        await prisma.affiliateAttribution.upsert({
          where: { stripeSessionId: s.id },
          create: {
            partnerId,
            userId: userId ?? null,
            stripeSessionId: s.id,
            amountCents: amount,
            shareCents: share,
            status: 'purchase',
          },
          update: {
            userId: userId ?? null,
            amountCents: amount,
            shareCents: share,
            status: 'purchase',
          },
        });
      }
    } catch (err) {
      console.error('[stripe] affiliate attribution failed', err);
    }
  }

  if (s.mode === 'payment' && userId) {
    // One-time course purchase
    const amount = s.amount_total ?? 0;
    const paymentIntent = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null;

    const purchase = await prisma.purchase.upsert({
      where: { stripeCheckoutSessionId: s.id },
      create: {
        userId,
        courseIds,
        amount,
        currency: s.currency ?? 'usd',
        stripePaymentIntentId: paymentIntent,
        stripeCheckoutSessionId: s.id,
        status: 'completed',
        paidAt: new Date(),
      },
      update: {
        status: 'completed',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent,
      },
    });

    // Grant entitlements (idempotent via upsert)
    for (const cid of courseIds) {
      await prisma.courseEntitlement.upsert({
        where: { userId_courseId_source: { userId, courseId: cid, source: 'purchase' } },
        create: { userId, courseId: cid, source: 'purchase', sourceId: purchase.id },
        update: { sourceId: purchase.id, expiresAt: null },
      });
    }

    // Fire an access-granted email per course (with a purchase note)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user) {
      for (const cid of courseIds) {
        sendEmail({
          to: user.email,
          userId,
          kind: 'access_granted',
          payload: accessGrantedEmail({ name: user.name ?? null, userId, courseId: cid, note: plan ? `Purchased: ${plan}` : undefined }),
        }).catch(err => console.error('[email] purchase access_granted failed', err));
      }
    }
    return;
  }

  if (s.mode === 'subscription') {
    const subscriptionId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
    if (!subscriptionId) return;
    const fullSub = await stripe!.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpsert(fullSub);
  }
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const orgId = sub.metadata?.orgId;
  if (!orgId) {
    console.warn('[stripe] subscription without orgId metadata', sub.id);
    return;
  }
  const item = sub.items.data[0];
  const seats = item?.quantity ?? 0;
  const priceId = item?.price.id ?? '';
  const currentPeriodEnd = new Date(sub.current_period_end * 1000);

  await prisma.subscription.upsert({
    where: { orgId },
    create: {
      orgId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      seats,
      status: sub.status,
      currentPeriodEnd,
    },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      seats,
      status: sub.status,
      currentPeriodEnd,
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const orgId = sub.metadata?.orgId;
  if (!orgId) return;
  await prisma.subscription.updateMany({
    where: { orgId, stripeSubscriptionId: sub.id },
    data: { status: 'canceled' },
  });
}
