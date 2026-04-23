/**
 * Idempotently creates the Stripe products + prices Truos needs,
 * then prints the STRIPE_PRICE_* env vars to set on Vercel.
 *
 * Run with: STRIPE_SECRET_KEY=sk_... npx tsx scripts/setup-stripe.ts
 *
 * Uses Stripe product metadata.truos_plan as a lookup key so re-runs reuse
 * existing products instead of duplicating them.
 */
import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error('STRIPE_SECRET_KEY is required');
  process.exit(1);
}

const stripe = new Stripe(KEY, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });

interface PlanSpec {
  planKey: string;        // matches PLANS in src/lib/stripe.ts
  envVar: string;         // env var name that should hold the price id
  name: string;
  description: string;
  amountCents: number;
  mode: 'one_time' | 'recurring';
}

const SPECS: PlanSpec[] = [
  { planKey: 'AI·102',   envVar: 'STRIPE_PRICE_AI_102',      name: 'AI·102 — Practical Prompting',       description: 'Lifetime access to AI·102. 24 lessons, ~4 hours.',            amountCents: 49900,  mode: 'one_time' },
  { planKey: 'AI·103',   envVar: 'STRIPE_PRICE_AI_103',      name: 'AI·103 — AI at Work',                description: 'Lifetime access to AI·103. 32 lessons, ~6 hours.',            amountCents: 99900,  mode: 'one_time' },
  { planKey: 'AI·104',   envVar: 'STRIPE_PRICE_AI_104',      name: 'AI·104 — The Truos Capstone',        description: 'Lifetime access to AI·104. 40 lessons, ~10 hours.',           amountCents: 149900, mode: 'one_time' },
  { planKey: 'Bundle',   envVar: 'STRIPE_PRICE_BUNDLE_FULL', name: 'Truos Base Bundle — AI·102+103+104', description: 'Lifetime access to all three paid base courses. Save $500.',  amountCents: 249700, mode: 'one_time' },
  { planKey: 'CPLT·101', envVar: 'STRIPE_PRICE_CPLT_101',    name: 'Truos+ · Copilot 101',               description: 'Lifetime access to Copilot 101. 20 lessons, ~2.5 hours.',     amountCents: 24900,  mode: 'one_time' },
  { planKey: 'CPLT·EXL', envVar: 'STRIPE_PRICE_CPLT_EXL',    name: 'Truos+ · Copilot + Excel',           description: 'Lifetime access to Copilot + Excel. 12 lessons, ~1.5 hours.', amountCents: 24900,  mode: 'one_time' },
  { planKey: 'Team',     envVar: 'STRIPE_PRICE_TEAM_SEAT',   name: 'Truos Team · per seat / mo',         description: 'Team subscription. Per seat, billed monthly.',                amountCents: 9900,   mode: 'recurring' },
];

async function findOrCreateProduct(spec: PlanSpec): Promise<Stripe.Product> {
  // Search by metadata key
  const existing = await stripe.products.search({
    query: `metadata['truos_plan']:'${spec.planKey}' AND active:'true'`,
  });
  if (existing.data.length > 0) return existing.data[0];

  return stripe.products.create({
    name: spec.name,
    description: spec.description,
    metadata: { truos_plan: spec.planKey },
  });
}

async function findOrCreatePrice(product: Stripe.Product, spec: PlanSpec): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const match = prices.data.find(p =>
    p.unit_amount === spec.amountCents &&
    p.currency === 'usd' &&
    (spec.mode === 'recurring'
      ? p.recurring?.interval === 'month'
      : p.recurring == null
    )
  );
  if (match) return match;

  return stripe.prices.create({
    product: product.id,
    unit_amount: spec.amountCents,
    currency: 'usd',
    ...(spec.mode === 'recurring' ? { recurring: { interval: 'month', usage_type: 'licensed' } } : {}),
    metadata: { truos_plan: spec.planKey },
  });
}

async function main() {
  console.log('Setting up Stripe for Truos…\n');
  const out: Record<string, string> = {};

  for (const spec of SPECS) {
    const product = await findOrCreateProduct(spec);
    const price = await findOrCreatePrice(product, spec);
    out[spec.envVar] = price.id;
    console.log(`✓ ${spec.planKey.padEnd(10)}  product=${product.id}  price=${price.id}  (${spec.amountCents / 100} ${spec.mode === 'recurring' ? '$/mo' : '$ one-time'})`);
  }

  console.log('\nSet these env vars on Vercel (production):');
  for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);

  console.log('\nAlso configure a webhook at https://dashboard.stripe.com/webhooks:');
  console.log('  URL:    https://truos.ai/api/stripe/webhook');
  console.log('  Events: checkout.session.completed, customer.subscription.created,');
  console.log('          customer.subscription.updated, customer.subscription.deleted');
  console.log('Then set STRIPE_WEBHOOK_SECRET on Vercel.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
