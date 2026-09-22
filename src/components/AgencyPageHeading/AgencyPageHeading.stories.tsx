import type { Meta, StoryObj } from '@storybook/react';
import { AgencyPageHeading } from './AgencyPageHeading';

const meta: Meta<typeof AgencyPageHeading> = {
  title: 'Agency Portal/AgencyPageHeading',
  component: AgencyPageHeading,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Title of every dubizzle Pro screen. Repo `agencyPageHeading.tsx`; measured on the live portal.' } } },
  args: { title: 'Agency Ads' },
};
export default meta;
type Story = StoryObj<typeof AgencyPageHeading>;
export const Default: Story = {};
export const WithSubtitle: Story = { args: { title: 'Agency Management', subtitle: '(Previously Known as Agents)' } };
