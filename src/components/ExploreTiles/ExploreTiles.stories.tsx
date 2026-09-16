import type { Meta, StoryObj } from '@storybook/react';
import { ExploreTiles } from './ExploreTiles';

const meta: Meta<typeof ExploreTiles> = {
  title: 'Mobile/ExploreTiles',
  component: ExploreTiles,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '"Explore dubizzle Motors" tiles on the mobile motors landing page (dubizzle.com.eg): two-column cards with an illustration anchored bottom-right.' } } },
  args: {
    title: 'Explore dubizzle Motors',
    tiles: [{ label: 'New Cars' }, { label: 'Electric Cars', badge: 'New' }, { label: 'Car Comparison' }, { label: 'Car Finance' }],
  },
  render: (args) => (
    <div style={{ width: 390, background: 'var(--white)', paddingBlock: 16 }}>
      <ExploreTiles {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof ExploreTiles> = {};
