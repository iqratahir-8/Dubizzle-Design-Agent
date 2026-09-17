import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from './UserMenu';

const meta: Meta<typeof UserMenu> = {
  title: 'Layout/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The account menu under the header\'s avatar chip on dubizzle.com.eg. The panel is grey and the groups are white, so the 4px gaps between them are the dividers. Measured on a redacted signed-in capture — the name here is a placeholder.',
      },
    },
  },
  args: { name: 'Ahmed Hassan' },
  render: (args) => (
    <div style={{ padding: 24, background: 'var(--gray-00)', minHeight: 780 }}>
      <UserMenu {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {};
export const WithoutPromo: Story = { args: { promo: null } };
export const Verified: Story = { args: { verifyLabel: null } };
