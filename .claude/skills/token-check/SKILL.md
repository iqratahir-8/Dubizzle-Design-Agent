---
name: token-check
description: >-
  Check and auto-fix a dubizzle Egypt design-system component so every value uses a
  design token instead of a hardcoded literal (hex colour, px, raw radius/shadow,
  non-brand font). Use this WHENEVER you create or edit a component, pattern,
  template, or any CSS / CSS-Module / JSX styling in this design system — run it after
  writing the styles and before calling the work done. Also trigger on: "does this use
  the tokens", "tokenize this", "token adherence", "check my component", a hardcoded
  colour or px value, or any design-token audit. Don't skip it because the change
  "looks small" — a single stray #e00000 or 12px is exactly what this catches.
---

# Token check

## Why this exists

This design system is **extracted from the `dubizzle-maple` monorepo** and only stays
truthful if components reference tokens, not copies of token values. A hardcoded
`#e00000` or `12px` looks fine today and silently drifts the moment the monorepo
re-syncs and the underlying value changes. A rule in `RULES.md` doesn't stop that —
models agree with the rule and then emit the literal anyway. So we check the artefact:
map every raw value back to the token it should be, and prove it with the linter.

The goal is simple: **after this runs, the component has zero hardcoded design values
and the design linter reports 0 errors.**

## What counts as a component here

Anything with style declarations in this repo:
- `src/components/**/*.module.css` and their `*.tsx`
- `src/templates/*.module.css`
- `design-kit/patterns/patterns.css`
- `design-kit/templates/_pages/*.html`, `design-kit/templates/_partials/*.html`
- any CSS you add to a copied live template

**Not in scope:** live-capture templates (`design-kit/templates/{desktop,mobile}/*.html`
starting with `<!-- LIVE TEMPLATE`) and their `_live-css/` files are frozen production
code — the linter skips them. Only what *you* add on top is checked.

**Components with a twin:** `AdCard`, `AdListCard`, `Chip`, `ContactButton`, `Button`,
`Pill`, `Input`, `Select`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Pagination` exist both
as React (`src/components`) and as kit classes (`patterns.css`). Tokenize **both** and run
`npm run check:parity` (Storybook + kit servers running) until `0 differ`.

## Workflow

Run from the repo root.

### 1. Identify the files you just created or edited
Only the styling files matter — the `.module.css` / `patterns.css` / template HTML you
touched. If you edited a `.tsx` with inline styles, include it too.

### 2. Run both checks
```bash
node scripts/check-design.mjs <file...>
node .claude/skills/token-check/scripts/find-hardcoded-colors.mjs <file...>
```
- **`check-design.mjs`** rejects values that are OFF the system: off-palette colours,
  arbitrary `px` spacing, off-scale `border-radius`, hand-authored `box-shadow`,
  non-brand fonts, RTL-breaking directions. Its allowlist derives from
  `design-kit/tokens/tokens.json`, so it follows the monorepo automatically.
- **`find-hardcoded-colors.mjs`** catches the case the linter can't: a colour LITERAL
  that is a valid palette value but should be the **token** — e.g. `background: #e00000`
  where you want `var(--color-primary)`. It prints the exact token for each literal (or
  "off-system" when none matches). This is the heart of "use the token, not a copy of
  its value."

Read every finding from both — each names the offending value and the token to use.

### 3. Replace each raw value with the correct token
For every finding, edit the value to a `var(--token)`. Use the cheat-sheet below for
the mapping. The **full** token vocabulary is `design-kit/tokens/tokens.css` (semantic
API) and `design-kit/tokens/tokens.json` — open it whenever the cheat-sheet doesn't
name the token you need. Pick the token whose value **equals** the literal; if none
equals it, that value is off-system — snap to the nearest token on the scale (spacing,
radius) or the nearest palette hue (colour), and only keep the literal if it is a
deliberate, measured exception (see §5).

Never invent a token name. Never satisfy the linter by deleting the property — the
component still needs the style, expressed as a token.

### 4. Re-run both until clean
```bash
node scripts/check-design.mjs <file...>                                   # until: 0 error(s)
node .claude/skills/token-check/scripts/find-hardcoded-colors.mjs <file...> # until: 0 literal(s)
```
`check-design.mjs` errors must reach **0**, and the colour helper must report **0
literal(s)**. Warnings from the linter (off-rhythm spacing, generic copy) should also be
resolved — snap off-rhythm spacing to a `--space-N`. A warning survives only if it's a
justified measured value.

