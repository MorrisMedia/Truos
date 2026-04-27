import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Logo } from '@/components/Logo';
import { Icons } from '@/components/icons';
import { findCourse } from '@/content/courses';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const ERR_MSG: Record<string, string> = {
  short_password: 'Password must be at least 8 characters.',
  unpaid: 'We could not verify payment yet. Please try again in a moment.',
  no_email: 'No email on the payment session — contact hello@truos.ai.',
  account_exists: 'An account with that email already exists. Sign in to claim your purchase.',
  stripe_not_configured: 'Payments are temporarily unavailable.',
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { session_id?: string; err?: string } }) {
  const session = await auth();
  const sid = searchParams?.session_id;

  let plan: string | null = null;
  let courseIds: number[] = [];
  let isSubscription = false;
  let stripeEmail: string | null = null;
  let paymentStatus: string | null = null;

  if (sid && isStripeConfigured() && stripe) {
    try {
      const s = await stripe.checkout.sessions.retrieve(sid);
      plan = s.metadata?.plan ?? null;
      courseIds = (s.metadata?.courseIds ?? '').split(',').filter(Boolean).map(Number);
      isSubscription = s.mode === 'subscription';
      stripeEmail = s.customer_details?.email ?? s.customer_email ?? null;
      paymentStatus = s.payment_status ?? null;
    } catch (err) {
      console.warn('[checkout/success] failed to retrieve session', err);
    }
  }

  // Anonymous post-purchase: prompt them to set up an account using the email Stripe captured.
  if (!session?.user) {
    if (!sid || paymentStatus !== 'paid' || !stripeEmail) {
      // No valid paid session to claim — bounce them to sign-in.
      return (
        <Centered>
          <Logo />
          <h1 style={{ fontSize: 32, marginTop: 32, marginBottom: 12 }}>Sign in to access your purchase</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>If you just paid, sign in with the email you used at checkout.</p>
          <Link className="btn btn-primary btn-lg" href="/sign-in">Sign in {Icons.arrow}</Link>
        </Centered>
      );
    }
    const errMsg = searchParams.err ? ERR_MSG[searchParams.err] ?? 'Something went wrong. Please try again.' : null;
    return (
      <Centered>
        <Logo />
        <div className="eyebrow" style={{ color: 'var(--accent)', marginTop: 32, marginBottom: 12 }}>PAYMENT CONFIRMED · STEP 2 OF 2</div>
        <h1 style={{ fontSize: 36, letterSpacing: '-0.025em', marginBottom: 8 }}>Set a password to unlock your courses</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
          We've collected payment for <strong style={{ color: 'var(--text)' }}>{stripeEmail}</strong>.
          Set a password and you'll be in.
        </p>

        {errMsg && (
          <div style={{ background: 'color-mix(in oklab, var(--warn) 10%, var(--bg-panel))', border: '1px solid var(--warn)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14, textAlign: 'left' }}>
            {errMsg}
            {searchParams.err === 'account_exists' && (
              <> <Link href={`/sign-in?next=${encodeURIComponent(`/checkout/success?session_id=${sid}`)}`} style={{ color: 'var(--accent)' }}>Sign in to claim →</Link></>
            )}
          </div>
        )}

        <form action="/api/account/claim-purchase" method="post" style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
          <input type="hidden" name="session_id" value={sid} />
          <Field label="EMAIL">
            <input value={stripeEmail} readOnly disabled style={{ ...fieldStyle, color: 'var(--text-muted)' }} />
          </Field>
          <Field label="YOUR NAME (OPTIONAL)">
            <input name="name" type="text" placeholder="Avery Chen" style={fieldStyle} />
          </Field>
          <Field label="SET PASSWORD">
            <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" style={fieldStyle} autoFocus />
          </Field>
          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
            Activate access {Icons.arrow}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 28 }}>
          Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(`/checkout/success?session_id=${sid}`)}`} style={{ color: 'var(--accent)' }}>Sign in to claim</Link>
        </p>
      </Centered>
    );
  }

  // Signed-in user: existing UX.
  const entitlements = courseIds.length > 0
    ? await prisma.courseEntitlement.findMany({
        where: { userId: session.user.id, courseId: { in: courseIds } },
      })
    : [];
  const entitlementsLanded = entitlements.length === courseIds.length;

  return (
    <Centered>
      <Logo />
      <div className="eyebrow" style={{ color: 'var(--accent)', marginTop: 32, marginBottom: 16 }}>PAYMENT CONFIRMED</div>
      <h1 style={{ fontSize: 42, letterSpacing: '-0.025em', marginBottom: 16 }}>You're in.</h1>

      {isSubscription ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 28 }}>
          Your team subscription is active. Every seat on your org now has access to all of Truos and Truos+.
        </p>
      ) : courseIds.length > 0 ? (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 24 }}>
            {entitlementsLanded
              ? 'Your courses are unlocked. Jump in whenever.'
              : "Payment confirmed. We're activating your access — refresh this page in a few seconds."}
          </p>
          <div className="panel" style={{ padding: 20, marginBottom: 24, textAlign: 'left' }}>
            {courseIds.map(cid => {
              const c = findCourse(cid);
              return (
                <div key={cid} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>{c?.code}</div>
                    <div style={{ fontSize: 15, marginTop: 2 }}>{c?.title}</div>
                  </div>
                  <Link className="btn btn-ghost btn-sm" href={`/courses/${cid}`}>Open {Icons.arrow}</Link>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          Payment received. Your access is being provisioned.
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link className="btn btn-primary" href="/dashboard">Go to dashboard {Icons.arrow}</Link>
        <Link className="btn btn-ghost" href="/account">View purchases</Link>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 28 }}>
        A receipt is on its way to <span className="mono">{session.user.email}</span>.
        Questions? <a href="mailto:hello@truos.ai" style={{ color: 'var(--accent)' }}>hello@truos.ai</a>
      </p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-panel)',
  color: 'var(--text)',
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
};
