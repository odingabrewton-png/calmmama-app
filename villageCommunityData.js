/** Mock local village data — privacy-safe distances only */

export const VILLAGE_PRIVACY_TITLE = '🔒 Private & Secure';

export const VILLAGE_PRIVACY_DESCRIPTION =
  'Exact locations are hidden behind the Village Shield. Contact lines remain fully encrypted inside the sanctuary walls.';

/** @deprecated Use VILLAGE_PRIVACY_TITLE + VILLAGE_PRIVACY_DESCRIPTION */
export const VILLAGE_PRIVACY_BANNER = `${VILLAGE_PRIVACY_TITLE}: ${VILLAGE_PRIVACY_DESCRIPTION}`;

export const ICEBREAKER_HINTS = [
  'What show is keeping you preoccupied right now?',
  'Any interesting books to read when you can\'t sleep?',
  'What is your favorite pastime activity?',
];

export const ICEBREAKER_PLACEHOLDER =
  'Share a show, book, pastime, or gentle thought with your village…';

export const BASKET_SHARE_HINTS = [
  'Give it a short title, then a soft detail — same shape as the village examples below.',
  'Extra newborn clothes your little one outgrew?',
  'Unopened diapers, wipes, or formula to pass along?',
];

export const BASKET_SHARE_TITLE_PLACEHOLDER = 'Short title (ex: Size 1 Pampers)';

export const BASKET_SHARE_DETAIL_PLACEHOLDER =
  'A little more detail (ex: Unopened partial box — smoke-free home)…';

/** @deprecated Prefer title + detail placeholders */
export const BASKET_SHARE_PLACEHOLDER = BASKET_SHARE_TITLE_PLACEHOLDER;

const DEFAULT_OFFERING_DETAIL =
  'Happy to share with a nearby mama — coordinate safely in the Village Support Hub.';
const DEFAULT_SEEKING_DETAIL =
  'Looking for gentle village help — happy to coordinate safely in the Support Hub.';

/**
 * Shape a mama's basket draft like the example cards: short title + supporting detail.
 * Avoids duplicating the same line as both title and detail.
 */
export function buildBasketListingFields({ title, detail, mode } = {}) {
  let resolvedTitle = String(title || '').trim();
  let resolvedDetail = String(detail || '').trim();

  // Single-box / pasted drafts: first line = title, rest = detail.
  if (resolvedTitle && !resolvedDetail && /\n/.test(resolvedTitle)) {
    const lines = resolvedTitle.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    resolvedTitle = lines[0] || '';
    resolvedDetail = lines.slice(1).join(' ').trim();
  }

  // Long single sentence: first sentence becomes title, remainder becomes detail.
  if (resolvedTitle && !resolvedDetail && resolvedTitle.length > 56) {
    const sentence = resolvedTitle.match(/^(.{12,72}?[.!?])\s+(.+)$/);
    if (sentence) {
      resolvedTitle = sentence[1].trim();
      resolvedDetail = sentence[2].trim();
    }
  }

  // "Title — detail" or "Title - detail" pattern (when still one blob).
  if (resolvedTitle && !resolvedDetail) {
    const emDash = resolvedTitle.match(/^(.{8,72}?)\s+[—–-]\s+(.+)$/);
    if (emDash) {
      resolvedTitle = emDash[1].trim();
      resolvedDetail = emDash[2].trim();
    }
  }

  // Keep a concise title line like the example cards.
  if (resolvedTitle.length > 64) {
    resolvedTitle = `${resolvedTitle.slice(0, 61).trim()}…`;
  }

  if (!resolvedTitle && resolvedDetail) {
    resolvedTitle =
      resolvedDetail.length > 52 ? `${resolvedDetail.slice(0, 52).trim()}…` : resolvedDetail;
    resolvedDetail =
      mode === 'seeking' ? DEFAULT_SEEKING_DETAIL : DEFAULT_OFFERING_DETAIL;
  }

  if (resolvedTitle && (!resolvedDetail || resolvedDetail === resolvedTitle)) {
    resolvedDetail =
      mode === 'seeking' ? DEFAULT_SEEKING_DETAIL : DEFAULT_OFFERING_DETAIL;
  }

  return {
    title: resolvedTitle,
    detail: resolvedDetail,
    tag: mode === 'seeking' ? 'Seeking' : 'Offering',
  };
}

