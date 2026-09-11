import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: { label: 'Notify me about new matches' },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

function Controlled(props: Parameters<typeof Toggle>[0]) {
  const [checked, setChecked] = useState(false);
  return <Toggle {...props} checked={checked} onChange={setChecked} />;
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
