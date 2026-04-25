# Subagent Runbook — Truos Merrill Rewrite (all courses)

This file is shared context for every Phase-5+ content subagent. Read the whole thing before writing. **This runbook applies to every Truos course** (AI·101/102/103/104 base + CPLT·101/EXL + GEM·101/SHT plus). AI·101 was the voice pilot; every other course follows the same recipe.

---

## Your job

Rewrite the module of lessons you're assigned using Merrill's First Principles (5 phases) and Truos's "Feynman in a Stripe doc" voice. Preserve each lesson's existing teaching topic — **don't invent new subject matter**; rewrite the same concept with the new pedagogy and voice.

Write your output as a JSON file at `/tmp/truos-<course>-module-<N>.json` (the exact path is in your dispatch prompt). Each value is a full `Lesson` object matching the schema in `src/content/types.ts` exactly. **Do not edit `src/content/lessons.ts` directly — only write the JSON file.**

---

## The 5-phase lesson structure (Merrill)

Every lesson has these step types, in this order:

1. **Think** (activation) — 20–30s. Prime curiosity. A scenario + a question the learner hasn't asked yet. No answer here, just priming.
2. **Understand** (demonstration) — 60s. Core concept in plain English. 1–2 short paragraphs. Exactly one `analogy` object.
3. **Learn** (demonstration extension) — 60s. How the concept shows up in real work, failure modes. 1 paragraph. One `watchFor` string (highlighted callout).
4. **Apply** (application) — 60s. A realistic scenario + 3 options. Exactly one `correct: true`. Each option gets `feedback`.
5. **Quiz** (integration) — 30s. 4 options. Exactly one `correct: true`. `answerNote` at the end.

**Exception — recall-start lessons:** if the runbook tells your lesson to open with a Quick Recall, prepend a `recall` step BEFORE the `think` step. Recall pulls one question from a prior lesson (the dispatch prompt specifies which).

---

## Type schema (`src/content/types.ts` — exact fields)

```ts
ThinkStep    = { type: 'think', title, scenario, prompt }
UnderstandStep = { type: 'understand', title, body: string[], analogy?: { label, text } }
LearnStep    = { type: 'learn', title, body: string[], watchFor }
ApplyStep    = { type: 'apply', title, scenario, options: [{ text, correct, feedback? }] }
QuizStep     = { type: 'quiz', prompt, options: [{ text, correct }], answerNote }
RecallStep   = { type: 'recall', title, recallingLessonKey, prompt, options: [{ text, correct }], answerNote }
```

Every new lesson must have `"isModuleEnd": true` if it's the last lesson of its module (the key with the highest third number in the module), otherwise `"isModuleEnd": false`. Always emit the field.

---

## Voice rules (non-negotiable — auditor will check these)

1. Average sentence ≤ 18 words. Long sentences MUST be split.
2. Concrete before abstract. Show the thing, then name it.
3. Demonstration over assertion. Don't tell them "AI hallucinates" — show the three studies.
4. **Exactly one analogy per lesson** — goes in the `understand` step's `analogy` field. Never two. Never three.
5. Banned words (NEVER use): **leverage, utilize, robust, solution, seamless, unlock, supercharge, harness, power of**. (Exception: a banned word quoted as an anti-pattern — e.g. teaching learners to tell AI "don't say 'supercharge'" — is fine.)
6. Banned analogy sources: sports (any — baseball, cricket, football, soccer, basketball), US-centric history/idioms ("kick the tires", "home run", "9 yards"), religious references, specific brand names (unless teaching that brand, e.g. Copilot/Gemini courses where the product IS the subject).
7. Preferred analogy sources (from `analogy-bank.md`): doors, water, rooms, markets, maps, keys, notebooks, tools, letters, roads, chairs, mirrors, restaurants, weather, food (generic), plus roles like "a bright junior", "a well-read assistant".
8. One dry earned joke per lesson, MAX. If it doesn't land on first read, cut it.
9. Never "as you probably know." Preferred: "here's the thing almost nobody gets."
10. Don't condescend. Don't pad. Every sentence earns its keep.

---

## Reference lessons — match this voice exactly

Open `src/content/lessons.ts` and read these two lessons in full. They are the canonical voice templates:

