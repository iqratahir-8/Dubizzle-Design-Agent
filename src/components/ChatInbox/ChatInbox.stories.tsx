import type { Meta, StoryObj } from '@storybook/react';
import { ChatInbox } from './ChatInbox';

/* Fixtures. The people in a real inbox are real; nothing here comes from a capture. */
const CONVERSATIONS = [
  { id: '1', name: 'Ahmed H.', ad: 'Apartment for sale in Zamalek 200m', preview: 'Is the price negotiable?', time: '2h' },
  { id: '2', name: 'Mona S.', ad: 'Hyundai Elantra 2021', preview: 'I can come see it tomorrow morning', time: '5h' },
  { id: '3', name: 'Nile Realty', ad: 'Villa for sale in New Cairo 340m', preview: 'We have three similar units in the same compound', time: '1d' },
  { id: '4', name: 'محمود ع.', ad: 'iPhone 15 Pro Max 256GB', preview: 'التمن قابل للتفاوض؟', time: '2d' },
];

const meta: Meta<typeof ChatInbox> = {
  title: 'Chat/ChatInbox',
  component: ChatInbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The conversation list on the chat screen, measured on the live capture: a 64px Inbox bar, filter pills, and rows of exactly 100 with the ad being discussed as the loudest line.',
      },
    },
  },
  args: { conversations: CONVERSATIONS, activeId: '1' },
  render: (args) => (
    <div style={{ width: 511 }}>
      <ChatInbox {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ChatInbox>;

export const Default: Story = {};
export const UnreadFilter: Story = { args: { activeFilter: 'Unread Chats' } };
