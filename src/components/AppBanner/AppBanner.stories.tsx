import type { Meta, StoryObj } from '@storybook/react';
import { AppBanner } from './AppBanner';

const meta: Meta<typeof AppBanner> = {
  title: 'Mobile/AppBanner',
  component: AppBanner,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '"Buy and sell faster in app" smart banner pinned above the header on the mobile home page (dubizzle.com.eg).' } } },
  render: (args) => (
    <div style={{ width: 390 }}>
      <AppBanner {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof AppBanner> = {};
export const Compact: StoryObj<typeof AppBanner> = { args: { compact: true } };
