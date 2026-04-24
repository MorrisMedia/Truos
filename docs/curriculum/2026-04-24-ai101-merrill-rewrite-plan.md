# AI·101 Merrill Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all 20 AI·101 lessons using Merrill's First Principles of Instruction, Cognitive Load Theory, and Retrieval Practice. Migrate the lesson schema across all 148 lessons to the new step-type system. Fix the site-wide quiz answer-position bias. Publish a `/methodology` page explaining the learning-science stack.

**Architecture:** Two kinds of work — structural (types, migration, player, routes, page) and content (voice style guide, analogy bank, 20 hand-written lessons, 5 module recaps). Structural changes ship first so new-format lessons have somewhere to render. Content ships in voice-pilot-then-bulk order with a review gate between the two.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma/PostgreSQL (no schema changes), plain React (no test framework — build + `tsc --noEmit` + curl smoke tests are the verification mechanism).

**Spec reference:** [`docs/curriculum/2026-04-24-ai101-merrill-rewrite.md`](./2026-04-24-ai101-merrill-rewrite.md)

---

## File Structure

**New files:**

| Path | Purpose |
|---|---|
| `docs/curriculum/voice-style-guide.md` | Feynman-in-Stripe rules, banned-idiom list, examples |
| `docs/curriculum/analogy-bank.md` | 40–50 pre-vetted cross-cultural analogies |
| `scripts/shuffle-quiz-options.ts` | One-pass script — seed-deterministic shuffle of every quiz/apply option array |
| `scripts/migrate-lessons-v2.ts` | One-pass migrator: `read→understand`, `engage→apply`, `quiz→quiz` |
| `src/content/recaps.ts` | Module recap configuration — which lessons feed which recap |
| `src/components/ThinkStepView.tsx` | Render `think` step |
| `src/components/UnderstandStepView.tsx` | Render `understand` step |
| `src/components/LearnStepView.tsx` | Render `learn` step |
| `src/components/ApplyStepView.tsx` | Render `apply` step |
| `src/components/RecallStepView.tsx` | Render `recall` step (pre-lesson Quick Recall) |
| `src/components/ModuleRecap.tsx` | Client component for end-of-module recap UI |
| `src/app/courses/[id]/module-recap/[moduleIdx]/page.tsx` | Module recap route |
| `src/app/methodology/page.tsx` | Public-facing methodology page |

**Modified files:**

| Path | Change |
|---|---|
| `src/content/types.ts` | Replace step-type union (`read\|engage\|quiz` → `think\|understand\|learn\|apply\|quiz\|recall`); add `isModuleEnd` optional field to `Lesson` |
| `src/content/lessons.ts` | Migrated mechanically across all 148 lessons; then AI·101 fully hand-rewritten |
| `src/components/LessonPlayer.tsx` | Remove old renderers (`ReadStepView`, `EngageStepView`); wire in new step renderers; at end of `isModuleEnd` lesson, redirect to module-recap route instead of course-complete |
| `src/components/Footer.tsx` | Add `/methodology` link |
| `src/app/page.tsx` | Inline footer gets `/methodology` link (duplicate footer — see commit `cc8122e`) |
| `src/content/courses.ts` | No change (module structure already correct) |

---

## Phase 1 — Foundation docs (write style rules before writing content)

### Task 1: Voice style guide

**Files:**
- Create: `docs/curriculum/voice-style-guide.md`

- [ ] **Step 1: Write the file**

```markdown
# Truos Voice Style Guide

## One line
Feynman in a Stripe doc.

## Sentence rules
- Average ≤ 18 words. Count by eye; if a sentence feels long, break it.
- Concrete before abstract, always. Show the thing, then name it.
- Demonstration over assertion. Don't say "AI hallucinates" — prove it: "Ask AI for three studies on remote work. It'll give you three. At least one won't exist."
- No "as you probably know." Always "here's the thing almost nobody gets."
- Never "leverage," "utilize," "robust," "solution," "seamless." Use the plain word.

## Analogy rules
- Exactly ONE analogy per lesson. Never two. Never three.
- Pick from the analogy bank, or propose a new one that matches the ban-list discipline.
- Ban list: sports (baseball/cricket/football/soccer/basketball), US-centric history and idioms ("kick the tires," "home run," "the whole nine yards"), religious references, specific brand names (except when the lesson is teaching that brand).
- Translatable-across-cultures default sources: doors, water, rooms, markets, maps, keys, notebooks, tools, letters, roads, chairs, mirrors, restaurants, weather, food (generic, not culture-specific).

## Humor
One earned dry joke per lesson, maximum. If it doesn't land on first read, cut it.

## Assuming the reader
- Assume they are smart but unfamiliar with the topic.
- Don't condescend. Don't pad.
- Respect their time: every paragraph earns its keep, or goes.

## Length discipline (from Cognitive Load Theory)
- Lesson total: 3–4 minutes reading + interacting.
- Think step: ≤ 30 sec.
- Understand step: ≤ 60 sec.
- Learn step: ≤ 60 sec.
- Apply step: ≤ 60 sec.
- Quiz step: ≤ 30 sec.
- If a step is blowing past its target, cut content — don't stretch the minute.

## Self-check before submitting a lesson
- [ ] Did I use exactly one analogy?
- [ ] Is my analogy from the bank OR does it pass the ban-list check?
- [ ] Is any sentence over 25 words? (If yes, break it.)
- [ ] Did I demonstrate any concept with a concrete example?
- [ ] Did I cut every "leverage," "utilize," "robust"?
- [ ] Would a smart 22-year-old with zero AI background read this and say "oh, I get it"?
- [ ] Does the total read in ~3:30?
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/Truos
git add docs/curriculum/voice-style-guide.md
git commit -m "docs(curriculum): voice style guide for AI·101 rewrite"
```

---

### Task 2: Analogy bank

**Files:**
- Create: `docs/curriculum/analogy-bank.md`

- [ ] **Step 1: Write the file**

```markdown
# Analogy Bank

Pre-vetted analogies for Truos course content. All items pass the ban-list check: no sports, no US idioms, no religion, no specific brands (unless teaching that brand). Use exactly one per lesson.

## Everyday objects
| Analogy | Good for explaining |
|---|---|
| A door | Permissions, access, gating (APIs, auth) |
| A key / lock | Credentials, API keys |
| A mailbox with a specific address | Endpoints, routes |
| A notebook page | Context window — short-term memory |
| A whiteboard that fills up | Context window limits |
| A paper folder | File, document, record |
| A bookmark in a book | Saved state, session restore |
| A ruler | Measurement, benchmark |
| A magnifying glass | Search, query |
| A map | Schema, structure |
| A pair of binoculars | Focusing on one subset of data |
| A filing cabinet | Database |
| An address book | Lookup table |
| A photocopy | Backup, redundancy |
| A pencil eraser | Undo, rollback |

## People and roles
| Analogy | Good for explaining |
|---|---|
| A well-read assistant who never tires | Large language model |
| A new intern on day one | Zero-shot prompt with no context |
| An intern with a one-page brief | Few-shot prompt |
| A junior who guesses when unsure | Hallucination |
| A receptionist who books the right meeting room | Router, model selector |
| A translator between two languages | Embeddings, semantic search |
| A tour guide | Guided tutorial, onboarding |
| A proofreader | Grammar/spell check |

## Water, weather, and nature
| Analogy | Good for explaining |
|---|---|
| A glass filling up | Context window usage |
| A river | Data stream, pipeline |
| A dam | Rate limiting |
| A filter (water) | Input validation, safety filter |
| Morning fog | Uncertainty, vagueness |
| A weather forecast | Probability, confidence score |
| Compass north | Ground truth |

## Structures and places
| Analogy | Good for explaining |
|---|---|
| A restaurant menu | Structured options, schema |
| A hotel room number | Unique ID, primary key |
| A library card catalog | Index, search index |
| A storefront window | Public API, UI |
| A back door of a kitchen | Private/internal API |
| An office mailroom | Queue, message bus |
| A building with many floors | Hierarchy, nested structure |
| A front desk check-in | Authentication |

## Tools
| Analogy | Good for explaining |
|---|---|
| A hammer | Specialized tool, single-purpose |
| A Swiss army knife | Multipurpose tool |
| A pair of scissors | Cutting/trimming (truncation) |
| A photocopier | Duplication |
| A pencil and paper | Lightweight scratch work |
| A kitchen knife | Sharp, effective, requires skill |

## Movement
| Analogy | Good for explaining |
|---|---|
| A highway | Throughput, pipeline |
| A traffic light | Gating, rate limit |
| A bridge | Connector, integration |
| A passport | Credential, access token |
| A shopping cart | Queue of items |

---

**Adding to the bank:** Propose new analogies in PRs with one paragraph explaining why they translate cross-culturally. Avoid anything tied to a specific country, era, or subculture.
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/Truos
git add docs/curriculum/analogy-bank.md
git commit -m "docs(curriculum): analogy bank for Truos lessons"
```

---

## Phase 2 — Quiz shuffle + schema migration

### Task 3: Quiz-option shuffle script

**Files:**
- Create: `scripts/shuffle-quiz-options.ts`

Rationale: Fixes the B-bias across all 148 lessons (engage + quiz steps). Runs independently of the migration. Seed-deterministic so repeated runs produce the same result.

