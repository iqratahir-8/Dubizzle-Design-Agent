import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { totalPages: 12 },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

function Controlled(props: Parameters<typeof Pagination>[0]) {
  const [page, setPage] = useState(5);
  return <Pagination {...props} currentPage={page} onPageChange={setPage} />;
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };
