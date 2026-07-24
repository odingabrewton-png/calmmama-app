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
  dailyJournal: 10,
  weeklyJournalBonus: 50,
  dailyChecklist: 5,
  pollFeedback: 100,
  registryCompleted: 250,
  dailyPuzzle: 15,
  encourage: 25,
  subscriptionUpgrade: 250,
  vipPromo: 500,
};

export const WEEKLY_JOURNAL_BONUS_THRESHOLD = 5;
export const WEEKLY_JOURNAL_BONUS_TOAST =
  'Weekly Sanctuary Bonus Unlocked! +50 pts 🌸';
export const DAILY_CHECKLIST_TOAST = 'Daily Care List Complete! +5 pts 🌸';
export const SUBSCRIPTION_UPGRADE_TOAST = 'Premium Upgrade Bonus! +250 pts 🌸👑';
export const VIP_PROMO_TOAST = 'VIP Welcome Bonus! +500 pts 🌸👑';

export function createDefaultVillageRewards() {
  return {
    points: 0,
    dailyStreak: 0,
    completedActions: {
      pollFeedback: false,
      registryCompleted: false,
      subscriptionUpgrade: false,
      vipPromo: false,
      dailyJournalDate: null,
      dailyPuzzleDate: null,
      dailyChecklistDate: null,
      dailyEncouragementsCount: 0,
      dailyEncourageDate: null,
      weeklyJournalWeekKey: null,
      weeklyJournalCount: 0,
      weeklyJournalBonusClaimed: false,
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

/** Monday-start ISO-style week key for rolling 7-day journal bonus. */
export function calendarWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return calendarDayKey(d);
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
      subscriptionUpgrade: Boolean(actions.subscriptionUpgrade),
      vipPromo: Boolean(actions.vipPromo),
      dailyJournalDate: actions.dailyJournalDate || null,
      dailyPuzzleDate: actions.dailyPuzzleDate || null,
      dailyChecklistDate: actions.dailyChecklistDate || null,
      dailyEncouragementsCount: Math.max(0, Number(actions.dailyEncouragementsCount) || 0),
      dailyEncourageDate: actions.dailyEncourageDate || null,
      weeklyJournalWeekKey: actions.weeklyJournalWeekKey || null,
      weeklyJournalCount: Math.max(0, Number(actions.weeklyJournalCount) || 0),
      weeklyJournalBonusClaimed: Boolean(actions.weeklyJournalBonusClaimed),
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

/**
 * Progress toward 500 → 1000 → 3000 badge tiers.
 * Bar fills from the previous unlocked threshold to the next.
 */
export function getNextTierProgress(points) {
  const total = Math.max(0, Number(points) || 0);
  const thresholds = REWARD_TIERS.map((tier) => tier.points);
  const next = REWARD_TIERS.find((tier) => total < tier.points) || null;
  const prevThreshold =
    [...thresholds].reverse().find((mark) => mark <= total) || 0;

  if (!next) {
    const last = REWARD_TIERS[REWARD_TIERS.length - 1];
    return {
      nextTier: null,
      currentThreshold: last.points,
      nextThreshold: last.points,
      progress: 1,
      pointsToNext: 0,
      absoluteProgress: 1,
    };
  }

  const span = Math.max(1, next.points - prevThreshold);
  const progress = Math.min(1, Math.max(0, (total - prevThreshold) / span));
  const absoluteProgress = Math.min(1, total / thresholds[thresholds.length - 1]);

  return {
    nextTier: next,
    currentThreshold: prevThreshold,
    nextThreshold: next.points,
    progress,
    pointsToNext: Math.max(0, next.points - total),
    absoluteProgress,
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

function finishAward(current, actions, awardAmount, extras = {}) {
  const points = current.points + awardAmount;
  const { unlockedBadges, newlyUnlocked } = syncUnlockedBadges(points, current.unlockedBadges);
  const next = {
    ...current,
    points,
    completedActions: actions,
    unlockedBadges,
    ...extras.state,
  };

  return {
    awarded: true,
    amount: awardAmount,
    reason: 'ok',
    rewards: next,
    newlyUnlocked,
    toastMessage: extras.toastMessage || `+${awardAmount} pts! 🌸`,
    bonusToastMessage: extras.bonusToastMessage || null,
    bonusAmount: extras.bonusAmount || 0,
  };
}

/**
 * Pure award attempt. Returns whether points were granted + updated rewards.
 * @param {object} rewards
 * @param {number} amount
 * @param {string} actionKey
 */
export function applyAddPoints(rewards, amount, actionKey) {
  const current = normalizeVillageRewards(rewards);
  const key = String(actionKey || '');
  const awardAmount = Math.max(0, Number(amount) || REWARD_POINT_VALUES[key] || 0);
  const today = calendarDayKey();
  const weekKey = calendarWeekKey();
  const actions = { ...current.completedActions };

  if (!awardAmount || !key) {
    return {
      awarded: false,
      amount: 0,
      reason: 'invalid',
      rewards: current,
      newlyUnlocked: [],
      toastMessage: null,
      bonusToastMessage: null,
      bonusAmount: 0,
    };
  }

  if (key === 'dailyJournal') {
    // Reset weekly counter when the week rolls over.
    if (actions.weeklyJournalWeekKey !== weekKey) {
      actions.weeklyJournalWeekKey = weekKey;
      actions.weeklyJournalCount = 0;
      actions.weeklyJournalBonusClaimed = false;
    }

    const yesterday = previousCalendarDayKey();
    let nextStreak = current.dailyStreak;
    if (actions.dailyJournalDate !== today) {
      nextStreak = actions.dailyJournalDate === yesterday ? current.dailyStreak + 1 : 1;
      actions.dailyJournalDate = today;
    }

    actions.weeklyJournalCount += 1;

    let totalAward = awardAmount;
    let bonusToastMessage = null;
    let bonusAmount = 0;

    if (
      actions.weeklyJournalCount >= WEEKLY_JOURNAL_BONUS_THRESHOLD &&
      !actions.weeklyJournalBonusClaimed
    ) {
      actions.weeklyJournalBonusClaimed = true;
      bonusAmount = REWARD_POINT_VALUES.weeklyJournalBonus;
      totalAward += bonusAmount;
      bonusToastMessage = WEEKLY_JOURNAL_BONUS_TOAST;
    }

    return finishAward(current, actions, totalAward, {
      state: { dailyStreak: nextStreak },
      toastMessage: `+${awardAmount} pts! 🌸`,
      bonusToastMessage,
      bonusAmount,
    });
  }

  if (key === 'weeklyJournalBonus') {
    if (actions.weeklyJournalWeekKey !== weekKey) {
      actions.weeklyJournalWeekKey = weekKey;
      actions.weeklyJournalCount = 0;
      actions.weeklyJournalBonusClaimed = false;
    }
    if (actions.weeklyJournalBonusClaimed) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_claimed',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    if (actions.weeklyJournalCount < WEEKLY_JOURNAL_BONUS_THRESHOLD) {
      return {
        awarded: false,
        amount: 0,
        reason: 'threshold_not_met',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    actions.weeklyJournalBonusClaimed = true;
    return finishAward(current, actions, awardAmount, {
      toastMessage: WEEKLY_JOURNAL_BONUS_TOAST,
    });
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
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    actions.dailyPuzzleDate = today;
  } else if (key === 'dailyChecklist') {
    if (actions.dailyChecklistDate === today) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_today',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    actions.dailyChecklistDate = today;
    return finishAward(current, actions, awardAmount, {
      toastMessage: DAILY_CHECKLIST_TOAST,
    });
  } else if (key === 'pollFeedback') {
    if (actions.pollFeedback) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_done',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
        bonusToastMessage: null,
        bonusAmount: 0,
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
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    actions.registryCompleted = true;
  } else if (key === 'subscriptionUpgrade') {
    if (actions.subscriptionUpgrade) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_done',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    actions.subscriptionUpgrade = true;
    return finishAward(current, actions, awardAmount, {
      toastMessage: SUBSCRIPTION_UPGRADE_TOAST,
    });
  } else if (key === 'vipPromo') {
    if (actions.vipPromo) {
      return {
        awarded: false,
        amount: 0,
        reason: 'already_done',
        rewards: current,
        newlyUnlocked: [],
        toastMessage: null,
        bonusToastMessage: null,
        bonusAmount: 0,
      };
    }
    actions.vipPromo = true;
    return finishAward(current, actions, awardAmount, {
      toastMessage: VIP_PROMO_TOAST,
    });
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
        bonusToastMessage: null,
        bonusAmount: 0,
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
      bonusToastMessage: null,
      bonusAmount: 0,
    };
  }

  return finishAward(current, actions, awardAmount);
}

export function getBadgeMeta(badgeId) {
  return REWARD_TIERS.find((tier) => tier.id === badgeId) || null;
}

/** Current-week journal progress for Me-tab copy (resets each Monday). */
export function getWeeklyJournalProgress(rewards, date = new Date()) {
  const actions = normalizeVillageRewards(rewards).completedActions;
  const weekKey = calendarWeekKey(date);
  if (actions.weeklyJournalWeekKey !== weekKey) {
    return {
      count: 0,
      threshold: WEEKLY_JOURNAL_BONUS_THRESHOLD,
      bonusClaimed: false,
    };
  }
  return {
    count: actions.weeklyJournalCount,
    threshold: WEEKLY_JOURNAL_BONUS_THRESHOLD,
    bonusClaimed: actions.weeklyJournalBonusClaimed,
  };
}