### 5. Report
State what you tokenized in one short block: each raw value → the token it became, and
confirm `0 errors`.

If a value is **measured from the live site** and no token equals it (this happened with
the live badge gradients and the 16px highlighted-card radius), don't keep the literal —
add a semantic token in `scripts/sync-tokens.mjs` (with a comment naming where production
uses it), run `npm run sync:tokens`, and use the token. Record the measurement in
`docs/LIVE-MEASUREMENTS.md`. Only a true one-off keeps a literal, marked `ds-ignore` with a
reason, and called out in the report.

## Mapping cheat-sheet

Read `design-kit/tokens/tokens.css` for the complete list; these are the common ones.

**Colour** → never a raw hex. Prefer the semantic token, fall back to the palette ramp:
- brand/action red: `--color-primary` (hover `--color-primary-hover`, tint `--color-primary-light`, muted `--color-primary-muted`)
- text: `--text-primary` (#23262a), `--text-secondary` (#464c55), `--text-tertiary` (#919395), `--text-inverse`
- surfaces: `--surface-page`, `--surface-card`, `--surface-muted`, `--surface-subtle`
- borders: `--border-default`, `--border-input`
- status: `--color-success` / `-bg`, `--color-warning` / `-bg`, `--color-error` / `-bg`, `--color-info` / `-bg`
- raw ramps when nothing semantic fits: `--red-0N`, `--gray-0N`, `--blue-0N`, `--green-0N`, `--yellow-0N`
- `#fff`/`#000`/`transparent`/`currentColor` are allowed literals.

**Spacing** (padding / margin / gap) → the rem scale, 1rem = 10px:
`--space-1` 0.4rem · `--space-2` 0.8rem · `--space-3` 1.2rem · `--space-4` 1.6rem ·
`--space-5` 2rem · `--space-6` 2.4rem · `--space-7` 3.2rem · `--space-8` 4rem ·
`--space-9` 4.8rem · `--space-10` 6.4rem. `0`, `1px`, `2px` (hairlines/borders) are fine.

**Radius** → `--radius-sm` 0.4rem (badges, attribute chips, segment chips) ·
`--radius-md` 0.6rem (inputs, buttons, quick/filter chips, contact buttons) ·
`--radius-lg` 0.8rem (grid ad card, mobile list card) · `--radius-xl` 1.2rem (desktop
list card) · `--radius-2xl` 1.6rem (highlighted "of the Week" list card only) ·
`--radius-pill` 2rem · `--radius-full` 9999px. No other literal radius.

**Gradients** → allowed by role, each through its token: `--featured-gradient`,
`--elite-gradient` (charcoal text on it), `--pro-gradient`, `--week-gradient`,
`--overlay-image-fade` (photo scrim), `--rail-fade-start/-end` (rail overflow edge),
`--cta-band-home/-motors/-property/-mobiles` ("Post your ad" band, tinted per vertical),
`--surface-depth` (DPV specs strip), `--app-promo-gradient` / `--app-icon-gradient`.
A literal `linear-gradient(…)` authored inline is an error — see RULES.md §1.

**Frosted glass** → `--glass-chip-bg` + `--glass-chip-blur`, and only on the media-type
chip over a card photo. Any other `backdrop-filter` is an error.

**Overlays** → `--overlay-dark` (photo-count badge), `--overlay-light` (heart button on a photo).

**Shadow** → `--shadow-card`, `--shadow-card-hover`, `--shadow-dropdown`,
`--shadow-header`, `--shadow-control`. Never hand-author a `box-shadow`.

**Typography** → size `--text-xs/sm/md/lg/xl/2xl`; weight `--weight-light/regular/semibold/bold/black`;
line-height `--leading-tight/normal/relaxed`; family `var(--font-primary)` (Proxima Nova)
or `var(--font-arabic)` (GESS). No Google Fonts, no numeric `font-weight` literals.

**RTL** → use `-inline-start` / `-inline-end`, never `-left` / `-right`, for padding/margin.

## Example

Input (a new card rule):
```css
.badge { background: #e00000; padding: 6px 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
```
Linter: off-palette `#e00000`; arbitrary px `6px`,`12px`; off-scale radius `8px`; hand-authored shadow.
Fixed:
```css
.badge { background: var(--color-primary); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); box-shadow: var(--shadow-card); }
```
Re-run → `0 error(s)`. Report: `#e00000→--color-primary, 6px/12px→--space-2/--space-3, 8px→--radius-md, raw shadow→--shadow-card`.
