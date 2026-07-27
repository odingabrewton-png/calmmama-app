/**
 * Fairy Godmother secret ombre blends — unlocked at 4,000 Crown Points.
 * Animated washes for the village backdrop (web CSS + native Reanimated).
 */

export const DEFAULT_FAIRY_OMBRE_ID = 'dusk_lavender_rose';

/** Sentinel — Fairy Godmother can return to the regular Calm Mama village ombre. */
export const FAIRY_VILLAGE_DEFAULT_ID = 'village_calm_mama';

/**
 * Soft atmospheric hex washes that read as animated ombre overlays
 * on both web (CSS) and native (Reanimated).
 *
 * uiText: 'white' → village copy should use white for contrast on deeper washes
 * uiText: 'ink'   → soft pastels keep Calm Mama dark ink readable
 */
export const SECRET_FAIRY_THEMES = Object.freeze([
  {
    id: 'dusk_lavender_rose',
    label: 'Dusk Lavender & Rose',
    emoji: '💜',
    description: 'Soft lavender drifting into rose dusk',
    uiText: 'white',
    colors: Object.freeze({
      a: '#7A68B0',
      b: '#C47890',
      c: '#5A6A90',
      accent: '#F0E8FF',
    }),
    overlay: Object.freeze({
      from: 'rgba(122, 104, 176, 0.38)',
      via: 'rgba(196, 120, 144, 0.28)',
      to: 'rgba(90, 106, 144, 0.4)',
    }),
  },
  {
    id: 'warm_buttercream_sage',
    label: 'Warm Buttercream & Sage',
    emoji: '🌿',
    description: 'Creamy amber melting into soft sage',
    uiText: 'ink',
    colors: Object.freeze({
      a: '#E8C898',
      b: '#A8C4A8',
      c: '#D8C8B0',
      accent: '#5C4A28',
    }),
    overlay: Object.freeze({
      from: 'rgba(232, 200, 152, 0.35)',
      via: 'rgba(168, 196, 168, 0.28)',
      to: 'rgba(216, 200, 176, 0.32)',
    }),
  },
  {
    id: 'muted_blush_cocoa',
    label: 'Muted Blush & Cocoa',
    emoji: '🍫',
    description: 'Blush rose into warm cocoa mist',
    uiText: 'white',
    colors: Object.freeze({
      a: '#C47890',
      b: '#A88878',
      c: '#7A6870',
      accent: '#FFF0F4',
    }),
    overlay: Object.freeze({
      from: 'rgba(196, 120, 144, 0.36)',
      via: 'rgba(168, 136, 120, 0.3)',
      to: 'rgba(122, 104, 112, 0.38)',
    }),
  },
  {
    id: 'starlight_midnight_teal',
    label: 'Starlight Midnight & Teal',
    emoji: '🌌',
    description: 'Indigo night washing into teal glow',
    uiText: 'white',
    colors: Object.freeze({
      a: '#5A68A8',
      b: '#4A9888',
      c: '#486080',
      accent: '#E0FFF8',
    }),
    overlay: Object.freeze({
      from: 'rgba(90, 104, 168, 0.4)',
      via: 'rgba(74, 152, 136, 0.3)',
      to: 'rgba(72, 96, 128, 0.42)',
    }),
  },
  {
    id: 'golden_hour_peach_amethyst',
    label: 'Golden Hour Peach & Amethyst',
    emoji: '🌅',
    description: 'Peach sunset into soft amethyst',
    uiText: 'white',
    colors: Object.freeze({
      a: '#E8A878',
      b: '#A888C8',
      c: '#8878A0',
      accent: '#FFF4E8',
    }),
    overlay: Object.freeze({
      from: 'rgba(232, 168, 120, 0.36)',
      via: 'rgba(168, 136, 200, 0.32)',
      to: 'rgba(136, 120, 160, 0.38)',
    }),
  },
  {
    id: 'pearl_lilac_sky',
    label: 'Pearl Lilac Sky',
    emoji: '☁️',
    description: 'Light lilac drifting into powder sky',
    uiText: 'ink',
    colors: Object.freeze({
      a: '#D8D0F0',
      b: '#C8D8F0',
      c: '#E8E0F8',
      accent: '#4A3B5C',
    }),
    overlay: Object.freeze({
      from: 'rgba(216, 208, 240, 0.42)',
      via: 'rgba(200, 216, 240, 0.35)',
      to: 'rgba(232, 224, 248, 0.4)',
    }),
  },
  {
    id: 'meadow_dew_mint',
    label: 'Meadow Dew & Mint',
    emoji: '🌱',
    description: 'Fresh mint into soft meadow green',
    uiText: 'ink',
    colors: Object.freeze({
      a: '#B8DCC8',
      b: '#C8E8D8',
      c: '#D0E8C8',
      accent: '#2A4838',
    }),
    overlay: Object.freeze({
      from: 'rgba(184, 220, 200, 0.4)',
      via: 'rgba(200, 232, 216, 0.34)',
      to: 'rgba(208, 232, 200, 0.38)',
    }),
  },
  {
    id: 'honey_peach_cloud',
    label: 'Honey Peach Cloud',
    emoji: '🍑',
    description: 'Warm honey peach into cream cloud',
    uiText: 'ink',
    colors: Object.freeze({
      a: '#F0D0B8',
      b: '#F5E0D0',
      c: '#E8D0C0',
      accent: '#5C3D28',
    }),
    overlay: Object.freeze({
      from: 'rgba(240, 208, 184, 0.4)',
      via: 'rgba(245, 224, 208, 0.34)',
      to: 'rgba(232, 208, 192, 0.38)',
    }),
  },
  {
    id: 'rosewater_pearl',
    label: 'Rosewater Pearl',
    emoji: '🌸',
    description: 'Soft rosewater into pearl blush',
    uiText: 'ink',
    colors: Object.freeze({
      a: '#F0D0DC',
      b: '#F8E4EC',
      c: '#E8D0E0',
      accent: '#5C3848',
    }),
    overlay: Object.freeze({
      from: 'rgba(240, 208, 220, 0.4)',
      via: 'rgba(248, 228, 236, 0.34)',
      to: 'rgba(232, 208, 224, 0.38)',
    }),
  },
]);

