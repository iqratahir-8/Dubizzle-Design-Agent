import type { Meta, StoryObj } from '@storybook/react';
import { PortalModal, DetailsTable, InfoBanner, ModalButton } from './PortalModal';

const meta: Meta<typeof PortalModal> = {
  title: 'Agency Portal/PortalModal',
  component: PortalModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Centred confirm modal of dubizzle Pro — Export Leads (md) and Purchase Lead (sm), measured on live. Confirm buttons are the caller\'s; captures never press them.' } } },
  decorators: [(S) => <div style={{ position: 'relative', height: 640 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof PortalModal>;
export const ExportLeads: Story = {
  args: {
    open: true, inline: true, onClose: () => {}, title: 'Export Leads',
    subtitle: "Based on the filters you applied, we're preparing your lead export.",
    children: <><div style={{ fontSize: 16, fontWeight: 700, lineHeight: '24px', marginBottom: 12 }}>Export Details</div><DetailsTable rows={[['Date Range', '22 Sep 25 - 22 Sep 26'], ['Lead Type', 'All Leads'], ['Agent', 'All Agents'], ['Total Records', '260']]} /><InfoBanner>You'll receive an email at <b>ahmed.hassan@example.com</b> with a secure download link once the export is complete. Export links expire after <b>24 hours</b>.</InfoBanner></>,
    footer: <><ModalButton variant="secondary">Cancel</ModalButton><ModalButton>Request Export</ModalButton></>,
  },
};
export const PurchaseLead: Story = {
  args: { open: true, inline: true, onClose: () => {}, size: 'sm', title: 'Purchase Lead', children: <p style={{ margin: 0, fontSize: 16 }}>You are about to purchase the following lead:</p>, footer: <ModalButton>Purchase</ModalButton> },
};
