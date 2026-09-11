import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Full name',
    placeholder: 'e.g. Ahmed Hassan',
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

function Controlled(props: Parameters<typeof Input>[0]) {
  const [value, setValue] = useState('');
  return <Input {...props} value={value} onChange={setValue} />;
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };

export const WithError: Story = {
  args: { label: 'Phone number', error: 'Enter a valid Egyptian phone number', value: '012' },
};

export const Disabled: Story = { args: { value: 'Cannot edit this', disabled: true } };
