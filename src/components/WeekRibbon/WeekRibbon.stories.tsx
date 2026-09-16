import type { Meta, StoryObj } from '@storybook/react';
import { WeekRibbon } from './WeekRibbon';

const meta: Meta<typeof WeekRibbon> = {
  title: 'Mobile/WeekRibbon',
  component: WeekRibbon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '"Car of the Week" / "Property of the Week" ribbon from dubizzle.com.eg — the red gradient badge on the winning ad\'s photo (ad detail gallery, bottom-left, and the listing card).',
      },
    },
  },
};
export default meta;

export const Car: StoryObj<typeof WeekRibbon> = {};
export const Property: StoryObj<typeof WeekRibbon> = { args: { label: 'Property of the Week' } };
