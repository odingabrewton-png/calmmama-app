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

const VillageRewardsContext = createContext({
  rewards: createDefaultVillageRewards(),
  hydrated: false,
  addPoints: async () => ({ awarded: false }),
  grantTestPoints: async () => ({ awarded: false }),
  resetRewards: async () => {},
});

export function VillageRewardsProvider({ children }) {
  const [rewards, setRewards] = useState(createDefaultVillageRewards);
  const [hydrated, setHydrated] = useState(false);
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

  const showToast = useCallback((_message, _durationMs = 2400) => {
    // Soft point toasts disabled — awards still persist without popup noise.
  }, []);

  const addPoints = useCallback(async (amount, actionKey) => {
    const resolvedAmount =
      amount != null ? amount : REWARD_POINT_VALUES[actionKey] ?? 0;
    const result = applyAddPoints(rewardsRef.current, resolvedAmount, actionKey);
    if (!result.awarded) return result;

    rewardsRef.current = result.rewards;
    setRewards(result.rewards);
    showToast(result.toastMessage);

    // Weekly Sanctuary bonus toast follows the entry toast when 5 journals land.
    if (result.bonusToastMessage) {
      const bonusMsg = result.bonusToastMessage;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        showToast(bonusMsg, 2800);
      }, 2500);
    }

    try {
      await saveVillageRewards(result.rewards);
    } catch (_) {
      /* non-blocking persist */
    }
    return result;
  }, [showToast]);

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
      showToast(result.toastMessage);
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
    }),
    [rewards, hydrated, addPoints, grantTestPoints, resetRewards],
  );

  return (
    <VillageRewardsContext.Provider value={value}>
      {children}
    </VillageRewardsContext.Provider>
  );
}

export function useVillageRewards() {
  return useContext(VillageRewardsContext);
}
