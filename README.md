# Truos

AI training for commercial teams — from zero tech knowledge to a shipped AI workflow.
Live at **[truos.ai](https://truos.ai)**.

---

## HLM Org Dashboard

The HomeLife Media org dashboard lives at `/hlm` — production subdomain: **`homelife.truos.ai`**.

### What it is

A three-persona training dashboard wired to real DB data and auth:
- **Admin** (`/hlm/admin`) — Pulse metrics, People roster with course status, Invite wizard
- **Manager** (`/hlm/manager`) — Dept-scoped Pulse, Team table, Nudge composer
- **Learner** (`/hlm/learn`) — Resume card, Courses with entitlement gating, Certificate gallery

### Set up a new org (first time)

```bash
# 1. Apply the migration to your Neon DB
npx prisma migrate deploy

# 2. Seed the HomeLife Media org + 7 departments + Marshall as org_admin
npx ts-node --project tsconfig.json prisma/seed-hlm.ts

# 3. Promote yourself to org_admin (if not already)
# Update orgMemberships.orgRole = 'org_admin' for your user in the DB
```

### Invite flow

1. Admin navigates to `/hlm/admin/onboard` and pastes employee emails
2. `POST /api/hlm/invites` creates `OrgMembership` rows with unique `inviteToken` and sends emails via Resend
3. Employee receives email → clicks link → lands on `/hlm/join?token=xxx`
4. If not signed in → redirected to `/sign-in` with `callbackUrl=/hlm/join?token=xxx`
5. If signed in → sees accept screen → clicks "Accept invitation"
6. `POST /api/hlm/invites/accept` sets `userId`, `joinedAt=now()`, clears `inviteToken`
7. Employee redirected to `/hlm` → role-based redirect to `/hlm/learn` (or `/hlm/manager`, `/hlm/admin`)

### Nudge flow

1. Manager goes to `/hlm/manager/nudge` — sees team members who haven't started any course
2. Selects a template and recipients
3. `POST /api/hlm/nudge` sends personalized reminder emails via Resend
4. Emails arrive from Truos with manager's name + link to `/hlm/learn`

### Roles

| Role | Route | Can see |
|------|-------|---------|
| `org_admin` | `/hlm/admin` | All members, all depts, org-wide metrics, invite flow |
| `org_manager` | `/hlm/manager` | Own dept members, dept metrics, nudge composer |
| `member` | `/hlm/learn` | Own progress, courses, certificates |

To promote a user: update `orgRole` in `truos_org_memberships` for their membership row.

### CNAME for `homelife.truos.ai`

1. Add `homelife.truos.ai` as a custom domain in your Vercel project settings
2. Add a CNAME record in your DNS provider:
   ```
   homelife.truos.ai  →  cname.vercel-dns.com
   ```
3. Vercel will auto-provision the SSL certificate

### API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/hlm/invites` | org_admin | Create invite rows + send emails |
| `POST` | `/api/hlm/invites/accept` | any signed-in user | Accept invite by token |
| `POST` | `/api/hlm/nudge` | org_manager | Send nudge emails to team members |

### Env vars needed

No new env vars — uses the same `RESEND_API_KEY`, `DATABASE_URL`, `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` already in the project.

---

## The curriculum

Four courses, 116 lessons, ~22 hours. Each lesson is read → engage → quiz.

| Code     | Credential                    | Lessons | Tier      |
|----------|-------------------------------|---------|-----------|
| AI·101   | AI Foundations                | 20      | Free      |
| AI·102   | AI Prompt Mastery             | 24      | $499      |
| AI·103   | Applied AI at Work            | 32      | $999      |
| AI·104   | AI Workflow Mastery           | 40      | $1,499    |

- **AI Foundations** assumes zero tech knowledge. What AI is, what a chatbot is, what a prompt is, how to use AI safely.
- **AI Prompt Mastery** is the daily prompting toolkit: ICEF, roles, iteration, self-critique.
- **Applied AI at Work** applies AI to real commercial roles: sales, marketing, CS, ops, finance — with confidentiality guardrails.
- **AI Workflow Mastery** is the capstone: design, build, roll out, and sustain an AI workflow your team actually uses.

Each course issues its own certificate. No bundle credential; every résumé line stands on its course name alone.

## Architecture

Next.js 14 (App Router), Prisma + Neon Postgres, NextAuth v5, Resend.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, AUTH_SECRET, RESEND_API_KEY
npx prisma migrate dev
npm run dev
```

## Design

- Dark near-black base (`#0A0B0D`), elevated slate panels, warm paper for the certificate
- Electric lime accent (`#D4F547`), used sparingly
- Inter Tight for UI, Instrument Serif for editorial moments, monospace for course codes
- Hairline borders, all-caps tracked eyebrows, subtle grain
