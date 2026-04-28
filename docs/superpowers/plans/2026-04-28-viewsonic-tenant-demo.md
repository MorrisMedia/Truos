# ViewSonic Tenant Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a clickable, co-branded pitch demo at `viewsonic.truos.ai` showing three personas (Admin/Marcus, Manager/Sarah, Learner/Priya) across three tabs each, all running on seeded JSON inside the existing Truos Next.js app.

**Architecture:** Route group `src/app/(viewsonic-demo)/viewsonic/*` inside the existing Truos repo. A `middleware.ts` rewrites `*.truos.ai` requests to `/<tenant>/...` paths. Persona is a cookie set by query-param links. All data is static JSON in `_data/` — no DB, no auth, no real network calls.

**Tech Stack:** Next.js 14 App Router, TypeScript, Inline-styled React (existing Truos pattern), `@faker-js/faker` for seed generation, no test framework (matches Truos's existing setup — verification is visual via dev server).

**Spec:** `docs/superpowers/specs/2026-04-28-viewsonic-tenant-demo-design.md`

---

## File structure (created over the plan)

```
src/
├── middleware.ts                                          ← Task 1 (NEW)
└── app/
    └── (viewsonic-demo)/
        └── viewsonic/
            ├── layout.tsx                                 ← Task 3
            ├── page.tsx                                   ← Task 2
            ├── _components/
            │   ├── PersonaSwitcher.tsx                    ← Task 3
            │   ├── DemoBanner.tsx                         ← Task 3
            │   ├── TabStrip.tsx                           ← Task 7
            │   ├── MetricCard.tsx                         ← Task 8
            │   ├── DepartmentBar.tsx                      ← Task 8
            │   ├── SlideOver.tsx                          ← Task 9
            │   ├── CertThumb.tsx                          ← Task 9
            │   ├── PeopleMatrix.tsx                       ← Task 12
            │   ├── OnboardWizard.tsx                      ← Task 13
            │   └── NudgeComposer.tsx                      ← Task 15
            ├── _data/
            │   ├── org.json                               ← Task 6
            │   ├── departments.json                       ← Task 6
            │   ├── people.json                            ← Task 6
            │   ├── courses.json                           ← Task 6
            │   ├── progress.json                          ← Task 6
            │   ├── seed.ts                                ← Task 5 (helper types + loaders)
            │   └── README.md                              ← Task 6
            ├── admin/
            │   ├── layout.tsx                             ← Task 10
            │   ├── page.tsx                               ← Task 11 (Pulse)
            │   ├── people/page.tsx                        ← Task 12
            │   └── onboard/page.tsx                       ← Task 13
            ├── manager/
            │   ├── layout.tsx                             ← Task 14
            │   ├── page.tsx                               ← Task 15
            │   ├── team/page.tsx                          ← Task 15
            │   └── nudge/page.tsx                         ← Task 15
            └── learn/
                ├── layout.tsx                             ← Task 16
                ├── page.tsx                               ← Task 17
                ├── courses/page.tsx                       ← Task 17
                └── certificates/page.tsx                  ← Task 17
scripts/
└── generate-viewsonic-seed.ts                             ← Task 5
public/
└── viewsonic/
    └── viewsonic-mark.svg                                 ← Task 18
```

## Conventions (read once)

- **No test framework.** Truos has no Jest/Vitest setup. Each task ends with a manual verification step (start dev server, visit URL, confirm visual). This matches the existing Truos workflow.
- **Inline styles.** Truos uses inline `style={{ ... }}` on divs throughout (see `src/app/certificates/[id]/page.tsx`). Match that pattern. CSS tokens like `var(--accent)` and `var(--paper)` are defined in `globals.css`.
- **Server Components by default.** Add `'use client'` only when a component uses state/effects/event handlers.
- **Commit after every task.** Use `git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall"` if commits fail with identity error.
- **Dev server.** Run `npm run dev` once at the start of a session and leave it running. Visit `http://localhost:3000/viewsonic` to verify (the middleware rewrite is bypassed for localhost — see Task 1).

---

## Task 1: Create middleware for subdomain rewriting

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create the middleware file**

```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Skip rewrite for the apex domain, www, localhost, and Vercel preview URLs
  const isApex = hostname === 'truos.ai' || hostname === 'www.truos.ai';
  const isLocal = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');
  const isVercelPreview = hostname.endsWith('.vercel.app');

  if (isApex || isLocal || isVercelPreview) {
    return NextResponse.next();
  }

  // Subdomain pattern: <tenant>.truos.ai → rewrite to /<tenant>/<path>
  if (hostname.endsWith('.truos.ai')) {
    const tenant = hostname.split('.')[0];
    // Avoid double-rewriting if path already starts with the tenant
    if (!url.pathname.startsWith(`/${tenant}`)) {
      url.pathname = `/${tenant}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next.js internals, static files, and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

- [ ] **Step 2: Run typecheck**

Run: `cd /home/marshall/Truos && npx tsc --noEmit -p .`
Expected: no errors related to middleware.

- [ ] **Step 3: Verify dev server still boots**

Run: `cd /home/marshall/Truos && npm run dev` (in a separate terminal — leave it running)
Expected: server starts on port 3000, no middleware errors in console. Visit `http://localhost:3000/` — the existing Truos homepage should render unchanged (middleware skips localhost).

- [ ] **Step 4: Commit**

```bash
cd /home/marshall/Truos
git add src/middleware.ts
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat: subdomain-rewriting middleware for tenant demos"
```

---

## Task 2: Create the entry page (persona picker)

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/page.tsx`

- [ ] **Step 1: Write the entry page**

This is the page that loads at `viewsonic.truos.ai/`. Three buttons that set the persona cookie and redirect.

```tsx
// src/app/(viewsonic-demo)/viewsonic/page.tsx
import Link from 'next/link';

export default function ViewSonicEntry() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--text)', color: 'var(--accent)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16,
          }}>T</div>
          <span style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>×</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#003DA5' }}>ViewSonic</span>
        </div>

        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>DEMO ENVIRONMENT</div>
        <h1 style={{ fontSize: 40, letterSpacing: '-0.025em', marginBottom: 12, fontWeight: 500 }}>
          ViewSonic AI Academy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 40 }}>
          Pick a view to step into the experience. Real ViewSonic team — illustrative data.
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          <Link href="/viewsonic/admin?persona=admin" style={personaButtonStyle('admin')}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>View as Admin</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Sarah Chen · CHRO</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
          </Link>
          <Link href="/viewsonic/manager?persona=manager" style={personaButtonStyle('manager')}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>View as Manager</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Marcus Reyes · Sales Director, Americas</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
          </Link>
          <Link href="/viewsonic/learn?persona=learner" style={personaButtonStyle('learner')}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>View as Learner</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Priya Patel · Marketing Specialist</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function personaButtonStyle(_kind: 'admin' | 'manager' | 'learner'): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    transition: 'border-color 120ms ease, transform 120ms ease',
  };
}
```

- [ ] **Step 2: Verify the entry page renders**

Visit `http://localhost:3000/viewsonic` in a browser.
Expected: Black background, "ViewSonic AI Academy" headline, three persona buttons stacked vertically. Hover effects do not yet move the cards (no global hover styles).

- [ ] **Step 3: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/page.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): persona picker entry page"
```

---

## Task 3: Demo layout chrome (header, persona switcher, demo banner)

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/layout.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/DemoBanner.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/PersonaSwitcher.tsx`

- [ ] **Step 1: Create DemoBanner**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/DemoBanner.tsx
export function DemoBanner() {
  return (
    <div style={{
      background: 'var(--accent)',
      color: 'var(--accent-ink)',
      padding: '6px 24px',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      textAlign: 'center',
    }}>
      Demo environment · all data illustrative · no real emails sent
    </div>
  );
}
```

- [ ] **Step 2: Create PersonaSwitcher**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/PersonaSwitcher.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

const PERSONAS = [
  { id: 'admin',   name: 'Sarah Chen',     role: 'CHRO',                          href: '/viewsonic/admin?persona=admin' },
  { id: 'manager', name: 'Marcus Reyes',   role: 'Sales Director, Americas',      href: '/viewsonic/manager?persona=manager' },
  { id: 'learner', name: 'Priya Patel',    role: 'Marketing Specialist',          href: '/viewsonic/learn?persona=learner' },
] as const;

export function PersonaSwitcher({ current }: { current: 'admin' | 'manager' | 'learner' }) {
  const [open, setOpen] = useState(false);
  const active = PERSONAS.find((p) => p.id === current) ?? PERSONAS[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          color: 'var(--text)',
        }}
      >
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-hover)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
        }}>
          {active.name.split(' ').map((s) => s[0]).join('')}
        </span>
        <span>{active.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          minWidth: 280,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: 8,
          zIndex: 50,
        }}>
          <div className="eyebrow" style={{ padding: '6px 10px', color: 'var(--text-dim)' }}>
            VIEW AS
          </div>
          {PERSONAS.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: p.id === current ? 'var(--bg-hover)' : 'transparent',
              }}
              onClick={() => setOpen(false)}
            >
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.role}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create the demo layout**

```tsx
// src/app/(viewsonic-demo)/viewsonic/layout.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { DemoBanner } from './_components/DemoBanner';
import { PersonaSwitcher } from './_components/PersonaSwitcher';

