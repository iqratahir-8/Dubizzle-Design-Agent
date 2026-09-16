import type { Meta, StoryObj } from '@storybook/react';
import { MegaMenu } from './MegaMenu';
import type { MegaMenuItem } from './MegaMenu';
import menuData from '../../../design-kit/content/mega-menus.json';

/**
 * The real header menu, read off the live site by `node scripts/extract-mega-menus.mjs`:
 * all seven categories, their subcategories and every panel behind them.
 */
const ITEMS: MegaMenuItem[] = menuData.menus.map((menu) => ({
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

const meta: Meta<typeof MegaMenu> = {
  title: 'Components/MegaMenu',
  component: MegaMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `The desktop header category strip and its mega menu, as on dubizzle.com.eg. **Hover a category to open it** — the open one is marked by a 4px underline — then hover a subcategory on the left to swap the panel on the right.

Content is the live menu itself (${menuData.menus.length} categories, ${menuData.menus.reduce((n, m) => n + m.categories.length, 0)} subcategories, read ${menuData._captured}); re-read it with \`node scripts/extract-mega-menus.mjs\`. \`openItem\` pins one open for screenshots and for the design kit.`,
      },
    },
  },
  args: { items: ITEMS },
  render: (args) => (
    <div style={{ width: 1280, margin: '0 auto', minHeight: 460, background: 'var(--white)' }}>
      <MegaMenu {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MegaMenu>;

/** Hover the strip to open a menu, exactly as on live. */
export const Interactive: Story = {};
export const Vehicles: Story = { args: { openItem: 'Vehicles' } };
export const Properties: Story = { args: { openItem: 'Properties' } };
export const Mobiles: Story = { name: 'Mobiles & Tablets', args: { openItem: 'Mobiles & Tablets' } };
export const Jobs: Story = { args: { openItem: 'Jobs' } };
export const Furniture: Story = { name: 'Home & Office Furniture', args: { openItem: 'Home & Office Furniture - Decor' } };
export const Electronics: Story = { name: 'Electronics & Appliances', args: { openItem: 'Electronics & Appliances' } };
export const MoreCategories: Story = { args: { openItem: 'More Categories' } };
