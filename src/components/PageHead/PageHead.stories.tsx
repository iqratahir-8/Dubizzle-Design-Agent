import type { Meta, StoryObj } from '@storybook/react';
import { PageHead } from './PageHead';
import { Button } from '../Button';

const meta: Meta<typeof PageHead> = {
  title: 'Components/PageHead',
  component: PageHead,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'The title row of a listing page: H1 24/700, the ad count on a pale red pill beside it, and the page actions on the right — "Save Search" on live.' } },
  },
  args: { title: 'Cars for Sale in Egypt', count: '13,065 ads' },
  render: (args) => (
    <div style={{ width: 1280, padding: 16 }}>
      <PageHead {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof PageHead>;

export const Default: Story = {};
export const WithSaveSearch: Story = {
  args: { actions: <Button variant="secondary">Save Search</Button> },
};
export const WithoutCount: Story = { args: { count: undefined } };
