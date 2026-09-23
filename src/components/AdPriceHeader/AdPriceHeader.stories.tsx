import type { Meta, StoryObj } from '@storybook/react';
import { AdPriceHeader } from './AdPriceHeader';

const meta: Meta<typeof AdPriceHeader> = {
  title: 'Ad detail/AdPriceHeader',
  component: AdPriceHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Price, title and the meta line on an ad detail page — measured on the live car DPV. The price is 28/42 at 600 (the loudest number on the site), the down-payment chip sits 8 after it, and the favourite and share controls hold the right edge.',
      },
    },
  },
  args: {
    price: 'EGP 3,190,000',
    downPayment: 'EGP 957,000',
    title: 'Mercedes-Benz E300 2018 AMG',
    location: 'Maadi, Cairo',
    postedAt: '6 days ago',
  },
  render: (args) => (
    <div style={{ width: 826 }}>
      <AdPriceHeader {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AdPriceHeader>;

export const Car: Story = {};
export const WithoutDownPayment: Story = { args: { downPayment: undefined } };
export const Property: Story = {
  args: {
    price: 'EGP 22,130,000',
    downPayment: 'EGP 1,106,500',
    title: 'Own Your Villa Sea View Fully Finished Over 10 Years',
    location: 'Hacienda Heneish, North Coast',
    postedAt: '1 minute ago',
  },
};
