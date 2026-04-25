#!/usr/bin/env ts-node
/**
 * Generalized merge: pulls every /tmp/truos-*-m*.json file (per-module
 * subagent outputs across all courses) and surgically replaces the
 * matching lesson in src/content/lessons.ts.
 *
 * Usage: npx tsx scripts/merge-all-rewrites.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const LESSONS_PATH = path.join(__dirname, '..', 'src', 'content', 'lessons.ts');

function findModuleFiles(): string[] {
  const tmpDir = '/tmp';
  return fs
    .readdirSync(tmpDir)
    .filter(f => /^truos-.*-m\d+\.json$/.test(f))
    .map(f => path.join(tmpDir, f))
    .sort();
}

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

function loadAll(): { rewrites: Record<string, LessonLike>; sourceFiles: string[] } {
  const merged: Record<string, LessonLike> = {};
  const seenFiles: string[] = [];
  const files = findModuleFiles();
  for (const p of files) {
    const raw = fs.readFileSync(p, 'utf-8');
    let obj: Record<string, LessonLike>;
    try {
      obj = JSON.parse(raw) as Record<string, LessonLike>;
    } catch (e) {
      console.error(`  WARN: invalid JSON in ${p}: ${(e as Error).message}`);
      continue;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (merged[k]) {
        console.error(`  WARN: duplicate key ${k} (was in ${seenFiles.find(f => f) ?? '?'}, now in ${p}) — keeping first`);
        continue;
      }
      merged[k] = v;
    }
    seenFiles.push(p);
  }
  return { rewrites: merged, sourceFiles: seenFiles };
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
  const { rewrites, sourceFiles } = loadAll();
  const keys = Object.keys(rewrites).sort();
  console.log(`Found ${sourceFiles.length} module files, ${keys.length} total rewritten lessons`);
  console.log(`  Source files: ${sourceFiles.map(f => path.basename(f)).join(', ')}`);

  let src = fs.readFileSync(LESSONS_PATH, 'utf-8');
  let merged = 0;
  let skipped = 0;
  for (const key of keys) {
    try {
      src = replaceLessonInSource(src, key, rewrites[key]);
      merged++;
    } catch (e) {
      console.error(`  SKIP ${key}: ${(e as Error).message}`);
      skipped++;
    }
  }
  fs.writeFileSync(LESSONS_PATH, src);
  console.log(`\nMerged ${merged} lessons, skipped ${skipped}`);
  console.log(`Wrote ${LESSONS_PATH}`);
}

main();
