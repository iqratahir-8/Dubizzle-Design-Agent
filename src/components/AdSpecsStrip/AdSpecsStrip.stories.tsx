import type { Meta, StoryObj } from '@storybook/react';
import { AdSpecsStrip } from './AdSpecsStrip';

const meta: Meta<typeof AdSpecsStrip> = {
  title: 'Ad detail/AdSpecsStrip',
  component: AdSpecsStrip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The headline specs repeated under the price on an ad detail page — measured on the live car DPV. One grey band, equal cells, a 24px icon and a label over a bold value.',
      },
    },
  },
  args: {
    specs: [
      { icon: 'dpv-year', label: 'Year', value: '2018' },
      { icon: 'dpv-kilometers', label: 'Kilometers', value: '43,000' },
      { icon: 'dpv-transmission', label: 'Transmission Type', value: 'Automatic' },
      { icon: 'dpv-fuel', label: 'Fuel Type', value: 'Benzine' },
    ],
  },
  render: (args) => (
    <div style={{ width: 826 }}>
      <AdSpecsStrip {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AdSpecsStrip>;

export const Car: Story = {};
