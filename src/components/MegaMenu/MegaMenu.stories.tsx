import type { Meta, StoryObj } from '@storybook/react';
import { MegaMenu } from './MegaMenu';
import type { MegaMenuItem } from './MegaMenu';

/** Content copied from the live header capture (design-kit/templates/desktop/menu-*.html). */
const ITEMS: MegaMenuItem[] = [
  {
    label: 'Vehicles',
    categories: [
      {
        label: 'Cars for Sale',
        panel: {
          title: 'Popular Brands',
          seeAllLabel: 'See All',
          columns: 2,
          links: [
            { label: 'Mercedes-Benz' }, { label: 'MG' }, { label: 'Hyundai' }, { label: 'Volkswagen' },
            { label: 'Fiat' }, { label: 'Skoda' }, { label: 'BMW' }, { label: 'Daewoo' },
            { label: 'Renault' }, { label: 'Toyota' }, { label: 'Kia' }, { label: 'Chery' },
            { label: 'Chevrolet' }, { label: 'Suzuki' }, { label: 'Opel' }, { label: 'Seat' },
          ],
        },
      },
      { label: 'Cars for Rent', panel: { title: 'Cars for Rent', seeAllLabel: 'See All', links: [{ label: 'Daily Rental', chevron: true }, { label: 'Monthly Rental', chevron: true }, { label: 'With Driver', chevron: true }] } },
      { label: 'Tyres, Batteries, Oils, & Accessories', panel: { title: 'Tyres, Batteries, Oils, & Accessories', seeAllLabel: 'See All', links: [{ label: 'Tyres' }, { label: 'Batteries' }, { label: 'Oils' }, { label: 'Accessories' }] } },
      { label: 'Car Spare Parts' },
      { label: 'Car Care', panel: { title: 'Car Care', seeAllLabel: 'See All', links: [{ label: 'Pads, Sponges, & Cloths' }, { label: 'Car Air Fresheners' }, { label: 'Car Cleaning Products' }, { label: 'Car Waxes' }, { label: 'Car Polishes & Compounds' }] } },
      { label: 'Motorcycles & Scooters' },
      { label: 'Motorcycle Spare Parts' },
      { label: 'Boats - Watercraft' },
      { label: 'Golf Carts' },
      { label: 'Heavy Trucks, Buses & Other Vehicles' },
    ],
  },
  {
    label: 'Properties',
    categories: [
      { label: 'Apartments for Sale', panel: { title: 'Apartments for Sale', seeAllLabel: 'See All', columns: 2, links: [{ label: 'Cairo' }, { label: 'Giza' }, { label: 'New Cairo' }, { label: 'Alexandria' }, { label: 'Sheikh Zayed' }, { label: '6th of October' }] } },
      { label: 'Apartments for Rent' },
      { label: 'Villas For Sale' },
      { label: 'Villas For Rent' },
      { label: 'Vacation Homes' },
      { label: 'Commercial' },
    ],
  },
  { label: 'Mobiles & Tablets', categories: [{ label: 'Mobile Phones', panel: { title: 'Mobile Phones', seeAllLabel: 'See All', columns: 2, links: [{ label: 'Apple' }, { label: 'Samsung' }, { label: 'Xiaomi' }, { label: 'Oppo' }] } }, { label: 'Tablets' }, { label: 'Mobile Numbers' }] },
  { label: 'Jobs', categories: [{ label: 'Accounting, Finance & Banking' }, { label: 'Engineering' }, { label: 'Designers' }] },
  {
    label: 'More Categories',
    categories: [
      {
        label: 'Fashion & Beauty',
        subtitle: "Women's Clothing; Men's Clothing; Women'…",
        panel: {
          title: 'Fashion & Beauty',
          seeAllLabel: 'See All',
          links: [
            { label: "Women's Clothing", chevron: true },
            { label: "Men's Clothing", chevron: true },
            { label: "Women's Accessories - Cosmetics - Personal Care", chevron: true },
            { label: "Men's Accessories - Personal Care", chevron: true },
            { label: "Women's Footwear" },
            { label: "Men's Footwear" },
          ],
        },
      },
      { label: 'Pets - Birds - Ornamental fish', subtitle: 'Dogs; Cats; Birds' },
      { label: 'Kids & Babies', subtitle: 'Baby & Mom Healthcare; Baby Clothing; Kid…' },
      { label: 'Books, Sports & Hobbies', subtitle: 'Antiques - Collectibles; Bicycles; Books' },
      { label: 'Business - Industrial - Agriculture', subtitle: 'Agriculture; Construction; Industrial Equipm…' },
      { label: 'Services', subtitle: 'Business; Car; Events' },
    ],
  },
];

const meta: Meta<typeof MegaMenu> = {
  title: 'Components/MegaMenu',
  component: MegaMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The desktop header category strip and its mega menu, as on dubizzle.com.eg. **Hover a category to open it** — the open one is marked by a 4px underline — then hover a subcategory on the left to swap the panel on the right. `openItem` pins one open for screenshots and for the design kit.',
      },
    },
  },
  args: { items: ITEMS },
  render: (args) => (
    <div style={{ width: 1280, margin: '0 auto', minHeight: 460, background: 'var(--white)' }}>
      <MegaMenu {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MegaMenu>;

/** Hover the strip to open a menu, exactly as on live. */
export const Interactive: Story = {};
export const Vehicles: Story = { args: { openItem: 'Vehicles' } };
export const Properties: Story = { args: { openItem: 'Properties' } };
export const MoreCategories: Story = { args: { openItem: 'More Categories' } };
