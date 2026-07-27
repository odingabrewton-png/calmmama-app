/**
 * Redeemable cosmetic perks — sticker pack (300 pts) + themed app icon (500 pts).
 */

export const DEFAULT_STICKER_ID = 'lotus_bloom';
export const DEFAULT_APP_ICON_ID = 'lavender_lotus';

export const VILLAGE_STICKERS = Object.freeze([
  { id: 'lotus_bloom', emoji: '🪷', label: 'Lotus Bloom' },
  { id: 'soft_heart', emoji: '💗', label: 'Soft Heart' },
  { id: 'moon_glow', emoji: '🌙', label: 'Moon Glow' },
  { id: 'village_star', emoji: '✨', label: 'Village Star' },
  { id: 'sage_leaf', emoji: '🌿', label: 'Sage Leaf' },
  { id: 'warm_tea', emoji: '☕', label: 'Warm Tea' },
  { id: 'baby_cloud', emoji: '☁️', label: 'Baby Cloud' },
  { id: 'crown_soft', emoji: '👑', label: 'Soft Crown' },
]);

export const VILLAGE_APP_ICONS = Object.freeze([
  {
    id: 'lavender_lotus',
    emoji: '🪷',
    label: 'Lavender Lotus',
    colors: ['#C4B8E8', '#8A7AB8'],
  },
  {
    id: 'sage_sanctuary',
    emoji: '🌿',
    label: 'Sage Sanctuary',
    colors: ['#A8C4B0', '#6B8F78'],
  },
  {
    id: 'peach_dusk',
    emoji: '🌅',
    label: 'Peach Dusk',
    colors: ['#F0C4A0', '#C4886A'],
  },
  {
    id: 'midnight_moon',
    emoji: '🌙',
    label: 'Midnight Moon',
    colors: ['#6B7A9A', '#2A3548'],
  },
  {
    id: 'rose_gold_heart',
    emoji: '💗',
    label: 'Rose Gold Heart',
    colors: ['#E8B8C8', '#A86A7A'],
  },
  {
    id: 'golden_crown',
    emoji: '👑',
    label: 'Golden Crown',
    colors: ['#E8D4A8', '#B8965C'],
  },
]);

export function resolveStickerId(stickerId) {
  const id = String(stickerId || '').trim();
  return VILLAGE_STICKERS.some((item) => item.id === id) ? id : DEFAULT_STICKER_ID;
}

export function resolveAppIconId(iconId) {
  const id = String(iconId || '').trim();
  return VILLAGE_APP_ICONS.some((item) => item.id === id) ? id : DEFAULT_APP_ICON_ID;
}

export function getStickerById(stickerId) {
  const id = resolveStickerId(stickerId);
  return VILLAGE_STICKERS.find((item) => item.id === id) || VILLAGE_STICKERS[0];
}

export function getAppIconById(iconId) {
  const id = resolveAppIconId(iconId);
  return VILLAGE_APP_ICONS.find((item) => item.id === id) || VILLAGE_APP_ICONS[0];
}
