import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  computeSproutGrowth,
  getSproutNourishHints,
  getSproutStage,
} from './sproutGrowthEngine';

const LEAF_ANGLES = [-48, -18, 18, 48, 72];

function SproutLeaf({ index, palette, visible }) {
  const angle = LEAF_ANGLES[index] || 0;
  const pop = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    pop.value = withSpring(visible ? 1 : 0, { damping: 12, stiffness: 160 });
  }, [visible, pop]);

  const style = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [
      { rotate: `${angle}deg` },
      { scale: 0.4 + pop.value * 0.6 },
      { translateY: (1 - pop.value) * 10 },
    ],
  }));

  return (
    <Animated.View style={[styles.leafSlot, style]}>
      <LinearGradient
        colors={[palette.leaf, palette.stem]}
        style={styles.leaf}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
    </Animated.View>
  );
}

function BloomFlower({ palette, visible }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!visible) return undefined;
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return undefined;
  }, [visible, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: visible ? 0.85 + pulse.value * 0.15 : 0,
    transform: [{ scale: 0.9 + pulse.value * 0.12 }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.bloomWrap, style]}>
      <LinearGradient colors={['#F5D4C8', palette.glow, '#E8B4A8']} style={styles.bloomCore} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <View key={deg} style={[styles.petalSlot, { transform: [{ rotate: `${deg}deg` }] }]}>
          <View style={[styles.petal, { backgroundColor: palette.glow }]} />
        </View>
      ))}
    </Animated.View>
  );
}

export default function LittleSproutGarden({
  babyAge = 'Newborn',
  mamaWinsTasks = [],
  postpartumVibeHistory = [],
  selectedPostpartumVibes = [],
  nurseryLogs = [],
  hydrationOz = 0,
  hydrationGoal = 64,
  minutesForMe = 0,
  primaryAnchor = false,
}) {
  const metrics = useMemo(
    () =>
      computeSproutGrowth({
        mamaWinsTasks,
        postpartumVibeHistory,
        selectedPostpartumVibes,
        nurseryLogs,
        hydrationOz,
        hydrationGoal,
        minutesForMe,
      }),
    [
      mamaWinsTasks,
      postpartumVibeHistory,
      selectedPostpartumVibes,
      nurseryLogs,
      hydrationOz,
      hydrationGoal,
      minutesForMe,
    ]
  );

  const stage = useMemo(() => getSproutStage(metrics.score), [metrics.score]);
  const hints = useMemo(() => getSproutNourishHints(metrics), [metrics]);

  const breathe = useSharedValue(0);
  const tilt = useSharedValue(0);
  const stemGrow = useSharedValue(stage.stemH);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [breathe]);

  useEffect(() => {
    stemGrow.value = withSpring(stage.stemH, { damping: 14, stiffness: 120 });
  }, [stage.stemH, stemGrow]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tilt.value = Math.max(-12, Math.min(12, e.translationX * 0.08));
    })
    .onEnd(() => {
      tilt.value = withSpring(0, { damping: 10, stiffness: 140 });
    });

  const potStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${tilt.value * 0.35}deg` },
      { translateY: interpolate(breathe.value, [0, 1], [0, -3]) },
    ],
  }));

  const stemStyle = useAnimatedStyle(() => ({
    height: stemGrow.value,
    transform: [{ scaleY: 0.85 + breathe.value * 0.08 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + breathe.value * 0.2,
    transform: [{ scale: 1 + breathe.value * 0.06 }],
  }));

  return (
    <View style={[styles.card, primaryAnchor && styles.cardAnchor]}>
      <LinearGradient
        colors={['rgba(230, 236, 230, 0.55)', 'rgba(243, 235, 233, 0.42)', 'rgba(251, 249, 246, 0.35)']}
        style={[styles.cardGradient, primaryAnchor && styles.cardGradientAnchor]}
      >
        <Text style={styles.eyebrow}>THE LITTLE SPROUT GARDEN</Text>
        <Text style={styles.title}>Your baby's growth today</Text>
        <Text style={styles.sub}>
          Every self-care log and nursery moment helps your sprout bloom for {babyAge}.
        </Text>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.gardenStage, primaryAnchor && styles.gardenStageAnchor, potStyle]}>
            <Animated.View style={[styles.glowOrb, glowStyle, { backgroundColor: stage.palette.glow }]} />

            <View style={styles.plantColumn}>
              <BloomFlower palette={stage.palette} visible={stage.bloom} />
              <View style={styles.leafRing}>
                {LEAF_ANGLES.map((_, idx) => (
                  <SproutLeaf
                    key={idx}
                    index={idx}
                    palette={stage.palette}
                    visible={idx < stage.leafCount}
                  />
                ))}
              </View>
              {stage.stemH > 0 ? (
                <Animated.View style={[styles.stem, stemStyle, { backgroundColor: stage.palette.stem }]} />
              ) : (
                <View style={styles.seedDot}>
                  <LinearGradient
                    colors={['#C4A88A', '#8B6E52']}
                    style={styles.seedGradient}
                  />
                </View>
              )}
            </View>

            <LinearGradient
              colors={['#A8927A', stage.palette.soil, '#5E4E3C']}
              style={styles.pot}
            >
              <View style={styles.potRim} />
              <View style={styles.soilSurface} />
            </LinearGradient>
          </Animated.View>
        </GestureDetector>

        <View style={styles.statusRow}>
          <View style={styles.stagePill}>
            <Text style={styles.stagePillText}>{stage.label}</Text>
          </View>
          <Text style={styles.scoreText}>{metrics.score}% nourished</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${metrics.score}%`, backgroundColor: stage.palette.stem }]} />
        </View>

        <View style={styles.metricsRow}>
          <MetricChip label="Mama wins" value={`${metrics.winsDone}/${metrics.winsTotal}`} />
          <MetricChip label="Vibes" value={String(metrics.vibesToday)} />
          <MetricChip label="Nursery" value={String(metrics.logsToday)} />
          <MetricChip label="Water" value={`${Math.round(metrics.hydrationRatio * 100)}%`} />
        </View>

        {hints.map((hint) => (
          <Text key={hint} style={styles.hint}>
            🌱 {hint}
          </Text>
        ))}
      </LinearGradient>
    </View>
  );
}

