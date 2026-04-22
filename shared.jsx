/* =============================================================
   SHARED — data, small components, icons
   ============================================================= */

// ---------------- Icons (stroke 1.5, Linear-ish) ----------------
const Icon = ({ d, size = 16, stroke = 'currentColor', fill = 'none', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const icons = {
  check: <Icon d={<polyline points="20 6 9 17 4 12"/>} />,
  arrow: <Icon d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>} />,
  arrowLeft: <Icon d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />,
  lock: <Icon d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />,
  play: <Icon d={<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>} />,
  sparkle: <Icon d={<path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/>} fill="currentColor" />,
  flame: <Icon d={<path d="M12 2s4 4 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 1-3 5a6 6 0 1 0 12 0c0-6-6-11-6-11z"/>} />,
  users: <Icon d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
  chart: <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />,
  shield: <Icon d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />,
  dot: <Icon d={<circle cx="12" cy="12" r="4" fill="currentColor"/>} />,
  clock: <Icon d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  book: <Icon d={<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>} />,
  code: <Icon d={<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>} />,
  x: <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />,
  logout: <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />,
  mail: <Icon d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>} />,
  download: <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />,
  external: <Icon d={<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>} />,
  tweak: <Icon d={<><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>} />,
};

// ---------------- Course data ----------------
const COURSES = [
  {
    code: 'AI·101',
    id: 101,
    title: 'Getting Started with AI',
    subtitle: 'No jargon, no coding. What AI actually is, how to talk to it, and how to use it without embarrassing yourself.',
    lessons: 20, hours: 2.5, tier: 'free',
    price: 0,
    modules: [
      { name: 'What is AI, really?',           lessons: ['What is AI?', 'Kinds of AI you\'ll meet', 'What\'s a chatbot?', 'Signing up: picking a tool'] },
      { name: 'How AI thinks (without the math)', lessons: ['It\'s predicting words', 'Trained once, used forever', 'Why AI confidently makes stuff up', 'What AI can\'t do'] },
      { name: 'Your first prompts',            lessons: ['What is a prompt?', 'Clear asks beat clever ones', 'Give it context', 'Iterating: ask again'] },
      { name: 'Staying safe & sane',           lessons: ['What NOT to share', 'Fact-checking AI', 'When NOT to use AI', 'Biases and blind spots'] },
      { name: 'First real tasks',              lessons: ['Write a polished email', 'Summarize a long document', 'Brainstorm options', 'Certification quiz'] },
    ],
  },
  {
    code: 'AI·102',
    id: 102,
    title: 'Practical Prompting',
    subtitle: 'Prompt patterns, research, writing, meetings, data. The daily toolkit.',
    lessons: 24, hours: 4, tier: 'paid',
    price: 49,
    modules: [
      { name: 'Anatomy of a prompt',         lessons: ['Instruction, context, examples, format', 'The role trick', 'Show, don\'t just tell', 'Ask for the format you want'] },
      { name: 'Writing with AI',             lessons: ['Drafting from a blank page', 'Editing and shortening', 'Adjusting tone', 'Keeping your voice'] },
      { name: 'Research with AI',            lessons: ['Search vs AI — what\'s the difference', 'Triangulating sources', 'Synthesis prompts', 'Avoiding plausible-but-wrong'] },
      { name: 'Meetings & email',            lessons: ['Summaries that matter', 'Extracting action items', 'Translating jargon for the room', 'Drafting emails that sound like you'] },
      { name: 'Data & spreadsheets',         lessons: ['Asking AI for formulas', 'Cleaning messy data', 'Pulling insights from numbers', 'Sanity-checking AI\'s math'] },
      { name: 'Iteration as a habit',        lessons: ['Critique the output', 'Chain-of-asks', 'Start fresh vs push through', 'Certification quiz'] },
    ],
  },
  {
    code: 'AI·103',
    id: 103,
    title: 'AI at Work',
    subtitle: 'Sales, marketing, CS, ops, finance — real playbooks for commercial teams.',
    lessons: 32, hours: 6, tier: 'paid',
    price: 89,
    modules: [
      { name: 'Sales motions',              lessons: ['Account research in 3 minutes', 'Pre-call prep', 'Handling objections', 'Crafting follow-ups', 'Keeping your CRM clean', 'What AI can\'t do for sales'] },
      { name: 'Marketing',                  lessons: ['Campaign brief generator', 'Copy variants at scale', 'Brand voice guardrails', 'Competitive scans', 'Tracking what worked'] },
      { name: 'Customer success',           lessons: ['QBR prep', 'Health scoring inputs', 'Renewal communications', 'Handling tough conversations', 'Escalations'] },
      { name: 'Operations & projects',      lessons: ['Process mapping', 'Automation scoping', 'Risk review', 'Project status updates', 'Documentation from memory'] },
      { name: 'Finance & legal-adjacent',   lessons: ['Contract review (safely)', 'Forecast narratives', 'Expense policies', 'Red flags to escalate', 'Keeping legal in the loop'] },
      { name: 'Confidentiality at work',    lessons: ['Company data: what\'s OK', 'Customer data: what\'s not OK', 'The paste-into-chatbot problem', 'Using your company\'s AI tools', 'Incident response basics', 'Certification quiz'] },
    ],
  },
  {
    code: 'AI·104',
    id: 104,
    title: 'The Truos Capstone',
    subtitle: 'Design, ship, and measure an AI workflow your team will actually use.',
    lessons: 40, hours: 10, tier: 'paid',
    price: 249,
    capstone: true,
    modules: [
      { name: 'Identify leverage',          lessons: ['Workflow inventory', 'Sizing impact', 'Choosing a wedge', 'Stakeholder alignment', 'Scoping ruthlessly', 'Red flags: when to walk away', 'The capstone brief'] },
      { name: 'Design the workflow',        lessons: ['Interfaces and handoffs', 'Human-in-the-loop patterns', 'Evals and guardrails', 'Cost modeling', 'Writing the spec', 'Mapping failure modes', 'Review with stakeholders'] },
      { name: 'Build & test',               lessons: ['Tool choice', 'Prompt engineering at depth', 'Testing with real data', 'Iterating prompts systematically', 'Observability basics', 'Security review', 'Dogfooding'] },
      { name: 'Roll out',                   lessons: ['Change management', 'Training your peers', 'Writing the SOP', 'Measuring adoption', 'Handling objections', 'First 30 days'] },
      { name: 'Sustain',                    lessons: ['Monitoring what matters', 'Iteration rituals', 'Vendor hygiene', 'Keeping humans in the loop', 'When to deprecate', 'Compounding wins'] },
      { name: 'Defense & beyond',           lessons: ['Present your workflow', 'Peer review', 'Scaling to the team', 'Scaling across the company', 'Where AI is going', 'Building a lifelong practice', 'Capstone certification'] },
    ],
  },
];

