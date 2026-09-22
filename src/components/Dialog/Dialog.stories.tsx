import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Centred modal. Repo `strat/components/dialog`; overlay, radius and padding measured on the live login dialog.' } } },
  decorators: [(S) => <div style={{ position: 'relative', height: 420 }}><S /></div>],
  args: { open: true, inline: true, onClose: () => {}, children: <p style={{ margin: '32px 0 8px', fontSize: 14 }}>Dialog content.</p> },
};
export default meta;
type Story = StoryObj<typeof Dialog>;
export const Default: Story = {};
