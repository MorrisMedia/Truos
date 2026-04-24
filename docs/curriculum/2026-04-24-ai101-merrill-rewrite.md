# AI·101 Rewrite — Merrill + Cognitive Load Theory + Retrieval Practice

**Status:** Draft (paused for user review)
**Date:** 2026-04-24
**Scope:** Full rewrite of all 20 lessons in AI·101 using an evidence-based learning framework. Global lesson-schema migration and quiz answer shuffle apply site-wide as prerequisites.

---

## Why

Three quality problems with the current course content:

1. **Quiz answer bias.** Across all 148 lessons, correct answers cluster in position B (83–100% across courses). Option D is the correct answer **zero times in 444 questions**. A learner who clicks B every time passes without learning. This hollows out the certification.

2. **Skipped pedagogy.** Today's 3-step lesson structure (Read → Engage → Quiz) omits priming (activation) and real practical transfer (application) — the two highest-impact moves in learning science.

3. **Voice is generic.** Current lessons read like adequate AI-generated content. No memorable analogies, no deliberate chunking, no voice distinct from any other course platform.

AI·101 is the free lead magnet and the most-trafficked content in the product. Upgrading it has disproportionate impact on brand perception, cert-upsell conversion, and enterprise credibility.

---

## Framework stack

**Primary citation: Merrill's First Principles of Instruction (2002).**
A meta-synthesis framework from Utah State University, one of the most-cited papers in instructional design. Prescribes a five-phase lesson structure: activation → demonstration → application → integration, organized around problem-centered learning. This IS the new lesson structure we adopt.

**Supporting technique: Cognitive Load Theory (Sweller, 1988).**
Operational writing rules: manage intrinsic load (chunk), eliminate extraneous load (one analogy, no split-attention), promote germane load (worked examples). Gives us the style guide.

**Supporting technique: Retrieval Practice (Roediger & Karpicke, Ebbinghaus origins).**
The testing effect: active recall beats re-reading for long-term retention by 40–60%. Drives our Quick Recall and Module Recap mechanics, and justifies the quiz-shuffle.

Medium-visibility academic branding: a `/methodology` page explaining the framework with citations, linked from the footer and referenced in the Enterprise sales deck.

---

## Locked decisions

### 1. Lesson structure: 5 phases, ~3–4 minutes

| Step | Merrill phase | Purpose | Approx time |
|---|---|---|---|
| **Think** | Activation | Prime curiosity; surface a question the learner doesn't yet know they have | 20–30 sec |
| **Understand** | Demonstration | Core concept in plain English, one crisp analogy | 60 sec |
| **Learn** | Demonstration (extension) | How it shows up in real work, failure modes, watch-for | 60 sec |
| **Apply** | Application | Guided scenario — learner uses the concept | 60 sec |
| **Quiz** | Integration | Assessment, 4 options with randomized positions, plausible distractors | 30 sec |

### 2. Retrieval Practice mechanics (shape C)

**Quick Recall (v1):** One-question mini-check at the START of every 3rd lesson, drawn from a lesson 2–3 prior. In AI·101: lessons 4, 7, 10, 13, 16, 19 each open with a single Quick Recall step before the Think phase begins. Each Recall step is exactly one question; if a lesson needs two recalls, two Recall steps are inserted back-to-back (not expected in v1).

**Module Recap Check (v2):** 4-question interleaved review at the END of each module (one question per lesson in the module). In AI·101: recaps fire after lessons 4, 8, 12, 16, 20.

### 3. Voice: Feynman-in-Stripe

- Average sentence ≤ 18 words
- Concrete before abstract, always
- Exactly one analogy per lesson — never two or three
- Cross-culturally translatable analogy sources: doors, water, rooms, markets, maps, keys, notebooks, tools, letters, roads, chairs, mirrors. **Banned:** sports (baseball/cricket/football), US-centric history and idioms, religious references, specific brand names except when teaching them
- One earned dry joke per lesson, max
- Never "as you probably know"; always "here's the thing almost nobody gets"
- No corporate filler — no "leverage," "utilize," "robust"
- Demonstration over assertion — don't say "AI hallucinates"; prove it: "Ask AI for three studies on remote work. It'll give you three. At least one won't exist."

### 4. Schema: replace existing step types site-wide

Delete from type system: `read | engage`. Keep `quiz` (with answer-position shuffle).
Add: `think | understand | learn | apply | recall`.

Final canonical type set:
```ts
type LessonStepType = 'think' | 'understand' | 'learn' | 'apply' | 'quiz' | 'recall';
```

All 148 existing lessons mechanically migrated as a one-pass script:
- `read` → `understand` (body content and callout preserved; callout becomes the `analogy` field)
- `engage` → `apply` (scenario and options preserved unchanged)
- `quiz` → `quiz` (unchanged in type; options shuffled — see below)

