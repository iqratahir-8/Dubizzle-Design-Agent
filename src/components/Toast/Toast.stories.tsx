import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Toast notification. Repo `dubizzle-facelift/components/toast.tsx`. **Repo values, not yet verified against live** — no read-only action on live raises a toast (every one follows a real action: export, invite, purchase), so none can be captured without doing one.' } } },
  args: { inline: true, message: 'Ad added to your favourites', onDismiss: () => {} },
};
export default meta;
type Story = StoryObj<typeof Toast>;
export const Success: Story = {};
export const Error: Story = { args: { type: 'error', message: 'Something went wrong. Please try again.' } };
export const TwoLines: Story = { args: { message: 'Your ad is live', secondaryMessage: 'It may take a few minutes to appear in search' } };
