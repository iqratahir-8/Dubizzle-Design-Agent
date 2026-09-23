import type { Meta, StoryObj } from '@storybook/react';
import { AdDescription } from './AdDescription';

const meta: Meta<typeof AdDescription> = {
  title: 'Ad detail/AdDescription',
  component: AdDescription,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The seller's own text on an ad detail page — measured on the live car DPV. Line breaks are kept as typed, because that is how sellers write ads.",
      },
    },
  },
  args: {
    children: `2018 Mercedes E300 AMG
43,600 KM
Original Paint
Agency maintained
First owner
Panorama roof
Price negotiable`,
  },
  render: (args) => (
    <div style={{ width: 826 }}>
      <AdDescription {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AdDescription>;

export const Car: Story = {};
