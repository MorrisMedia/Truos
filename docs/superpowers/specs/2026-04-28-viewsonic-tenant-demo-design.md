# ViewSonic tenant demo — `viewsonic.truos.ai`

**Date:** 2026-04-28
**Status:** Design approved through brainstorming; pending written-spec sign-off
**Owner:** Marshall

## Goal

Win the ViewSonic enterprise deal by giving them a clickable, co-branded experience at `viewsonic.truos.ai` that makes the head of L&D feel — within 60 seconds — that they can see who's certified, who's slipping, and roll out training to all 1,247 seats with one click.

This is a **pitch demo, not production multi-tenant infrastructure.** No real auth, no real DB writes, all data is seeded JSON. The demo is reused unchanged if ViewSonic signs (the seed data is replaced with their actual roster); the auth/CRUD layer comes later as a real-first build.

## Personas (three views)

The demo lets the buyer toggle between three personas via a header switcher. All three share the same shell and tab pattern — no sidebar, no breadcrumbs, just three tabs per persona.

| Persona | Identity | Tabs (1 / 2 / 3) | Killer moment |
|---|---|---|---|
| Admin | Sarah Chen, CHRO | Pulse · People · Onboard | Onboarding wizard — paste 800 emails, departments auto-detect, send invites |
| Manager | Marcus Reyes, Sales Director Americas | Pulse · Team · Nudge | One-click "Nudge 12 incomplete reps" with personalized auto-emails |
| Learner | Priya Patel, Marketing Specialist | Home · Courses · Certificates | Certificate gallery — three earned, polished LinkedIn share modal |

Persona switching is purely a query-param + cookie flip. No real authentication.

## Demo narration arc

The pitch flow Marshall walks through live:

1. Land on `viewsonic.truos.ai` — co-branded sign-in with three "View as" buttons below the form.
2. Click **Admin** → land on Pulse tab. "97 of 1,247 are AI-certified. ColorPro Creator team leads at 84%. Channel Partners lagging at 11%."
3. Click **Onboard tab** → demo the 3-step wizard. Paste a CSV, departments auto-detect, schedule waves, hit Launch. Confetti.
4. Header switcher → **Manager** → "this is what Marcus sees when he logs in."
5. Header switcher → **Learner** → land on Priya's home, click Certificates tab, show a polished cert with LinkedIn share.
6. Header switcher → back to **Admin** → Pulse tab → bottom Billing card. "1,247 of 1,500 seats used, $148K in training-hours saved."

## Sitemap

```
viewsonic.truos.ai/
├── /                        ← entry: persona picker
├── /admin
│   ├── /                    ← Tab 1: Pulse
│   ├── /people              ← Tab 2: People matrix
│   └── /onboard             ← Tab 3: Onboard wizard
├── /manager
│   ├── /                    ← Tab 1: Pulse (his slice)
│   ├── /team                ← Tab 2: His 84 reps
│   └── /nudge               ← Tab 3: Nudge composer
└── /learn
    ├── /                    ← Tab 1: Home
    ├── /courses             ← Tab 2: Available courses
    └── /certificates        ← Tab 3: Cert gallery
```

Each persona's `layout.tsx` renders a tab strip with three tabs only. Active tab gets a lime underline. No deeper nesting in the URL — drilldowns are slide-over panels, not new routes.

## Visual language

- **Base:** Truos house style — `#0A0B0D` ink, `#F5F1EA` paper, `#D4F547` electric lime accent, `#16181C` panels.
- **Co-branding:** ViewSonic indigo (`#003DA5`) as a secondary accent on the header chrome and persona-switcher only. ViewSonic wordmark beside the Truos mark in the header. Page bodies stay Truos-styled — co-branded, not skinned.
- **Type:** Inter Tight (UI), Instrument Serif italic (emotional moments — recipient names, welcome message), JetBrains Mono (metrics, codes, badges).
- **Density:** Admin tabs are dense and operational. Learner tab is generous and calm — single column, lots of whitespace, serif headlines.
- **Motion:** Subtle. Lime sparkline pulse next to "live" labels. Confetti only on the Onboard "Launch" button. No bouncing icons, no rounded-everything.

