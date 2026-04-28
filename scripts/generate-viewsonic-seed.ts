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
  seatsActive: 1447,
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
