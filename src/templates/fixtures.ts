import type { AdCardProps } from '../components/AdCard';

/**
 * Typed mirror of design-kit/content/fixtures.json. Templates and stories use these
 * so React examples carry the same real dubizzle Egypt content the static templates
 * do — generated screens read as fake mostly because their data is fake.
 */

export type Listing = Omit<AdCardProps, 'className' | 'onClick'>;

export const PROPERTY_LISTINGS: Listing[] = [
  {
    title: 'Apartment for sale in Zamalek 200m fully finished',
    price: 'EGP 8,500,000',
    location: 'Zamalek, Cairo',
    time: '2 hours ago',
    beds: 3,
    baths: 2,
    area: '200 m²',
    featured: true,
    photoCount: 12,
  },
  {
    title: 'Villa for sale Mivida compound - prime location',
    price: 'EGP 32,000,000',
    location: 'Mivida, New Cairo',
    time: '1 day ago',
    beds: 5,
    baths: 4,
    area: '420 m²',
    elite: true,
    photoCount: 28,
  },
  {
    title: 'Apartment for sale Nasr City 130m installments over 8 years',
    price: 'EGP 3,200,000',
    location: 'Nasr City, Cairo',
    time: '12 hours ago',
    beds: 3,
    baths: 2,
    area: '130 m²',
    photoCount: 7,
  },
  {
    title: 'شقة للبيع في مدينتي 145 متر سوبر لوكس',
    price: 'EGP 4,750,000',
    location: 'Madinaty, Cairo',
    time: 'منذ 5 ساعات',
    beds: 3,
    baths: 2,
    area: '145 m²',
    photoCount: 15,
  },
  {
    title: 'Chalet for sale Marassi north coast first row',
    price: 'EGP 14,200,000',
    location: 'Marassi, North Coast',
    time: '4 days ago',
    beds: 3,
    baths: 3,
    area: '180 m²',
    featured: true,
    photoCount: 19,
  },
  {
    title: 'Duplex 300m for sale in 6th of October under market price URGENT',
    price: 'EGP 6,900,000',
    location: '6th of October, Giza',
    time: '6 hours ago',
    beds: 4,
    baths: 3,
    area: '300 m²',
    photoCount: 9,
  },
];

export const MIXED_LISTINGS: Listing[] = [
  {
    title: 'Mercedes-Benz E200 2021 - 45,000 km - full options',
    price: 'EGP 2,850,000',
    location: 'Sheikh Zayed, Giza',
    time: '3 hours ago',
    featured: true,
    photoCount: 14,
  },
  {
    title: 'iPhone 15 Pro Max 256GB - like new with box',
    price: 'EGP 62,000',
    location: 'Mohandessin, Giza',
    time: '1 hour ago',
    photoCount: 6,
  },
  PROPERTY_LISTINGS[1],
  {
    title: 'Samsung 55 inch 4K smart TV - barely used',
    price: 'EGP 18,900',
    location: '6th of October, Giza',
    time: '4 hours ago',
    photoCount: 11,
  },
  {
    title: 'هيونداي النترا 2019 فابريكا بالكامل',
    price: 'EGP 1,150,000',
    location: 'Mansoura',
    time: 'منذ ساعتين',
    photoCount: 9,
  },
  {
    title: 'Studio for rent Sheikh Zayed furnished',
    price: 'EGP 12,000 / month',
    location: 'Sheikh Zayed, Giza',
    time: '3 hours ago',
    beds: 1,
    baths: 1,
    area: '65 m²',
    photoCount: 22,
  },
];

export const CATEGORIES = [
  'Properties',
  'Vehicles',
  'Mobile Phones & Tablets',
  'Electronics & Home Appliances',
  'Home Furniture - Decor',
  'Jobs',
  'Fashion & Beauty',
  'Services',
];

export const CAIRO_AREAS = ['New Cairo', 'Maadi', 'Zamalek', '6th of October', 'Sheikh Zayed'];

export const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5+'];

export const AD_DETAIL = {
  price: 'EGP 8,500,000',
  title: 'Apartment for sale in Zamalek 200m fully finished',
  location: 'Zamalek, Cairo',
  posted: 'Posted 2 hours ago · Ad ID 208328828',
  description:
    'Fully finished apartment in a prime Zamalek location, 200 m² with three bedrooms and two bathrooms. Fourth floor with elevator, private entrance, and two balconies overlooking a quiet side street. Close to schools, clubs and transport. Cash only, price slightly negotiable for a serious buyer.',
  specs: [
    ['Type', 'Apartment'],
    ['Bedrooms', '3'],
    ['Bathrooms', '2'],
    ['Area', '200 m²'],
    ['Furnished', 'Unfurnished'],
    ['Level', '4'],
    ['Payment Option', 'Cash'],
    ['Delivery Term', 'Finished'],
  ] as const,
  amenities: ['Elevator', 'Balcony', 'Security', 'Parking', 'Private Entrance', 'Air Conditioning'],
  seller: { name: 'Ahmed H.', memberSince: 'Member since 2021' },
};
