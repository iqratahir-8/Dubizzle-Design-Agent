import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const CITIES = ['Cairo', 'Giza', 'Alexandria', 'Sohag', 'Aswan'];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: 'City',
    placeholder: 'Choose a city',
    options: CITIES,
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

function Controlled(props: Parameters<typeof Select>[0]) {
  const [value, setValue] = useState<string | undefined>(undefined);
  return <Select {...props} value={value} onChange={setValue} />;
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };

export const WithError: Story = { args: { error: 'Please select a city' } };

export const Disabled: Story = { args: { disabled: true, value: 'Cairo' } };