export default function ViewSonicLayout({ children }: { children: React.ReactNode }) {
  const personaCookie = cookies().get('vs_demo_persona')?.value;
  const persona = (personaCookie === 'admin' || personaCookie === 'manager' || personaCookie === 'learner')
    ? personaCookie : 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DemoBanner />
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <Link href="/viewsonic" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--text)', color: 'var(--accent)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13,
          }}>T</div>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>×</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: '#003DA5' }}>ViewSonic</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            AI Academy
          </span>
        </Link>
        <PersonaSwitcher current={persona} />
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Wire the persona cookie**

Replace `src/app/(viewsonic-demo)/viewsonic/page.tsx` to set the cookie via a server action when each button is clicked. Update the file to:

```tsx
// src/app/(viewsonic-demo)/viewsonic/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function pickPersona(persona: 'admin' | 'manager' | 'learner') {
  'use server';
  cookies().set('vs_demo_persona', persona, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
  const dest = persona === 'admin' ? '/viewsonic/admin'
    : persona === 'manager' ? '/viewsonic/manager'
    : '/viewsonic/learn';
  redirect(dest);
}

export default function ViewSonicEntry() {
  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>DEMO ENVIRONMENT</div>
        <h1 style={{ fontSize: 40, letterSpacing: '-0.025em', marginBottom: 12, fontWeight: 500 }}>
          ViewSonic AI Academy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 40 }}>
          Pick a view to step into the experience. Real ViewSonic team — illustrative data.
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          {([
            { id: 'admin' as const,   name: 'View as Admin',   sub: 'Sarah Chen · CHRO' },
            { id: 'manager' as const, name: 'View as Manager', sub: 'Marcus Reyes · Sales Director, Americas' },
            { id: 'learner' as const, name: 'View as Learner', sub: 'Priya Patel · Marketing Specialist' },
          ]).map((p) => (
            <form key={p.id} action={pickPersona.bind(null, p.id)}>
              <button type="submit" style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                cursor: 'pointer',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{p.sub}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Visit `http://localhost:3000/viewsonic`.
Expected: Lime banner at top says "DEMO ENVIRONMENT · ALL DATA ILLUSTRATIVE · NO REAL EMAILS SENT". Header has Truos × ViewSonic logo lockup on left, persona switcher dropdown on right. Three persona buttons render. Clicking one redirects (will 404 until Task 11+ creates the destination, that's fine).

- [ ] **Step 6: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): demo layout chrome — banner, header, persona switcher"
```

---

## Task 4: Vercel + DNS setup (manual, ~5 min — can be deferred)

**Note:** This is the production-deploy step. The dev server at `localhost:3000/viewsonic` works without it. Run this anytime before the pitch.

**Files:** none (config-only)

- [ ] **Step 1: Add the domain to Vercel**

```bash
VERCEL_TOKEN=$(grep ^VERCEL_TOKEN= ~/openclaw/.env | cut -d= -f2-)
TEAM=team_i6aRa1BfpZGNFOr8rM1yTyGS
curl -sX POST "https://api.vercel.com/v10/projects/prj_9bsLJwIo7QtCkegkQxjf2Cd9VM4Q/domains?teamId=$TEAM" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"viewsonic.truos.ai"}' | python3 -m json.tool
```

Expected: response includes `"name": "viewsonic.truos.ai"` and a verification record (or `verified: false` with TXT record). Save the response.

- [ ] **Step 2: Add CNAME in Cloudflare DNS**

If `truos.ai` is on Cloudflare, log into the Cloudflare dashboard and add: `CNAME viewsonic → cname.vercel-dns.com`, proxied OFF (orange cloud OFF, just DNS-only).

If `truos.ai` is on Vercel DNS, the API call above already provisioned it.

- [ ] **Step 3: Wait for cert issuance and verify**

After ~2 minutes, visit `https://viewsonic.truos.ai` — should hit the entry page (or 404 if route group not yet deployed; deploy main and retry).

- [ ] **Step 4: No commit needed** (no code changes).

---

## Task 5: Install faker + write seed generator script

**Files:**
- Modify: `package.json`
- Create: `scripts/generate-viewsonic-seed.ts`
- Create: `src/app/(viewsonic-demo)/viewsonic/_data/seed.ts`

- [ ] **Step 1: Install faker**

```bash
cd /home/marshall/Truos && npm install --save-dev @faker-js/faker
```

Expected: package.json shows `"@faker-js/faker"` under devDependencies.

- [ ] **Step 2: Create seed types and loaders**

```ts
// src/app/(viewsonic-demo)/viewsonic/_data/seed.ts
import org from './org.json';
import departments from './departments.json';
import people from './people.json';
import courses from './courses.json';
import progress from './progress.json';

export type Department = {
  id: string;
  name: string;
  region?: 'Americas' | 'EMEA' | 'APAC' | 'HQ';
  parent?: string;
  seats: number;
};

export type Person = {
  id: string;
  initials: string;
  name?: string;       // present for ~80 named seeds; undefined for anonymized rest
  email?: string;
  title: string;
  departmentId: string;
  managerId?: string;
  seatTier: 'standard' | 'plus';
  startedAt: string;   // ISO
  lastActiveAt?: string;
};

export type Course = {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  lessons: number;
  hours: number;
  tier: 'free' | 'paid' | 'plus';
};

export type Progress = {
  personId: string;
  courseId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'stalled';
  percent: number;
  completedAt?: string;  // ISO
  lastLessonAt?: string;
};

export type Org = {
  id: string;
  name: string;
  seatsContracted: number;
  seatsActive: number;
  plusTier: boolean;
  contractStart: string;
  contractEnd: string;
  monthlySpendUsd: number;
};

export const SEED = {
  org: org as Org,
  departments: departments as Department[],
  people: people as Person[],
  courses: courses as Course[],
  progress: progress as Progress[],
};

export function getDepartment(id: string) {
  return SEED.departments.find((d) => d.id === id);
}

export function getPerson(id: string) {
  return SEED.people.find((p) => p.id === id);
}

export function progressFor(personId: string) {
  return SEED.progress.filter((p) => p.personId === personId);
}

export function activationByDept() {
  return SEED.departments.map((d) => {
    const peeps = SEED.people.filter((p) => p.departmentId === d.id);
    const completedAny = peeps.filter((p) =>
      SEED.progress.some((pr) => pr.personId === p.id && pr.status === 'completed')
    ).length;
    return {
      department: d,
      total: peeps.length,
      activated: completedAny,
      pct: peeps.length === 0 ? 0 : Math.round((completedAny / peeps.length) * 100),
    };
  });
}
```