- **Reference A: `101-0-0`** ("What is AI?") — voice pilot #2, written by the senior author. Simple foundation topic.
- **Reference B: `101-1-2`** ("Why AI confidently makes stuff up") — voice pilot #1, harder conceptual topic. Shows how the 5-phase lands on abstraction.

Both are canonical. If you're ever unsure about tone or structure, re-read them.

---

## Course-specific context

The dispatch prompt will tell you which course you're working in. Keep these in mind:

- **AI·102 — AI Prompt Mastery** ($499 tier). Prompting craft at depth. Audience has done AI·101 or equivalent. Don't re-teach fundamentals.
- **AI·103 — Applied AI at Work** ($999). AI for real commercial roles — sales, marketing, ops, etc. Concrete role-specific scenarios in every Apply step.
- **AI·104 — AI Workflow Mastery** ($1,499). The capstone — design, ship, defend a real AI workflow. High-signal, builder-flavored.
- **CPLT·101 — Copilot 101** ($249 Truos+). Microsoft Copilot from zero. Brand names (Copilot, Word, Outlook, Teams) are the subject, not banned.
- **CPLT·EXL — Copilot + Excel** ($249). Copilot inside Excel for data work.
- **GEM·101 — Gemini 101** ($249). Google Gemini from zero.
- **GEM·SHT — Gemini + Google Sheets** ($249). Gemini in Sheets for data work.

Every course issues its own certificate. There is no umbrella bundle cert.

---

## Recall-start lessons

If your dispatch prompt tells you a specific lesson is a recall-start, prepend a `recall` step. The prompt specifies:
- Which lesson the recall draws from (`recallingLessonKey`)
- The course — the recall question must be answerable from the prior lesson's content

Recall step shape:

```json
{
  "type": "recall",
  "title": "Quick recall",
  "recallingLessonKey": "<course>-<mi>-<li>",
  "prompt": "<single question drawn from the prior lesson's teaching>",
  "options": [
    { "text": "...", "correct": true },
    { "text": "...", "correct": false },
    { "text": "...", "correct": false }
  ],
  "answerNote": "<one-sentence reinforcement>"
}
```

Three options is fine for recall. Keep it crisp — it's a warm-up, not a graded question.

---

## `isModuleEnd`

The last lesson of each module gets `"isModuleEnd": true`. Every other lesson gets `"isModuleEnd": false`. The dispatch prompt will tell you which lesson is the module end for your assigned module.

---

## Quiz option discipline (important — we eliminated B-bias site-wide)

For every `quiz` and `apply` step, **vary the position of the correct answer**. Across your assigned lessons, aim for a roughly even spread of correct-answer positions. Don't cluster correct answers in the same slot across adjacent lessons.

---

## Final lesson of the final module (certification)

The last lesson of each course's final module historically contains a wrap-up celebration + a teaser for the next product (cert-quiz, future courses, etc.). Keep that spirit — use the 5-phase structure but make the `understand` step a reflection on what the learner has earned, the `learn` step a preview of where the credential lands (LinkedIn, next course, team rollout, whatever fits). The actual certification quiz is a separate system, not this lesson.

---

## Self-check before writing the JSON file (required)

- [ ] Every lesson has exactly 5 steps (6 if recall-start): think → understand → learn → apply → quiz
- [ ] Exactly one `analogy` in the whole lesson (the `understand` step's `analogy` field)
- [ ] `watchFor` present on every `learn` step
- [ ] Every `apply` option has `feedback`; exactly one has `correct: true`
- [ ] Every `quiz` has 4 options, exactly one `correct: true`, and `answerNote`
- [ ] No banned words (leverage, utilize, robust, solution, seamless, unlock, supercharge, harness) used as voice
- [ ] No banned analogies (sports, US idioms, religion, generic brands unless teaching them)
- [ ] Sentences mostly ≤18 words
- [ ] `isModuleEnd: true` on the last lesson of your module, `false` elsewhere
- [ ] Correct-answer position varied across your lessons' quizzes
- [ ] Top-level Lesson fields (`courseId`, `courseCode`, `suite`, `moduleIdx`, `lessonIdx`, `moduleName`, `lessonIndex`, `totalInModule`, `title`) preserved EXACTLY from the existing version in lessons.ts

## After writing the file

Report back (under 60 words): "Module {course}-{mi} draft written. Keys: {list}. Recall on: {key or none}. End lesson: {key}."
