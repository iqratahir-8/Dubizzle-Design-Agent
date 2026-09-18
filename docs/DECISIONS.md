# Design Decisions & Discoveries

The design system's memory. Each entry records a decision or a discovery, the
**evidence** behind it, and its status — so it isn't re-litigated or re-broken in
a later session. Read this before building; add to it whenever you learn something
the code alone wouldn't tell you.

Format: `D-NNN — title` · date · status · what · evidence.

---

## D-001 — Price colour depends on the card type: LIST = charcoal, GRID = red
**2026-09-11 · adopted · revised 2026-09-14 after measuring grid cards**

> **Revision (2026-09-14):** the charcoal finding below holds for the **list** card (search
> results, 24px desktop / 18px mobile). The **grid** card — home and landing-page rails and
> the similar-ads widget under an ad — renders its price **red** `#e00000` at 18px/700 on
> desktop and mobile (measured on `home.desktop` / `home.mobile` captures). Components:
> `AdListCard` charcoal, `AdCard` red. See `docs/LIVE-MEASUREMENTS.md`.

The main ad-card price renders in charcoal `#23262a` (`--text-primary` / `--gray-06`),
not the brand red. Red stays reserved for action/brand (Post Your Ad, CTAs).

*Evidence:* measured the saved live dubizzle.com.eg pages — main price computes to
`rgb(35,38,42)` at 24px/700 on both motors and properties. The monorepo code says
red (`.priceLabel { color: $adCardPriceColor }` → `$primaryColor` → `$red05` →
`#e00000`), but **live production renders charcoal**, so the code snapshot is behind
production. The `$gray06` in `gridViewStyles.cssm:127` is on `.downpaymentPriceLabel`
(secondary price), not the main price. Goods/normal-category card has no saved live
reference yet — code says red there too; confirm before assuming charcoal.

## D-002 — The listing card is three category anatomies, not one
**2026-09-11 · adopted**

One shell (`.ad-list-card`), three per-vertical bodies, keyed by category:
- **Cars** — price + model chip → title → `mileage • year` (the live `AdCarSubtitle` shows only two fields).
- **Property** — no free-text title; leads with property **type** + `beds • baths • area`, then attribute chips (Completion Status, Ownership).
- **Goods** — price → title → a single condition attribute; no structured specs.

*Evidence:* the product implements this as a shared `AdCard` that branches
`hero` (cars/property/jobs) vs `normal` (goods) at runtime
(`useShowHeroCategoryAdCardDesign`), with per-vertical subtitle atoms
(`ad/adCarSubtitle`, `adPropertySubtitle`, `adJobSubtitle`). A separate `strat`
property card exists for the Bayut/Zameen layout.

## D-003 — The monorepo lags production; live is ground truth
**2026-09-11 · standing rule**

The extracted `dubizzle-maple` snapshot is behind what actually ships (the price
colour is the proof). When code and live disagree, **live wins.** Re-measure the
live page per feature rather than trusting the snapshot.

## D-004 — Method: capture live, measure with headless Chromium
**2026-09-11 · standing method**

Don't trust the monorepo or a screenshot alone. Serve the saved live page and
measure real elements with `getComputedStyle` + `getBoundingClientRect` (Playwright
/ Chromium). That is how every value in COMPONENT-AUDIT.md and REFERENCES.md was
obtained, and it's what caught the price-colour discrepancy. Note: this environment's
network egress to dubizzle.com.eg is blocked, so live pages must be **saved and
uploaded**, then measured locally.

## D-005 — Page templates are generated from live captures
**2026-09-14 · adopted**

Hand-built templates only approximated production, so feature work started with template
fixes. Templates are now frozen captures (`scripts/build-live-templates.mjs`,
`design-kit/templates/live-templates.json`) and are pixel-checked against the live screenshots
(`npm run check:templates`, ~0–3%). New UI is composed on top of them with the component
library. Hand-built `_pages` remain only where no capture exists. Refresh with the
`live-capture` skill after a release.

