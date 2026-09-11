import type { Meta, StoryObj } from '@storybook/react';
import { Pill, type PillVariant } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Components/Pill',
  component: Pill,
  tags: ['autodocs'],
  args: { label: 'Featured', variant: 'featured' },
};
export default meta;

type Story = StoryObj<typeof Pill>;

const VARIANTS: PillVariant[] = ['regular', 'success', 'featured', 'error', 'boosted', 'live', 'recent', 'disabled'];

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
      {VARIANTS.map((v) => (
        <Pill key={v} variant={v} label={v} />
      ))}
    </div>
  ),
};
