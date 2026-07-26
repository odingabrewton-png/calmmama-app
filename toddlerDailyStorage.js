/**
 * Persist toddler Daily Village state — vibe emotion notes + rotating anchors.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToddlerAnchorsDayKey, getToddlerDailyAnchors } from './toddlerDailyAnchors';

export const TODDLER_DAILY_STORAGE_KEY = 'calmmama.toddlerDailyVillage';

export function createDefaultToddlerDailyState() {
  return {
    selectedVibes: [],
    vibeHistory: [],
    winsTasks: getToddlerDailyAnchors(),
    winsDayKey: getToddlerAnchorsDayKey(),
    updatedAt: null,
  };
}

export function normalizeToddlerDailyState(raw) {
  const base = createDefaultToddlerDailyState();
  if (!raw || typeof raw !== 'object') return base;

  const today = getToddlerAnchorsDayKey();
  const storedDay = String(raw.winsDayKey || '');
  const winsTasks =
    storedDay === today && Array.isArray(raw.winsTasks) && raw.winsTasks.length
      ? raw.winsTasks.map((task, index) => ({
          id: task?.id || `${today}-${index}`,
          text: String(task?.text || '').trim() || 'Soft toddler anchor',
          done: Boolean(task?.done),
        }))
      : getToddlerDailyAnchors();

  const vibeHistory = Array.isArray(raw.vibeHistory)
    ? raw.vibeHistory
        .filter((entry) => entry && (entry.label || entry.vibeId))
        .map((entry, index) => ({
          id: entry.id || `vibe-${index}`,
          vibeId: entry.vibeId || null,
          emoji: entry.emoji || '✨',
          label: entry.label || 'Mood',
          note: String(entry.note || '').trim(),
          time: entry.time || '',
          date: entry.date || '',
          at: entry.at || null,
        }))
        .slice(0, 80)
    : [];

  return {
    selectedVibes: Array.isArray(raw.selectedVibes)
      ? raw.selectedVibes.filter((id) => typeof id === 'string')
      : [],
    vibeHistory,
    winsTasks,
    winsDayKey: today,
    updatedAt: raw.updatedAt || null,
  };
}

export async function loadToddlerDailyState() {
  try {
    const raw = await AsyncStorage.getItem(TODDLER_DAILY_STORAGE_KEY);
    if (!raw) return createDefaultToddlerDailyState();
    return normalizeToddlerDailyState(JSON.parse(raw));
  } catch (_) {
    return createDefaultToddlerDailyState();
  }
}

export async function saveToddlerDailyState(state) {
  const next = normalizeToddlerDailyState({
    ...state,
    updatedAt: new Date().toISOString(),
  });
  try {
    await AsyncStorage.setItem(TODDLER_DAILY_STORAGE_KEY, JSON.stringify(next));
  } catch (_) {
    /* non-blocking */
  }
  return next;
}