- [ ] **Step 3: Verify the loader compiles (will fail until JSON files exist — that's fine, Task 6 creates them)**

Run: `npx tsc --noEmit -p . 2>&1 | grep "_data/seed" | head -5`
Expected: errors about missing JSON files. We'll fix in Task 6.

- [ ] **Step 4: Commit (just the loader + faker dep)**

```bash
cd /home/marshall/Truos
git add package.json package-lock.json src/app/\(viewsonic-demo\)/viewsonic/_data/seed.ts
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): seed data loader types"
```

---

## Task 6: Write seed generator and produce all 5 JSON files

**Files:**
- Create: `scripts/generate-viewsonic-seed.ts`
- Create: `src/app/(viewsonic-demo)/viewsonic/_data/{org,departments,people,courses,progress}.json`
- Create: `src/app/(viewsonic-demo)/viewsonic/_data/README.md`

- [ ] **Step 1: Write the generator script**

```ts
// scripts/generate-viewsonic-seed.ts
import { faker } from '@faker-js/faker';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

faker.seed(1247);  // stable across runs

const OUT = 'src/app/(viewsonic-demo)/viewsonic/_data';
mkdirSync(OUT, { recursive: true });

// ---------- Org ----------
const org = {
  id: 'viewsonic',
  name: 'ViewSonic Corporation',
  seatsContracted: 1500,
  seatsActive: 1247,
  plusTier: true,
  contractStart: '2026-02-01',
  contractEnd: '2027-02-01',
  monthlySpendUsd: 22500,
};
writeFileSync(join(OUT, 'org.json'), JSON.stringify(org, null, 2));

// ---------- Departments ----------
type Dept = { id: string; name: string; region?: string; parent?: string; seats: number };
const departments: Dept[] = [
  { id: 'colorpro',         name: 'ColorPro Creator',          seats: 229 },
  { id: 'sales-amer',       name: 'Sales — Americas',          region: 'Americas', seats: 263 },
  { id: 'sales-emea',       name: 'Sales — EMEA',              region: 'EMEA',     seats: 186 },
  { id: 'sales-apac',       name: 'Sales — APAC',              region: 'APAC',     seats: 147 },
  { id: 'product-eng',      name: 'Product Engineering',       seats: 240 },
  { id: 'marketing',        name: 'Marketing',                 seats: 112 },
  { id: 'cust-success',     name: 'Customer Success',          seats: 79 },
  { id: 'channel-partners', name: 'Channel Partners',          seats: 72 },
  { id: 'operations',       name: 'Operations',                seats: 58 },
  { id: 'finance-legal',    name: 'Finance & Legal',           seats: 34 },
  { id: 'hr',               name: 'HR / People',               seats: 18 },
  { id: 'executive',        name: 'Executive',                 seats: 9 },
];
writeFileSync(join(OUT, 'departments.json'), JSON.stringify(departments, null, 2));

// ---------- Named seeds ----------
const NAMED = [
  { id: 'p_sarah',   name: 'Sarah Chen',         title: 'Chief Human Resources Officer', deptId: 'executive',       tier: 'plus' as const },
  { id: 'p_marcus',  name: 'Marcus Reyes',       title: 'Sales Director, Americas',      deptId: 'sales-amer',      tier: 'plus' as const },
  { id: 'p_priya',   name: 'Priya Patel',        title: 'Marketing Specialist',          deptId: 'marketing',       tier: 'plus' as const },
  { id: 'p_jordan',  name: 'Jordan Kim',         title: 'Senior AE, Americas',           deptId: 'sales-amer',      tier: 'plus' as const },
  { id: 'p_aisha',   name: 'Aisha Diop',         title: 'CS Lead, EMEA',                 deptId: 'cust-success',    tier: 'plus' as const },
  { id: 'p_tom',     name: 'Tom Schaefer',       title: 'Channel Director, EMEA',        deptId: 'channel-partners',tier: 'standard' as const },
  { id: 'p_weiling', name: 'Wei-Ling Hsu',       title: 'Senior Product Engineer',       deptId: 'product-eng',     tier: 'plus' as const },
  { id: 'p_daniel',  name: "Daniel O'Connor",    title: 'AE, Americas',                  deptId: 'sales-amer',      tier: 'plus' as const },
  { id: 'p_mei',     name: 'Mei Tanaka',         title: 'ColorPro Creator Lead',         deptId: 'colorpro',        tier: 'plus' as const },
  { id: 'p_cristina',name: 'Cristina Vargas',    title: 'Marketing Manager',             deptId: 'marketing',       tier: 'plus' as const },
  { id: 'p_olu',     name: 'Olu Akande',         title: 'AE, EMEA',                      deptId: 'sales-emea',      tier: 'standard' as const },
  { id: 'p_hiroshi', name: 'Hiroshi Sato',       title: 'AE, APAC',                      deptId: 'sales-apac',      tier: 'plus' as const },
  { id: 'p_lukas',   name: 'Lukas Becker',       title: 'Product Manager',               deptId: 'product-eng',     tier: 'plus' as const },
  { id: 'p_fatima',  name: 'Fatima Al-Hassan',   title: 'Sales Engineer, EMEA',          deptId: 'sales-emea',      tier: 'plus' as const },
];

// ---------- People ----------
type Person = {
  id: string;
  initials: string;
  name?: string;
  email?: string;
  title: string;
  departmentId: string;
  managerId?: string;
  seatTier: 'standard' | 'plus';
  startedAt: string;
  lastActiveAt?: string;
};

const people: Person[] = [];

// Add named seeds first
for (const n of NAMED) {
  people.push({
    id: n.id,
    initials: n.name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
    name: n.name,
    email: `${n.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@viewsonic.com`,
    title: n.title,
    departmentId: n.deptId,
    seatTier: n.tier,
    startedAt: faker.date.between({ from: '2026-02-01', to: '2026-04-01' }).toISOString(),
    lastActiveAt: faker.date.recent({ days: 14 }).toISOString(),
  });
}

// Fill out the remaining seats per department with anonymized people
for (const dept of departments) {
  const namedInDept = people.filter((p) => p.departmentId === dept.id).length;
  const need = dept.seats - namedInDept;
  for (let i = 0; i < need; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const initials = (first[0] + last[0]).toUpperCase();
    people.push({
      id: `${dept.id}_${i.toString().padStart(4, '0')}`,
      initials,
      title: dept.name,
      departmentId: dept.id,
      seatTier: dept.id === 'executive' || dept.id === 'colorpro' || faker.number.int({ min: 0, max: 100 }) < 60 ? 'plus' : 'standard',
      startedAt: faker.date.between({ from: '2026-02-01', to: '2026-04-15' }).toISOString(),
      lastActiveAt: faker.helpers.maybe(() => faker.date.recent({ days: 30 }).toISOString(), { probability: 0.7 }),
    });
  }
}
writeFileSync(join(OUT, 'people.json'), JSON.stringify(people, null, 2));

// ---------- Courses ----------
const courses = [
  { id: 101, code: 'AI·101', title: 'AI Foundations',      subtitle: 'No jargon, no coding. What AI actually is, how to talk to it, and how to use it without embarrassing yourself.', lessons: 20, hours: 1,   tier: 'free' as const },
  { id: 102, code: 'AI·102', title: 'AI Prompt Mastery',   subtitle: 'Prompt patterns, research, writing, meetings, data. The daily toolkit.',                                       lessons: 24, hours: 1.5, tier: 'paid' as const },
  { id: 103, code: 'AI·103', title: 'Applied AI at Work',  subtitle: 'Sales, marketing, CS, ops, finance — real playbooks for commercial teams.',                                    lessons: 32, hours: 2,   tier: 'paid' as const },
  { id: 104, code: 'AI·104', title: 'AI Workflow Mastery', subtitle: 'Design, ship, and defend a real AI workflow inside your team.',                                                lessons: 28, hours: 2.5, tier: 'paid' as const },
  { id: 105, code: 'AI·105', title: 'AI Mastery Capstone', subtitle: 'A real, portfolio-worthy project you complete and own.',                                                       lessons: 22, hours: 5,   tier: 'plus' as const },
];
writeFileSync(join(OUT, 'courses.json'), JSON.stringify(courses, null, 2));

// ---------- Progress ----------
// Tune so dept activation matches the spec: ColorPro 84%, Sales-Amer 72%, Product-Eng 62%,
// Marketing 48%, CS 39%, Channel Partners 11%, others 30-50% range.
const ACTIVATION_TARGET: Record<string, number> = {
  'colorpro':         0.84,
  'sales-amer':       0.72,
  'product-eng':      0.62,
  'sales-emea':       0.55,
  'sales-apac':       0.50,
  'marketing':        0.48,
  'cust-success':     0.39,
  'operations':       0.42,
  'finance-legal':    0.35,
  'hr':               0.55,
  'executive':        0.78,
  'channel-partners': 0.11,
};

type Prog = {
  personId: string;
  courseId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'stalled';
  percent: number;
  completedAt?: string;
  lastLessonAt?: string;
};
const progress: Prog[] = [];

for (const person of people) {
  const target = ACTIVATION_TARGET[person.departmentId] ?? 0.4;
  const isActive = faker.number.float() < target;
  if (!isActive) {
    // Maybe started a single course
    if (faker.number.float() < 0.25) {
      progress.push({
        personId: person.id,
        courseId: 101,
        status: 'in_progress',
        percent: faker.number.int({ min: 5, max: 40 }),
        lastLessonAt: faker.date.recent({ days: 21 }).toISOString(),
      });
    }
    continue;
  }
  // Active: completed AI·101, in progress on AI·102, maybe more
  progress.push({
    personId: person.id,
    courseId: 101,
    status: 'completed',
    percent: 100,
    completedAt: faker.date.between({ from: '2026-02-15', to: '2026-04-15' }).toISOString(),
  });
  const continued = faker.number.float() < 0.7;
  if (continued) {
    const status102 = faker.number.float() < 0.5 ? 'completed' : 'in_progress';
    progress.push({
      personId: person.id,
      courseId: 102,
      status: status102 as Prog['status'],
      percent: status102 === 'completed' ? 100 : faker.number.int({ min: 30, max: 90 }),
      completedAt: status102 === 'completed' ? faker.date.recent({ days: 21 }).toISOString() : undefined,
      lastLessonAt: faker.date.recent({ days: 7 }).toISOString(),
    });
  }
  // Plus-tier folks more likely to be on AI·103+
  if (person.seatTier === 'plus' && faker.number.float() < 0.4) {
    progress.push({
      personId: person.id,
      courseId: 103,
      status: 'in_progress',
      percent: faker.number.int({ min: 10, max: 70 }),
      lastLessonAt: faker.date.recent({ days: 5 }).toISOString(),
    });
  }
}
writeFileSync(join(OUT, 'progress.json'), JSON.stringify(progress, null, 2));

// ---------- README ----------
writeFileSync(join(OUT, 'README.md'), `# ViewSonic Demo Seed Data

Generated by \`scripts/generate-viewsonic-seed.ts\`. Re-run with:

    npx tsx scripts/generate-viewsonic-seed.ts

Faker seed is fixed at 1247 so output is stable across runs.

Files:
- \`org.json\` — ViewSonic org metadata
- \`departments.json\` — 12 departments, seats sum to 1,247
- \`people.json\` — 1,247 people including ~14 named seeds (Sarah Chen, Marcus Reyes, Priya Patel, etc.)
- \`courses.json\` — Truos course catalog (5 courses)
- \`progress.json\` — per-person × per-course completion records, tuned to match dept activation targets in the spec
`);

console.log(`Wrote ${departments.length} departments, ${people.length} people, ${courses.length} courses, ${progress.length} progress records to ${OUT}`);
```

- [ ] **Step 2: Run the generator**

```bash
cd /home/marshall/Truos && npx tsx scripts/generate-viewsonic-seed.ts
```

Expected: prints "Wrote 12 departments, 1247 people, 5 courses, ~1700 progress records to src/app/(viewsonic-demo)/viewsonic/_data". The five JSON files exist.

- [ ] **Step 3: Verify shape**

```bash
cd /home/marshall/Truos
python3 -c "import json; d=json.load(open('src/app/(viewsonic-demo)/viewsonic/_data/people.json')); print('count:', len(d)); print('first named:', [p for p in d if p.get('name')][:3])"
```

Expected: count: 1247; first named: Sarah Chen, Marcus Reyes, Priya Patel.

- [ ] **Step 4: Verify the loader compiles**

Run: `npx tsc --noEmit -p .`
Expected: no errors related to `_data/`.

- [ ] **Step 5: Commit**

```bash
cd /home/marshall/Truos
git add scripts/generate-viewsonic-seed.ts src/app/\(viewsonic-demo\)/viewsonic/_data/
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): seed data — 1,247 people, 12 depts, progress records"
```

---

## Task 7: TabStrip component

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/TabStrip.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/TabStrip.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type Tab = { label: string; href: string };

export function TabStrip({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      background: 'var(--bg)',
    }}>
      {tabs.map((tab) => {
        // active when pathname === tab.href, OR when pathname starts with href and href is not the parent root
        const active = pathname === tab.href ||
          (tab.href !== tabs[0]?.href && pathname.startsWith(tab.href + '/'));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '14px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: active ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 120ms ease, border-color 120ms ease',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors related to TabStrip.

- [ ] **Step 3: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/_components/TabStrip.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): TabStrip component"
```

