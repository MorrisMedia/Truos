import type { Course } from './types';

export const BASE_COURSES: Course[] = [
  {
    id: 101, code: 'AI·101', title: 'AI Foundations',
    subtitle: 'No jargon, no coding. What AI actually is, how to talk to it, and how to use it without embarrassing yourself.',
    lessons: 20, hours: 1, tier: 'paid', suite: 'base', price: 199,
    modules: [
      { name: 'What is AI, really?',            lessons: ['What is AI?', "Kinds of AI you'll meet", "What's a chatbot?", 'Signing up: picking a tool'] },
      { name: 'How AI thinks (without the math)', lessons: ["It's predicting words", 'Trained once, used forever', 'Why AI confidently makes stuff up', "What AI can't do"] },
      { name: 'Your first prompts',             lessons: ['What is a prompt?', 'Clear asks beat clever ones', 'Give it context', 'Iterating: ask again'] },
      { name: 'Staying safe & sane',            lessons: ['What NOT to share', 'Fact-checking AI', 'When NOT to use AI', 'Biases and blind spots'] },
      { name: 'First real tasks',               lessons: ['Write a polished email', 'Summarize a long document', 'Brainstorm options', 'Certification quiz'] },
    ],
  },
  {
    id: 102, code: 'AI·102', title: 'AI Prompt Mastery',
    subtitle: 'Prompt patterns, research, writing, meetings, data. The daily toolkit.',
    lessons: 24, hours: 1.5, tier: 'paid', suite: 'base', price: 499,
    modules: [
      { name: 'Anatomy of a prompt',          lessons: ['Instruction, context, examples, format', 'The role trick', "Show, don't just tell", 'Ask for the format you want'] },
      { name: 'Writing with AI',              lessons: ['Drafting from a blank page', 'Editing and shortening', 'Adjusting tone', 'Keeping your voice'] },
      { name: 'Research with AI',             lessons: ["Search vs AI — what's the difference", 'Triangulating sources', 'Synthesis prompts', 'Avoiding plausible-but-wrong'] },
      { name: 'Meetings & email',             lessons: ['Summaries that matter', 'Extracting action items', 'Translating jargon for the room', 'Drafting emails that sound like you'] },
      { name: 'Data & spreadsheets',          lessons: ['Asking AI for formulas', 'Cleaning messy data', 'Pulling insights from numbers', "Sanity-checking AI's math"] },
      { name: 'Iteration as a habit',         lessons: ['Critique the output', 'Chain-of-asks', 'Start fresh vs push through', 'Certification quiz'] },
    ],
  },
  {
    id: 103, code: 'AI·103', title: 'Applied AI at Work',
    subtitle: 'Sales, marketing, CS, ops, finance — real playbooks for commercial teams.',
    lessons: 32, hours: 2, tier: 'paid', suite: 'base', price: 999,
    modules: [
      { name: 'Sales motions',               lessons: ['Account research in 3 minutes', 'Pre-call prep', 'Handling objections', 'Crafting follow-ups', 'Keeping your CRM clean', "What AI can't do for sales"] },
      { name: 'Marketing',                   lessons: ['Campaign brief generator', 'Copy variants at scale', 'Brand voice guardrails', 'Competitive scans', 'Tracking what worked'] },
      { name: 'Customer success',            lessons: ['QBR prep', 'Health scoring inputs', 'Renewal communications', 'Handling tough conversations', 'Escalations'] },
      { name: 'Operations & projects',       lessons: ['Process mapping', 'Automation scoping', 'Risk review', 'Project status updates', 'Documentation from memory'] },
      { name: 'Finance & legal-adjacent',    lessons: ['Contract review (safely)', 'Forecast narratives', 'Expense policies', 'Red flags to escalate', 'Keeping legal in the loop'] },
      { name: 'Confidentiality at work',     lessons: ["Company data: what's OK", "Customer data: what's not OK", 'The paste-into-chatbot problem', "Using your company's AI tools", 'Incident response basics', 'Certification quiz'] },
    ],
  },
  {
    id: 104, code: 'AI·104', title: 'AI Workflow Mastery',
    subtitle: 'Design, ship, and measure an AI workflow your team will actually use.',
    lessons: 40, hours: 2.5, tier: 'paid', suite: 'base', price: 1499, capstone: true,
    modules: [
      { name: 'Identify leverage',           lessons: ['Workflow inventory', 'Sizing impact', 'Choosing a wedge', 'Stakeholder alignment', 'Scoping ruthlessly', 'Red flags: when to walk away', 'The capstone brief'] },
      { name: 'Design the workflow',         lessons: ['Interfaces and handoffs', 'Human-in-the-loop patterns', 'Evals and guardrails', 'Cost modeling', 'Writing the spec', 'Mapping failure modes', 'Review with stakeholders'] },
      { name: 'Build & test',                lessons: ['Tool choice', 'Prompt engineering at depth', 'Testing with real data', 'Iterating prompts systematically', 'Observability basics', 'Security review', 'Dogfooding'] },
      { name: 'Roll out',                    lessons: ['Change management', 'Training your peers', 'Writing the SOP', 'Measuring adoption', 'Handling objections', 'First 30 days'] },
      { name: 'Sustain',                     lessons: ['Monitoring what matters', 'Iteration rituals', 'Vendor hygiene', 'Keeping humans in the loop', 'When to deprecate', 'Compounding wins'] },
      { name: 'Defense & beyond',            lessons: ['Present your workflow', 'Peer review', 'Scaling to the team', 'Scaling across the company', 'Where AI is going', 'Building a lifelong practice', 'Capstone certification'] },
    ],
  },
];

