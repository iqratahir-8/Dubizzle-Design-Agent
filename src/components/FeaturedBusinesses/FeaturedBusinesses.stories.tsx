import type { Meta, StoryObj } from '@storybook/react';
import { FeaturedBusinesses } from './FeaturedBusinesses';

const meta: Meta<typeof FeaturedBusinesses> = {
  title: 'Mobile/FeaturedBusinesses',
  component: FeaturedBusinesses,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Featured Businesses scroller on mobile motors and listing pages (dubizzle.com.eg): bordered logo tiles with the business name underneath.' } } },
  args: {
    businesses: [{ name: 'Garage 90' }, { name: 'A Class' }, { name: 'New Star Automotive' }, { name: 'El Ola Cars' }, { name: 'Allam Automotive' }],
  },
  render: (args) => (
    <div style={{ width: 390, background: 'var(--white)', paddingBlock: 16 }}>
      <FeaturedBusinesses {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof FeaturedBusinesses> = {};
