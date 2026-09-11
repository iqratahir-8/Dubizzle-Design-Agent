/**
 * Icon names in the monorepo are camelCase with `_inline` / `_noinline` suffixes that
 * describe the webpack loader, not the icon. Strip that, kebab-case the rest, and sort
 * into buckets a designer would actually browse by.
 */

export function normalizeName(filename) {
  return filename
    .replace(/\.(svg|webp|png|jpg)$/i, '')
    .replace(/_(no)?inline$/i, '')
    .replace(/^icon(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

const RULES = [
  ['brand', /^(logo|brand|dubizzle|bayut|olx|app-store|google-play|app-gallery|huawei|pro-logo)/],
  ['payment', /(payment|fawry|valu|vodafone|orange-money|apple-pay|etisalat|visa|mastercard|meeza|wallet|credit-coin|card|paymob|installment)/],
  ['social', /(facebook|twitter|instagram|linkedin|youtube|whatsapp|tiktok|snapchat|telegram|share)/],
  ['category', /(animals|bikes|books|business|electronics|fashion|furniture|jobs|kids|mobiles|services|vehicles|hobbies|sports|agricultural|heavy|food|pets|health|beauty|industrial)/],
  ['property', /(bed|bath|area|apartment|villa|duplex|studio|chalet|townhouse|penthouse|floor|amenity|amenities|furnished|compound|freehold|room)/],
  ['vehicle', /(car|motor|engine|fuel|transmission|mileage|kilometer|gearbox|body-type|cylinder|horsepower|seller-type|trim|plate|inspection|auction)/],
  ['navigation', /(chevron|arrow|back|forward|next|prev|menu|burger|home|nav|tab|breadcrumb|caret|expand|collapse|scroll|top)/],
  ['action', /(search|filter|sort|add|plus|minus|close|cross|delete|trash|edit|pencil|copy|download|upload|refresh|reload|play|pause|zoom|crop|rotate|save|bookmark|favourite|favorite|heart|like|report|flag|block|call|phone|chat|message|mail|email|send|link|print|more|dots|settings|gear|logout|login|eye|hide|show|notification|bell)/],
  ['status', /(check|tick|success|verified|applied|posted|warning|error|alert|info|pending|expired|live|boost|promote|featured|elite|premium|star|rating|badge|lock|shield|secure|clock|time|calendar|date)/],
  ['media', /(camera|photo|image|gallery|video|picture|film|panorama|360|virtual-tour)/],
  ['location', /(location|pin|map|marker|geo|city|country|directions|compass|nearby)/],
  ['user', /(user|profile|avatar|account|agency|agent|person|people|seller|buyer|contact)/],
];

export function categorize(normalized) {
  for (const [bucket, pattern] of RULES) {
    if (pattern.test(normalized)) return bucket;
  }
  return 'misc';
}

export const CATEGORY_ORDER = [
  'brand',
  'navigation',
  'action',
  'status',
  'category',
  'property',
  'vehicle',
  'location',
  'user',
  'media',
  'payment',
  'social',
  'misc',
];
