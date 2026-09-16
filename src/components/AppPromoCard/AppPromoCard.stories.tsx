import type { Meta, StoryObj } from '@storybook/react';
import { AppPromoCard } from './AppPromoCard';

const meta: Meta<typeof AppPromoCard> = {
  title: 'Mobile/AppPromoCard',
  component: AppPromoCard,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '"Get more in the app" band on mobile home and landing pages (dubizzle.com.eg).' } } },
  render: (args) => (
    <div style={{ width: 390 }}>
      <AppPromoCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AppPromoCard>;

export const Home: Story = {};
export const Motors: Story = {
  args: { points: ['Save & compare cars faster', 'Get instant price drop alerts', 'Chat on the go'] },
};
