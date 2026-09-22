import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SortMenu } from './SortMenu';

const meta: Meta<typeof SortMenu> = {
  title: 'Components/SortMenu',
  component: SortMenu,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'The list that opens under SortBy. Options and values from the live cars listing.' } } },
};
export default meta;
type Story = StoryObj<typeof SortMenu>;
export const Default: Story = {
  render: () => {
    const [v, setV] = useState('Newly listed');
    return <SortMenu value={v} onChange={setV} />;
  },
};
