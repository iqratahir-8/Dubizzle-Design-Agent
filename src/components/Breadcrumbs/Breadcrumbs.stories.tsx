import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Breadcrumbs above a listing or ad detail page on dubizzle.com.eg — 14/21 links at 64% charcoal, slash separators, the current page in full charcoal and bold.' } },
  },
  args: {
    items: [
      { label: 'Home', href: '/en/' },
      { label: 'Vehicles', href: '/en/category/vehicles' },
      { label: 'Cars for Sale' },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {};
export const AdDetail: Story = {
  args: {
    items: [
      { label: 'Home', href: '/en/' },
      { label: 'Vehicles', href: '/en/category/vehicles' },
      { label: 'Cars for Sale', href: '/en/vehicles/cars-for-sale/' },
      { label: 'Mercedes-Benz', href: '/en/vehicles/cars-for-sale/mercedes-benz/' },
      { label: 'E300' },
    ],
  },
};