---

## Task 8: MetricCard + DepartmentBar components

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/MetricCard.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/DepartmentBar.tsx`

- [ ] **Step 1: MetricCard**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/MetricCard.tsx
type Props = {
  label: string;
  value: string | number;
  delta?: { direction: 'up' | 'down'; magnitude: string; positive?: boolean };
  sublabel?: string;
};

export function MetricCard({ label, value, delta, sublabel }: Props) {
  const deltaColor = delta?.positive === false ? 'var(--danger)'
    : delta?.direction === 'up' ? 'var(--success)' : 'var(--warn)';

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minHeight: 124,
    }}>
      <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05, marginTop: 6 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 12, color: deltaColor, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
          {delta.direction === 'up' ? '↑' : '↓'} {delta.magnitude}
        </div>
      )}
      {sublabel && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 'auto' }}>{sublabel}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: DepartmentBar**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/DepartmentBar.tsx
type Props = {
  name: string;
  pct: number;
  count: number;
  total: number;
  flag?: 'risk' | 'win';
};

export function DepartmentBar({ name, pct, count, total, flag }: Props) {
  const fillColor = flag === 'risk' ? 'var(--danger)' : flag === 'win' ? 'var(--success)' : 'var(--accent)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px', gap: 16, alignItems: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        {flag === 'risk' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />}
        {flag === 'win' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />}
        {name}
      </div>
      <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: '100%',
          background: fillColor,
          opacity: flag === 'risk' ? 0.85 : 1,
          transition: 'width 600ms ease',
        }} />
      </div>
      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>
        {pct}%  <span style={{ color: 'var(--text-dim)' }}>{count}/{total}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/_components/
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): MetricCard and DepartmentBar components"
```

---

## Task 9: SlideOver + CertThumb components

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/SlideOver.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/CertThumb.tsx`

- [ ] **Step 1: SlideOver**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/SlideOver.tsx
'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
};

export function SlideOver({ open, onClose, title, children, width = 480 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,11,13,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 60,
        }}
      />
      <aside
        role="dialog"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width,
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          transform: `translateX(${open ? '0' : '100%'})`,
          transition: 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1)',
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {title && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
            <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: CertThumb**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/CertThumb.tsx
type Props = {
  courseCode: string;
  courseTitle: string;
  hash: string;
  issuedAt: string;
};

export function CertThumb({ courseCode, courseTitle, hash, issuedAt }: Props) {
  return (
    <div style={{
      background: 'var(--paper)',
      color: '#0A0B0D',
      borderRadius: 6,
      aspectRatio: '1.414 / 1',
      padding: 16,
      position: 'relative',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer',
    }}>
      <div aria-hidden style={{ position: 'absolute', inset: 6, border: '1px solid rgba(10,11,13,0.25)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: '#0A0B0D', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>T</div>
          <span style={{ fontSize: 9, fontWeight: 600 }}>Truos</span>
        </div>
        <div style={{ fontSize: 7, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#5B5F68' }}>{hash}</div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 7, color: '#5B5F68', letterSpacing: '0.18em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Certificate
        </div>
        <div className="serif" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, lineHeight: 1.15 }}>
          {courseTitle}
        </div>
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#5B5F68', marginTop: 6 }}>
          {courseCode}  ·  {issuedAt}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/_components/
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): SlideOver and CertThumb components"
```

---

## Task 10: Admin layout (with tab strip)

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/admin/layout.tsx`

- [ ] **Step 1: Write the admin layout**

```tsx
// src/app/(viewsonic-demo)/viewsonic/admin/layout.tsx
import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Pulse',   href: '/viewsonic/admin' },
  { label: 'People',  href: '/viewsonic/admin/people' },
  { label: 'Onboard', href: '/viewsonic/admin/onboard' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '32px 32px 80px' }}>{children}</div>
    </>
  );
}
```

- [ ] **Step 2: Visit and verify**

Visit `http://localhost:3000/viewsonic/admin` (will 404 on the page but the layout's tabs should be visible after the next task creates the page).

Confirm the file compiles: `npx tsc --noEmit -p . | grep admin`. Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/admin/layout.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): admin layout + tab strip"
```

---

## Task 11: Admin Pulse tab

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/admin/page.tsx`

- [ ] **Step 1: Write the Pulse page**

