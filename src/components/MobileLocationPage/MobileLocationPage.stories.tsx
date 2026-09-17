import type { Meta, StoryObj } from '@storybook/react';
import { MobileLocationPage } from './MobileLocationPage';

const meta: Meta<typeof MobileLocationPage> = {
  title: 'Mobile/MobileLocationPage',
  component: MobileLocationPage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The location picker on mobile dubizzle.com.eg — a page, not the desktop dropdown: close button and title, a search field, "Use current location", the popular cities, every governorate (those open a further level), and a sticky "Select …" button.',
      },
    },
  },
  args: { value: 'Egypt' },
  render: (args) => (
    <div style={{ width: 390, height: 844, overflowY: 'auto', background: 'var(--white)' }}>
      <MobileLocationPage {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof MobileLocationPage> = {};
