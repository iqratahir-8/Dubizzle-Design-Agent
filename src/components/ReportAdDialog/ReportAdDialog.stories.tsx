import type { Meta, StoryObj } from '@storybook/react';
import { ReportAdDialog } from './ReportAdDialog';

const meta: Meta<typeof ReportAdDialog> = {
  title: 'Feedback/ReportAdDialog',
  component: ReportAdDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Report this ad (signed in). Reasons and layout from the live capture; never submitted during capture.' } } },
  decorators: [(S) => <div style={{ position: 'relative', height: 625 }}><S /></div>],
  args: { open: true, inline: true, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof ReportAdDialog>;
export const Default: Story = {};
