import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Remember me' },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

function Controlled(props: Parameters<typeof Checkbox>[0]) {
  const [checked, setChecked] = useState(false);
  return <Checkbox {...props} checked={checked} onChange={setChecked} />;
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
