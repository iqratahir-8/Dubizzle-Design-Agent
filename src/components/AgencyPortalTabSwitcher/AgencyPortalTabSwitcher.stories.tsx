import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AgencyPortalTabSwitcher } from './AgencyPortalTabSwitcher';

const meta: Meta<typeof AgencyPortalTabSwitcher> = {
  title: 'Agency Portal/AgencyPortalTabSwitcher',
  component: AgencyPortalTabSwitcher,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Segmented tabs used across dubizzle Pro. Repo `agencyPortalTabSwitcher.tsx`; live values from Leads and Credit Info.' } } },
};
export default meta;
type Story = StoryObj<typeof AgencyPortalTabSwitcher>;

const LEADS = [{ value: 'all', label: 'All' }, { value: 'phone', label: 'Phone' }, { value: 'sms', label: 'SMS' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'chats', label: 'Chats' }];

export const Leads: Story = {
  render: () => {
    const [v, setV] = useState('all');
    return <AgencyPortalTabSwitcher size="sm" tabs={LEADS} value={v} onChange={setV} />;
  },
};
export const CreditInfo: Story = {
  args: { value: 'all', tabs: [{ value: 'all', label: 'All' }, { value: 'owner', label: 'Owner' }, { value: 'agents', label: 'Agents' }] },
};
export const WithCounts: Story = {
  args: { size: 'sm', value: 'active', tabs: [{ value: 'active', label: 'Active', count: 13 }, { value: 'rejected', label: 'Rejected', count: 0 }] },
};
