/**
 * POSTPARTUM INFANT HOME (newborn – under 1 year) — layout locked.
 * Structural home edits require explicit "UNLOCK POSTPARTUM INFANT HOME LAYOUT" from the user.
 *
 * Other tabs (Kitchen, Daily, Nursery) may change independently — this file isolates
 * the infant home shell only.
 */

export const POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED = true;

export const POSTPARTUM_INFANT_HOME_STACK = Object.freeze(['milestone-scrapbook']);

export const POSTPARTUM_INFANT_HOME_LAYOUT = Object.freeze({
  scrollPad: 20,
  scrollPadBottom: 32,
});
