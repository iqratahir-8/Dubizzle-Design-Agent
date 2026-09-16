import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrimeDealersRow } from './PrimeDealersRow';

const meta: Meta<typeof PrimeDealersRow> = {
  title: 'Mobile/PrimeDealersRow',
  component: PrimeDealersRow,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '"Prime Dealers First" toggle row above mobile listing results (dubizzle.com.eg). The switch is smaller than the form Toggle: 39×20 with a 16px knob.' } } },
  render: (args) => (
    <div style={{ width: 390 }}>
      <PrimeDealersRow {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof PrimeDealersRow>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Interactive: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div style={{ width: 390 }}>
        <PrimeDealersRow checked={on} onChange={setOn} />
      </div>
    );
  },
};
