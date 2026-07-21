/**
 * Modular baby growth video assets — Bloom → Your Blooming Body (pregnant only).
 *
 * Add new weekly renders to WEEKLY_BABY_VIDEOS (weeks 1–40).
 */

/** Map each bundled week to its belly-scene baby loop. */
export const WEEKLY_BABY_VIDEOS = Object.freeze({
  2: require('./assets/videos/weekly_babies/baby_week_2.mp4'),
  4: require('./assets/videos/weekly_babies/baby_week_4.mp4'),
  6: require('./assets/videos/weekly_babies/baby_week_6.mp4'),
  8: require('./assets/videos/weekly_babies/baby_week_8.mp4'),
  10: require('./assets/videos/weekly_babies/baby_week_10.mp4'),
  12: require('./assets/videos/weekly_babies/baby_week_12.mp4'),
  14: require('./assets/videos/weekly_babies/baby_week_14.mp4'),
  16: require('./assets/videos/weekly_babies/baby_week_16.mp4'),
  18: require('./assets/videos/weekly_babies/baby_week_18.mp4'),
  20: require('./assets/videos/weekly_babies/baby_week_20.mp4'),
  22: require('./assets/videos/weekly_babies/baby_week_22.mp4'),
  24: require('./assets/videos/weekly_babies/baby_week_24.mp4'),
  28: require('./assets/videos/weekly_babies/baby_week_28.mp4'),
  30: require('./assets/videos/weekly_babies/baby_week_30.mp4'),
  32: require('./assets/videos/weekly_babies/baby_week_32.mp4'),
  36: require('./assets/videos/weekly_babies/baby_week_36.mp4'),
  40: require('./assets/videos/weekly_babies/baby_week_40.mp4'),
});

const DEFAULT_FALLBACK_WEEK = 2;

/** Sorted bundled video weeks — used for preload + transitions. */
export const BUNDLED_BABY_WEEKS = Object.freeze(
  Object.keys(WEEKLY_BABY_VIDEOS)
    .map((week) => parseInt(week, 10))
    .sort((a, b) => a - b),
);

export function resolveBabyGrowthWeek(weekInput) {
  return Math.min(40, Math.max(1, parseInt(String(weekInput), 10) || DEFAULT_FALLBACK_WEEK));
}

/** Nearest bundled week at or below the current week, else default. */
export function getWeeklyBabyVideoSource(weekInput) {
  const week = resolveBabyGrowthWeek(weekInput);
  if (WEEKLY_BABY_VIDEOS[week]) {
    return { week, source: WEEKLY_BABY_VIDEOS[week] };
  }

  for (let candidate = week; candidate >= 1; candidate -= 1) {
    if (WEEKLY_BABY_VIDEOS[candidate]) {
      return { week: candidate, source: WEEKLY_BABY_VIDEOS[candidate] };
    }
  }

  return {
    week: DEFAULT_FALLBACK_WEEK,
    source: WEEKLY_BABY_VIDEOS[DEFAULT_FALLBACK_WEEK],
  };
}

export function getBundledWeekNeighbors(videoWeek) {
  const idx = BUNDLED_BABY_WEEKS.indexOf(videoWeek);
  if (idx === -1) {
    return { prev: null, current: videoWeek, next: null };
  }

  return {
    prev: idx > 0 ? BUNDLED_BABY_WEEKS[idx - 1] : null,
    current: BUNDLED_BABY_WEEKS[idx],
    next: idx < BUNDLED_BABY_WEEKS.length - 1 ? BUNDLED_BABY_WEEKS[idx + 1] : null,
  };
}

export function getBabyGrowthPreloadWeeks(pregnancyWeek) {
  const { week } = getWeeklyBabyVideoSource(pregnancyWeek);
  const { prev, next } = getBundledWeekNeighbors(week);
  return [prev, week, next].filter((entry) => entry != null);
}
