import type { Meta, StoryObj } from '@storybook/react';
import { SearchSuggestions } from './SearchSuggestions';

const meta: Meta<typeof SearchSuggestions> = {
  title: 'Components/SearchSuggestions',
  component: SearchSuggestions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'What the header\'s search field drops down as you type on dubizzle.com.eg: the same query offered in each matching category, with an arrow at the end of the row. The panel is as wide as the search field (850px at 1440).',
      },
    },
  },
  args: {
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
  render: (args) => (
    <div style={{ width: 850, padding: 24, background: 'var(--gray-00)' }}>
      <SearchSuggestions {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof SearchSuggestions> = {};
