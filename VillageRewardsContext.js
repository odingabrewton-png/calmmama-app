/**
 * Village Rewards React context — hydrate/persist Crown Points + perk state.
 * Moment alerts surface as real iOS/Android OS notifications (not in-app toasts).
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
import { View, StyleSheet } from 'react-native';
import {
  applyAddPoints,
  applyRedeemTier,
  clearVillageRewards,
  createDefaultVillageRewards,
  loadVillageRewards,
  REWARD_POINT_VALUES,
  saveVillageRewards,
  updateRewardsProfileFields,
} from './villageRewardsEngine';
import { NOTIFICATION_CATEGORIES } from './VillageNotificationToast';
import { presentVillageMomentNotification } from './villageNotificationScheduler';

const VillageRewardsContext = createContext({
  rewards: createDefaultVillageRewards(),
  hydrated: false,
  addPoints: async () => ({ awarded: false }),
  redeemTier: async () => ({ ok: false }),
  updateProfileFields: async () => createDefaultVillageRewards(),
  grantTestPoints: async () => ({ awarded: false }),
  resetRewards: async () => {},
  notify: () => {},
});

function categoryForActionKey(actionKey) {
  switch (actionKey) {
    case 'dailyChecklist':
      return NOTIFICATION_CATEGORIES.checklist;
    case 'nurseryChecklistItem':
      return NOTIFICATION_CATEGORIES.nursery;
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
  const rewardsRef = useRef(rewards);

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

    presentVillageMomentNotification({
      title: payload.title || titleForCategory(category),
      body: message,
      category,
      route: payload.route,
      emoji: payload.emoji,
    }).catch(() => {});
  }, []);

  const addPoints = useCallback(
    async (amount, actionKey) => {
      const resolvedAmount =
        amount != null ? amount : REWARD_POINT_VALUES[actionKey] ?? 0;
      const result = applyAddPoints(rewardsRef.current, resolvedAmount, actionKey);
      if (!result.awarded) return result;

      rewardsRef.current = result.rewards;
      setRewards(result.rewards);

      const category = categoryForActionKey(actionKey);
      if (result.toastMessage) {
        notify({
          message: result.toastMessage,
          category,
          title: titleForCategory(category),
        });
      }
      if (result.bonusToastMessage) {
        setTimeout(() => {
          notify({
            message: result.bonusToastMessage,
            category: NOTIFICATION_CATEGORIES.sanctuary,
            title: titleForCategory(NOTIFICATION_CATEGORIES.sanctuary),
          });
        }, 1200);
      }

      try {
        await saveVillageRewards(result.rewards);
      } catch (_) {
        /* non-blocking persist */
      }
      return result;
    },
    [notify],
  );

  const redeemTier = useCallback(async (tierId) => {
    const result = applyRedeemTier(rewardsRef.current, tierId);
    if (!result.ok) return result;

    rewardsRef.current = result.rewards;
    setRewards(result.rewards);
    try {
      await saveVillageRewards(result.rewards);
    } catch (_) {
      /* non-blocking persist */
    }
    return result;
  }, []);

  const updateProfileFields = useCallback(async (fields) => {
    const next = updateRewardsProfileFields(rewardsRef.current, fields);
    rewardsRef.current = next;
    setRewards(next);
    try {
      await saveVillageRewards(next);
    } catch (_) {
      /* ignore */
    }
    return next;
  }, []);

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
      if (result.toastMessage) {
        notify({
          message: result.toastMessage,
          category: NOTIFICATION_CATEGORIES.rewards,
        });
      }
      try {
        await saveVillageRewards(result.rewards);
      } catch (_) {
        /* ignore */
      }
      return { ...result, adminTest: true, message: result.toastMessage };
    },
    [notify],
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
      redeemTier,
      updateProfileFields,
      grantTestPoints,
      resetRewards,
      notify,
    }),
    [
      rewards,
      hydrated,
      addPoints,
      redeemTier,
      updateProfileFields,
      grantTestPoints,
      resetRewards,
      notify,
    ],
  );

  return (
    <VillageRewardsContext.Provider value={value}>
      <View style={styles.shell}>{children}</View>
    </VillageRewardsContext.Provider>
  );
}

export function useVillageRewards() {
  return useContext(VillageRewardsContext);
}

export { NOTIFICATION_CATEGORIES };

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
