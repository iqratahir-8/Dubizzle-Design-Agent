import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Radio>;

export const Group: Story = {
  render: () => {
    const options = ['New', 'Used'];
    const [selected, setSelected] = useState('New');
    return (
      <div style={{ display: 'flex', gap: '1.6rem' }}>
        {options.map((opt) => (
          <Radio key={opt} name="condition" label={opt} selected={selected === opt} onChange={() => setSelected(opt)} />
        ))}
      </div>
    );
  },
};

export const Disabled: Story = { args: { label: 'Unavailable', disabled: true } };
