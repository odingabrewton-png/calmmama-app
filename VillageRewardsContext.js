/**
 * Village Rewards React context — hydrate/persist + soft pastel toast on awards.
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
import VillageRewardsToast from './VillageRewardsToast';

const VillageRewardsContext = createContext({
  rewards: createDefaultVillageRewards(),
  hydrated: false,
  addPoints: async () => ({ awarded: false }),
  resetRewards: async () => {},
});

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

  const showToast = useCallback((message) => {
    if (!message) return;
    setToast({ id: Date.now(), message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const addPoints = useCallback(async (amount, actionKey) => {
    const resolvedAmount =
      amount != null ? amount : REWARD_POINT_VALUES[actionKey] ?? 0;
    const result = applyAddPoints(rewardsRef.current, resolvedAmount, actionKey);
    if (!result.awarded) return result;

    rewardsRef.current = result.rewards;
    setRewards(result.rewards);
    showToast(result.toastMessage);
    try {
      await saveVillageRewards(result.rewards);
    } catch (_) {
      /* non-blocking persist */
    }
    return result;
  }, [showToast]);

  const resetRewards = useCallback(async () => {
    const fresh = createDefaultVillageRewards();
    rewardsRef.current = fresh;
    setRewards(fresh);
    await clearVillageRewards();
  }, []);

  const value = useMemo(
    () => ({
      rewards,
      hydrated,
      addPoints,
      resetRewards,
    }),
    [rewards, hydrated, addPoints, resetRewards],
  );

  return (
    <VillageRewardsContext.Provider value={value}>
      {children}
      <VillageRewardsToast toast={toast} />
    </VillageRewardsContext.Provider>
  );
}

export function useVillageRewards() {
  return useContext(VillageRewardsContext);
}
