#!/usr/bin/env ts-node
/**
 * Merges module rewrites from /tmp/truos-module-{1..5}.json into
 * src/content/lessons.ts. Preserves file formatting by doing surgical
 * key-range replacements in the serialized Record.
 *
 * Usage: npx tsx scripts/merge-ai101-rewrites.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const LESSONS_PATH = path.join(__dirname, '..', 'src', 'content', 'lessons.ts');
const MODULES = [1, 2, 3, 4, 5];

interface LessonLike {
  courseId: number;
  courseCode: string;
  suite: 'base' | 'plus';
  moduleIdx: number;
  lessonIdx: number;
  moduleName: string;
  lessonIndex: number;
  totalInModule: number;
  title: string;
  isModuleEnd?: boolean;
  steps: unknown[];
}

function loadModuleRewrites(): Record<string, LessonLike> {
  const merged: Record<string, LessonLike> = {};
  for (const m of MODULES) {
    const p = `/tmp/truos-module-${m}.json`;
    if (!fs.existsSync(p)) {
      throw new Error(`Missing module file: ${p}`);
    }
    const raw = fs.readFileSync(p, 'utf-8');
    const obj = JSON.parse(raw) as Record<string, LessonLike>;
    for (const [k, v] of Object.entries(obj)) {
      if (merged[k]) throw new Error(`Duplicate key across modules: ${k}`);
      merged[k] = v;
    }
  }
  return merged;
}

function serializeLesson(key: string, lesson: LessonLike, indent = '  '): string {
  const json = JSON.stringify(lesson, null, 2);
  const indented = json.split('\n').map((line, i) => (i === 0 ? line : indent + line)).join('\n');
  return `${indent}"${key}": ${indented}`;
}

function replaceLessonInSource(src: string, key: string, lesson: LessonLike): string {
  const keyPattern = `"${key}":`;
  const idx = src.indexOf(keyPattern);
  if (idx === -1) throw new Error(`Key not found in lessons.ts: ${key}`);
  const lineStart = src.lastIndexOf('\n', idx) + 1;
  let depth = 0;
  let inStr = false;
  let strCh = '';
  let end = -1;
  let sawOpenBrace = false;
  for (let i = idx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') {
        i++;
        continue;
      }
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = true;
      strCh = c;
      continue;
    }
    if (c === '{') {
      depth++;
      sawOpenBrace = true;
      continue;
    }
    if (c === '}') {
      depth--;
      if (sawOpenBrace && depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error(`Could not find end of lesson: ${key}`);
  const serialized = serializeLesson(key, lesson, '  ');
  return src.slice(0, lineStart) + serialized + src.slice(end);
}

function main() {
  const rewrites = loadModuleRewrites();
  const keys = Object.keys(rewrites).sort();
  console.log(`Loaded ${keys.length} rewritten lessons: ${keys.join(', ')}`);

  let src = fs.readFileSync(LESSONS_PATH, 'utf-8');
  for (const key of keys) {
    src = replaceLessonInSource(src, key, rewrites[key]);
    console.log(`  merged ${key}`);
  }
  fs.writeFileSync(LESSONS_PATH, src);
  console.log(`\nWrote ${LESSONS_PATH}`);
}

main();
