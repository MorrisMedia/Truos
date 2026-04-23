/* =============================================================
   TRUOS+ LESSON CONTENT — 32 lessons across CPLT·101 + CPLT·EXL
   Keyed by `${courseId}-${moduleIdx}-${lessonIdx}` (zero-indexed)
   Merges into the same LESSON_CONTENT map as content.js.
   Course IDs for Truos+ start at 201 to avoid collision with base (101-104).
   ============================================================= */

// Extend existing LESSON_CONTENT if already defined; otherwise create it.
window.LESSON_CONTENT = window.LESSON_CONTENT || {};

function definePlusCourse(courseId, courseCode, modules) {
  modules.forEach((m, moduleIdx) => {
    m.lessons.forEach((l, lessonIdx) => {
      window.LESSON_CONTENT[`${courseId}-${moduleIdx}-${lessonIdx}`] = {
        courseId,
        courseCode,
        suite: 'plus',
        moduleIdx,
        lessonIdx,
        moduleName: m.name,
        lessonIndex: lessonIdx + 1,
        totalInModule: m.lessons.length,
        title: l.t,
        steps: [
          { type: 'read',   title: l.rt || l.t, body: l.rb, callout: l.rc },
          { type: 'engage', title: l.et, prompt: l.ep, options: l.eo },
          { type: 'quiz',   prompt: l.qp, options: l.qo, answerNote: l.qa },
        ],
      };
    });
  });
}

/* ============================================================
   CPLT·101 — COPILOT 101 (20 lessons, 4 modules)
   Microsoft Copilot from zero.
   ============================================================ */
