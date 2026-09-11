import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const ITEMS = ['For Sale', 'For Rent', 'New Projects'];

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { items: ITEMS },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

function Controlled(props: Parameters<typeof Tabs>[0]) {
  const [active, setActive] = useState(0);
  return <Tabs {...props} activeIndex={active} onChange={setActive} />;
}

export const Segmented: Story = { render: (args) => <Controlled {...args} /> };
export const Line: Story = { args: { variant: 'line' }, render: (args) => <Controlled {...args} /> };
