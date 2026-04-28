import org from './org.json';
import departments from './departments.json';
import people from './people.json';
import courses from './courses.json';
import progress from './progress.json';

export type Department = {
  id: string;
  name: string;
  region?: 'Americas' | 'EMEA' | 'APAC' | 'HQ';
  parent?: string;
  seats: number;
};

export type Person = {
  id: string;
  initials: string;
  name?: string;       // present for ~80 named seeds; undefined for anonymized rest
  email?: string;
  title: string;
  departmentId: string;
  managerId?: string;
  seatTier: 'standard' | 'plus';
  startedAt: string;   // ISO
  lastActiveAt?: string;
};

export type Course = {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  lessons: number;
  hours: number;
  tier: 'free' | 'paid' | 'plus';
};

export type Progress = {
  personId: string;
  courseId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'stalled';
  percent: number;
  completedAt?: string;  // ISO
  lastLessonAt?: string;
};

export type Org = {
  id: string;
  name: string;
  seatsContracted: number;
  seatsActive: number;
  plusTier: boolean;
  contractStart: string;
  contractEnd: string;
  monthlySpendUsd: number;
};

export const SEED = {
  org: org as Org,
  departments: departments as Department[],
  people: people as Person[],
  courses: courses as Course[],
  progress: progress as Progress[],
};

export function getDepartment(id: string) {
  return SEED.departments.find((d) => d.id === id);
}

export function getPerson(id: string) {
  return SEED.people.find((p) => p.id === id);
}

export function progressFor(personId: string) {
  return SEED.progress.filter((p) => p.personId === personId);
}

export function activationByDept() {
  return SEED.departments.map((d) => {
    const peeps = SEED.people.filter((p) => p.departmentId === d.id);
    const completedAny = peeps.filter((p) =>
      SEED.progress.some((pr) => pr.personId === p.id && pr.status === 'completed')
    ).length;
    return {
      department: d,
      total: peeps.length,
      activated: completedAny,
      pct: peeps.length === 0 ? 0 : Math.round((completedAny / peeps.length) * 100),
    };
  });
}
