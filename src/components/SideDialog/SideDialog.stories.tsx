import type { Meta, StoryObj } from '@storybook/react';
import { SideDialog } from './SideDialog';
import { AdState } from '../AdState';
import { AgencyPortalTabSwitcher } from '../AgencyPortalTabSwitcher';

const meta: Meta<typeof SideDialog> = {
  title: 'Agency Portal/SideDialog',
  component: SideDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Right-hand panel of dubizzle Pro. Repo `sideDialog.tsx`. `large` is the ad details drawer that opens from an Agency Ads card.' } },
  },
  decorators: [(S) => <div style={{ position: 'relative', height: 640, background: 'var(--gray-00)' }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof SideDialog>;

export const Default: Story = {
  args: { open: true, inline: true, title: 'Assign Agent', onClose: () => {}, children: <p style={{ margin: 0, fontSize: 14 }}>Choose the agent responsible for this ad.</p> },
};
export const AdDetailsDrawer: Story = {
  args: {
    open: true,
    inline: true,
    size: 'large',
    onClose: () => {},
    title: <AdState state="active" />,
    children: (
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontSize: 16 }}>Ad ID <b>207466446</b></div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: '28px' }}>Selfie Stick - Premium Quality</div>
        <AdState state="active" showDates>Active from 21 Sept to 21 Oct</AdState>
        <AgencyPortalTabSwitcher value="overview" tabs={[{ value: 'overview', label: 'Overview' }, { value: 'info', label: 'Ad Data' }, { value: 'promo', label: 'Promo Tools' }, { value: 'agent', label: 'Agent Details' }, { value: 'chats', label: 'Chats' }]} />
      </div>
    ),
  },
};