After migration, non-101 courses render with 3 steps (understand/apply/quiz) instead of 5. They are pedagogically "lighter" than AI·101 until they get their own hand-rewrite in a future spec. AI·101 gets the full 5-phase + recall treatment immediately.

### 5. Global quiz answer-position shuffle

Standalone pre-task, runs before any content rewrite:

- For every `apply` and `quiz` step across all 148 lessons, randomly re-order the `options` array
- Preserve the `correct: true` flag position relative to its option (move the whole option, not the flag)
- Preserve `feedback` and `answerNote` mappings (they reference options by index, so shuffle updates the index correctly)
- Seed-deterministic so the same lesson shuffled twice produces the same result (makes review/audit easier)

This eliminates the B-bias site-wide in under 5 minutes of build time.

### 6. Scope

In-scope for this spec:
- All 20 AI·101 lessons — full hand-rewrite
- Schema replacement (types, `LessonPlayer`, migration script)
- Global quiz option shuffle
- Quick Recall + Module Recap mechanics
- `/methodology` page + footer link

Out of scope (future specs):
- Hand-rewrite of AI·102, 103, 104
- Hand-rewrite of Truos+ courses (CPLT·101, CPLT·EXL, GEM·101, GEM·SHT)
- Cross-course retrieval (e.g., lesson in 102 recalls content from 101)
- Open-input "Apply" steps (typed user input vs. multi-choice)
- Video or audio content
- Stripe/pricing changes (parked, separate spec)

---

## Technical design

### Type definitions (`src/content/types.ts`)

```ts
export type LessonStepType = 'think' | 'understand' | 'learn' | 'apply' | 'quiz' | 'recall';

export interface ThinkStep {
  type: 'think';
  title: string;
  scenario: string;      // 1–2 sentences
  prompt: string;        // open question, no UI input; "Take 5 seconds to picture it."
}

export interface UnderstandStep {
  type: 'understand';
  title: string;
  body: string[];                             // 2 short paragraphs max
  analogy?: { label: string; text: string };  // "Mental model" + concrete analogy; optional for mechanically-migrated lessons
}

export interface LearnStep {
  type: 'learn';
  title: string;
  body: string[];        // 1 paragraph, extension/nuance
  watchFor: string;      // highlighted "watch for this" note
}

export interface ApplyStep {
  type: 'apply';
  title: string;
  scenario: string;      // realistic problem setup
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
  title: string;              // "Quick recall"
  recallingLessonKey: string; // e.g. "101-0-1" — for traceability
  prompt: string;
  options: { text: string; correct: boolean }[];
  answerNote: string;
}

export type LessonStep = ThinkStep | UnderstandStep | LearnStep | ApplyStep | QuizStep | RecallStep;
```

### Module-level changes

```ts
export interface Lesson {
  // ... existing fields unchanged ...
  steps: LessonStep[];
  // New: module-recap metadata emitted at runtime for end-of-module lessons
  isModuleEnd?: boolean;
}
```

Module recap is a separate route, not a step — rendered as `/courses/[id]/module-recap/[moduleIdx]` after the last lesson of each module. This keeps recaps out of the per-lesson schema and allows richer UI (interleaved 4-question format).

### Migration script (`scripts/migrate-lessons-v2.ts`)

One-pass TS script:

1. Load `src/content/lessons.ts` in memory
2. For each lesson, for each step:
   - If `step.type === 'read'`: emit as `understand` step. Body preserved. If a `callout` existed, its `{ label, text }` becomes the `analogy` field. If no callout, `analogy` is omitted (the UI renders no mental-model callout for that step).
   - If `step.type === 'engage'`: emit as `apply` step. Shape identical — `prompt → scenario`, options preserved.
   - If `step.type === 'quiz'`: keep as `quiz`, shuffle options.
3. Seed-deterministic shuffle for all multi-option steps (seed = lesson key + step index)
4. Write new `src/content/lessons.ts` (back up the old one)

Mechanical migration is lossy for non-101 courses — they lose `think`, `learn`, and `recall` phases until rewritten. Accepted trade-off for clean schema.

### `LessonPlayer` changes (`src/components/LessonPlayer.tsx`)

- Remove `ReadStepView` and `EngageStepView`
- Add render components: `ThinkStepView`, `UnderstandStepView`, `LearnStepView`, `ApplyStepView`, `RecallStepView`
- Keep `QuizStepView`
- Progress bar calculation unchanged (step count is the driver)
- When `stepIdx === 0 && step.type === 'recall'`: treat as pre-lesson Quick Recall (distinct visual style, skippable after answer)

### Module Recap route

New route: `/courses/[id]/module-recap/[moduleIdx]`
- Aggregates 1 question from each lesson in the module
- Interleaves order (not back-to-back by source lesson)
- Shows overall score + per-question review
- "Continue to next module" CTA to the first lesson of module+1
- Renders only for AI·101 initially; other courses skip this route

