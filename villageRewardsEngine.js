/**
 * Village Rewards & Badges — points, daily caps, streaks, and unlock tiers.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const VILLAGE_REWARDS_STORAGE_KEY = 'villageRewards';

export const REWARD_TIERS = [
  {
    id: 'village_sister',
    points: 500,
    title: 'Village Sister 🌸',
    perk: '10% OFF Merch',
    code: 'VILLAGE10',
    emoji: '🌸',
  },
  {
    id: 'sanctuary_queen',
    points: 1000,
    title: 'Sanctuary Queen 👑',
    perk: '20% OFF Merch',
    code: 'SANCTUARY20',
    emoji: '👑',
  },
  {
    id: 'founding_legend',
    points: 3000,
    title: 'Founding Legend 🏆',
    perk: '30% OFF + Free Shipping',
    code: 'LEGEND30',
    emoji: '🏆',
  },
];

/** Point awards by action key. */
export const REWARD_POINT_VALUES = {
  dailyJournal: 50,
  pollFeedback: 100,
  registryCompleted: 250,
  dailyPuzzle: 75,
  encourage: 25,
};

export function createDefaultVillageRewards() {
  return {
    points: 0,
    dailyStreak: 0,
    completedActions: {
      pollFeedback: false,
      registryCompleted: false,
      dailyJournalDate: null,
      dailyPuzzleDate: null,
      dailyEncouragementsCount: 0,
      dailyEncourageDate: null,
    },
    unlockedBadges: [],
  };
}

export function calendarDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function previousCalendarDayKey(date = new Date()) {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return calendarDayKey(prev);
}

export function normalizeVillageRewards(raw) {
  const base = createDefaultVillageRewards();
  if (!raw || typeof raw !== 'object') return base;

  const actions = raw.completedActions && typeof raw.completedActions === 'object'
    ? raw.completedActions
    : {};

  const unlocked = Array.isArray(raw.unlockedBadges)
    ? raw.unlockedBadges.filter((id) => REWARD_TIERS.some((tier) => tier.id === id))
    : [];

  return {
    points: Math.max(0, Number(raw.points) || 0),
    dailyStreak: Math.max(0, Number(raw.dailyStreak) || 0),
    completedActions: {
      pollFeedback: Boolean(actions.pollFeedback),
      registryCompleted: Boolean(actions.registryCompleted),
      dailyJournalDate: actions.dailyJournalDate || null,
      dailyPuzzleDate: actions.dailyPuzzleDate || null,
      dailyEncouragementsCount: Math.max(0, Number(actions.dailyEncouragementsCount) || 0),
      dailyEncourageDate: actions.dailyEncourageDate || null,
    },
    unlockedBadges: unlocked,
  };
}

export async function loadVillageRewards() {
  try {
    const raw = await AsyncStorage.getItem(VILLAGE_REWARDS_STORAGE_KEY);
    if (!raw) return createDefaultVillageRewards();
    return normalizeVillageRewards(JSON.parse(raw));
  } catch (_) {
    return createDefaultVillageRewards();
  }
}