definePlusCourse(201, 'CPLT·101', [
  {
    name: 'What\'s Copilot?',
    lessons: [
      {
        t: 'What is Microsoft Copilot?',
        rb: [
          "Microsoft Copilot is the AI assistant Microsoft built into the apps you already use — Word, Outlook, Excel, Teams, PowerPoint, OneDrive. It's not a separate app you install. It\'s a button or side panel that appears inside the Microsoft software your company pays for.",
          "Under the hood, Copilot uses a large language model (the same type of AI that powers ChatGPT and Claude). The difference is that Microsoft has wired it to see your work — your emails, your documents, your meeting transcripts — so it can answer questions grounded in YOUR data, not just generic knowledge.",
          "That grounding is what makes Copilot different from a general chatbot. When you ask 'what did Jane say about Q3 pricing last week,' Copilot can actually look at your Outlook and Teams history to answer — something ChatGPT.com cannot do without you pasting everything in manually.",
        ],
        rc: { label: 'Mental model', text: 'Copilot = AI assistant + access to your Microsoft 365 work. General chatbot + company context, built into the tools you already use.' },
        et: 'What does Copilot do differently?',
        ep: 'Which of these is Copilot\'s main advantage over a general chatbot like ChatGPT.com?',
        eo: [
          { text: 'It\'s faster.',                                                                  correct: false, feedback: 'Performance varies; not the defining difference.' },
          { text: 'It can see your emails, documents, and meetings across Microsoft 365.',        correct: true,  feedback: 'Exactly. Context from your actual work = answers grounded in your reality, not generic text.' },
          { text: 'It uses a better AI model.',                                                   correct: false, feedback: 'The underlying model is comparable. Access to YOUR data is the real edge.' },
        ],
        qp: 'Copilot is best described as:',
        qo: [
          { text: 'A standalone app you install on your computer.',                               correct: false },
          { text: 'An AI assistant built into Microsoft 365 apps, with access to your company data.', correct: true  },
          { text: 'A replacement for Microsoft Word.',                                            correct: false },
          { text: 'A search engine for the public web.',                                          correct: false },
        ],
        qa: 'Copilot lives inside the apps you already use. The AI + your Microsoft data is the full picture.',
      },
      {
        t: 'Where Copilot lives: the apps',
        rb: [
          "Copilot shows up in different forms across Microsoft apps. In Word, it\'s a button at the top that opens a side panel for drafting and editing. In Outlook, it's a 'Draft with Copilot' option when composing an email. In Teams, it\'s a meeting summary button and a chat-side assistant.",
          "In Excel, Copilot lives in a side pane where you can ask it to analyze data, write formulas, or make charts. In PowerPoint, it can generate slides from a prompt or from a Word document. There\'s also a standalone 'Copilot Chat' you can access at copilot.cloud.microsoft (previously copilot.microsoft.com) — that one reaches across all your Microsoft 365 data in one place.",
          "You won\'t see Copilot everywhere on day one. Your IT team controls which apps have it turned on for which people. If you don\'t see a Copilot button where you expect it, ask IT — it may just not be enabled for your account yet.",
        ],
        rc: { label: 'Where to look', text: 'Word/Outlook/Excel/PowerPoint: top toolbar or right-side pane. Teams: meeting summary button + chat assistant. Everything together: copilot.cloud.microsoft.' },
        et: 'Where would you find Copilot for meeting summaries?',
        ep: 'You want a summary of a Teams meeting you just joined. Where do you look?',
        eo: [
          { text: 'Inside Microsoft Word.',                                                        correct: false, feedback: 'Word is for documents, not meeting summaries.' },
          { text: 'In the Teams meeting itself — the Copilot button opens a summary pane.',       correct: true,  feedback: 'Yes. Copilot shows up inside the meeting UI with live-summary powers.' },
          { text: 'At copilot.microsoft.com only.',                                                correct: false, feedback: 'Standalone Copilot works for a lot, but meeting summaries belong inside Teams itself.' },
        ],
        qp: 'If Copilot doesn\'t appear where you expect in a Microsoft 365 app, the most likely reason is:',
        qo: [
          { text: 'The app is broken.',                                                            correct: false },
          { text: 'Your IT team hasn\'t enabled Copilot for that app or for your account.',        correct: true  },
          { text: 'You need to be on Windows.',                                                    correct: false },
          { text: 'You need to restart your computer.',                                            correct: false },
        ],
        qa: 'Copilot rollout is admin-controlled. When you can\'t find a feature, IT is the right first stop.',
      },
      {
        t: 'Signing in and getting started',
        rb: [
          "To use Copilot at work, you need a Microsoft 365 account with a Copilot license assigned to it. Most companies assign these per person. If your company has Copilot, you\'re probably already signed in — you just have to click the Copilot button where it appears.",
          "The first time you click Copilot in any app, it may show a welcome screen or a consent dialog. Read it, accept, and you\'re in. Your company\'s IT admins have already set up the tenant-level settings that decide what data Copilot can see.",
          "If you have a personal Microsoft account alongside your work one, make sure you\'re using the WORK account when you use Copilot at work. Personal-account Copilot doesn't have access to your company data and may have different data-handling terms.",
        ],
        rc: { label: 'First-click checklist', text: 'Work account signed in. Copilot button visible. Consent dialog accepted. Good to go.' },
        et: 'Account confusion',
        ep: 'You have both a personal Microsoft account and your work account signed in on your laptop. Which should you use for Copilot at work?',
        eo: [
          { text: 'Either — they\'re the same Copilot.',                                           correct: false, feedback: 'They\'re different. Work Copilot sees work data and follows your company\'s data rules.' },
          { text: 'Your work account. It\'s the one with your company\'s Copilot license and data access.', correct: true,  feedback: 'Right. Always use the work account for work-related AI.' },
          { text: 'Your personal account — it\'s private.',                                        correct: false, feedback: 'It\'s private from your company, but also from your company\'s data. You lose the whole point of Copilot at work.' },
        ],
        qp: 'Who decides what data Copilot can see at your company?',
        qo: [
          { text: 'You, the end user.',                                                             correct: false },
          { text: 'Microsoft.',                                                                     correct: false },
          { text: 'Your IT / Microsoft 365 admin team, via tenant settings.',                       correct: true  },
          { text: 'Copilot itself.',                                                                correct: false },
        ],
        qa: 'Tenant-level controls are the foundation of Copilot\'s safety story at work. They\'re set centrally, not per user.',
      },
      {
        t: 'Your first conversation with Copilot',
        rb: [
          "Click the Copilot icon in any Microsoft app. A side pane opens. Type a request in plain English. Press enter. Read the response. That\'s it — there\'s no special syntax, no magic words. If you can write a Slack message, you can prompt Copilot.",
          "Try this first: open Word, click Copilot, and type \"Write a 150-word draft email to our ops team proposing we move Tuesday\'s standup to 9:30. Mention that 9am has been conflicting with the design review.\" You\'ll get a draft in a few seconds. Edit it in your own voice; send from Outlook.",
          "The first rule of getting good at Copilot: treat it as a conversation, not a command. If the first response isn\'t right, say 'make it shorter' or 'more direct' or 'add a line about the deadline.' You don\'t have to re-type your whole request.",
        ],
        rc: { label: 'Try it', text: 'Open any Microsoft app with Copilot. Ask it anything work-related. The first experiment teaches you more than this lesson can.' },
        et: 'Best first ask',
        ep: 'Which of these is the best first prompt for Copilot?',
        eo: [
          { text: '"Do something."',                                                                correct: false, feedback: 'Too vague. Copilot needs a specific task to work on.' },
          { text: '"Write a 150-word draft email to my manager asking for feedback on this week\'s plan."', correct: true,  feedback: 'Specific task, audience, length. Copilot can run with this.' },
          { text: '"Make me a genius."',                                                             correct: false, feedback: 'Flattering, but not actionable.' },
        ],
        qp: 'When the first response isn\'t quite right, what\'s the fastest fix?',
        qo: [
          { text: 'Retype your request from scratch in a new Copilot session.',                    correct: false },
          { text: 'Type a short follow-up (like "shorter" or "less formal") — Copilot remembers what you asked.', correct: true  },
          { text: 'Give up and do it manually.',                                                    correct: false },
          { text: 'Ask it if it is sure.',                                                           correct: false },
        ],
        qa: 'Iteration is built in. A one-word follow-up often beats a two-minute rewrite of the original prompt.',
      },
      {
        t: 'Copilot vs ChatGPT: when to use which',
        rb: [
          "The most common question from people with access to both: when do I use Copilot vs ChatGPT (or Claude, Gemini)? Short answer: use Copilot when the task involves your company\'s data. Use a general chatbot when the task is independent of work context — research, brainstorming, writing help on a neutral topic.",
          "Copilot wins when the answer needs your emails, documents, meetings, or team info. 'What did we decide in last week\'s strategy meeting?' 'Draft a reply based on this email thread.' 'Summarize the attached Word doc.' Copilot has access; ChatGPT doesn\'t.",
          "ChatGPT (or similar) wins when the answer is general and you don\'t need (or don\'t want) work context. Explaining a concept, brainstorming names, writing a LinkedIn post, drafting a template. You can also paste text into ChatGPT if the content isn\'t sensitive — but for anything company-confidential, default to Copilot.",
        ],
        rc: { label: 'The one-liner', text: 'Needs your work data → Copilot. Independent of work context → ChatGPT / Claude / Gemini.' },
        et: 'Pick the tool',
        ep: 'You need to draft a reply to a customer email thread. Which tool is best?',
        eo: [
          { text: 'ChatGPT (you paste the thread into it).',                                        correct: false, feedback: 'Works, but exposes customer content to a public chatbot. Use Copilot instead.' },
          { text: 'Copilot in Outlook — it already has the thread and your company\'s context.',   correct: true,  feedback: 'Exactly. Copilot has the thread; no pasting, no data leaving approved systems.' },
          { text: 'A word processor with no AI.',                                                    correct: false, feedback: 'Slow and manual.' },
        ],
        qp: 'When is ChatGPT or Claude a better choice than Copilot?',
        qo: [
          { text: 'Always.',                                                                         correct: false },
          { text: 'When your task doesn\'t require work data — general research, brainstorming, drafting on neutral topics.', correct: true  },
          { text: 'Never.',                                                                          correct: false },
          { text: 'Only for images.',                                                                correct: false },
        ],
        qa: 'These tools overlap but have different strengths. Copilot = work data access. General AI = independent of your tenant. Use the right tool per task.',
      },
    ],
  },
  {
    name: 'Copilot in everyday work',
    lessons: [
      {
        t: 'Drafting in Word',
        rb: [
          "Open a new Word document. Click Copilot at the top of the page. A prompt box appears. Type what you want: 'Draft a 1-page status update for the leadership team covering our Q2 revenue, the three biggest deals, and the main risk to the plan.' Copilot generates a draft right inside the document.",
          "The trick to good Word drafts: give Copilot the bullets of what you want covered. A blank prompt produces a generic document. Your bullets produce YOUR document. Paste in notes, past emails, or a rough outline — Copilot shapes them into prose faster than you can.",
          "After the draft appears, treat it as a first pass. Edit in your voice. Cut anything that sounds AI-flat (it\'ll usually sound slightly formal or over-structured). Replace a generic sentence with a specific one only you could write — that\'s what makes the document yours.",
        ],
        rc: { label: 'Word prompt pattern', text: '"Draft a [length] [document type] for [audience]. Cover: [your bullets]. Tone: [direct/warm/formal]."' },
        et: 'Best Word draft prompt',
        ep: 'Which prompt produces the most useful Word draft?',
        eo: [
          { text: '"Write a document."',                                                            correct: false, feedback: 'Too open. Copilot will pick a generic template.' },
          { text: '"Draft a 1-page update for leadership covering Q2 revenue ($4.2M, up 18%), three key wins (Acme, Northwind, Zephyr), and the big risk (enterprise cycle stretching). Direct tone."', correct: true,  feedback: 'Task + audience + specific bullets + tone. Copilot has everything it needs.' },
          { text: '"Something smart about Q2."',                                                    correct: false, feedback: 'Vague.' },
        ],
        qp: 'What should you ALWAYS do before sending a Copilot-drafted document?',
        qo: [
          { text: 'Nothing — Copilot is accurate.',                                                  correct: false },
          { text: 'Read it end to end and replace generic lines with specific ones only you know.', correct: true  },
          { text: 'Translate it to another language.',                                               correct: false },
          { text: 'Shorten it to one sentence.',                                                     correct: false },
        ],
        qa: 'AI-drafted documents are 80% of the way there. The last 20% — your voice, your specifics — is what makes them land.',
      },
      {
        t: 'Triaging Outlook',
        rb: [
          "Open Outlook. Click the Copilot icon in the ribbon when reading an email, or use the 'Draft with Copilot' button when composing. Copilot can summarize long threads, draft replies, and flag priorities — all grounded in the actual content of your inbox.",
          "For a long thread: click Copilot → 'Summarize.' In 10 seconds, you get a tight summary of who said what, open questions, and any explicit asks. Much faster than scrolling through 30 messages.",
          "For a draft reply: click 'Draft with Copilot' → type what you want to say in 1 sentence ('Agree with the proposal, but ask if we can push the launch to June'). Copilot writes a full reply with the appropriate tone, referencing the thread\'s context. Edit, send.",
        ],
        rc: { label: 'Outlook moves', text: 'Long thread? Summarize. Replying? "Draft with Copilot" + your one-sentence intent. Editing takes 30 seconds; reading the thread took 10 minutes.' },
        et: 'Outlook workflow',
        ep: 'You\'ve been cc\'d on a 20-message thread and need to reply with a position. Best Copilot move?',
        eo: [
          { text: 'Ask Copilot to "give a response."',                                              correct: false, feedback: 'Too vague; Copilot won\'t know your position.' },
          { text: 'Ask Copilot to summarize the thread first, then use "Draft with Copilot" with your 1-sentence intent.', correct: true,  feedback: 'Two moves: understand the context, then shape the reply. Fast and grounded.' },
          { text: 'Forward the thread to ChatGPT.',                                                 correct: false, feedback: 'Exposes the thread to a public chatbot. And Copilot already has it.' },
        ],
        qp: 'The biggest time-saver Copilot brings to Outlook is:',
        qo: [
          { text: 'Automatic spam filtering.',                                                      correct: false },
          { text: 'Turning 10 minutes of reading into a 30-second summary + faster drafts.',       correct: true  },
          { text: 'Rewriting everyone else\'s emails.',                                             correct: false },
          { text: 'Deleting all emails.',                                                           correct: false },
        ],
        qa: 'Summarize + draft = most of your inbox time back. The gains compound across a week.',
      },
      {
        t: 'Summarizing Teams meetings',
        rb: [
          "In a Teams meeting, Copilot can do two big things: give you a summary during or after the meeting, and catch you up mid-meeting if you joined late or got distracted. Both save real time.",
          "At the end of a meeting (or after, if recording was on), click Copilot in the meeting panel → 'Recap the meeting.' You\'ll get: key points, decisions, open questions, and — most usefully — action items with owners. Send that to the team, skip the post-meeting summary you used to write manually.",
          "During a meeting, if you missed the last 5 minutes, you can ask Copilot 'what did I miss?' and get a live catch-up. This is the feature people underestimate; once you\'ve used it, you won\'t go back.",
        ],
        rc: { label: 'Two Teams moves', text: 'Post-meeting: "Recap the meeting" → decisions + actions. Mid-meeting: "What did I miss?" → catch-up in seconds.' },
        et: 'Best meeting summary output',
        ep: 'What\'s the most actionable output from a Teams meeting summary?',
        eo: [
          { text: 'A chronological list of everything said.',                                       correct: false, feedback: 'You were there; you don\'t need a transcript in summary form.' },
          { text: 'Decisions made + action items with owners + open questions.',                   correct: true,  feedback: 'Right. A summary that tells you what to do next beats one that just replays the meeting.' },
          { text: 'A word cloud.',                                                                   correct: false, feedback: 'Pretty, not useful.' },
        ],
        qp: 'Copilot\'s meeting summary depends on:',
        qo: [
          { text: 'Your IT admin enabling Copilot in Teams, AND the meeting being recorded or transcripted.', correct: true  },
          { text: 'Nothing — it works on any meeting.',                                              correct: false },
          { text: 'The meeting being over an hour long.',                                            correct: false },
          { text: 'Everyone in the meeting speaking English.',                                       correct: false },
        ],
        qa: 'Copilot needs a transcript to summarize. If recording/transcription is off, no summary. Check with IT if the feature isn\'t showing up.',
      },
      {
        t: 'Generating PowerPoint',
        rb: [
          "Open PowerPoint → click Copilot → 'Create a presentation.' Type what you want: 'Create a 10-slide presentation on our Q2 results for the board, based on the attached Word document.' Copilot generates a full deck with layouts, images (sometimes), and speaker notes.",
          "The input that matters most: attach a source document (Word memo, Excel data, or paste in text). Copilot\'s best decks are grounded in source material. Without a source, you get a generic template. With a source, you get your content structured as slides.",
          "Never present what Copilot gives you as-is. AI slide decks have predictable flaws: too many bullets per slide, inconsistent design choices, occasional hallucinated stats. Edit aggressively. Copilot gets you to a draft deck in 30 seconds; a good deck takes another 20 minutes of your editing.",
        ],
        rc: { label: 'PowerPoint input', text: 'Best input: a Word doc or paste of your real content. Generic prompts → generic decks.' },
        et: 'PowerPoint prompt quality',
        ep: 'Which produces the best PowerPoint from Copilot?',
        eo: [
          { text: '"Make a deck about Q2."',                                                        correct: false, feedback: 'Generic. You\'ll get a template.' },
          { text: '"Create a 10-slide deck for the board based on this Word doc (attached). Include an executive summary slide, 3 deal-focused slides, 2 risk slides, and next-steps."', correct: true,  feedback: 'Source + structure + slide count + audience. Copilot has the raw material and the shape.' },
          { text: '"Make something impressive."',                                                   correct: false, feedback: 'Subjective and vague.' },
        ],
        qp: 'The single biggest Copilot PowerPoint pitfall is:',
        qo: [
          { text: 'It generates too few slides.',                                                   correct: false },
          { text: 'Assuming the generated deck is ready to present without your editing pass.',    correct: true  },
          { text: 'It only supports English.',                                                      correct: false },
          { text: 'It\'s too slow.',                                                                 correct: false },
        ],
        qa: 'AI drafts are drafts. Edit them the way you\'d edit your own. The deck going up on screen has your name on it.',
      },
      {
        t: 'Searching across OneDrive',
        rb: [
          "Go to copilot.cloud.microsoft (or open Copilot Chat from any Microsoft app). Ask: 'Find the latest version of our partner agreement with Acme.' Copilot searches your OneDrive, SharePoint, and recent documents — and gives you the file plus a summary of what\'s in it.",
          "This is the feature that replaces 10 minutes of folder-hunting. 'Find the deck I was working on last Tuesday about the pricing refresh.' 'Pull up the spreadsheet Priya sent me with Q2 forecasts.' Copilot knows your files and can retrieve by topic, person, date, or partial title.",
          "You can also ask Copilot to summarize a document without opening it. 'Summarize the latest vendor proposal from TechFlow.' You get the key points without having to hunt down the file, open it, and scroll.",
        ],
        rc: { label: 'Search prompt patterns', text: '"Find the [doc type] about [topic]."  "What did [person] send me about [subject]?"  "Summarize the latest [doc type] from [source]."' },
        et: 'Best file-search prompt',
        ep: 'Best way to ask Copilot to find the Q2 forecasts spreadsheet from Priya?',
        eo: [
          { text: '"Find a file."',                                                                  correct: false, feedback: 'Too vague.' },
          { text: '"Find the Excel spreadsheet Priya sent me with Q2 forecasts, in the last two weeks."', correct: true,  feedback: 'Person + topic + timeframe. Copilot can narrow precisely.' },
          { text: '"Give me all Excel files."',                                                      correct: false, feedback: 'Too broad to be useful.' },
        ],
        qp: 'Copilot can search your OneDrive, SharePoint, emails, and recent files because:',
        qo: [
          { text: 'It has access to the public internet.',                                          correct: false },
          { text: 'It\'s integrated with Microsoft Graph — the service that indexes your company\'s Microsoft 365 data.', correct: true  },
          { text: 'Microsoft employees read them for you.',                                          correct: false },
          { text: 'You have to upload them manually.',                                               correct: false },
        ],
        qa: 'Microsoft Graph is the plumbing. Copilot asks Graph; Graph returns what you already have access to (nothing you didn\'t). That\'s how the search + grounding magic works.',
      },
    ],
  },
  {
    name: 'Prompting Copilot well',
    lessons: [
      {
        t: 'Giving Copilot context',
        rb: [
          "A prompt without context gets a generic answer. A prompt with context gets an answer tailored to your situation. This is the single highest-leverage prompting habit across all AI tools, and it\'s especially true for Copilot because Copilot CAN use context — you just have to give it.",
          "Useful context for Copilot: who you are ('I\'m head of marketing for a 40-person B2B SaaS'), who the output is for ('this is going to our sales team'), what matters ('budget-conscious; no fluff'), and what\'s off-limits ('don\'t mention competitors by name'). Stack what\'s relevant.",
          "You don\'t need all of it on every prompt. One good context line often lifts the output dramatically. 'For our CFO who hates long emails' changes the reply from a generic 300-word update to a 100-word one, in the right voice.",
        ],
        rc: { label: '4 kinds of context', text: 'Who you are · Who the output\'s for · What matters · What\'s off-limits.' },
        et: 'Context that matters',
        ep: 'You\'re asking Copilot to draft a customer-facing announcement. Which context adds the most value?',
        eo: [
          { text: 'The time of day.',                                                               correct: false, feedback: 'Irrelevant to content.' },
          { text: 'Your customer segment, the tone they respond to, and what you want them to DO after reading.', correct: true,  feedback: 'Audience + tone + CTA — the three things that shape every good announcement.' },
          { text: 'The weather.',                                                                   correct: false, feedback: 'Not a factor.' },
        ],
        qp: 'The highest-leverage habit for better Copilot output is:',
        qo: [
          { text: 'Using all capital letters.',                                                     correct: false },
          { text: 'Adding 1-2 sentences of context to your prompt.',                                correct: true  },
          { text: 'Asking the same thing multiple times.',                                           correct: false },
          { text: 'Writing very long prompts.',                                                      correct: false },
        ],
        qa: 'Short prompt + right context beats long prompt + no context, every time. Context is the steering wheel.',
      },
      {
        t: 'References and /commands',
        rb: [
          "Copilot Chat has a powerful feature most users miss: you can reference specific people, files, or emails using the '/' command or the '@' key. Type `/` in the prompt and you\'ll see options — reference a file, a meeting, a person from your team.",
          "Example: '/file Q2-Plan.docx summarize this for the CFO.' Copilot now knows EXACTLY which document you mean, rather than having to search. Faster and more accurate than describing the file in prose.",
          "Example: '@Priya what did she send me about the forecasts last week?' Copilot pulls from your shared email + Teams context with Priya. This is power-user Copilot — it feels clunky at first, worth the 5 minutes to learn.",
        ],
        rc: { label: 'Commands to try', text: '/file — reference a specific document. /meeting — reference a past Teams meeting. /person or @name — scope context to a colleague.' },
        et: 'Reference usage',
        ep: 'What does typing `/` in Copilot Chat do?',
        eo: [
          { text: 'Opens a help menu.',                                                              correct: false, feedback: 'Not quite.' },
          { text: 'Opens a context/reference picker — files, meetings, people — to anchor your prompt to specific data.', correct: true,  feedback: 'Yes. References are what turn a general question into a grounded one.' },
          { text: 'Deletes the prompt.',                                                             correct: false, feedback: 'Nope.' },
        ],
        qp: 'Why use references instead of describing the file in prose?',
        qo: [
          { text: 'It sounds more technical.',                                                       correct: false },
          { text: 'Copilot knows exactly which file/person/meeting you mean — less ambiguity, more accuracy.', correct: true  },
          { text: 'It\'s required by Microsoft.',                                                    correct: false },
          { text: 'It saves API costs.',                                                             correct: false },
        ],
        qa: 'References eliminate guesswork. A /file beats "the document I was working on yesterday" every time.',
      },
      {
        t: 'Iterating with Copilot',
        rb: [
          "The first output is rarely the final one. Skilled Copilot users iterate in follow-ups instead of re-running the whole prompt. 'Shorter.' 'Less formal.' 'Add a line about the Q3 deadline.' 'Rewrite this for the board instead of the sales team.' Each follow-up refines; nothing gets re-explained.",
          "Copilot remembers the full conversation. If you asked for an email draft two messages ago and you want it rewritten, you don\'t have to re-paste the context. Just say 'make it shorter and more direct' — it knows what 'it' refers to.",
          "Stop iterating when the output is good enough to use, not when it\'s perfect. Many users iterate 8 times to get 'perfect' when they could have stopped at 3 iterations + 2 minutes of hand-editing. Hand-editing is faster than most people think, and yours is always more authentic.",
        ],
        rc: { label: 'Iteration economy', text: 'Iterate to good-enough. Hand-edit from there. Chasing perfection inside the chat is usually slower than finishing by hand.' },
        et: 'Iteration discipline',
        ep: 'You\'ve iterated 6 times and each response is marginally better than the last. What should you do?',
        eo: [
          { text: 'Iterate 6 more times.',                                                           correct: false, feedback: 'Diminishing returns — you\'re probably adding noise now.' },
          { text: 'Stop iterating, copy the latest draft, and finish it by hand.',                  correct: true,  feedback: 'At some point, hand-editing is faster than refining via prompt.' },
          { text: 'Delete everything and start fresh.',                                              correct: false, feedback: 'Wasteful — you\'d lose all the progress.' },
        ],
        qp: 'The main advantage of iteration over re-prompting is:',
        qo: [
          { text: 'Cheaper.',                                                                         correct: false },
          { text: 'You don\'t have to re-explain context; Copilot remembers the conversation.',     correct: true  },
          { text: 'It produces longer output.',                                                      correct: false },
          { text: 'Microsoft requires it.',                                                           correct: false },
        ],
        qa: 'Context compounds within a conversation. Starting over throws it away.',
      },
      {
        t: 'When Copilot beats general AI',
        rb: [
          "Copilot's edge over ChatGPT / Claude / Gemini is a very specific one: access to YOUR data. When the task requires your emails, documents, meetings, colleagues, or calendar, Copilot wins by a wide margin. You don\'t have to paste anything; it\'s already there.",
          "Concrete examples where Copilot dominates: 'Summarize this thread.' 'What did we decide last Tuesday?' 'Draft a reply based on my email history with this customer.' 'Find the latest version of X.' All impossible or tedious without Copilot.",
          "It also wins on safety. When a task involves company-confidential content, pasting into a public chatbot is risky (data leaves approved systems). Copilot is inside Microsoft 365 and operates under your company\'s tenant-level data agreements. It\'s the default safe option for work-sensitive AI.",
        ],
        rc: { label: 'Copilot\'s edge', text: 'Access to your work + safety = reasons Copilot wins on company-specific tasks.' },
        et: 'Task comparison',
        ep: 'Which task is Copilot CLEARLY better at than ChatGPT?',
        eo: [
          { text: 'Explaining quantum mechanics.',                                                  correct: false, feedback: 'General topic. Either tool works.' },
          { text: '"Draft a reply to the customer email from Acme in my inbox, in the same tone as my previous replies to them."', correct: true,  feedback: 'Requires access to YOUR inbox and YOUR past style. ChatGPT cannot; Copilot can.' },
          { text: 'Brainstorming names for a hypothetical pet.',                                    correct: false, feedback: 'No company context needed. Either works.' },
        ],
        qp: 'What makes Copilot safer than pasting into ChatGPT for company-confidential content?',
        qo: [
          { text: 'Nothing — they\'re the same.',                                                    correct: false },
          { text: 'Copilot operates inside your company\'s tenant with data agreements in place; content stays in Microsoft 365.', correct: true  },
          { text: 'Microsoft hides everything.',                                                     correct: false },
          { text: 'ChatGPT is blocked at the firewall.',                                             correct: false },
        ],
        qa: 'Data-agreement infrastructure is the real difference. Copilot = contractual protection Microsoft + your company set up. Public chatbot = neither.',
      },
      {
        t: 'Copilot\'s real limits',
        rb: [
          "Copilot is impressive, not magic. It still hallucinates — invents facts that sound plausible. It still has a training cutoff (though it can pull fresh data from your work via Graph). It still can\'t reliably do arithmetic. Every warning that applies to general AI applies to Copilot.",
          "Specific Copilot limits to know: it only sees what your Microsoft 365 permissions allow (shared files, your own emails, meetings you were in — not coworkers\' private data). It cannot take actions on its own (can\'t actually send an email; can only draft). And it works best on recent, digital, searchable content — old paper files, handwritten notes, and weirdly-formatted PDFs are hard for it.",
          "The fix for all of these is the same discipline you\'d apply to any AI: verify specific facts, do critical math yourself, read before sending, and don\'t trust an AI-drafted decision without reviewing it. Copilot is your assistant; you\'re the decider.",
        ],
        rc: { label: 'Copilot limits', text: 'Hallucinates · limited to your permissions · can draft not send · prefers digital/searchable content · math is shaky.' },
        et: 'Understanding limits',
        ep: 'Which task is MOST at risk of hallucination in Copilot?',
        eo: [
          { text: 'Drafting a polite email.',                                                        correct: false, feedback: 'Low risk — Copilot is grounded in the thread.' },
          { text: '"What are the top 5 peer-reviewed papers on enterprise AI adoption, with citations?"', correct: true,  feedback: 'Academic citations are the top hallucination category. Verify before using.' },
          { text: 'Summarizing a Word document.',                                                    correct: false, feedback: 'Grounded summaries are low risk if the input is real.' },
        ],
        qp: 'Copilot cannot, by default:',
        qo: [
          { text: 'Read files you share access to.',                                                  correct: false },
          { text: 'Draft replies in Outlook.',                                                        correct: false },
          { text: 'Send emails on your behalf without explicit action.',                             correct: true  },
          { text: 'Summarize meetings.',                                                              correct: false },
        ],
        qa: 'Copilot drafts; you decide + send. That\'s the safety architecture of every workflow it touches today.',
      },
    ],
  },
  {
    name: 'Safe at work',
    lessons: [
      {
        t: 'Company data rules',
        rb: [
          "Copilot at work is governed by your company\'s data rules. That includes: what data classifications Copilot can see (public, internal, confidential, restricted), what it can output, and where outputs can go. These rules live in your company\'s data policy — written and enforced by Security, Legal, and IT.",
          "The default stance at most companies: Copilot is OK for internal and confidential content because data stays in Microsoft 365 under contract. But restricted content (regulated health info, customer financial data, source code with IP implications) often has additional rules. Don\'t assume; ask.",
          "If you don\'t know your company\'s data policy, you\'re the most at-risk Copilot user. Spend 10 minutes reading it, or ask IT for a quick 'what can I and can\'t I do with Copilot' summary. The cost of not knowing is measured in incidents.",
        ],
        rc: { label: 'Know your policy', text: 'Company data policy + IT\'s Copilot FAQ = the two documents every Copilot user should read.' },
        et: 'Policy awareness',
        ep: 'You\'re about to paste customer medical information into Copilot. What should you do first?',
        eo: [
          { text: 'Paste it — Copilot is internal.',                                                correct: false, feedback: 'Medical info is typically restricted data with extra rules.' },
          { text: 'Check your company\'s data policy for restricted/regulated content rules before proceeding.', correct: true,  feedback: 'Regulated data often has additional controls even within Copilot.' },
          { text: 'Copy it to ChatGPT first to get ideas.',                                         correct: false, feedback: 'Worst option — out of approved systems entirely.' },
        ],
        qp: 'Who defines what data Copilot can and cannot handle at your company?',
        qo: [
          { text: 'You personally.',                                                                correct: false },
          { text: 'Microsoft.',                                                                     correct: false },
          { text: 'Your Security, Legal, and IT teams via tenant controls + written policy.',     correct: true  },
          { text: 'The AI itself.',                                                                 correct: false },
        ],
        qa: 'Policy is upstream of your usage. Read it once; it pays back for years.',
      },
      {
        t: 'IT policies and tenant settings',
        rb: [
          "Your IT admin controls what Copilot can do for your specific tenant (i.e., your company\'s Microsoft 365 instance). Key tenant-level settings: which apps have Copilot enabled, what data sources Copilot can index, whether external data is allowed, data residency (which region data stays in), and audit/logging rules.",
          "This matters to you because: features you expect might be disabled, and boundaries you don\'t know about might be stricter than you think. 'Why can\'t Copilot see our shared drive?' → IT disabled external-drive indexing. 'Why doesn\'t the summary include that Teams meeting?' → transcription was off.",
          "When a Copilot feature doesn\'t work the way you expect, IT is usually the answer — either they haven\'t enabled it, or they\'ve enabled it differently than you assumed. File a ticket with specifics; don\'t work around policy, work with it.",
        ],
        rc: { label: 'Tenant-level knobs', text: 'Which apps get Copilot · What data it indexes · External vs internal only · Residency · Audit/logging rules.' },
        et: 'Troubleshooting',
        ep: 'Copilot in Teams isn\'t generating meeting summaries, even though the button exists. What\'s the most likely cause?',
        eo: [
          { text: 'Copilot is broken.',                                                              correct: false, feedback: 'Rarely the issue.' },
          { text: 'Meeting transcription is off at the tenant level, or not enabled for this meeting.', correct: true,  feedback: 'No transcription = no data for Copilot to summarize. Config issue, not software.' },
          { text: 'You\'re offline.',                                                                correct: false, feedback: 'Possible but unlikely for this specific symptom.' },
        ],
        qp: 'The right move when Copilot can\'t access data you expected it to see:',
        qo: [
          { text: 'Copy the data manually.',                                                         correct: false },
          { text: 'Work around with a different tool.',                                              correct: false },
          { text: 'File a specific ticket with IT explaining what you tried and what Copilot said.', correct: true  },
          { text: 'Escalate to your CEO.',                                                           correct: false },
        ],
        qa: 'IT + specifics = the fix. Vague tickets get vague responses. Good tickets get fast fixes.',
      },
      {
        t: 'What not to paste',
        rb: [
          "Even inside Copilot\'s relatively safe sandbox, some content doesn\'t belong in a prompt. Social security numbers, full credit card numbers, passwords, encryption keys, anyone\'s home address, unreleased security vulnerabilities. These stay in the systems designed to hold them (HRIS, payment processors, secret managers).",
          "Rule of thumb: if the data would be dangerous in the wrong hands regardless of whether it\'s inside your company, don\'t put it into an AI prompt. Copilot\'s storage and logging are different from your password manager\'s; treat them accordingly.",
          "For most everyday tasks — drafts, summaries, analysis, brainstorming — Copilot is fine. The 'don\'t paste' list is narrow; most people don\'t need to worry about it often. But knowing where the line is means you never cross it by accident.",
        ],
        rc: { label: 'Narrow "don\'t paste" list', text: 'SSNs · full CC numbers · passwords · encryption keys · home addresses · unreleased security vulns.' },
        et: 'What belongs in Copilot vs elsewhere',
        ep: 'You want to store a long password securely. Where should it go?',
        eo: [
          { text: 'In a Copilot chat, as a note to yourself.',                                      correct: false, feedback: 'Never. Passwords belong in a password manager.' },
          { text: 'In your company-approved password manager (1Password, LastPass, Azure Key Vault, etc.).', correct: true,  feedback: 'Right tool, built for this purpose.' },
          { text: 'In a sticky note under your keyboard.',                                          correct: false, feedback: 'A classic, and still wrong.' },
        ],
        qp: 'The "don\'t paste into Copilot" list is:',
        qo: [
          { text: 'Very long — basically everything is unsafe.',                                    correct: false },
          { text: 'Very narrow — credentials, regulated identifiers, unreleased security details. Most everyday content is fine.', correct: true  },
          { text: 'Not defined anywhere.',                                                          correct: false },
          { text: 'Different every month.',                                                          correct: false },
        ],
        qa: 'Knowing the list makes you confident with Copilot AND safe. Not knowing means either over-caution (losing productivity) or mistakes.',
      },
      {
        t: 'When to escalate to IT',
        rb: [
          "Two categories of Copilot issue always escalate to IT: (1) feature-not-working (you expected Copilot to do X, it doesn\'t), and (2) something-unexpected-happened (Copilot surfaced data it shouldn\'t have, or behaved weirdly with sensitive content). Both are real; both deserve a ticket.",
          "Escalation template: 'Trying to do X in app Y. Expected result: Z. Actual result: [what happened]. Screenshot attached.' Specifics get fast answers; vague reports ('Copilot is broken') go to the back of the queue.",
          "For security-adjacent incidents — Copilot showing something unexpected or accidentally receiving restricted content — escalate to Security, not just IT. Same-day. Don\'t try to undo or 'fix' it yourself; document, escalate, let the pros handle.",
        ],
        rc: { label: 'Escalation rules', text: 'Feature issue → IT ticket with specifics. Security-adjacent surprise → Security team, same-day.' },
        et: 'Escalation call',
        ep: 'Copilot just surfaced a coworker\'s confidential HR file in response to your prompt, which you shouldn\'t have had access to. What do you do?',
        eo: [
          { text: 'Close the chat and forget it.',                                                   correct: false, feedback: 'Permission leak — has to be investigated.' },
          { text: 'Take a screenshot, stop interacting, escalate to Security (not just IT) immediately.', correct: true,  feedback: 'Potential access-control issue. Document, escalate, don\'t touch further.' },
          { text: 'Share it with the coworker involved so they know.',                              correct: false, feedback: 'Let Security handle the response; don\'t expand the incident.' },
        ],
        qp: 'The anatomy of a good Copilot ticket to IT:',
        qo: [
          { text: '"Copilot is broken."',                                                             correct: false },
          { text: '"In [app], I tried [X], expected [Y], got [Z]. Screenshot attached."',            correct: true  },
          { text: '"Please help."',                                                                   correct: false },
          { text: '"Fix it today."',                                                                  correct: false },
        ],
        qa: 'Specific tickets get specific fixes. A reproducible description saves IT hours and gets you unblocked faster.',
      },
      {
        t: 'Certification quiz — CPLT·101',
        rb: [
          "You\'ve covered what Copilot is, where it lives, how to prompt it well, and how to use it without putting your company at risk. That\'s enough to get measurable value from Copilot across your workweek — drafts, summaries, search, meetings, and safe handling.",
          "One last check next. Pass and you\'ve earned the CPLT·101 certificate. If you go on to Copilot + Excel, you\'ll get a second, complementary cert focused specifically on data work inside Excel.",
          "A final encouragement: Copilot improves fast. The version you use in six months will be meaningfully better than today\'s. The habits you build now — context, iteration, verification, safety discipline — will compound as capabilities expand.",
        ],
        rc: { label: 'What you built', text: 'The habits to use Copilot well. Which will compound over time as Copilot keeps improving.' },
        et: 'Foundation check',
        ep: 'The single most important habit for good Copilot output is:',
        eo: [
          { text: 'Using long, formal prompts.',                                                     correct: false, feedback: 'Length ≠ quality.' },
          { text: 'Giving it context — who you are, who the output is for, what matters.',         correct: true,  feedback: 'The steering wheel of every AI. Copilot no exception.' },
          { text: 'Saying please and thank you.',                                                    correct: false, feedback: 'Doesn\'t affect output.' },
        ],
        qp: 'Copilot is the right tool over ChatGPT when:',
        qo: [
          { text: 'Always.',                                                                          correct: false },
          { text: 'The task requires access to your company\'s data — emails, docs, meetings.',    correct: true  },
          { text: 'Never — ChatGPT is always better.',                                               correct: false },
          { text: 'Only on Fridays.',                                                                correct: false },
        ],
        qa: 'Use the right tool for the task: Copilot for work-data tasks, general AI for independent tasks. Both live in your toolkit.',
      },
    ],
  },
]);

