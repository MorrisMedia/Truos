// scripts/shuffle-quiz-options.ts
// One-pass script that shuffles `options` arrays in engage/quiz/apply steps
// across every lesson. Seed-deterministic per lesson+step so the same lesson
// shuffled twice produces the same output.
//
// Usage: npx tsx scripts/shuffle-quiz-options.ts

import fs from 'node:fs';
import path from 'node:path';

const LESSONS_PATH = path.resolve(__dirname, '../src/content/lessons.ts');
const BACKUP_PATH = LESSONS_PATH + '.pre-shuffle.bak';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function main() {
  const src = fs.readFileSync(LESSONS_PATH, 'utf8');
  const match = src.match(/export const LESSONS[^=]*=\s*(\{[\s\S]*\});\s*$/m);
  if (!match) throw new Error('Could not locate LESSONS object in lessons.ts');
  const LESSONS = JSON.parse(match[1]);

  fs.writeFileSync(BACKUP_PATH, src);
  console.log(`Backup written: ${BACKUP_PATH}`);

  let shuffledCount = 0;
  for (const key of Object.keys(LESSONS)) {
    const lesson = LESSONS[key];
    for (let si = 0; si < lesson.steps.length; si++) {
      const step = lesson.steps[si];
      if ((step.type === 'engage' || step.type === 'quiz' || step.type === 'apply') && Array.isArray(step.options)) {
        const seed = seedFromString(`${key}:${si}:${step.type}`);
        const rng = mulberry32(seed);
        step.options = shuffle(step.options, rng);
        shuffledCount++;
      }
    }
  }

  const preamble = src.slice(0, match.index!).trimEnd();
  const postamble = src.slice(match.index! + match[0].length).trimStart();
  const serialized = JSON.stringify(LESSONS, null, 2);
  const newSrc = `${preamble}\n\nexport const LESSONS: Record<string, Lesson> = ${serialized};\n${postamble ? '\n' + postamble : ''}`;
  fs.writeFileSync(LESSONS_PATH, newSrc);

  console.log(`Shuffled ${shuffledCount} option arrays across ${Object.keys(LESSONS).length} lessons.`);
}

main();
