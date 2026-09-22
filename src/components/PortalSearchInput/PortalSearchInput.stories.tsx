import type { Meta, StoryObj } from '@storybook/react';
import { PortalSearchInput } from './PortalSearchInput';

const meta: Meta<typeof PortalSearchInput> = {
  title: 'Agency Portal/PortalSearchInput',
  component: PortalSearchInput,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'List search field of dubizzle Pro. Repo `searchInput.tsx`; measured on live Agency Ads.' } } },
};
export default meta;
type Story = StoryObj<typeof PortalSearchInput>;
export const Default: Story = {};
export const AgencyAds: Story = { args: { placeholder: 'Search keyword' } };
