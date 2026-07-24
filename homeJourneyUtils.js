/**
 * Maps profile state → Home tab feature module.
 * pregnant → Little Sprout Garden
 * infant (0–12 mo) → Baby Milestone Scrapbook
 * toddler (12+ mo) → Village Time Capsule
 */

export function parseBabyAgeMonths(babyAge) {
  const raw = String(babyAge || '').trim().toLowerCase();
  if (!raw) return 2;

  if (raw.includes('newborn')) return 0;

  const rangeMonth = raw.match(/(\d+)\s*-\s*(\d+)\s*months?/);
  if (rangeMonth) return parseInt(rangeMonth[2], 10);

  const yearMatch = raw.match(/(\d+(?:\.\d+)?)\s*year/);
  if (yearMatch) return Math.round(parseFloat(yearMatch[1]) * 12);

  const monthMatch = raw.match(/(\d+(?:\.\d+)?)\s*month/);
  if (monthMatch) return Math.round(parseFloat(monthMatch[1]));

  const weekMatch = raw.match(/(\d+(?:\.\d+)?)\s*week/);
  if (weekMatch) return Math.max(0, Math.round(parseFloat(weekMatch[1]) / 4.33));

  const digit = raw.match(/(\d+)/);
  if (digit) {
    const n = parseInt(digit[1], 10);
    if (raw.includes('yr') || (n <= 6 && raw.includes('year'))) return n * 12;
    return n;
  }

  return 2;
}

/** Little Bites kitchen tab — 10–12 mo through toddler years */
export function showsLittleBitesKitchen(babyAge) {
  const raw = String(babyAge || '').trim().toLowerCase();
  if (!raw) return false;
  if (raw.includes('10-12') || raw.includes('12-24') || raw.includes('1 year')) return true;
  return parseBabyAgeMonths(babyAge) >= 10;
}

export function getHomeJourneyPhase(userJourney, babyAge, options = {}) {
  const { activeMode, homeTrack } = options || {};

  // Hybrid mamas: Home pills choose pregnancy vs little-one track without wiping data.
  if (activeMode === 'hybrid' || userJourney === 'hybrid') {
    if (homeTrack === 'pregnant') return 'pregnant';
    const months = parseBabyAgeMonths(babyAge);
    return months >= 12 ? 'toddler' : 'infant';
  }

  if (userJourney === 'pregnant') return 'pregnant';
  const months = parseBabyAgeMonths(babyAge);
  if (months >= 12) return 'toddler';
  return 'infant';
}

/** Postpartum home with milestone scrapbook — newborn through 11 months (not 1-year toddlers). */
export function isPostpartumInfantHome(userJourney, babyAge) {
  return userJourney === 'postpartum' && getHomeJourneyPhase(userJourney, babyAge) === 'infant';
}

/**
 * Registry advice polls: only postpartum mamas with babies 1 year old and up may vote.
 * Matches BabyAgePicker labels that include "year".
 */
export function canAnswerVillageRegistryPolls(babyAge) {
  const raw = String(babyAge || '').trim().toLowerCase();
  if (!raw) return false;
  return raw.includes('year');
}
