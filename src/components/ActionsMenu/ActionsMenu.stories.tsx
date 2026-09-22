import type { Meta, StoryObj } from '@storybook/react';
import { ActionsMenu, AD_ACTIONS, AGENT_ACTIONS } from './ActionsMenu';

const meta: Meta<typeof ActionsMenu> = {
  title: 'Agency Portal/ActionsMenu',
  component: ActionsMenu,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'The ⋯ / ⋮ actions menus of dubizzle Pro. Repo `generalActionsDropdown.tsx`. Labels, rhythm and icons from the live captures (icons in `src/assets/portal`).' } } },
};
export default meta;
type Story = StoryObj<typeof ActionsMenu>;
const slug = (l: string) => l.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '');
const icon = (l: string) => <img src={`/assets/portal/action-${slug(l)}.svg`} alt="" />;
export const AdCard: Story = { args: { variant: 'ad', items: AD_ACTIONS.map((label) => ({ label, icon: icon(label) })) } };
export const AgentRow: Story = { args: { variant: 'agent', items: AGENT_ACTIONS.map((label) => ({ label, icon: icon(label) })) } };
