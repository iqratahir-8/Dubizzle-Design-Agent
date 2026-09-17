import type { Meta, StoryObj } from '@storybook/react';
import { SortBy } from './SortBy';

const meta: Meta<typeof SortBy> = {
  title: 'Components/SortBy',
  component: SortBy,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'The "Sort by: …" trigger above listing results. On desktop it opens a menu; on mobile the same choice lives in the Sort | Save bar and opens a bottom sheet.' } },
  },
  args: { value: 'Newly listed' },
};
export default meta;

type Story = StoryObj<typeof SortBy>;

export const Default: Story = {};
export const PriceLowToHigh: Story = { args: { value: 'Price: low to high' } };
