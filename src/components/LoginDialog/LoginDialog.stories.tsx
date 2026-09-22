import type { Meta, StoryObj } from '@storybook/react';
import { LoginDialog } from './LoginDialog';

const meta: Meta<typeof LoginDialog> = {
  title: 'Feedback/LoginDialog',
  component: LoginDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'The login dialog, measured on the live capture. Provider icons are the live ones (src/assets/login).' } } },
  decorators: [(S) => <div style={{ position: 'relative', height: 620 }}><S /></div>],
  args: { open: true, inline: true, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof LoginDialog>;
export const Default: Story = {};
