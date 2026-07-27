/**
 * Me-tab lounge backgrounds — free to all mamas (separate from Fairy Godmother village ombres).
 */

export const DEFAULT_ME_BACKGROUND_ID = 'midnight_studio';

export const ME_PROFILE_BACKGROUNDS = Object.freeze([
  {
    id: 'midnight_studio',
    label: 'Midnight Studio',
    emoji: '🌙',
    colors: ['#1A1626', '#14121C', '#0E0C14'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'sage_evening',
    label: 'Sage Evening',
    emoji: '🌿',
    colors: ['#1A2A24', '#14201C', '#0E1614'],
    locations: [0, 0.52, 1],
  },
  {
    id: 'cocoa_hearth',
    label: 'Cocoa Hearth',
    emoji: '☕',
    colors: ['#2A221C', '#1E1814', '#14100E'],
    locations: [0, 0.48, 1],
  },
  {
    id: 'blush_dusk',
    label: 'Blush Dusk',
    emoji: '🌸',
    colors: ['#2A1E24', '#1E161C', '#140F14'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'slate_mist',
    label: 'Slate Mist',
    emoji: '🌫️',
    colors: ['#1C2228', '#151A1F', '#0F1216'],
    locations: [0, 0.55, 1],
  },
  {
    id: 'golden_ember',
    label: 'Golden Ember',
    emoji: '✨',
    colors: ['#2A2418', '#1E1A12', '#14110C'],
    locations: [0, 0.5, 1],
  },
]);

/** Shared phone-safe Me column — keeps hub + edit page aligned across devices. */
export const ME_PROFILE_CONTENT_MAX_WIDTH = 440;
export const ME_PROFILE_H_PAD = 18;

export function getMeBackgroundById(themeId) {
  const id = String(themeId || '').trim();
  return (
    ME_PROFILE_BACKGROUNDS.find((theme) => theme.id === id) ||
    ME_PROFILE_BACKGROUNDS.find((theme) => theme.id === DEFAULT_ME_BACKGROUND_ID) ||
    ME_PROFILE_BACKGROUNDS[0]
  );
}

export function resolveMeBackgroundId(themeId) {
  const id = String(themeId || '').trim();
  return ME_PROFILE_BACKGROUNDS.some((theme) => theme.id === id)
    ? id
    : DEFAULT_ME_BACKGROUND_ID;
}
