# Design Rules — dubizzle Egypt

Constraints for generating dubizzle Egypt interfaces. These are not preferences. A value outside these sets is a defect, not a variation.

Read this before generating any screen. Run `npm run check:design <file>` after.

**Also read first, per task:**
- `PRODUCT.md` — who the product serves and what each surface must do (product/business alignment).
- `docs/DECISIONS.md` — decisions & discoveries the code won't tell you (e.g. list-card prices are charcoal, grid-card prices red). Don't re-litigate or re-break these; add to it when you learn something new.
- `docs/REFERENCES.md` — live URLs + measured values per surface (ground truth). Build a page by refreshing its live capture and verifying against its row, not from a blank file.
- After building a component, run the `token-check` skill (tokens, not literals).

---

## 0. The one-paragraph brief

dubizzle Egypt is a **high-density classifieds marketplace**. It is flat, fast, utilitarian, and red-on-white. People come to it to scan a hundred listings and leave. Every pixel serves scanning speed. It is not a SaaS landing page, not a startup homepage, not a dashboard. When in doubt, choose the denser, plainer, more boring option — that is almost always what ships.

---

## 1. Closed value sets

Anything not in these lists is wrong. Use the CSS custom property, never the literal.

### Color
Only the palette. `--red-01…07`, `--gray-00…08`, `--blue-01…09`, `--yellow-01…07`, `--green-01…06`, plus `#fff` / `#000`.

| Role | Token | Value |
|---|---|---|
| Primary / CTA / brand | `--color-primary` | `#e00000` |
| Primary hover | `--color-primary-hover` | `#ba0000` |
| Primary active | `--color-primary-active` | `#930100` |
| Links, info, secondary | `--color-secondary` | `#3a88ef` |
| Body text | `--text-primary` | `#23262a` |
| Secondary text, labels | `--text-secondary` | `#464c55` |
| Placeholder, disabled, meta | `--text-tertiary` | `#919395` |
| Page background | `--surface-page` | `#ffffff` |
| Section background | `--surface-subtle` | `#f6f6f6` |
| Muted background | `--surface-muted` | `#f0f0f0` |
| Borders | `--border-default` | `#e0e0e0` |
| Input borders | `--border-input` | `#dadbdb` |
| Success | `--color-success` | `#059e00` |
| Warning / Featured | `--color-warning` | `#ffba3c` |
| Error | `--color-error` | `#e00000` |

Red means **action or brand**. It is not a decoration. Do not tint backgrounds red for atmosphere.

### Spacing — 4px base
`--space-1` .4 · `--space-2` .8 · `--space-3` 1.2 · `--space-4` 1.6 · `--space-5` 2 · `--space-6` 2.4 · `--space-7` 3.2 · `--space-8` 4 · `--space-9` 4.8 · `--space-10` 6.4 (rem, where 1rem = 10px)

`--space-4` (16px) is the default. There is no 13px, no 18px, no 1.5x anything.

### Radius
`--radius-sm` .4 · `--radius-md` .6 (inputs, buttons) · `--radius-lg` .8 (cards) · `--radius-xl` 1.2 (dropdowns) · `--radius-pill` 2 (pills) · `--radius-full` (circles only)

**Nothing is more rounded than 1.2rem except pills and avatars.** No `rounded-2xl` cards.

### Type
Sizes: `--text-xs` 1.2 · `--text-sm` 1.4 (body default) · `--text-md` 1.6 · `--text-lg` 1.8 · `--text-xl` 2 · `--text-2xl` 2.4 · `--text-3xl` 3.2

