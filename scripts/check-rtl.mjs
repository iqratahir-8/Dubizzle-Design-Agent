#!/usr/bin/env node
/**
 * RTL guard. dubizzle Egypt ships in Arabic at /ar/ with dir="rtl" (see the *.ar.* captures in
 * design-kit/reference/live), so a component written with physical directions — margin-left,
 * padding-right, left:, text-align: right — keeps its English layout when the page flips and
 * lands the heart, the badge or the chevron on the wrong side.
 *
 * This only catches the static half of the problem: a property that cannot mirror. Rendering
 * each story under dir="rtl" and comparing it with the Arabic capture is the other half, and
 * that belongs in check:live once the Arabic specs exist.
 *
 *   npm run check:rtl            # component CSS + the design kit
 *   npm run check:rtl -- --fix   # print the logical property for each hit, no edits
 *
 * A line that genuinely must not mirror (a left-to-right number, a logo lockup) can opt out
 * with a trailing  / * rtl-ok: reason * /  comment.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** physical → logical. `left`/`right` on their own are only offsets when the rule is positioned. */
const SWAPS = [
  [/(^|[^-\w])margin-left\s*:/, 'margin-inline-start:'],
  [/(^|[^-\w])margin-right\s*:/, 'margin-inline-end:'],
  [/(^|[^-\w])padding-left\s*:/, 'padding-inline-start:'],
  [/(^|[^-\w])padding-right\s*:/, 'padding-inline-end:'],
  [/(^|[^-\w])border-left\s*:/, 'border-inline-start:'],
  [/(^|[^-\w])border-right\s*:/, 'border-inline-end:'],
  [/(^|[^-\w])border-left-\w+\s*:/, 'border-inline-start-*:'],
  [/(^|[^-\w])border-right-\w+\s*:/, 'border-inline-end-*:'],
  [/(^|[^-\w])left\s*:/, 'inset-inline-start:'],
  [/(^|[^-\w])right\s*:/, 'inset-inline-end:'],
  [/text-align\s*:\s*left/, 'text-align: start'],
  [/text-align\s*:\s*right/, 'text-align: end'],
  [/float\s*:\s*(left|right)/, 'float: inline-start / inline-end'],
];

const files = [
  ...globSync('src/components/*/*.module.css', { cwd: ROOT }),
  ...globSync('src/templates/*.module.css', { cwd: ROOT }),
  'design-kit/patterns/patterns.css',
  'src/tokens/base.css',
];

let problems = 0;
for (const file of files) {
  const text = readFileSync(resolve(ROOT, file), 'utf8');
  text.split('\n').forEach((line, i) => {
    if (/rtl-ok/.test(line)) return;
    for (const [pattern, logical] of SWAPS) {
      if (!pattern.test(line)) continue;
      problems++;
      console.log(`  ${relative(ROOT, file)}:${i + 1}  use ${logical}`);
      console.log(`         ${line.trim().slice(0, 100)}`);
      break;
    }
  });
}

console.log(
  problems === 0
    ? '\nNo physical directions — every rule mirrors in Arabic.'
    : `\n${problems} rule(s) that will not mirror in Arabic. Swap them, or add /* rtl-ok: why */.`,
);
process.exit(problems ? 1 : 0);
