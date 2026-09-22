import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import filters from '../../../design-kit/content/portal-filters.json';
import { MultipleChoiceDropdown } from './MultipleChoiceDropdown';

const live = filters.pages as Record<string, Record<string, { options?: string[] }>>;
const EXPERIENCE = live['portal-candidates']['Experience Level'].options ?? [];
const FUEL = live['portal-vip']['Fuel Type'].options ?? [];
const CATEGORIES = (live['portal-ads'].Category.options ?? []).slice(0, 12);

const meta: Meta<typeof MultipleChoiceDropdown> = {
  title: 'Agency Portal/MultipleChoiceDropdown',
  component: MultipleChoiceDropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Filter dropdown of dubizzle Pro. Repo `multipleChoiceDropdown.tsx`. Options are the ones live offers, read by `npm run extract:portal-filters`.' } },
  },
  decorators: [(S) => <div style={{ minHeight: 380 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof MultipleChoiceDropdown>;

export const Closed: Story = { args: { label: 'Experience Level', options: EXPERIENCE, width: '26rem' } };
export const OpenChecklist: Story = {
  render: () => {
    const [v, setV] = useState<string[]>(['5-10 Years']);
    return <MultipleChoiceDropdown label="Experience Level" options={EXPERIENCE} value={v} onChange={setV} open width="26rem" />;
  },
};
export const FuelType: Story = {
  render: () => {
    const [v, setV] = useState<string[]>([]);
    return <MultipleChoiceDropdown label="Fuel Type" options={FUEL} value={v} onChange={setV} width="25.6rem" menuWidth="26rem" />;
  },
};
export const SingleCategory: Story = {
  render: () => {
    const [v, setV] = useState<string[]>([]);
    return <MultipleChoiceDropdown label="Category" mode="single" options={CATEGORIES} value={v} onChange={setV} menuWidth="35.2rem" />;
  },
};
