# Product & Business Context

Why this product exists and who it serves — the anchor for "is this design
product-aligned?". Sections marked **TODO** need real numbers from the product/
business owner; don't invent them. What's filled below is sourced from RULES.md
and the observed product.

## What it is

**dubizzle Egypt (OLX)** — a high-density classifieds marketplace. Flat, fast,
utilitarian, red-on-white. People come to scan a hundred listings and leave. It is
not a SaaS landing page, not a startup homepage, not a dashboard. When in doubt,
choose the denser, plainer, more boring option — that is almost always what ships.

## Who uses it

- **Buyers / seekers** — scanning search results and vertical landing pages, filtering, contacting a seller (Call / WhatsApp / Chat).
- **Sellers** — posting and managing ads (Post Your Ad), upgrading with promotions (Featured, Elite, Car/Property of the Week).
- **Agencies / Pro** — the agency portal and Pro tooling.

## Core jobs (what the UI must make fast)

1. **Scan** many listings quickly — the ad card's hierarchy (price → title/specs → location/time) exists for this. Never flatten it.
2. **Filter** down — the category + location tree with counts, price/attribute filters.
3. **Contact** — the CTA row is the conversion moment.
4. **Post** — the sell flow.

## Verticals (each has its own card anatomy — see DECISIONS.md D-002)

Cars / Motors · Property · Jobs · Goods (general classifieds). The card, filters,
and landing structure differ per vertical.

## Business alignment — **TODO (fill from the business)**

- Primary metric(s) each surface moves — e.g. LPV/DPV, leads, contact rate, post rate: **TODO**
- Monetization levers the design must support — promotions, Pro/agency, ads placement: **TODO**
- Non-negotiable business rules — regulatory disclaimers, verification, safety: partly present (`ctaRegulationDisclaimer`, verified badges) — **confirm scope: TODO**
- Target markets / languages — EG, English + Arabic (RTL is a hard requirement): confirmed. Other markets: **TODO**

## Design principles (from RULES.md — the short version)

- Red means **action or brand**, never decoration. Listing price is charcoal (DECISIONS.md D-001).
- One primary (red) action per view. Density over whitespace. No gradients except the Featured/Elite/Pro badges. No decorative motion.
- RTL-safe always (`-inline-start/-end`, never `-left/-right`).

See `RULES.md` for the full constraint list and the anti-slop rules.
