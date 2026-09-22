import type { Meta, StoryObj } from '@storybook/react';
import { MoreFiltersPanel } from './MoreFiltersPanel';

const meta: Meta<typeof MoreFiltersPanel> = {
  title: 'Agency Portal/MoreFiltersPanel',
  component: MoreFiltersPanel,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '"More Filters" on Agency Ads, measured on live.' } } },
};
export default meta;
type Story = StoryObj<typeof MoreFiltersPanel>;
export const Default: Story = {};
