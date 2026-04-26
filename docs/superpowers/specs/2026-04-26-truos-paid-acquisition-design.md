# Truos paid acquisition — agent-driven Meta first run

**Date:** 2026-04-26
**Status:** Design approved verbally; pending written-spec sign-off
**Owner:** Marshall

## Goal

Close one paying customer on the **$495 four-credential bundle** with a **$500** total Meta Ads spend, and learn enough from the run to either (a) keep scaling Meta or (b) graduate to LinkedIn for round 2. The full pipeline — creative generation, copy, campaign launch, monitoring, kill/scale decisions, daily reporting — runs through the existing OpenClaw agent stack, with one human approval gate on the first creative batch.

Break-even CAC = $495. Anything under that is profit and a clear "scale this" signal.

## Channel decision (locked)

**Meta (Facebook + Instagram)** — selected over LinkedIn and Google Search because at a $500 budget, learning velocity matters more than audience-fit precision. LinkedIn at $10-15 CPC would burn the full budget on ~50 clicks before we know if any creative works. Meta's lower CPM lets us run 5 creatives in parallel and have signal in days.

LinkedIn is the round-2 candidate once a winning creative is proven on Meta.

## Test design (locked)

- **Architecture:** 1 campaign → 1 ad set → 5 ads (one per creative angle).
- **Optimization event:** Purchase ($495 checkout completion).
- **Budget pacing:** $500 over 7 days, ~$71/day campaign budget. Meta's CBO (Campaign Budget Optimization) distributes across the 5 ads; expected $14/day per ad to start, redistributing as winners emerge.
- **Audience size:** ~40-60M US estimated reach with the directional interest stack defined below.

## Audience (locked)

| Lever | Value |
|---|---|
| Country | United States only |
| Age | 28-55 |
| Language | English |
| Genders | All |
| Interest stack (directional, Advantage+ expansion ON) | Online learning · Coursera · Udemy · LinkedIn Learning · Professional development · Career growth · ChatGPT · Generative AI · Artificial intelligence · LinkedIn (platform) · MBA · Executive education |
| Custom audiences | None (no seed data yet) |
| Lookalikes | None (no seed data yet) |
| Retargeting | None for cycle 1 (no traffic yet); becomes a layer in cycle 2 |

Skip job-title targeting. Skip behavioral filters. Skip detailed-targeting expansion exclusions. The point is to give Meta's algorithm room to find converters once the pixel sees a few.

## The 5 creative angles (locked)

Each ad runs at two ratios: **1:1 (1080x1080)** for feed, **9:16 (1080x1920)** for Stories/Reels. All five share the same destination URL: `https://truos.ai/start?utm_source=meta&utm_medium=cpc&utm_campaign=cycle1&utm_content=<angle>`.

| # | Angle name | Hook copy | Visual treatment | Lever |
|---|---|---|---|---|
| 1 | **ROI vs degree** | "MBA: $80k + 2 years. AI Cert: $495 + 2 weeks. AI workers earn 35% more." | Side-by-side cost-vs-cost comparison bars (numbers from /start LP comparison table; 35% stat from LinkedIn, already cited on LP) | Opportunity cost / value |
| 2 | **Career insurance** | "Don't get left behind. 4 AI credentials in 2 weeks." | Cert + AI workplace imagery | Fear / security |
| 3 | **LinkedIn trophy** | "Add 4 verified AI credentials to your LinkedIn." | LinkedIn cert preview screenshot (use the existing /start LP mockup) | Status / résumé |
| 4 | **Educational rigor** | "The same learning science used at Harvard, MIT, Yale." | Cert + school-name pillar treatment (matches the credibility section we just shipped) | Credibility |
| 5 | **Real outcome** | "Sandra: RN → Hospital AI Lead in 6 weeks." | Sandra K's portrait (existing /start LP asset) + outcome stat overlay | Transformation proof |

**Image generation:** OpenAI gpt-image-1 (already proven on this LP for the testimonial portraits). Variant prompts for each angle stored in the agent's brief.

**Copy generation:** GPT-4.1 (or whatever's in the design agent's current stack). Headline + primary text + CTA per angle. CTA: "Get All 4 Credentials" or "Start Free" (test both).