Weights: 400 regular · 600 semibold · 700 bold. (100/300/900 exist but are effectively unused — don't reach for them.)

Line height: 1.5 body, 1.2 headings.

Font: `--font-primary` (Proxima Nova) for Latin. `--font-arabic` (GESS) for Arabic. Nothing else — no Inter, no system-ui, no Google Fonts.

### Shadow
`--shadow-card` · `--shadow-card-hover` · `--shadow-dropdown` · `--shadow-header`

All four are near-invisible by design. **Never author a new shadow.** If you find yourself writing `0 10px 30px rgba(0,0,0,0.15)`, you have left the design system.

### Gradient — allowed by role, never by taste

Gradient is part of this system. It was measured, not guessed: **333 rendered
gradients across 124 live captures, in six roles.** Every one does a job. Use the
token for the role; if your gradient isn't one of these, it's decoration and §2
forbids it.

| Role | Token | Where it renders |
|---|---|---|
| Status badges | `--featured-gradient` · `--elite-gradient` · `--pro-gradient` | Featured (blue), Elite (gold), Pro (red→charcoal) |
| "of the Week" ribbon | `--week-gradient` | Car / Property of the Week |
| Photo scrim | `--overlay-image-fade` | Behind slider dots and labels on a card photo |
| Rail edge fade | `--rail-fade-start` · `--rail-fade-end` | Horizontal rails fade their overflow edge rather than clipping |
| "Post your ad" CTA band | `--cta-band-home` · `--cta-band-motors` · `--cta-band-property` · `--cta-band-mobiles` | Under a results grid, tinted per vertical |
| Surface depth | `--surface-depth` | DPV specs strip — a barely-there shade, not a flat fill |
| App promo | `--app-promo-gradient` · `--app-icon-gradient` | Mobile app-download surfaces |

The test is whether removing the gradient loses information. A scrim keeps white
text legible on an unknown photo. An edge fade says the rail scrolls. A badge
gradient distinguishes paid tiers at a glance. A gradient hero says nothing.

### Frosted glass — one measured use, one opt-in

**Measured.** `backdrop-filter` renders in exactly one place on live dubizzle: the
**media-type chip** ("Video") on a card photo — `--glass-chip-bg` + `--glass-chip-blur`,
radius `0.4rem`, 63×22, in 13 captures across both verticals and both layouts. Class:
`.glass-chip`.

**Opt-in.** Glassmorphism is also available as a deliberate choice (user decision,
2026-09-17): `.glass-panel` with `--glass-panel-bg` / `--glass-panel-blur` /
`--glass-panel-border`, plus `.glass-panel--dark`. **These are authored, not measured
— production does not render them.** Don't describe a frosted panel as something
dubizzle does; it's something this system now offers.

Use it where the chip's logic holds: the backdrop is genuinely unknown — over imagery,
over a map, over content scrolling underneath. Over a known solid background it costs
a compositing layer and buys nothing; use a surface token.

Always ship a solid fallback. `.glass-panel` puts the blur behind `@supports` and falls
back to `--surface-page` with a real border, so the panel stays legible where
`backdrop-filter` is unsupported or disabled. Never put text on a frosted surface
without checking contrast against the *worst* backdrop it can land on, not the mock.

### New values — propose, confirm, adopt

A design may introduce a colour or a gradient the system doesn't have. That's allowed,
and it is **not** finished when the design looks right:

1. Use it — don't stall.
2. `check:design` warns and points at `docs/PROPOSALS.md`. Log it there.
3. **Say so in the response.** "This introduces a new colour `#xxxxxx` — it needs
   designer sign-off before it ships." A new value that ships unmentioned is the
   failure mode; see D-007.
4. Once the designer confirms, it becomes a token (`scripts/sync-tokens.mjs` →
   `npm run sync:tokens`), gets a `D-NNN` in `docs/DECISIONS.md`, and moves to
   **Adopted** in `PROPOSALS.md`.

Keep provenance straight: **measured** (verified on live) · **adopted** (designer
authored and confirmed) · **proposed** (in a design, unconfirmed). Never call an
adopted or proposed value something dubizzle "uses".

### Breakpoints
768px is the real split. `max-width: 768px` = mobile, `min-width: 768px` = desktop. Secondary: 360, 480, 950, 1280.

---

## 2. Forbidden — the AI slop list

Each of these is a tell that a screen was generated rather than designed. None of them appear in dubizzle production.

**Color and surface**
- ✗ Purple, indigo, violet, teal — anywhere, for anything
- ⚠ Gradient that isn't one of the §1 roles — mesh backgrounds, gradient buttons, gradient text, gradient borders. Production has 333 gradients and none of them is decorative, so the default answer is still no. But if a design needs a new one, **use it, then raise it**: log it in `docs/PROPOSALS.md` and get the designer's sign-off before it ships. `check:design` warns rather than blocks.
- ⚠ Frosted panels — available as an opt-in (`.glass-panel`, §1), not a default. Reach for it when the backdrop is genuinely unknown; over a known solid background a surface token is better and cheaper.
- ✗ Dark mode. dubizzle EG web has none. Do not invent one.
- ✗ Glows and neon. (Coloured shadow exists in exactly one place — the header's active-vertical tab, which is `ds-ignore`d geometry. Don't author a second.)

**Shape and depth**
- ✗ Border radius above 1.2rem on anything that isn't a pill or avatar
- ✗ Shadows heavier than `--shadow-card-hover`
- ✗ Nested cards — a card inside a card inside a card
- ✗ Decorative borders, double borders, dashed borders

**Motion**
- ✗ `transform: scale()` on hover. Cards do not grow.
- ✗ Bounce, spring, elastic easing
- ✗ Entrance animations, fade-ins, staggered reveals, skeleton shimmer that isn't the real loading card
- ✓ Permitted: `background-color` / `border-color` / `box-shadow` transitions at 0.15s, and the tertiary-button underline at 0.3s. That is the whole motion vocabulary.

**Iconography**
- ✗ Emoji as icons. Ever. Not in UI, not in labels, not in empty states.
- ✓ **`design-kit/icons/` first** — 587 real dubizzle icons, and they match each other.
- ✓ **Then Lucide, Font Awesome, or Google's Material Symbols**, resolved by name: if the
  design asks for an icon the kit doesn't have, take it from whichever pack has it rather
  than shipping a gap. (User decision, 2026-09-17.)
- Keep one pack per screen where you can. Mixing sets is visible — Lucide's 2px stroke on a
  24 grid doesn't sit level with dubizzle's filled set — so if a screen needs three external
  icons, take all three from the same pack and match the optical size.
- **Licences:** Font Awesome **Free only** — Pro is paid and this repo has no licence for it,
  so don't reference a Pro-only glyph. All three external packs need a credit to travel with
  anything that ships them (`ATTRIBUTIONS.md`). The kit's own icons need nothing.
- ✗ Heroicons, Feather, Bootstrap Icons, Phosphor, Iconoir — a fourth and fifth source buys
  nothing and multiplies the mismatch.

**Layout**
- ⚠ Centred marketing hero with a big headline and a single CTA — **permitted when the brief
  calls for one** (user decision, 2026-09-17). It is still wrong for a listings surface, where
  density and scanning win. Use it for campaign, landing and promotional pages, not on top of
  a results grid.
- ⚠ Three evenly-weighted cards in a row — **permitted when the content is genuinely three
  peers** (a value-prop row, a three-step explainer). Don't use it to pad thin content, and
  don't apply it to listings: real ad grids are ragged because real content is ragged.
- ✗ Large empty margins "for breathing room" — this is a dense product
- ✗ Full-bleed photography behind text
- ✗ Symmetric, evenly-spaced everything. Real listing grids are ragged because real content is ragged.

**Type**
- ✗ Letter-spaced uppercase headings as decoration (the footer column headings are the one exception)
- ✗ Font sizes above 3.2rem
- ✗ Thin or light weights for body text

---

## 3. Required patterns

**Hierarchy in an ad card** — price is the loudest thing, then title, then specs, then location and time. Four distinct levels; never flatten them. Exact live values per card and device are in `docs/LIVE-MEASUREMENTS.md` — use `AdCard` / `AdListCard` (or `.ad-card` / `.ad-list-card`) rather than restyling:
- **Grid card** (home and landing rails, similar ads): price 1.8rem/700 **red** `--red-05`, title 1.6rem/400, bold spec line with grey "•", location/time 1.4rem grey `--gray-05`. Flat — no card shadow.
- **List card** (search results): price 2.4rem/700 **charcoal** `--gray-06` (1.8rem on mobile), type + specs, 1.6rem/600 title, attribute chips, contact buttons. Card shadow, 1.2rem radius (0.8rem mobile).

**Buttons** — exactly four variants, no more:
- `primary` — red fill, white text. One per view, for the main action.
- `secondary` — transparent with a red-04 border.
- `tertiary` — text-only with a hover underline.
- `ghost` — blue text, for inline/utility actions.

Heights: 3.2 / 4 / 4.8rem. Never invent a fifth variant or a new size.

**Contact CTAs** are their own component with fixed tinted backgrounds: Chat (red-02), Call (blue-02), WhatsApp (green-02). Don't restyle them.

**Featured and Elite** are overlay badges on the card image, not pills in the content area.

**Density** — desktop search shows 3 cards per row at ≥1280px, 2 at ≥768px, 1 below. Gap is 1.2rem. That is tighter than feels comfortable. Keep it.

**RTL** — layouts flip for Arabic. Use `margin-inline-start` / `padding-inline-end` / `inset-inline-start`, never `left` / `right`.

---

## 4. Content rules

Fake content is the fastest way to make a real design look generated. Use `design-kit/content/` fixtures, or follow these:

- **Prices:** `EGP 3,200,000` — currency prefix, comma separators, no decimals. Never `$`, never `3.2M`.
- **Titles:** written by real sellers — uneven length, sometimes ALL CAPS, sometimes with a phone number or "urgent". e.g. `Apartment for sale in Zamalek 200m fully finished`. Not `Beautiful Modern Apartment`.
- **Locations:** real Egyptian ones — Maadi, Zamalek, Nasr City, Sheikh Zayed, New Cairo, Heliopolis, 6th of October, Alexandria, Mansoura, Sohag.
- **Property specs:** `3 Beds · 2 Baths · 150 m²` — middot separated, `m²` not `sqm`.
- **Time:** relative when recent (`2 hours ago`, `منذ ساعتين`), absolute when older.
- **Categories:** the real ones — Vehicles, Properties, Mobiles & Tablets, Electronics & Appliances, Jobs, Furniture & Decor, Fashion & Beauty, Pets, Kids & Babies, Business & Industrial, Services.
- **Copy voice:** direct, second person, imperative. `Post Your Ad`, `Sell`, `Chat`, `Call`. Never `Get Started`, `Discover`, `Unlock`, `Elevate`, `Seamless`, `Effortless`.
- **No lorem ipsum.** No `Product Name`. No `$99.99`. No `John Doe` — use `Ahmed H.`, `Mona S.`

---

## 4b. Accessibility — what is checked, and what is known broken

Run `npm run check:a11y`. It resolves the palette from the generated tokens, so it cannot
drift from the system it polices.

### Contrast — the palette has real failures

**10 of 24 semantic-colour × surface pairings fail AA for normal text.** These are
production dubizzle values, so they are **not bugs to fix** — they are constraints to
design around, and a product decision if anyone wants them changed (`PRODUCT.md`).

| Token | on white | on `--surface-subtle` | on `--surface-muted` |
|---|---|---|---|
| `--text-primary` #23262a | 15.19 ✓ | ✓ | ✓ |
| `--text-secondary` #464c55 | 8.66 ✓ | ✓ | ✓ |
| `--text-tertiary` #919395 | 3.08 large-only | **2.85 ✗** | **2.71 ✗** |
| `--color-primary` #e00000 | 5.04 ✓ | ✓ | 4.42 large-only |
| `--color-secondary` #3a88ef | 3.53 large-only | 3.27 | 3.10 |
| `--color-success` #059e00 | 3.56 large-only | 3.30 | 3.12 |
| `--color-warning` #ffba3c | **1.70 ✗** | **1.57 ✗** | **1.49 ✗** |

Rules that follow:

- **Never put body text in `--text-tertiary` on a grey surface.** On white it is large-text
  only (≥24px, or ≥18.66px bold). Meta lines like "2 hours ago" are usually 12–14px — on a
  grey card that combination fails.
- **`--color-warning` is never text.** It is the Featured badge's fill. Text on it is charcoal.
- `--color-secondary` and `--color-success` are for large text, icons, and borders — not
  14px body copy.
- **Colour is never the only signal.** A status, an error, or a selected state needs a shape,
  an icon or a label as well.

### Targets, names, structure

- **Touch targets** ≥24×24 CSS px (WCAG 2.2 AA minimum); aim for 44×44 on mobile.
- **Every control has an accessible name.** An icon-only button needs `aria-label`. The
  audit finds 2–14 unnamed controls per template on live captures — don't reproduce that.
- **Headings descend in order.** Live jumps h1 → h3 on every ad-detail page; a new screen
  should not copy that.
- **Every `<img>` has `alt`.** Decorative images get `alt=""` — the attribute must exist.
- **Focus must be visible.** Only 1 of 41 component stylesheets defines a focus style today.
  Any new interactive component ships `:focus-visible`.

Not machine-checkable, still required: keyboard order, screen-reader announcement,
`prefers-reduced-motion`, RTL mirroring. Check them by hand.

---

## 4c. Motion — currently undefined, not "minimal"

`RULES.md` used to assert "colour transitions only, 0.15s". That was never measured — the
same mistake as D-007. The generated tokens contain exactly **two** motion values
(`--banner-animation-speed: 1s`, `--tertiary-button-transition: 0.3s`), and production
plainly has more: mega menus open, carousels rotate, sheets slide up, toasts enter and leave.

**Four timing tokens now exist**, adopted from the design-system export (D-013):
`--ease-standard` `cubic-bezier(0.4, 0, 0.2, 1)` · `--duration-fast` 0.15s ·
`--duration-base` 0.25s · `--skeleton-duration` 1.5s. They are **adopted, not measured** —
credited to a second source that agrees with us on 37 of 38 colours, but not yet verified
against live. Use them in preference to anything invented, and say which they are.

So, until the rest are measured:

- **Reuse an adopted or measured transition, or none at all.** Do not invent a duration or an easing.
- Anything new goes in `docs/PROPOSALS.md` as a motion proposal with the value you used.
- **Always honour `prefers-reduced-motion: reduce`** — no current component does. New ones must.
- Still forbidden regardless: `transform: scale()` on hover, bounce/spring/elastic easing,
  decorative entrance animations, parallax.

Use the `motion-design` skill to measure real values before adding any.

---

## 4d. Imagery and illustration

- **Photography is user content.** Ad photos come from sellers: uneven, sometimes poorly lit,
  often watermarked. Mocks must use the real listing images in the captures, not stock
  photography — polished stock is the fastest way to make a screen look fake.
- **Illustrations now exist** in `design-kit/illustrations/` (11 assets from the design-system
  export, D-013): empty states for credits and ads, the dubizzle Pro logo, portal nav icons,
  credit coins. Use these first. For a state they don't cover, extract from a capture —
  production's style is blue-tinted line work with soft shapes (see the 404 and portal Leads
  empty state). **Don't draw a new style.**
