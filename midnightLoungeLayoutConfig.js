/**
 * MIDNIGHT LOUNGE — LAYOUT LOCKED
 * Do not change shell structure, tab bar, feed/rituals stack order, or card
 * regions unless the user explicitly says "UNLOCK LOUNGE LAYOUT".
 */

export const MIDNIGHT_LOUNGE_LAYOUT_LOCKED = true;

/** Bottom navigation tabs (order and ids are frozen). */
export const MIDNIGHT_LOUNGE_TABS = Object.freeze([
  { id: 'home', icon: '🌙', label: 'Rituals' },
  { id: 'village', icon: '📍', label: 'Village' },
  { id: 'feed', icon: '🪷', label: 'Lounge', center: true },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'profile', icon: '👤', label: 'Me' },
]);

/** Shell chrome regions (header · body · bottom nav). */
export const MIDNIGHT_LOUNGE_SHELL = Object.freeze({
  header: 'ml-header',
  body: 'ml-body',
  bottomNav: 'ml-bottom-nav',
});

/** Feed tab stack order (top → bottom). */
export const MIDNIGHT_LOUNGE_FEED_STACK = Object.freeze([
  'feed-intro',
  'ask-midnight-lounge',
  'live-poll-feed',
  'feed-posts',
]);

/** Rituals tab stack order (top → bottom). */
export const MIDNIGHT_LOUNGE_RITUALS_STACK = Object.freeze([
  'rituals-greeting',
  'tonights-mantra',
  'gratitude-checkin',
  'journey-feature-cards',
]);

/** Pregnant journey ritual feature card ids (order frozen). */
export const MIDNIGHT_LOUNGE_PREGNANT_FEATURE_IDS = Object.freeze([
  'ml-journal',
  'ml-pregnancy-oracle',
]);

/** Postpartum journey ritual feature card ids (order frozen). */
export const MIDNIGHT_LOUNGE_POSTPARTUM_FEATURE_IDS = Object.freeze([
  'ml-journal',
  'ml-baby-oracle',
]);

/** Full-screen sub-views opened from ritual cards. */
export const MIDNIGHT_LOUNGE_SUB_VIEWS = Object.freeze([
  'journal',
  'pregnancy-oracle',
  'baby-oracle',
]);

export const MIDNIGHT_LOUNGE_LAYOUT = Object.freeze({
  feedPadHorizontal: 16,
  feedPadTop: 16,
  feedPadBottom: 140,
  feedIntroMarginBottom: 18,
  feedIntroPad: 16,
  feedIntroRadius: 20,
  askCardMarginBottom: 14,
  askCardPad: 16,
  askCardRadius: 24,
  headerPadHorizontal: 16,
  headerPadVertical: 12,
});