**Compliance:** all factual claims (35% premium, MBA cost, school cites) are already cited on the /start LP — Meta ad reviewers can verify the source. No invented stats.

## Autonomy model (locked)

**Hybrid — human approval on first launch, full agent autonomy after.**

Phase | Actor | Approval gate
---|---|---
Generate 5 creatives (image + copy) | `truos-ads` coordinator + `design` agent | None
Build campaign config + first launch payload | `truos-ads` + `ads-buyer` | **Marshall approves via Telegram message** before agent calls Meta API to create campaign
Daily monitoring (every 4 hours) | `truos-ads` | None — agent decides
Kill an underperforming ad | `truos-ads` | None — within rules below
Scale a winning ad (+50% budget) | `truos-ads` | None — within rules below
Generate fresh creative when fatigue hits | `truos-ads` + `design` | None — same brand brief
Exceed daily budget cap | — | **Hard guardrail. Agent cannot.**
Pause campaign on Meta policy violation | `truos-ads` | None — must auto-pause
Run a second campaign (different audience/angle) | `truos-ads` | **Marshall approval** — round 2 is a new spec

## Kill / scale rules (locked, version C)

**Kill an ad** when ALL true at the 48h mark:
- 0 purchases
- CPC > $2.50
- CTR < 0.8%

**Scale an ad** when ANY true:
- 1+ purchase recorded
- CTR > 1.5% sustained over 24h, even before purchase fires
- Scale action: bump that ad's daily budget +50% (but never exceed total campaign daily of $71/day; redistribute from killed ads first)

**48h minimum runtime** before any kill — Meta's "learning phase" needs ~50 events to exit; killing earlier wastes the learning budget.

**Hard stops (auto-pause campaign):**
- Total daily spend approaching $80 (campaign cap)
- Any Meta policy disapproval
- Pixel signal goes silent for 6+ hours (likely tracking break)

## Pre-launch infrastructure build

**This is the gating dependency. Nothing runs until this is done.**

### 1. Meta Business + Ad Account setup (1-2h, manual)

Marshall does this; agent can't:
- [ ] Decide: stand up a fresh Meta Business Account for `Truos`, OR add Truos as a child asset under HomeLifeMedia's existing Meta Business. Recommend **fresh Truos Business** — keeps brand reputation isolated from any prior account history.
- [ ] Create Facebook Page for Truos (`@truos` or similar). Page is required to run ads; Meta will not serve creative without one.
- [ ] Create new ad account inside the Truos Business. Set USD billing; attach a card.
- [ ] Verify domain ownership of `truos.ai` in Meta Business (DNS TXT record). 24h propagation.

### 2. Meta Marketing API access (30min-2h, dev)

- [ ] Create a new Meta App at `developers.facebook.com/apps/` — type "Business," name `Truos Ads Agent`.
- [ ] Add the **Marketing API** product to the app.
- [ ] Add Truos Business as a "Development" use case so the App can act on the Truos ad account.
- [ ] Generate a **System User access token** (long-lived) with scopes: `ads_management`, `business_management`, `pages_read_engagement`, `pages_manage_posts`, `read_insights`.
- [ ] Save token + ad account ID + page ID + business ID to `~/openclaw/.env` as `TRUOS_META_ACCESS_TOKEN`, `TRUOS_META_AD_ACCOUNT_ID`, `TRUOS_META_PAGE_ID`, `TRUOS_META_BUSINESS_ID`.

If Meta requires App Review for `ads_management` (it sometimes does), the workaround is to use Marshall's personal Meta access token scoped to ads management on his own ad account — slower but bypasses review. Note this fallback in the agent code.

### 3. Pixel + conversion events on truos.ai (2-4h, dev)

