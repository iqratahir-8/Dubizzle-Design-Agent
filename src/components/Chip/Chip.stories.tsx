import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FiltersIcon } from '../icons';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Chips from dubizzle.com.eg listing pages: **quick** (brand shortcuts), **filter** (mobile filter bar — selected means applied) and **segment** (All / New / Used — selected is blue).',
      },
    },
  },
  args: { label: 'Mercedes-Benz' },
};
export default meta;

type Story = StoryObj<typeof Chip>;

const BRANDS = ['Mercedes-Benz', 'Hyundai', 'Fiat', 'BMW', 'Kia'];
const row = { display: 'flex', gap: 8, alignItems: 'center' } as const;

export const Quick: Story = {};
export const QuickMobile: Story = { args: { device: 'mobile' } };
export const Inactive: Story = { args: { variant: 'segment', label: 'New' } };
export const Active: Story = { args: { variant: 'segment', label: 'All', selected: true } };

export const QuickRow: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={row}>{BRANDS.map((b) => <Chip key={b} label={b} />)}</div>
      <div style={row}>{BRANDS.map((b) => <Chip key={b} label={b} device="mobile" />)}</div>
    </div>
  ),
};

export const FilterBar: Story = {
  render: () => (
    <div style={{ ...row, width: 390, padding: '8px 16px', overflow: 'hidden' }}>
      <Chip variant="filter" icon={<FiltersIcon size={16} />} count={2} selected aria-label="Filters" />
      <Chip variant="filter" label="Cars for Sale" caret selected />
      <Chip variant="filter" label="Brand and Model" caret />
      <Chip variant="filter" label="Price" caret />
    </div>
  ),
};

export const Segment: Story = {
  render: () => {
    const [value, setValue] = useState('All');
    return (
      <div style={row}>
        {['All', 'New', 'Used'].map((v) => (
          <Chip key={v} variant="segment" label={v} selected={value === v} onClick={() => setValue(v)} />
        ))}
      </div>
    );
  },
};
