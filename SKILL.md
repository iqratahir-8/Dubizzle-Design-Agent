---
name: dubizzle-egypt-design
description: Design and build dubizzle Egypt interfaces — screens, components, flows, and prototypes — using the real production design tokens, icons, patterns, and page templates. Use whenever the task involves designing or implementing anything for dubizzle Egypt (dubizzle.com.eg), whether a quick mock, a stakeholder prototype, or production React code. Also use when asked to check whether a design follows dubizzle's system.
---

# dubizzle Egypt Design System

Everything here is extracted from the production `dubizzle-maple` monorepo, not invented. Trust it over your instincts about what a marketplace "should" look like.

If the user asks **how to use this** — what they can ask for, which screens exist, how to
re-capture — the answer lives in `docs/HOW-TO-ASK.md`.

## Before you generate anything

**Read `RULES.md` first.** It is short and it is binding. It defines the closed value sets (colour, spacing, radius, type, shadow) and lists the AI-slop signatures that never appear in dubizzle production — emoji icons, scale-on-hover, centred marketing heroes, fake currency, and *decorative* gradient. Note that gradient and frosted glass themselves are real here, allowed by role via tokens (§1) — see `docs/DECISIONS.md` D-007. Most bad output comes from skipping this file.

## What's here

| Path | Use it for |
|---|---|
| `RULES.md` | The constraints. Read before generating, check against when done. |
| `design-kit/tokens/tokens.css` | 1,269 production tokens + a small stable semantic API (`--color-primary`, `--space-4`, `--radius-lg`…). Link this in any HTML you produce. |
| `design-kit/tokens/tokens.json` | Same values, machine-readable. |
| `design-kit/patterns/patterns.css` | Header, filter rail, results grid, ad cards, contact CTAs, footer, bottom nav. The shared vocabulary. |
| `design-kit/templates/` | **Page templates generated from live captures** (`live-templates.json`, `npm run build:templates`) — they render like production (`npm run check:templates` pixel-diffs them). Home, landing pages, search results (cars/property/mobiles), ad detail (car/property/phone), seller page, login, 404; account pages locally. Open `index.html`. Pages without a capture yet (post-ad, favourites, payment, agency portal) are hand-built. |
| `design-kit/templates/_pages/` | Sources for the few hand-built templates that have no live capture yet. |
| `design-kit/reference/live/` | Local, gitignored captures + screenshots (gallery: `reference/live/gallery.html`). Refresh with the `live-capture` skill. |
| `docs/LIVE-MEASUREMENTS.md` | Measured live values for ad cards (grid + list, desktop + mobile) and chips. |
| `design-kit/icons/` | 587 real icons in 13 folders. `index.html` is a browsable contact sheet; `icons.json` lists every one. |
| `design-kit/content/fixtures.json` | Real EG categories (EN + Arabic), locations, compounds, and listings written like real seller ads. |
| `design-kit/layout/layout.json` | Breakpoints, container widths, grid columns, header heights. |
| `src/` | The React + TypeScript component library — incl. `AdCard` (grid) and `AdListCard` (list) with `device="desktop"|"mobile"`, `Chip` variants `quick` / `filter` / `segment`, icons generated from `design-kit/icons`. Storybook: `npm run dev`. |
| `.claude/skills/` | `responsive-design` (mobile-first screens/flows), `live-capture` (re-capture after a release), `token-check` (run after writing any CSS). |

## How to do the common tasks

**Design a new screen (mock, prototype, or spec)**
1. Read `RULES.md`.
2. Copy the closest live template in `design-kit/templates/desktop|mobile/` (gallery with pixel-match % at `templates/index.html`) — never start from a blank page. Mobile or a flow? Use the `responsive-design` skill. No template for the page? Capture it (`live-capture` skill).
3. Swap the content using `design-kit/content/fixtures.json`. Real prices, real Egyptian locations, real messy titles.
4. Pick icons from `design-kit/icons/`. Never emoji, never an external pack. If the icon you want doesn't exist, say so.
5. Build new parts from the components (`AdCard`, `AdListCard`, `Chip`, `ContactButton`…) or their `patterns.css` classes. Add new CSS only for genuinely new structure, and only using tokens.
6. Run the `token-check` skill (or `npm run check:design -- <your-file>`) and fix every error.

**Write production React**
Import from the library rather than re-implementing: `import { Button, AdCard, Header } from 'dubizzle-design-system'`. Whole pages start from a template, not from React: `design-kit/templates/<desktop|mobile>/<page>.html` is a frozen capture of the live page, and Storybook's **Templates → Pages** frames those same files, so the two never disagree. Browse everything with `npm run dev` (Storybook).

**Audit an existing design**
Run `npm run check:design -- <files>`. Then check the things a linter can't: is the ad-card hierarchy intact (price > title > specs > meta)? Is the density right? Does the copy sound like dubizzle or like a SaaS landing page?

**Re-sync after a dubizzle release**
```
npm run sync -- "/path/to/dubizzle-maple-master"
```
Regenerates tokens, icons and hand-built templates from the monorepo. It fails loudly if an upstream rename broke a semantic alias, and flags icons that would render blank. Then run `npm run check:all`. The monorepo lags production, so also refresh the live captures and templates with the `live-capture` skill, and re-measure components if they changed.

## The three things that matter most

1. **Use the tokens.** A literal hex or an off-scale px is a defect, not a variation.
2. **Use real content.** Fake data is the single biggest reason generated screens read as generated.
3. **Choose the denser option.** dubizzle is a high-volume classifieds marketplace — flat, fast, utilitarian, red on white. When torn between airy and dense, dense is correct.

If the system genuinely has no pattern for what's being asked, say so and propose the nearest one. Never invent a new visual language and present it as dubizzle.