function MetricChip({ label, value }) {
  return (
    <View style={styles.metricChip}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  cardAnchor: {
    flex: 1,
    marginBottom: 8,
  },
  cardGradient: {
    padding: 18,
    paddingBottom: 16,
  },
  cardGradientAnchor: {
    flex: 1,
    paddingVertical: 22,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#7A6A62',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3E38',
    textAlign: 'center',
    marginBottom: 4,
    ...Platform.select({
      web: { fontFamily: 'Georgia, serif' },
      default: {},
    }),
  },
  sub: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6E5E58',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  gardenStage: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 200,
    marginBottom: 12,
  },
  gardenStageAnchor: {
    height: 268,
    marginBottom: 16,
  },
  glowOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 18,
  },
  plantColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 130,
    marginBottom: -6,
    zIndex: 2,
  },
  stem: {
    width: 7,
    borderRadius: 4,
    minHeight: 4,
  },
  seedDot: {
    width: 18,
    height: 14,
    marginBottom: 2,
    borderRadius: 9,
    overflow: 'hidden',
  },
  seedGradient: {
    flex: 1,
    borderRadius: 9,
  },
  leafRing: {
    position: 'absolute',
    bottom: 8,
    width: 120,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leafSlot: {
    position: 'absolute',
    bottom: 20,
    width: 40,
    height: 22,
    alignItems: 'center',
  },
  leaf: {
    width: 34,
    height: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bloomWrap: {
    position: 'absolute',
    top: -8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloomCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 2,
  },
  petalSlot: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
  },
  petal: {
    width: 12,
    height: 20,
    borderRadius: 10,
    marginTop: 2,
    opacity: 0.9,
  },
  pot: {
    width: 108,
    height: 58,
    borderRadius: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(90, 70, 55, 0.35)',
    overflow: 'hidden',
    zIndex: 1,
  },
  potRim: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  soilSurface: {
    flex: 1,
    backgroundColor: 'rgba(60, 48, 38, 0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stagePill: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stagePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A4E48',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6A5A',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  metricChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A4038',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8A7A72',
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6A5E58',
    marginTop: 4,
    textAlign: 'center',
    ...Platform.select({
      web: { fontFamily: 'Georgia, serif' },
      default: {},
    }),
  },
});
