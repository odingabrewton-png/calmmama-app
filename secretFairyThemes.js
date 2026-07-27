/**
 * Fairy Godmother secret ombre blends — unlocked at 4,000 Crown Points.
 * Five custom washes that replace / blend into the village backdrop.
 */

export const DEFAULT_FAIRY_OMBRE_ID = 'dusk_lavender_rose';

/**
 * Tailwind-inspired stops approximated as soft atmospheric hex washes
 * so they read as ombre overlays on both web (CSS) and native (Reanimated).
 */
export const SECRET_FAIRY_THEMES = Object.freeze([
  {
    id: 'dusk_lavender_rose',
    label: 'Dusk Lavender & Rose',
    emoji: '💜',
    description: 'from-purple-950/30 via-rose-900/20 to-slate-900',
    /** Soft mid-tones for readable UI + deep accents for depth */
    colors: Object.freeze({
      a: '#3D2A6B',
      b: '#7A3B55',
      c: '#1E293B',
      accent: '#C4B0E8',
    }),
    /** Explicit overlay stops (higher opacity toward dusk) */
    overlay: Object.freeze({
      from: 'rgba(46, 16, 101, 0.42)',
      via: 'rgba(136, 19, 55, 0.28)',
      to: 'rgba(15, 23, 42, 0.55)',
    }),
  },
  {
    id: 'warm_buttercream_sage',
    label: 'Warm Buttercream & Sage',
    emoji: '🌿',
    description: 'from-amber-950/25 via-emerald-950/15 to-stone-900',
    colors: Object.freeze({
      a: '#5C3D1E',
      b: '#1F4A3A',
      c: '#292524',
      accent: '#E8D4A8',
    }),
    overlay: Object.freeze({
      from: 'rgba(69, 26, 3, 0.38)',
      via: 'rgba(2, 44, 34, 0.24)',
      to: 'rgba(28, 25, 23, 0.52)',
    }),
  },
  {
    id: 'muted_blush_cocoa',
    label: 'Muted Blush & Cocoa',
    emoji: '🍫',
    description: 'from-pink-950/30 via-stone-900/40 to-neutral-950',
    colors: Object.freeze({
      a: '#6B2040',
      b: '#3F3530',
      c: '#171717',
      accent: '#E8B8C8',
    }),
    overlay: Object.freeze({
      from: 'rgba(80, 7, 36, 0.42)',
      via: 'rgba(28, 25, 23, 0.45)',
      to: 'rgba(10, 10, 10, 0.58)',
    }),
  },
  {
    id: 'starlight_midnight_teal',
    label: 'Starlight Midnight & Teal',
    emoji: '🌌',
    description: 'from-indigo-950/30 via-teal-950/20 to-slate-950',
    colors: Object.freeze({
      a: '#2A2758',
      b: '#0F3F3C',
      c: '#0B1220',
      accent: '#A8E0D8',
    }),
    overlay: Object.freeze({
      from: 'rgba(30, 27, 75, 0.42)',
      via: 'rgba(4, 47, 46, 0.3)',
      to: 'rgba(2, 6, 23, 0.58)',
    }),
  },
  {
    id: 'golden_hour_peach_amethyst',
    label: 'Golden Hour Peach & Amethyst',
    emoji: '🌅',
    description: 'from-orange-950/25 via-purple-950/25 to-zinc-950',
    colors: Object.freeze({
      a: '#6B3418',
      b: '#4A2A6B',
      c: '#18181B',
      accent: '#F0C4A0',
    }),
    overlay: Object.freeze({
      from: 'rgba(67, 20, 7, 0.38)',
      via: 'rgba(46, 16, 101, 0.36)',
      to: 'rgba(9, 9, 11, 0.55)',
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
  const mapped = LEGACY_THEME_ID_MAP[themeId] || themeId;
  return SECRET_FAIRY_THEMES.some((theme) => theme.id === mapped) ? mapped : null;
}

export function getSecretThemeById(themeId) {
  const id = resolveFairyThemeId(themeId);
  if (!id) return null;
  return SECRET_FAIRY_THEMES.find((theme) => theme.id === id) || null;
}

export function getActiveFairyTheme({ hasFairyGodmotherPerk, selectedSecretThemeId } = {}) {
  if (!hasFairyGodmotherPerk) return null;
  return (
    getSecretThemeById(selectedSecretThemeId) ||
    getSecretThemeById(DEFAULT_FAIRY_OMBRE_ID) ||
    SECRET_FAIRY_THEMES[0]
  );
}

export function canUseSecretThemes({ hasFairyGodmotherPerk } = {}) {
  return Boolean(hasFairyGodmotherPerk);
}