- [ ] **Step 1: Write the script**

```ts
// scripts/shuffle-quiz-options.ts
// One-pass script that shuffles `options` arrays in engage and quiz steps
// across every lesson. Seed-deterministic per lesson+step so the same lesson
// shuffled twice produces the same output.
//
// Usage: npx tsx scripts/shuffle-quiz-options.ts

import fs from 'node:fs';
import path from 'node:path';

const LESSONS_PATH = path.resolve(__dirname, '../src/content/lessons.ts');
const BACKUP_PATH = LESSONS_PATH + '.pre-shuffle.bak';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function main() {
  const src = fs.readFileSync(LESSONS_PATH, 'utf8');
  const match = src.match(/export const LESSONS[^=]*=\s*({[\s\S]*});\s*$/m);
  if (!match) throw new Error('Could not locate LESSONS object in lessons.ts');
  const LESSONS = JSON.parse(match[1]);

  fs.writeFileSync(BACKUP_PATH, src);
  console.log(`Backup written: ${BACKUP_PATH}`);

  let shuffledCount = 0;
  for (const key of Object.keys(LESSONS)) {
    const lesson = LESSONS[key];
    for (let si = 0; si < lesson.steps.length; si++) {
      const step = lesson.steps[si];
      if ((step.type === 'engage' || step.type === 'quiz' || step.type === 'apply') && Array.isArray(step.options)) {
        const seed = seedFromString(`${key}:${si}:${step.type}`);
        const rng = mulberry32(seed);
        step.options = shuffle(step.options, rng);
        shuffledCount++;
      }
    }
  }

  const preamble = src.slice(0, match.index!).trimEnd();
  const postamble = src.slice(match.index! + match[0].length).trimStart();
  const serialized = JSON.stringify(LESSONS, null, 2);

  const newSrc = `${preamble}\n\nexport const LESSONS: Record<string, Lesson> = ${serialized};\n${postamble ? '\n' + postamble : ''}`;
  fs.writeFileSync(LESSONS_PATH, newSrc);

  console.log(`Shuffled ${shuffledCount} option arrays across ${Object.keys(LESSONS).length} lessons.`);
}

main();
```

- [ ] **Step 2: Dry-run verify — inspect output of 1 lesson before/after**

```bash
cd /tmp/Truos
node -e "
const src = require('fs').readFileSync('src/content/lessons.ts', 'utf8');
const m = src.match(/export const LESSONS[^=]*=\s*({[\s\S]*});/);
const L = JSON.parse(m[1]);
console.log('BEFORE 101-0-0 quiz:', JSON.stringify(L['101-0-0'].steps.find(s => s.type === 'quiz').options, null, 2));
"
```

Note the current order of correct-true flags — they should cluster at position B.

- [ ] **Step 3: Run the shuffle**

```bash
cd /tmp/Truos
npx tsx scripts/shuffle-quiz-options.ts
```

Expected output: `Shuffled 444 option arrays across 148 lessons.`
`src/content/lessons.ts.pre-shuffle.bak` now exists.

- [ ] **Step 4: Verify B-bias is gone**

```bash
cd /tmp/Truos
node -e "
const src = require('fs').readFileSync('src/content/lessons.ts', 'utf8');
const L = JSON.parse(src.match(/export const LESSONS[^=]*=\s*({[\s\S]*});/)[1]);
const dist = { engage: [0,0,0,0], quiz: [0,0,0,0] };
for (const k of Object.keys(L)) for (const s of L[k].steps) {
  if (s.type === 'engage' || s.type === 'quiz') {
    const i = s.options.findIndex(o => o.correct);
    if (i >= 0 && i < 4) dist[s.type][i]++;
  }
}
console.log('engage:', dist.engage);
console.log('quiz:', dist.quiz);
"
```

Expected: counts now roughly equal across A/B/C/D positions (no single position above ~40%).

- [ ] **Step 5: Build verification**

```bash
cd /tmp/Truos
npm run build 2>&1 | tail -5
```

Expected: build succeeds. No type errors. The file is still the old schema (read/engage/quiz) — shuffling doesn't change types.

- [ ] **Step 6: Commit**

```bash
cd /tmp/Truos
git add scripts/shuffle-quiz-options.ts src/content/lessons.ts
git commit -m "fix: shuffle quiz/engage option positions to eliminate B-bias

- Adds scripts/shuffle-quiz-options.ts (one-pass, seed-deterministic)
- Reorders 444 option arrays across 148 lessons
- Eliminates the assessment integrity issue where correct answers
  clustered at position B in 83–100% of questions"
```

Note: the `.pre-shuffle.bak` file is local-only — do not commit it.

---

### Task 4: New step-type definitions (additive step; old types kept so app still builds)

**Files:**
- Modify: `src/content/types.ts`

- [ ] **Step 1: Read the current types file**

```bash
cd /tmp/Truos && cat src/content/types.ts
```

Note existing types: `ReadStep | EngageStep | QuizStep`, union as `LessonStep`.

- [ ] **Step 2: Add new step types alongside existing ones**

Replace the contents of `src/content/types.ts` with:

```ts
// Course + lesson types

export type CourseSuite = 'base' | 'plus';
export type CourseTier = 'free' | 'paid';

export interface CourseModule {
  name: string;
  lessons: string[];
}

export interface Course {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  lessons: number;
  hours: number;
  tier: CourseTier;
  suite: CourseSuite;
  price: number;
  capstone?: boolean;
  modules: CourseModule[];
}

// -------- Lesson steps --------

// Legacy step types — kept temporarily so LessonPlayer can render pre-migration content.
// Removed in Task 9 after all lessons migrated.
export interface ReadStep {
  type: 'read';
  title: string;
  body: string[];
  callout?: { label: string; text: string };
}
export interface EngageStep {
  type: 'engage';
  title: string;
  prompt: string;
  options: { text: string; correct: boolean; feedback?: string }[];
}

// Canonical step types (Merrill's First Principles + Retrieval Practice).
export interface ThinkStep {
  type: 'think';
  title: string;
  scenario: string;      // 1–2 sentences
  prompt: string;        // open question; no UI input
}

export interface UnderstandStep {
  type: 'understand';
  title: string;
  body: string[];        // 2 short paragraphs max
  analogy?: { label: string; text: string };  // optional — omitted for mechanically-migrated lessons with no callout
}

export interface LearnStep {
  type: 'learn';
  title: string;
  body: string[];        // 1 paragraph; edge cases, failure modes
  watchFor: string;      // highlighted callout
}

export interface ApplyStep {
  type: 'apply';
  title: string;
  scenario: string;
  options: { text: string; correct: boolean; feedback?: string }[];
}

export interface QuizStep {
  type: 'quiz';
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export interface RecallStep {
  type: 'recall';
  title: string;
  recallingLessonKey: string;   // e.g. "101-0-1" — source lesson for traceability
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export type LessonStep =
  | ReadStep
  | EngageStep
  | ThinkStep
  | UnderstandStep
  | LearnStep
  | ApplyStep
  | QuizStep
  | RecallStep;

export interface Lesson {
  courseId: number;
  courseCode: string;
  suite: CourseSuite;
  moduleIdx: number;
  lessonIdx: number;
  moduleName: string;
  lessonIndex: number; // 1-based within module
  totalInModule: number;
  title: string;
  steps: LessonStep[];
  isModuleEnd?: boolean; // set true for the last lesson of a module to trigger module-recap redirect
}
```

- [ ] **Step 3: Typecheck**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors. (`LessonPlayer` still compiles because `ReadStep`/`EngageStep` are in the union.)

- [ ] **Step 4: Commit**

```bash
cd /tmp/Truos
git add src/content/types.ts
git commit -m "types: add Merrill step types alongside legacy read/engage

Introduces think/understand/learn/apply/recall step types. Legacy
ReadStep and EngageStep kept in the union for now so LessonPlayer
continues to build; removed in a follow-up task after migration runs."
```

---

### Task 5: Migration script — read→understand, engage→apply

**Files:**
- Create: `scripts/migrate-lessons-v2.ts`

- [ ] **Step 1: Write the script**

