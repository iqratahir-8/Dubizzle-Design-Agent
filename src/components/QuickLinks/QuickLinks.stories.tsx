import type { Meta, StoryObj } from '@storybook/react';
import { QuickLinks } from './QuickLinks';
import type { QuickLink } from './QuickLinks';

const CATEGORIES: QuickLink[] = [
  { label: 'Vehicles', icon: '/icons/category/vehicles.svg' },
  { label: 'Properties', icon: '/icons/navigation/vertical-properties-home.svg' },
  { label: 'Mobiles & Tablets', icon: '/icons/category/mobiles.svg' },
  { label: 'Jobs', icon: '/icons/category/jobs.svg' },
  { label: 'Home & Office Furniture - Decor', icon: '/icons/category/furniture.svg' },
  { label: 'Electronics & Appliances', icon: '/icons/category/electronics.svg' },
  { label: 'Fashion & Beauty', icon: '/icons/category/fashion.svg' },
  { label: 'Pets - Birds - Ornamental fish', icon: '/icons/category/animals.svg' },
  { label: 'Kids & Babies', icon: '/icons/category/kids.svg' },
  { label: 'Hobbies', icon: '/icons/category/bikes.svg' },
  { label: 'Businesses & Industrial', icon: '/icons/category/business.svg' },
  { label: 'Services', icon: '/icons/category/services.svg' },
];

const meta: Meta<typeof QuickLinks> = {
  title: 'Mobile/QuickLinks',
  component: QuickLinks,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Category quick links from the mobile home page ("Explore Egypt\'s Largest Marketplace") — a two-row, horizontally scrolling grid of 64px icon tiles. Motors adds a Category / Make / Model / City / Price Range tab row.' } } },
  args: { title: "Explore Egypt's Largest Marketplace", items: CATEGORIES },
  render: (args) => (
    <div style={{ width: 390, background: 'var(--white)' }}>
      <QuickLinks {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof QuickLinks>;

export const Home: Story = {};
export const MotorsTabs: Story = {
  args: { title: undefined, tabs: ['Category', 'Make', 'Model', 'City', 'Price Range'], items: CATEGORIES.slice(0, 8) },
};
