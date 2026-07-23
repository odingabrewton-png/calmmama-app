import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import BabyMilestoneScrapbook from './BabyMilestoneScrapbook';
import VillageRewardsHighlightCard from './VillageRewardsHighlightCard';
import { warmPostpartumHome } from './postpartumHomePreload';
import {
  POSTPARTUM_INFANT_HOME_LAYOUT,
  POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED,
  POSTPARTUM_INFANT_HOME_STACK,
} from './postpartumInfantHomeLayoutConfig';

/** POSTPARTUM INFANT HOME — layout locked. Say "UNLOCK POSTPARTUM INFANT HOME LAYOUT" before structural edits. */

export default function PostpartumInfantHome({
  babyAge,
  mamaName,
  entries,
  onSaveEntry,
  onExploreRewards,
}) {
  if (__DEV__ && !POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED) {
    console.warn('[PostpartumInfantHome] POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED is false — layout edits allowed');
  }

  useEffect(() => {
    warmPostpartumHome('postpartum', babyAge);
  }, [babyAge]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      nestedScrollEnabled
      nativeID={POSTPARTUM_INFANT_HOME_STACK[0]}
    >
      <VillageRewardsHighlightCard onExploreRewards={onExploreRewards} />
      <BabyMilestoneScrapbook
        babyAge={babyAge}
        mamaName={mamaName}
        entries={entries}
        onSaveEntry={onSaveEntry}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: POSTPARTUM_INFANT_HOME_LAYOUT.scrollPad,
    paddingBottom: POSTPARTUM_INFANT_HOME_LAYOUT.scrollPadBottom,
    backgroundColor: 'transparent',
  },
});
