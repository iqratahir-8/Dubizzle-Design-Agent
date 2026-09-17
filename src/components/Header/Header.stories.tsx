import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof Header>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  args: {
    user: { name: 'Ahmed H.' },
    favouritesCount: 3,
  },
};

export const ActiveVerticalMotors: Story = {
  args: { activeVertical: 'motors' },
};

export const ActiveVerticalProperty: Story = {
  args: { activeVertical: 'property' },
};

export const AgencyPortal: Story = {
  args: {
    showAgencyPortalLogo: true,
    user: { name: 'Nile Realty' },
    userType: 'agency-owner',
  },
};

/** The category strip is part of the header — hover one to open its mega menu. */
export const MegaMenuOpen: Story = {
  name: 'Mega menu open',
  args: { openCategory: 'Vehicles' },
};

/** Pages that don't show the category strip pass `categories={false}`. */
export const WithoutCategoryStrip: Story = {
  args: { categories: false },
};
