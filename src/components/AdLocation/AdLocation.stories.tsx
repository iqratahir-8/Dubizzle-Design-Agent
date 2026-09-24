import type { Meta, StoryObj } from '@storybook/react';
import { AdLocation } from './AdLocation';

const meta: Meta<typeof AdLocation> = {
  title: 'Ad detail/AdLocation',
  component: AdLocation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Where the ad is — measured on the live car DPV. The map is a slot: the design system ships no map tiles, so with nothing in it the area stays neutral grey rather than pretending to be a map.',
      },
    },
  },
  args: { area: 'Maadi', city: 'Cairo' },
  render: (args) => (
    <div style={{ width: 826 }}>
      <AdLocation {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AdLocation>;

export const Default: Story = {};
