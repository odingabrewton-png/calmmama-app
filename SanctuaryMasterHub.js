import React, { Suspense, lazy } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const GalaxyParallaxBackdrop = lazy(() => import('./GalaxyParallaxBackdrop'));

const LAKE_BANNER = require('./assets/mamas-guidance-banner.png');

const ROW_H = 180;
const ROW_RADIUS = 20;
const ROW_GAP = 14;

import { VILLAGE_SNAPPY_REANIMATED } from './villageScreenTransitions';

const SPRING_SNAPPY = VILLAGE_SNAPPY_REANIMATED;

const ENTRY_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

function GalaxyFallback() {
  return <View style={styles.cosmicFallback} />;
}

function SpringHubRow({ onPress, accessibilityLabel, children }) {
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, SPRING_SNAPPY);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_SNAPPY);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.row, cardStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Top row → Sanctuary venting (Soul Sanctuary cloud emotions). */
function SanctuaryCosmicRow({ onPress }) {
  return (
    <SpringHubRow
      onPress={onPress}
      accessibilityLabel="Enter Sanctuary venting with cloud emotions"
    >
      <View style={styles.rowClip}>
        <Suspense fallback={<GalaxyFallback />}>
          <GalaxyParallaxBackdrop />
        </Suspense>
        <View style={styles.soulEntryOverlay}>
          <Text style={styles.soulEntryEyebrow}>PREMIUM SANCTUARY SPACE</Text>
          <Text style={[styles.soulEntryTitle, ENTRY_SERIF]}>The Soul Sanctuary</Text>
          <Text style={[styles.soulEntryDesc, ENTRY_SERIF]}>
            Drift among mood clouds, journal your heart, and talk with your village companion under
            the stars.
          </Text>
          <Text style={styles.soulEntryCta}>Enter the cosmic sanctuary →</Text>
        </View>
      </View>
    </SpringHubRow>
  );
}

/** Bottom row → Mama's Guidance venting journal. */
function MamasGuidanceLakeRow({ onPress }) {
  return (
    <SpringHubRow
      onPress={onPress}
      accessibilityLabel="Enter Mama's Guidance venting journal"
    >
      <Image source={LAKE_BANNER} style={styles.lakeBg} resizeMode="stretch" />
    </SpringHubRow>
  );
}

/** Center row → premium Mindful Pause breathing ritual. */
function MindfulPauseRow({ onPress }) {
  return (
    <SpringHubRow onPress={onPress} accessibilityLabel="Begin Mindful Pause breathing ritual">
      <View style={styles.pauseRowInner}>
        <Text style={styles.pauseEyebrow}>PREMIUM BREATHWORK</Text>
        <Text style={[styles.pauseTitle, ENTRY_SERIF]}>Mindful Pause</Text>
        <Text style={[styles.pauseDesc, ENTRY_SERIF]}>
          One minute of paced 4·7·8 breathing with grounding mantras — studio stillness for your
          nervous system.
        </Text>
        <Text style={styles.pauseCta}>Begin your pause →</Text>
      </View>
    </SpringHubRow>
  );
}

function SanctuaryMasterHub({
  onOpenSanctuaryVenting,
  onOpenMamasGuidance,
  onOpenMindfulPause,
  isPro = false,
  isSubscribed = false,
  onRequestUpgrade,
}) {
  const hasPro = Boolean(isPro || isSubscribed);
  const handleMindfulPause = () => {
    if (!hasPro) {
      onRequestUpgrade?.();
      return;
    }
    onOpenMindfulPause?.();
  };

  return (
    <View style={styles.stack}>
      <SanctuaryCosmicRow onPress={onOpenSanctuaryVenting} />
      <MindfulPauseRow onPress={handleMindfulPause} />
      <MamasGuidanceLakeRow onPress={onOpenMamasGuidance} />
    </View>
  );
}

export default React.memo(SanctuaryMasterHub);

const styles = StyleSheet.create({
  stack: {
    width: '100%',
    gap: ROW_GAP,
    backgroundColor: 'transparent',
  },
  row: {
    width: '100%',
    height: ROW_H,
    borderRadius: ROW_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#12101A',
  },
  rowClip: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0B0C10',
  },
  cosmicFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1224',
  },
  soulEntryOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(11, 16, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.35)',
    margin: 10,
    borderRadius: 18,
  },
  soulEntryEyebrow: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(233, 184, 212, 0.9)',
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  soulEntryTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#F8F4FF',
    textAlign: 'center',
    marginTop: 6,
  },
  soulEntryDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  soulEntryCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E9B8D4',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  lakeBg: {
    width: '100%',
    height: ROW_H,
  },
  pauseRowInner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#0A0910',
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.14)',
    margin: 10,
    borderRadius: 18,
  },
  pauseEyebrow: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(196, 184, 230, 0.72)',
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  pauseTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#E8E5F7',
    textAlign: 'center',
    marginTop: 6,
  },
  pauseDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(232, 229, 247, 0.62)',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  pauseCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4B8E8',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
