import type { Meta, StoryObj } from '@storybook/react';
import { AdDetailPage } from './AdDetailPage';
import { HomePage } from './HomePage';
import { SearchPage } from './SearchPage';

const meta: Meta = {
  title: 'Templates/Pages',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Home: Story = { render: () => <HomePage /> };
export const Search: Story = { render: () => <SearchPage /> };
export const AdDetail: Story = { render: () => <AdDetailPage /> };
