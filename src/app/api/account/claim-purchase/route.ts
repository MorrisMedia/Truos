import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signIn } from '@/lib/auth';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { APP_URL } from '@/lib/config';
import { sendEmail } from '@/lib/email';
import { welcomeEmail, accessGrantedEmail } from '@/lib/emails/templates';

// Claims a paid Stripe Checkout session by creating (or attaching to) a Truos user account.
// POST /api/account/claim-purchase  (form fields: session_id, password, name?)
export async function POST(req: Request) {
  if (!isStripeConfigured() || !stripe) {
    return back('/checkout/success', 'stripe_not_configured');
  }
  const form = await req.formData();
  const sessionId = String(form.get('session_id') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const name = String(form.get('name') ?? '').trim() || null;

  if (!sessionId) return back('/start', 'missing_session');
  if (password.length < 8) return back(`/checkout/success?session_id=${encodeURIComponent(sessionId)}`, 'short_password');

  const s = await stripe.checkout.sessions.retrieve(sessionId);
  if (s.payment_status !== 'paid') {
    return back(`/checkout/success?session_id=${encodeURIComponent(sessionId)}`, 'unpaid');
  }
  const email = (s.customer_details?.email ?? s.customer_email ?? '').trim().toLowerCase();
  if (!email) return back(`/checkout/success?session_id=${encodeURIComponent(sessionId)}`, 'no_email');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return back(`/sign-in?next=${encodeURIComponent(`/checkout/success?session_id=${sessionId}`)}`, 'account_exists');
  }

  const courseIds = (s.metadata?.courseIds ?? '').split(',').filter(Boolean).map(Number);
  const plan = s.metadata?.plan ?? null;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });

  const paymentIntent = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null;
  const purchase = await prisma.purchase.upsert({
    where: { stripeCheckoutSessionId: s.id },
    create: {
      userId: user.id,
      courseIds,
      amount: s.amount_total ?? 0,
      currency: s.currency ?? 'usd',
      stripePaymentIntentId: paymentIntent,
      stripeCheckoutSessionId: s.id,
      status: 'completed',
      paidAt: new Date(),
    },
    update: {
      userId: user.id,
      status: 'completed',
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntent,
    },
  });

  for (const cid of courseIds) {
    await prisma.courseEntitlement.upsert({
      where: { userId_courseId_source: { userId: user.id, courseId: cid, source: 'purchase' } },
      create: { userId: user.id, courseId: cid, source: 'purchase', sourceId: purchase.id },
      update: { sourceId: purchase.id, expiresAt: null },
    });
  }

  // Backfill the Stripe session/customer with the new userId so the webhook (and Stripe dashboard) can correlate.
  try {
    await stripe.checkout.sessions.update(s.id, { metadata: { ...(s.metadata ?? {}), userId: user.id } });
    if (typeof s.customer === 'string') {
      await stripe.customers.update(s.customer, { metadata: { userId: user.id } });
    }
  } catch (err) {
    console.warn('[claim] stripe metadata backfill failed', err);
  }

  sendEmail({
    to: user.email,
    userId: user.id,
    kind: 'welcome',
    payload: welcomeEmail({ name: user.name, userId: user.id }),
  }).catch(err => console.error('[email] welcome failed', err));

  for (const cid of courseIds) {
    sendEmail({
      to: user.email,
      userId: user.id,
      kind: 'access_granted',
      payload: accessGrantedEmail({ name: user.name, userId: user.id, courseId: cid, note: plan ? `Purchased: ${plan}` : undefined }),
    }).catch(err => console.error('[email] access_granted failed', err));
  }

  await signIn('credentials', { email, password, redirect: false });
  return NextResponse.redirect(`${APP_URL}/dashboard?welcome=1`, { status: 303 });
}

function back(path: string, err: string) {
  const sep = path.includes('?') ? '&' : '?';
  return NextResponse.redirect(`${APP_URL}${path}${sep}err=${encodeURIComponent(err)}`, { status: 303 });
}
