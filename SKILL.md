---
name: dubizzle-egypt-design
description: Design and build dubizzle Egypt interfaces — screens, components, flows, and prototypes — using the real production design tokens, icons, patterns, and page templates. Use whenever the task involves designing or implementing anything for dubizzle Egypt (dubizzle.com.eg), whether a quick mock, a stakeholder prototype, or production React code. Also use when asked to check whether a design follows dubizzle's system.
---

# dubizzle Egypt Design System

Everything here is extracted from the production `dubizzle-maple` monorepo, not invented. Trust it over your instincts about what a marketplace "should" look like.

## Before you generate anything

**Read `RULES.md` first.** It is short and it is binding. It defines the closed value sets (colour, spacing, radius, type, shadow) and lists the AI-slop signatures that never appear in dubizzle production — gradients, glassmorphism, emoji icons, scale-on-hover, centred marketing heroes, fake currency. Most bad output comes from skipping it.

## What's here

| Path | Use it for |
|---|---|
| `RULES.md` | The constraints. Read before generating, check against when done. |
| `design-kit/tokens/tokens.css` | 1,269 production tokens + a small stable semantic API (`--color-primary`, `--space-4`, `--radius-lg`…). Link this in any HTML you produce. |
| `design-kit/tokens/tokens.json` | Same values, machine-readable. |
| `design-kit/patterns/patterns.css` | Header, filter rail, results grid, ad cards, contact CTAs, footer, bottom nav. The shared vocabulary. |
| `design-kit/templates/desktop/` | `home.html`, `search.html`, `ad-detail.html` |
| `design-kit/templates/mobile/` | Same three at 375px, with bottom nav and sticky contact bar |
| `design-kit/icons/` | 587 real icons in 13 folders. `index.html` is a browsable contact sheet; `icons.json` lists every one. |
| `design-kit/content/fixtures.json` | Real EG categories (EN + Arabic), locations, compounds, and listings written like real seller ads. |
| `design-kit/layout/layout.json` | Breakpoints, container widths, grid columns, header heights. |
| `src/` | The React + TypeScript component library (14 components, 3 page templates). |

## How to do the common tasks

**Design a new screen (mock, prototype, or spec)**
1. Read `RULES.md`.
2. Copy the closest file from `design-kit/templates/` — don't start from a blank page.
3. Swap the content using `design-kit/content/fixtures.json`. Real prices, real Egyptian locations, real messy titles.
4. Pick icons from `design-kit/icons/`. Never emoji, never an external pack. If the icon you want doesn't exist, say so.
5. Reuse classes from `patterns.css`. Add new CSS only for genuinely new structure, and only using tokens.
6. Run `npm run check:design -- <your-file>` and fix every error.

**Write production React**
Import from the library rather than re-implementing: `import { Button, AdCard, Header } from 'dubizzle-design-system'`. Page-level examples live in `src/templates/`. Browse everything with `npm run dev` (Storybook).

**Audit an existing design**
Run `npm run check:design -- <files>`. Then check the things a linter can't: is the ad-card hierarchy intact (price > title > specs > meta)? Is the density right? Does the copy sound like dubizzle or like a SaaS landing page?

**Re-sync after a dubizzle release**
```
npm run sync -- "/path/to/dubizzle-maple-master"
```
Regenerates tokens and icons from the monorepo. It fails loudly if an upstream rename broke a semantic alias, and flags icons that would render blank. Then run `npm run check:all`.

## The three things that matter most

1. **Use the tokens.** A literal hex or an off-scale px is a defect, not a variation.
2. **Use real content.** Fake data is the single biggest reason generated screens read as generated.
3. **Choose the denser option.** dubizzle is a high-volume classifieds marketplace — flat, fast, utilitarian, red on white. When torn between airy and dense, dense is correct.

If the system genuinely has no pattern for what's being asked, say so and propose the nearest one. Never invent a new visual language and present it as dubizzle.