## D-006 — Two privacy gates on every logged-in capture
**2026-09-14 · adopted after an incident**

React-controlled form fields restored the account's real name and phone after DOM redaction,
so they appeared in screenshots while the saved HTML was clean. Redaction now sets field values
through the native setter + input event, and `visibleLeaks()` refuses any screenshot whose
rendered text or field values still contain the account name or a non-sample phone. Both
`leaks()` (HTML) and `visibleLeaks()` (screen) must pass. Never remove either.


## D-007 — Gradients and frosted glass are real; the blanket ban was a fabrication
**2026-09-17 · adopted · supersedes the gradient/glassmorphism lines in RULES.md §2**

`RULES.md` claimed gradients were limited to the Featured/Elite/Pro badges, and that
`backdrop-filter` "is not used anywhere in dubizzle". Both were wrong. They were written
before the live-capture pipeline existed, by generalising from three gradient tokens I
happened to recognise in the monorepo, plus a generic anti-AI-slop checklist. Nothing was
measured. `check:design` then enforced the invention as an error, so it actively pushed
generated work *away* from production for weeks.

*Evidence:* swept all 124 local captures for computed `background-image: *gradient*` and
`backdrop-filter != none` on rendered elements (>4px).

- **333 gradient instances, ~30 distinct values, in six roles:** status badges (~100),
  photo scrims `rgba(0,0,0,0)→rgba(0,0,0,.4)` (37), rail edge fades (40), the per-vertical
  "Post your ad" CTA band (~50), the "of the Week" ribbon (14), DPV specs-strip depth (3).
- **The CTA band is tinted per vertical:** home `#f7fafe→#e7f1fd`, motors `#e9eaf7`,
  property `270deg #fef3de→#ffe1e1`, mobiles `#e7f1fd` — all with production's odd
  `79.97%` stop.
- **`backdrop-filter`: exactly one component** — the media-type chip ("Video") over a card
  photo, `blur(4px)` + `rgba(23,25,28,.75)`, radius 4px, 63×22, in 13 captures across both
  verticals and both layouts. Systematic, not a stray.

What survived the correction: **every gradient found does a job.** None is atmosphere — no
mesh, no gradient hero, no gradient button, no gradient text. So the rule is now a *role
allowlist* (RULES.md §1) rather than either a blanket ban or blanket permission, with a
token per role (`--cta-band-*`, `--rail-fade-*`, `--surface-depth`, `--glass-chip-bg/-blur`).
`check:design` allows those tokens and still errors on an inline literal gradient or any
other `backdrop-filter`.

**The general lesson, which matters more than the rule:** a constraint in `RULES.md` that
isn't traceable to a measurement is a liability, because the linter turns it into law.
Every remaining ✗ in §2 should be checkable against the captures. Where one isn't, mark it
as judgement rather than stating it as fact about dubizzle.

## D-008 — Gradient, glass, colour and icon rules relaxed into a proposal workflow
**2026-09-17 · adopted · user decision**

Following D-007, the user set the policy for values the system doesn't yet have. The rules
moved from bans to governance:

- **New gradients and new colours are allowed in a design**, but must be logged in
  `docs/PROPOSALS.md` and **raised with the designer before shipping**. `check:design`
  downgraded both from `error` to `warn` so work isn't blocked — which means the warning,
  plus Claude saying so in the response, is now the only gate. Silence is the failure mode.
- **Glassmorphism is an option, not a default.** Added `.glass-panel` / `.glass-panel--dark`
  with `--glass-panel-{bg,bg-dark,border,blur}`. These are **authored, not measured** —
  production still frosts only the media chip. The distinction is recorded in
  `sync-tokens.mjs`, `PROPOSALS.md` and RULES.md §1 so D-007 doesn't repeat in reverse.
