/**
 * PREGNANT MAMA BLOOM TAB — LAYOUT LOCKED
 * Do not change scroll structure, section stack order, or blooming-body frame
 * unless the user explicitly says "UNLOCK BLOOM LAYOUT".
 *
 * Related locks:
 * - Home: pregnantHomeLayoutConfig.js ("UNLOCK LAYOUT")
 * - Daily: pregnantDailyLayoutConfig.js ("UNLOCK DAILY LAYOUT")
 * - Kitchen images may be updated without unlocking this tab.
 */

export const PREGNANT_BLOOM_LAYOUT_LOCKED = true;

/** Bloom tab stack order (top → bottom) for pregnant journey only. */
export const PREGNANT_BLOOM_STACK = Object.freeze([
  'bloom-hero',
  'bloom-affirmation',
  'bloom-week-stepper',
  'bloom-blooming-body',
  'bloom-baby-size',
  'bloom-weight-tracker',
  'bloom-medical-insights',
  'bloom-this-week-for-you',
  'bloom-birth-prompt',
]);

export const PREGNANT_BLOOM_LAYOUT = Object.freeze({
  embeddedPadTop: 20,
  embeddedPadHorizontal: 20,
  embeddedScrollFooterPad: 150,
  heroMarginBottom: 12,
  affirmationMarginBottom: 12,
  weekStepperMarginBottom: 14,
  silhouetteCardMarginBottom: 14,
  fruitCardMarginBottom: 14,
  sectionCardMarginBottom: 14,
});
