import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Post Your Ad',
    variant: 'primary',
    size: 'default',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'ghost'] },
    size: { control: 'select', options: ['small', 'default', 'large'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } };

export const Tertiary: Story = { args: { variant: 'tertiary', children: 'Skip for now' } };

export const Ghost: Story = { args: { variant: 'ghost', children: 'View more' } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
      <Button size="small">Small</Button>
      <Button size="default">Default</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
