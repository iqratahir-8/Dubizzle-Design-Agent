import type { Meta, StoryObj } from '@storybook/react';
import { AdCard } from './AdCard';
import type { AdCardProps } from './AdCard';

const meta: Meta<typeof AdCard> = {
  title: 'Components/AdCard',
  component: AdCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Grid ad card — home and landing-page rails, and the similar-ads widget under an ad. Search results use **AdListCard**. Values measured on dubizzle.com.eg (docs/LIVE-MEASUREMENTS.md).',
      },
    },
  },
  args: {
    price: 'EGP 22,130,000',
    downPayment: 'EGP 1,106,500',
    title: 'Own Your Villa Sea View in Hacienda Heneish',
    type: 'Stand Alone Villa',
    beds: 4,
    baths: 5,
    area: '220 m²',
    location: 'Hacienda Heneish, North Coast',
    time: '1 minute ago',
  },
};
export default meta;

type Story = StoryObj<typeof AdCard>;

const desktop = (args: Story['args']) => (
  <div style={{ width: 320 }}>
    <AdCard {...(args as AdCardProps)} />
  </div>
);
const mobile = (args: Story['args']) => (
  <div style={{ width: 187 }}>
    <AdCard {...(args as AdCardProps)} device="mobile" />
  </div>
);

export const Property: Story = { render: desktop };

export const Car: Story = {
  args: {
    price: 'EGP 2,050,000',
    downPayment: undefined,
    priceNote: 'Negotiable',
    title: 'Hyundai Tucson 2025',
    type: undefined,
    beds: undefined,
    baths: undefined,
    area: undefined,
    specs: ['4000 km', '2025'],
    location: 'Nasr City, Cairo',
    time: '3 minutes ago',
  },
  render: desktop,
};

export const Featured: Story = { args: { featured: true }, render: desktop };

export const Elite: Story = { args: { elite: true }, render: desktop };

export const Mobile: Story = { args: { downPayment: undefined }, render: mobile };

export const DesktopAndMobile: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {desktop(args)}
      {mobile({ ...args, downPayment: undefined })}
    </div>
  ),
};
