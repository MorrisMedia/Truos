#!/usr/bin/env python3
"""
Generates per-module subagent dispatch prompts for the Merrill rewrite of
non-101 courses. Reads src/content/lessons.ts to enumerate lesson keys and
computes Quick-Recall positions (every 3rd lesson, recalling 2–3 lessons prior).

Output: prints one prompt per stdout block, separated by '---DISPATCH---'.
Each block has 'COURSE_TAG=...' on the first line then the prompt body.
Use these to drive 30 Agent calls.
"""
import re
import json
from collections import defaultdict

src = open('src/content/lessons.ts').read()

# Course metadata
COURSES = {
    '102': {'code': 'AI·102', 'name': 'AI Prompt Mastery',     'tier': '$499',  'suite': 'base', 'audience': 'Learners who finished AI·101 (or equivalent) and want prompting craft at depth. Don\'t re-teach what AI is — they know.'},
    '103': {'code': 'AI·103', 'name': 'Applied AI at Work',    'tier': '$999',  'suite': 'base', 'audience': 'Working professionals applying AI to specific commercial roles — sales, marketing, customer success, ops, finance. Every Apply step should be a real role-specific scenario.'},
    '104': {'code': 'AI·104', 'name': 'AI Workflow Mastery',   'tier': '$1,499','suite': 'base', 'audience': 'Builders. The capstone — design, ship, and defend a real AI workflow inside their team. Lessons should feel like a builder\'s handbook.'},
    '201': {'code': 'CPLT·101','name': 'Copilot 101',          'tier': '$249',  'suite': 'plus', 'audience': 'Anyone at a company using Microsoft 365 with Copilot. Zero Copilot experience assumed. Brand names (Copilot, Word, Outlook, Teams, Loop) are the subject, not banned.'},
    '202': {'code': 'CPLT·EXL','name': 'Copilot + Excel',      'tier': '$249',  'suite': 'plus', 'audience': 'Anyone who uses Excel and has Copilot. Comfortable with Excel basics, new to Copilot inside it.'},
    '203': {'code': 'GEM·101', 'name': 'Gemini 101',           'tier': '$249',  'suite': 'plus', 'audience': 'Anyone at a company using Google Workspace with Gemini. Zero Gemini experience assumed. Brand names (Gemini, Docs, Gmail, Sheets) are the subject, not banned.'},
    '204': {'code': 'GEM·SHT', 'name': 'Gemini + Google Sheets','tier': '$249', 'suite': 'plus', 'audience': 'Anyone who uses Google Sheets and has Gemini. Comfortable with Sheets basics, new to Gemini inside it.'},
}

# Build lesson lookup by course+module
lessons = defaultdict(lambda: defaultdict(list))
for m in re.finditer(r'"(\d+)-(\d+)-(\d+)":', src):
    cid, mi, li = m.group(1), m.group(2), m.group(3)
    if cid in COURSES:
        lessons[cid][int(mi)].append(int(li))

# Extract title for each key
def title_for(cid, mi, li):
    key = f'{cid}-{mi}-{li}'
    idx = src.find(f'"{key}":')
    if idx < 0:
        return '(unknown)'
    title_match = re.search(r'"title":\s*"([^"]+)"', src[idx:idx+2000])
    return title_match.group(1) if title_match else '(no title)'

# Extract module name
def module_name_for(cid, mi):
    # Find any lesson in this module and grab moduleName
    keys = lessons[cid].get(mi, [])
    if not keys:
        return ''
    key = f'{cid}-{mi}-{keys[0]}'
    idx = src.find(f'"{key}":')
    mn = re.search(r'"moduleName":\s*"([^"]+)"', src[idx:idx+2000])
    return mn.group(1) if mn else ''

# Compute global lesson order for each course (flatten module → lesson)
def global_order(cid):
    out = []  # list of (mi, li, key)
    for mi in sorted(lessons[cid].keys()):
        for li in sorted(lessons[cid][mi]):
            out.append((mi, li, f'{cid}-{mi}-{li}'))
    return out

# Compute recall map: every 3rd position recalls position-3
def recall_map(cid):
    order = global_order(cid)
    rmap = {}  # key -> recallingLessonKey
    for pos in range(3, len(order), 3):
        if pos >= len(order):
            break
        recall_key = order[pos][2]
        source_key = order[pos - 3][2]
        rmap[recall_key] = source_key
    return rmap

