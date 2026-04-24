# Truos Pricing Strategy — Working Spec

**Status:** Draft / paused for revisit
**Date:** 2026-04-24
**Context:** Brainstorm session on tiered pricing, bundle mechanics, enterprise packaging, and content cadence.

## Summary

Two primary go-to-market tracks:

1. **Individual / paid-traffic** — one-time purchases (homepage + paid-ads LP)
2. **Enterprise teams** — full B2B sales motion, annual contracts

The individual bundle is priced identically on the homepage and in paid ads ($495) to eliminate price-mismatch risk. Standalone course prices serve as psychological anchors, not transaction prices.

Enterprise uses a feature-tiered Good/Better/Best structure. The product is sustained long-term by shipping one new Truos+ course per month, which is both the recurring-revenue justification for enterprise and a new individual subscription offering.

---

## Locked decisions

### 1. Anchor-high, bundle-low (both individual tracks use the same $495 price)

Keep standalone individual prices high as anchors — $499 / $999 / $1,499 across AI·102 / 103 / 104. Almost nobody buys standalone at these prices; they exist to make the $495 bundle feel like a massive deal.

Both homepage AND paid-ads LP show the same $495 bundle price. No mismatch risk when a visitor sees both.

**Marketing frame:** "4 courses. Lifetime access. $3,096 value. $495 today." Same pitch everywhere.

### 2. Individual standalone Truos+ pricing — unchanged for now

Each Truos+ tool course stays at $249 standalone lifetime. Explicitly deferred the question of Truos+ bundles / upsell paths. Revisit after enterprise structure is settled.

### 3. Enterprise: full B2B sales motion

Every enterprise deal goes through a real sales cycle. No self-serve path above ~25 seats. Sales calls, proposals, MSAs, annual contracts. Target $30k+ average ACV.

### 4. Self-serve Team plan — keep for 5–24 seats; revisit pricing

Small teams can still buy with a credit card up to 25 seats. Above 25 = sales-led. **Open question:** whether the existing $99/seat/month Team plan stays at that rate given the new enterprise structure (see Open Questions).

### 5. Enterprise content = same as Team plan

No "enterprise-only" courses. Enterprise gets full base curriculum (AI·101–104) plus full Truos+ library. The differentiator is procurement, contract terms, admin features, and support — not content.

### 6. Monthly new Truos+ courses as the retention engine

Without ongoing content, a 1–2 week consumer experience can't justify annual subscriptions. Commit to shipping one new Truos+ course every month. These become the reason enterprise renews year-over-year, and the reason individuals subscribe instead of buying one-time.

Content velocity requirements:
- ~12 lessons × 3 steps each per month
- Writable in 2–4 days with agent assistance
- Build a 6-course queue ahead of launch so a missed month doesn't break the promise

### 7. Enterprise price points: $299 / $399 / $499 per seat per year

Three tiers. "Active seat" in this model means a **licensed/provisioned seat for 12 months** (not engagement-based billing). Seats can be reassigned at annual renewal.

---

## Proposed architecture (for revisit)

### Individual track

| Product | Price | What you get | Renewal |
|---|---|---|---|
| AI·102 standalone | $499 | Single course, lifetime | — |
| AI·103 standalone | $999 | Single course, lifetime | — |
| AI·104 standalone (Capstone) | $1,499 | Single course, lifetime | — |
| **AI Mastery Bundle** | **$495** one-time | All of AI·101–104 + certs, lifetime | — |
| Truos+ single course | $249 | Single tool course, lifetime | — |
| **Truos+ Library Subscription** (new, proposed) | **$29/mo or $290/yr** | All Truos+ courses + every monthly drop | Monthly or annual |

### Enterprise track (feature tiers — "Model A")

| Tier | Price | What they get | Target deal size |
|---|---|---|---|
| **Essentials** | $299/seat/yr | Full content library (base + Truos+ + monthly drops) + admin dashboard + team reporting | 25–100 seats, $7.5k–$30k ACV |
| **Business** | $399/seat/yr | Essentials + SSO/SAML + SCIM + priority support + advanced reporting | 100–500 seats, $40k–$200k ACV (the target tier) |
| **Enterprise** | $499/seat/yr | Business + dedicated CSM + MSA + SOC 2 support + BAA/DPA + custom cert branding + implementation kickoff | 500+ seats, $125k–$1M+ ACV |

All tiers: annual commitment, seats reassignable at renewal (terminated employees can be replaced with new hires at no cost within the contract term).

### ACV ladder (Model A, feature-tiered)

| Seats | Essentials | Business | Enterprise |
|---|---|---|---|
| 25 | $7,475 | $9,975 | $12,475 |
| 100 | $29,900 | $39,900 | $49,900 |
| 250 | $74,750 | $99,750 | $124,750 |
| 500 | $149,500 | $199,500 | $249,500 |
| 1,000 | $299,000 | $399,000 | $499,000 |