export const PLUS_COURSES: Course[] = [
  {
    id: 201, code: 'CPLT·101', title: 'Copilot 101',
    subtitle: 'Microsoft Copilot from zero. Approachable for anyone at a company using Microsoft 365.',
    lessons: 20, hours: 1, tier: 'paid', suite: 'plus', price: 249,
    modules: [
      { name: "What's Copilot?",              lessons: ['What is Microsoft Copilot?', 'Where Copilot lives: the apps', 'Signing in and getting started', 'Your first conversation with Copilot', 'Copilot vs ChatGPT: when to use which'] },
      { name: 'Copilot in everyday work',     lessons: ['Drafting in Word', 'Triaging Outlook', 'Summarizing Teams meetings', 'Generating PowerPoint', 'Searching across OneDrive'] },
      { name: 'Prompting Copilot well',       lessons: ['Giving Copilot context', 'References and /commands', 'Iterating with Copilot', 'When Copilot beats general AI', "Copilot's real limits"] },
      { name: 'Safe at work',                 lessons: ['Company data rules', 'IT policies and tenant settings', 'What not to paste', 'When to escalate to IT', 'Certification quiz'] },
    ],
  },
  {
    id: 202, code: 'CPLT·EXL', title: 'Copilot + Excel',
    subtitle: 'Copilot inside Excel for data, analysis, and formulas. Assumes Excel basics; teaches Copilot-in-Excel.',
    lessons: 12, hours: 1, tier: 'paid', suite: 'plus', price: 249,
    modules: [
      { name: 'Copilot in Excel basics',      lessons: ['Opening the Copilot pane', 'Plain-English asks', 'Inserting formulas from a sentence', 'Reading AI-generated explanations'] },
      { name: 'Cleaning & analysis',          lessons: ['Normalizing messy data', 'Natural-language filters', 'Pivot tables via Copilot', 'Charts from prompts'] },
      { name: 'Pro moves',                    lessons: ['Combining with Power Query', 'Advanced formulas', 'AI math gotchas + verification', 'Certification quiz'] },
    ],
  },
  {
    id: 203, code: 'GEM·101', title: 'Gemini 101',
    subtitle: 'Google Gemini from zero. Approachable for anyone at a company on Google Workspace.',
    lessons: 20, hours: 1, tier: 'paid', suite: 'plus', price: 249,
    modules: [
      { name: "What's Gemini?",               lessons: ['What is Google Gemini?', 'Where Gemini lives: Workspace + web', 'Free vs Gemini Advanced', 'Your first conversation with Gemini', 'Gemini vs ChatGPT vs Copilot'] },
      { name: 'Gemini in everyday work',      lessons: ['Drafting & triaging Gmail', 'Writing in Google Docs', 'Building decks in Slides', 'Meet notes & summaries', 'Searching across Drive'] },
      { name: 'Prompting Gemini well',        lessons: ['Using @references for files & people', 'Multimodal: images, PDFs, screenshots', 'Iterating: regenerate & compare', 'When Gemini beats general AI', "Gemini's real limits"] },
      { name: 'Safe at work',                 lessons: ['Personal vs Workspace accounts', 'What IT admins can control', 'What not to paste into personal Gemini', 'When to escalate to IT', 'Certification quiz'] },
    ],
  },
  {
    id: 204, code: 'GEM·SHT', title: 'Gemini + Google Sheets',
    subtitle: 'Gemini inside Google Sheets for data, analysis, and formulas. Assumes Sheets basics; teaches Gemini-in-Sheets.',
    lessons: 12, hours: 1, tier: 'paid', suite: 'plus', price: 249,
    modules: [
      { name: 'Gemini in Sheets basics',      lessons: ['Opening the Gemini side panel', 'Plain-English asks', 'Generating tables from a prompt', 'Reading AI-generated explanations'] },
      { name: 'Cleaning & analysis',          lessons: ['Normalizing messy data', 'Natural-language filters & sorts', 'Pivot tables via Gemini', 'Charts from prompts'] },
      { name: 'Pro moves',                    lessons: ['Apps Script with Gemini', 'Advanced formulas & array logic', 'AI math gotchas + verification', 'Certification quiz'] },
    ],
  },
];

export const ALL_COURSES: Course[] = [...BASE_COURSES, ...PLUS_COURSES];

export function findCourse(id: number): Course | undefined {
  return ALL_COURSES.find(c => c.id === id);
}

export function isPaidCourse(id: number): boolean {
  const c = findCourse(id);
  return !!c && c.tier === 'paid';
}