- **Never generate imagery in a brand style that doesn't exist.** If a screen needs an
  illustration the system doesn't have, say so and propose the nearest captured one.
- Avatars are initials on `--red-02` when there is no photo. Logos keep their own colour.

Use the `imagery-illustration` skill.

---

## 4e. Charts and data visualisation — nothing exists

The agency portal renders a line chart (Ads Performance). The design system has **no chart
tokens, no axis styling, no series palette, and no chart components**. Nothing in the
consumer product needed them.

Therefore: **do not invent a chart language.** Measure the portal's chart first
(`chart-data-viz` skill), propose the tokens it implies, get sign-off, then build. A chart
built from guessed colours will not match the one screen that already ships one.

---

## 5. Before you call it done

- [ ] Every colour, space, radius, and shadow is a token — no literal hex or off-scale px
- [ ] Every gradient is a §1 role via its token — or it's logged in `docs/PROPOSALS.md` **and flagged to the user for designer sign-off**
- [ ] Any new colour is likewise tokenised or logged and flagged
- [ ] Frosted surfaces use `.glass-chip` / `.glass-panel` and have a solid `@supports` fallback
- [ ] Icons come from `design-kit/icons/` first; external ones are Lucide / Font Awesome Free / Material Symbols, ideally one pack per screen
- [ ] No emoji anywhere
- [ ] Nothing scales or bounces on hover
- [ ] Content reads like real Egyptian listings, with real prices and real place names
- [ ] The densest reasonable layout was chosen, not the airiest
- [ ] It works at 375px and at 1280px
- [ ] `npm run check:design <file>` passes

---

## 6. When the system doesn't cover it

If a pattern genuinely doesn't exist in `design-kit/patterns/` or the component library — **say so explicitly** and propose the closest existing pattern. Do not silently invent a new visual language and present it as dubizzle. An honest "the system has no pattern for this; here is the nearest one" is always better than a plausible-looking fabrication.
