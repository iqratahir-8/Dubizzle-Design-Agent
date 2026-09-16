import type { Meta, StoryObj } from '@storybook/react';
import { DiscoverTabs } from './DiscoverTabs';

const meta: Meta<typeof DiscoverTabs> = {
  title: 'Mobile/DiscoverTabs',
  component: DiscoverTabs,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '"Discover Listings" tabs on the mobile home page (dubizzle.com.eg). The active tab has a 2px red underline; each tab carries a subtitle and an optional red badge.' } } },
  args: {
    tabs: [
      { label: 'For You', subtitle: 'Curated just for you', badge: 'New' },
      { label: 'Recommended', subtitle: 'Handpicked categories' },
    ],
  },
  render: (args) => (
    <div style={{ width: 390, background: 'var(--white)' }}>
      <DiscoverTabs {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof DiscoverTabs> = {};
