import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FiltersHeader, FilterSection, FilterField, RangeFilter, ChoiceChips, ResultsBar } from './MobileFilters';

const meta: Meta = {
  title: 'Mobile/MobileFilters',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { component: 'The mobile filters page — full screen on live. Repo `search/compact/filtersDialog.tsx`; measured on the live capture.' } },
  },
};
export default meta;
type Story = StoryObj;

export const Page: Story = {
  render: () => {
    const [cond, setCond] = useState<string[]>([]);
    const [year, setYear] = useState(['', '']);
    const dirty = cond.length > 0 || year.some(Boolean);
    return (
      <div style={{ width: 390, background: 'var(--white)' }} data-parity="m-filters">
        <FiltersHeader category="Cars for Sale" canReset={dirty} onReset={() => { setCond([]); setYear(['', '']); }} />
        <div style={{ padding: '20px 16px' }}>
          <FilterSection title="Locations"><FilterField kind="location" value="Egypt" /></FilterSection>
          <FilterSection title="Brand and Model"><FilterField /></FilterSection>
          <FilterSection title="Year"><RangeFilter min={year[0]} max={year[1]} onChange={(a, b) => setYear([a, b])} /></FilterSection>
          <FilterSection title="Condition"><ChoiceChips options={['New', 'Used']} value={cond} onChange={setCond} /></FilterSection>
          <FilterSection title="Price"><RangeFilter suffix="EGP" /></FilterSection>
        </div>
        <ResultsBar label="See +13K Results" />
      </div>
    );
  },
};
