import type { Meta, StoryObj } from '@storybook/react';
import { ChatThread, ChatThreadHeader, ChatAdStrip, ChatComposer } from './ChatThread';

/* Fixtures. The capture this was measured from holds a real conversation; none of it is here. */
const MESSAGES = [
  { id: '1', text: 'Hi, is this still available?', time: '13:08', own: true, day: 'Yesterday' },
  { id: '2', text: 'Yes, still available.', time: '13:09' },
  { id: '3', text: 'Is the price negotiable?', time: '13:09', own: true },
  { id: '4', text: 'Slightly, for a serious buyer. Would you like to see it this week?', time: '13:10' },
  { id: '5', text: 'Saturday morning works for me.', time: '09:41', own: true, day: 'Today' },
];

const meta: Meta<typeof ChatThread> = {
  title: 'Chat/ChatThread',
  component: ChatThread,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An open conversation, measured on the first capture of this screen (chat-thread.desktop). Incoming messages sit left on --gray-01, the account holder\'s own right on --blue-02, and the corner facing the speaker goes square after the first message in a run.',
      },
    },
  },
  args: { messages: MESSAGES },
  render: (args) => (
    <div style={{ width: 767, background: 'var(--gray-00)' }}>
      <ChatThreadHeader name="Mona S." lastActive="Last active 5 hours ago" />
      <ChatAdStrip title="iPhone 15 Pro Max 256GB" price="EGP 120,000" />
      <ChatThread {...args} />
      <ChatComposer />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ChatThread>;

export const Conversation: Story = {};
export const Bubbles: Story = {
  args: { messages: MESSAGES.slice(1, 4) },
  render: (args) => (
    <div style={{ width: 767, background: 'var(--gray-00)' }}>
      <ChatThread {...args} />
    </div>
  ),
};
