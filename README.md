# Dubizzle Egypt Design System

Design tokens, icons, patterns, page templates, and a React component library for **dubizzle Egypt** — all extracted from the production `dubizzle-maple` monorepo rather than hand-transcribed, and regenerable when a new release ships.

It serves two consumers from one source of truth:

- **Engineers** — a React + TypeScript component library styled with CSS Modules.
- **Designers and AI agents** — a standalone kit of tokens, icons, patterns, real content, and copy-ready page templates, governed by a set of enforced design rules.

**Working with Claude on this?** `docs/HOW-TO-ASK.md` lists every screen you can ask for by name
and what phrasing gets what.

## Quick start

```bash
npm install
npm run dev     # Storybook — components, tokens, page templates
npm run kit     # static design kit at http://localhost:4321
```

## Layout

```
RULES.md                   Design constraints + the anti-slop list. Read this first.
SKILL.md                   Entry point when this is used as an agent skill.

design-kit/                Standalone, no build step
├── tokens/                tokens.css (1,269 production tokens + semantic API), tokens.json
├── patterns/              patterns.css — header, filter rail, results grid, cards, footer
├── templates/
│   ├── _partials/         shared chrome (header, footer, bottom nav)
│   ├── _pages/            per-page bodies + directives — edit these
│   ├── desktop/           12 generated pages
│   └── mobile/            11 generated pages
├── icons/                 587 icons in 13 categories + browsable index.html
├── content/               fixtures.json — real EG categories, locations, listings
└── layout/                layout.json — breakpoints, grid, container widths

src/                       React + TypeScript library
├── components/            14 components, each with a scoped .module.css
├── templates/             LiveTemplate — frames design-kit/templates in Storybook
├── tokens/                generated.css (from the monorepo) + fonts + reset
└── assets/                fonts, logos, icons

scripts/
├── sync-tokens.mjs        Re-extract tokens from the monorepo
├── sync-icons.mjs         Re-extract and organise icons
└── check-design.mjs       Design adherence linter
```

## Using the component library

```tsx
import 'dubizzle-design-system/styles.css';
import { Button, AdCard, Pill, AdListCard } from 'dubizzle-design-system';

<Button variant="primary">Post Your Ad</Button>

<AdCard
  title="Apartment for sale in Zamalek 200m fully finished"
  price="EGP 8,500,000"
  location="Zamalek, Cairo"
  time="2 hours ago"
  beds={3} baths={2} area="150 m²"
  featured
/>
```

Components: Button, Input, Select, Checkbox, Radio, Toggle, Chip, Pill, ContactButton, AdCard, Tabs, Pagination, Header, Footer.

`Header` and `Footer` reference icons by path rather than bundling them — copy `src/assets/` into your public directory and pass `assetPath`.

## Using the design kit

For mocks, prototypes, and agent-generated screens, work in plain HTML:

```html
<link rel="stylesheet" href="design-kit/tokens/tokens.css">
<link rel="stylesheet" href="design-kit/patterns/patterns.css">
```

Then copy the closest of the 23 files in `design-kit/templates/` (see `templates/index.html` for the gallery) and swap the content using `design-kit/content/fixtures.json`. Don't start from a blank page.

## Keeping it in sync

Everything derived from the monorepo is generated, so a new dubizzle release is a re-run, not a rewrite:

```bash
npm run sync -- "/path/to/dubizzle-maple-master"
npm run check:all
```

`sync-tokens` walks the `@import` chain (`strat → horizontal → dubizzle-facelift → dubizzle-eg`), resolves every `$variable`, and emits both the full production vocabulary and a small stable semantic API that components and templates target. If an upstream rename breaks an alias, the sync fails loudly rather than emitting a dead variable.

`build-templates` regenerates every page from `_partials/` + `_pages/`, so a header change is one edit rather than twenty. Output stays standalone HTML you can copy anywhere.

`sync-icons` resolves icons by package precedence the way `@app` does — `dubizzle-eg` and `dubizzle-facelift` wholesale, plus only the `horizontal`/`strat` icons that EG-reachable source actually imports. It repairs missing `xmlns` declarations (42 of them, which webpack's inlining hides but `<img src>` does not) and flags `<symbol>`-wrapped files that render blank.

Point it at a different monorepo path any time, or edit `design-sync.config.json`.

## Enforcing the rules

```bash
npm run check:design -- design-kit/templates/desktop/search.html
npm run check:all
```

The linter derives its palette allowlist from the generated tokens, so it can't drift from the system it's policing. It catches off-palette colour, gradients authored inline rather than through their role token, arbitrary `px` in a rem-based system, over-large radii, hand-authored shadows, `transform: scale()` on hover, `backdrop-filter` outside the one component that uses it, emoji, external icon packs and fonts, RTL-breaking physical directions, broken icon references, generic AI copy, and non-EGP currency.

Deliberate exceptions carry a `ds-ignore` comment on the line — for example the header's concave active-vertical tab, whose elliptical radius is load-bearing geometry.

## Brand notes

Red-primary (`#E00000`) on white and light gray. Proxima Nova for Latin, GESS for Arabic. `1rem = 10px`. Gradient is used, but only structurally — badges, photo scrims, rail edge fades, the per-vertical CTA band — never as atmosphere. Minimal motion — colour transitions only, nothing scales or bounces. Dense and utilitarian: desktop search is three cards per row with a 1.2rem gap.

## License

MIT — see [LICENSE](./LICENSE).
