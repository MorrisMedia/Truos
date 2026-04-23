import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Icons } from '@/components/icons';
import { isStripeConfigured, priceIdForPlan } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const PLAN_INFO: Record<string, { name: string; unit: string; recurring: boolean; basePrice: number; desc: string }> = {
  'Team':     { name: 'Team subscription',              unit: '$99/seat/mo',     recurring: true,  basePrice: 99,   desc: 'Monthly per seat. All base courses + full Truos+ suite. Min 5 seats.' },
  'Bundle':   { name: 'AI·102 + AI·103 + AI·104',       unit: '$2,497 one-time', recurring: false, basePrice: 2497, desc: 'All three paid base courses, lifetime access. Save $500 vs buying individually.' },
  'AI·102':   { name: 'AI·102 — Practical Prompting',   unit: '$499 one-time',   recurring: false, basePrice: 499,  desc: 'Lifetime access. 24 lessons, ~4 hours.' },
  'AI·103':   { name: 'AI·103 — AI at Work',            unit: '$999 one-time',   recurring: false, basePrice: 999,  desc: 'Lifetime access. 32 lessons, ~6 hours.' },
  'AI·104':   { name: 'AI·104 — The Truos Capstone',    unit: '$1,499 one-time', recurring: false, basePrice: 1499, desc: 'Lifetime access. 40 lessons, ~10 hours. Includes capstone project.' },
  'CPLT·101': { name: 'Copilot 101',                    unit: '$249 one-time',   recurring: false, basePrice: 249,  desc: 'Truos+ standalone. Lifetime. 20 lessons, ~2.5 hours.' },
  'CPLT·EXL': { name: 'Copilot + Excel',                unit: '$249 one-time',   recurring: false, basePrice: 249,  desc: 'Truos+ standalone. Lifetime. 12 lessons, ~1.5 hours.' },
};

export default async function CheckoutPage({ searchParams }: { searchParams: { plan?: string; seats?: string; err?: string; canceled?: string } }) {
  const plan = searchParams.plan && PLAN_INFO[searchParams.plan] ? searchParams.plan : 'Team';
  const info = PLAN_INFO[plan];
  const isTeam = plan === 'Team';
  const seats = Math.max(5, Number(searchParams.seats ?? '10'));
  const total = isTeam ? seats * info.basePrice : info.basePrice;

  const session = await auth();
  const stripeReady = isStripeConfigured();
  const priceSet = !!priceIdForPlan(plan);
  const canCheckout = stripeReady && priceSet;

  const errMsg = (() => {
    if (!searchParams.err && !searchParams.canceled) return null;
    if (searchParams.canceled) return 'Checkout canceled — no charge.';
    switch (searchParams.err) {
      case 'stripe_not_configured': return 'Payments aren\'t turned on yet. Email hello@truos.ai to get set up.';
      case 'price_not_set':         return 'This plan\'s price is still being configured. Please try again shortly.';
      case 'no_org':                return 'Team plans require an organization. Sign up, create an org, then come back.';
      default:                      return 'Checkout could not start. Please try again.';
    }
  })();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: summary */}
      <div style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', padding: '56px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <Link className="btn btn-ghost btn-sm" href="/">{Icons.arrowLeft} Back</Link>
          <Logo />
        </div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          {info.recurring ? 'SUBSCRIBE TO TRUOS' : 'UNLOCK FOREVER'}
        </div>
        <div style={{ fontSize: 40, letterSpacing: '-0.03em', marginBottom: 8 }}>${total.toLocaleString()}.00</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>
          {info.recurring ? 'per month, billed monthly' : 'one-time payment · lifetime access'}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14 }}>
            <div>
              <div>{info.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.unit}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, maxWidth: 320 }}>{info.desc}</div>
            </div>
            <div>${total.toLocaleString()}.00</div>
          </div>
          {isTeam && (
            <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>SEATS</div>
              <form action="/checkout" method="GET" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="hidden" name="plan" value="Team" />
                <button formAction={`/checkout?plan=Team&seats=${Math.max(5, seats - 1)}`} className="btn btn-ghost btn-sm">−</button>
                <input name="seats" defaultValue={seats} min={5} className="mono" style={{ fontSize: 20, width: 60, textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text)' }} />
                <button formAction={`/checkout?plan=Team&seats=${seats + 1}`} className="btn btn-ghost btn-sm">+</button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>min 5 seats</span>
              </form>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 500 }}>
            <div>Total due today</div>
            <div className="mono">${total.toLocaleString()}.00</div>
          </div>
        </div>
      </div>

      {/* Right: Stripe status + primary CTA */}
      <div style={{ padding: '56px 64px', maxWidth: 520 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>PAYMENT</div>

        {errMsg && (
          <div style={{ background: 'color-mix(in oklab, var(--warn) 10%, var(--bg-panel))', border: '1px solid var(--warn)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
            {errMsg}
          </div>
        )}

        {!session?.user ? (
          <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 16 }}>
              Sign in first. We attach purchases and subscriptions to your account so everything stays together.
            </p>
            <Link className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} href={`/sign-up?next=${encodeURIComponent(`/checkout?plan=${encodeURIComponent(plan)}${isTeam ? `&seats=${seats}` : ''}`)}`}>
              Create account · ${total.toLocaleString()} {info.recurring ? '/ mo' : 'one-time'} {Icons.arrow}
            </Link>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(`/checkout?plan=${encodeURIComponent(plan)}${isTeam ? `&seats=${seats}` : ''}`)}`} style={{ color: 'var(--accent)' }}>Sign in</Link>
            </div>
          </div>
        ) : canCheckout ? (
          <form action="/api/stripe/checkout" method="post" className="panel" style={{ padding: 24, marginBottom: 24 }}>
            <input type="hidden" name="plan" value={plan} />
            {isTeam && <input type="hidden" name="seats" value={seats} />}
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 20 }}>
              Secure checkout by Stripe. You'll be redirected to complete payment, then brought back to activate your access.
            </p>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {info.recurring
                ? `Subscribe · $${total.toLocaleString()} / mo`
                : `Pay $${total.toLocaleString()}`} {Icons.arrow}
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
              {info.recurring ? 'Cancel anytime from billing.' : 'Lifetime access · 30-day refund policy'}
            </div>
          </form>
        ) : (
          <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 16 }}>
              Payments for this plan aren't live yet. In the meantime:
            </p>
            <ul style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20 }}>
              <li>For a <strong>team trial</strong> — email <a href="mailto:hello@truos.ai" style={{ color: 'var(--accent)' }}>hello@truos.ai</a> with seat count.</li>
              <li>Have a <strong>comp code</strong>? Apply it during <Link href="/sign-up" style={{ color: 'var(--accent)' }}>sign-up</Link>.</li>
            </ul>
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
          Questions? <a href="mailto:hello@truos.ai" style={{ color: 'var(--text-muted)' }}>hello@truos.ai</a>
        </div>
      </div>
    </div>
  );
}