// ---------------- Team data (admin) ----------------
const ORG = {
  name: 'Northwind Commercial',
  plan: 'Team · 48 seats',
  billingEmail: 'billing@northwind.com',
};

const TEAM = [
  { name: 'Avery Chen',      role: 'VP Sales',        email: 'avery@northwind.com',  progress: { 101: 100, 102: 100, 103: 62, 104: 0 },   streak: 14, xp: 2840 },
  { name: 'Marcus Rivera',   role: 'AE',              email: 'marcus@northwind.com', progress: { 101: 100, 102: 88,  103: 20, 104: 0 },   streak: 6,  xp: 1920 },
  { name: 'Priya Shah',      role: 'Marketing Lead',  email: 'priya@northwind.com',  progress: { 101: 100, 102: 100, 103: 100, 104: 35 }, streak: 22, xp: 3410 },
  { name: 'Jonas Weber',     role: 'CSM',             email: 'jonas@northwind.com',  progress: { 101: 100, 102: 44,  103: 0,  104: 0 },   streak: 3,  xp: 960  },
  { name: 'Tasha Okafor',    role: 'Ops',             email: 'tasha@northwind.com',  progress: { 101: 72,  102: 0,   103: 0,  104: 0 },   streak: 0,  xp: 420  },
  { name: 'Ben Lindqvist',   role: 'AE',              email: 'ben@northwind.com',    progress: { 101: 100, 102: 100, 103: 78, 104: 0 },   streak: 9,  xp: 2510 },
  { name: 'Rhea Kapoor',     role: 'RevOps',          email: 'rhea@northwind.com',   progress: { 101: 100, 102: 100, 103: 100, 104: 100 },streak: 41, xp: 4720 },
  { name: 'Diego Sanz',      role: 'SDR',             email: 'diego@northwind.com',  progress: { 101: 100, 102: 22,  103: 0,  104: 0 },   streak: 2,  xp: 780  },
];

// ---------------- Small shared components ----------------
function Logo({ size = 'sm' }) {
  return (
    <div className="logo">
      <div className="logo-mark">T</div>
      <span>Truos</span>
      {size === 'lg' && <span className="mono muted" style={{ fontSize: 11, marginLeft: 8, letterSpacing: '0.08em' }}>ACADEMY</span>}
    </div>
  );
}

function Avatar({ name, size = 28 }) {
  const initials = name.split(' ').map(s => s[0]).slice(0,2).join('');
  const hue = [...name].reduce((a,c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, hsl(${hue} 40% 32%), hsl(${hue+40} 40% 22%))`,
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.38, fontWeight: 600,
      color: '#fff',
      letterSpacing: 0,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

function ProgressRing({ pct, size = 36, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-hover)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

// Helper: get a lesson by courseId/moduleIdx/lessonIdx. Falls back to first lesson of 101.
function getLesson(courseId, moduleIdx, lessonIdx) {
  const key = `${courseId}-${moduleIdx}-${lessonIdx}`;
  const content = (window.LESSON_CONTENT || {})[key];
  if (content) return content;
  const fallback = (window.LESSON_CONTENT || {})['101-0-0'];
  return fallback || null;
}

// Export to window
Object.assign(window, {
  icons, COURSES, ORG, TEAM,
  Logo, Avatar, ProgressRing, getLesson,
});