### Competitive position at Enterprise base ($299/seat/yr)

| Product | $/seat/yr |
|---|---|
| MasterClass at Work | $180–240 |
| **Truos Essentials** | **$299** |
| LinkedIn Learning | $350 |
| Udemy Business | $360 |
| Coursera for Business | $399 |
| Pluralsight | $599 |

Positioning line: "Half the price of LinkedIn Learning, 100% AI-focused, monthly new courses shipped."

---

## Open questions (to resolve on revisit)

### A. Self-serve Team plan at $99/mo = $1,188/yr — now inverted vs. enterprise

Under the proposed enterprise pricing ($299–$499/seat/yr), the current self-serve Team plan ($99/seat/mo = $1,188/yr) costs 2.4–4× MORE per seat than Enterprise. A smart 10-seat buyer books a sales call instead of buying self-serve.

**Three resolution options:**

1. **Kill self-serve Team.** Small teams either buy $495 individual bundles per person or book an enterprise call. Clean pricing page. Some small-team revenue lost.
2. **Drop Team to $25/seat/mo ($300/seat/yr).** Slightly above Essentials, justified as "no contract, no sales call." Keeps the SMB funnel alive.
3. **Unify with Essentials pricing ($299/seat/yr billed annually upfront)** for 5–24 seats, self-serve. Remove the monthly option.

**Recommendation at time of pause:** kill self-serve Team. Confirm on revisit.

### B. Does the $495 individual bundle include any Truos+ Library trial?

**Two options:**

1. **Yes — 90 days of Library included** with every bundle purchase, then converts to opt-in paid sub ($29/mo) if they want to keep it. Strong upsell, trial-to-paid conversion on warm leads.
2. **No** — Library is a separate purchase, bundle buyers must subscribe explicitly.

**Recommendation at time of pause:** include 90-day Library trial. Confirm on revisit.

### C. Individual Truos+ Library Subscription pricing

$29/mo is the current proposal. Room to test $19/mo (easier conversion, lower LTV) or $39/mo (premium framing, higher churn risk).

**Recommendation at time of pause:** start at $29/mo. Revisit based on early data.

### D. Volume discounting WITHIN enterprise feature tiers

Currently Model A uses flat per-seat pricing within each tier. A 1,000-seat Business deal pays $399,000 at full rack rate. Do we build published volume discounts inside each tier, or handle all negotiation bespoke per deal?

**Options:**

1. Flat per-seat, negotiate custom at 500+ seats (simple pricing page)
2. Published tiers within tiers: e.g., Business is $399 for 100-499 seats, $349 for 500-999, $299 for 1,000+
3. Hybrid: flat published prices + a "custom for 1,000+ seats" call-to-action

**Recommendation at time of pause:** option 1 (flat, negotiate). Revisit once 3+ enterprise deals have closed.

### E. Active-seat ("pay for engagement") pricing — considered and rejected

We evaluated a genuine active-seat model where buyers only pay for users who engage. Rejected because:
- Revenue becomes unpredictable
- Requires engagement instrumentation and quarterly true-up billing
- Floors (minimum 30% activation billed) end up feeling like a trick to buyers

Could be revisited later as a product-led-growth option if the sales motion isn't converting.

---

## Dependencies / prerequisites before launch

1. **Stripe products & prices:** Currently parked. All new SKUs need products created — individual standalone courses, Bundle, Truos+ standalones, Truos+ Library subscription (monthly + annual), Enterprise tiers (negotiated-price product).
2. **Truos+ Library product feature:** needs to actually grant/revoke access to ALL Truos+ courses based on active subscription status. Today's `CourseEntitlement` model grants one course at a time. Either extend to a "library" entitlement type, or iterate — monthly job adds new course entitlements to every active subscriber.
3. **Monthly course production pipeline:** at least 6 courses built ahead of launch. Content calendar, internal review, launch cadence.
4. **Enterprise procurement features:** SSO/SAML, SCIM, admin dashboard upgrades, MSA template, SOC 2 Type 1 (for Business tier and above). All non-trivial builds.
5. **Sales motion infrastructure:** CRM, email sequences, MSA automation, proposal template, demo deck. None of this exists yet.

---

## Related work / memory

- Truos pricing state on site as of 2026-04-24: AI·101 free, AI·102 $499, AI·103 $999, AI·104 $1,499, Bundle $2,497 (homepage), Bundle $495 (paid-ads LP at `/start`). Team plan $99/seat/mo on homepage.
- Stripe not yet configured; plan keys exist in `src/lib/stripe.ts` but price IDs (env vars) not set.
- Cert gate landed 2026-04-24: free-course certificates require any paid entitlement.
