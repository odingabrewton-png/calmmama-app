/**
 * Village Rewards React context — hydrate/persist + soft category notifications.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  applyAddPoints,
  clearVillageRewards,
  createDefaultVillageRewards,
  loadVillageRewards,
  REWARD_POINT_VALUES,
  saveVillageRewards,
} from './villageRewardsEngine';
import VillageNotificationToast, {
  NOTIFICATION_CATEGORIES,
} from './VillageNotificationToast';

const VillageRewardsContext = createContext({
  rewards: createDefaultVillageRewards(),
  hydrated: false,
  addPoints: async () => ({ awarded: false }),
  grantTestPoints: async () => ({ awarded: false }),
  resetRewards: async () => {},
  notify: () => {},
});

function categoryForActionKey(actionKey) {
  switch (actionKey) {
    case 'dailyChecklist':
      return NOTIFICATION_CATEGORIES.checklist;
    case 'dailyJournal':
    case 'weeklyJournalBonus':
      return NOTIFICATION_CATEGORIES.sanctuary;
    case 'encourage':
    case 'pollFeedback':
      return NOTIFICATION_CATEGORIES.community;
    case 'subscriptionUpgrade':
    case 'vipPromo':
      return NOTIFICATION_CATEGORIES.membership;
    case 'kitchenCooked':
      return NOTIFICATION_CATEGORIES.kitchen;
    default:
      return NOTIFICATION_CATEGORIES.rewards;
  }
}

function titleForCategory(category) {
  switch (category) {
    case NOTIFICATION_CATEGORIES.checklist:
      return 'Daily Checklist';
    case NOTIFICATION_CATEGORIES.kitchen:
      return "Mama's Kitchen";
    case NOTIFICATION_CATEGORIES.sanctuary:
      return 'Soul Sanctuary';
    case NOTIFICATION_CATEGORIES.bloom:
      return 'Weekly Bloom';
    case NOTIFICATION_CATEGORIES.nursery:
      return 'Cloud Nursery';
    case NOTIFICATION_CATEGORIES.community:
      return 'Village Love';
    case NOTIFICATION_CATEGORIES.membership:
      return 'Village Access';
    default:
      return 'Village Rewards';
  }
}

export function VillageRewardsProvider({ children }) {
  const [rewards, setRewards] = useState(createDefaultVillageRewards);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState(null);
  const rewardsRef = useRef(rewards);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    rewardsRef.current = rewards;
  }, [rewards]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadVillageRewards();
      if (!mounted) return;
      setRewards(loaded);
      setHydrated(true);
    })();
    return () => {
      mounted = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const notify = useCallback((input, maybeDurationMs) => {
    const payload =
      typeof input === 'string'
        ? {
            message: input,
            category: NOTIFICATION_CATEGORIES.rewards,
            durationMs: maybeDurationMs,
          }
        : input || {};

    const message = String(payload.message || '').trim();
    if (!message) return;

    const category = payload.category || NOTIFICATION_CATEGORIES.rewards;
    const durationMs = payload.durationMs || maybeDurationMs || 2600;

    setToast({
      id: Date.now(),
      message,
      title: payload.title || titleForCategory(category),
      category,
      emoji: payload.emoji,
      durationMs,
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), durationMs + 320);
  }, []);

  const showToast = useCallback(
    (message, durationMs = 2600, category = NOTIFICATION_CATEGORIES.rewards) => {
      notify({ message, durationMs, category });
    },
    [notify],
  );

  const addPoints = useCallback(
    async (amount, actionKey) => {
      const resolvedAmount =
        amount != null ? amount : REWARD_POINT_VALUES[actionKey] ?? 0;
      const result = applyAddPoints(rewardsRef.current, resolvedAmount, actionKey);
      if (!result.awarded) return result;

      rewardsRef.current = result.rewards;
      setRewards(result.rewards);

      const category = categoryForActionKey(actionKey);
      showToast(result.toastMessage, 2600, category);

      if (result.bonusToastMessage) {
        const bonusMsg = result.bonusToastMessage;
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          showToast(bonusMsg, 3000, NOTIFICATION_CATEGORIES.sanctuary);
        }, 2700);
      }

      try {
        await saveVillageRewards(result.rewards);
      } catch (_) {
        /* non-blocking persist */
      }
      return result;
    },
    [showToast],
  );

  const grantTestPoints = useCallback(
    async (amount) => {
      const result = applyAddPoints(
        rewardsRef.current,
        Math.max(0, Number(amount) || 0),
        'adminTestGrant',
      );
      if (!result.awarded) return result;
      rewardsRef.current = result.rewards;
      setRewards(result.rewards);
      showToast(result.toastMessage, 2600, NOTIFICATION_CATEGORIES.rewards);
      try {
        await saveVillageRewards(result.rewards);
      } catch (_) {
        /* ignore */
      }
      return { ...result, adminTest: true, message: result.toastMessage };
    },
    [showToast],
  );

  const resetRewards = useCallback(async () => {
    const fresh = createDefaultVillageRewards();
    rewardsRef.current = fresh;
    setRewards(fresh);
    await clearVillageRewards();
    return { ok: true, adminTest: true, message: 'Test points reset' };
  }, []);

  const value = useMemo(
    () => ({
      rewards,
      hydrated,
      addPoints,
      grantTestPoints,
      resetRewards,
      notify,
    }),
    [rewards, hydrated, addPoints, grantTestPoints, resetRewards, notify],
  );

  return (
    <VillageRewardsContext.Provider value={value}>
      {children}
      <VillageNotificationToast toast={toast} />
    </VillageRewardsContext.Provider>
  );
}

export function useVillageRewards() {
  return useContext(VillageRewardsContext);
}

export { NOTIFICATION_CATEGORIES };
