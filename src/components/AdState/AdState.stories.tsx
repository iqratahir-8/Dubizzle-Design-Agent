import type { Meta, StoryObj } from '@storybook/react';
import { AdState } from './AdState';

const meta: Meta<typeof AdState> = {
  title: 'Agency Portal/AdState',
  component: AdState,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Ad status badge. Repo `adState.tsx`; measured on the live Agency Ads card and ad details drawer.' } } },
  args: { state: 'active' },
};
export default meta;
type Story = StoryObj<typeof AdState>;
export const Active: Story = {};
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['active', 'expired', 'pending', 'notPosted', 'rejected', 'sold', 'disabled'] as const).map((s) => <AdState key={s} state={s} />)}
    </div>
  ),
};
export const WithDates: Story = { args: { state: 'active', showDates: true, children: 'Active from 21 Sept to 21 Oct' } };
