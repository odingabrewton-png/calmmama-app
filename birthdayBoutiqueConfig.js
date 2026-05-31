export const BIRTHDAY_DISCOUNT_PERCENT = 50;

export const BIRTHDAY_BUNDLE_OPTIONS = [
  {
    id: 'candle-scrub',
    label: 'Option A',
    title: '1 Candle + 1 Body Scrub',
    subtitle: 'Mix your ritual — one glow, one glow-up.',
    emoji: '🕯️✨',
  },
  {
    id: 'two-candles',
    label: 'Option B',
    title: '2 Village Candles',
    subtitle: 'Double the golden-hour & cloud-nine calm.',
    emoji: '🕯️🕯️',
  },
  {
    id: 'two-scrubs',
    label: 'Option C',
    title: '2 Body Scrubs',
    subtitle: 'Twin exfoliating sanctuary soaks.',
    emoji: '🫧🫧',
  },
];

export function buildBirthdayBundleProductIds(bundleId, picks) {
  switch (bundleId) {
    case 'candle-scrub':
      return [picks.candle1, picks.scrub1].filter(Boolean);
    case 'two-candles':
      return [picks.candle1, picks.candle2].filter(Boolean);
    case 'two-scrubs':
      return [picks.scrub1, picks.scrub2].filter(Boolean);
    default:
      return [];
  }
}