```tsx
// src/app/(viewsonic-demo)/viewsonic/admin/page.tsx
import Link from 'next/link';
import { SEED, activationByDept } from '../_data/seed';
import { MetricCard } from '../_components/MetricCard';
import { DepartmentBar } from '../_components/DepartmentBar';

export default function AdminPulse() {
  const totals = activationByDept();
  const totalActivated = totals.reduce((s, t) => s + t.activated, 0);
  const totalPeople = SEED.people.length;
  const orgPct = Math.round((totalActivated / totalPeople) * 100);
  const certsEarned = SEED.progress.filter((p) => p.status === 'completed').length;

  // Sort departments by activation pct descending
  const sortedTotals = [...totals].sort((a, b) => b.pct - a.pct);

  // Risk list — depts under 20% activation, plus topical alerts
  const riskDepts = totals.filter((t) => t.pct < 20);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>This quarter</div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Org pulse</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          LIVE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <MetricCard label="Active learners"         value={totalActivated.toLocaleString()} delta={{ direction: 'up', magnitude: '14%' }} />
        <MetricCard label="Org-wide activation"     value={`${orgPct}%`}                    delta={{ direction: 'up', magnitude: '8 pts' }} />
        <MetricCard label="Certificates earned"     value={certsEarned.toLocaleString()}    delta={{ direction: 'up', magnitude: '47' }} />
        <MetricCard label="Training hours saved"    value="$148K"                            sublabel="Estimated based on hours-to-certify benchmark" />
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>Activation by department</h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Last 30 days
          </span>
        </div>
        <div>
          {sortedTotals.map((t) => (
            <DepartmentBar
              key={t.department.id}
              name={t.department.name}
              pct={t.pct}
              count={t.activated}
              total={t.total}
              flag={t.pct >= 75 ? 'win' : t.pct < 20 ? 'risk' : undefined}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500 }}>Risk list</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>({riskDepts.length})</span>
          </div>
          {riskDepts.map((d) => (
            <Link key={d.department.id} href="/viewsonic/admin/people" style={{ display: 'block', padding: '8px 0', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--danger)' }}>▸</span>{' '}
              {d.total - d.activated} in {d.department.name} — {d.pct}% activation
            </Link>
          ))}
          <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--warn)' }}>▸</span>{' '}
            Q2 deadline at 38 days, {totalPeople - totalActivated} not started
          </div>
        </div>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Top learners this week</h3>
          {[
            { name: 'Jordan Kim',   hours: 18 },
            { name: 'Aisha Diop',   hours: 14 },
            { name: 'Tom Schaefer', hours: 12 },
            { name: 'Wei-Ling Hsu', hours: 11 },
            { name: 'Mei Tanaka',   hours: 9 },
          ].map((p, i) => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <span><span style={{ color: 'var(--text-dim)', marginRight: 8, fontFamily: 'var(--font-mono)' }}>{i + 1}</span>{p.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.hours} hrs</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing card */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Seat utilization</div>
          <div style={{ fontSize: 22, marginTop: 4 }}>
            <span style={{ fontWeight: 600 }}>{SEED.org.seatsActive.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}> / {SEED.org.seatsContracted.toLocaleString()} seats</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            ${SEED.org.monthlySpendUsd.toLocaleString()}/mo  ·  Contract through {new Date(SEED.org.contractEnd).toLocaleDateString()}
          </div>
        </div>
        <Link href="#" style={{ fontSize: 13, color: 'var(--accent)' }}>Activate remaining {SEED.org.seatsContracted - SEED.org.seatsActive} seats →</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visit and verify**

Visit `http://localhost:3000/viewsonic/admin`.
Expected: Three tabs at top with "Pulse" underlined in lime. Four metric cards (Active learners 797ish, Org activation 64%ish, Certs earned, $148K). Activation by department list with ColorPro Creator at top (green flag), Channel Partners at bottom (red flag). Risk list and Top learners cards. Billing card at bottom.

- [ ] **Step 3: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/admin/page.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): admin Pulse tab with metrics, dept bars, risk list, billing"
```

---

## Task 12: Admin People matrix

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/PeopleMatrix.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/admin/people/page.tsx`

- [ ] **Step 1: Write PeopleMatrix component**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/PeopleMatrix.tsx
'use client';

import { useMemo, useState } from 'react';
import { SEED, type Person } from '../_data/seed';
import { SlideOver } from './SlideOver';

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

const COURSE_COLS = [
  { id: 101, label: 'AI·101' },
  { id: 102, label: 'AI·102' },
  { id: 103, label: 'AI·103' },
  { id: 104, label: 'AI·104' },
  { id: 105, label: 'AI·105' },
];

export function PeopleMatrix({ scope = 'all' }: { scope?: 'all' | string }) {  // scope = department id or 'all'
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Person | null>(null);

  const baseFiltered = useMemo(() => {
    let list: Person[] = SEED.people;
    if (scope !== 'all') list = list.filter((p) => p.departmentId === scope);
    if (deptFilter) list = list.filter((p) => p.departmentId === deptFilter);
    if (statusFilter !== 'all') {
      list = list.filter((p) => {
        const prog = SEED.progress.filter((pr) => pr.personId === p.id);
        if (statusFilter === 'not_started') return prog.length === 0;
        return prog.some((pr) => pr.status === statusFilter);
      });
    }
    return list;
  }, [scope, deptFilter, statusFilter]);

  // Render only first 200 rows for perf — order: named first, then by initials
  const VISIBLE_LIMIT = 200;
  const ordered = useMemo(() => {
    return [...baseFiltered].sort((a, b) => (a.name ? -1 : 1) - (b.name ? -1 : 1));
  }, [baseFiltered]);
  const visible = ordered.slice(0, VISIBLE_LIMIT);

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SEED.departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(deptFilter === d.id ? null : d.id)}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: deptFilter === d.id ? 'var(--accent)' : 'var(--bg-panel)',
              color: deptFilter === d.id ? 'var(--accent-ink)' : 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {d.name}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {(['all', 'completed', 'in_progress', 'not_started'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: statusFilter === s ? 'var(--bg-hover)' : 'var(--bg-panel)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {s === 'all' ? 'All' : s === 'completed' ? '✓ Done' : s === 'in_progress' ? '◐ In progress' : '◯ Not started'}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        Showing {visible.length} of {baseFiltered.length} people
        {baseFiltered.length > VISIBLE_LIMIT && ' (top 200; use filters to narrow)'}
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 200px 80px repeat(5, 70px)', gap: 0, padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <div></div>
          <div>Name</div>
          <div>Department</div>
          <div>Tier</div>
          {COURSE_COLS.map((c) => <div key={c.id} style={{ textAlign: 'center' }}>{c.label}</div>)}
        </div>
        {visible.map((p) => {
          const personProg = SEED.progress.filter((pr) => pr.personId === p.id);
          return (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 200px 80px repeat(5, 70px)',
                gap: 0,
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 13,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-hover)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.initials}</div>
              <div>
                <div>{p.name ?? p.initials}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.title}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SEED.departments.find((d) => d.id === p.departmentId)?.name}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: p.seatTier === 'plus' ? 'var(--accent)' : 'var(--text-muted)' }}>
                {p.seatTier === 'plus' ? '✦ PLUS' : 'Std'}
              </div>
              {COURSE_COLS.map((c) => {
                const pr = personProg.find((x) => x.courseId === c.id);
                let badge = '—';
                let color = 'var(--text-dim)';
                if (pr?.status === 'completed') { badge = '✓'; color = 'var(--success)'; }
                else if (pr?.status === 'in_progress') { badge = `${pr.percent}%`; color = 'var(--warn)'; }
                else if (pr?.status === 'stalled') { badge = '⚠'; color = 'var(--danger)'; }
                return <div key={c.id} style={{ textAlign: 'center', color, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{badge}</div>;
              })}
            </div>
          );
        })}
      </div>

      <SlideOver open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? selected?.initials ?? 'Person'}>
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-hover)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {selected.initials}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{selected.name ?? selected.initials}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                  {SEED.departments.find((d) => d.id === selected.departmentId)?.name}
                </div>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>Course progress</div>
            {SEED.progress.filter((p) => p.personId === selected.id).map((pr) => {
              const course = SEED.courses.find((c) => c.id === pr.courseId);
              return (
                <div key={pr.courseId} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{course?.code} {course?.title}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: pr.status === 'completed' ? 'var(--success)' : 'var(--warn)' }}>
                      {pr.status === 'completed' ? '✓ Complete' : `${pr.percent}%`}
                    </span>
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>Nudge</button>
              <button style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>Reassign</button>
              <button style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, cursor: 'pointer' }}>Upgrade to Plus</button>
            </div>
          </div>
        )}
      </SlideOver>
    </>
  );
}
```

- [ ] **Step 2: Write the People page**

```tsx
// src/app/(viewsonic-demo)/viewsonic/admin/people/page.tsx
import { PeopleMatrix } from '../../_components/PeopleMatrix';

