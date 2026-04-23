import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Logo } from '@/components/Logo';
import { Icons } from '@/components/icons';
import { findCourse } from '@/content/courses';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  const sid = searchParams?.session_id;

  // Pull the Stripe session to display what was bought; also give webhook a second to fire.
  let plan: string | null = null;
  let courseIds: number[] = [];
  let isSubscription = false;

  if (sid && isStripeConfigured() && stripe) {
    try {
      const s = await stripe.checkout.sessions.retrieve(sid);
      plan = s.metadata?.plan ?? null;
      courseIds = (s.metadata?.courseIds ?? '').split(',').filter(Boolean).map(Number);
      isSubscription = s.mode === 'subscription';
    } catch (err) {
      console.warn('[checkout/success] failed to retrieve session', err);
    }
  }

  // Check DB to see if entitlements landed; if not, show "processing" UI
  const entitlements = courseIds.length > 0
    ? await prisma.courseEntitlement.findMany({
        where: { userId: session.user.id, courseId: { in: courseIds } },
      })
    : [];
  const entitlementsLanded = entitlements.length === courseIds.length;

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        </div>

        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>PAYMENT CONFIRMED</div>
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
      </div>
    </div>
  );
}
