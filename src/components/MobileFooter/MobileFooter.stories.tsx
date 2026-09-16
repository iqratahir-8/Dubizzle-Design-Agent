import type { Meta, StoryObj } from '@storybook/react';
import { MobileFooter } from './MobileFooter';

const meta: Meta<typeof MobileFooter> = {
  title: 'Mobile/MobileFooter',
  component: MobileFooter,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Mobile web footer (dubizzle.com.eg): accordion rows, Follow us icons, app-store badges and the copyright bar. Its bottom padding leaves room for the fixed bottom navigation.' } } },
  render: (args) => (
    <div style={{ width: 390 }}>
      <MobileFooter {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof MobileFooter> = {};
