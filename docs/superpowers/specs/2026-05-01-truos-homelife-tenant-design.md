# HomeLife Media tenant + TRUOS LEAGUE — `truos.ai/homelife`

**Date:** 2026-05-01
**Status:** Design approved through brainstorming; pending written-spec sign-off
**Owner:** Marshall

## Goal

Make Truos the in-house AI training program for HomeLife Media employees, and make finishing courses *fun* by turning division-vs-division progress into a public, sports-style scoreboard at `truos.ai/homelife`.

Two things happen on the same URL:

1. **`/homelife`** is a **public** TRUOS LEAGUE scoreboard — division standings, live activity ticker, MVP of the week, manager trash-talk. No auth.
2. **`/homelife/admin`** and **`/homelife/team`** are **auth-gated** consoles for Marshall (owner) and division managers.

This is real infrastructure, not a sales demo. New `@homelifemedia.com` sign-ups auto-enroll, get all 8 courses free, and start scoring points for their division.

## Scope

**In scope (this build):**
- Schema additions: extend `Organization`, add `OrgDivision`, extend `User` with `divisionId` + `orgRole`
- Seed: HLM org with `domains: ['homelifemedia.com']` + a starter list of divisions Marshall provides
- Auto-join hook on sign-up
- Auto-grant of all 8 entitlements (AI·101–104 + 4 Truos+) to HLM members on join
- `/homelife` public scoreboard
- `/homelife/admin` (Marshall-only) — manage divisions, assign members, set managers, edit org-level trash-talk
- `/homelife/team` (manager-only) — see own division roster, edit division trash-talk, send a nudge email
- Points engine — derived from `Certificate` rows, no new tables
- Bonus rules — streak / speed-run / sweeper, all derived

