import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import {
  getBabyGrowthPreloadWeeks,
  WEEKLY_BABY_VIDEOS,
} from './modularBabyGrowthConfig';

let lastWarmWeek = null;

/**
 * Warm weekly blooming-body assets only — never create orphan VideoPlayer
 * instances (those steal native decoders and freeze the on-screen clip).
 */
export function warmBloomVideos(week = 24) {
  try {
    if (lastWarmWeek === week) return;
    lastWarmWeek = week;

    const weeks = getBabyGrowthPreloadWeeks(week);
    const assets = weeks.map((w) => WEEKLY_BABY_VIDEOS[w]).filter(Boolean);
    if (!assets.length) return;

    const load = () => {
      Asset.loadAsync(assets).catch(() => {});
    };

    if (Platform.OS === 'web') {
      // Defer so Home paint isn't blocked after onboarding highlights.
      setTimeout(load, 120);
      return;
    }

    if (typeof globalThis.requestIdleCallback === 'function') {
      globalThis.requestIdleCallback(load);
    } else {
      setTimeout(load, 80);
    }
  } catch (error) {
    if (__DEV__ && typeof console !== 'undefined') {
      console.warn('[CalmMama] bloom video warm skipped', error?.message ?? error);
    }
  }
}

/** @deprecated Pool players removed — they competed with ModularBabyGrowth. */
export function getBloomPlayerForTrimester() {
  return null;
}

/** @deprecated Pool players removed — they competed with ModularBabyGrowth. */
export function primeBloomPlayer() {
  return null;
}
