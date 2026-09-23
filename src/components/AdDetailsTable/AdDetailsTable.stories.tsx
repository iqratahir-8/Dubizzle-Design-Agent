import type { Meta, StoryObj } from '@storybook/react';
import { AdDetailsTable } from './AdDetailsTable';

const DETAILS = [
  { label: 'Brand', value: 'Mercedes-Benz' },
  { label: 'Model', value: 'E300' },
  { label: 'Version', value: 'AMG' },
  { label: 'Condition', value: 'Used' },
  { label: 'Body Type', value: 'Sedan' },
  { label: 'Color', value: 'Black' },
  { label: 'Engine Capacity (CC)', value: '2000' },
  { label: 'Number of doors', value: '4/5' },
  { label: 'Payment Options', value: 'Cash or Installment' },
  { label: 'Seller Type', value: 'Dealer' },
  { label: 'Ad ID', value: '207466446' },
];

const meta: Meta<typeof AdDetailsTable> = {
  title: 'Ad detail/AdDetailsTable',
  component: AdDetailsTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The attribute grid on an ad detail page — measured on the live car DPV. Two columns, a grey key cell and a bold value cell, and a blue "View +N more" once the list runs past six rows.',
      },
    },
  },
  args: { details: DETAILS },
  render: (args) => (
    <div style={{ width: 826 }}>
      <AdDetailsTable {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AdDetailsTable>;

export const Collapsed: Story = {};
export const Expanded: Story = { args: { expanded: true } };