**Out of scope (later):**
- Multi-org support beyond HLM
- Per-division logos as image uploads (use color + initials for v1)
- Season resets / playoff brackets
- Reactions, comments, social ticker beyond auto-generated entries
- Public per-person profile pages
- Stripe seat billing for HLM (it's free internally — no `Subscription` row needed)

## Sitemap

```
truos.ai/
├── /homelife                 ← public TRUOS LEAGUE scoreboard
├── /homelife/admin           ← owner console (Marshall)
│   ├── /divisions            ← create/rename/recolor divisions
│   ├── /members              ← assign division + role to each HLM member
│   └── /trash-talk           ← edit org-level banner (optional, single-line)
└── /homelife/team            ← manager console
    ├── /                     ← own division roster + per-member completion
    ├── /trash-talk           ← edit own division's banner (200 chars)
    └── /nudge                ← one-click "remind 5 incomplete teammates"
```

Learners do not get a `/homelife/learner` route — they keep using the existing `/account` dashboard. The scoreboard is the only thing they see at `/homelife`, same as a non-employee.

## Schema changes

Extend `Organization` (existing model — currently just id/name/stripe):

```prisma
model Organization {
  id               String   @id @default(cuid())
  slug             String   @unique                          // NEW — "hlm"
  name             String                                    // "HomeLife Media"
  domains          String[]                                  // NEW — ["homelifemedia.com"]
  primaryColor     String?                                   // NEW — hex, e.g. "#0F172A"
  logoUrl          String?                                   // NEW
  trashTalk        String?                                   // NEW — org-level banner, ≤200 chars
  trashTalkAt      DateTime?                                 // NEW
  stripeCustomerId String?  @unique
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  members      User[]
  divisions    OrgDivision[]                                 // NEW
  subscription Subscription?

  @@map("truos_orgs")
}
```

New `OrgDivision`:

```prisma
model OrgDivision {
  id           String   @id @default(cuid())
  orgId        String
  slug         String                                        // "iheartdogs", "cannanine"
  name         String                                        // "iHeartDogs"
  color        String?                                       // hex, e.g. "#84CC16"
  emoji        String?                                       // optional, e.g. "🐕"
  leadUserId   String?                                       // manager — also flips that user's User.orgRole to "manager"
  trashTalk    String?                                       // ≤200 chars
  trashTalkAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  org      Organization @relation(fields: [orgId], references: [id])
  lead     User?        @relation("DivisionLead", fields: [leadUserId], references: [id])
  members  User[]       @relation("DivisionMembers")

  @@unique([orgId, slug])
  @@index([orgId])
  @@map("truos_org_divisions")
}
```

Extend `User`:

```prisma
model User {
  // ...existing fields...
  divisionId        String?                                  // NEW — nullable; member can be in HLM but no division yet
  orgRole           String?                                  // NEW — null | "owner" | "admin" | "manager" | "learner"

  division          OrgDivision? @relation("DivisionMembers", fields: [divisionId], references: [id])
  ledDivision       OrgDivision? @relation("DivisionLead")
  // ...existing relations...
}
```

No `OrgMember` join table — `User.orgId` already exists and a user belongs to at most one org. Keeps the change small.

## Auto-join flow

Hook into the existing sign-up handler (`src/app/api/auth/sign-up/route.ts` — verify exact path during impl). After user creation:

```ts
const domain = email.split('@')[1]?.toLowerCase();
const org = await prisma.organization.findFirst({
  where: { domains: { has: domain } }
});
if (org) {
  await prisma.user.update({
    where: { id: user.id },
    data: { orgId: org.id, orgRole: 'learner' },
  });
  // grant all 8 courses
  for (const courseId of [101,102,103,104,201,202,203,204]) {
    await prisma.courseEntitlement.upsert({
      where: { userId_courseId_source: { userId: user.id, courseId, source: 'org_grant' } },
      create: { userId: user.id, courseId, source: 'org_grant', sourceId: org.id },
      update: {},
    });
  }
}
```

Existing `canAccessCourse` in `src/lib/access.ts` already honors `entitlement` reasons — no change needed.

## Points engine (derived)

No `points` column anywhere. Points are computed from `Certificate.courseId` at query time:

```ts
const POINTS: Record<number, number> = {
  101: 1, 102: 2, 103: 3, 104: 4,
  201: 2, 202: 2, 203: 2, 204: 2,
};
```

Per-division total: `SUM(POINTS[cert.courseId])` across all certs of all members of that division. Per-member total: same SUM scoped to one user.

For the leaderboard query, do this in a single SQL `groupBy` on `Certificate` joined with `User → Division`. Cache the aggregate in-memory for 60s using `unstable_cache` keyed by org slug; the public page uses `revalidate = 60`.

## Bonuses (also derived)

| Bonus | Trigger | Display |
|---|---|---|
| 🔥 **Streak** | `LessonProgress.completedAt` exists for ≥5 distinct calendar days in a row, ending today (PT) | Flame icon + count next to name in feed and member rows |
| ⚡ **Speed run** | Time between user's first `LessonProgress` for course X and the `Certificate` for course X is < 48h | `+2 BONUS` shown in the activity-feed entry; counted in points |
| 🎯 **Sweeper** | Division had ≥3 `Certificate` rows in the last 24h | "ON FIRE" badge on the row in standings |

Speed-run is the only bonus that adds points (kept simple — single bonus type so totals stay legible). Streak and Sweeper are visual flair only.

## Public scoreboard `/homelife`

Server-rendered, `export const revalidate = 60`. Dark scoreboard aesthetic, breaks the minimal Truos brand on purpose.

**Layout (top to bottom):**

1. **Ticker bar** — full-width, 32px tall, dark bg, monospace text scrolling right-to-left via CSS `@keyframes`. Sources: last 20 events from a UNION of (recent certs, current streak holders, sweeper triggers, manager trash-talk edits ≤24h old). Pure CSS animation, no JS for the scroll.

2. **Header** — "HOMELIFE MEDIA · TRUOS LEAGUE" in bold, season tagline ("Season 1 · Started May 2026") under it. HLM logo on the left.

3. **MVP of the Week strip** — full-width card. Top-scoring individual in the last 7 days. Their name, division (with color stripe), points earned this week, "+18 PTS" in giant numbers. If tie: most recent cert wins.

4. **Standings table** — every division, ranked by total points DESC. Columns:
   - 👑 (only on row 1)
   - Division emoji + name + color stripe down the left edge
   - Members (count)
   - 🏆 Points (huge — animated count-up on first load)
   - ▲ Today (today's gain)
   - 14-day sparkline (small inline SVG)
   - "ON FIRE" badge if Sweeper bonus active
   - Trash-talk row underneath, italic, division color, only if `trashTalk` is non-null and `trashTalkAt` < 7 days

5. **Live activity feed** — most recent 30 events, newest first. Format:
   `🟢 Sarah K (iHeartDogs) finished AI·104 Workflow Mastery · +4 PTS · 2m ago`
   New entries pulse in via CSS `@keyframes` on initial render. Speed-run bonus shown inline as `+4 +2 BONUS`. Each row links to the public `/certificates/[id]` page.

6. **Footer** — "Season 1 · Started May 2026 · Resets Aug 1" — sets up future fun without building it now.

**Privacy:** name shown as `Firstname L.` in feed and MVP card. Internal HLM only, but kept light. No emails, no avatars (v1).

**No PII for non-HLM viewers:** the page is publicly indexable, so use `noindex, follow` to keep it out of search while still showing it to anyone with the URL.

## Admin console `/homelife/admin`

Owner-only (`orgRole === 'owner'` and `email IN STAFF_EMAILS`). Three tabs:

### `/divisions`
- Table of all divisions for HLM
- Inline create row: name, slug (auto-from-name), color picker (12 swatches), emoji picker (Apple-style 8x4 grid)
- Inline rename / recolor
- Delete confirms — soft-blocks if division has members (must reassign first)

### `/members`
- Table of all `User` rows where `orgId = HLM.id`, sortable by name / division / points / role / joinedAt
- Per-row inline dropdowns: Division (any HLM division or "—"), Role (`learner | manager | owner`)
- Top-right: "Invite member" button — drops a CSV upload zone for `email,divisionSlug` rows; emails get a magic-link sign-up + auto-join

### `/trash-talk`
- Single textarea (≤200 chars) for org-level banner shown above standings
- Save updates `trashTalk` and `trashTalkAt`. Auto-expires from feed at 24h, from standings at 7d.

## Manager console `/homelife/team`

Manager-only (`orgRole === 'manager'`, scoped to their `OrgDivision.leadUserId === user.id`). Three tabs:

### `/` (team)
- Roster of own division members
- Per-member: name, points, courses completed (badges 101/102/103/104/+ in division color when done, gray when not), last activity
- "Nudge" button per row — sends a templated email
- Top stats: division rank, points today, on-fire status

### `/trash-talk`
- Same as admin but scoped to own division's `trashTalk`
- Live preview of how it'll look on the standings row

### `/nudge`
- Pre-filled email composer
- Recipient list = own division members with the **fewest** course completions (capped at 5 by default, editable)
- Subject: "Quick nudge from {{managerName}}"
- Body: prefilled but editable. Tokens: `{{firstName}}`, `{{nextCourseCode}}`, `{{divisionName}}`
- Send routes through existing `EmailLog` machinery; logs `kind: 'manager_nudge'`

## Seed

A migration seed creates the HLM org and a starter division list. Marshall confirms the division roster before merge — placeholder list to start:

| Division | Slug | Color | Emoji |
|---|---|---|---|
| iHeartDogs | `iheartdogs` | `#84CC16` (lime) | 🐕 |
| iHeartCats | `iheartcats` | `#F59E0B` (amber) | 🐈 |
| Cannanine | `cannanine` | `#14B8A6` (teal) | 🌿 |
| DogMob | `dogmob` | `#EF4444` (red) | 🐾 |
| PawMyGosh | `pawmygosh` | `#A855F7` (purple) | ✨ |
| LuckyPuppyMag | `luckypuppy` | `#F472B6` (pink) | 🍀 |
| Hero Co | `hero` | `#0EA5E9` (sky) | 🦸 |
| HQ / Ops | `hq` | `#64748B` (slate) | ⚙️ |

Marshall is `orgRole: 'owner'`, `divisionId: hq.id` on seed.

## Edge cases

- **Existing Truos user signs up with HLM email** — no migration retro-grant; only NEW sign-ups auto-enroll. Pre-existing HLM users get a one-time admin script `npm run script:hlm-backfill` that looks up `User.email LIKE '%@homelifemedia.com'` and calls the same join+grant logic.
- **HLM member leaves the company** — owner manually flips `orgId` to null in `/admin/members`. Their certs persist (and contribute history to the scoreboard until removed). v1 leaves their certs counted; manual cleanup only.
- **Manager promoted from learner** — when admin sets `OrgDivision.leadUserId`, a DB trigger isn't needed; the admin form mutation also writes `User.orgRole = 'manager'` for the new lead and demotes the prior lead to `learner` if they had no other division.
- **Two divisions tied on points** — sort tiebreak: most recent cert.
- **Empty division** — still appears in standings with `0 PTS`. Avoids "where'd we go" surprises after creating a new division.
- **Anonymous viewer hitting `/homelife/admin`** — middleware redirects to `/sign-in?callbackUrl=/homelife/admin`.

## Routes touched / created

**New files:**
- `src/app/homelife/page.tsx` — public scoreboard
- `src/app/homelife/_components/Ticker.tsx`
- `src/app/homelife/_components/Standings.tsx`
- `src/app/homelife/_components/MVPCard.tsx`
- `src/app/homelife/_components/ActivityFeed.tsx`
- `src/app/homelife/_components/Sparkline.tsx`
- `src/app/homelife/admin/layout.tsx` (auth gate)
- `src/app/homelife/admin/page.tsx` → redirect to `/homelife/admin/divisions`
- `src/app/homelife/admin/divisions/page.tsx`
- `src/app/homelife/admin/members/page.tsx`
- `src/app/homelife/admin/trash-talk/page.tsx`
- `src/app/homelife/team/layout.tsx` (auth gate, manager scope)
- `src/app/homelife/team/page.tsx`
- `src/app/homelife/team/trash-talk/page.tsx`
- `src/app/homelife/team/nudge/page.tsx`
- `src/lib/league.ts` — points + bonus computation, cached aggregations
- `src/lib/org.ts` — `getOrgForDomain(email)`, `joinOrg(userId, orgId)`, `grantAllCourses(userId, orgId)`
- `prisma/migrations/<ts>_homelife_tenant/migration.sql`
- `scripts/seed-hlm.ts`
- `scripts/hlm-backfill.ts`

**Modified files:**
- `prisma/schema.prisma` — schema additions above
- `src/app/api/auth/sign-up/route.ts` — call `getOrgForDomain` + `joinOrg` on success
- `src/components/Footer.tsx` — add a small "TRUOS LEAGUE" link (visible to HLM members only)

## Acceptance criteria

1. New `@homelifemedia.com` sign-up appears on the scoreboard's standings within 60s of completing a course.
2. Marshall can assign 5 placeholder members to 3 divisions and see correct totals on `/homelife` within 60s of admin save (scoreboard cache TTL).
3. Manager can edit their division's trash-talk and see it on the public scoreboard within 60s.
4. Speed-run bonus correctly adds 2 pts to a course completion that happened within 48h of the first lesson on that course.
5. Streak flame appears when a member has 5+ consecutive PT-day `LessonProgress` rows.
6. Public scoreboard renders for an anonymous viewer with no errors and shows `Firstname L.` (not full name).
7. Existing `/account`, `/courses/*`, `/checkout/*` flows are unaffected.

## Open questions

1. **Division roster final list** — placeholder above; need Marshall's actual list before seed merges.
2. **HLM logo asset** — does HomeLife Media have a wordmark to drop in `public/homelife/`? If not, render the text "HOMELIFE MEDIA" set in IBM Plex Mono.
3. **Backfill scope** — run `hlm-backfill` immediately after deploy, or hold for explicit go?
