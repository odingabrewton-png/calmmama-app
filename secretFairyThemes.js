/**
 * Fairy Godmother secret color palettes — unlocked at 4,000 Crown Points.
 */

export const SECRET_FAIRY_THEMES = Object.freeze([
  {
    id: 'starlight_lilac',
    label: 'Starlight Lilac',
    emoji: '✨',
    description: 'Soft lilac mist with silver sparkle',
    colors: Object.freeze({
      a: '#D4C4F0',
      b: '#B8A8E8',
      c: '#F0E8FF',
      accent: '#E8D4F8',
    }),
  },
  {
    id: 'pastel_moonbeam',
    label: 'Pastel Moonbeam',
    emoji: '🌙',
    description: 'Creamy peach and blush moon wash',
    colors: Object.freeze({
      a: '#F5D6C8',
      b: '#E8C4D8',
      c: '#FFF0E8',
      accent: '#F8E0D0',
    }),
  },
  {
    id: 'fairy_garden',
    label: 'Fairy Garden',
    emoji: '🧚',
    description: 'Dewy mint and petal pink starlight',
    colors: Object.freeze({
      a: '#C8E8D8',
      b: '#E8D0E8',
      c: '#F0F8F0',
      accent: '#D8F0E0',
    }),
  },
  {
    id: 'midnight_starlight',
    label: 'Midnight Starlight',
    emoji: '⭐',
    description: 'Deep indigo velvet with soft glow',
    colors: Object.freeze({
      a: '#6B5A8A',
      b: '#9A88C0',
      c: '#4A3B6A',
      accent: '#C4B8E8',
    }),
  },
]);

export function getSecretThemeById(themeId) {
  if (!themeId) return null;
  return SECRET_FAIRY_THEMES.find((theme) => theme.id === themeId) || null;
}

export function canUseSecretThemes({ hasFairyGodmotherPerk } = {}) {
  return Boolean(hasFairyGodmotherPerk);
}