### Cert-quiz unaffected

The existing cert-quiz system stays as-is. The cert-quiz pool pulls from lesson content; as lessons get rewritten the pool auto-updates.

### `/methodology` page

New static page (`src/app/methodology/page.tsx`):

- Hero: "How Truos courses are built"
- Section 1: Merrill's 5 phases, diagram, brief citation (Merrill 2002)
- Section 2: Cognitive Load Theory — our writing discipline (Sweller 1988)
- Section 3: Retrieval Practice — the spacing effect (Roediger & Karpicke)
- Section 4: "See it in action" — a link into a free lesson with phase labels visible

Linked from site footer. Referenced in Enterprise sales-page copy.

---

## Resolved (formerly open) decisions

1. **Lesson execution order: Lesson 6 + Lesson 1 as voice reference, then bulk the remaining 18.**
   Lesson 6 ("Why AI confidently makes stuff up" — hallucinations) goes first because it's the hardest conceptual lesson and the biggest test of analogy craft. Lesson 1 ("What is AI?") goes second because it's the most-read lesson and needs the full Feynman-in-Stripe voice nailed. Marshall reviews both before any of the remaining 18 are written. Review gate exists as a checkpoint in the implementation plan.

2. **Module Recap question count: 4.** One question per lesson in the module. Clean 1:1 mapping between lessons taught and recalled. Five modules × 4 lessons = 4 recall questions per module.

3. **Quick Recall cadence: every 3rd lesson, pulling from a lesson 2–3 prior.** AI·101 Quick Recall positions: lessons 4, 7, 10, 13, 16, 19. Sources: lesson 1 (→ recalled in 4), lesson 4 (→ 7), lesson 7 (→ 10), lesson 10 (→ 13), lesson 13 (→ 16), lesson 16 (→ 19). Keeps pacing crisp without over-testing.

4. **Analogy seed bank: yes, build as part of the voice style guide.**
   Pre-curate 40–50 cross-culturally translatable analogies (doors, water, rooms, markets, maps, keys, notebooks, tools, letters, roads, chairs, mirrors, restaurants, etc.). Writers select one per lesson from the bank OR propose a new analogy that matches the ban-list discipline (no sports, no US idioms, no religious references, no specific brand names except when teaching brands). Analogy bank lives at `docs/curriculum/analogy-bank.md`, grows over time.

5. **No "coming soon" banner on mechanically-migrated non-101 courses.** They ship as 3-step lessons (understand/apply/quiz) after migration. Quality is acceptable as-is. Hand-rewrite priority in future specs will be AI·102 → AI·103 → AI·104 → Truos+ courses in order of traffic.

---

## Dependencies and risks

- **Content production time.** 20 hand-written lessons × ~1,200 words = ~24k words of careful writing. Realistic at ~1 lesson per hour with pattern locked = 20+ hours. Plan will break this into batches with review checkpoints.
- **Voice drift across 20 lessons.** Biggest quality risk. Mitigated by: (a) writing 2 reference lessons first, (b) hard style-guide rules in the plan (sentence length, analogy budget), (c) self-review against the guide on each lesson.
- **Mechanical migration breaking rendering.** 148 lessons touched in one script. Mitigated by: run on a copy first, manually verify 5 sampled lessons render correctly in the new `LessonPlayer` before committing.
- **Quiz shuffle breaks cert-quiz determinism.** The cert-quiz uses a hash-seeded question selection per user. After shuffle, option indices change but question identity doesn't, so selection is preserved. Verify with a sample cert-quiz run before shipping.
- **`recall.recallingLessonKey` needs validation.** Recall steps reference other lessons by key. Broken references would show dead recalls. Plan will include a build-time check that all `recallingLessonKey` values exist.

---

## Marketing / positioning impact

The `/methodology` page and medium-visibility footer link reframe Truos from "yet another AI course platform" to "the only AI training built on a citable learning-science framework." Enterprise buyers hear "Merrill's First Principles + Cognitive Load Theory + Retrieval Practice" and read it as "these people know what they're doing." Consumers hear "active recall at optimal intervals" and feel confident their time isn't wasted.

Specific marketing lines unlocked:
- Homepage footer: "Built on Merrill's First Principles of Instruction. Every lesson uses retrieval practice for long-term retention."
- Enterprise deck: "Same learning-science stack used in Harvard Business School executive education and Khan Academy."
- Paid-ads: "Active recall, not passive reading. 40% better retention, per Roediger & Karpicke 2006."

All defensible — because the implementation actually does these things.

---

## Related work / memory

- Pricing strategy spec: `docs/pricing/2026-04-24-pricing-strategy.md` (paused)
- AI·101 live at https://truos.ai/courses/101/0/0 in current 3-step format
- Cert gate (2026-04-24): free-course certs require any paid entitlement. Unchanged by this work.