```ts
// scripts/migrate-lessons-v2.ts
// Mechanical migration: read -> understand, engage -> apply, quiz -> quiz (unchanged).
// Backs up current lessons.ts to lessons.ts.pre-migration.bak before writing.
//
// Usage: npx tsx scripts/migrate-lessons-v2.ts

import fs from 'node:fs';
import path from 'node:path';

const LESSONS_PATH = path.resolve(__dirname, '../src/content/lessons.ts');
const BACKUP_PATH = LESSONS_PATH + '.pre-migration.bak';

function migrateStep(step: any): any {
  switch (step.type) {
    case 'read': {
      const out: any = {
        type: 'understand',
        title: step.title,
        body: step.body,
      };
      if (step.callout) out.analogy = { label: step.callout.label, text: step.callout.text };
      return out;
    }
    case 'engage': {
      return {
        type: 'apply',
        title: step.title,
        scenario: step.prompt,
        options: step.options,
      };
    }
    case 'quiz': {
      return step; // unchanged
    }
    default:
      return step; // unrecognized types pass through
  }
}

function main() {
  const src = fs.readFileSync(LESSONS_PATH, 'utf8');
  const match = src.match(/export const LESSONS[^=]*=\s*({[\s\S]*});\s*$/m);
  if (!match) throw new Error('Could not locate LESSONS object');
  const LESSONS = JSON.parse(match[1]);

  fs.writeFileSync(BACKUP_PATH, src);
  console.log(`Backup written: ${BACKUP_PATH}`);

  let migratedSteps = 0;
  for (const key of Object.keys(LESSONS)) {
    const lesson = LESSONS[key];
    lesson.steps = lesson.steps.map((s: any) => {
      const before = s.type;
      const out = migrateStep(s);
      if (out.type !== before) migratedSteps++;
      return out;
    });
    // Mark module-end lessons for the recap redirect
    if (lesson.lessonIdx === lesson.totalInModule - 1) {
      lesson.isModuleEnd = true;
    }
  }

  const preamble = src.slice(0, match.index!).trimEnd();
  const postamble = src.slice(match.index! + match[0].length).trimStart();
  const serialized = JSON.stringify(LESSONS, null, 2);
  const newSrc = `${preamble}\n\nexport const LESSONS: Record<string, Lesson> = ${serialized};\n${postamble ? '\n' + postamble : ''}`;
  fs.writeFileSync(LESSONS_PATH, newSrc);

  console.log(`Migrated ${migratedSteps} steps across ${Object.keys(LESSONS).length} lessons.`);
}

main();
```

- [ ] **Step 2: Run the migration**

```bash
cd /tmp/Truos
npx tsx scripts/migrate-lessons-v2.ts
```

Expected output: `Migrated ~296 steps across 148 lessons.` (2 out of 3 steps per lesson change type: read + engage = ~296 of 444 steps.)
`src/content/lessons.ts.pre-migration.bak` now exists.

- [ ] **Step 3: Verify migration — sample 3 lessons**

```bash
cd /tmp/Truos
node -e "
const src = require('fs').readFileSync('src/content/lessons.ts', 'utf8');
const L = JSON.parse(src.match(/export const LESSONS[^=]*=\s*({[\s\S]*});/)[1]);
for (const key of ['101-0-0', '101-0-3', '204-2-3']) {
  console.log(key, 'step types:', L[key].steps.map(s => s.type), 'isModuleEnd:', L[key].isModuleEnd || false);
}
"
```

Expected:
- `101-0-0`: `['understand', 'apply', 'quiz']`, `isModuleEnd: false`
- `101-0-3`: `['understand', 'apply', 'quiz']`, `isModuleEnd: true` (last of module 1)
- `204-2-3`: `['understand', 'apply', 'quiz']`, `isModuleEnd: true`

- [ ] **Step 4: Typecheck**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors. (The union still has `ReadStep`/`EngageStep`, but lessons.ts no longer emits them. LessonPlayer still branches on `.type === 'read'`/`'engage'` — those branches just become dead code until Task 9 removes them.)

- [ ] **Step 5: Commit**

```bash
cd /tmp/Truos
git add scripts/migrate-lessons-v2.ts src/content/lessons.ts
git commit -m "migrate: lessons.ts to Merrill step-type schema

- Adds scripts/migrate-lessons-v2.ts
- Transforms read→understand (callout becomes analogy), engage→apply (prompt→scenario), quiz unchanged
- Marks module-end lessons with isModuleEnd:true
- 296 steps migrated across 148 lessons"
```

---

### Task 6: LessonPlayer — add new step renderers (legacy renderers retained for now)

**Files:**
- Create: `src/components/ThinkStepView.tsx`, `UnderstandStepView.tsx`, `LearnStepView.tsx`, `ApplyStepView.tsx`, `RecallStepView.tsx`
- Modify: `src/components/LessonPlayer.tsx`

- [ ] **Step 1: Create `src/components/ThinkStepView.tsx`**

```tsx
import type { ThinkStep } from '@/content/types';

export function ThinkStepView({ step }: { step: ThinkStep }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>THINK</div>
      <h1 style={{ fontSize: 36, marginBottom: 24, letterSpacing: '-0.03em' }}>{step.title}</h1>
      <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 20 }}>{step.scenario}</p>
      <div style={{ padding: 24, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--text-muted)' }}>TAKE 5 SECONDS</div>
        <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.4 }}>{step.prompt}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/UnderstandStepView.tsx`**

```tsx
import type { UnderstandStep } from '@/content/types';
import { renderWithGlossary } from './GlossaryTerm';
import { CopyPrompt } from './CopyPrompt';

function extractPromptsFromParagraph(p: string): string[] {
  const matches: string[] = [];
  const re = /"([^"]{30,})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(p)) !== null) matches.push(m[0]);
  return matches;
}

export function UnderstandStepView({ step }: { step: UnderstandStep }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>UNDERSTAND</div>
      <h1 style={{ fontSize: 40, marginBottom: 32, letterSpacing: '-0.03em' }}>{step.title}</h1>
      {step.body.map((p, i) => {
        const prompts = extractPromptsFromParagraph(p);
        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', margin: 0 }}>
              {renderWithGlossary(p, `understand-${i}`)}
            </p>
            {prompts.map((pr, j) => <CopyPrompt key={j} text={pr} />)}
          </div>
        );
      })}
      {step.analogy && (
        <div style={{ marginTop: 32, padding: 24, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{step.analogy.label}</div>
          <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.4 }}>
            {renderWithGlossary(step.analogy.text, 'understand-analogy')}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/LearnStepView.tsx`**

```tsx
import type { LearnStep } from '@/content/types';
import { renderWithGlossary } from './GlossaryTerm';

export function LearnStepView({ step }: { step: LearnStep }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>LEARN</div>
      <h1 style={{ fontSize: 36, marginBottom: 28, letterSpacing: '-0.03em' }}>{step.title}</h1>
      {step.body.map((p, i) => (
        <p key={i} style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 20 }}>
          {renderWithGlossary(p, `learn-${i}`)}
        </p>
      ))}
      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'color-mix(in oklab, var(--warn) 8%, var(--bg-panel))', borderLeft: '2px solid var(--warn)' }}>
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--warn)' }}>WATCH FOR THIS</div>
        <div style={{ fontSize: 15, lineHeight: 1.55 }}>{renderWithGlossary(step.watchFor, 'learn-watch')}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ApplyStepView.tsx`**

```tsx
import type { ApplyStep } from '@/content/types';
import { CopyPrompt, looksLikePrompt } from './CopyPrompt';
import { renderWithGlossary } from './GlossaryTerm';

export function ApplyStepView({
  step, selected, setSelected, submitted,
}: {
  step: ApplyStep;
  selected: number | null;
  setSelected: (n: number | null) => void;
  submitted: boolean;
}) {
  const correctIdx = step.options.findIndex(o => o.correct);
  const correctOpt = correctIdx >= 0 ? step.options[correctIdx] : null;

  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>APPLY</div>
      <h1 style={{ fontSize: 36, marginBottom: 16, letterSpacing: '-0.03em' }}>{step.title}</h1>
      <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.5 }}>{step.scenario}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              textAlign: 'left', padding: 20, borderRadius: 12,
              border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
              background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'transparent',
              fontSize: 15, lineHeight: 1.5, transition: 'all 0.15s',
              cursor: submitted ? 'default' : 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border-strong)'),
                background: showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'transparent',
                display: 'grid', placeItems: 'center', fontSize: 12, color: 'var(--accent-ink)', flexShrink: 0, marginTop: 1,
              }}>
                {showCorrect ? '✓' : showWrong ? '✕' : isSelected ? '●' : ''}
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && selected != null && step.options[selected].feedback && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
            {step.options[selected].correct ? 'CORRECT' : 'NOT QUITE'}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>
            {renderWithGlossary(step.options[selected].feedback ?? '', `apply-fb-${selected}`)}
          </div>
        </div>
      )}
      {submitted && correctOpt && looksLikePrompt(correctOpt.text) && (
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--text-muted)' }}>TRY THE WINNING PROMPT</div>
          <CopyPrompt text={correctOpt.text} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/RecallStepView.tsx`**

