import type { Meta, StoryObj } from '@storybook/react';
import { LocationDropdown } from './LocationDropdown';

const meta: Meta<typeof LocationDropdown> = {
  title: 'Components/LocationDropdown',
  component: LocationDropdown,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The panel under the header\'s location field on dubizzle.com.eg: its own search field, "Use current location" in blue, then "See ads in all Egypt" and the governorates, each opening a further level. 303px wide, 4px radius, on the two-part shadow live uses for header overlays.',
      },
    },
  },
  render: (args) => (
    <div style={{ padding: 24, background: 'var(--gray-00)', minHeight: 520 }}>
      <LocationDropdown {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof LocationDropdown> = {};
