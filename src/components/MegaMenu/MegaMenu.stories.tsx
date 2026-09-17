import type { Meta, StoryObj } from '@storybook/react';
import { MegaMenu } from './MegaMenu';
import { MEGA_MENUS, MEGA_MENUS_CAPTURED } from './menus';

const meta: Meta<typeof MegaMenu> = {
  title: 'Components/MegaMenu',
  component: MegaMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `The desktop header category strip and its mega menu, as on dubizzle.com.eg. **Hover a category to open it** — the open one is marked by a 4px underline — then hover a subcategory on the left to swap the panel on the right.

Content is the live menu itself, exported from the library as \`MEGA_MENUS\` (${MEGA_MENUS.length} categories, ${MEGA_MENUS.reduce((n, m) => n + m.categories.length, 0)} subcategories, read ${MEGA_MENUS_CAPTURED}); re-read it with \`node scripts/extract-mega-menus.mjs\`. \`openItem\` pins one open for screenshots and for the design kit.`,
      },
    },
  },
  args: { items: MEGA_MENUS },
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