```tsx
import type { RecallStep } from '@/content/types';

export function RecallStepView({
  step, selected, setSelected, submitted,
}: {
  step: RecallStep;
  selected: number | null;
  setSelected: (n: number | null) => void;
  submitted: boolean;
}) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>QUICK RECALL</div>
      <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.025em' }}>{step.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
        Before we move on — one thing from earlier.
      </p>
      <p style={{ fontSize: 18, lineHeight: 1.5, marginBottom: 24 }}>{step.prompt}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              textAlign: 'left', padding: 18, borderRadius: 12, minHeight: 80,
              border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
              background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
              fontSize: 15, lineHeight: 1.5, cursor: submitted ? 'default' : 'pointer',
            }}>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'var(--bg-panel)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)' }}>
          {step.answerNote}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Wire the new renderers into `LessonPlayer.tsx`**

Find this block in `src/components/LessonPlayer.tsx`:

```tsx
{step.type === 'read' && <ReadStepView step={step} />}
{step.type === 'engage' && <EngageStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
{step.type === 'quiz' && <QuizStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
```

Replace with:

```tsx
{step.type === 'read' && <ReadStepView step={step} />}
{step.type === 'engage' && <EngageStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
{step.type === 'think' && <ThinkStepView step={step} />}
{step.type === 'understand' && <UnderstandStepView step={step} />}
{step.type === 'learn' && <LearnStepView step={step} />}
{step.type === 'apply' && <ApplyStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
{step.type === 'recall' && <RecallStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
{step.type === 'quiz' && <QuizStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
```

Add imports at the top of `LessonPlayer.tsx`:

```tsx
import { ThinkStepView } from './ThinkStepView';
import { UnderstandStepView } from './UnderstandStepView';
import { LearnStepView } from './LearnStepView';
import { ApplyStepView } from './ApplyStepView';
import { RecallStepView } from './RecallStepView';
```

Also update the footer step-label map in `LessonPlayer.tsx` from:

```tsx
{step.type === 'read' ? '1 MIN READ' : step.type === 'engage' ? 'INTERACTIVE' : 'QUICK CHECK'}
```

to:

```tsx
{step.type === 'read' || step.type === 'understand' || step.type === 'learn' ? '1 MIN READ'
  : step.type === 'think' ? 'ACTIVATE'
  : step.type === 'recall' ? 'QUICK RECALL'
  : step.type === 'engage' || step.type === 'apply' ? 'INTERACTIVE'
  : 'QUICK CHECK'}
```

Update the Continue/Check-answer button selector from:

```tsx
step.type === 'read' ? (
  <button className="btn btn-primary btn-lg" onClick={advance}>Continue {Icons.arrow}</button>
) : !submitted ? (
  // ...
```

to:

```tsx
(step.type === 'read' || step.type === 'think' || step.type === 'understand' || step.type === 'learn') ? (
  <button className="btn btn-primary btn-lg" onClick={advance}>Continue {Icons.arrow}</button>
) : !submitted ? (
  // ...
```

(Think/Understand/Learn steps have no interaction; only Apply/Quiz/Recall gate on submit.)

- [ ] **Step 7: Typecheck + build**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -20 && npm run build 2>&1 | tail -10
```

Expected: both succeed.

- [ ] **Step 8: Smoke test — start dev server, hit a migrated lesson, confirm understand/apply/quiz render**

```bash
cd /tmp/Truos && npm run dev &
sleep 8
curl -s -o /dev/null -w "home=%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "lesson=%{http_code}\n" http://localhost:3000/courses/101/0/0
# kill dev server
kill %1 2>/dev/null
```

Expected: both 200. If you can, open http://localhost:3000/courses/101/0/0 in a browser and verify the step shows "UNDERSTAND" eyebrow (not "READ").

- [ ] **Step 9: Commit**

```bash
cd /tmp/Truos
git add src/components/
git commit -m "feat(player): render Merrill step types (think/understand/learn/apply/recall)

- Five new step-view components
- LessonPlayer dispatches on new types in addition to legacy read/engage/quiz
- Step footer labels and continue-button logic updated for no-interaction steps
  (think/understand/learn)"
```

---

### Task 7: Delete legacy ReadStep and EngageStep from type union and LessonPlayer

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/components/LessonPlayer.tsx`

- [ ] **Step 1: Verify no legacy step types remain in lessons.ts**

```bash
cd /tmp/Truos
node -e "
const src = require('fs').readFileSync('src/content/lessons.ts', 'utf8');
const L = JSON.parse(src.match(/export const LESSONS[^=]*=\s*({[\s\S]*});/)[1]);
const types = new Set();
for (const k of Object.keys(L)) for (const s of L[k].steps) types.add(s.type);
console.log('step types present:', [...types]);
"
```

Expected: `['understand', 'apply', 'quiz']` — no `read` or `engage`. If any remain, stop and investigate; something in migration went wrong.

- [ ] **Step 2: Remove `ReadStep` and `EngageStep` from `src/content/types.ts`**

Delete these two interface declarations:

```ts
export interface ReadStep { ... }
export interface EngageStep { ... }
```

Update the `LessonStep` union to remove them:

```ts
export type LessonStep =
  | ThinkStep
  | UnderstandStep
  | LearnStep
  | ApplyStep
  | QuizStep
  | RecallStep;
```

- [ ] **Step 3: Remove `ReadStepView` and `EngageStepView` from `src/components/LessonPlayer.tsx`**

Delete the two function definitions (they exist at the bottom of the file as `function ReadStepView(...)` and `function EngageStepView(...)`).

Delete the dispatch lines:

```tsx
{step.type === 'read' && <ReadStepView step={step} />}
{step.type === 'engage' && <EngageStepView step={step} selected={selected} setSelected={setSelected} submitted={submitted} />}
```

Also simplify the step-label and continue-button conditions by removing the `'read'` and `'engage'` branches (now unreachable):

```tsx
{step.type === 'understand' || step.type === 'learn' ? '1 MIN READ'
  : step.type === 'think' ? 'ACTIVATE'
  : step.type === 'recall' ? 'QUICK RECALL'
  : step.type === 'apply' ? 'INTERACTIVE'
  : 'QUICK CHECK'}
```

```tsx
(step.type === 'think' || step.type === 'understand' || step.type === 'learn') ? (
  <button className="btn btn-primary btn-lg" onClick={advance}>Continue {Icons.arrow}</button>
) : !submitted ? (
  // ...
```

Also remove the `extractPromptsFromParagraph` helper from the bottom of `LessonPlayer.tsx` — it was only used by `ReadStepView` (moved into `UnderstandStepView` in Task 6).

- [ ] **Step 4: Typecheck + build**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -20 && npm run build 2>&1 | tail -10
```

Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
cd /tmp/Truos
git add src/content/types.ts src/components/LessonPlayer.tsx
git commit -m "types: remove legacy ReadStep/EngageStep now that migration is complete

All 148 lessons use the Merrill step-type schema. Dead branches removed
from LessonPlayer."
```

---

## Phase 3 — Module Recap infrastructure

### Task 8: Module recap config (`src/content/recaps.ts`)

**Files:**
- Create: `src/content/recaps.ts`

- [ ] **Step 1: Write the config module**

```ts
// Module recap configuration — which lessons feed each recap screen.
// v1: AI·101 only. Each module's recap pulls one quiz-step question from
// every lesson in that module. The ModuleRecap component interleaves them
// and shuffles option positions at runtime.

import { LESSONS } from './lessons';
import type { QuizStep, Lesson } from './types';

export interface RecapConfig {
  courseId: number;
  moduleIdx: number;
  lessonKeys: string[]; // in teaching order
}

// AI·101 has 5 modules of 4 lessons each.
export const RECAPS: Record<string, RecapConfig> = {
  '101-0': { courseId: 101, moduleIdx: 0, lessonKeys: ['101-0-0', '101-0-1', '101-0-2', '101-0-3'] },
  '101-1': { courseId: 101, moduleIdx: 1, lessonKeys: ['101-1-0', '101-1-1', '101-1-2', '101-1-3'] },
  '101-2': { courseId: 101, moduleIdx: 2, lessonKeys: ['101-2-0', '101-2-1', '101-2-2', '101-2-3'] },
  '101-3': { courseId: 101, moduleIdx: 3, lessonKeys: ['101-3-0', '101-3-1', '101-3-2', '101-3-3'] },
  '101-4': { courseId: 101, moduleIdx: 4, lessonKeys: ['101-4-0', '101-4-1', '101-4-2', '101-4-3'] },
};

export function getRecap(courseId: number, moduleIdx: number): RecapConfig | null {
  return RECAPS[`${courseId}-${moduleIdx}`] ?? null;
}

export interface RecapQuestion {
  sourceLessonKey: string;
  sourceLessonTitle: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

/**
 * Build the 4-question recap from the last quiz step of each lesson in the module.
 * Throws if any lesson is missing or has no quiz step (caller shows an error page).
 */
export function buildRecapQuestions(config: RecapConfig): RecapQuestion[] {
  return config.lessonKeys.map(key => {
    const lesson: Lesson | undefined = LESSONS[key];
    if (!lesson) throw new Error(`Recap refers to missing lesson: ${key}`);
    const quiz = lesson.steps.find((s): s is QuizStep => s.type === 'quiz');
    if (!quiz) throw new Error(`Lesson ${key} has no quiz step`);
    return {
      sourceLessonKey: key,
      sourceLessonTitle: lesson.title,
      prompt: quiz.prompt,
      options: quiz.options,
      answerNote: quiz.answerNote,
    };
  });
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -10
```

Expected: no errors.

- [ ] **Step 3: Verify recap builds for all 5 modules**

```bash
cd /tmp/Truos && npx tsx -e "
import { RECAPS, buildRecapQuestions } from './src/content/recaps';
for (const key of Object.keys(RECAPS)) {
  const qs = buildRecapQuestions(RECAPS[key]);
  console.log(key, '→', qs.length, 'questions');
}
"
```

Expected: 5 lines, each reporting 4 questions.

- [ ] **Step 4: Commit**

```bash
cd /tmp/Truos
git add src/content/recaps.ts
git commit -m "feat(content): module recap config — AI·101

Each recap pulls 1 quiz question per lesson in the module. 5 recaps × 4
questions covers all of AI·101."
```

---

### Task 9: Module Recap client component (`src/components/ModuleRecap.tsx`)

**Files:**
- Create: `src/components/ModuleRecap.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { RecapQuestion } from '@/content/recaps';
import { Icons } from './icons';

/**
 * Interleave an array by modulo — reorders 4 sequential questions so the
 * reader doesn't see them in lesson order (reduces pattern-guessing).
 */
function interleave<T>(arr: T[]): T[] {
  if (arr.length <= 2) return arr.slice();
  const out: T[] = [];
  for (let offset = 0; offset < 2; offset++) {
    for (let i = offset; i < arr.length; i += 2) out.push(arr[i]);
  }
  return out;
}

export function ModuleRecap({
  courseId,
  moduleIdx,
  moduleName,
  questions,
  nextModuleFirstLessonKey, // e.g. "101-1-0" — or null if this was the last module
}: {
  courseId: number;
  moduleIdx: number;
  moduleName: string;
  questions: RecapQuestion[];
  nextModuleFirstLessonKey: string | null;
}) {
  const router = useRouter();
  const interleaved = interleave(questions);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(interleaved.length).fill(null));

  const q = interleaved[qIdx];
  const done = qIdx >= interleaved.length - 1 && submitted;
  const correctCount = answers.reduce<number>((sum, a, i) => sum + (a != null && interleaved[i].options[a]?.correct ? 1 : 0), 0);
  const progress = ((qIdx + (submitted ? 1 : 0.3)) / interleaved.length) * 100;

  const submit = () => {
    if (selected == null) return;
    setSubmitted(true);
    setAnswers(a => {
      const next = [...a];
      next[qIdx] = selected;
      return next;
    });
  };
  const advance = () => {
    setSubmitted(false);
    setSelected(null);
    if (qIdx < interleaved.length - 1) setQIdx(qIdx + 1);
  };
  const continueCourse = () => {
    if (nextModuleFirstLessonKey) {
      const [, mi, li] = nextModuleFirstLessonKey.split('-');
      router.push(`/courses/${courseId}/${mi}/${li}`);
    } else {
      router.push(`/courses/${courseId}/complete?m=${moduleIdx}&l=3&score=100&module-recap=1`);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>MODULE {moduleIdx + 1} RECAP · COMPLETE</div>
          <h1 style={{ fontSize: 42, letterSpacing: '-0.03em', marginBottom: 12 }}>
            {correctCount} / {interleaved.length}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.55, marginBottom: 32 }}>
            You just practiced retrieving what you learned in {moduleName}. Active recall at spaced intervals is the single most evidence-backed way to make learning stick.
          </p>
          <button className="btn btn-primary btn-lg" onClick={continueCourse}>
            {nextModuleFirstLessonKey ? 'Continue to next module' : 'Finish course'} {Icons.arrow}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
        <Link className="btn btn-ghost btn-sm" href={`/courses/${courseId}`}>{Icons.x}</Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <span style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {qIdx + 1} / {interleaved.length}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px 24px 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          AI·101 · MODULE {moduleIdx + 1} RECAP · {moduleName.toUpperCase()}
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 24px 120px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>RECALL</div>
        <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.025em' }}>{q.prompt}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 28 }}>From: {q.sourceLessonTitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && opt.correct;
            const showWrong = submitted && isSelected && !opt.correct;
            return (
              <button key={i} onClick={() => !submitted && setSelected(i)} style={{
                textAlign: 'left', padding: 20, borderRadius: 12, minHeight: 100,
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
                background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
                fontSize: 15, lineHeight: 1.5, cursor: submitted ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
        {submitted && (
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid ' + (q.options[selected!].correct ? 'var(--accent)' : 'var(--warn)') }}>
            <div className="eyebrow" style={{ marginBottom: 8, color: q.options[selected!].correct ? 'var(--accent)' : 'var(--warn)' }}>
              {q.options[selected!].correct ? 'CORRECT' : 'LEARN'}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55 }}>{q.answerNote}</div>
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', bottom: 0, borderTop: '1px solid var(--border)', background: 'color-mix(in oklab, var(--bg) 85%, transparent)', backdropFilter: 'blur(12px)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          {!submitted ? (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={selected == null}
              style={{ opacity: selected == null ? 0.4 : 1, pointerEvents: selected == null ? 'none' : 'auto' }}>
              Check answer
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={advance}>
              {qIdx < interleaved.length - 1 ? 'Next' : 'See results'} {Icons.arrow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /tmp/Truos
git add src/components/ModuleRecap.tsx
git commit -m "feat(player): ModuleRecap client component

Interleaves 4 questions drawn from the module's lessons. Retrieval
practice UI at end-of-module. Continues to next module first lesson
on completion, or to /complete if this was the last module."
```

---

### Task 10: Module recap route (`src/app/courses/[id]/module-recap/[moduleIdx]/page.tsx`)

**Files:**
- Create: `src/app/courses/[id]/module-recap/[moduleIdx]/page.tsx`

- [ ] **Step 1: Write the route**

```tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { findCourse } from '@/content/courses';
import { LESSONS } from '@/content/lessons';
import { getRecap, buildRecapQuestions } from '@/content/recaps';
import { canAccessCourse } from '@/lib/access';
import { ModuleRecap } from '@/components/ModuleRecap';

export const dynamic = 'force-dynamic';

export default async function ModuleRecapPage({
  params,
}: {
  params: { id: string; moduleIdx: string };
}) {
  const courseId = Number(params.id);
  const moduleIdx = Number(params.moduleIdx);

  const course = findCourse(courseId);
  if (!course) notFound();

  const recap = getRecap(courseId, moduleIdx);
  if (!recap) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const access = await canAccessCourse(session.user.id, session.user.email, courseId);
  if (!access.allowed) redirect(`/checkout?plan=${encodeURIComponent(course.code)}`);

  const questions = buildRecapQuestions(recap);

  // Determine the next module's first lesson, if any.
  const nextModuleIdx = moduleIdx + 1;
  const nextModuleFirstKey = `${courseId}-${nextModuleIdx}-0`;
  const nextModuleFirstLessonKey = LESSONS[nextModuleFirstKey] ? nextModuleFirstKey : null;

  const moduleName = course.modules[moduleIdx]?.name ?? `Module ${moduleIdx + 1}`;

  return (
    <ModuleRecap
      courseId={courseId}
      moduleIdx={moduleIdx}
      moduleName={moduleName}
      questions={questions}
      nextModuleFirstLessonKey={nextModuleFirstLessonKey}
    />
  );
}
```

- [ ] **Step 2: Build**

```bash
cd /tmp/Truos && npm run build 2>&1 | grep -E 'module-recap|error' | head -20
```

Expected: `ƒ /courses/[id]/module-recap/[moduleIdx]` appears in the route table. No type errors.

- [ ] **Step 3: Smoke test**

```bash
cd /tmp/Truos && npm run dev &
sleep 8
# Not signed in — should redirect:
curl -s -o /dev/null -w "unauthed=%{http_code}\n" -L http://localhost:3000/courses/101/module-recap/0
kill %1 2>/dev/null
```

Expected: 200 or 3xx chain (redirect to `/sign-in`). Page should compile.

- [ ] **Step 4: Commit**

```bash
cd /tmp/Truos
git add src/app/courses/
git commit -m "feat(route): /courses/[id]/module-recap/[moduleIdx]

End-of-module retrieval-practice screen. Checks auth + course access,
builds 4 recap questions from module lessons, hands off to ModuleRecap."
```

---

### Task 11: LessonPlayer redirect at module boundary

**Files:**
- Modify: `src/components/LessonPlayer.tsx`

At module-end lessons (`lesson.isModuleEnd`), after progress is saved, redirect to the module-recap route instead of `/courses/{id}/complete`.

- [ ] **Step 1: Locate the `advance()` function in `LessonPlayer.tsx`**

Find the block near the bottom of `advance()`:

```tsx
router.push(`/courses/${course.id}/complete?m=${lesson.moduleIdx}&l=${lesson.lessonIdx}&score=${score}`);
```

- [ ] **Step 2: Replace with boundary-aware redirect**

```tsx
if (lesson.isModuleEnd) {
  router.push(`/courses/${course.id}/module-recap/${lesson.moduleIdx}`);
} else {
  router.push(`/courses/${course.id}/complete?m=${lesson.moduleIdx}&l=${lesson.lessonIdx}&score=${score}`);
}
```

- [ ] **Step 3: Typecheck + build**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -10 && npm run build 2>&1 | tail -5
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /tmp/Truos
git add src/components/LessonPlayer.tsx
git commit -m "feat(player): redirect to module recap at module-end lessons

When a lesson is the last of its module (isModuleEnd), route to
/courses/[id]/module-recap/[moduleIdx] after completion instead of
the standard /complete screen."
```

---

## Phase 4 — Voice pilot (2 lessons + 2 review gates)

### Task 12: Rewrite AI·101 Lesson 6 — "Why AI confidently makes stuff up" (hallucinations)

**Files:**
- Modify: `src/content/lessons.ts` (specifically the `"101-1-2"` entry)

Re-read before starting:
- `docs/curriculum/voice-style-guide.md`
- `docs/curriculum/analogy-bank.md`
- Spec §Voice, §Lesson structure

- [ ] **Step 1: Write the new lesson as a JSON literal**

Replace the entire `"101-1-2"` entry in `src/content/lessons.ts` with a full 5-phase lesson. The new entry MUST:
- Use step types in this order: `think`, `understand`, `learn`, `apply`, `quiz`
- Use one analogy in the `understand.analogy` field (pick from analogy-bank.md — recommend "a junior who guesses when unsure")
- Respect all CLT writing rules (sentence length, demonstration over assertion, etc.)
- Randomize the position of the correct answer in both `apply.options` and `quiz.options` — do not default to position B

Replacement entry:

```json
"101-1-2": {
  "courseId": 101,
  "courseCode": "AI·101",
  "suite": "base",
  "moduleIdx": 1,
  "lessonIdx": 2,
  "moduleName": "How AI thinks (without the math)",
  "lessonIndex": 3,
  "totalInModule": 4,
  "title": "Why AI confidently makes stuff up",
  "steps": [
    {
      "type": "think",
      "title": "A confident coworker you can't always trust",
      "scenario": "Imagine an eager new colleague on your team. Bright, quick, always has an answer. You ask about a contract term from last year's deal. They answer in one second — detailed, specific, cited.",
      "prompt": "Do you forward that answer to the client without checking?"
    },
    {
      "type": "understand",
      "title": "The answer is called a hallucination",
      "body": [
        "AI doesn't know when it doesn't know. When it has a gap, it fills the gap — not with silence, but with a plausible-sounding guess. The guess sometimes happens to be right. Often it isn't.",
        "This is called a hallucination. Not a bug. Not a rare failure. A structural feature of how the technology works. Every AI chatbot does this, every day, to millions of people."
      ],
      "analogy": {
        "label": "Mental model",
        "text": "Picture an intern who never says \"I don't know.\" They guess when they're stuck. The guess sounds right. Most of the time you don't notice. But sometimes the report they hand you names a person who doesn't exist."
      }
    },
    {
      "type": "learn",
      "title": "Where it hurts most",
      "body": [
        "The danger is specificity. Vague output is easy to spot and correct. A made-up statistic with a fake source citation sounds like careful research. A made-up case law citation sounds like careful research. A made-up historical quote sounds like careful research. These slip through.",
        "Rule of thumb: the more specific and authoritative the output looks, the more it earns a fact-check. Names, dates, numbers, citations, proper nouns — all of these are hallucination-prone."
      ],
      "watchFor": "If the AI gives you a quote, a statistic, or a citation, verify it against the original source before you use it externally. Lawyers, journalists, and researchers have lost their jobs on this."
    },
    {
      "type": "apply",
      "title": "Spot the hallucination risk",
      "scenario": "You ask an AI: \"Give me three academic studies on remote work productivity.\" It replies with three papers, each with authors, journal names, and years. You need to use this in a board deck Friday. What do you do?",
      "options": [
        { "text": "Paste it into the deck. The AI has citations — looks rigorous.", "correct": false, "feedback": "This is the failure pattern. Confident citations are the highest-risk AI output. At least one of those papers probably doesn't exist." },
        { "text": "Use the AI's answer to shape your argument, but find and read the actual papers — or different real ones — before citing anything in the deck.", "correct": true, "feedback": "Right. AI for ideation speed, human verification for anything specific that's going on a slide." },
        { "text": "Ask the AI to confirm the papers are real.", "correct": false, "feedback": "Asking the AI to check its own work doesn't work. It will confidently confirm made-up papers as real." }
      ]
    },
    {
      "type": "quiz",
      "prompt": "When AI hallucinates, the most dangerous failure mode is:",
      "options": [
        { "text": "Broken grammar — obvious when you read it.", "correct": false },
        { "text": "Plausible-sounding specificity — fake names, fake citations, fake numbers that look like real research.", "correct": true },
        { "text": "Refusing to answer — easy to spot and route elsewhere.", "correct": false },
        { "text": "Taking too long to respond.", "correct": false }
      ],
      "answerNote": "Specifics sell the output. Fake statistics, fake people, fake citations — plausibility is the whole problem. Verify anything specific before it leaves your desk."
    }
  ]
}
```

- [ ] **Step 2: Typecheck + build**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -10 && npm run build 2>&1 | tail -5
```

Expected: clean.

- [ ] **Step 3: Smoke test — render the new lesson**

```bash
cd /tmp/Truos && npm run dev &
sleep 8
curl -s http://localhost:3000/courses/101/1/2 -L | head -50
kill %1 2>/dev/null
```

Expected: 200, eyebrow "THINK" visible in HTML.

- [ ] **Step 4: Commit**

```bash
cd /tmp/Truos
git add src/content/lessons.ts
git commit -m "content(101): rewrite 'Why AI confidently makes stuff up' in Merrill format

Lesson 6/20 of AI·101. Think→Understand→Learn→Apply→Quiz. Uses the
'intern who never says I don't know' analogy. First voice-pilot lesson."
```

---

### Task 13: USER REVIEW GATE — Lesson 6

**STOP. Before writing another lesson, ask Marshall to review Lesson 6 for voice, length, and clarity.**

- [ ] **Step 1: Notify the user and wait for feedback**

Post the following message and wait for explicit approval:

> "Lesson 6 ('Why AI confidently makes stuff up') rewritten and live at https://truos.ai/courses/101/1/2 once pushed. Please review:
> - Does the voice feel like Feynman-in-Stripe?
> - Does the analogy land?
> - Is the 3-phase flow (Think→Understand→Learn→Apply→Quiz) crisp or draggy?
> - Any sentence that's too long, too clever, or too corporate?
>
> If approved, I'll write Lesson 1 next and wait for a second review. If not, I'll revise Lesson 6 based on feedback."

Do not proceed to Task 14 until the user approves or gives explicit feedback.

- [ ] **Step 2: Apply any requested revisions**

If revisions are requested, edit `"101-1-2"` in `src/content/lessons.ts`, run typecheck + build, commit with message `content(101): revise Lesson 6 per review feedback`.

Repeat the review loop until approved.

---

### Task 14: Rewrite AI·101 Lesson 1 — "What is AI?" (first lesson, highest traffic)

**Files:**
- Modify: `src/content/lessons.ts` (specifically the `"101-0-0"` entry)

Apply the same process as Task 12. Use the voice locked in Lesson 6.

- [ ] **Step 1: Write the replacement entry for `"101-0-0"`**

```json
"101-0-0": {
  "courseId": 101,
  "courseCode": "AI·101",
  "suite": "base",
  "moduleIdx": 0,
  "lessonIdx": 0,
  "moduleName": "What is AI, really?",
  "lessonIndex": 1,
  "totalInModule": 4,
  "title": "What is AI?",
  "steps": [
    {
      "type": "think",
      "title": "Your neighbor's Sunday afternoon",
      "scenario": "Your neighbor tells you she used AI last night. She wrote a letter. She planned a week of meals. She asked it why her car was making a noise.",
      "prompt": "When she said \"AI,\" what exactly did she open, type into, and read back from?"
    },
    {
      "type": "understand",
      "title": "AI is software that writes back",
      "body": [
        "AI is software. Not a robot. Not a replacement human. Software — the kind you open in a browser or an app. You type a request. It writes a response. That's the core loop.",
        "The specific kind most people mean in 2026 is a chatbot: ChatGPT, Claude, Gemini, Copilot. All four work the same way from your side. You send a message. Within seconds, you get text back. You can reply, ask follow-ups, share documents with it."
      ],
      "analogy": {
        "label": "Mental model",
        "text": "Picture the most well-read assistant you ever met. They've read almost everything written on the public internet. They answer at the speed of a text message. You tell them what you need. They write it."
      }
    },
    {
      "type": "learn",
      "title": "What's NOT AI, in the way most people mean it",
      "body": [
        "Not every feature labeled \"smart\" counts. A spell-checker that fixes your typos is not AI in the sense we'll use here. A search engine that shows you pages other humans wrote — also not. A macro in Excel that sums a column — definitely not.",
        "The key distinction: AI generates new content in response to your request. It doesn't fetch a pre-written answer. It writes one, on the spot, just for you. That's the leap people talk about."
      ],
      "watchFor": "Vendors use \"AI-powered\" for everything from real chatbots to plain 2010s automation. In this course, when we say AI we mean generative — software that produces new text or images on demand."
    },
    {
      "type": "apply",
      "title": "Which of these is AI the way we mean it?",
      "scenario": "A colleague says \"we're using AI now.\" Which of these fits the modern definition?",
      "options": [
        { "text": "A macro in Excel that adds up a column.", "correct": false, "feedback": "That's automation with fixed rules. AI today generates new responses; a macro just follows a script you wrote." },
        { "text": "A spam filter from 2008.", "correct": false, "feedback": "An older form of machine learning. Real, but not what people mean when they say \"AI\" in 2026." },
        { "text": "A chatbot that drafts an email from a sentence you typed.", "correct": true, "feedback": "Exactly. Generating new text from your input is the everyday face of AI today." }
      ]
    },
    {
      "type": "quiz",
      "prompt": "The clearest way to describe AI to a family member is:",
      "options": [
        { "text": "A robot that lives in your computer.", "correct": false },
        { "text": "A search engine with a new name.", "correct": false },
        { "text": "Software that reads your input and generates a response, like a very fast, very well-read assistant.", "correct": true },
        { "text": "A future technology that isn't really here yet.", "correct": false }
      ],
      "answerNote": "AI today is not a robot, not search, not hypothetical. It's working software generating new responses — millions of times an hour, already."
    }
  ]
}
```

- [ ] **Step 2: Typecheck + build + smoke-test**

```bash
cd /tmp/Truos && npx tsc --noEmit 2>&1 | head -10 && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/Truos
git add src/content/lessons.ts
git commit -m "content(101): rewrite 'What is AI?' (Lesson 1) in Merrill format

Entry lesson, highest traffic. Voice pilot #2."
```

---

### Task 15: USER REVIEW GATE — Lesson 1

**STOP. Wait for Marshall to review Lesson 1 before writing any of the remaining 18.**

- [ ] **Step 1: Notify + wait**

Same process as Task 13. Post for review; wait for approval. Revise if needed until approved.

- [ ] **Step 2: Apply revisions to Lesson 1 OR Lesson 6 if the review exposes voice issues that need retroactive fixes**

Once both pilot lessons are approved, proceed to Phase 5.

---

## Phase 5 — Bulk rewrite of the remaining 18 AI·101 lessons

Each module task rewrites multiple lessons in one sitting. Structure is uniform: for each lesson, produce a 5-step Merrill lesson with one analogy, respecting the voice guide. Include Quick Recall steps where the schedule calls for them.

Quick Recall schedule (lessons where a `recall` step is the FIRST step, before the `think` step):

- Lesson at key `101-0-3` (overall lesson 4) — recall sourced from `101-0-0` (Lesson 1)
- Lesson at key `101-1-2` (overall lesson 7) — **already rewritten in Task 12** — needs Quick Recall retrofit (covered in Task 17)
- Lesson at key `101-2-1` (overall lesson 10) — recall sourced from `101-1-0`
- Lesson at key `101-3-0` (overall lesson 13) — recall sourced from `101-2-1`
- Lesson at key `101-3-3` (overall lesson 16) — recall sourced from `101-3-0`
- Lesson at key `101-4-2` (overall lesson 19) — recall sourced from `101-3-3`

For each of these, the `steps` array starts with a `recall` step, then the usual `think/understand/learn/apply/quiz`.

### Task 16: Module 1 — lessons 2, 3, 4 (keys `101-0-1`, `101-0-2`, `101-0-3`)

**Files:**
- Modify: `src/content/lessons.ts`

- [ ] **Step 1: Rewrite `101-0-1` ("Kinds of AI you'll meet")**

Replace the entry with a 5-step Merrill lesson. Titles, scenarios, analogy (pick from bank), apply options, quiz options. Correct-answer position randomized. No B-bias.

- [ ] **Step 2: Rewrite `101-0-2` ("What's a chatbot?")**

Same approach.

- [ ] **Step 3: Rewrite `101-0-3` ("Signing up: picking a tool") — Quick Recall + 5-phase**

Insert a `recall` step as step 0, sourcing from `101-0-0` (Lesson 1). Example:

```json
{
  "type": "recall",
  "title": "Quick recall",
  "recallingLessonKey": "101-0-0",
  "prompt": "From Lesson 1 — in our definition, what separates AI from a spell-checker?",
  "options": [
    { "text": "AI runs in the browser.", "correct": false },
    { "text": "AI generates new content; a spell-checker applies fixed rules.", "correct": true },
    { "text": "AI is always free.", "correct": false },
    { "text": "AI requires a paid account.", "correct": false }
  ],
  "answerNote": "Generative is the word. Spell-checkers match patterns; AI writes new text."
}
```

Then the usual 5 phases follow.

- [ ] **Step 4: Typecheck + build**

```bash
cd /tmp/Truos && npx tsc --noEmit && npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
cd /tmp/Truos
git add src/content/lessons.ts
git commit -m "content(101): rewrite Module 1 lessons 2–4

- Lesson 2 'Kinds of AI you'll meet' — 5-phase Merrill
- Lesson 3 'What's a chatbot?' — 5-phase Merrill
- Lesson 4 'Signing up' — Quick Recall (from L1) + 5-phase"
```

---

### Task 17: Module 2 — lessons 5, 7-revisit, 8 (keys `101-1-0`, `101-1-2`, `101-1-3`)

Note: Lesson 6 (`101-1-1` "Trained once, used forever") and Lesson 7 (`101-1-2` "Why AI confidently makes stuff up") are adjacent. Lesson 7 was rewritten in Task 12 — now retrofit a Quick Recall step into it (sourcing from `101-1-0` or `101-0-3`).

- [ ] **Step 1: Rewrite `101-1-0` ("It's predicting words")**

5-phase Merrill. Analogy recommendation: "a well-read assistant who never tires."

- [ ] **Step 2: Rewrite `101-1-1` ("Trained once, used forever")**

5-phase Merrill.

- [ ] **Step 3: Retrofit Quick Recall into `101-1-2`**

Add a `recall` step at position 0 of the existing Lesson 7 (from Task 12). Source: `101-1-0` ("It's predicting words"). Example:

```json
{
  "type": "recall",
  "title": "Quick recall",
  "recallingLessonKey": "101-1-0",
  "prompt": "How does an AI chatbot produce its response at the word level?",
  "options": [
    { "text": "By searching the web and returning the top match.", "correct": false },
    { "text": "By predicting the next likely word, one at a time.", "correct": true },
    { "text": "By looking up the answer in a database.", "correct": false },
    { "text": "By using a human operator in another country.", "correct": false }
  ],
  "answerNote": "Word-by-word prediction is the whole mechanism. Understanding that makes the rest of AI click."
}
```

- [ ] **Step 4: Rewrite `101-1-3` ("What AI can't do")**

5-phase Merrill.

- [ ] **Step 5: Typecheck + build + commit**

```bash
cd /tmp/Truos && npx tsc --noEmit && npm run build 2>&1 | tail -5
git add src/content/lessons.ts
git commit -m "content(101): rewrite Module 2 lessons 5, 6, 8; retrofit recall into Lesson 7"
```

---

### Task 18: Module 3 — lessons 9, 10, 11, 12 (keys `101-2-0` through `101-2-3`)

- [ ] **Step 1: Rewrite `101-2-0` ("What is a prompt?")**

- [ ] **Step 2: Rewrite `101-2-1` ("Clear asks beat clever ones") — Quick Recall from `101-1-0` as step 0**

- [ ] **Step 3: Rewrite `101-2-2` ("Give it context")**

- [ ] **Step 4: Rewrite `101-2-3` ("Iterating: ask again") — this is a module-end lesson (isModuleEnd: true already set by migration; verify retained after rewrite)**

- [ ] **Step 5: Typecheck + build + commit**

```bash
cd /tmp/Truos && npx tsc --noEmit && npm run build 2>&1 | tail -5
git add src/content/lessons.ts
git commit -m "content(101): rewrite Module 3 lessons 9–12"
```

---

### Task 19: Module 4 — lessons 13, 14, 15, 16 (keys `101-3-0` through `101-3-3`)

- [ ] **Step 1: Rewrite `101-3-0` ("What NOT to share") — Quick Recall from `101-2-1`**

- [ ] **Step 2: Rewrite `101-3-1` ("Fact-checking AI")**

- [ ] **Step 3: Rewrite `101-3-2` ("When NOT to use AI")**

- [ ] **Step 4: Rewrite `101-3-3` ("Biases and blind spots") — Quick Recall from `101-3-0`; isModuleEnd**

- [ ] **Step 5: Typecheck + build + commit**

```bash
cd /tmp/Truos && npx tsc --noEmit && npm run build 2>&1 | tail -5
git add src/content/lessons.ts
git commit -m "content(101): rewrite Module 4 lessons 13–16"
```

---

### Task 20: Module 5 — lessons 17, 18, 19, 20 (keys `101-4-0` through `101-4-3`)

- [ ] **Step 1: Rewrite `101-4-0` ("Write a polished email")**

- [ ] **Step 2: Rewrite `101-4-1` ("Summarize a long document")**

- [ ] **Step 3: Rewrite `101-4-2` ("Brainstorm options") — Quick Recall from `101-3-3`**

- [ ] **Step 4: Rewrite `101-4-3` ("Certification quiz") — this is a graduation/cert-quiz lead-in lesson; keep structure simple, likely 3 phases (think/understand/apply) rather than full 5; ends with the existing cert-quiz flow**

- [ ] **Step 5: Typecheck + build + commit**

```bash
cd /tmp/Truos && npx tsc --noEmit && npm run build 2>&1 | tail -5
git add src/content/lessons.ts
git commit -m "content(101): rewrite Module 5 lessons 17–20"
```

---

## Phase 6 — /methodology page + Footer links

### Task 21: `/methodology` page

**Files:**
- Create: `src/app/methodology/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Methodology — Truos',
  description: 'How Truos courses are built. Grounded in Merrill\'s First Principles of Instruction, Cognitive Load Theory, and Retrieval Practice.',
};

export default function MethodologyPage() {
  return (
    <>
      <Nav />
      <main className="container" style={{ padding: '64px 32px 80px', maxWidth: 880 }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 14 }}>HOW WE TEACH</div>
        <h1 style={{ fontSize: 56, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.05 }}>
          The science behind every lesson
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 640, marginBottom: 56 }}>
          Truos courses are built on three pillars of evidence-based learning. Not branding. Actual instructional design.
        </p>

        <section style={{ marginBottom: 56 }}>
          <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>PILLAR 1 · STRUCTURE</div>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.025em', margin: '0 0 16px' }}>Merrill's First Principles of Instruction</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)' }}>
            David Merrill's 2002 paper, one of the most-cited works in instructional design, distilled decades of learning research into five principles. Every Truos lesson follows them:
          </p>
          <ul style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-muted)', margin: '16px 0 16px 20px' }}>
            <li><strong style={{ color: 'var(--text)' }}>Activation</strong> — prime your existing knowledge (our "Think" step)</li>
            <li><strong style={{ color: 'var(--text)' }}>Demonstration</strong> — show the concept directly (our "Understand" + "Learn" steps)</li>
            <li><strong style={{ color: 'var(--text)' }}>Application</strong> — use it in a realistic scenario (our "Apply" step)</li>
            <li><strong style={{ color: 'var(--text)' }}>Integration</strong> — test and consolidate (our "Quiz" step + module recaps)</li>
            <li><strong style={{ color: 'var(--text)' }}>Problem-centered</strong> — every lesson sits inside a real problem, not abstract theory</li>
          </ul>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Merrill, M. D. (2002). First Principles of Instruction. <em>Educational Technology Research and Development</em>, 50(3), 43–59.
          </p>
        </section>

        <section style={{ marginBottom: 56 }}>
          <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>PILLAR 2 · WRITING</div>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.025em', margin: '0 0 16px' }}>Cognitive Load Theory</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)' }}>
            John Sweller's theory (1988, University of New South Wales) says working memory is tiny. Teaching that overloads it fails. Every Truos voice rule is an operational response to CLT:
          </p>
          <ul style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-muted)', margin: '16px 0 16px 20px' }}>
            <li>Lessons are 3–4 minutes — chunked to working-memory capacity</li>
            <li>Exactly one analogy per lesson — multiple analogies fight each other</li>
            <li>Concrete examples precede abstract definitions</li>
            <li>No split attention — content and diagrams don't reference each other across steps</li>
          </ul>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. <em>Cognitive Science</em>, 12(2), 257–285.
          </p>
        </section>

        <section style={{ marginBottom: 56 }}>
          <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>PILLAR 3 · RETENTION</div>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.025em', margin: '0 0 16px' }}>Retrieval Practice</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)' }}>
            The single most evidence-backed technique in learning science: pulling information back out of your own head beats re-reading by 40–60% for long-term retention. Every Truos course uses it in two ways:
          </p>
          <ul style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-muted)', margin: '16px 0 16px 20px' }}>
            <li><strong style={{ color: 'var(--text)' }}>Quick Recall</strong> — every third lesson opens with a 30-second check on a concept from two lessons back. The spacing effect, applied to everyday learning.</li>
            <li><strong style={{ color: 'var(--text)' }}>Module Recap</strong> — each module ends with a four-question interleaved review. Deliberate, not optional.</li>
          </ul>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Roediger, H. L., &amp; Karpicke, J. D. (2006). The power of testing memory: Basic research and implications for educational practice. <em>Perspectives on Psychological Science</em>, 1(3), 181–210.
          </p>
        </section>

        <section style={{ padding: '32px 36px', borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>SEE IT IN ACTION</div>
          <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Free first lesson</h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            AI·101 is free — including Quick Recall, Module Recap, and everything described above. Start with Lesson 1 to see the structure at work.
          </p>
          <Link className="btn btn-primary" href="/courses/101/0/0">Take Lesson 1 free →</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Build + smoke test**

```bash
cd /tmp/Truos && npm run build 2>&1 | grep -E 'methodology|error' | head
```

Expected: `/methodology` route appears. No errors.

```bash
cd /tmp/Truos && npm run dev &
sleep 8
curl -s -o /dev/null -w "methodology=%{http_code}\n" http://localhost:3000/methodology
kill %1 2>/dev/null
```

Expected: 200.

- [ ] **Step 3: Commit**

```bash
cd /tmp/Truos
git add src/app/methodology/
git commit -m "feat(route): /methodology page with learning-science citations

Explains the Merrill + CLT + Retrieval Practice stack with primary
citations. Links to Lesson 1 of AI·101 as live proof."
```

---

### Task 22: Footer links (shared `Footer.tsx` + inline homepage footer)

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add `/methodology` link to `src/components/Footer.tsx`**

Find:

```tsx
<Link className="nav-link" href="/glossary">Glossary</Link>
<Link className="nav-link" href="/verify">Verify a cert</Link>
```

Insert `<Link className="nav-link" href="/methodology">Methodology</Link>` between those two lines.

- [ ] **Step 2: Add the same link to the inline footer on the homepage**

In `src/app/page.tsx`, find the inline `function Footer()` definition and apply the same insertion.

- [ ] **Step 3: Build + commit**

```bash
cd /tmp/Truos && npm run build 2>&1 | tail -5
git add src/components/Footer.tsx src/app/page.tsx
git commit -m "feat(footer): /methodology link site-wide

Adds the learning-science methodology page to both the shared Footer
component and the inline homepage footer."
```

---

## Phase 7 — Verification and push

### Task 23: Full integration smoke test

- [ ] **Step 1: Run build**

```bash
cd /tmp/Truos && npm run build 2>&1 | tail -30
```

Expected: all routes build; `/methodology` and `/courses/[id]/module-recap/[moduleIdx]` appear; no type errors.

- [ ] **Step 2: Start dev server and verify key routes**

```bash
cd /tmp/Truos && npm run dev &
sleep 8
for path in / /start /glossary /methodology /courses/101/0/0 /courses/101/1/2; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$path)
  echo "$path = $code"
done
kill %1 2>/dev/null
```

Expected: homepage 200, /start 200, /glossary 200, /methodology 200, /courses/101/0/0 200, /courses/101/1/2 200.

- [ ] **Step 3: Manual inspection**

In a browser, open http://localhost:3000/courses/101/0/0 and progress through the lesson. Verify the order is Think → Understand → Learn → Apply → Quiz. Verify the "UNDERSTAND" eyebrow appears instead of "READ".

Then open http://localhost:3000/courses/101/0/3 and progress. Verify it ends by redirecting to `/courses/101/module-recap/0` showing the 4-question recap for Module 1.

- [ ] **Step 4: Push to GitHub (triggers Vercel prod deploy)**

```bash
cd /tmp/Truos && git push origin main
```

- [ ] **Step 5: Wait for Vercel deploy, then verify production**

```bash
export VERCEL_TOKEN=$(grep VERCEL_TOKEN= ~/openclaw/.env | cut -d= -f2-)
sleep 60
until state=$(curl -s "https://api.vercel.com/v6/deployments?projectId=prj_9bsLJwIo7QtCkegkQxjf2Cd9VM4Q&teamId=team_i6aRa1BfpZGNFOr8rM1yTyGS&limit=1" -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['deployments'][0]['state'])") && [ "$state" != "BUILDING" ] && [ "$state" != "QUEUED" ] && [ "$state" != "INITIALIZING" ]; do
  echo "state=$state"; sleep 10
done
echo "FINAL: $state"

for path in / /methodology /courses/101/0/0; do
  code=$(curl -s -o /dev/null -w "%{http_code}" https://truos.ai$path)
  echo "prod $path = $code"
done
```

Expected: FINAL=READY, all production routes 200.

---

## Self-review checklist (run after drafting)

1. **Spec coverage:** ✅ Framework stack (Tasks 1, 2, 21). Lesson structure (Tasks 4, 6, 7). Retrieval mechanics (Tasks 8, 9, 10, 11 + 16–20). Voice (Tasks 1, 2). Schema replace (Tasks 4, 5, 6, 7). Quiz shuffle (Task 3). `/methodology` (Task 21). Footer link (Task 22).
2. **Placeholder scan:** Each bulk-rewrite task (16–20) is light on exact code — it says "rewrite lesson X in 5-phase Merrill format" rather than providing 18 × 1,200-word lesson bodies. That's intentional because (a) the spec explicitly requires creative writing per lesson, (b) lesson bodies are not deterministic code, (c) the pilot lessons in Tasks 12 and 14 serve as fully-specified templates the engineer copies the structure from. **Acceptable non-placeholder.** The plan DOES specify exact Quick Recall positions, source lesson keys, and module-end isModuleEnd flags.
3. **Type consistency:** `recallingLessonKey` used in types.ts (Task 4), RecallStepView (Task 6), and lesson content (Tasks 16–20). `isModuleEnd` used in types.ts (Task 4), migration script (Task 5), and LessonPlayer redirect (Task 11). `buildRecapQuestions` used in recaps.ts (Task 8) and module-recap route (Task 10). All consistent.
4. **Voice rule enforcement:** Pilot lessons in Tasks 12 and 14 demonstrate voice in full. Bulk rewrite tasks (16–20) reference the voice style guide and analogy bank (Tasks 1, 2).

---

## Execution notes

**Parallelism:** Tasks 16–20 (bulk rewrite, one per module) can each be handed to a separate subagent once the pilots (Tasks 12, 14) are approved. This cuts the Phase-5 wall-clock from ~15 hours to ~2–3 hours with five agents running in parallel.

**Review gates:** Tasks 13 and 15 are HARD stops. Do not proceed past them without Marshall's approval. If the subagent executor encounters these gates, it should surface the relevant lesson content to the top-level review and wait.

**Rollback plan:** `src/content/lessons.ts.pre-shuffle.bak` and `src/content/lessons.ts.pre-migration.bak` are created by Tasks 3 and 5. If any migration goes wrong, restore from backup and re-run with fixed logic.
