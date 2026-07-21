import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import ModularBabyGrowth from './ModularBabyGrowth';
import { resolveBabyGrowthWeek } from './modularBabyGrowthConfig';

/** Bloom tab — Your Blooming Body (pregnant mamas only). Video only, no extra overlays. */
function BabyGrowthScreen({ week = 20, embedded = false, isActive = true }) {
  const safeWeek = resolveBabyGrowthWeek(week);

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      <ModularBabyGrowth currentWeek={safeWeek} embedded={embedded} isActive={isActive} />
    </View>
  );
}

export default memo(BabyGrowthScreen);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  containerEmbedded: {
    alignItems: 'center',
  },
});
