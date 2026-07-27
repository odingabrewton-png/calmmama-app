/**
 * Village Rewards & Badges — Crown Points, redeemable tiers, and perk flags.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_FAIRY_OMBRE_ID,
  resolveFairyThemeId,
} from './secretFairyThemes';
import {
  DEFAULT_ME_BACKGROUND_ID,
  resolveMeBackgroundId,
} from './meProfileBackgrounds';
import {
  DEFAULT_APP_ICON_ID,
  DEFAULT_STICKER_ID,
  resolveAppIconId,
  resolveStickerId,
} from './villageCosmeticPerks';

export const VILLAGE_REWARDS_STORAGE_KEY = 'villageRewards';

/** Crown Points redeem tiers (spend balance to claim). */
export const REWARD_TIERS = [
  {
    id: 'streak_freeze',
    points: 250,
    title: 'Streak Freeze',
    type: 'streak_freeze',
    shopGroup: 'redeemable',
    perk: 'Protect one journal streak day',
    description: 'Freeze your journal streak for one missed day — soft grace for hard weeks.',
    emoji: '🧊',
  },
  {
    id: 'custom_sticker',
    points: 300,
    title: 'Custom Sticker',
    type: 'cosmetic',
    shopGroup: 'redeemable',
    perk: 'Unlock a village sticker pack',
    description: 'A custom sticker pack for notes, journals, and village moments.',
    emoji: '✨',
  },
  {
    id: 'themed_app_icon',
    points: 500,
    title: 'Themed App Icon Swap',
    type: 'cosmetic',
    shopGroup: 'redeemable',
    perk: 'Swap your Calm Mama home icon',
    description: 'Unlock a themed app icon swap for your home screen sanctuary.',
    emoji: '📱',
  },
  {
    id: 'store_10',
    points: 1000,
    title: '10% Off Store Discount',
    type: 'discount',
    shopGroup: 'redeemable',
    value: 10,
    perk: '10% OFF Boutique',
    code: 'CROWN10',
    description: 'Save 10% in The Village Boutique.',
    emoji: '🛍️',
  },
  {
    id: 'oracle_beta',
    points: 2000,
    title: 'The Village Oracle (Beta Tester Pass)',
    type: 'early_access',
    shopGroup: 'redeemable',
    perk: 'Test new features early',
    description: 'Test new features 2 weeks early',
    emoji: '🔮',
  },
  {
    id: 'store_20',
    points: 3000,
    title: '20% Off Store Discount',
    type: 'discount',
    shopGroup: 'redeemable',
    value: 20,
    perk: '20% OFF Boutique',
    code: 'CROWN20',
    description: 'Save 20% in The Village Boutique.',
    emoji: '✨',
  },
  {
    id: 'fairy_godmother',
    points: 4000,
    title: 'Feature Fairy Godmother Perks',
    type: 'fairy_godmother',
    shopGroup: 'redeemable',
    perk: 'Secret ombre themes + premium prompts',
    description:
      'Permanent unlock of all premium prompts, animated Fairy Godmother ombre blends, and a custom profile title',
    emoji: '🧚',
  },
  {
    id: 'founding_matriarch',
    points: 5000,
    title: 'Founding Matriarch Bundle',
    type: 'matriarch',
    shopGroup: 'redeemable',
    perk: 'Badge + co-create + dual 50% coupons',
    description: 'Custom profile badge + Co-create a feature + Two 50% off coupons',
    emoji: '🏛️',
    coupons: ['MATRIARCH50A', 'MATRIARCH50B'],
  },
];

/** Legacy exclusive badge / older shop ids → current redeemables. */
const LEGACY_TIER_ID_MAP = Object.freeze({
  village_sister: 'themed_app_icon',
  exclusive_badge: 'themed_app_icon',
  sanctuary_queen: 'store_10',
  founding_legend: 'store_20',
});
export const REWARD_POINT_VALUES = {
  dailyJournal: 10,
  weeklyJournalBonus: 50,
  dailyChecklist: 5,
  nurseryChecklistItem: 5,
  pollFeedback: 100,
  registryCompleted: 250,
  dailyPuzzle: 15,
  encourage: 25,
  kitchenCooked: 15,
  subscriptionUpgrade: 250,
  vipPromo: 500,
  adminTestGrant: 500,
};

