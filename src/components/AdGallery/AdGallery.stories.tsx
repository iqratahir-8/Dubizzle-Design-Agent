import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AdGallery } from './AdGallery';

const meta: Meta<typeof AdGallery> = {
  title: 'Mobile/AdGallery',
  component: AdGallery,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Photo gallery at the top of the mobile ad detail page on dubizzle.com.eg: 390×294 photo, back disc top-left, next disc on the right edge, "Car of the Week" ribbon bottom-left, photo counter bottom-right and the shrinking dot pager.',
      },
    },
  },
  args: { total: 15, index: 0, ribbon: 'Car of the Week' },
  render: (args) => (
    <div style={{ width: 390 }}>
      <AdGallery {...args} onBack={() => {}} onNext={() => {}} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AdGallery>;

export const Default: Story = {};
export const WithoutRibbon: Story = { args: { ribbon: undefined } };
export const SinglePhoto: Story = { args: { total: 1, ribbon: undefined } };
export const Interactive: Story = {
  render: (args) => {
    const [i, setI] = useState(0);
    return (
      <div style={{ width: 390 }}>
        <AdGallery {...args} index={i} onBack={() => {}} onNext={() => setI((n) => (n + 1) % 15)} />
      </div>
    );
  },
};
