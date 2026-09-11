# Design Rules — dubizzle Egypt

Constraints for generating dubizzle Egypt interfaces. These are not preferences. A value outside these sets is a defect, not a variation.

Read this before generating any screen. Run `npm run check:design <file>` after.

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

### Breakpoints
768px is the real split. `max-width: 768px` = mobile, `min-width: 768px` = desktop. Secondary: 360, 480, 950, 1280.

---

## 2. Forbidden — the AI slop list

Each of these is a tell that a screen was generated rather than designed. None of them appear in dubizzle production.

**Color and surface**
- ✗ Purple, indigo, violet, teal — anywhere, for anything
- ✗ Gradients. The **only** two permitted are `--featured-gradient` (blue, Featured badge) and `--elite-gradient` (gold, Elite badge). No gradient buttons, headers, heroes, or backgrounds.
- ✗ Glassmorphism, `backdrop-filter`, translucent frosted panels
- ✗ Dark mode. dubizzle EG web has none. Do not invent one.
- ✗ Coloured drop shadows, glows, neon

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
- ✗ Lucide, Heroicons, Font Awesome, Material Icons, or any external pack
- ✓ Use `design-kit/icons/` — 587 real icons. If one genuinely doesn't exist, say so rather than substituting.

**Layout**
- ✗ Centered marketing hero with a big headline and a single CTA
- ✗ Three evenly-weighted feature cards in a row
- ✗ Large empty margins "for breathing room" — this is a dense product
- ✗ Full-bleed photography behind text
- ✗ Symmetric, evenly-spaced everything. Real listing grids are ragged because real content is ragged.

**Type**
- ✗ Letter-spaced uppercase headings as decoration (the footer column headings are the one exception)
- ✗ Font sizes above 3.2rem
- ✗ Thin or light weights for body text

---

## 3. Required patterns

**Hierarchy in an ad card** — price is the loudest thing (1.8rem/700, red), then title (1.4rem/600, near-black), then specs (1.2rem/600, gray), then location and time (1.2rem/400, light gray). Four distinct levels. Never flatten them.

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

## 5. Before you call it done

- [ ] Every colour, space, radius, and shadow is a token — no literal hex or off-scale px
- [ ] No gradient except Featured/Elite badges
- [ ] No emoji, no external icon pack
- [ ] Nothing scales or bounces on hover
- [ ] Content reads like real Egyptian listings, with real prices and real place names
- [ ] The densest reasonable layout was chosen, not the airiest
- [ ] It works at 375px and at 1280px
- [ ] `npm run check:design <file>` passes

---

## 6. When the system doesn't cover it

If a pattern genuinely doesn't exist in `design-kit/patterns/` or the component library — **say so explicitly** and propose the closest existing pattern. Do not silently invent a new visual language and present it as dubizzle. An honest "the system has no pattern for this; here is the nearest one" is always better than a plausible-looking fabrication.
