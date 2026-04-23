import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY ?? '';
export const stripe: Stripe | null = KEY
  ? new Stripe(KEY, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion })
  : null;

export function isStripeConfigured(): boolean {
  return !!KEY;
}

// Map plan key (as used in /checkout?plan=...) → price env var + product shape.
export interface PlanConfig {
  envVar: string;         // which STRIPE_PRICE_* holds the price id
  mode: 'payment' | 'subscription';
  courseIds: number[];    // what to grant on purchase ([] for team → handled via subscription)
  label: string;          // human label for confirmation pages
  amountCents: number;    // fallback / verification
}

export const PLANS: Record<string, PlanConfig> = {
  'AI·102':   { envVar: 'STRIPE_PRICE_AI_102',      mode: 'payment',      courseIds: [102],                     label: 'AI·102 — Practical Prompting',    amountCents: 49900 },
  'AI·103':   { envVar: 'STRIPE_PRICE_AI_103',      mode: 'payment',      courseIds: [103],                     label: 'AI·103 — AI at Work',             amountCents: 99900 },
  'AI·104':   { envVar: 'STRIPE_PRICE_AI_104',      mode: 'payment',      courseIds: [104],                     label: 'AI·104 — The Truos Capstone',     amountCents: 149900 },
  'Bundle':   { envVar: 'STRIPE_PRICE_BUNDLE_FULL', mode: 'payment',      courseIds: [102, 103, 104],           label: 'Base bundle — AI·102 + 103 + 104', amountCents: 249700 },
  'CPLT·101': { envVar: 'STRIPE_PRICE_CPLT_101',    mode: 'payment',      courseIds: [201],                     label: 'Copilot 101',                      amountCents: 24900 },
  'CPLT·EXL': { envVar: 'STRIPE_PRICE_CPLT_EXL',    mode: 'payment',      courseIds: [202],                     label: 'Copilot + Excel',                  amountCents: 24900 },
  'Team':     { envVar: 'STRIPE_PRICE_TEAM_SEAT',   mode: 'subscription', courseIds: [],                        label: 'Team subscription',                amountCents: 9900 },
};

export function priceIdForPlan(plan: string): string | null {
  const cfg = PLANS[plan];
  if (!cfg) return null;
  return process.env[cfg.envVar] ?? null;
}
