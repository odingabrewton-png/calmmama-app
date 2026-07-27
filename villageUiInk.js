/**
 * Village copy ink — flips to white when a deeper Fairy Godmother wash is active.
 */

import { useMemo } from 'react';
import {
  fairyThemeUsesWhiteText,
  getActiveFairyTheme,
} from './secretFairyThemes';
import { useVillageRewards } from './VillageRewardsContext';

export const VILLAGE_INK_DEFAULT = '#152219';
export const VILLAGE_INK_WHITE = '#FFFFFF';
export const VILLAGE_INK_SOFT_DEFAULT = 'rgba(21, 34, 25, 0.72)';
export const VILLAGE_INK_SOFT_WHITE = 'rgba(255, 255, 255, 0.82)';

export function resolveVillageUiInk(fairyTheme) {
  if (fairyThemeUsesWhiteText(fairyTheme)) {
    return {
      ink: VILLAGE_INK_WHITE,
      inkSoft: VILLAGE_INK_SOFT_WHITE,
      whiteText: true,
    };
  }
  return {
    ink: VILLAGE_INK_DEFAULT,
    inkSoft: VILLAGE_INK_SOFT_DEFAULT,
    whiteText: false,
  };
}

export function useVillageUiInk() {
  const { rewards } = useVillageRewards();
  return useMemo(() => {
    const fairyTheme = getActiveFairyTheme({
      hasFairyGodmotherPerk: Boolean(rewards?.hasFairyGodmotherPerk),
      selectedSecretThemeId: rewards?.selectedSecretThemeId,
    });
    return resolveVillageUiInk(fairyTheme);
  }, [rewards?.hasFairyGodmotherPerk, rewards?.selectedSecretThemeId]);
}
