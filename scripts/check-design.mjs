#!/usr/bin/env node
/**
 * Design adherence linter.
 *
 * Rules in a markdown file don't stop slop — models agree with them and then emit
 * `border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.15)` anyway. This checks
 * the artefact instead of trusting the intent.
 *
 * The allowlists are derived from design-kit/tokens/tokens.json, so they follow the
 * monorepo automatically instead of drifting from it.
 *
 *   node scripts/check-design.mjs <file...>
 *   npm run check:design -- design-kit/templates/desktop/*.html
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(ROOT, 'design-kit/tokens/tokens.json'), 'utf8'));

/* ── Allowlists, derived from the generated tokens ─────────────────────────── */

const paletteHexes = new Set(['#fff', '#ffffff', '#000', '#000000', 'transparent', 'currentcolor', 'inherit']);
for (const value of Object.values(tokens.groups.color ?? {})) {
  for (const [hex] of String(value).matchAll(/#[0-9a-f]{3,8}/gi)) paletteHexes.add(hex.toLowerCase());
}

const RADIUS_SCALE = new Set(['0', '0.4rem', '0.6rem', '0.8rem', '1.2rem', '2rem', '50%', '9999px']);
const SPACING_PROP = /\b(padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?\s*:\s*([^;{}]+)/gi;

/* Gradient is allowed by ROLE, via its token — see RULES.md §1. Production renders
   333 gradients across 124 captures and every one has a job, so the old blanket ban
   (three badge tokens only) was wrong and pushed generated work away from live.
   What stays forbidden is a gradient authored inline as decoration. */
const ALLOWED_GRADIENT_HINTS = [
  /--featured-gradient/,
  /--elite-gradient/,
  /--pro-gradient/,
  /--week-gradient/,
  /--overlay-image-fade/,
  /--rail-fade-(start|end)/,
  /--cta-band-(home|motors|property|mobiles)/,
  /--surface-depth/,
  /--app-(promo|icon)-gradient/,
  /featured-ad-accent/,
  /elite-tag-bg/,
  /pro-badge-background/,
  // Gradients inside a mask are geometry, not decoration — the header's concave
  // active-vertical tab is cut with one.
  /(^|[^-\w])(-webkit-)?mask\s*:/,
];

/* ── Rules ────────────────────────────────────────────────────────────────── */

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

const rules = [
  {
    id: 'off-palette-color',
    /* warn, not error: new colour is allowed to enter a design, but it must be
       confirmed with the designer and adopted as a token (docs/PROPOSALS.md)
       rather than silently living as a literal. */
    severity: 'warn',
    test(line) {
      const hits = [];
      for (const [hex] of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        const normalized = hex.toLowerCase();
        if (paletteHexes.has(normalized)) continue;
        hits.push(`${hex}${describeHue(normalized)}`);
      }
      return hits.length
        ? `colour outside the palette: ${hits.join(', ')} — use a token, or if this is a new brand colour, log it in docs/PROPOSALS.md and confirm it with the designer before it ships`
        : null;
    },
  },
  {
    id: 'unregistered-gradient',
    /* warn, not error: a design may introduce a new gradient. It has to be raised
       with the designer and, once finalised, added to the system as a role token
       (docs/PROPOSALS.md) — not left as an inline literal. */
    severity: 'warn',
    test(line, context) {
      if (!/linear-gradient|radial-gradient|conic-gradient/.test(line)) return null;
      if (context.inMaskDeclaration) return null;
      if (ALLOWED_GRADIENT_HINTS.some((re) => re.test(line))) return null;
      return 'gradient not in the system — use its role token if one fits (RULES.md §1), otherwise log it in docs/PROPOSALS.md and confirm it with the designer before it ships';
    },
  },
  {
    /* The codebase is rem-based (1rem = 10px), and production legitimately uses
       half-steps like 0.2/0.6rem for fine component tuning. So the reliable slop
       signal isn't "off the 4px scale" — it's arbitrary px values (13px, 27px)
       appearing where the system speaks rem. */
    id: 'arbitrary-px-spacing',
    severity: 'error',
    test(line) {
      const hits = [];
      for (const m of line.matchAll(SPACING_PROP)) {
        for (const value of m[2].trim().split(/\s+/)) {
          if (/var\(|calc\(/.test(value)) continue;
          const px = value.replace(/;$/, '').toLowerCase().match(/^(-?[\d.]+)px$/);
          // 0/1/2px are border and hairline-offset idioms, not layout spacing.
          if (px && !['0', '1', '2', '-1', '-2'].includes(px[1])) hits.push(`${m[1]}: ${value}`);
        }
      }
      return hits.length ? `arbitrary px spacing: ${[...new Set(hits)].join(', ')} — this system uses rem` : null;
    },
  },
  {
    id: 'off-rhythm-spacing',
    severity: 'warn',
    test(line) {
      const hits = [];
      for (const m of line.matchAll(SPACING_PROP)) {
        for (const value of m[2].trim().split(/\s+/)) {
          if (/var\(|calc\(|auto|%|inherit|initial|unset|px|vh|vw/.test(value)) continue;
          const rem = value.replace(/;$/, '').toLowerCase().match(/^(-?[\d.]+)rem$/);
          if (!rem) continue;
          const steps = Math.abs(parseFloat(rem[1])) * 10;
          if (steps % 2 !== 0) hits.push(`${m[1]}: ${value}`);
        }
      }
      return hits.length
        ? `off-rhythm spacing: ${[...new Set(hits)].join(', ')} — prefer a --space-N token`
        : null;
    },
  },
  {
    id: 'off-scale-radius',
    severity: 'error',
    test(line) {
      const m = line.match(/border-radius\s*:\s*([^;{}]+)/i);
      if (!m) return null;
      const value = m[1].trim().toLowerCase();
      if (/var\(|calc\(|inherit/.test(value)) return null;
      const parts = value.split(/\s+/).filter(Boolean);
      const bad = parts.filter((p) => !RADIUS_SCALE.has(p));
      return bad.length ? `border-radius off-scale: ${bad.join(' ')} — max is 1.2rem (pills/avatars excepted)` : null;
    },
  },
  {
    id: 'authored-shadow',
    severity: 'error',
    test(line) {
      const m = line.match(/box-shadow\s*:\s*([^;{}]+)/i);
      if (!m) return null;
      const value = m[1].trim().toLowerCase();
      if (/var\(|none|inherit/.test(value)) return null;
      return `hand-authored shadow — use --shadow-card / --shadow-card-hover / --shadow-dropdown / --shadow-header`;
    },
  },
  {
    id: 'scale-on-hover',
    severity: 'error',
    test(line) {
      return /transform\s*:\s*[^;]*scale\(/i.test(line)
        ? 'transform: scale() — dubizzle surfaces never grow on hover'
        : null;
    },
  },
  {
    id: 'forbidden-motion',
    severity: 'warn',
    test(line) {
      if (/cubic-bezier\([^)]*\)/.test(line) && !/0\.15s|0\.2s|0\.3s/.test(line)) {
        return 'custom easing — the motion vocabulary is 0.15s colour transitions and the 0.3s tertiary underline';
      }
      return /@keyframes\s+(bounce|float|pulse|wiggle|shimmer|fadeIn|slideIn)/i.test(line)
        ? 'decorative animation — not part of this design language'
        : null;
    },
  },
  {
    id: 'glassmorphism',
    /* Glassmorphism is an available option (RULES.md §1), not a default. The
       measured chip and the opt-in panel both have tokens; a hand-rolled blur
       value is still worth flagging so it gets tokenised. */
    severity: 'warn',
    test: (line) => {
      if (!/backdrop-filter\s*:/i.test(line)) return null;
      // `@supports (backdrop-filter: blur(1px))` is a feature test, not a declaration —
      // it is exactly how the solid fallback is done, so don't flag the guard itself.
      if (/@supports/i.test(line)) return null;
      if (/--glass-(chip|panel)-blur/.test(line)) return null;
      return 'hand-authored blur — use var(--glass-chip-blur) or var(--glass-panel-blur), and pair it with a solid @supports fallback (.glass-panel in patterns.css)';
    },
  },
  {
    id: 'emoji',
    severity: 'error',
    test(line) {
      const m = line.match(EMOJI);
      return m ? `emoji "${m[0]}" — use an icon from design-kit/icons/` : null;
    },
  },
  {
    id: 'external-icons-or-fonts',
    /* warn: brand type still matters, but a non-brand family is a judgement call
       now that icon fonts are permitted. */
    severity: 'warn',
    test(line) {
      /* Lucide, Font Awesome and Google's Material Symbols are permitted sources
         (RULES.md §Iconography, user decision 2026-09-17): name the icon and pull
         it from whichever set has it. dubizzle's own 587 icons come first, because
         they are the brand's and they match each other. The packs below are named
         fallbacks for what the kit genuinely lacks. */
      if (/heroicons?|feather-icons|bootstrap-icons|iconoir|phosphor-icons/i.test(line)) {
        return 'icon pack outside the permitted set — use design-kit/icons/, Lucide, Font Awesome or Material Symbols';
      }
      if (/font-?awesome/i.test(line) && !/fa-(solid|regular|brands|light|thin|duotone)?/i.test(line)) return null;
      if (/font-family\s*:\s*(?!.*(var\(|proxima|gess|inherit|lucide|font ?awesome|material symbols|material icons))/i.test(line)) {
        return 'non-brand font-family for text — body and headings are var(--font-primary) / var(--font-arabic); icon fonts are exempt';
      }
      return null;
    },
  },
  {
    id: 'physical-direction',
    severity: 'warn',
    test(line) {
      const m = line.match(/\b(margin|padding)-(left|right)\s*:\s*([^;{}]+)/i);
      // A zero has no direction, so it can't break RTL.
      if (!m || /^0(px|rem|%)?$/i.test(m[3].trim())) return null;
      return `${m[1]}-${m[2]} breaks RTL — use ${m[1]}-inline-start / -inline-end`;
    },
  },
  {
    /* Icon filenames shift when the monorepo is re-synced. A broken <img src> is
       invisible in HTML — the browser just renders nothing — so catch it here rather
       than letting a template ship with a missing logo. */
    id: 'broken-icon-ref',
    severity: 'error',
    test(line, context) {
      if (!context.fileDir) return null;
      const missing = [];
      for (const [, src] of line.matchAll(/(?:src|href)="([^"]*\/icons\/[^"]+)"/g)) {
        if (!existsSync(resolve(context.fileDir, src))) missing.push(src);
      }
      return missing.length ? `icon file not found: ${missing.join(', ')}` : null;
    },
  },
  {
    id: 'slop-copy',
    severity: 'warn',
    test(line) {
      const words = ['lorem ipsum', 'get started', 'seamless', 'effortless', 'unlock the', 'elevate your', 'john doe', 'product name', 'your journey', 'take your .* to the next level'];
      const hit = words.find((w) => new RegExp(w, 'i').test(line));
      return hit ? `generic copy "${hit}" — use real dubizzle voice and content` : null;
    },
  },
  {
    id: 'fake-currency',
    severity: 'warn',
    test(line) {
      return /\$\s?\d|USD\s?\d|€\s?\d/.test(line) ? 'non-EGP currency — dubizzle Egypt prices are "EGP 3,200,000"' : null;
    },
  },
];

/* ── Runner ───────────────────────────────────────────────────────────────── */

function describeHue(hex) {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  if (full.length < 7) return '';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 0.08) return '';
  let hue;
  if (max === r) hue = ((g - b) / (max - min)) % 6;
  else if (max === g) hue = (b - r) / (max - min) + 2;
  else hue = (r - g) / (max - min) + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  if (hue >= 255 && hue <= 330) return ' (purple/violet — never used)';
  if (hue >= 160 && hue <= 200) return ' (teal/cyan — never used)';
  return '';
}

const files = process.argv.slice(2).filter((f) => !f.startsWith('-'));
if (!files.length) {
  console.error('Usage: node scripts/check-design.mjs <file...>');
  process.exit(2);
}

let errors = 0;
let warnings = 0;

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`  skipped (not found): ${file}`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  // Live templates are frozen production pages, not authored code — the rules don't apply.
  if (text.slice(0, 1200).includes('LIVE TEMPLATE')) continue;
  const lines = text.split('\n');
  const findings = [];

  /* `mask:` values routinely wrap across several lines, and the gradients inside them
     are geometry rather than decoration. Track the open declaration so continuation
     lines inherit that context instead of being judged in isolation. */
  let inMaskDeclaration = false;
  const maskContext = lines.map((line) => {
    const starts = /(^|[^-\w])(-webkit-)?mask\s*:/.test(line);
    const wasOpen = inMaskDeclaration;
    if (starts) inMaskDeclaration = true;
    const applies = wasOpen || starts;
    if (inMaskDeclaration && line.includes(';')) inMaskDeclaration = false;
    return applies;
  });

  lines.forEach((line, i) => {
    // The rules doc and this linter both quote forbidden patterns on purpose.
    if (/check-design|RULES\.md/.test(file)) return;
    // Escape hatch for deliberate exceptions (e.g. the visually-hidden -1px idiom):
    // put `ds-ignore` in a comment on the line or the line above.
    if (/ds-ignore/.test(line) || (i > 0 && /ds-ignore/.test(lines[i - 1]))) return;
    const context = { inMaskDeclaration: maskContext[i], fileDir: dirname(resolve(file)) };
    for (const rule of rules) {
      const message = rule.test(line, context);
      if (message) findings.push({ line: i + 1, rule, message, text: line.trim() });
    }
  });

  if (!findings.length) {
    console.log(`✓ ${relative(ROOT, file)}`);
    continue;
  }

  console.log(`\n${relative(ROOT, file)}`);
  for (const f of findings) {
    const tag = f.rule.severity === 'error' ? 'ERROR' : 'warn ';
    if (f.rule.severity === 'error') errors++;
    else warnings++;
    console.log(`  ${tag} ${String(f.line).padStart(4)}  ${f.message}`);
    console.log(`         ${f.text.slice(0, 100)}`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
