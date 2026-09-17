import type { Meta, StoryObj } from '@storybook/react';
import { VerticalNav } from './VerticalNav';

const meta: Meta<typeof VerticalNav> = {
  title: 'Layout/VerticalNav',
  component: VerticalNav,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The sub-nav on a vertical landing page. On dubizzle.com.eg the Motors and Property landings drop the header\'s search row and show this instead — 16/600 links 48px apart, the current page in red, and a red "NEW" pill where something is new.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 1280, margin: '0 auto', background: 'var(--white)' }}>
      <VerticalNav {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof VerticalNav>;

export const Motors: Story = {};
export const OnElectricCars: Story = { args: { active: 'Electric Cars' } };
export const Property: Story = {
  args: {
    items: [
      { label: 'Buy', href: '/en/properties/' },
      { label: 'Rent', href: '/en/properties/apartments-duplex-for-rent/' },
      { label: 'Compounds', href: '/en/properties/new-cairo/' },
      { label: 'Agencies', href: '/en/realestate/agencies', badge: 'NEW' },
    ],
    active: 'Buy',
  },
};
