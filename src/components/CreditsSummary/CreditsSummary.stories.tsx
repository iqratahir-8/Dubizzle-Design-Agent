import type { Meta, StoryObj } from '@storybook/react';
import { CreditsSummary } from './CreditsSummary';

const meta: Meta<typeof CreditsSummary> = {
  title: 'Agency Portal/CreditsSummary',
  component: CreditsSummary,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'The "Available credits" dropdown panel. Repo `creditsSummary.tsx` (golden gradient) with the repo\'s coin artwork; measured on live. Numbers are sample values.' } } },
  args: { available: 1031, used: 3969, total: 5000, assignedToAgents: 0, assignedUsed: 0, usedByOwner: 3969, expiresOn: '10 October 2026 at 11:39' },
};
export default meta;
type Story = StoryObj<typeof CreditsSummary>;
export const Default: Story = {};
