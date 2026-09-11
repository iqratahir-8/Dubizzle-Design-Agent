import type { Meta, StoryObj } from '@storybook/react';
import { AdCard } from './AdCard';

const meta: Meta<typeof AdCard> = {
  title: 'Components/AdCard',
  component: AdCard,
  tags: ['autodocs'],
  args: {
    title: 'Modern Apartment with Nile View, Maadi',
    price: 'EGP 3,200,000',
    location: 'Maadi, Cairo',
    time: '2 hours ago',
    beds: 3,
    baths: 2,
    area: '150 m²',
    photoCount: 8,
  },
};
export default meta;

type Story = StoryObj<typeof AdCard>;

export const Grid: Story = { render: (args) => <div style={{ width: 280 }}><AdCard {...args} /></div> };

export const Featured: Story = {
  args: { featured: true },
  render: (args) => <div style={{ width: 280 }}><AdCard {...args} /></div>,
};

export const Elite: Story = {
  args: { elite: true },
  render: (args) => <div style={{ width: 280 }}><AdCard {...args} /></div>,
};

export const NonProperty: Story = {
  args: { title: 'iPhone 15 Pro Max, 256GB', beds: undefined, baths: undefined, area: undefined },
  render: (args) => <div style={{ width: 280 }}><AdCard {...args} /></div>,
};

export const Compact: Story = {
  args: { compact: true },
  render: (args) => <div style={{ width: 480 }}><AdCard {...args} /></div>,
};
