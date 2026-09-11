import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { label: 'Apartments' },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Inactive: Story = {};
export const Active: Story = { args: { active: true } };

export const Group: Story = {
  render: () => {
    const categories = ['All', 'Apartments', 'Villas', 'Duplex', 'Studio'];
    const [selected, setSelected] = useState('All');
    return (
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        {categories.map((c) => (
          <Chip key={c} label={c} active={selected === c} onClick={() => setSelected(c)} />
        ))}
      </div>
    );
  },
};
