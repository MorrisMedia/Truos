// TRU — Rapid AI Onboarding curated track.
// 11 lessons distilled from AI·101/102/103. ~30–45 min via chat.
// Lesson summaries stay tight so TRU expands them in conversation
// rather than reciting them.

export interface TruLesson {
  key: string;
  phase: 'foundation' | 'prompting' | 'apply' | 'wrap';
  title: string;
  source: string; // lesson key in LESSONS for traceability
  oneLine: string;
  whatTheyShouldKnow: string[];
  checkQuestion: string;
  applicationNote?: string;
}

export const TRU_TRACK: TruLesson[] = [
  // ───────────── PHASE 1 — FOUNDATION ─────────────
  {
    key: 'L1',
    phase: 'foundation',
    title: 'What AI actually is in 2026',
    source: '101-0-0',
    oneLine: 'AI is software you talk to in plain language. Same shape across ChatGPT, Claude, Gemini, Copilot.',
    whatTheyShouldKnow: [
      'Today\'s "AI" means generative chatbots — text in, text out.',
      'Different brands (ChatGPT, Claude, Gemini, Copilot) are the same idea wrapped in different UIs.',
      'It is not search, not a macro, not the self-driving-car kind of AI.',
      'Mental model: a well-read assistant who never tires and answers any hour.',
    ],
    checkQuestion: 'A colleague says "we\'re using AI now." In 2026, what do they almost certainly mean?',
  },
  {
    key: 'L2',
    phase: 'foundation',
    title: 'Why AI confidently makes things up',
    source: '101-1-2',
    oneLine: 'It predicts plausible next words. Plausible ≠ true. Hallucinations are baked in.',
    whatTheyShouldKnow: [
      'Under the hood it is a probability machine guessing the next word.',
      'It will state false things in a confident voice — names, citations, numbers, URLs.',
      'Always verify any factual claim before it leaves your hands.',
      'Treat the first output as a draft from a smart but unreliable intern.',
    ],
    checkQuestion: 'AI gave you a stat to put in a board deck. What\'s the rule?',
  },
  {
    key: 'L3',
    phase: 'foundation',
    title: 'What NOT to paste into AI',
    source: '103-5-2',
    oneLine: 'Customer data, source code, contracts, anything you\'d be fired for emailing externally.',
    whatTheyShouldKnow: [
      'Public chatbots can train on what you paste unless your company has an enterprise agreement.',
      'Default-no for: customer PII, financials, proprietary code, signed contracts, employee info.',
      'Default-OK for: public material, your own first-person draft, structured questions about a topic.',
      'When in doubt, use the company-approved tool (Copilot, Claude Enterprise, ChatGPT Team) — same UI, contractual protection.',
    ],
    checkQuestion: 'You want AI to summarize a customer support ticket. What do you do first?',
  },

  // ───────────── PHASE 2 — PROMPTING ─────────────
  {
    key: 'L4',
    phase: 'prompting',
    title: 'Anatomy of a prompt',
    source: '102-0-0',
    oneLine: 'Four ingredients: instruction, context, examples, format.',
    whatTheyShouldKnow: [
      'Instruction — the verb. "Summarize," "draft," "compare."',
      'Context — what the AI does not already know. The doc, the audience, the constraint.',
      'Examples — when tone or shape matters, show one. One example beats a paragraph of description.',
      'Format — say bullet, table, email, JSON, 100 words. Otherwise it picks for you.',
    ],
    checkQuestion: 'Which ingredient is the one most people skip?',
  },
  {
    key: 'L5',
    phase: 'prompting',
    title: 'Clear asks beat clever ones',
    source: '101-2-1',
    oneLine: 'Specific > clever. Audience, format, length, constraint.',
    whatTheyShouldKnow: [
      '"Write a follow-up email" gets you generic mush.',
      '"Write a 90-word follow-up to a CFO who didn\'t respond after our pricing call last Thursday — keep it warm but direct, no opening pleasantries" gets you something usable.',
      'Naming the reader is the single biggest unlock.',
      'Stating constraints (length, what to avoid) is free quality.',
    ],
    checkQuestion: 'I\'ll show you a vague prompt — make it specific.',
    applicationNote: 'Drill prompt: "Help me with my email to the team." Push them to add audience, goal, length, tone.',
  },
  {
    key: 'L6',
    phase: 'prompting',
    title: 'The role trick',
    source: '102-0-1',
    oneLine: '"Act as a [role]" primes vocabulary and depth instantly.',
    whatTheyShouldKnow: [
      '"Act as a senior product marketer" is a short cheat code that changes register, jargon, and depth.',
      'Stack it: role + audience + objective. "Act as a CFO reviewing this pitch on behalf of a Series B board."',
      'Use it for critique especially — "review this as a skeptical editor and flag what\'s lazy."',
      'Limits: role does not give it new facts. It changes voice, not knowledge.',
    ],
    checkQuestion: 'You wrote a draft proposal. Give me a role-prompt that gets useful pushback on it.',
  },
  {
    key: 'L7',
    phase: 'prompting',
    title: 'Iteration is the actual skill',
    source: '102-5-0',
    oneLine: 'First output is a draft. The second prompt is where the value is.',
    whatTheyShouldKnow: [
      'People who get great output do not write better first prompts. They iterate.',
      '"Tighter," "more skeptical," "cut the intro," "give me three options," "what\'s missing?"',
      'Treat it as a back-and-forth, not a vending machine.',
      'Knowing when to start fresh vs. keep pushing is the senior move — if it\'s drifting, restart with a better prompt.',
    ],
    checkQuestion: 'AI gave you something close but flat. What are two follow-ups that would lift it?',
  },

  // ───────────── PHASE 3 — APPLIED AT WORK ─────────────
  {
    key: 'L8',
    phase: 'apply',
    title: 'Your daily use cases',
    source: '103-various',
    oneLine: 'Tailored to the learner\'s role — pick three real tasks they will use AI for this week.',
    whatTheyShouldKnow: [
      'Sales: account research, pre-call prep, objection handling, follow-up drafting.',
      'Marketing: campaign brief expansion, copy variants, brand-voice critique, competitive scans.',
      'CS: QBR prep, renewal comms, escalation drafting, voice-of-customer synthesis.',
      'Ops: process docs, status updates, meeting summaries, automation scoping.',
      'Finance: forecast narratives, expense policy Q&A, contract first-pass review.',
      'Exec: prep for the next 1:1, decompose a vague directive, draft the announcement.',
    ],
    checkQuestion: 'What\'s a task in your week this Tuesday morning where AI could buy you 30+ minutes?',
    applicationNote: 'Adapt examples to learner\'s role from intro. Walk one example end-to-end.',
  },
  {
    key: 'L9',
    phase: 'apply',
    title: 'Fact-checking AI without becoming paranoid',
    source: '101-3-1',
    oneLine: 'Two questions: would I bet $1,000 on this? Where would I look to verify?',
    whatTheyShouldKnow: [
      'Triangulate: ask AI for the source, then check the source actually exists and says what AI claims.',
      'Numbers and citations are highest-risk. Be skeptical by default.',
      'Sanity-check math by asking AI to redo it a different way.',
      'Style and structure usually do not need verification. Facts always do.',
    ],
    checkQuestion: 'AI gives you a stat with a source URL. What are the two checks you do before pasting into a deck?',
  },
  {
    key: 'L10',
    phase: 'apply',
    title: 'The handoff — where AI stops and you start',
    source: '101-3-3',
    oneLine: 'AI gets you 80% there. The last 20% is judgment, voice, and ownership — yours.',
    whatTheyShouldKnow: [
      'Never ship a raw AI output to a customer or executive.',
      'Read every line aloud. Cut the hedge words. Replace the generic phrases with your specifics.',
      'Add the one thing AI cannot know: your relationship with this person, your read on the room.',
      'Your name is on it. The AI does not get blamed if it\'s wrong — you do.',
    ],
    checkQuestion: 'You just got a polished email draft from AI to send to a customer. What three things do you do before hitting send?',
  },

  // ───────────── PHASE 4 — WRAP ─────────────
  {
    key: 'L11',
    phase: 'wrap',
    title: 'Your first 7 days',
    source: 'capstone',
    oneLine: 'Concrete homework so the training does not evaporate.',
    whatTheyShouldKnow: [
      'Day 1–2: pick one chatbot and use only it. Stop tab-shopping.',
      'Day 3–4: run five real tasks through it — emails, summaries, prep notes.',
      'Day 5: build one repeating workflow (e.g., my Friday status update template).',
      'Day 6: catch one hallucination by verifying. Notice how it felt.',
      'Day 7: write down one thing you will never paste into AI. Own that line.',
    ],
    checkQuestion: 'Which of those 7 days is the one that you, specifically, will skip if you don\'t plan for it?',
  },
];

export const TRU_TRACK_LENGTH_MIN = 30;
export const TRU_TRACK_LENGTH_MAX = 45;