/* ============================================================
   CPLT·EXL — COPILOT + EXCEL (12 lessons, 3 modules)
   Copilot inside Excel for data and analysis.
   Assumes comfort with Excel basics but not Copilot.
   ============================================================ */
definePlusCourse(202, 'CPLT·EXL', [
  {
    name: 'Copilot in Excel basics',
    lessons: [
      {
        t: 'Opening the Copilot pane',
        rb: [
          "In Excel, Copilot lives in a side pane. Open a workbook, click the Copilot icon in the ribbon (usually top right in the Home tab). A pane slides open on the right. That\'s your AI assistant for this spreadsheet.",
          "For Copilot to work well in Excel, your data should be in a proper Excel table (not just raw cells). Convert by selecting your data + hitting Ctrl+T (Cmd+T on Mac). Copilot gets much more reliable on tables because it can identify columns, types, and relationships.",
          "If you don\'t see the Copilot button, it\'s likely not enabled for your account in this app. Ask IT — Copilot in Excel is a separate rollout from Copilot in Word/Outlook, and some companies stage them.",
        ],
        rc: { label: 'Setup checklist', text: '1. Copilot icon visible. 2. Data formatted as an Excel table (Ctrl+T). 3. Cloud-saved file (OneDrive/SharePoint) — local-only files often don\'t get Copilot.' },
        et: 'Table or raw data?',
        ep: 'Why does Copilot in Excel work better when your data is formatted as an Excel table?',
        eo: [
          { text: 'Tables look prettier.',                                                           correct: false, feedback: 'Aesthetics don\'t affect Copilot behavior.' },
          { text: 'Copilot can reliably identify columns, data types, and the structure of your data.', correct: true,  feedback: 'Structure = reliability. Raw cells are harder for AI to reason about.' },
          { text: 'Tables are faster in Excel.',                                                     correct: false, feedback: 'Marginal performance gain, not the reason Copilot improves.' },
        ],
        qp: 'Copilot in Excel requires:',
        qo: [
          { text: 'A supercomputer.',                                                                correct: false },
          { text: 'An Excel license with Copilot enabled and, usually, a cloud-saved file.',        correct: true  },
          { text: 'A Windows PC only.',                                                              correct: false },
          { text: 'Nothing — it\'s always on.',                                                      correct: false },
        ],
        qa: 'Licensing + feature flag + cloud-saved file is the common combo. Local-only files often lose Copilot support.',
      },
      {
        t: 'Plain-English asks',
        rb: [
          "Copilot in Excel understands plain English. Instead of writing a formula, ask: 'Which customer has the highest MRR?' 'Which rows are missing data?' 'What\'s the average deal size for enterprise customers?' The answer appears in the pane.",
          "You don\'t need to remember column names precisely. 'Show me all the rows where revenue is over $10k' works even if your column is named 'Revenue ($)' or 'Monthly Revenue' — Copilot figures out what you meant from context.",
          "The trick for best results: ask one question at a time. 'Filter to enterprise, sort by revenue, and show only this quarter' is a complex compound ask. Break it up; you\'ll get faster, more reliable answers.",
        ],
        rc: { label: 'Ask pattern', text: 'One question. One filter or calculation. Specific column or criterion. Plain English is fine — precision helps.' },
        et: 'Best Excel question',
        ep: 'Which question gets the cleanest response from Copilot in Excel?',
        eo: [
          { text: '"Do something useful."',                                                          correct: false, feedback: 'Too vague.' },
          { text: '"Which rows have revenue greater than $10,000?"',                                correct: true,  feedback: 'Specific, measurable, unambiguous.' },
          { text: '"Analyze the data."',                                                             correct: false, feedback: 'Broad and subjective.' },
        ],
        qp: 'The single most common Excel + Copilot mistake:',
        qo: [
          { text: 'Using too few rows.',                                                             correct: false },
          { text: 'Asking a multi-step compound question all at once instead of breaking it into steps.', correct: true  },
          { text: 'Using the wrong font.',                                                           correct: false },
          { text: 'Asking in lowercase.',                                                            correct: false },
        ],
        qa: 'One step at a time gives Copilot a clear target per response. Compound questions invite ambiguity and partial answers.',
      },
      {
        t: 'Inserting formulas from a sentence',
        rb: [
          "The killer feature: ask Copilot for a formula in plain English. 'Write a formula that sums column D if column B is \"Enterprise\" and column E is in Q2 2026.' Copilot writes the SUMIFS, explains what it does, and offers to insert it for you.",
          "You don\'t have to remember syntax for SUMIFS, INDEX/MATCH, XLOOKUP, or FILTER anymore. Describe what you want in prose; Copilot writes the formula. Reading Copilot\'s output is also one of the fastest ways to LEARN new Excel functions — it explains each argument.",
          "Always verify the formula on a small subset of data before trusting it on the whole sheet. AI gets the logic right most of the time; it sometimes gets the cell references wrong (off-by-one, wrong sheet name). Five seconds of spot-checking saves hours of bad analysis.",
        ],
        rc: { label: 'Formula prompt', text: '"Write a formula that [plain English goal]. Columns are: A=X, B=Y, C=Z. Explain each part."' },
        et: 'Best formula ask',
        ep: 'Best prompt for a conditional count?',
        eo: [
          { text: '"Make a formula."',                                                                correct: false, feedback: 'Vague.' },
          { text: '"Write a formula to count the rows where column B equals \"Enterprise\" and column D (renewal date) falls within Q2 2026."', correct: true,  feedback: 'Task + columns + criteria + timeframe. Copilot can nail it.' },
          { text: '"COUNTIF."',                                                                       correct: false, feedback: 'A function name alone isn\'t a task.' },
        ],
        qp: 'What\'s the safest verification step after Copilot writes a formula?',
        qo: [
          { text: 'Paste it everywhere immediately.',                                                correct: false },
          { text: 'Run it on a small subset and spot-check that the result matches what you\'d expect by hand.', correct: true  },
          { text: 'Ask Copilot if the formula is correct.',                                          correct: false },
          { text: 'Delete it and start over.',                                                       correct: false },
        ],
        qa: 'Logic OK, references shaky — that\'s the pattern. A 5-second manual check catches the reference errors before they matter.',
      },
      {
        t: 'Reading AI-generated explanations',
        rb: [
          "One of Copilot\'s underrated Excel features: it explains formulas — yours AND its own. Click a formula-filled cell, ask Copilot 'what does this do?' and you get a plain-English breakdown. Useful for complex formulas you inherited, or for learning unfamiliar functions.",
          "When Copilot generates a formula, read its explanation before you insert it. The explanation reveals assumptions the AI made that might not match your data. 'This assumes column D always contains a date' — if it doesn\'t, revise the prompt before you paste.",
          "You can also ask for explanations of AI-generated summaries, pivot tables, or charts. 'Why did you group these customers this way?' 'What\'s the logic behind this bucket?' Copilot\'s answer makes it much easier to trust (or catch) its output.",
        ],
        rc: { label: 'Read the why', text: 'Every Copilot output comes with a potential explanation. Read it before you rely on the output. Cheap and high-leverage.' },
        et: 'Explanation use',
        ep: 'You inherited a spreadsheet with a scary-looking nested formula. What\'s the fastest way to understand it?',
        eo: [
          { text: 'Read the formula syntax line by line yourself.',                                  correct: false, feedback: 'Slower than needed.' },
          { text: 'Click the cell and ask Copilot to explain the formula in plain English.',        correct: true,  feedback: 'Seconds instead of minutes, with the same level of understanding.' },
          { text: 'Delete it and guess.',                                                            correct: false, feedback: 'Tempting but destructive.' },
        ],
        qp: 'Why read Copilot\'s formula explanation before inserting?',
        qo: [
          { text: 'For fun.',                                                                         correct: false },
          { text: 'It reveals AI assumptions that might not match your data (so you catch them before they affect analysis).', correct: true  },
          { text: 'It\'s required by Microsoft.',                                                     correct: false },
          { text: 'It\'s the only way to save the file.',                                             correct: false },
        ],
        qa: 'Reading 3 lines of explanation saves you 30 minutes of debugging when the AI\'s assumption about your data was wrong.',
      },
    ],
  },
  {
    name: 'Cleaning & analysis',
    lessons: [
      {
        t: 'Normalizing messy data',
        rb: [
          "Messy data is Copilot\'s sweet spot. Mixed capitalization ('acme', 'ACME', 'Acme Inc'), inconsistent date formats, stray whitespace, duplicate-ish rows. Ask Copilot: 'Clean column B so all company names have consistent capitalization and no trailing spaces.' Done.",
          "For bigger messes — 5,000 rows with multiple inconsistency patterns — ask Copilot for a cleaning PLAN first. 'Look at columns B, C, and D and tell me the top 5 data quality issues, with suggested fixes.' Review the plan. Then apply fixes one at a time so you can verify each.",
          "Don\'t let Copilot auto-fix things you haven\'t verified. 'MacKenzie' and 'Mackenzie' look like typos of each other — they might be two different people. AI \"standardization\" can accidentally merge real distinctions. Review fixes case by case for anything high-stakes.",
        ],
        rc: { label: 'Cleaning pattern', text: '1. Ask for a diagnosis (top issues). 2. Review the plan. 3. Apply fixes one at a time. 4. Verify before applying the next.' },
        et: 'Cleaning strategy',
        ep: 'You have a customer list with mixed capitalization, extra whitespace, and possible duplicates. Best Copilot strategy?',
        eo: [
          { text: '"Fix all the problems."',                                                         correct: false, feedback: 'Too broad. Copilot may miss things or change something you didn\'t want changed.' },
          { text: '"Identify the top data quality issues in columns B-D. I\'ll apply fixes one at a time after I review them."', correct: true,  feedback: 'Plan first, apply incrementally. Controlled and auditable.' },
          { text: 'Start deleting rows.',                                                              correct: false, feedback: 'Destructive and impatient.' },
        ],
        qp: 'The biggest risk of AI-powered data cleaning is:',
        qo: [
          { text: 'It\'s too slow.',                                                                  correct: false },
          { text: 'It "fixes" things that looked wrong but were actually intentional distinctions (merging separate entities, etc.).', correct: true  },
          { text: 'The file becomes too small.',                                                      correct: false },
          { text: 'It can only handle numbers.',                                                      correct: false },
        ],
        qa: 'Apparent inconsistency sometimes IS the data. Verify before letting AI normalize — especially names, product codes, and identifiers.',
      },
      {
        t: 'Natural-language filters',
        rb: [
          "Ask Copilot to filter your data in English: 'Show me only customers in California who have renewed at least once.' 'Highlight rows where revenue dropped by more than 20% between Q1 and Q2.' Copilot applies the filter and can insert a filtered view or a new sheet.",
          "For filters that depend on dates, spell out the range. 'Q2 2026' works, but 'Q2' alone might confuse Copilot into picking the wrong year. Precision saves re-filtering.",
          "You can chain natural-language asks: 'Now further filter to customers with MRR over $10k.' Copilot builds on the previous filter state. Faster than rebuilding filter UI from scratch each time.",
        ],
        rc: { label: 'Filter patterns', text: 'Specific values · Clear date ranges · Chained refinements across follow-ups.' },
        et: 'Precision in filters',
        ep: 'You want all renewals in Q2 2026. Best prompt?',
        eo: [
          { text: '"Show me Q2 renewals."',                                                          correct: false, feedback: 'Which year? Copilot might guess wrong.' },
          { text: '"Show me only rows where the renewal date is between 2026-04-01 and 2026-06-30."', correct: true,  feedback: 'Exact date range = exact filter.' },
          { text: '"Renewals."',                                                                      correct: false, feedback: 'Too vague.' },
        ],
        qp: 'Chained natural-language filters in Copilot are useful because:',
        qo: [
          { text: 'They\'re faster than checkboxes.',                                                 correct: false },
          { text: 'You can refine your view incrementally in conversation without rebuilding filter UI each time.', correct: true  },
          { text: 'Copilot gives discounts for longer chains.',                                       correct: false },
          { text: 'It\'s required for Excel.',                                                        correct: false },
        ],
        qa: 'Conversational refinement = fast iteration on data views. Each follow-up narrows further without losing state.',
      },
      {
        t: 'Pivot tables via Copilot',
        rb: [
          "Pivot tables intimidate a lot of users. Copilot collapses the complexity. Ask: 'Create a pivot table summarizing revenue by customer segment and quarter.' Copilot builds it in seconds. You can then adjust with follow-ups: 'Break out segments by industry.' 'Add a conditional format for negative YoY.'",
          "For the best pivot results, start simple. One dimension by one measure — 'revenue by segment.' Copilot gets this reliably. Then build from there. Asking for a complex pivot in one shot often produces something off-target.",
          "Always check the totals. Copilot\'s pivots are usually right, but arithmetic errors do slip in — especially with non-trivial filters or calculated fields. A quick sum-check against the raw data catches issues before you share the pivot.",
        ],
        rc: { label: 'Pivot workflow', text: 'Simple pivot first → refine via follow-ups → verify totals against raw data.' },
        et: 'Pivot discipline',
        ep: 'Best first ask when building a pivot with Copilot?',
        eo: [
          { text: '"Create a pivot table with 8 dimensions, 5 measures, and conditional formatting."', correct: false, feedback: 'Too much at once. Start simple.' },
          { text: '"Create a pivot showing revenue by customer segment." Then iterate.',            correct: true,  feedback: 'One dimension, one measure, build from there.' },
          { text: '"Make a pivot."',                                                                  correct: false, feedback: 'Too vague.' },
        ],
        qp: 'What\'s the reliable verification step for a Copilot-generated pivot?',
        qo: [
          { text: 'Trust the totals.',                                                                correct: false },
          { text: 'Spot-check at least one or two totals against the raw data.',                     correct: true  },
          { text: 'Ask a colleague.',                                                                 correct: false },
          { text: 'Count rows instead.',                                                              correct: false },
        ],
        qa: 'Pivot tables compound errors — one miscount in an aggregate hides the root cause. Spot-check a total or two every time.',
      },
      {
        t: 'Charts from prompts',
        rb: [
          "'Create a bar chart comparing revenue across customer segments for the last four quarters.' Copilot builds the chart right in the sheet. 'Change it to a line chart with quarters on the x-axis.' Done. 'Add a trend line for enterprise.' Done.",
          "For best chart results, be specific about: chart type (bar / line / scatter / stacked), axes (what\'s on X, what\'s on Y), and grouping (by segment, by quarter, by customer). Copilot does its best with vague asks, but specificity lifts quality fast.",
          "Copilot can also SUGGEST chart types when you\'re not sure. 'What\'s the best chart to show revenue trend over time by segment?' → It\'ll recommend a type and build it. Good for when you have the data but not the visual instinct.",
        ],
        rc: { label: 'Chart prompt pattern', text: '"[Chart type] showing [measure] by [dimension] across [grouping]. Axes: X=[?], Y=[?]."' },
        et: 'Chart prompt quality',
        ep: 'Which chart prompt produces the most useful result?',
        eo: [
          { text: '"Make a cool chart."',                                                             correct: false, feedback: '"Cool" isn\'t specific.' },
          { text: '"Create a stacked bar chart showing quarterly revenue by customer segment for the last 4 quarters. X-axis = quarter. Y-axis = revenue."', correct: true,  feedback: 'Chart type + axes + grouping + time scope = precise output.' },
          { text: '"Revenue chart."',                                                                  correct: false, feedback: 'Too vague.' },
        ],
        qp: 'What should you do when you\'re unsure what chart type to use?',
        qo: [
          { text: 'Guess.',                                                                            correct: false },
          { text: 'Ask Copilot to recommend a chart type for your goal (trend over time, comparison, distribution, etc.).', correct: true  },
          { text: 'Always use a pie chart.',                                                           correct: false },
          { text: 'Skip the chart.',                                                                   correct: false },
        ],
        qa: 'Chart selection is its own skill. Copilot is a great collaborator for it when the answer isn\'t obvious.',
      },
    ],
  },
  {
    name: 'Pro moves',
    lessons: [
      {
        t: 'Combining with Power Query',
        rb: [
          "Power Query is Excel\'s industrial-strength data-transformation tool — it reshapes data from multiple sources before it lands in a sheet. Copilot doesn\'t fully replace Power Query, but it can help you write Power Query steps in plain English.",
          "Ask Copilot: 'Write Power Query steps to load sales.csv and customers.csv, merge them on customer_id, filter to active customers, and group by region with summed revenue.' It generates the M code. You paste into the advanced editor, run, done.",
          "For repeat workflows — daily imports, weekly pivots, monthly reconciliations — building a Power Query pipeline with Copilot\'s help beats re-clicking through Excel\'s UI every time. Minutes of setup, hours saved every month.",
        ],
        rc: { label: 'When to reach for Power Query', text: 'Repeated transforms. Multiple source files. Reshaping needed before analysis. Copilot + Power Query = less clicking over time.' },
        et: 'Power Query use case',
        ep: 'Which task is best suited to a Copilot + Power Query workflow?',
        eo: [
          { text: 'A one-time analysis of today\'s spreadsheet.',                                    correct: false, feedback: 'Power Query overkill. Regular Copilot is fine.' },
          { text: 'Monthly reconciliation that joins 3 CSV files, filters, and summarizes — same process every time.', correct: true,  feedback: 'Repeating pipelines are exactly what Power Query (+ Copilot\'s help) is for.' },
          { text: 'Writing a chart title.',                                                          correct: false, feedback: 'Way out of scope.' },
        ],
        qp: 'What does Copilot contribute to a Power Query workflow?',
        qo: [
          { text: 'It replaces Power Query.',                                                         correct: false },
          { text: 'It helps you write the M code steps in plain English, speeding up setup.',       correct: true  },
          { text: 'It runs faster than Power Query.',                                                 correct: false },
          { text: 'Nothing — they\'re separate.',                                                     correct: false },
        ],
        qa: 'Copilot is a pairing partner for Power Query. It doesn\'t replace the tool; it shortens the setup curve.',
      },
      {
        t: 'Advanced formulas',
        rb: [
          "Advanced Excel is full of functions most users don\'t know: XLOOKUP, LET, LAMBDA, dynamic arrays with FILTER/SORT/UNIQUE, SEQUENCE for iteration, MAKEARRAY for matrix math. Copilot knows all of them and can write them when you describe what you want.",
          "Describe your intent and let Copilot pick the function. 'For each customer, return their most recent order amount, handling customers with no orders as blank.' Copilot picks between XLOOKUP, FILTER + arrays, or a LAMBDA based on your data shape — you don\'t have to remember which.",
          "When Copilot writes something unfamiliar, ask for an explanation. 'Walk me through this LAMBDA.' You learn the function; you also verify the logic. Two benefits from one follow-up.",
        ],
        rc: { label: 'Modern Excel arsenal', text: 'XLOOKUP · LET · LAMBDA · FILTER/SORT/UNIQUE · SEQUENCE · MAKEARRAY. Copilot knows them; you don\'t have to memorize them.' },
        et: 'Let Copilot pick',
        ep: 'You want "for each customer, their most recent order amount." What\'s the best Copilot approach?',
        eo: [
          { text: 'Tell Copilot "use VLOOKUP."',                                                      correct: false, feedback: 'Constraining too early — VLOOKUP may not be the best choice.' },
          { text: 'Describe the INTENT ("for each customer, their most recent order") and let Copilot pick the function.', correct: true,  feedback: 'Intent first, function second. Copilot knows the full modern toolbox.' },
          { text: 'Write it yourself from scratch.',                                                  correct: false, feedback: 'Slower unless you already know exactly what to use.' },
        ],
        qp: 'The benefit of Copilot knowing modern Excel functions is:',
        qo: [
          { text: 'You don\'t have to memorize every function yourself.',                            correct: true  },
          { text: 'It makes Excel faster.',                                                           correct: false },
          { text: 'Nothing.',                                                                         correct: false },
          { text: 'It automatically avoids bugs.',                                                    correct: false },
        ],
        qa: 'Excel added 20+ major functions in the past decade. Copilot knows them all; you don\'t have to.',
      },
      {
        t: 'AI math gotchas + verification',
        rb: [
          "Copilot is good at writing formulas. It is NOT reliably good at doing math in its head. If you ask 'what\'s the sum of column C?' in chat, without asking it to insert a formula, you may get a wrong number — confidently stated.",
          "The rule: for any numeric answer that matters, ASK FOR A FORMULA rather than an answer. 'Write a formula that sums column C' → you get a SUM formula, run it, trust the number. 'What\'s the total revenue?' → you get Copilot\'s best guess at the arithmetic, which may be wrong.",
          "Other common math gotchas: percentages (Copilot often mixes up percentage OF vs percentage CHANGE), compounded growth, year-over-year with partial data, and any math involving more than ~10 rows done 'in the chat.' Verify via formula, always.",
        ],
        rc: { label: 'The verification rule', text: 'Formula for numbers. Explanation for logic. Trust the cell; be skeptical of the chat pane\'s arithmetic.' },
        et: 'Math verification',
        ep: 'You need the total revenue for Q2. Safest Copilot approach?',
        eo: [
          { text: '"What\'s our Q2 revenue?" — use the answer.',                                     correct: false, feedback: 'Answer may be wrong; chat arithmetic is unreliable.' },
          { text: '"Write a formula that sums column C where quarter = Q2 2026." Run the formula; use the result.', correct: true,  feedback: 'Formula in a cell = Excel does the math, not the AI.' },
          { text: 'Calculate it by hand.',                                                            correct: false, feedback: 'Works, but slower than the formula approach.' },
        ],
        qp: 'Copilot\'s weakest math is:',
        qo: [
          { text: 'Simple addition of 3 numbers.',                                                    correct: false },
          { text: 'Arithmetic over many rows, especially with percentages, compounded growth, or partial data.', correct: true  },
          { text: 'Reading the time.',                                                                correct: false },
          { text: 'Counting days.',                                                                   correct: false },
        ],
        qa: 'LLMs are great at language, mediocre at math. Offload the math to Excel formulas; use Copilot to write them.',
      },
      {
        t: 'Certification quiz — CPLT·EXL',
        rb: [
          "You\'ve covered the Copilot + Excel toolkit end to end: opening the pane, asking in plain English, generating formulas, reading explanations, cleaning data, filtering, pivots, charts, Power Query, advanced functions, and the math-verification discipline.",
          "The big thing people get wrong with Copilot + Excel: letting the chat pane do arithmetic they should have pushed into a formula. The fix is simple, and you know it now — formula for numbers, explanation for logic.",
          "Last check next. Pass it and you\'ve earned the CPLT·EXL certificate. Pair it with CPLT·101 and you have a complete Copilot competency baseline across the 365 stack.",
        ],
        rc: { label: 'What you built', text: 'A reliable Copilot + Excel workflow: ask, verify, iterate, trust formulas not chat math.' },
        et: 'Foundation check',
        ep: 'The single most important habit from this course:',
        eo: [
          { text: 'Use lots of charts.',                                                              correct: false, feedback: 'Useful but not the main thing.' },
          { text: 'Push arithmetic into formulas rather than relying on chat-pane numbers.',         correct: true,  feedback: 'The reliability upgrade that carries across every Excel task.' },
          { text: 'Always use Power Query.',                                                          correct: false, feedback: 'Overkill for one-off work.' },
        ],
        qp: 'When Copilot generates a formula, you should:',
        qo: [
          { text: 'Paste it everywhere and move on.',                                                 correct: false },
          { text: 'Read its explanation, verify assumptions, and spot-check on a small data range before trusting it at scale.', correct: true  },
          { text: 'Delete it and start over.',                                                       correct: false },
          { text: 'Ask Copilot if it\'s sure.',                                                       correct: false },
        ],
        qa: 'Explanation + spot-check = the 30-second discipline that prevents 3-hour mistakes. Make it a habit.',
      },
    ],
  },
]);

// Expose helpers + course IDs for the app layer (Foreman will port this alongside content.js)
window.PLUS_COURSES = [
  { id: 201, code: 'CPLT·101', title: 'Copilot 101',         subtitle: 'Microsoft Copilot from zero. Approachable for anyone at a company using Microsoft 365.', lessons: 20, hours: 2.5, suite: 'plus', price: 249, tier: 'paid' },
  { id: 202, code: 'CPLT·EXL', title: 'Copilot + Excel',     subtitle: 'Copilot inside Excel for data, analysis, and formulas. Assumes Excel basics; teaches Copilot-in-Excel.', lessons: 12, hours: 1.5, suite: 'plus', price: 249, tier: 'paid' },
];

window.definePlusCourse = definePlusCourse;
