import type { Meta, StoryObj } from '@storybook/react';
import { VipLeadCard } from './VipLeadCard';

const meta: Meta<typeof VipLeadCard> = {
  title: 'Agency Portal/VipLeadCard',
  component: VipLeadCard,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'A VIP lead. Repo `vipLeadCard.tsx`; measured on live. The contact block is locked until purchased; captures never purchase.' } } },
  decorators: [(S) => <div style={{ width: 1312 }}><S /></div>],
  args: { title: 'Volkswagen ID4 2022', price: 'EGP 1,350,000', specs: ['2022', 'Used', '130000', 'Volkswagen'], location: '5th Settlement, New Cairo', date: '21 September 2026' },
};
export default meta;
type Story = StoryObj<typeof VipLeadCard>;
export const Default: Story = {};