- **Icons: Lucide, Font Awesome and Material Symbols are permitted**, resolved by name.
  `design-kit/icons/` stays first — 587 icons that match each other — with the packs as
  named fallbacks for genuine gaps. Font Awesome **Free only** (CC BY 4.0 / SIL OFL 1.1 /
  MIT, attribution required); no Pro licence exists for this repo. Heroicons, Feather,
  Bootstrap Icons, Phosphor and Iconoir stay out: more sources, more mismatch, no gain.
- **Centred marketing heroes and three evenly-weighted card rows are permitted when the
  brief calls for them** — campaign and landing surfaces, not on top of a results grid.

*Why the provenance table in `PROPOSALS.md` matters:* the system now holds values from three
different sources — measured, adopted, proposed. D-007 happened because an unmeasured value
was stated as fact about dubizzle. Keeping the three labelled is what stops that recurring.

## D-009 — Signed out, the DPV's contact and save actions all open the same login modal
**2026-09-17 · discovered while capturing modals**

"Show Phone Number", "Report this ad" and "Save Search" do **not** open their own dialogs for
a signed-out visitor. All three open the identical **"Login into your Dubizzle account"**
modal (Phone · Email · OR · Google · Facebook · "New to Dubizzle? Create an account").
Verified independently in three captures: `dpv-phone.desktop`, `dpv-report.desktop`,
`save-search.desktop`.

Consequences for capture work:

- The login modal is the single most reachable overlay in the product; `login-dialog` is its
  canonical capture. The other three states document **which actions are gated**, which is
  itself product information worth keeping — don't delete them as duplicates.
- The *real* phone-reveal, report and save-search dialogs only exist behind auth, so they
  need `capture:states --account`. Anything assuming they're public is wrong.
- A capture of a signed-out DPV therefore cannot show a seller's phone number. The
  third-party contact scrubbing added alongside this (`scrubContactsPage` /
  `scrubContactsHtml` / `contactLeaks` in `scripts/lib/redact.mjs`) still matters, because
  the signed-in reveal will show one.

*Also found:* the harness's element finder returned viewport coordinates without scrolling,
so any trigger below the fold was "clicked" at an off-screen point and silently hit nothing —
the capture saved a normal-looking page with no overlay. Only the header mega menus escaped
it, because they are always on screen. `runStep` now scrolls the target into view, re-measures,
and throws if it is still unreachable. **A missed interaction must fail loudly; a capture that
silently records the wrong state is worse than no capture.**

## D-010 — A capture must prove the state opened, and the shot must show it
**2026-09-17 · adopted after two false positives**

Two captures were reported "saved" while showing nothing of the sort: `login-dialog.mobile`
was the plain mobile home page, `dpv-gallery.mobile` the plain mobile DPV. Both were caught
only by opening the PNGs by hand. Three rules now:

1. **Finding the trigger is not proof.** The finder matched an element, clicked it, and the
   page never changed. Every state declares `expect` — `{text}` or `{selector}` that exists
   *only* in the open state ("Login into your Dubizzle account", "Most relevant",
   "Searching For", "Full Leather"). No evidence, no capture; the state FAILS.
2. **Counting overlay boxes is too weak as a default.** A mobile DPV has a sticky contact
   bar, a back button and a photo chip — enough absolutely-positioned elements to pass a
   naive check while showing no gallery. Prefer an explicit `expect`.
3. **The screenshot has to show what the HTML contains.** Freezing the DOM resets scroll, so
   a non-overlay state (an expanded details table) screenshotted the top of the page.
   The capture now scrolls the evidence back into view by absolute offset —
   `scrollIntoView` silently does nothing once the frozen document is height-locked — and
   **skips scrolling when the target sits inside a `position: fixed` ancestor**, because
   scrolling to a modal scrolls the page *behind* it and pushes the dialog out of frame.
   Each result line reports `shot at y=…`, so a scroll mismatch is visible in the log
   rather than only by opening every image.

