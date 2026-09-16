import type { Meta, StoryObj } from '@storybook/react';
import { PopularSearches } from './PopularSearches';

const meta: Meta<typeof PopularSearches> = {
  title: 'Mobile/PopularSearches',
  component: PopularSearches,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Popular Searches link groups at the bottom of the mobile home page (dubizzle.com.eg). Each group is cut off after a few links, with "View more".' } } },
  args: {
    groups: [
      {
        title: 'Cars for Sale in Egypt',
        links: ['Find Cars for Sale in Cairo', 'Find Cars for Sale in Giza', 'Find Cars for Sale in Alexandria', 'Find Cars for Sale in Sharkia', 'Find Cars for Sale in Dakahlia', 'Find Cars for Sale in Port Said', 'Find Cars for Sale in Ismailia'],
      },
      {
        title: 'Apartments for Sale in Egypt',
        links: ['Find Apartments for Sale in Maadi', 'Find Apartments for Sale in Nasr City', 'Find Apartments for Sale in New Cairo', 'Find Apartments for Sale in Heliopolis', 'Find Apartments for Sale in Agami', 'Find Apartments for Sale in Mansura'],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 390, background: 'var(--white)' }}>
      <PopularSearches {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof PopularSearches> = {};
