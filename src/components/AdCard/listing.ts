/**
 * Listing data shared by the two ad card types — AdCard (grid) and AdListCard (list).
 * The same ad renders in both, so templates can pass one object to either.
 */
export type Device = 'desktop' | 'mobile';

export interface ListingAttribute {
  label: string;
  value: string;
}

export interface Listing {
  price: string;
  title: string;
  location: string;
  time: string;
  imageUrl?: string;
  /** "Negotiable" — shown after the price when there is no down payment. */
  priceNote?: string;
  /** Down payment amount, e.g. "EGP 1,106,500" — shown as a grey chip after the price. */
  downPayment?: string;
  /** Property type ("Apartment", "Stand Alone Villa") — leads the spec line. */
  type?: string;
  /** Cars: brand and model, shown as "Mercedes-Benz • CLA 200" on list cards. */
  brand?: string;
  model?: string;
  beds?: number | string;
  baths?: number | string;
  area?: string;
  /** Free-form spec line for other verticals, e.g. ["4000 km", "2025"]. */
  specs?: string[];
  /** List-card attribute chips: Year 2024, Completion Status Ready… */
  attributes?: ListingAttribute[];
  featured?: boolean;
  elite?: boolean;
  photoCount?: number;
}

/** The spec items after the property type: beds/baths/area for property, `specs` otherwise. */
export function specItems(listing: Listing): string[] {
  if (listing.specs?.length) return listing.specs;
  const items: string[] = [];
  if (listing.beds != null) items.push(`${listing.beds} beds`);
  if (listing.baths != null) items.push(`${listing.baths} baths`);
  if (listing.area) items.push(listing.area);
  return items;
}