export const WEEKLY_JOURNAL_BONUS_THRESHOLD = 5;
export const WEEKLY_JOURNAL_BONUS_TOAST =
  'Weekly Sanctuary streak — bonus unlocked! +50 pts';
export const DAILY_CHECKLIST_TOAST = 'Daily checklist complete — soft win! +5 pts';
export const NURSERY_CHECKLIST_ITEM_TOAST =
  'Nursery survival check — +5 Crown Points';
export const NURSERY_CHECKLIST_DAILY_CAP = 6;
export const KITCHEN_COOKED_TOAST = "Mama's Kitchen — nourishment logged! +15 pts";
export const SUBSCRIPTION_UPGRADE_TOAST = 'Premium welcome bonus unlocked! +250 pts';
export const VIP_PROMO_TOAST = 'VIP welcome bonus unlocked! +500 pts';
export const ADMIN_TEST_POINTS_TOAST = 'Admin sandbox points updated';

function mapLegacyTierId(id) {
  return LEGACY_TIER_ID_MAP[id] || id;
}

export function createDefaultVillageRewards() {
  return {
    points: 0,
    lifetimePoints: 0,
    dailyStreak: 0,
    completedActions: {
      pollFeedback: false,
      registryCompleted: false,
      subscriptionUpgrade: false,
      vipPromo: false,
      dailyJournalDate: null,
      dailyPuzzleDate: null,
      dailyChecklistDate: null,
      nurseryChecklistDate: null,
      nurseryChecklistCount: 0,
      kitchenCookedDate: null,
      dailyEncouragementsCount: 0,
      dailyEncourageDate: null,
      weeklyJournalWeekKey: null,
      weeklyJournalCount: 0,
      weeklyJournalBonusClaimed: false,
    },
    redeemedTiers: [],
    /** @deprecated Prefer redeemedTiers — kept for older UI checks. */
    unlockedBadges: [],
    hasFairyGodmotherPerk: false,
    hasOracleBetaPass: false,
    hasMatriarchPerk: false,
    hasExclusiveBadge: false,
    hasStreakFreeze: false,
    hasCustomSticker: false,
    customProfileTitle: '',
    selectedSecretThemeId: null,
    selectedMeBackgroundId: DEFAULT_ME_BACKGROUND_ID,
    selectedStickerId: null,
    selectedAppIconId: null,
    discountCoupons: [],
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

function validTierIdSet() {
  return new Set(REWARD_TIERS.map((tier) => tier.id));
}

function normalizeRedeemedTiers(raw) {
  const valid = validTierIdSet();
  const fromRedeemed = Array.isArray(raw?.redeemedTiers) ? raw.redeemedTiers : [];
  const fromLegacy = Array.isArray(raw?.unlockedBadges) ? raw.unlockedBadges : [];
  const merged = [...fromRedeemed, ...fromLegacy]
    .map(mapLegacyTierId)
    .filter((id) => valid.has(id));
  return Array.from(new Set(merged));
}

function derivePerkFlags(redeemedTiers, raw = {}) {
  const set = new Set(redeemedTiers);
  return {
    hasExclusiveBadge:
      Boolean(raw.hasExclusiveBadge) ||
      set.has('exclusive_badge') ||
      set.has('themed_app_icon'),
    hasOracleBetaPass: Boolean(raw.hasOracleBetaPass) || set.has('oracle_beta'),
    hasFairyGodmotherPerk:
      Boolean(raw.hasFairyGodmotherPerk) || set.has('fairy_godmother'),
    hasMatriarchPerk: Boolean(raw.hasMatriarchPerk) || set.has('founding_matriarch'),
    hasStreakFreeze: Boolean(raw.hasStreakFreeze) || set.has('streak_freeze'),
    hasCustomSticker: Boolean(raw.hasCustomSticker) || set.has('custom_sticker'),
  };
}

export function normalizeVillageRewards(raw) {
  const base = createDefaultVillageRewards();
  if (!raw || typeof raw !== 'object') return base;

  const actions = raw.completedActions && typeof raw.completedActions === 'object'
    ? raw.completedActions
    : {};

  const redeemedTiers = normalizeRedeemedTiers(raw);
  const perks = derivePerkFlags(redeemedTiers, raw);
  const points = Math.max(0, Number(raw.points) || 0);
  const lifetimePoints = Math.max(
    points,
    Number(raw.lifetimePoints) || 0,
  );

  const coupons = Array.isArray(raw.discountCoupons)
    ? raw.discountCoupons.map((c) => String(c || '').trim()).filter(Boolean)
    : [];

  return {
    points,
    lifetimePoints,
    dailyStreak: Math.max(0, Number(raw.dailyStreak) || 0),
    completedActions: {
      pollFeedback: Boolean(actions.pollFeedback),
      registryCompleted: Boolean(actions.registryCompleted),
      subscriptionUpgrade: Boolean(actions.subscriptionUpgrade),
      vipPromo: Boolean(actions.vipPromo),
      dailyJournalDate: actions.dailyJournalDate || null,
      dailyPuzzleDate: actions.dailyPuzzleDate || null,
      dailyChecklistDate: actions.dailyChecklistDate || null,
      nurseryChecklistDate: actions.nurseryChecklistDate || null,
      nurseryChecklistCount: Math.max(0, Number(actions.nurseryChecklistCount) || 0),
      kitchenCookedDate: actions.kitchenCookedDate || null,
      dailyEncouragementsCount: Math.max(0, Number(actions.dailyEncouragementsCount) || 0),
      dailyEncourageDate: actions.dailyEncourageDate || null,
      weeklyJournalWeekKey: actions.weeklyJournalWeekKey || null,
      weeklyJournalCount: Math.max(0, Number(actions.weeklyJournalCount) || 0),
      weeklyJournalBonusClaimed: Boolean(actions.weeklyJournalBonusClaimed),
    },
    redeemedTiers,
    unlockedBadges: redeemedTiers,
    ...perks,
    customProfileTitle: String(raw.customProfileTitle || '').trim().slice(0, 48),
    selectedSecretThemeId: (() => {
      const resolved = resolveFairyThemeId(raw.selectedSecretThemeId);
      if (resolved) return resolved;
      // Fairy Godmother always keeps an active ombre blend selected.
      if (perks.hasFairyGodmotherPerk) return DEFAULT_FAIRY_OMBRE_ID;
      return null;
    })(),
    selectedMeBackgroundId: resolveMeBackgroundId(raw.selectedMeBackgroundId),
    selectedStickerId: (() => {
      if (!perks.hasCustomSticker) return null;
      return resolveStickerId(raw.selectedStickerId || DEFAULT_STICKER_ID);
    })(),
    selectedAppIconId: (() => {
      if (!perks.hasExclusiveBadge) return null;
      return resolveAppIconId(raw.selectedAppIconId || DEFAULT_APP_ICON_ID);
    })(),
    discountCoupons: coupons,
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
  try {
    await AsyncStorage.setItem(
      VILLAGE_REWARDS_STORAGE_KEY,
      JSON.stringify(normalizeVillageRewards(rewards)),
    );
  } catch (_) {
    /* non-blocking */
  }
}

export async function clearVillageRewards() {
  try {
    await AsyncStorage.removeItem(VILLAGE_REWARDS_STORAGE_KEY);
  } catch (_) {
    /* ignore */
  }
}

export function getNextTierProgress(pointsOrRewards) {
  const total =
    typeof pointsOrRewards === 'object' && pointsOrRewards
      ? Math.max(0, Number(pointsOrRewards.points) || 0)
      : Math.max(0, Number(pointsOrRewards) || 0);
  const redeemed = new Set(
    typeof pointsOrRewards === 'object' && pointsOrRewards
      ? normalizeRedeemedTiers(pointsOrRewards)
      : [],
  );
  const thresholds = REWARD_TIERS.map((tier) => tier.points);
  const next =
    REWARD_TIERS.find((tier) => !redeemed.has(tier.id) && total < tier.points) ||
    REWARD_TIERS.find((tier) => !redeemed.has(tier.id)) ||
    null;

  if (!next) {
    const last = REWARD_TIERS[REWARD_TIERS.length - 1];
    return {
      nextTier: null,
      currentThreshold: last?.points || 0,
      nextThreshold: last?.points || 0,
      progress: 1,
      pointsToNext: 0,
      absoluteProgress: 1,
    };
  }

  const prev =
    [...REWARD_TIERS].reverse().find((tier) => redeemed.has(tier.id) || total >= tier.points) ||
    null;
  const prevThreshold = prev ? prev.points : 0;
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

function finishAward(current, actions, awardAmount, extras = {}) {
  const points = current.points + awardAmount;
  const lifetimePoints = Math.max(current.lifetimePoints || 0, 0) + awardAmount;
  const next = {
    ...current,
    points,
    lifetimePoints,
    completedActions: actions,
    ...extras.state,
  };

  return {
    awarded: true,
    amount: awardAmount,
    reason: 'ok',
    rewards: next,
    newlyUnlocked: [],
    toastMessage: extras.toastMessage || `+${awardAmount} pts earned`,
    bonusToastMessage: extras.bonusToastMessage || null,
    bonusAmount: extras.bonusAmount || 0,
  };
}

/**
 * Spend Crown Points to redeem a tier perk.
 * @returns {{ ok: boolean, reason?: string, rewards: object, tier?: object, celebration?: object }}
 */
export function applyRedeemTier(rewards, tierId) {
  const current = normalizeVillageRewards(rewards);
  const tier = REWARD_TIERS.find((item) => item.id === tierId);
  if (!tier) {
    return { ok: false, reason: 'unknown_tier', rewards: current };
  }
  if (current.redeemedTiers.includes(tier.id)) {
    return { ok: false, reason: 'already_redeemed', rewards: current, tier };
  }
  if (current.points < tier.points) {
    return {
      ok: false,
      reason: 'insufficient_points',
      rewards: current,
      tier,
      pointsNeeded: tier.points - current.points,
    };
  }

  const redeemedTiers = [...current.redeemedTiers, tier.id];
  const next = {
    ...current,
    points: current.points - tier.points,
    redeemedTiers,
    unlockedBadges: redeemedTiers,
  };

  if (tier.type === 'badge' || tier.id === 'themed_app_icon') {
    next.hasExclusiveBadge = true;
    if (!next.selectedAppIconId) next.selectedAppIconId = DEFAULT_APP_ICON_ID;
  }
  if (tier.type === 'streak_freeze' || tier.id === 'streak_freeze') next.hasStreakFreeze = true;
  if (tier.id === 'custom_sticker') {
    next.hasCustomSticker = true;
    if (!next.selectedStickerId) next.selectedStickerId = DEFAULT_STICKER_ID;
  }
  if (tier.type === 'early_access') next.hasOracleBetaPass = true;
  if (tier.type === 'fairy_godmother') {
    next.hasFairyGodmotherPerk = true;
    if (!resolveFairyThemeId(next.selectedSecretThemeId)) {
      next.selectedSecretThemeId = DEFAULT_FAIRY_OMBRE_ID;
    }
    if (!next.customProfileTitle) {
      next.customProfileTitle = 'Feature Fairy Godmother';
    }
  }
  if (tier.type === 'matriarch') {
    next.hasMatriarchPerk = true;
    const coupons = Array.isArray(tier.coupons) ? tier.coupons : [];
    next.discountCoupons = Array.from(new Set([...(next.discountCoupons || []), ...coupons]));
    if (!next.customProfileTitle) {
      next.customProfileTitle = 'Founding Matriarch';
    }
  }

  return {
    ok: true,
    reason: 'redeemed',
    rewards: normalizeVillageRewards(next),
    tier,
    celebration: {
      title: `${tier.emoji} ${tier.title}`,
      body: tier.description || tier.perk,
      variant: tier.type === 'fairy_godmother' || tier.type === 'matriarch' ? 'vip' : 'premium',
    },
  };
}

export function updateRewardsProfileFields(rewards, fields = {}) {
  const current = normalizeVillageRewards(rewards);
  const next = { ...current };
  if (fields.customProfileTitle != null) {
    next.customProfileTitle = String(fields.customProfileTitle || '').trim().slice(0, 48);
  }
  if (fields.selectedSecretThemeId !== undefined) {
    const resolved = resolveFairyThemeId(fields.selectedSecretThemeId);
    next.selectedSecretThemeId = resolved || (next.hasFairyGodmotherPerk ? DEFAULT_FAIRY_OMBRE_ID : null);
  }
  if (fields.selectedMeBackgroundId !== undefined) {
    next.selectedMeBackgroundId = resolveMeBackgroundId(fields.selectedMeBackgroundId);
  }
  if (fields.selectedStickerId !== undefined) {
    next.selectedStickerId = next.hasCustomSticker
      ? resolveStickerId(fields.selectedStickerId)
      : null;
  }
  if (fields.selectedAppIconId !== undefined) {
    next.selectedAppIconId = next.hasExclusiveBadge
      ? resolveAppIconId(fields.selectedAppIconId)
      : null;
  }
  return normalizeVillageRewards(next);
}

/**
 * Pure award attempt. Returns whether points were granted + updated rewards.
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
    let bonusAmount = 0;
    let bonusToastMessage = null;

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
      toastMessage: `Journal saved — +${awardAmount} pts`,
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
  } else if (key === 'kitchenCooked') {
    if (actions.kitchenCookedDate === today) {
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
    actions.kitchenCookedDate = today;
    return finishAward(current, actions, awardAmount, {
      toastMessage: KITCHEN_COOKED_TOAST,
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
  } else if (key === 'adminTestGrant') {
    return finishAward(current, actions, awardAmount, {
      toastMessage: `Admin test +${awardAmount} pts`,
    });
  } else if (key === 'nurseryChecklistItem') {
    if (actions.nurseryChecklistDate !== today) {
      actions.nurseryChecklistDate = today;
      actions.nurseryChecklistCount = 0;
    }
    if (actions.nurseryChecklistCount >= NURSERY_CHECKLIST_DAILY_CAP) {
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
    actions.nurseryChecklistCount += 1;
    return finishAward(current, actions, awardAmount, {
      toastMessage: NURSERY_CHECKLIST_ITEM_TOAST,
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

/** Admin sandbox: set absolute points without public analytics side effects. */
export function applyAdminSetPoints(rewards, points) {
  const current = normalizeVillageRewards(rewards);
  const nextPoints = Math.max(0, Number(points) || 0);
  return {
    awarded: true,
    amount: nextPoints - current.points,
    reason: 'admin_sandbox',
    rewards: {
      ...current,
      points: nextPoints,
      lifetimePoints: Math.max(current.lifetimePoints || 0, nextPoints),
    },
    newlyUnlocked: [],
    toastMessage: ADMIN_TEST_POINTS_TOAST,
    bonusToastMessage: null,
    bonusAmount: 0,
    adminTest: true,
  };
}

export function getBadgeMeta(badgeId) {
  return REWARD_TIERS.find((tier) => tier.id === mapLegacyTierId(badgeId)) || null;
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

/** Soft premium access: Pro/sub OR Fairy Godmother redeem. */
export function hasSanctuaryPremiumAccess({
  isPro,
  isSubscribed,
  hasFairyGodmotherPerk,
} = {}) {
  return Boolean(isPro || isSubscribed || hasFairyGodmotherPerk);
}