## Hero screen specs

### Admin Pulse — `/admin`

- Top row: 4 metric cards — Active learners (797 ↑14%), Org-wide activation (64% ↑8pts), Certs earned (312 ↑47), Training hours saved ($148K).
- Mid section: Activation by department — horizontal bars, colored fill, count + percentage on the right. ColorPro Creator at the top (84%), Channel Partners at the bottom (11%) with a soft red flag icon.
- Bottom-left: Risk list — 5 items, each linking to a filtered People view.
- Bottom-right: Top learners this week — 3 names with hours.
- Footer card: Billing strip — "1,247 / 1,500 seats · $X/mo" with link to invoice (modal).

### Admin People — `/admin/people`

- Filter bar: dept pills, status (✓ done / ◐ in progress / ◯ not started / ⚠ stalled), tier (Standard / Plus), region.
- Table: avatar · name · dept · seat tier · 5 course-progress columns (Foundations, Prompt Mastery, Applied AI, Workflow, Plus capstone) — each cell is `[✓ Apr 14]` or `◐ 40%` or `—`.
- Virtualized rendering for 1,247 rows.
- Row click → slide-over panel with cert thumbnails, lesson timeline, last-active, manager name, quick actions.
- Bulk select → bottom toolbar: Nudge selected · Reassign · Upgrade to Plus · Export CSV.
- "Assign course" drawer (course catalog lives here): pick a course, target a department, confirm.

### Admin Onboard — `/admin/onboard`

Three-step single-page wizard.

- **Step 1 — Paste roster.** Single textarea with placeholder "Paste emails, names, or your full org CSV." Below: a logo strip "Or connect: Workday · Okta · BambooHR · Google Workspace · Microsoft 365" (display only). As the user pastes, an animated count: "Detected 847 people."
- **Step 2 — Confirm structure.** Auto-grouped tree: "ColorPro Creator (229), Sales — Americas (263)…" each editable. AI-suggestion banner: "Based on email patterns, we grouped these for you. Edit anything that's wrong." Drag people between teams.
- **Step 3 — Pick rollout.** Three cards: "Invite all today (847) / Wave by department / Pilot first 50". Calendar showing scheduled send. Big lime button: **Launch onboarding.**
- On Launch: confetti, fake progress bar, toast "847 invites scheduled. 64% of large rollouts hit 70% activation in two weeks — we'll have you there by [date]."

### Manager Pulse — `/manager`

Same skeleton as Admin Pulse, scoped to Marcus's 84 Americas-Sales reps. Hero CTA: "12 reps haven't started — Nudge them" (1-click, fires confirmation toast).

### Manager Team — `/manager/team`

Same matrix as Admin People, filtered to his 84 reps. No bulk-reassign action; only Nudge.

### Manager Nudge — `/manager/nudge`

Email composer with template chips ("Friendly reminder · Deadline approaching · Manager check-in"). Recipient list pre-filled with the 12 stragglers. Send button fires a toast: "12 reminders queued."

### Learner Home — `/learn`

Single column, generous whitespace.

- Serif welcome line: "✦ Welcome back, Priya"
- Resume card: "Pick up where you left off — Lesson 12 of 24" with a 50% progress bar and a "Resume ➜" button.
- Cert thumbnails row: 3 earned cert mini-previews + "Share to LinkedIn ↗".
- Up Next card: 2 recommended courses for Marketing.
- Footer stats: "Streak: 11 days · Hours this month: 7.3"

### Learner Courses — `/learn/courses`

Truos's 5 real courses + the Plus catalog as large cards. Each card: title, subtitle, progress bar (if started), enrollment count, "Resume" or "Start" button. Plus-tier courses get a `✦ PLUS` lime badge.

### Learner Certificates — `/learn/certificates`

Grid of cert thumbnails using the cert component shipped 2026-04-28. Hover lifts. Click opens full cert modal with Download PDF / Share to LinkedIn / Verify buttons.

## Components

### New