- [ ] Create a new pixel in Meta Events Manager. Save pixel ID to `~/openclaw/.env` as `TRUOS_META_PIXEL_ID`. (Do not reuse the Cannanine pixel currently in `META_PIXEL_ID`.)
- [ ] Add base pixel script to `src/app/layout.tsx` (loads on every page).
- [ ] Fire **PageView** automatically (default).
- [ ] Fire **ViewContent** on every `/courses/*` and `/start` page load.
- [ ] Fire **Lead** on `/sign-up` form successful submission.
- [ ] Fire **InitiateCheckout** on `/checkout` page load with plan + value.
- [ ] Fire **Purchase** on `/checkout/success` page load with `value: <plan price>`, `currency: 'USD'`, `content_ids: [planKey]`.
- [ ] Configure **Aggregated Event Measurement** in Events Manager — prioritize Purchase #1, InitiateCheckout #2, Lead #3, ViewContent #4.
- [ ] Add Conversions API (server-side complement) for iOS attribution. Stripe webhook (which we already have) is the natural place to fire the server-side Purchase event with `event_id` matching the client-side pixel for dedup.

### 4. UTM-aware analytics (1h, dev)

- [ ] Capture `utm_*` query params on first page load; store in session + on the User row at signup. Already partially scaffolded — verify and complete.
- [ ] Add a small `/staff/ads` page that pivots conversions by `utm_source`, `utm_campaign`, `utm_content` so the agent can self-report cycle results. (Stretch — agent can pull from Meta API directly for v1.)

## Agent architecture (locked, version C)

```
Marshall (Telegram) ──▶ truos-ads (coordinator)
                            │
                            ├─▶ design       (image gen, gpt-image-1)
                            ├─▶ ads-buyer    (Meta API operations)
                            └─▶ analyst      (daily numbers, reporting)
```

### `truos-ads` — new coordinator agent

**Workspace:** `~/.openclaw/workspace-truos-ads/`
**Model:** Sonnet 4.6
**Owns:** the brief (5 angles, audience, kill/scale rules, $500 budget, $71/day pacing, $14/day per ad start), the conversion goal, and Truos brand voice. Loads `src/content/courses.ts` + the /start LP copy at startup so it knows what's being sold.

**Key tools:**
- `generate_creative_batch(angle_briefs)` — dispatches to `design` for the 5 image variants × 2 ratios = 10 images
- `generate_copy_batch(angle_briefs)` — produces headline, primary text, description, CTA per angle
- `assemble_campaign_payload()` — produces a JSON spec for the Meta campaign that `ads-buyer` can submit
- `human_approval_gate(payload, image_urls)` — sends a Telegram message with creative previews + spec summary; waits for "approve" or "revise X"
- `launch_campaign(payload)` — calls `ads-buyer` to push to Meta API
- `monitor_loop()` — runs every 4 hours; pulls insights, applies kill/scale rules, regenerates creative if fatigue (CTR drops 30% from peak)
- `daily_report()` — fires once at 7am PST to Telegram

### `design` — existing agent, reused

Already has gpt-image-1 + Gemini image gen. New brief: render Truos credential aesthetics + the 5 specific angles. Output goes to `~/.openclaw/workspace-truos-ads/creatives/cycle1/`.

### `ads-buyer` — existing agent, reused

Already wraps Meta Marketing API for Cannanine. Needs new env-var path: when called by `truos-ads`, use `TRUOS_META_*` vars instead of `META_*`. Add a `account_context` param to the existing tool functions.

### `analyst` — existing agent, reused for reporting

Pulls from Meta Insights API + the `/staff/ads` page (or Stripe). Produces the daily 7am Telegram message: yesterday's spend / CPC / CTR / conversions / kills / scales / next-24hr plan.

## Daily report format (Telegram, 7am PST)

```
Truos Ads — Day N of 7
─────────────────────
Spent yesterday: $XX.XX  (cumulative: $XXX of $500)
Impressions: XXX,XXX
Clicks: XXX  ·  CTR XX%
Purchases: X  ·  CPA $XX
─────────────────────
Top ad: #X "ROI vs degree"  CTR 1.7%  CPC $1.20
Worst ad: #X "Career insurance"  CTR 0.4%  ← killed
─────────────────────
Decisions made overnight:
  • Killed ad #2 (low CTR, no upper-funnel)
  • Scaled ad #1 (+50% budget → $21/day)
─────────────────────
Plan next 24h: continue, generate fresh #2 replacement variant
```

## What happens after $500

Three branches based on outcome at day 7:

**Branch A — at least 1 purchase, CPA < $400:** Cycle 2 with $1,500-2,000 budget. Same channel. Kill the 3 worst angles, generate 3 fresh variants of the winning angle, add a lookalike-audience ad set seeded on the converter(s). Move toward Meta Advantage+ Sales campaign type.

