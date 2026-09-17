import type { MegaMenuItem } from './MegaMenu';
import data from '../../../design-kit/content/mega-menus.json';

/**
 * The live header menu: all seven categories, their subcategories and the panel behind each.
 * Read off dubizzle.com.eg by `node scripts/extract-mega-menus.mjs` — a capture only ever shows
 * one panel at a time, so the content comes from there rather than from a screenshot.
 * Re-run that script after a release; the date it was read is `MEGA_MENUS_CAPTURED`.
 */
export const MEGA_MENUS: MegaMenuItem[] = data.menus.map((menu) => ({
  label: menu.label,
  categories: menu.categories.map((category) => ({
    label: category.label,
    subtitle: category.subtitle ?? undefined,
    href: category.href ?? undefined,
    panel: category.panel
      ? {
          title: category.panel.title ?? category.label,
          seeAllLabel: 'See All',
          seeAllHref: category.panel.seeAllHref ?? undefined,
          columns: category.panel.columns as 1 | 2,
          links: category.panel.links.map((link) => ({
            label: link.label,
            href: link.href ?? undefined,
            chevron: link.chevron,
          })),
        }
      : undefined,
  })),
}));

export const MEGA_MENUS_CAPTURED: string = data._captured;
