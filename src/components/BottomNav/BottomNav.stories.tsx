import type { Meta, StoryObj } from '@storybook/react';
import { BottomNav } from './BottomNav';

const meta: Meta<typeof BottomNav> = {
  title: 'Mobile/BottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Mobile web bottom navigation from dubizzle.com.eg: Home, Chat, raised red Sell, My Ads, Account. Active item is charcoal, the rest grey. Pass `fixed` in real pages.' } } },
  argTypes: { active: { control: 'inline-radio', options: ['home', 'chat', 'myAds', 'account'] } },
  args: { active: 'home' },
  render: (args) => (
    <div style={{ width: 390, paddingTop: 24, background: 'var(--gray-00)' }}>
      <BottomNav {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof BottomNav>;

export const Home: Story = {};
export const Chat: Story = { args: { active: 'chat' } };
export const MyAds: Story = { args: { active: 'myAds' } };
export const Account: Story = { args: { active: 'account' } };