export default function AdminPeople() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Roster</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>People</h1>
      </div>
      <PeopleMatrix scope="all" />
    </div>
  );
}
```

- [ ] **Step 3: Visit and verify**

Visit `http://localhost:3000/viewsonic/admin/people`.
Expected: Department filter pills across top, status pills on right. Table with up to 200 rows. Named seeds appear first (Sarah, Marcus, Priya). Click a row → slide-over opens with progress and 3 action buttons. Press Escape or click backdrop → closes.

- [ ] **Step 4: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/_components/PeopleMatrix.tsx src/app/\(viewsonic-demo\)/viewsonic/admin/people/page.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): admin People tab — matrix, filters, slide-over"
```

---

## Task 13: Admin Onboard wizard

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/OnboardWizard.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/admin/onboard/page.tsx`

- [ ] **Step 1: Write the wizard**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/OnboardWizard.tsx
'use client';

import { useMemo, useState } from 'react';

type Step = 1 | 2 | 3;

const SAMPLE_PASTE = `sarah.chen@viewsonic.com,Sarah Chen,Executive
marcus.reyes@viewsonic.com,Marcus Reyes,Sales — Americas
priya.patel@viewsonic.com,Priya Patel,Marketing
jordan.kim@viewsonic.com,Jordan Kim,Sales — Americas
aisha.diop@viewsonic.com,Aisha Diop,Customer Success
tom.schaefer@viewsonic.com,Tom Schaefer,Channel Partners`;

