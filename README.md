# Truos

AI training for commercial teams — from zero tech knowledge to a shipped AI workflow.
Live at **[truos.ai](https://truos.ai)**.

## The curriculum

Four courses, 116 lessons, ~22 hours. Each lesson is read → engage → quiz.

| Code     | Course                       | Lessons | Tier      |
|----------|------------------------------|---------|-----------|
| AI·101   | Getting Started with AI       | 20      | Free      |
| AI·102   | Practical Prompting           | 24      | $49       |
| AI·103   | AI at Work                    | 32      | $89       |
| AI·104   | The Truos Capstone            | 40      | $249      |

- **AI·101** assumes zero tech knowledge. What AI is, what a chatbot is, what a prompt is, how to use AI safely.
- **AI·102** is the daily prompting toolkit: ICEF, roles, iteration, self-critique.
- **AI·103** applies AI to real commercial roles: sales, marketing, CS, ops, finance — with confidentiality guardrails.
- **AI·104** is the capstone: design, build, roll out, and sustain an AI workflow your team actually uses.

## Architecture

Clickable prototype built in plain HTML + React (via UMD) + Babel Standalone. No build step. Open `index.html` in a browser and it runs.

```
index.html         App shell, routing, TWEAKS panel
content.js         All 116 lessons (read + engage + quiz per lesson)
shared.jsx         Icons, COURSES catalog, ORG/TEAM, Logo/Avatar/ProgressRing
landing.jsx        Marketing page (hero, catalog, pricing, CTA)
course.jsx         Course home (module tree, progress, lesson navigation)
lesson.jsx         Lesson player + LessonComplete + Certificate
admin.jsx          Org admin dashboard + Stripe checkout
styles.css         Design system (dark theme, lime accent)
```

## Content model

`content.js` defines one entry per lesson, keyed by `${courseId}-${moduleIdx}-${lessonIdx}`. Each lesson has:

```js
{
  courseCode: 'AI·101',
  moduleName: 'What is AI, really?',
  lessonIndex: 1,
  totalInModule: 4,
  title: 'What is AI?',
  steps: [
    { type: 'read',   title, body: [...paragraphs], callout: { label, text } },
    { type: 'engage', title, prompt, options: [{ text, correct, feedback }] },
    { type: 'quiz',   prompt, options: [{ text, correct }], answerNote },
  ],
}
```

`COURSES` in `shared.jsx` is the catalog (for landing + course home). `content.js` is the lesson bodies. Structure and content are versioned together.

## Running locally

It's a static site — serve the directory with anything:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or use the dev-bar at the bottom of the page to jump between screens without starting a course.

## Design

- Dark near-black base (`#0A0B0D`), elevated slate panels, warm paper for the certificate
- Electric lime accent (`#D4F547`), used sparingly
- Inter Tight for UI, Instrument Serif for editorial moments, monospace for course codes
- Hairline borders, all-caps tracked eyebrows, subtle grain
- Light mode, alternate accents, and gamification toggle available in the Tweaks panel

## Next steps

- Wire up Stripe for real checkout (currently presentational)
- Wire up Clerk or similar for auth (org → user login hierarchy)
- Persist progress to a backend (currently `localStorage`-only)
- Move to a framework (likely Next.js) when auth/backend come in
- Swap React UMD + Babel Standalone for a real build pipeline at that point
