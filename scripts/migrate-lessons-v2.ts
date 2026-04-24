// scripts/migrate-lessons-v2.ts
// Mechanical migration: read -> understand, engage -> apply, quiz -> quiz (unchanged).
// Marks last-of-module lessons with isModuleEnd: true.
// Backs up current lessons.ts before writing.
//
// Usage: npx tsx scripts/migrate-lessons-v2.ts

import fs from 'node:fs';
import path from 'node:path';

const LESSONS_PATH = path.resolve(__dirname, '../src/content/lessons.ts');
const BACKUP_PATH = LESSONS_PATH + '.pre-migration.bak';

function migrateStep(step: any): any {
  switch (step.type) {
    case 'read': {
      const out: any = {
        type: 'understand',
        title: step.title,
        body: step.body,
      };
      if (step.callout) out.analogy = { label: step.callout.label, text: step.callout.text };
      return out;
    }
    case 'engage': {
      return {
        type: 'apply',
        title: step.title,
        scenario: step.prompt,
        options: step.options,
      };
    }
    case 'quiz':
      return step;
    default:
      return step;
  }
}

function main() {
  const src = fs.readFileSync(LESSONS_PATH, 'utf8');
  const match = src.match(/export const LESSONS[^=]*=\s*(\{[\s\S]*\});\s*$/m);
  if (!match) throw new Error('Could not locate LESSONS object');
  const LESSONS = JSON.parse(match[1]);

  fs.writeFileSync(BACKUP_PATH, src);
  console.log(`Backup written: ${BACKUP_PATH}`);

  let migratedSteps = 0;
  let moduleEndCount = 0;
  for (const key of Object.keys(LESSONS)) {
    const lesson = LESSONS[key];
    lesson.steps = lesson.steps.map((s: any) => {
      const before = s.type;
      const out = migrateStep(s);
      if (out.type !== before) migratedSteps++;
      return out;
    });
    if (lesson.lessonIdx === lesson.totalInModule - 1) {
      lesson.isModuleEnd = true;
      moduleEndCount++;
    }
  }

  const preamble = src.slice(0, match.index!).trimEnd();
  const postamble = src.slice(match.index! + match[0].length).trimStart();
  const serialized = JSON.stringify(LESSONS, null, 2);
  const newSrc = `${preamble}\n\nexport const LESSONS: Record<string, Lesson> = ${serialized};\n${postamble ? '\n' + postamble : ''}`;
  fs.writeFileSync(LESSONS_PATH, newSrc);

  console.log(`Migrated ${migratedSteps} steps across ${Object.keys(LESSONS).length} lessons. Module-end flags: ${moduleEndCount}.`);
}

main();
