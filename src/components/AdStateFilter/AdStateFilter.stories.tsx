import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AdStateFilter, AD_STATE_FILTERS } from './AdStateFilter';

const meta: Meta<typeof AdStateFilter> = {
  title: 'Agency Portal/AdStateFilter',
  component: AdStateFilter,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Status filter pills above the Agency Ads list. Repo `stateFilter.tsx`.' } } },
};
export default meta;
type Story = StoryObj<typeof AdStateFilter>;
export const Default: Story = {
  render: () => {
    const [v, setV] = useState('all');
    return <AdStateFilter options={AD_STATE_FILTERS} value={v} onChange={setV} />;
  },
};
