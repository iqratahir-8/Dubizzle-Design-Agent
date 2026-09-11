# Dubizzle Design System

A React + TypeScript component library and design token set for **dubizzle Egypt** — the red-primary, utilitarian visual language behind [dubizzle.com.eg](https://www.dubizzle.com.eg). Built from the live site markup, the `dubizzle-facelift` codebase conventions, and the brand's Figma token export.

Components are styled with **CSS Modules** on top of a shared CSS custom-property token layer, so the same tokens drive every component and can be consumed directly in non-React contexts too.

## Install

```bash
npm install dubizzle-design-system
```

`react` and `react-dom` (>=18) are peer dependencies.

## Usage

Import the token stylesheet once at your app root, then use components like any other React component:

```tsx
import 'dubizzle-design-system/styles.css';
import { Button, AdCard, Pill } from 'dubizzle-design-system';

function Example() {
  return (
    <div>
      <Button variant="primary">Post Your Ad</Button>
      <Pill variant="featured" label="Featured" />
      <AdCard
        title="Modern Apartment with Nile View, Maadi"
        price="EGP 3,200,000"
        location="Maadi, Cairo"
        time="2 hours ago"
        beds={3}
        baths={2}
        area="150 m²"
      />
    </div>
  );
}
```

`Header` and `Footer` reference icon/logo/social SVGs by path rather than bundling them, so consumers can serve them from wherever suits their build. Copy `src/assets/` into your app's public directory and pass the resulting path as `assetPath` (defaults to `/assets`):

```tsx
<Header assetPath="/dubizzle-assets" user={{ name: 'Ahmed H.' }} />
```

## Explore the library

```bash
npm install
npm run dev        # Storybook at http://localhost:6006
npm run build       # bundles the library to dist/
npm run typecheck
```

## What's inside

### Foundations (`src/tokens`)

| Token file | Covers |
|---|---|
| `colors.css` | Red (primary), Gray, Blue, Yellow, Green scales + semantic aliases (`--color-primary`, `--text-secondary`, `--border-focus`, …) |
| `typography.css` | Font families (Proxima Nova / GESS for Arabic), size scale, weights, line-heights, tracking |
| `spacing.css` | 4px-based spacing scale, `--space-0` through `--space-10` |
| `radii.css` | Corner radius scale — inputs/buttons (`--radius-md`), cards (`--radius-lg`), pills (`--radius-pill`) |
| `shadows.css` | Card, card-hover, dropdown, header, search-input shadows |
| `fonts.css` | `@font-face` declarations for Proxima Nova and GESS |

All values are plain CSS custom properties on `:root` — use them straight from `dubizzle-design-system/tokens/colors.css` etc. in a non-React context if needed.

### Components (`src/components`)

| Component | Notes |
|---|---|
| **Button** | primary / secondary / tertiary / ghost variants, 3 sizes, disabled state |
| **Input** | label, placeholder, error state, leading icon slot |
| **Select** | custom dropdown with options list, error state, closes on outside click |
| **Checkbox** | checked / unchecked / disabled |
| **Radio** | selected / unselected / disabled, grouped via shared `name` |
| **Toggle** | on/off switch |
| **Chip** | filter chip, active/inactive |
| **Pill** | status pill — regular, success, featured, error, boosted, live, recent, disabled |
| **ContactButton** | seller contact CTAs — Chat (red), Call (blue), WhatsApp (green) |
| **AdCard** | listing card — grid and compact layouts, Featured/Elite badges, favorite heart, photo count |
| **Tabs** | segmented and underline/line variants |
| **Pagination** | numbered pages with ellipsis and prev/next arrows |
| **Header** | full site header — logged out/in, agency Pro badge, active-vertical states |
| **Footer** | full site footer — About/Dubizzle/Countries/Follow us columns, legal bar |

Every component ships its own `.module.css`, so class names are scoped and won't leak into or clash with a consuming app's styles.

## Brand notes

- **Color:** red-primary (`#E00000`) on a white/light-gray UI. No gradients except Featured/Elite listing badges and the Pro ribbon.
- **Type:** Proxima Nova (LTR), GESS (Arabic/RTL). Base unit is `1rem = 10px`.
- **Motion:** intentionally minimal — background/border-color transitions only, no scale or opacity effects.
- **Voice:** direct, transactional, second-person ("Post your ad"). No emoji in UI copy.

## License

MIT — see [LICENSE](./LICENSE).
