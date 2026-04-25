# Subagent Runbook — AI·101 Merrill Rewrite

This file is shared context for all Phase 5 subagents. Read the whole thing before writing.

---

## Your job

Rewrite the AI·101 lessons assigned to you using Merrill's First Principles (5 phases) and Truos's "Feynman in a Stripe doc" voice. Preserve each lesson's existing teaching topic — **don't invent new subject matter**; rewrite the same concept with the new pedagogy and voice.

Edit `src/content/lessons.ts` in place. Find the lesson object by its key (e.g. `"101-2-1": {`) and replace its `steps` array + add `isModuleEnd`/the other fields described below. Keep the top-level metadata (`courseId`, `courseCode`, `suite`, `moduleIdx`, `lessonIdx`, `moduleName`, `lessonIndex`, `totalInModule`, `title`) unchanged unless this runbook tells you to.

---

## The 5-phase lesson structure (Merrill)

Every lesson has these step types, in this order:

1. **Think** (activation) — 20–30s. Prime curiosity. A scenario + a question the learner hasn't asked yet. No answer here, just priming.
2. **Understand** (demonstration) — 60s. Core concept in plain English. 1–2 short paragraphs. Exactly one `analogy` object.
3. **Learn** (demonstration extension) — 60s. How the concept shows up in real work, failure modes. 1 paragraph. One `watchFor` string (highlighted callout).
4. **Apply** (application) — 60s. A realistic scenario + 3 options. Exactly one `correct: true`. Each option gets `feedback`.
5. **Quiz** (integration) — 30s. 4 options. Exactly one `correct: true`. `answerNote` at the end.

**Exception — recall-start lessons:** if the runbook tells your lesson to open with a Quick Recall, prepend a `recall` step BEFORE the `think` step. Recall pulls one question from a prior lesson (the runbook specifies which).

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

Every new lesson must have `"isModuleEnd": true` if it's the last lesson of its module (indexes ending in `-3`), otherwise `"isModuleEnd": false`. Keep this field present in every lesson for clarity.

---

## Voice rules (non-negotiable — auditor will check these)

1. Average sentence ≤ 18 words. Long sentences MUST be split.
2. Concrete before abstract. Show the thing, then name it.
3. Demonstration over assertion. Don't tell them "AI hallucinates" — show the three studies.
4. **Exactly one analogy per lesson** — goes in the `understand` step's `analogy` field. Never two. Never three.
5. Banned words: **leverage, utilize, robust, solution, seamless, unlock, supercharge, harness, power of**.
6. Banned analogy sources: sports (any — baseball, cricket, football, soccer, basketball), US-centric history/idioms ("kick the tires", "home run", "9 yards"), religious references, specific brand names (unless teaching that brand).
7. Preferred analogy sources (from `analogy-bank.md`): doors, water, rooms, markets, maps, keys, notebooks, tools, letters, roads, chairs, mirrors, restaurants, weather, food (generic), plus roles like "a bright junior", "a well-read assistant".
8. One dry earned joke per lesson, MAX. If it doesn't land on first read, cut it.
9. Never "as you probably know." Preferred: "here's the thing almost nobody gets."
10. Don't condescend. Don't pad. Every sentence earns its keep.

---

## Reference lessons — match this voice exactly

### Reference A: 101-0-0 "What is AI?" (voice pilot #2 — written by the senior author)

