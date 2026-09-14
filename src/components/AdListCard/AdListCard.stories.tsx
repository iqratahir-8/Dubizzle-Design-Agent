import type { Meta, StoryObj } from '@storybook/react';
import { AdListCard } from './AdListCard';
import type { AdListCardProps } from './AdListCard';

const meta: Meta<typeof AdListCard> = {
  title: 'Components/AdListCard',
  component: AdListCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'List ad card — search results. Desktop puts a 312px image beside the details; mobile stacks it. Values measured on dubizzle.com.eg (docs/LIVE-MEASUREMENTS.md).',
      },
    },
  },
  args: {
    price: 'EGP 8,400,000',
    downPayment: 'EGP 4,280,000',
    type: 'Apartment',
    beds: 3,
    baths: 2,
    area: '142 m²',
    title: 'Apartment for sale with a cash discount in Taj City',
    attributes: [
      { label: 'Completion Status', value: 'Off-Plan' },
      { label: 'Ownership', value: 'Primary' },
    ],
    location: 'Taj City, New Cairo',
    time: '2 weeks ago',
    photoCount: 10,
    featured: true,
  },
};
export default meta;

type Story = StoryObj<typeof AdListCard>;

const carArgs: Story['args'] = {
  price: 'EGP 3,750,000',
  downPayment: 'EGP 1,125,000',
  type: undefined,
  beds: undefined,
  baths: undefined,
  area: undefined,
  brand: 'Mercedes-Benz',
  model: 'CLA 200',
  title: 'Mercedes CLA 200 2026',
  attributes: [
    { label: 'Year', value: '2026' },
    { label: 'Condition', value: 'New' },
    { label: 'Transmission', value: 'Automatic' },
    { label: 'Fuel Type', value: 'Benzine' },
  ],
  location: 'New Cairo, Cairo',
  time: '17 hours ago',
  photoCount: 18,
  featured: false,
  elite: true,
};

const desktop = (args: Story['args']) => (
  <div style={{ width: 960 }}>
    <AdListCard {...(args as AdListCardProps)} />
  </div>
);
const mobile = (args: Story['args']) => (
  <div style={{ width: 358 }}>
    <AdListCard {...(args as AdListCardProps)} device="mobile" />
  </div>
);

export const Property: Story = { render: desktop };
export const Car: Story = { args: carArgs, render: desktop };
export const Highlighted: Story = { args: { ...carArgs, elite: false, highlighted: true }, render: desktop };
export const MobileProperty: Story = { render: mobile };
export const MobileCar: Story = { args: carArgs, render: mobile };
