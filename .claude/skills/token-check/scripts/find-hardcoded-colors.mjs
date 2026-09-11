#!/usr/bin/env node
/**
 * Finds colour LITERALS in a component that have a token equivalent.
 *
 * The design linter (scripts/check-design.mjs) only rejects colours that are OFF
 * the palette. It stays silent on `background: #e00000` because #e00000 is a valid
 * palette colour — but in a component you should reference `var(--color-primary)`,
 * not a copy of its value, or the component drifts the day the monorepo re-syncs.
 *
 * This scans for hex / rgb() literals whose value matches a token and prints the
 * token to use, preferring the semantic name (--color-primary) over a raw ramp
 * step (--red-05). Run it alongside check-design.mjs when tokenizing a component.
 *
 *   node .claude/skills/token-check/scripts/find-hardcoded-colors.mjs <file...>
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const tokens = JSON.parse(readFileSync(resolve(ROOT, 'design-kit/tokens/tokens.json'), 'utf8'));

// Flatten every group into one name->rawValue map so var() chains resolve across groups.
const raw = {};
for (const group of Object.values(tokens.groups ?? {})) Object.assign(raw, group);

/** Resolve a token value down to a literal hex (following var() chains). */
function resolveHex(value, depth = 0) {
  if (depth > 12 || typeof value !== 'string') return null;
  const v = value.trim();
  const varMatch = v.match(/^var\((--[a-z0-9-]+)(?:\s*,\s*([^)]+))?\)$/i);
  if (varMatch) return resolveHex(raw[varMatch[1]] ?? varMatch[2] ?? '', depth + 1);
  const hex = v.match(/^#[0-9a-f]{3,8}$/i);
  if (hex) return normalizeHex(hex[0]);
  return null;
}

function normalizeHex(hex) {
  let h = hex.toLowerCase().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // drop alpha for matching
  return `#${h}`;
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`;
}

// Prefer a semantic token name over a raw ramp step when several map to the same hex.
function priority(name) {
  if (/^--(color|text|surface|border|shadow)-/.test(name)) return 0;
  if (/^--(red|gray|grey|blue|green|yellow)-\d/.test(name)) return 1;
  return 2;
}

// Build reverse map: normalized hex -> best token name.
const byHex = new Map();
for (const [name, value] of Object.entries(raw)) {
  const hex = resolveHex(value);
  if (!hex) continue;
  const existing = byHex.get(hex);
  if (!existing || priority(name) < priority(existing)) byHex.set(hex, name);
}

const ALLOWED = new Set(['#fff', '#ffffff', '#000', '#000000']);

const files = process.argv.slice(2).filter((f) => !f.startsWith('-'));
if (!files.length) {
  console.error('Usage: node find-hardcoded-colors.mjs <file...>');
  process.exit(2);
}

let total = 0;
for (const file of files) {
  if (!existsSync(file)) { console.error(`  skipped (not found): ${file}`); continue; }
  // Token-definition files legitimately contain raw hexes.
  if (/tokens\.(css|json)$/.test(file)) { console.log(`- ${file}: token definition, skipped`); continue; }

  const lines = readFileSync(file, 'utf8').split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    if (/ds-ignore/.test(line) || (i > 0 && /ds-ignore/.test(lines[i - 1]))) return;

    // Each candidate literal maps to the hex we'll look up.
    const candidates = []; // { lit, hex }
    for (const [hex] of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      const n = normalizeHex(hex);
      if (ALLOWED.has(n) || ALLOWED.has(hex.toLowerCase())) continue;
      candidates.push({ lit: hex, hex: n });
    }
    for (const m of line.matchAll(/rgba?\(([^)]+)\)/gi)) {
      const nums = m[1].split(/[,\s/]+/).map((s) => parseFloat(s)).filter((n) => !Number.isNaN(n));
      if (nums.length < 3) continue;
      // A translucent colour (alpha < 1) has no opaque-token equivalent — suggesting
      // one would silently drop the alpha. Flag it, don't "fix" it.
      const alpha = nums.length >= 4 ? nums[3] : 1;
      candidates.push({ lit: m[0], hex: rgbToHex(nums[0], nums[1], nums[2]), translucent: alpha < 1 });
    }

    for (const { lit, hex, translucent } of candidates) {
      const token = translucent ? null : byHex.get(hex);
      hits.push({ line: i + 1, lit, token, translucent: translucent && !token, text: line.trim() });
    }
  });

  if (!hits.length) { console.log(`✓ ${relative(ROOT, file)} — no hardcoded colours`); continue; }
  console.log(`\n${relative(ROOT, file)}`);
  for (const h of hits) {
    total++;
    const fix = h.token
      ? `→ var(${h.token})`
      : h.translucent
        ? `→ translucent overlay (no opaque token substitute — keep, or add an overlay token)`
        : `→ no exact token (off-system colour — check the palette)`;
    console.log(`  ${String(h.line).padStart(4)}  ${h.lit}  ${fix}`);
    console.log(`        ${h.text.slice(0, 90)}`);
  }
}
console.log(`\n${total} hardcoded colour literal(s) with a token equivalent`);
process.exit(total > 0 ? 1 : 0);