```json
{
  "title": "What is AI?",
  "isModuleEnd": false,
  "steps": [
    {
      "type": "think",
      "title": "Ten seconds in",
      "scenario": "You open a chatbot for the first time. You type, \"What should I have for lunch?\" Ten seconds later it gives you three options, with reasons.",
      "prompt": "Before we explain the mechanism — what just happened that a normal app couldn't have done?"
    },
    {
      "type": "understand",
      "title": "Software you talk to",
      "body": [
        "AI, in 2026, is software you talk to. You type in plain language. It types back in plain language. That's the whole interface.",
        "The tools everyone names — ChatGPT, Claude, Gemini, Copilot — are all the same shape under the label. Different companies, different branding, same idea: a text box where a machine answers."
      ],
      "analogy": {
        "label": "Mental model",
        "text": "Picture a well-read assistant who never tires. Any hour, any question, an answer on the spot. No appointment, no waiting, no \"let me check my calendar.\""
      }
    },
    {
      "type": "learn",
      "title": "Where you'll run into it",
      "body": [
        "You'll meet AI in two places. As a standalone chatbot — open the site, start typing. Or as a button inside a tool you already use: the Copilot button in Word, Gmail's reply suggestions, the /ai command in Notion. Both count. Both work the same way underneath."
      ],
      "watchFor": "If you can type to it and read a reply, it's the kind of AI this course is about. Forget self-driving cars and robots for now — they're a different branch of the family."
    },
    {
      "type": "apply",
      "title": "Which of these is AI?",
      "scenario": "A colleague says, \"we're using AI now.\" Which of these fits what they most likely mean in 2026?",
      "options": [
        { "text": "A chatbot that drafts an email from a single sentence you typed.", "correct": true, "feedback": "Yes. Generating new text in response to your input is the everyday face of AI today." },
        { "text": "A macro in Excel that adds up a column.", "correct": false, "feedback": "That's automation — a fixed rule. AI, in today's sense, generates new responses it was never explicitly told to produce." },
        { "text": "A spam filter from 2008.", "correct": false, "feedback": "Older machine learning. Counts historically, but it's not what people mean when they say \"AI\" in 2026." }
      ]
    },
    {
      "type": "quiz",
      "prompt": "The simplest way to describe AI to a family member is:",
      "options": [
        { "text": "A search engine with a new name.", "correct": false },
        { "text": "Software you talk to in plain language, that talks back in plain language.", "correct": true },
        { "text": "A robot living inside your computer.", "correct": false },
        { "text": "A future technology that isn't really here yet.", "correct": false }
      ],
      "answerNote": "AI today is not a robot, not search, and not hypothetical. It's the chat window you're about to open."
    }
  ]
}
```

### Reference B: 101-1-2 "Why AI confidently makes stuff up" (voice pilot #1 — already in file, read it there)

Open `src/content/lessons.ts`, find `"101-1-2":`, and read the whole object. That's the other canonical template.

---

## Recall step requirements

If your lesson is a **recall-start lesson**, prepend a `recall` step before the `think` step. Lessons that need recall:

| Lesson key | Recalling from | Topic of prior lesson |
|---|---|---|
| 101-0-3 | 101-0-0 | What is AI? |
| 101-1-2 | 101-0-3 | Picking a tool |
| 101-2-1 | 101-1-2 | Hallucinations |
| 101-3-0 | 101-2-1 | Clear prompts |
| 101-3-3 | 101-3-0 | What NOT to share |
| 101-4-2 | 101-3-3 | Biases and blind spots |

Recall step shape:

```json
{
  "type": "recall",
  "title": "Quick recall",
  "recallingLessonKey": "101-X-Y",
  "prompt": "<single question drawn from the prior lesson's content>",
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

| Key ending | isModuleEnd |
|---|---|
| `-0`, `-1`, `-2` | `false` |
| `-3` | `true` |

Always emit the field, even when false — makes diffs cleaner.

---

## Quiz option discipline (important — we just eliminated the B-bias)

For every `quiz` and `apply` step, **vary the position of the correct answer**. Across your 4 lessons, aim for a roughly even spread (if possible, A once, B once, C once, D once for quiz; A once, B once, C once for apply). Don't put the correct answer in the same slot twice in a row within your assigned module.

---

## Self-check before submitting (required)

- [ ] Every lesson has exactly 5 steps (6 if recall-start): think → understand → learn → apply → quiz
- [ ] Exactly one `analogy` in the whole lesson (the `understand` step's `analogy` field)
- [ ] `watchFor` present on every `learn` step
- [ ] Every `apply` option has `feedback`; exactly one has `correct: true`
- [ ] Every `quiz` has 4 options, exactly one `correct: true`, and `answerNote`
- [ ] No banned words (leverage, utilize, robust, solution, seamless, unlock, supercharge, harness)
- [ ] No banned analogies (sports, US idioms, religion, specific brands unless teaching them)
- [ ] Sentences mostly ≤18 words
- [ ] `isModuleEnd: true` on every `-3` lesson, `false` elsewhere
- [ ] Correct-answer position varied across your 4 lessons' quiz steps

## After you finish

1. Run `npx tsc --noEmit` — must pass with 0 errors
2. Run `npm run build` — must succeed
3. Report: "Module N rewritten. Lessons updated: [keys]. Typecheck + build: pass."
