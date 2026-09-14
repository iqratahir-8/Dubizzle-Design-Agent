import type { Meta, StoryObj } from '@storybook/react';
import { ListingActions, SellFab, SortSaveBar } from './SortSaveBar';

const meta: Meta<typeof SortSaveBar> = {
  title: 'Mobile/SortSaveBar',
  component: SortSaveBar,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Floating controls at the bottom of mobile listing pages on dubizzle.com.eg: the "Sort | Save" bar and the round red Sell button above it (`ListingActions` positions both).' } } },
};
export default meta;

type Story = StoryObj<typeof SortSaveBar>;

export const Bar: Story = { render: () => <SortSaveBar /> };
export const Sell: Story = { render: () => <SellFab /> };
export const OnListingPage: Story = {
  render: () => (
    <div style={{ width: 390, height: 200, display: 'flex', alignItems: 'flex-end', background: 'var(--gray-00)' }}>
      <ListingActions />
    </div>
  ),
};
