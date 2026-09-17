import type { Meta, StoryObj } from '@storybook/react';
import { AccountMenu } from './AccountMenu';

const meta: Meta<typeof AccountMenu> = {
  title: 'Mobile/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The mobile account page — what the bottom nav\'s Account tab opens, and the mobile counterpart of the desktop `UserMenu`. Avatar and name, the verify banner, the Favorites card, the packages banner, then title-and-subtitle rows. Measured on a redacted capture; the name is a placeholder.',
      },
    },
  },
  args: { name: 'Ahmed Hassan' },
  render: (args) => (
    <div style={{ width: 390, background: 'var(--white)' }}>
      <AccountMenu {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof AccountMenu> = {};
