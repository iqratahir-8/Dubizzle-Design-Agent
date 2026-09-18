---
name: chart-data-viz
description: >-
  Design charts and data visualisation for dubizzle Egypt — performance graphs, trend
  indicators, stat cards, comparison tables. Use when a screen needs a chart, graph, metric,
  sparkline, KPI or dashboard, especially in the agency portal (dubizzle Pro). The system has
  no chart language yet, so this skill measures the one that ships before inventing anything.
---

# Charts and data visualisation

**The design system has no chart language.** No chart tokens, no axis styling, no series
palette, no gridline rules, no chart components. Nothing in the consumer product needed one.

But production **does** ship a chart — the agency portal's **Ads Performance** panel, a line
chart with a date axis. So this is not a blank page: there is exactly one real example, and
anything you build must match it or it will look like a different product bolted on.

## Measure the one that exists, first

```bash
# the captured portal dashboard
open design-kit/reference/live/screens/portal-dashboard.desktop.png
grep -o '<svg[^>]*>' design-kit/reference/live/portal-dashboard.desktop.html | head
```

Pull out, in order:

1. **Series colour** — the line is blue, not brand red. Red means *action* in this system
   (RULES.md §1); a data series is not an action. Measure the exact value and check whether
   it is `--color-secondary` or something new.
2. **Line weight, point markers, area fill** — the captured chart has a soft gradient fill
   under the line. Measure its stops; it may be an existing token.
3. **Axis**: label colour, size, weight, tick spacing, and whether the axis line is drawn.
   Note the Y labels rendered as plain text — that is what made the phone-pattern false
   positive in D-011.
4. **Gridlines** — colour, weight, dashed or solid, horizontal only or both.
5. **Chart container** — padding, radius, border or shadow, the period selector ("Last
   month") and the stat cards above it (Impressions / View / Leads).

Record each as a row in `docs/LIVE-MEASUREMENTS.md`, then propose tokens in
`docs/PROPOSALS.md` for designer sign-off before adding them to `sync-tokens.mjs`. Do not
add a chart token straight into the system — a chart palette is a large new vocabulary and
it is exactly the kind of thing D-007 warns about.

## Designing a new chart

Once the existing one is measured:

- **Reuse the measured vocabulary.** A second chart in a different style is worse than a
  plainer chart in the same one.
- **Red is reserved.** Do not use `--color-primary` for a data series. If a series must read
  as negative, use it only for that meaning and say so.
- **A multi-series palette does not exist.** If a design needs three series, that is a
  proposal requiring sign-off — and it must survive the contrast rules in RULES.md §4b, plus
  be distinguishable without colour (dash pattern, marker shape, direct labels).
- **Never colour-only.** Legends, direct labels or markers must carry the meaning too.
- **Table first, chart second.** dubizzle is dense and tabular — the portal's Insights screen
  (`Make · Dubizzle rank · Traffic trend · Demand · inventory`) conveys trend inside a table
  without a chart at all. That is often the right answer here.
- **No chart chrome for its own sake**: no 3D, no donut with a number in the middle where a
  stat card would do, no gradient-filled bars, no animated draw-in on a dashboard people
  check daily.

## Numbers and formatting

- **EGP always**, formatted as production does: `EGP 3,190,000`. Never `$`, never `3.19M`
  unless live abbreviates.
- Thousands separators as live renders them; check Arabic numerals against the Arabic capture
  (`rtl-arabic` skill).
- Axis numbers stay LTR inside an RTL layout.
- Empty and single-point states need designing too — a chart with one day of data is the
  common case for a new agency.

## Libraries

If a chart is implemented in React, keep the rendering dependency-free or SVG-based where
practical. This library ships no charting dependency today, and adding one is a decision to
raise, not to make silently.

## The rule

There is one chart in dubizzle. Measure it, match it, and route every new value through
`docs/PROPOSALS.md`. Do not invent a data-visualisation language and present it as dubizzle's.