| Component | Purpose |
|---|---|
| `<TabStrip>` | Top-of-page tab nav with lime underline animation |
| `<PersonaSwitcher>` | Header dropdown for the demo persona toggle |
| `<DemoBanner>` | Subtle lime stripe: "Demo environment · all data illustrative" |
| `<MetricCard>` | Stat card with delta arrow and sparkline |
| `<DepartmentBar>` | Activation bar row (horizontal bar + label + count) |
| `<PeopleMatrix>` | Virtualized table for the 1,247-row roster view |
| `<OnboardWizard>` | Three-step guided flow with paste-detect parsing |
| `<CertThumb>` | Mini cert preview card |
| `<NudgeComposer>` | Email composer with template chips |
| `<SlideOver>` | Generic right-edge panel for person drilldowns |

### Reused from existing Truos

- Cert rendering (`src/app/certificates/[id]/page.tsx` — shipped 2026-04-28)
- Color tokens from `globals.css` (`--paper`, `--accent`, `--ink`)
- Nav header pattern
- Footer

## Architecture

### Repo location

Lives in the existing Truos Next.js app under a route group:

```
src/app/(viewsonic-demo)/viewsonic/
├── layout.tsx              ← demo chrome: header, persona switcher, demo banner
├── page.tsx                ← entry: 3 "View as" buttons
├── admin/
│   ├── layout.tsx          ← admin tab strip
│   ├── page.tsx            ← Pulse
│   ├── people/page.tsx     ← People matrix
│   └── onboard/page.tsx    ← Onboard wizard
├── manager/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── team/page.tsx
│   └── nudge/page.tsx
├── learn/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── courses/page.tsx
│   └── certificates/page.tsx
├── _components/            ← demo-only components
└── _data/                  ← seed JSON
```

### Subdomain routing

`viewsonic.truos.ai` → rewrites to `/viewsonic/*` via `middleware.ts`:

