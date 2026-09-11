# Live Reference Registry

Ground truth for building pages and components. **We do not archive full template
HTML** — saved pages are 16MB and stale the moment they're captured. Instead this
registry records, per surface, the **live URL**, when it was last verified, and the
handful of **measured values** that matter. To build or update a surface: refresh
the live capture, re-measure, build from tokens/patterns, update the row.

> Capturing live: this environment can't reach dubizzle.com.eg (egress blocked), so
> save the live page (browser → Save Page As → Complete HTML) and upload it; it's
> measured locally with headless Chromium. See DECISIONS.md D-004.

## Pages

| Surface | Live URL (confirm) | Last verified | Key measured values |
|---|---|---|---|
| Motors landing | dubizzle.com.eg → Vehicles / Cars for Sale | 2026-09-11 | h1 "Cars for Sale in Egypt"; 12,864 ads; rail 304px `#fef5f5`; segmented All/New/Used; Featured Businesses strip; price charcoal `#23262a` 24px/700 |
| Properties landing | dubizzle.com.eg → Properties for Sale & Rent | 2026-09-11 | h1 "Properties for Sale & Rent in Egypt"; leads with a Location panel (no business strip, no segmented); Price range in rail; price charcoal `#23262a` |
| Home | dubizzle.com.eg (EG home) | 2026-09-11 | category **directory**, not a listings feed — 12-category grid, no ad cards; header 3 rows (gray 68px, white 76px, category strip 73px) |
| Goods / general search | — | **not captured** | needed to finalize the goods card (D-001, D-002) |

## Measured header values (from live)

Post Your Ad 130×40 `#e00000` r6 · Search button 111×48 `#23262a` r`0 6 6 0` ·
Location select 303×48 · Count pill `#fbe0e0` 14/700 r4 · Save Search 140×46 white
`1px #e0e0e0` r6 · Categories card 304 wide `#fef5f5` r8 pad16 · Segmented option
109×37 white `1px #dadbdb` r4, active `--color-secondary-light`.

## Design inspiration / competitors

Links only — what to emulate or avoid. (Add as you find them.)

- _dubizzle.com.eg live — the primary reference; always wins over the monorepo._
- _OLX / other Dubizzle verticals — TODO: add specific patterns worth borrowing._

## Instant design-kit start

The static kit regenerates from tokens + patterns — no archived HTML needed:

```bash
npm run kit              # browsable design system at :4321
npm run build:templates  # regenerate the page scaffolds from _partials + _pages
```

Build a new page by copying the nearest `_pages/*.html` scaffold, then verifying it
against the live row above — not from a blank file.
