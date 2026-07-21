import { normalizeVillageItemKey } from './villagePollDuplicateEngine';

export const REGISTRY_PLATFORM_OPTIONS = [
  {
    id: 'amazon',
    label: 'Amazon',
    emoji: '📦',
    url: 'https://www.amazon.com/baby-reg/homepage',
  },
  {
    id: 'target',
    label: 'Target',
    emoji: '🎯',
    url: 'https://www.target.com/gift-registry/baby-registry',
  },
  {
    id: 'babylist',
    label: 'Babylist',
    emoji: '🍼',
    url: 'https://www.babylist.com/',
  },
];

const BRAND_SUGGESTIONS = [
  {
    keywords: ['wipe warmer', 'wipes warmer', 'wipe warmers'],
    brands: ['Munchkin', 'Hiccapop', 'Prince Lionheart'],
  },
  {
    keywords: ['bottle', 'bottles'],
    brands: ['Philips Avent', 'Comotomo', "Dr. Brown's"],
  },
  {
    keywords: ['stroller', 'pram'],
    brands: ['UPPAbaby', 'Baby Jogger', 'Mockingbird'],
  },
];

const DEFAULT_BRANDS = ['Munchkin', 'Hiccapop', 'Skip Hop'];

export function getRegistryBrandSuggestions(itemLabel) {
  const normalized = normalizeVillageItemKey(itemLabel);
  for (const entry of BRAND_SUGGESTIONS) {
    if (entry.keywords.some((keyword) => normalized.includes(normalizeVillageItemKey(keyword)))) {
      return entry.brands;
    }
  }
  return DEFAULT_BRANDS;
}

export function buildBrandShopUrl(platformId, brandName, itemLabel) {
  const query = encodeURIComponent(`${brandName} ${itemLabel}`.trim());
  if (platformId === 'amazon') {
    return `https://www.amazon.com/s?k=${query}`;
  }
  if (platformId === 'target') {
    return `https://www.target.com/s?searchTerm=${query}`;
  }
  if (platformId === 'babylist') {
    return `https://www.babylist.com/shop/search?q=${query}`;
  }
  return REGISTRY_PLATFORM_OPTIONS[0].url;
}