```ts
if (hostname.endsWith('.truos.ai') && hostname !== 'truos.ai' && hostname !== 'www.truos.ai') {
  const tenant = hostname.split('.')[0];
  url.pathname = `/${tenant}${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

Setup (one-time):

1. Add `viewsonic.truos.ai` to the Vercel `truos` project (`prj_9bsLJwIo7QtCkegkQxjf2Cd9VM4Q`)
2. Cloudflare DNS: CNAME `viewsonic` → `cname.vercel-dns.com`
3. Vercel auto-issues the cert

The middleware logic is generic — any future tenant subdomain (`acme.truos.ai`) works the same way without code changes; only Vercel + DNS setup is per-tenant.

### Persona state

- Cookie name: `vs_demo_persona`
- Values: `admin` | `manager` | `learner` | unset (shows entry page)
- Set by query param `?persona=admin` on entry page button click
- Layouts read the cookie and route accordingly
- No real session, no real auth, no DB write

### Demo state — what's fake

- All data is seed JSON in `src/app/(viewsonic-demo)/viewsonic/_data/`.
- Onboard wizard "Launch" → confetti + fake progress bar + canned toast.
- Manager Nudge "Send" → canned toast.
- Person drilldown actions (Reassign, Upgrade, etc.) → canned toasts.
- No network calls. No DB queries. No emails sent.

## Seed data

### Files

- `org.json` — ViewSonic name, logo URL, seat counts, Plus tier, contract dates.
- `departments.json` — 12 depts × regions, with seat counts that sum to 1,247.
- `people.json` — 1,247 people generated with `@faker-js/faker` and a fixed seed for stability across runs. ~80 named seeds (Sarah Chen, Marcus Reyes, Priya Patel, Jordan Kim, Aisha Diop, Tom Schaefer, Wei-Ling Hsu, Daniel O'Connor, Mei Tanaka, Cristina Vargas, Olu Akande, Hiroshi Sato, Lukas Becker, Fatima Al-Hassan, etc.) used in dense lists, the rest as initials.
- `courses.json` — Truos's 5 real courses + the Plus capstone (read from existing `src/content/courses.ts`).
- `progress.json` — per-person × per-course completion timeline. Distribution tuned to make the activation-by-department story believable (ColorPro 84%, Channel Partners 11%, etc.).

### Department layout

| Department | Seats | Region split |
|---|---|---|
| ColorPro Creator | 229 | Americas 84, EMEA 71, APAC 74 |
| Sales — Americas | 263 | — |
| Sales — EMEA | 186 | — |
| Sales — APAC | 147 | — |
| Product Engineering | 240 | Brea HQ 142, Taipei R&D 98 |
| Marketing | 112 | — |
| Customer Success | 79 | — |
| Channel Partners | 72 | — |
| Operations | 58 | — |
| Finance & Legal | 34 | — |
| HR / People | 18 | — |
| Executive | 9 | — |
| **Total** | **1,247** | |

Channel Partners is intentionally seeded at 11% activation as the demo's red-flag moment.

## Build sequence

Estimated ~8.5 hours of focused build, splittable into two sessions.

| Step | What | Est. |
|---|---|---|
| 1 | Subdomain + middleware routing + persona cookie | 30 min |
| 2 | Layout shell + tab strip + demo banner + persona switcher | 45 min |
| 3 | Seed JSON generation script | 60 min |
| 4 | Admin Pulse — metric cards + dept bars + risk list | 60 min |
| 5 | Admin People matrix — virtualized table + filters + slide-over | 90 min |
| 6 | Admin Onboard wizard — 3 steps with paste-parse | 90 min |
| 7 | Manager 3 tabs (reuses Admin components scoped down) | 60 min |
| 8 | Learner 3 tabs | 60 min |
| 9 | Polish: ViewSonic logo asset, indigo accents, micro-animations, demo arc test | 45 min |

## Out of scope

- Real authentication (no NextAuth integration for the demo personas)
- Real database writes (Prisma `Organization` and `User` models stay untouched)
- Real bulk-import (CSV parser is for visual feedback only — doesn't write to DB)
- Real email sending (Nudge, Onboard invites are canned toasts)
- SCIM / Okta / Workday integrations (logos shown for trust, not wired)
- Multi-tenant isolation logic (no per-tenant database scoping yet)
- Mobile responsive polish below 768px (demo runs on a laptop in the meeting)
- Accessibility audit (out of scope for a single-meeting pitch demo; revisit if production)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| ViewSonic asks "can I try it on my laptop after the meeting?" → bugs in unsupervised use | Add a persistent demo banner; build a Reset button that re-seeds state |
| ViewSonic asks "can my IT team see the data model?" | Have the spec doc + sitemap printable; offer a follow-up technical readout |
| Subdomain DNS / cert issuance fails on the morning of the pitch | Set up DNS 48+ hours ahead; have `truos.ai/viewsonic` as a fallback URL |
| Demo persona cookie collides with real user sessions on `truos.ai` | Cookie scoped to `viewsonic.truos.ai` only via subdomain restriction |
| Seed data feels generic / not ViewSonic-flavored | Use real ViewSonic product line names (ColorPro Creator, etc.) and known regional offices (Brea HQ, Taipei R&D) |

## Success criteria

- ViewSonic L&D lead asks "how do we get started?" within the meeting.
- Demo runs end-to-end without a glitch on Marshall's laptop in the meeting room.
- Three personas, three tabs each, every tab clickable with no broken state.
- Onboard wizard completes the 3-step flow with the confetti moment.

## Spec self-review

Reviewed for placeholders, internal consistency, ambiguity, and scope.

- ✓ No TBDs or TODOs in the spec
- ✓ Sitemap matches tabs section matches build sequence (3 routes per persona, all accounted for)
- ✓ Demo-only scope is explicitly fenced in "Out of scope"
- ✓ Subdomain setup steps are concrete (Vercel project ID named, DNS provider named)
- ✓ Seed data totals reconcile (1,247 across 12 departments)
- ✓ Components list includes only items used in screen specs
- ✓ Tab-driven structure is consistent across all three personas

Single ambiguity worth flagging: the spec doesn't lock the visual treatment of the persona switcher (dropdown vs segmented control vs three avatar buttons). Picking dropdown for now since the entry page already exposes the three personas as buttons and the in-app switcher just needs to be quick.
