/**
 * Once-per-calendar-week in-app reminder for Weekly Bloom.
 * Encourages pregnant mamas to see baby growth, read facts, and update weight.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBloomWeek } from './bloomWeekData';
import { calendarWeekKey } from './villageRewardsEngine';
import { NOTIFICATION_COPY } from './notificationConfig';

export const WEEKLY_BLOOM_REMINDER_STORAGE_KEY = 'calmmama.weeklyBloomReminderWeekKey';

export function buildWeeklyBloomReminderMessage(weeksPregnant) {
  const bloom = getBloomWeek(weeksPregnant);
  const sizeLine = bloom?.fruitFact
    ? bloom.fruitFact
    : `You're in week ${bloom.week} — baby is blooming.`;
  return {
    week: bloom.week,
    fruitEmoji: bloom.fruitEmoji || '🌿',
    fruit: bloom.fruit,
    title: NOTIFICATION_COPY.weeklyBloom.title,
    message: `Week ${bloom.week}: ${sizeLine} Open Bloom to read this week's facts and update your weight.`,
  };
}

export async function readWeeklyBloomReminderWeekKey() {
  try {
    return (await AsyncStorage.getItem(WEEKLY_BLOOM_REMINDER_STORAGE_KEY)) || null;
  } catch (_) {
    return null;
  }
}

export async function writeWeeklyBloomReminderWeekKey(weekKey) {
  try {
    await AsyncStorage.setItem(WEEKLY_BLOOM_REMINDER_STORAGE_KEY, String(weekKey));
  } catch (_) {
    /* ignore */
  }
}

/**
 * Returns reminder payload if this calendar week hasn't been shown yet.
 * @returns {Promise<null | { weekKey: string, title: string, message: string, emoji: string, week: number }>}
 */
export async function claimWeeklyBloomReminder({ weeksPregnant } = {}) {
  const weekKey = calendarWeekKey();
  const shown = await readWeeklyBloomReminderWeekKey();
  if (shown === weekKey) return null;

  await writeWeeklyBloomReminderWeekKey(weekKey);
  const copy = buildWeeklyBloomReminderMessage(weeksPregnant);
  return {
    weekKey,
    week: copy.week,
    title: copy.title,
    message: copy.message,
    emoji: copy.fruitEmoji,
  };
}
