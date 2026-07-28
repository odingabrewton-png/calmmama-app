/**
 * Me-tab lounge backgrounds — free to all mamas (separate from Fairy Godmother village ombres).
 * Default is Calm Mama village pass-through so the living pastel ombre shows through.
 */

import { CALM_MAMA_PASTEL } from './calmMamaPastelPalette';

export const DEFAULT_ME_BACKGROUND_ID = 'calm_mama';

export const ME_PROFILE_BACKGROUNDS = Object.freeze([
  {
    id: 'calm_mama',
    label: 'Calm Mama',
    emoji: '🪷',
    /** No Me overlay — village sage / lavender / peach ombre shows through. */
    passThrough: true,
    light: true,
    colors: [CALM_MAMA_PASTEL.sage, CALM_MAMA_PASTEL.lavender, CALM_MAMA_PASTEL.peach],
    locations: [0, 0.5, 1],
  },
  {
    id: 'soft_lilac_mist',
    label: 'Lilac Mist',
    emoji: '💜',
    light: true,
    colors: ['#E8E0F5', '#D8D0EE', '#F2ECFA'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'sage_morning',
    label: 'Sage Morning',
    emoji: '🌿',
    light: true,
    colors: ['#D8E8DC', '#C8DCCE', '#E8F2EA'],
    locations: [0, 0.52, 1],
  },
  {
    id: 'peach_bloom',
    label: 'Peach Bloom',
    emoji: '🍑',
    light: true,
    colors: ['#F5E0D4', '#EED4C4', '#FAEBE4'],
    locations: [0, 0.48, 1],
  },
  {
    id: 'sky_powder',
    label: 'Sky Powder',
    emoji: '☁️',
    light: true,
    colors: ['#D8E4F4', '#C8D8EC', '#E8F0FA'],
    locations: [0, 0.55, 1],
  },
  {
    id: 'buttercream',
    label: 'Buttercream',
    emoji: '✨',
    light: true,
    colors: ['#F5ECD8', '#EBE0C8', '#FAF4E8'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'rosewater',
    label: 'Rosewater',
    emoji: '🌸',
    light: true,
    colors: ['#F5DCE6', '#EED0DC', '#FAEAF0'],
    locations: [0, 0.5, 1],
  },
]);

/** Shared phone-safe Me column — keeps hub + edit page aligned across devices. */
export const ME_PROFILE_CONTENT_MAX_WIDTH = 440;
export const ME_PROFILE_H_PAD = 18;

/** Map retired dark Me washes → light replacements. */
const LEGACY_ME_BACKGROUND_MAP = Object.freeze({
  midnight_studio: 'calm_mama',
  sage_evening: 'sage_morning',
  cocoa_hearth: 'buttercream',
  blush_dusk: 'rosewater',
  slate_mist: 'sky_powder',
  golden_ember: 'buttercream',
});

export function getMeBackgroundById(themeId) {
  const raw = String(themeId || '').trim();
  const id = LEGACY_ME_BACKGROUND_MAP[raw] || raw;
  return (
    ME_PROFILE_BACKGROUNDS.find((theme) => theme.id === id) ||
    ME_PROFILE_BACKGROUNDS.find((theme) => theme.id === DEFAULT_ME_BACKGROUND_ID) ||
    ME_PROFILE_BACKGROUNDS[0]
  );
}

export function resolveMeBackgroundId(themeId) {
  const raw = String(themeId || '').trim();
  const id = LEGACY_ME_BACKGROUND_MAP[raw] || raw;
  return ME_PROFILE_BACKGROUNDS.some((theme) => theme.id === id)
    ? id
    : DEFAULT_ME_BACKGROUND_ID;
}

export function meBackgroundUsesLightText(theme) {
  return !theme?.light && !theme?.passThrough;
}

/** Dark ink for readable copy on light / pass-through Me washes. */
export const ME_INK_ON_LIGHT = Object.freeze({
  primary: '#2A2540',
  secondary: 'rgba(42, 37, 64, 0.78)',
  muted: 'rgba(42, 37, 64, 0.55)',
  accent: '#6B5588',
  gold: '#8A6A3C',
  placeholder: 'rgba(42, 37, 64, 0.42)',
});

export function getMeSurfaceInk(theme) {
  if (theme?.light || theme?.passThrough) {
    return {
      onLight: true,
      primary: ME_INK_ON_LIGHT.primary,
      secondary: ME_INK_ON_LIGHT.secondary,
      muted: ME_INK_ON_LIGHT.muted,
      accent: ME_INK_ON_LIGHT.accent,
      gold: ME_INK_ON_LIGHT.gold,
      placeholder: ME_INK_ON_LIGHT.placeholder,
    };
  }
  return {
    onLight: false,
    primary: '#F4F2FA',
    secondary: 'rgba(232, 229, 247, 0.72)',
    muted: 'rgba(232, 229, 247, 0.48)',
    accent: '#C4B8E8',
    gold: '#D4B896',
    placeholder: 'rgba(232, 229, 247, 0.48)',
  };
}
