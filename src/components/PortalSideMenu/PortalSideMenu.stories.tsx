import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PortalSideMenu } from './PortalSideMenu';

const meta: Meta<typeof PortalSideMenu> = {
  title: 'Agency Portal/PortalSideMenu',
  component: PortalSideMenu,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'The dubizzle Pro sidebar — 80px rail, 250px drawer. Repo `sideMenu`; measured on live, live glyphs.' } } },
  decorators: [(S) => <div style={{ height: 900, position: 'relative' }}><S /></div>],
  args: { active: 'agency-ads' },
};
export default meta;
type Story = StoryObj<typeof PortalSideMenu>;
export const Collapsed: Story = {};
export const Expanded: Story = { args: { expanded: true } };
export const Interactive: Story = {
  render: () => { const [open, setOpen] = useState(false); return <PortalSideMenu active="leads" expanded={open} onToggle={() => setOpen(!open)} />; },
};
