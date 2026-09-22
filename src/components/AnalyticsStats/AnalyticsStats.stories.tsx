import type { Meta, StoryObj } from '@storybook/react';
import { AnalyticsStats } from './AnalyticsStats';

const meta: Meta<typeof AnalyticsStats> = {
  title: 'Agency Portal/AnalyticsStats',
  component: AnalyticsStats,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Impressions / views / leads row on an Agency Ads card. Repo `analyticsStats.tsx`.' } } },
};
export default meta;
type Story = StoryObj<typeof AnalyticsStats>;
const ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="7" width="12" height="12" rx="2" /><path d="M8 4h10a2 2 0 0 1 2 2v10" /></svg>;
export const Default: Story = {
  args: { stats: [{ label: 'Impressions', value: 684, icon: ICON }, { label: 'View', value: 8, icon: ICON }, { label: 'Leads', value: 1, icon: ICON }] },
};