/** Map retired theme ids → current Fairy Godmother blends. */
const LEGACY_THEME_ID_MAP = Object.freeze({
  starlight_lilac: 'dusk_lavender_rose',
  pastel_moonbeam: 'golden_hour_peach_amethyst',
  fairy_garden: 'warm_buttercream_sage',
  midnight_starlight: 'starlight_midnight_teal',
});

export function resolveFairyThemeId(themeId) {
  if (!themeId) return null;
  if (themeId === FAIRY_VILLAGE_DEFAULT_ID) return FAIRY_VILLAGE_DEFAULT_ID;
  const mapped = LEGACY_THEME_ID_MAP[themeId] || themeId;
  return SECRET_FAIRY_THEMES.some((theme) => theme.id === mapped) ? mapped : null;
}

export function getSecretThemeById(themeId) {
  const id = resolveFairyThemeId(themeId);
  if (!id || id === FAIRY_VILLAGE_DEFAULT_ID) return null;
  return SECRET_FAIRY_THEMES.find((theme) => theme.id === id) || null;
}

export function getActiveFairyTheme({ hasFairyGodmotherPerk, selectedSecretThemeId } = {}) {
  if (!hasFairyGodmotherPerk) return null;
  if (selectedSecretThemeId === FAIRY_VILLAGE_DEFAULT_ID) return null;
  return (
    getSecretThemeById(selectedSecretThemeId) ||
    getSecretThemeById(DEFAULT_FAIRY_OMBRE_ID) ||
    SECRET_FAIRY_THEMES[0]
  );
}

export function fairyThemeUsesWhiteText(theme) {
  return Boolean(theme && theme.uiText === 'white');
}

export function canUseSecretThemes({ hasFairyGodmotherPerk } = {}) {
  return Boolean(hasFairyGodmotherPerk);
}
