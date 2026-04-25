# Core course renames + credential-first display

**Date:** 2026-04-25
**Status:** Approved for implementation
**Preview mockup:** https://preview.smashforms.com/sites/truos-naming-b/

## Why

The four core courses had generic, descriptive titles ("Getting Started with AI", "Practical Prompting", "AI at Work", "The Truos Capstone"). They didn't earn a line on a résumé — a recruiter skimming LinkedIn would see "Getting Started with AI" and move on. "The Truos Capstone" requires context Truos doesn't yet carry; nobody outside the site knows what it means.

The rename makes each course a **named credential** that stands on its own. A learner can finish one and post a LinkedIn entry that reads like a real skill claim, independent of Truos's brand equity.

## Locked decisions

### 1. Names

| Code | Old title | New title |
|---|---|---|
| AI·101 | Getting Started with AI | **AI Foundations** |
| AI·102 | Practical Prompting | **AI Prompt Mastery** |
| AI·103 | AI at Work | **Applied AI at Work** |
| AI·104 | The Truos Capstone | **AI Workflow Mastery** |

### 2. Four standalone credentials — no umbrella

Every course issues its own certificate. There is **no** fifth "bundle" credential for completing all four. The existing `/start` LP brand "AI Mastery Certification" is removed; revisit umbrella credentialing once Truos has earned outside brand equity.

Rationale: a bundle cert from an unknown issuer reads weaker than four strong standalone course credentials. Each of the four names above defends itself on its own.

### 3. Credential display format

Public-facing credentials show **name only** — course codes stay internal.

| Surface | Renders as |
|---|---|
| PDF certificate headline | `AI Workflow Mastery` (drop the `AI·104 —` prefix) |
| LinkedIn-ready export | `AI Workflow Mastery · Truos` |
| Homepage pricing card title | `AI Workflow Mastery` |
| Course home page headline | `AI Workflow Mastery` |
| Internal nav / URL path / breadcrumbs | `AI·104` kept unchanged |
| Database course IDs | `104` unchanged |

Course codes `AI·101` through `AI·104` continue to appear as subtext / metadata for formal curriculum feel (e.g. small mono-typography under the name), but never as the primary title on public surfaces.

## Scope — what changes

### Code surfaces

Every occurrence of the four old titles gets rewritten:

- `src/content/courses.ts` — source of truth for course metadata
- `src/app/page.tsx` — hero copy, pricing cards, inline footer
- `src/app/checkout/page.tsx` — plan labels
- `src/lib/stripe.ts` — Stripe plan registry `label` field
- `src/app/certificates/[id]/page.tsx` — cert render drops `{course.code} —` prefix
- `src/content/lessons.ts` — one narrative mention of "The Truos Capstone" in the 101 wrap-up lesson
- `public/start/index.html` — paid-traffic LP. Rewrite course names; remove "AI Mastery Certification" umbrella framing.
- Any email templates or component copy referencing the old names

### Schema — no changes

- No database migration. Course IDs, URL paths, Stripe price IDs, entitlement records, progress records all use course `id` (101–104), not the title.
- Existing certificates in the DB are unchanged; when they re-render, they'll pick up the new title automatically because the cert page reads from `course.title`.

### Out of scope

- Truos+ course names (CPLT·101, CPLT·EXL, GEM·101, GEM·SHT) stay as-is.
- Cert design itself (paper layout, signature line) stays unchanged — only the title string changes.
- Stripe product names / price IDs stay the same — labels visible to customers get updated, but the price IDs in env vars don't need to rotate.
- LinkedIn "add to profile" integration (not wired yet; future spec).
- Domain, logo, typography — no brand-system changes.

## Non-decisions intentionally left alone

- Course `code` strings (`AI·101` etc) are unchanged. They appear in URLs, dashboard chips, breadcrumbs, staff tools, and the certification-quiz header, and that's fine — they're internal curriculum shorthand.
- The 5-phase lesson structure, recall steps, module recaps, `/methodology` page are untouched.

## Risk

Low. The rename is a string-substitution across ~10 files plus one small render change (drop cert code prefix). No DB writes, no URL changes, no pricing changes. Rollback is trivial (revert commit).

## Verification

- `npx tsc --noEmit` — pass
- `npm run build` — pass
- Grep for every old title post-rename: zero hits in `src/`, `public/` (excluding `.bak` backup files in `src/content/`)
- Live smoke: `/`, `/courses/101`, `/courses/104`, `/start`, `/certificates/<hash>` — all render new names
