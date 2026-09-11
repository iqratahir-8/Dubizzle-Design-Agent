import type { Meta, StoryObj } from '@storybook/react';
import { ContactButton } from './ContactButton';

const meta: Meta<typeof ContactButton> = {
  title: 'Components/ContactButton',
  component: ContactButton,
  tags: ['autodocs'],
  args: { variant: 'chat' },
};
export default meta;

type Story = StoryObj<typeof ContactButton>;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.2rem' }}>
      <ContactButton variant="chat" />
      <ContactButton variant="call" />
      <ContactButton variant="whatsapp" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.2rem' }}>
      <ContactButton variant="chat" showLabel={false} />
      <ContactButton variant="call" showLabel={false} />
      <ContactButton variant="whatsapp" showLabel={false} />
    </div>
  ),
};

export const FullWidth: Story = { args: { fullWidth: true } };