**Branch B — 0 purchases, CTR > 1% on ≥2 ads:** Strong upper-funnel signal but conversion broke. Diagnose LP → checkout funnel; probably a checkout friction issue. Run a second cycle on Meta with the proven creative + a fix.

**Branch C — 0 purchases, CTR < 0.8% across the board:** Creative is wrong or the offer isn't landing on this channel. Pause Meta. Spin up a $500 LinkedIn cycle with the educational-rigor + ROI angles only (LinkedIn audiences respond to those better than fear/transformation hooks).

Cycle 2 design is its own future spec. This document covers cycle 1 only.

## Out of scope for this design

- LinkedIn Ads (round-2 contingency only)
- Google Search Ads
- Email marketing capture / nurture
- Affiliate / partner referrals
- TikTok / Reddit / Twitter
- Retargeting (deferred to cycle 2)
- Lookalike modeling (no seed data yet)
- Video creative (static-only for cycle 1)
- A/B testing the LP itself (separate concern)
- Building `/staff/ads` analytics dashboard (stretch goal — agent uses Meta API directly for v1)

## Risks and mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| Meta App Review blocks `ads_management` scope | Medium | Use Marshall's personal token as fallback; documented in agent code |
| Pixel doesn't fire correctly → Meta optimizes wrong | High | Add a verification step in pre-launch checklist: load /checkout/success in browser, watch Events Manager for Purchase event, only then approve launch |
| Meta policy review rejects creative (e.g., "earnings claims") | Medium | All claims sourced from cited LP material; agent runs creative through a self-review checklist before submission; on rejection, agent edits and resubmits |
| $500 spends with 0 purchases | Medium | Branch C above — explicit fallback. Don't auto-spend cycle 2 budget. |
| Agent decision-loop bug burns budget | Low | Hard daily cap on Meta's side ($80/day campaign budget). Even if agent misbehaves, can't exceed. |
| Domain verification delays launch by 24h | High | Start it immediately on Day 1 of the build; parallelize with everything else |
| Truos Page has 0 followers — looks low-credibility | Medium | Pre-populate Page with 5-10 organic posts before launch (intro, methodology, Sandra testimonial repost, etc.). 1h of work. |

## Acceptance criteria for cycle 1 launch

Before a single dollar runs, all of these must be ✅:

- [ ] Truos Facebook Page exists and has ≥5 organic posts
- [ ] Truos Business + ad account set up with billing
- [ ] truos.ai domain verified in Meta Business
- [ ] Meta App created, System User token in `~/openclaw/.env`
- [ ] Pixel script live on truos.ai (every page)
- [ ] All 5 conversion events firing in Meta Events Manager — verified by manually walking through PageView → ViewContent → Lead → InitiateCheckout → Purchase in a real browser
- [ ] Aggregated Event Measurement configured (Purchase #1)
- [ ] Conversions API server-side dedup wired through Stripe webhook
- [ ] UTM params captured at signup
- [ ] `truos-ads` agent built, has Truos brief loaded, can call `design` and `ads-buyer`
- [ ] First creative batch generated (5 angles × 2 ratios) and previewed in `~/.openclaw/workspace-truos-ads/creatives/cycle1/`
- [ ] Marshall approves the creative batch via Telegram
- [ ] Campaign payload submitted to Meta as DRAFT (not live yet)
- [ ] Marshall approves the launch via Telegram
- [ ] Campaign goes live; first daily report fires the next morning at 7am PST

## Estimated time-to-first-ad-live

Realistic, sequential:
- Day 1: Meta Business + Page + ad account setup, domain verification submitted (1-2h Marshall, 24h DNS wait)
- Day 2: Domain verifies; Meta App + token created; pixel work begins (3-4h dev)
- Day 3: Conversion events verified end-to-end; UTM capture tested (2h dev)
- Day 4-5: `truos-ads` agent built (4-8h dev)
- Day 6: First creative batch + Marshall approval (2h)
- Day 7: Launch
- Days 7-13: 7-day Meta run + daily reports
- Day 14: Cycle 1 retro + cycle 2 spec

Total: ~2 weeks from starting infra build to having cycle 1 results in hand.
