/**
 * PREGNANT MAMA DAILY TAB — LAYOUT LOCKED
 * Do not change scroll structure, card stack order, or card regions unless the user
 * explicitly says "UNLOCK DAILY LAYOUT".
 *
 * Related locks:
 * - Home: pregnantHomeLayoutConfig.js ("UNLOCK LAYOUT")
 * - Bloom: pregnantBloomLayoutConfig.js ("UNLOCK BLOOM LAYOUT")
 * - Kitchen images may be updated without unlocking this tab.
 */

export const PREGNANT_DAILY_LAYOUT_LOCKED = true;

/** Daily tab stack order (top → bottom) for pregnant journey only. */
export const PREGNANT_DAILY_STACK = Object.freeze([
  'daily-tab-header',
  'symptom-tracker-card',
  'kick-counter-card',
  'nesting-checklist-card',
]);

/** Frozen glass-card regions inside the daily stack. */
export const PREGNANT_DAILY_CARDS = Object.freeze({
  symptom: 'symptom-tracker-card',
  kick: 'kick-counter-card',
  nesting: 'nesting-checklist-card',
});

export const PREGNANT_DAILY_LAYOUT = Object.freeze({
  scrollFooterPad: 120,
  headerPadTop: 4,
  headerPadBottom: 12,
  headerPadHorizontal: 2,
  glassCardMarginBottom: 14,
});