export function OnboardWizard() {
  const [step, setStep] = useState<Step>(1);
  const [paste, setPaste] = useState('');
  const [launched, setLaunched] = useState(false);

  // Parse rows (1 per line, comma-separated)
  const parsed = useMemo(() => {
    if (!paste.trim()) return [] as { email: string; name: string; dept: string }[];
    return paste.trim().split(/\n+/).map((line) => {
      const [email, name, dept] = line.split(',').map((s) => s?.trim() ?? '');
      return { email, name, dept };
    }).filter((r) => r.email);
  }, [paste]);

  const detectedCount = parsed.length;
  const fakedCount = paste.trim() ? 847 : 0;  // demo flair: pretend the parser found more

  // Group by dept (use parsed dept or fall back)
  const grouped = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of parsed) m.set(r.dept || 'Unassigned', (m.get(r.dept || 'Unassigned') ?? 0) + 1);
    // Pad to feel like 847 across realistic departments
    if (parsed.length && parsed.length < 847) {
      const pads = [
        ['ColorPro Creator', 145], ['Sales — Americas', 178], ['Sales — EMEA', 122],
        ['Product Engineering', 156], ['Marketing', 73], ['Customer Success', 51],
        ['Channel Partners', 48], ['Operations', 38], ['Finance & Legal', 22], ['HR / People', 14],
      ] as const;
      for (const [dept, n] of pads) m.set(dept, (m.get(dept) ?? 0) + n);
    }
    return Array.from(m.entries()).map(([dept, count]) => ({ dept, count }));
  }, [parsed]);

  if (launched) {
    return (
      <div style={{ maxWidth: 720, margin: '64px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>✦</div>
        <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 16 }}>847 invites scheduled.</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
          64% of large rollouts hit 70% activation in two weeks — we'll have you there by{' '}
          <strong style={{ color: 'var(--text)' }}>{new Date(Date.now() + 14 * 86400000).toLocaleDateString()}</strong>.
        </p>
        <div style={{ marginTop: 28, padding: 14, background: 'var(--bg-panel)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-muted)' }}>
          First wave: ColorPro Creator (229)  ·  Sending now
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= n ? 'var(--accent)' : 'var(--bg-hover)',
              color: step >= n ? 'var(--accent-ink)' : 'var(--text-muted)',
              display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}>{n}</div>
            <div style={{ fontSize: 13, color: step >= n ? 'var(--text)' : 'var(--text-muted)' }}>
              {n === 1 ? 'Paste roster' : n === 2 ? 'Confirm structure' : 'Pick rollout'}
            </div>
            {n < 3 && <div style={{ width: 32, height: 1, background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 8 }}>Paste your roster</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>
            Emails, names, or your full org CSV (email,name,department per line).
          </p>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder={SAMPLE_PASTE}
            rows={10}
            style={{
              width: '100%',
              padding: 16,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <button
              onClick={() => setPaste(SAMPLE_PASTE)}
              style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Paste sample
            </button>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              Detected {fakedCount.toLocaleString()} people
            </div>
          </div>

          <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-panel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Or connect</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              {['Workday', 'Okta', 'BambooHR', 'Google Workspace', 'Microsoft 365'].map((p) => (
                <span key={p} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>{p}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              onClick={() => setStep(2)}
              disabled={!parsed.length}
              style={{
                padding: '10px 20px',
                background: parsed.length ? 'var(--accent)' : 'var(--bg-hover)',
                color: parsed.length ? 'var(--accent-ink)' : 'var(--text-dim)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14, fontWeight: 600,
                cursor: parsed.length ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Confirm structure →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 8 }}>Confirm structure</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>
            We grouped these by email pattern. Edit anything that's wrong.
          </p>
          <div style={{ background: 'var(--accent)', color: 'var(--accent-ink)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 12, marginBottom: 16 }}>
            ✦ AI-suggested groupings — drag people between teams to adjust.
          </div>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {grouped.slice(0, 10).map((g, i) => (
              <div key={g.dept} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < 9 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 14 }}>{g.dept}</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{g.count} people</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>← Back</button>
            <button
              onClick={() => setStep(3)}
              style={{ padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Next: Pick rollout →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 8 }}>Pick your rollout</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
            How aggressive do you want to be? Most large orgs go with waves.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { id: 'all',   title: 'Invite all today',   sub: '847 emails, send now',                        recommended: false },
              { id: 'wave',  title: 'Wave by department', sub: 'ColorPro first, then Sales, then the rest',   recommended: true },
              { id: 'pilot', title: 'Pilot first 50',     sub: 'Test the experience before full rollout',     recommended: false },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLaunched(true)}
                style={{
                  padding: 20,
                  background: 'var(--bg-panel)',
                  border: opt.recommended ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  color: 'var(--text)',
                }}
              >
                {opt.recommended && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, color: 'var(--accent-ink)', background: 'var(--accent)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.1em' }}>
                    RECOMMENDED
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button onClick={() => setStep(2)} style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

```tsx
// src/app/(viewsonic-demo)/viewsonic/admin/onboard/page.tsx
import { OnboardWizard } from '../../_components/OnboardWizard';

export default function AdminOnboard() {
  return (
    <div>
      <div style={{ maxWidth: 1280, margin: '0 auto', marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Bulk add & invite</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Onboard</h1>
      </div>
      <OnboardWizard />
    </div>
  );
}
```

- [ ] **Step 3: Visit and verify the full flow**

Visit `http://localhost:3000/viewsonic/admin/onboard`.

1. Step 1 page renders. Click "Paste sample" → textarea fills, "Detected 847 people" appears in lime, Next button enables.
2. Click Next → Step 2 shows AI-suggestion banner and 10 department rows.
3. Click Next → Step 3 shows three rollout cards with "RECOMMENDED" badge on the middle one.
4. Click any card → success page: "847 invites scheduled."

- [ ] **Step 4: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/_components/OnboardWizard.tsx src/app/\(viewsonic-demo\)/viewsonic/admin/onboard/page.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): admin Onboard tab — 3-step wizard with paste-parse"
```

---

## Task 14: Manager layout

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/manager/layout.tsx`

- [ ] **Step 1: Write the manager layout**

```tsx
// src/app/(viewsonic-demo)/viewsonic/manager/layout.tsx
import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Pulse', href: '/viewsonic/manager' },
  { label: 'Team',  href: '/viewsonic/manager/team' },
  { label: 'Nudge', href: '/viewsonic/manager/nudge' },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '32px 32px 80px' }}>{children}</div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/manager/layout.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): manager layout"
```

---

## Task 15: Manager Pulse / Team / Nudge tabs

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/manager/page.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/manager/team/page.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/manager/nudge/page.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/_components/NudgeComposer.tsx`

- [ ] **Step 1: Manager Pulse**

```tsx
// src/app/(viewsonic-demo)/viewsonic/manager/page.tsx
import Link from 'next/link';
import { SEED } from '../_data/seed';
import { MetricCard } from '../_components/MetricCard';

export default function ManagerPulse() {
  const myTeam = SEED.people.filter((p) => p.departmentId === 'sales-amer');
  const completed = myTeam.filter((p) =>
    SEED.progress.some((pr) => pr.personId === p.id && pr.status === 'completed')
  );
  const inProgress = myTeam.filter((p) =>
    !completed.includes(p) && SEED.progress.some((pr) => pr.personId === p.id && pr.status === 'in_progress')
  );
  const notStarted = myTeam.length - completed.length - inProgress.length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>My team — Sales Americas</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Team pulse</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Team size"       value={myTeam.length} />
        <MetricCard label="Certified"       value={completed.length} delta={{ direction: 'up', magnitude: '6' }} />
        <MetricCard label="In progress"     value={inProgress.length} />
        <MetricCard label="Not started"     value={notStarted} delta={{ direction: 'down', magnitude: '4', positive: true }} />
      </div>

      <div style={{
        background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-hover))',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius)',
        padding: '24px 28px',
      }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8 }}>QUICK WIN</div>
        <h2 style={{ fontSize: 20, letterSpacing: '-0.02em', marginBottom: 8 }}>
          12 reps haven't started AI Foundations.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
          One-click nudge with personalized auto-emails. Average response: 47% start within 24 hours.
        </p>
        <Link
          href="/viewsonic/manager/nudge"
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Nudge 12 reps →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manager Team (reuses PeopleMatrix scoped to sales-amer)**

```tsx
// src/app/(viewsonic-demo)/viewsonic/manager/team/page.tsx
import { PeopleMatrix } from '../../_components/PeopleMatrix';

export default function ManagerTeam() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Sales — Americas</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>My 263 reps</h1>
      </div>
      <PeopleMatrix scope="sales-amer" />
    </div>
  );
}
```

- [ ] **Step 3: NudgeComposer component**

```tsx
// src/app/(viewsonic-demo)/viewsonic/_components/NudgeComposer.tsx
'use client';

import { useState } from 'react';
import { SEED } from '../_data/seed';

const TEMPLATES = [
  { id: 'friendly', label: 'Friendly reminder',     body: 'Hey {{first}} — saw you haven\'t started AI Foundations yet. Just an hour. No coding. You\'ll thank yourself.' },
  { id: 'deadline', label: 'Deadline approaching',  body: 'Hi {{first}} — Q2 deadline for AI Foundations is 30 days out. Most reps finish in under 90 minutes.' },
  { id: 'manager',  label: 'Manager check-in',      body: '{{first}}, this is {{me}}. AI Foundations is a 1-hour first step toward the team certification. Carving out time this week?' },
];

export function NudgeComposer() {
  const [template, setTemplate] = useState(TEMPLATES[1]);
  const [sent, setSent] = useState(false);

  // 12 stragglers — first 12 in sales-amer who have no progress
  const stragglers = SEED.people
    .filter((p) => p.departmentId === 'sales-amer')
    .filter((p) => !SEED.progress.some((pr) => pr.personId === p.id))
    .slice(0, 12);

  if (sent) {
    return (
      <div style={{ maxWidth: 600, margin: '64px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>✓</div>
        <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginTop: 12 }}>12 reminders queued.</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>
          Sending in the next 5 minutes. We'll notify you when 6+ open the email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Pick a template</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                borderRadius: 999,
                border: '1px solid var(--border)',
                background: template.id === t.id ? 'var(--accent)' : 'var(--bg-panel)',
                color: template.id === t.id ? 'var(--accent-ink)' : 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Preview</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {template.body.replace('{{first}}', 'Jordan').replace('{{me}}', 'Marcus')}
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Recipients</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stragglers.length} people</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {stragglers.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', fontSize: 12 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.initials}</span>
              {p.name ?? p.initials}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setSent(true)}
          style={{
            padding: '12px 24px',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Send 12 reminders →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Manager Nudge page**

```tsx
// src/app/(viewsonic-demo)/viewsonic/manager/nudge/page.tsx
import { NudgeComposer } from '../../_components/NudgeComposer';

export default function ManagerNudge() {
  return (
    <div>
      <div style={{ maxWidth: 1100, margin: '0 auto', marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Re-engage</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Nudge stragglers</h1>
      </div>
      <NudgeComposer />
    </div>
  );
}
```

- [ ] **Step 5: Visit and verify all three manager tabs**

- `/viewsonic/manager` → Pulse: 4 metric cards + "12 reps haven't started" hero card with lime CTA.
- `/viewsonic/manager/team` → People matrix scoped to Sales — Americas (~263 reps).
- `/viewsonic/manager/nudge` → 3 template chips, preview block, 12-recipient grid, big "Send 12 reminders" button. Clicking it shows success page.

- [ ] **Step 6: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/manager/ src/app/\(viewsonic-demo\)/viewsonic/_components/NudgeComposer.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): manager 3-tab persona — Pulse, Team, Nudge"
```

---

## Task 16: Learner layout

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/learn/layout.tsx`

- [ ] **Step 1: Write the layout**

```tsx
// src/app/(viewsonic-demo)/viewsonic/learn/layout.tsx
import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Home',         href: '/viewsonic/learn' },
  { label: 'Courses',      href: '/viewsonic/learn/courses' },
  { label: 'Certificates', href: '/viewsonic/learn/certificates' },
];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '48px 32px 80px' }}>{children}</div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/learn/layout.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): learner layout"
```

---

## Task 17: Learner Home / Courses / Certificates tabs

**Files:**
- Create: `src/app/(viewsonic-demo)/viewsonic/learn/page.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/learn/courses/page.tsx`
- Create: `src/app/(viewsonic-demo)/viewsonic/learn/certificates/page.tsx`

- [ ] **Step 1: Learner Home (Priya's view)**

```tsx
// src/app/(viewsonic-demo)/viewsonic/learn/page.tsx
import { SEED } from '../_data/seed';
import { CertThumb } from '../_components/CertThumb';

export default function LearnerHome() {
  const me = SEED.people.find((p) => p.id === 'p_priya')!;
  const myProgress = SEED.progress.filter((p) => p.personId === me.id);
  // Pretend Priya has 3 completed (force the data even if generator gave fewer)
  const completed = [
    { courseId: 101, hash: '0x4F2A-1C9E', issuedAt: '2026·03·12' },
    { courseId: 102, hash: '0x8B14-3D77', issuedAt: '2026·04·02' },
    { courseId: 103, hash: '0x2E89-A411', issuedAt: '2026·04·19' },
  ];
  const inProgressCourse = SEED.courses.find((c) => c.id === 104)!;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <div className="serif" style={{ fontSize: 32, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
        ✦ Welcome back, {me.name?.split(' ')[0]}
      </div>

      <div style={{
        marginTop: 40,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        textAlign: 'left',
      }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Pick up where you left off</div>
        <div style={{ fontSize: 20, marginTop: 6, fontWeight: 500 }}>{inProgressCourse.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Lesson 12 of 24 — Frameworks for repeatable output</div>
        <div style={{ marginTop: 16, height: 6, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: '50%', height: '100%', background: 'var(--accent)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>50%</span>
          <button style={{
            padding: '8px 16px', background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Resume ➜</button>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>Your earned credentials</h2>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{completed.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {completed.map((c) => {
            const course = SEED.courses.find((cc) => cc.id === c.courseId)!;
            return <CertThumb key={c.courseId} courseCode={course.code} courseTitle={course.title} hash={c.hash} issuedAt={c.issuedAt} />;
          })}
        </div>
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <a href="#" style={{ fontSize: 13, color: 'var(--accent)' }}>Share to LinkedIn ↗</a>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'left' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 14 }}>Up next, recommended for Marketing</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {[104, 105].map((id) => {
            const c = SEED.courses.find((cc) => cc.id === id)!;
            return (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.title} {c.tier === 'plus' && <span style={{ marginLeft: 8, fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>✦ PLUS</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.lessons} lessons · {c.hours}h</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>▢</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 40, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Streak: 11 days  ·  Hours this month: 7.3
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Learner Courses**

```tsx
// src/app/(viewsonic-demo)/viewsonic/learn/courses/page.tsx
import { SEED } from '../../_data/seed';

export default function LearnerCourses() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Available to you</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 24 }}>Courses</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {SEED.courses.map((c) => (
          <div key={c.id} style={{
            padding: 24,
            background: 'var(--bg-panel)',
            border: c.tier === 'plus' ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{c.code}</span>
                {c.tier === 'plus' && <span style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>✦ PLUS</span>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{c.subtitle}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                {c.lessons} lessons  ·  {c.hours}h
              </div>
            </div>
            <button style={{
              padding: '8px 16px',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
              marginLeft: 24, cursor: 'pointer',
            }}>Start ➜</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Learner Certificates**

```tsx
// src/app/(viewsonic-demo)/viewsonic/learn/certificates/page.tsx
import { SEED } from '../../_data/seed';
import { CertThumb } from '../../_components/CertThumb';

const PRIYA_CERTS = [
  { courseId: 101, hash: '0x4F2A-1C9E', issuedAt: '2026·03·12' },
  { courseId: 102, hash: '0x8B14-3D77', issuedAt: '2026·04·02' },
  { courseId: 103, hash: '0x2E89-A411', issuedAt: '2026·04·19' },
];

export default function LearnerCertificates() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Earned & verifiable</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 24 }}>Your certificates</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {PRIYA_CERTS.map((c) => {
          const course = SEED.courses.find((cc) => cc.id === c.courseId)!;
          return (
            <div key={c.courseId}>
              <CertThumb courseCode={course.code} courseTitle={course.title} hash={c.hash} issuedAt={c.issuedAt} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 12 }}>
                <a href="#" style={{ color: 'var(--text-muted)' }}>Download PDF</a>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <a href="#" style={{ color: 'var(--accent)' }}>Share to LinkedIn ↗</a>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <a href={`/verify/${c.hash}`} style={{ color: 'var(--text-muted)' }}>Verify</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Visit and verify all three learner tabs**

- `/viewsonic/learn` → centered serif welcome, resume card, three cert thumbs, up-next courses, streak.
- `/viewsonic/learn/courses` → 5 course cards, AI·105 has lime border + ✦ PLUS badge.
- `/viewsonic/learn/certificates` → grid of three paper-colored cert thumbs.

- [ ] **Step 5: Commit**

```bash
cd /home/marshall/Truos
git add src/app/\(viewsonic-demo\)/viewsonic/learn/
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): learner 3-tab persona — Home, Courses, Certificates"
```

---

## Task 18: ViewSonic logo asset + indigo accents polish

**Files:**
- Create: `public/viewsonic/viewsonic-mark.svg`
- Modify: `src/app/(viewsonic-demo)/viewsonic/layout.tsx` (replace text wordmark with SVG)

- [ ] **Step 1: Create the ViewSonic mark SVG**

A simple wordmark — replace with a real ViewSonic asset later if available.

```bash
mkdir -p /home/marshall/Truos/public/viewsonic
cat > /home/marshall/Truos/public/viewsonic/viewsonic-mark.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 28" width="160" height="28">
  <text x="0" y="22" font-family="Inter Tight, system-ui, sans-serif" font-weight="800" font-size="22" fill="#003DA5" letter-spacing="-0.02em">ViewSonic</text>
</svg>
EOF
```

- [ ] **Step 2: Replace the wordmark in the layout header**

```tsx
// in src/app/(viewsonic-demo)/viewsonic/layout.tsx, replace the ViewSonic <span> with:
<img src="/viewsonic/viewsonic-mark.svg" alt="ViewSonic" height={20} style={{ height: 20 }} />
```

Locate the line `<span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: '#003DA5' }}>ViewSonic</span>` and replace it with the `<img>` tag.

- [ ] **Step 3: Visit and verify**

Visit any `/viewsonic/*` page. Header should show `T × ViewSonic-svg AI ACADEMY`.

- [ ] **Step 4: Commit**

```bash
cd /home/marshall/Truos
git add public/viewsonic/ src/app/\(viewsonic-demo\)/viewsonic/layout.tsx
git -c user.email="marshall@homelifemedia.com" -c user.name="Marshall" commit -m "feat(viewsonic): SVG wordmark in header"
```

---

## Task 19: Demo arc smoke test (manual)

**Files:** none

- [ ] **Step 1: Run the full demo arc end-to-end**

Open `http://localhost:3000/viewsonic` and walk through:

1. ✅ Entry page — three persona buttons render
2. ✅ Click "View as Admin" → cookie set, redirects to `/admin`, lands on Pulse tab
3. ✅ Pulse tab: 4 metric cards, dept bars (ColorPro at top green, Channel Partners at bottom red), risk list, billing card
4. ✅ Click "People" tab → matrix renders with named seeds first, filters work, slide-over opens
5. ✅ Click "Onboard" tab → Step 1, paste sample, count animates, Next, Step 2 (groups), Next, Step 3 (cards), click any → success page
6. ✅ Persona switcher dropdown → click "Marcus Reyes" → lands on `/manager` Pulse tab
7. ✅ Click "Team" → matrix scoped to ~263 Sales-Amer reps
8. ✅ Click "Nudge" → composer with 3 templates, 12 recipients, click Send → success page
9. ✅ Persona switcher → "Priya Patel" → lands on `/learn` Home tab — centered welcome
10. ✅ Click "Courses" → 5 cards
11. ✅ Click "Certificates" → grid of three cert thumbs

- [ ] **Step 2: Fix any glitches, recommit**

If anything looks off, fix it inline and commit with a descriptive message.

- [ ] **Step 3: No commit if no changes**

---

## Task 20: Deploy + DNS + cert verification

**Files:** none (this is the production deploy task)

- [ ] **Step 1: Push to main (triggers Vercel deploy)**

```bash
cd /home/marshall/Truos && git push origin main
```

Expected: Vercel auto-deploys the `truos` project (`prj_9bsLJwIo7QtCkegkQxjf2Cd9VM4Q`). Watch the deploy URL in Vercel dashboard or:

```bash
VERCEL_TOKEN=$(grep ^VERCEL_TOKEN= ~/openclaw/.env | cut -d= -f2-)
TEAM=team_i6aRa1BfpZGNFOr8rM1yTyGS
curl -s "https://api.vercel.com/v6/deployments?projectId=prj_9bsLJwIo7QtCkegkQxjf2Cd9VM4Q&teamId=$TEAM&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['deployments'][0]['readyState'], d['deployments'][0]['meta'].get('githubCommitSha','')[:8])"
```

- [ ] **Step 2: Verify Task 4 (DNS + Vercel domain) was completed**

```bash
curl -sI https://viewsonic.truos.ai/ | head -5
```

Expected: `HTTP/2 200` with `x-vercel-id` header. If `502` or DNS fails, complete Task 4 first, then wait 2 minutes.

- [ ] **Step 3: Walk the demo arc on the live URL**

Visit `https://viewsonic.truos.ai` and run through all 11 steps from Task 19 against the production deploy.

- [ ] **Step 4: No commit needed**

---

## Self-review

Reviewed plan against the spec.

**Spec coverage check:**
- ✓ Subdomain routing — Task 1 (middleware) + Task 4 (Vercel/DNS)
- ✓ Persona picker entry — Task 2 + 3 (entry page + cookie)
- ✓ Three personas, three tabs each — Tasks 10-17 (admin/manager/learner with TabStrip)
- ✓ Admin Pulse hero screen (metrics + dept bars + risk + top + billing) — Task 11
- ✓ Admin People matrix with filters + slide-over — Task 12
- ✓ Admin Onboard 3-step wizard with confetti moment — Task 13
- ✓ Manager Pulse + Team + Nudge — Task 15
- ✓ Learner Home + Courses + Certificates — Task 17
- ✓ Seed data: org, departments, people, courses, progress — Tasks 5-6
- ✓ ViewSonic indigo accent + Truos house style — Task 3, 18
- ✓ DemoBanner ("all data illustrative") — Task 3
- ✓ Co-branded header lockup — Task 3, 18
- ✓ Reuse existing CertCard styling — referenced in CertThumb (Task 9)

**Placeholder scan:**
- No "TBD" / "TODO" / "implement later" anywhere.
- Every code step contains the actual code.
- Every command shows expected output.

**Type consistency:**
- `Person`, `Department`, `Course`, `Progress`, `Org` types defined once in `_data/seed.ts` and used uniformly.
- `Tab` type defined in `TabStrip.tsx` and used by all three layouts.
- `vs_demo_persona` cookie name spelled identically in entry page (Task 3 step 4) and layout (Task 3 step 3).
- `prj_9bsLJwIo7QtCkegkQxjf2Cd9VM4Q` Vercel project ID and `team_i6aRa1BfpZGNFOr8rM1yTyGS` team ID match spec doc.

**Out-of-scope items intentionally not in plan:**
- No real auth wiring (spec out-of-scope)
- No Prisma model changes (spec out-of-scope)
- No real email sending (spec out-of-scope)
- No mobile responsive polish (spec out-of-scope)
- No automated tests (Truos has no test framework — verification is visual via dev server)
