import type { Meta, StoryObj } from '@storybook/react';
import { ContactBar } from './ContactBar';

const meta: Meta<typeof ContactBar> = {
  title: 'Mobile/ContactBar',
  component: ContactBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The contact bar pinned to the bottom of the mobile ad detail page on dubizzle.com.eg. On live it is `position: fixed` above everything; the stories show it in place. Buttons grow to fill the row, so Call and WhatsApp end up 152px and 198px at 390px wide.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 390 }}>
      <ContactBar {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ContactBar>;

export const Default: Story = {};
export const WithChat: Story = { args: { actions: ['chat', 'call', 'whatsapp'] } };
