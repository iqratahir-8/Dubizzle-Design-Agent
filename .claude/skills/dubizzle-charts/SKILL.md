---
name: dubizzle-charts
description: >-
  Rules for using the AntV chart MCP server (bar, line, column, area, pie, radar, sankey,
  funnel, treemap, network and 26 more) inside dubizzle Egypt, and for choosing what
  actually ships. Use whenever a chart, graph, metric visual or dashboard is requested for
  the consumer site or the agency portal, and before sending any data to the chart server.
---

# Charts in dubizzle

Two different jobs, and conflating them is the mistake:

| Job | Tool |
|---|---|
| **Explore** a chart idea, sketch a dashboard, decide which chart type fits | AntV chart MCP (`generate_*` tools) |
| **Ship** a chart in the product | A real component in `src/components/`, dubizzle tokens, matched to the portal's measured chart |

## Before you call a `generate_*` tool: where the data goes

The server **posts your data to a remote endpoint** and returns an image URL. The default
is `https://antv-studio.alipay.com/api/gpt-vis`, operated by Ant Group, configured in
`.mcp.json`.

**Never send real dubizzle data to it.** That means no real lead counts, ad performance,
revenue, credit balances, agent names, customer contacts, or anything from the agency
portal captures. This project deleted a capture and rewrote five redaction bugs (D-011)
to keep a single phone number off disk; posting a leads table to a third-party renderer
undoes that in one call.

Use fixture-shaped numbers for exploration. If real values must be charted, self-host
first: the repo ships a `Dockerfile` and `docker-compose.yaml`, and
`VIS_REQUEST_SERVER` in `.mcp.json` points at your own deployment.

## What the MCP output is, and is not

It returns a **rendered image on a remote URL**. So it is:

- fine for a mock, a thinking aid, a "which chart type is this?" question
- **not** a design-system artefact: it carries AntV's palette and axis styling, not
  dubizzle's, and `RULES.md` 4d forbids generated imagery in a composed or measured surface
- not something to paste into a template, a component, or a landing page

## What ships instead

`RULES.md` 4e: the system has **no chart language**, and production ships exactly one
chart — the agency portal's Ads Performance line chart. Order of work:

1. **Measure the portal chart first** (`chart-data-viz` skill): series colour, line weight,
   area fill, axis labels, gridlines, container. Record in `docs/LIVE-MEASUREMENTS.md`.
2. **Propose the tokens** it implies in `docs/PROPOSALS.md` and get designer sign-off. A
   chart palette is a large new vocabulary; D-007 is what happens when one is assumed.
3. **Choose the rendering library** with `pick-ui-library`. AntV's own React libraries
   (`@ant-design/charts`, G2) are the natural candidates precisely because the portal's
   chart already comes from that family, so matching it is realistic. Adding one is a
   dependency decision with a bundle cost, raised not made silently.
4. **Build the component** with dubizzle tokens, and theme the library rather than
   shipping its defaults.

## Chart choices that are already decided

- **Red is reserved.** `--color-primary` means action or brand. A data series is neither.
  The portal's line is blue; follow it.
- **Never colour-only.** Series need labels, markers or dash patterns too, and must pass
  the contrast rules in `RULES.md` 4b.
- **Table before chart.** The portal's Insights screen conveys trend inside a table
  (`Make · Dubizzle rank · Traffic trend · Demand · inventory`) with no chart at all. For a
  dense classifieds product that is often the right answer.
- **EGP formatting** as production writes it: `EGP 3,190,000`. Axis numbers stay LTR
  inside an RTL layout (`rtl-arabic`).
- No 3D, no donut-with-a-number where a stat card would do, no gradient-filled bars, no
  animated draw-in on a dashboard people check daily.

## Where charts plausibly belong

**Agency portal** (dubizzle Pro), which already has one: Ads Performance over time, leads
by channel, credit consumption, Insights comparisons.

**Consumer side** has none today, and the bar is high. A price-history line on a DPV or a
market-trend strip would be genuinely useful, but each is a new pattern needing product
sign-off, not a chart added because charts are available.