The `absolute` vs `fixed` distinction is load-bearing: the sort menu is `absolute` and moves
with the page, and scrolling to it revealed **all five options** where the frozen shot had
been clipping it to two at the viewport edge. A capture that is merely plausible is the
thing this whole pipeline exists to prevent.

*Also settled here:* mobile web has no photo gallery ("All 15 images are available in the
app"), and "View +5 more" is the **Details expander**, not a photo control — the state is
`dpv-details-expanded`. `dpv-phone` and `login-dialog` are desktop-only: mobile's Call button
dials directly, and mobile signs in from the bottom nav's Account tab.

## D-011 — A real phone number reached disk. Five bugs, and what they have in common
**2026-09-18 · adopted after an incident**

Capturing the agency portal's Agency Management screen wrote a live agent's phone number
into both the saved HTML and the PNG. It was found by opening the screenshot, not by any
check. That file is deleted, as is every capture from the buggy runs. All 141 captures now
scan clean.

**Why the gates were silent.** `PHONE` used `\b` after the country code — but in
`+201154785698` the `0` and `1` are both word characters, so there is no boundary and the
match never fired. Every gate (`scrubContactsPage`, `scrubContactsHtml`, `contactLeaks`,
`visibleLeaks`) depended on that one pattern, so all four agreed the page was clean.

**Why the fixtures missed it.** `fixturizeTables` was written to overwrite cells wholesale
*precisely because* a name is not a pattern — then implemented as detect-and-replace by
accident: it rewrote only the deepest text node per cell. The Agents table stacks name +
phone + WhatsApp handle in one cell, so it replaced the handle and left the real name and
number. It reported "3 cells replaced", which read like success.

Three more found while verifying:

- **Raw-HTML scanning matched markup.** An inline SVG path (`M12 2a10 10 0 1 0 10 10A…`) and
  an App Store id in a URL both look like Egyptian mobiles, so the first re-scan reported a
  leak in 137 of 139 captures — and `scrubContactsHtml` would have *rewritten those digits*,
  silently corrupting every icon it touched. Scrub and leak-check now read rendered text
  only: never attributes, never inside `<svg>`.
- **`\s` let a newline join two numbers.** The dashboard chart's Y axis renders as
  `15000\n10000`, which matched as a phone, so `visibleLeaks` refused to save a clean page
  twice. Separators are now `[ \t-]`.
- **Empty states are not data rows.** An empty state lives in the `tbody` as one cell
  spanning every column; the fixture pass overwrote "Showing 0 Leads" artwork copy with a
  fixture name. A row now counts as data only if it has roughly as many cells as the table
  has headers.

**The common thread:** every one of these came from treating a phone number as "digits with
flexible separators" and trusting a single pattern to be both the scrubber and the judge.
The scrubber and the gate share `PHONE`, so a hole in it disables detection *and* repair at
once, and nothing is left to notice. Three rules follow:

1. **Verify captures by eye.** Four of these bugs produced output that looked correct, and
   two reported success while doing the wrong thing. This is the same lesson as D-010.
2. **Never soften a gate to unblock a capture.** Both gate failures here were false
   positives, and both were fixed by making the pattern *more accurate*, not more permissive.
   A check that cries wolf is a check someone later disables — which is how the real leak
   returns.
3. **Wholesale overwrite beats detection for third-party data.** Where a person's name can
   appear, replace everything in the region rather than what a detector recognises.

## D-012 — dubizzle Pro has no mobile layout
**2026-09-18 · user decision**

The agency portal is desktop-only. Rendering it at 390px yields a squeezed desktop page,
not a mobile design, so capturing it would put a misleading "mobile portal" in the gallery
and invite someone to build against a layout that does not exist.

`DESKTOP_ONLY` in `scripts/capture-account.mjs` holds every `portal-*` screen, and a mobile
run reports them as **skipped** with the reason rather than silently producing nothing. If
dubizzle ships a Pro mobile layout later, remove the screens from that set — don't work
around it.

The eight portal captures are therefore desktop-only by design, not by omission.