# Generate prompts
def gen_prompt(cid, mi):
    course = COURSES[cid]
    code = course['code']
    name = course['name']
    suite = course['suite']
    rmap = recall_map(cid)
    keys_in_module = sorted(lessons[cid][mi])
    last_li = max(keys_in_module)
    module_name = module_name_for(cid, mi)
    course_safe = code.replace('·', '_').replace('+', 'plus').lower()
    output_path = f'/tmp/truos-{course_safe}-m{mi}.json'

    # Build lesson list
    lesson_lines = []
    for li in keys_in_module:
        key = f'{cid}-{mi}-{li}'
        title = title_for(cid, mi, li)
        flags = []
        if key in rmap:
            flags.append(f'**recall start** (recallingLessonKey: `{rmap[key]}`)')
        if li == last_li:
            flags.append('**isModuleEnd: true**')
        flags_str = (' — ' + ' · '.join(flags)) if flags else ''
        lesson_lines.append(f'- `{key}` — "{title}"{flags_str}')

    prompt = f'''You are rewriting Truos {code} ({name}) Module {mi} lessons using Merrill's First Principles of Instruction.

## Context

Truos is an AI training platform at truos.ai. {code} is a {course["tier"]} {("base curriculum" if suite == "base" else "Truos+")} course. Every course is being upgraded from a generic 3-step format (read/engage/quiz) to a Merrill 5-phase format (think/understand/learn/apply/quiz) written in a "Feynman in a Stripe doc" voice.

## Audience

{course["audience"]}

## Your assignment — {code} Module {mi}: "{module_name}"

Rewrite these {len(keys_in_module)} lessons (preserve each lesson's existing topic; just rewrite pedagogy + voice):

{chr(10).join(lesson_lines)}

## Required reading (in this exact order)

1. `/home/marshall/Truos/docs/curriculum/_subagent-runbook.md` — full contract. Read every line.
2. `/home/marshall/Truos/docs/curriculum/voice-style-guide.md`
3. `/home/marshall/Truos/docs/curriculum/analogy-bank.md`
4. `/home/marshall/Truos/src/content/lessons.ts` — for reference lessons `101-0-0` and `101-1-2` (canonical voice templates), AND existing content of your {len(keys_in_module)} assigned lessons (preserve their topics).

## What to deliver

Write a file at `{output_path}` containing a JSON object with these {len(keys_in_module)} top-level keys: {", ".join("`" + f"{cid}-{mi}-{li}" + "`" for li in keys_in_module)}. Each value is a full `Lesson` object matching the schema in `src/content/types.ts` exactly.

Keep all `courseId`/`courseCode`/`suite`/`moduleIdx`/`lessonIdx`/`moduleName`/`lessonIndex`/`totalInModule`/`title` fields IDENTICAL to existing values in `lessons.ts`. Only rewrite `steps` and set `isModuleEnd`.

**Do not edit `src/content/lessons.ts` — only write the JSON file.**

## Quality bar

- Exactly one `analogy` per lesson (on the `understand` step). No analogies on other steps.
- Banned words (NEVER use as voice): leverage, utilize, robust, solution, seamless, unlock, supercharge, harness, "power of". Quoting them as anti-patterns is fine.
- Sentences mostly ≤ 18 words.
- Recall-start lessons get a `recall` step at position 0, before `think`.
- Quiz has 4 options. Apply has 3 options. Exactly one `correct: true` per step.
- Vary correct-answer position across the quizzes in your module.
- Match the voice of reference lessons `101-0-0` and `101-1-2` exactly.
- `isModuleEnd: true` on `{cid}-{mi}-{last_li}`. The other lessons: `false`.

## Report format

When done, reply with: "Module {cid}-{mi} draft written. Keys: {", ".join(str(li) for li in keys_in_module)}." Keep it under 60 words.'''

    return course_safe, mi, output_path, prompt

# Emit all prompts as JSON for downstream dispatch
all_prompts = []
for cid in COURSES:
    for mi in sorted(lessons[cid].keys()):
        course_safe, mi_out, output_path, prompt = gen_prompt(cid, mi)
        all_prompts.append({
            'course': cid,
            'module': mi_out,
            'tag': f'{course_safe}-m{mi_out}',
            'output_path': output_path,
            'prompt': prompt,
        })

# Write to file for inspection
with open('/tmp/truos-dispatch-prompts.json', 'w') as f:
    json.dump(all_prompts, f, indent=2)

print(f"Generated {len(all_prompts)} dispatch prompts → /tmp/truos-dispatch-prompts.json")
for p in all_prompts:
    print(f"  {p['tag']:25} → {p['output_path']}")