export const ZONE_TINTS = {
  sage: {
    ring: 'rgba(186, 198, 188, 0.55)',
    fill: 'rgba(186, 214, 198, 0.32)',
    glow: 'rgba(186, 210, 178, 0.4)',
  },
  peach: {
    ring: 'rgba(233, 168, 137, 0.58)',
    fill: 'rgba(233, 168, 137, 0.28)',
    glow: 'rgba(233, 168, 137, 0.38)',
  },
  lavender: {
    ring: 'rgba(200, 180, 215, 0.55)',
    fill: 'rgba(210, 190, 225, 0.3)',
    glow: 'rgba(195, 175, 210, 0.38)',
  },
};

export const MAP_PRIVACY_ZONES = [
  { id: 'z1', top: '14%', left: '10%', size: 86, label: '~1.2 mi', tint: 'sage' },
  { id: 'z2', top: '48%', left: '56%', size: 98, label: '~2.1 mi', tint: 'peach' },
  { id: 'z3', top: '66%', left: '18%', size: 76, label: '~0.9 mi', tint: 'lavender' },
  { id: 'z4', top: '24%', left: '64%', size: 90, label: '~1.8 mi', tint: 'peach' },
];

export const NEARBY_MAMA_PROFILES = [
  {
    id: 'm1',
    nickname: 'Sage Bloom Mama',
    persona: 'Pregnant · 28 weeks',
    distance: '1.2 miles away',
    bio: 'First-time mama nesting in the village — love gentle walks and birth-plan chats.',
  },
  {
    id: 'm2',
    nickname: 'Moonlit Nest',
    persona: 'Postpartum · 2 months',
    distance: '2.1 miles away',
    bio: 'Surviving the fourth trimester with coffee, crocheting, and late-night feeding solidarity.',
  },
  {
    id: 'm3',
    nickname: 'Terracotta Heart',
    persona: 'Pregnant · 32 weeks',
    distance: '0.9 miles away',
    bio: 'Looking for local mamas who understand heartburn humor and nursery paint indecision.',
  },
  {
    id: 'm4',
    nickname: 'Village Willow',
    persona: 'Postpartum · 6 weeks',
    distance: '1.8 miles away',
    bio: 'Healing slowly, celebrating tiny wins — happy to swap recovery tips and meal ideas.',
  },
];

export const BASKET_OFFERINGS = [
  {
    id: 'o1',
    title: 'Baby Boy 0-3 Month Clothing Set',
    detail: 'Gently washed onesies, sleepers, and socks — smoke-free home.',
    tag: 'Offering',
  },
  {
    id: 'o2',
    title: 'Surplus Size 1 Diapers / Pampers',
    detail: 'Unopened partial box + 12 loose diapers for emergency village runs.',
    tag: 'Offering',
  },
  {
    id: 'o3',
    title: 'Newborn Care Bundle',
    detail: 'Bulb syringe, peri bottle, soft swaddles, and extra nipple shields.',
    tag: 'Offering',
  },
];

export const BASKET_SEEKING = [
  {
    id: 's1',
    title: 'Baby Girl Newborn Outfits',
    detail: 'Seeking neutral/pink 0-3 month sets for our surprise little flower.',
    tag: 'Seeking',
  },
  {
    id: 's2',
    title: 'Size 2 Overnight Diapers',
    detail: 'Running low this week — happy to coordinate porch pickup.',
    tag: 'Seeking',
  },
  {
    id: 's3',
    title: 'Postpartum Recovery Supplies',
    detail: 'Looking for unused peri bottles, sitz bath herbs, or comfy high-waist pants.',
    tag: 'Seeking',
  },
];

export const COMMUNITY_POSTS_SEED = [
  {
    id: 'p1',
    author: 'Sage Bloom Mama',
    time: 'Today · 9:14 AM',
    body: 'Anyone else feeling the nesting urge hit like a wave today? Sending soft encouragement to all of us tidying tiny socks.',
    replies: [
      { id: 'r1', author: 'Village Willow', text: 'Yes! I reorganized the bassinet three times already.', time: '9:22 AM' },
    ],
  },
  {
    id: 'p2',
    author: 'Moonlit Nest',
    time: 'Today · 7:40 AM',
    body: 'Survival check-in: baby slept 2.5 hours and I actually showered. Small wins matter.',
    replies: [
      { id: 'r2', author: 'Terracotta Heart', text: 'So proud of you — celebrating that shower like a festival.', time: '7:48 AM' },
    ],
  },
  {
    id: 'p3',
    author: 'Terracotta Heart',
    time: 'Yesterday · 8:05 PM',
    body: 'Open thought: what helped you most during the last weeks of pregnancy? Building my gentle toolkit.',
    replies: [],
  },
];
