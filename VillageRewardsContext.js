/**
 * Village Rewards React context — hydrate/persist Crown Points + perk state.
 * In-app toast popups are disabled; iOS OS notifications stay separate.
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

  /** In-app toast popups removed — kept as a no-op so call sites stay stable. */
  const notify = useCallback(() => {}, []);

  const addPoints = useCallback(async (amount, actionKey) => {
    const resolvedAmount =
      amount != null ? amount : REWARD_POINT_VALUES[actionKey] ?? 0;
    const result = applyAddPoints(rewardsRef.current, resolvedAmount, actionKey);
    if (!result.awarded) return result;

    rewardsRef.current = result.rewards;
    setRewards(result.rewards);

    try {
      await saveVillageRewards(result.rewards);
    } catch (_) {
      /* non-blocking persist */
    }
    return result;
  }, []);

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

  const grantTestPoints = useCallback(async (amount) => {
    const result = applyAddPoints(
      rewardsRef.current,
      Math.max(0, Number(amount) || 0),
      'adminTestGrant',
    );
    if (!result.awarded) return result;
    rewardsRef.current = result.rewards;
    setRewards(result.rewards);
    try {
      await saveVillageRewards(result.rewards);
    } catch (_) {
      /* ignore */
    }
    return { ...result, adminTest: true, message: result.toastMessage };
  }, []);

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
