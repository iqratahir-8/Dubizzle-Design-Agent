import type { Meta, StoryObj } from '@storybook/react';
import { MobileSearchPage } from './MobileSearchPage';

const meta: Meta<typeof MobileSearchPage> = {
  title: 'Mobile/MobileSearchPage',
  component: MobileSearchPage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'On mobile, search is a **page**, not a dropdown: tapping the header\'s search field opens this over dubizzle.com.eg. The matched query is bold, the category sits under it, and the row under the finger is grey full-bleed.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 390, minHeight: 600, background: 'var(--white)' }}>
      <MobileSearchPage {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MobileSearchPage>;

export const Empty: Story = {};

export const WithSuggestions: Story = {
  args: {
    value: 'toyota',
    activeIndex: 1,
    suggestions: [
      { query: 'toyota', category: 'Cars for Sale' },
      { query: 'toyota', category: 'Car Spare Parts' },
      { query: 'toyota', category: 'Cars for Rent' },
      { query: 'toyota auris', category: 'Cars for Sale' },
      { query: 'toyota avensis', category: 'Cars for Sale' },
      { query: 'toyota bz x', category: 'Cars for Sale' },
    ],
  },
};