export async function saveVillageRewards(rewards) {
  const normalized = normalizeVillageRewards(rewards);
  await AsyncStorage.setItem(VILLAGE_REWARDS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function clearVillageRewards() {
  await AsyncStorage.removeItem(VILLAGE_REWARDS_STORAGE_KEY);
}

export function getNextTierProgress(points) {
  const total = Math.max(0, Number(points) || 0);
  const next = REWARD_TIERS.find((tier) => total < tier.points) || null;
  const prevThreshold =
    REWARD_TIERS.filter((tier) => tier.points <= total).pop()?.points || 0;

  if (!next) {
    const last = REWARD_TIERS[REWARD_TIERS.length - 1];
    return {
      nextTier: null,
      currentThreshold: last.points,
      nextThreshold: last.points,
      progress: 1,
      pointsToNext: 0,
    };
  }

  const span = Math.max(1, next.points - prevThreshold);
  const progress = Math.min(1, Math.max(0, (total - prevThreshold) / span));

  return {
    nextTier: next,
    currentThreshold: prevThreshold,
    nextThreshold: next.points,
    progress,
    pointsToNext: Math.max(0, next.points - total),
  };
}

function syncUnlockedBadges(points, unlockedBadges = []) {
  const unlocked = new Set(unlockedBadges);
  const newlyUnlocked = [];
  for (const tier of REWARD_TIERS) {
    if (points >= tier.points && !unlocked.has(tier.id)) {
      unlocked.add(tier.id);
      newlyUnlocked.push(tier.id);
    }
  }
  return {
    unlockedBadges: REWARD_TIERS.map((t) => t.id).filter((id) => unlocked.has(id)),
    newlyUnlocked,
  };
}

/**
 * Pure award attempt. Returns whether points were granted + updated rewards.
 * @param {object} rewards
 * @param {number} amount
 * @param {string} actionKey — dailyJournal | pollFeedback | registryCompleted | dailyPuzzle | encourage
 */
export function applyAddPoints(rewards, amount, actionKey) {
  const current = normalizeVillageRewards(rewards);
  const key = String(actionKey || '');
  const awardAmount = Math.max(0, Number(amount) || REWARD_POINT_VALUES[key] || 0);
  const today = calendarDayKey();
  const actions = { ...current.completedActions };

  if (!awardAmount || !key) {
    return {
      awarded: false,
      amount: 0,
      reason: 'invalid',
      rewards: current,
      newlyUnlocked: [],
      toastMessage: null,
    };
  }

  if (key === 'dailyJournal') {
    if (actions.dailyJournalDate === today) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_today',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
      };
    }
    const yesterday = previousCalendarDayKey();
    const nextStreak =
      actions.dailyJournalDate === yesterday ? current.dailyStreak + 1 : 1;
    actions.dailyJournalDate = today;

    const points = current.points + awardAmount;
    const { unlockedBadges, newlyUnlocked } = syncUnlockedBadges(points, current.unlockedBadges);
    const next = {
      ...current,
      points,
      dailyStreak: nextStreak,
      completedActions: actions,
      unlockedBadges,
    };
    return {
      awarded: true,
      amount: awardAmount,
      reason: 'ok',
      rewards: next,
      newlyUnlocked,
      toastMessage: `+${awardAmount} pts! 🌸`,
    };
  }

  if (key === 'dailyPuzzle') {
    if (actions.dailyPuzzleDate === today) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_today',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
      };
    }
    actions.dailyPuzzleDate = today;
  } else if (key === 'pollFeedback') {
    if (actions.pollFeedback) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_done',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
      };
    }
    actions.pollFeedback = true;
  } else if (key === 'registryCompleted') {
    if (actions.registryCompleted) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_done',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
      };
    }
    actions.registryCompleted = true;
  } else if (key === 'encourage') {
    if (actions.dailyEncourageDate !== today) {
      actions.dailyEncourageDate = today;
      actions.dailyEncouragementsCount = 0;
    }
    if (actions.dailyEncouragementsCount >= 5) {
      return {
        awarded: false,
        amount: 0,
        reason: 'daily_cap',
        rewards: { ...current, completedActions: actions },
        newlyUnlocked: [],
        toastMessage: null,
      };
    }
    actions.dailyEncouragementsCount += 1;
  } else {
    return {
      awarded: false,
      amount: 0,
      reason: 'unknown_action',
      rewards: current,
      newlyUnlocked: [],
      toastMessage: null,
    };
  }

  const points = current.points + awardAmount;
  const { unlockedBadges, newlyUnlocked } = syncUnlockedBadges(points, current.unlockedBadges);
  const next = {
    ...current,
    points,
    completedActions: actions,
    unlockedBadges,
  };

  return {
    awarded: true,
    amount: awardAmount,
    reason: 'ok',
    rewards: next,
    newlyUnlocked,
    toastMessage: `+${awardAmount} pts! 🌸`,
  };
}

export function getBadgeMeta(badgeId) {
  return REWARD_TIERS.find((tier) => tier.id === badgeId) || null;
}
