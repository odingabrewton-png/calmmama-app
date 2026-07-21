import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  LOTUS_CLOSE_SPRING,
  safeAssignSequence,
  safeAssignSpring,
  safeCancelAnimation,
} from './reanimatedSafe';
import { logNativeCheckpoint, runNativeGuard } from './nativeRuntimeGuard';

const OPEN_PEAK_SCALE = 1.22;
const OPEN_HELD_SCALE = 1.1;
const OPEN_HELD_BLOOM = 0.5;
const OPEN_RISE_MS = 260;
const OPEN_SETTLE_MS = 220;

const SUBTLE_OPEN_PEAK_SCALE = 1.08;
const SUBTLE_OPEN_HELD_SCALE = 1.03;
const SUBTLE_OPEN_HELD_BLOOM = 0.28;
const SUBTLE_PETAL_RING_SCALE = 1.08;
const SUBTLE_PETAL_BLOOM_SCALE = 1.03;

const GRADIENTS = {
  blush: {
    petals: ['#E8B4B0', '#D9A8A4', '#C99590'],
    center: ['#FFF9F4', '#F5EDE4', '#EDD9CF'],
  },
  lavender: {
    petals: ['#B8B4D4', '#A8A4C8', '#9692BC'],
    center: ['#F4F0FA', '#ECE6F5', '#DDD6EE'],
  },
};

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function LotusPetal({ deg, bloom, palette, subtleBloom = false }) {
  const petalLift = subtleBloom ? -3 : -6;
  const petalScale = subtleBloom ? 1.03 : 1.06;

  const petalStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${deg}deg` },
      { translateY: interpolate(bloom.value, [0, 1], [0, petalLift]) },
      { scale: interpolate(bloom.value, [0, 1], [1, petalScale]) },
    ],
  }));

  return (
    <Animated.View style={[styles.petalSlot, petalStyle]}>
      <LinearGradient
        colors={palette.petals}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.petal}
      />
    </Animated.View>
  );
}

export default function LotusFlowerButton({
  variant = 'blush',
  label,
  hideLabel = false,
  midnightLoungeOpen = false,
  subtleBloom = false,
  onPress,
}) {
  const flowerScale = useSharedValue(1);
  const bloom = useSharedValue(0);
  const wasLoungeOpenRef = useRef(false);
  const palette = GRADIENTS[variant] || GRADIENTS.blush;
  const openPeakScale = subtleBloom ? SUBTLE_OPEN_PEAK_SCALE : OPEN_PEAK_SCALE;
  const openHeldScale = subtleBloom ? SUBTLE_OPEN_HELD_SCALE : OPEN_HELD_SCALE;
  const openHeldBloom = subtleBloom ? SUBTLE_OPEN_HELD_BLOOM : OPEN_HELD_BLOOM;
  const petalRingOpenScale = subtleBloom ? SUBTLE_PETAL_RING_SCALE : 1.18;
  const centerOpenScale = subtleBloom ? SUBTLE_PETAL_BLOOM_SCALE : 1.05;

  useEffect(() => {
    logNativeCheckpoint('LotusFlowerButton:bloom', { midnightLoungeOpen });
    safeCancelAnimation(flowerScale, 'lotus:cancelScale');
    safeCancelAnimation(bloom, 'lotus:cancelBloom');

    if (midnightLoungeOpen) {
      runNativeGuard('lotus:open', () => {
        safeAssignSequence(
          flowerScale,
          [
            withTiming(openPeakScale, {
              duration: OPEN_RISE_MS,
              easing: Easing.out(Easing.cubic),
            }),
            withTiming(openHeldScale, {
              duration: OPEN_SETTLE_MS,
              easing: Easing.inOut(Easing.cubic),
            }),
          ],
          'lotus:openScale',
        );
        safeAssignSequence(
          bloom,
          [
            withTiming(1, { duration: OPEN_RISE_MS, easing: Easing.out(Easing.cubic) }),
            withTiming(openHeldBloom, {
              duration: OPEN_SETTLE_MS,
              easing: Easing.inOut(Easing.cubic),
            }),
          ],
          'lotus:openBloom',
        );
      });
      wasLoungeOpenRef.current = true;
      return;
    }

    if (wasLoungeOpenRef.current) {
      runNativeGuard('lotus:close', () => {
        safeAssignSpring(flowerScale, 1.0, LOTUS_CLOSE_SPRING, 'lotus:closeScale');
        safeAssignSpring(bloom, 0, LOTUS_CLOSE_SPRING, 'lotus:closeBloom');
      });
    }

    wasLoungeOpenRef.current = false;
  }, [midnightLoungeOpen, subtleBloom, flowerScale, bloom, openPeakScale, openHeldScale, openHeldBloom]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flowerScale.value }],
  }));

  const petalRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(bloom.value, [0, 1], [1, petalRingOpenScale]) }],
    opacity: interpolate(bloom.value, [0, 1], [0.92, 1]),
  }));

  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(bloom.value, [0, 1], [1, centerOpenScale]) }],
  }));

  const handlePressIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handlePress = () => {
    onPress?.();
  };

  return (
    <View style={styles.row}>
      {!hideLabel && label ? <Text style={styles.rowLabel}>{label}</Text> : null}
      <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Animated.View style={[styles.lotusOuter, animatedStyle]}>
          <Animated.View style={[styles.petalRing, petalRingStyle]}>
            {PETAL_ANGLES.map((deg) => (
              <LotusPetal key={deg} deg={deg} bloom={bloom} palette={palette} subtleBloom={subtleBloom} />
            ))}
          </Animated.View>
          <Animated.View style={centerStyle}>
            <LinearGradient colors={palette.center} style={styles.lotusCenter}>
              <Text style={styles.lotusEmoji}>🪷</Text>
            </LinearGradient>
          </Animated.View>
          <View style={styles.lotusShadow} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    marginBottom: 28,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5C4A52',
    marginBottom: 14,
    letterSpacing: 0.3,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
      default: {},
    }),
  },
  lotusOuter: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalRing: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalSlot: {
    position: 'absolute',
    width: 108,
    height: 108,
    alignItems: 'center',
  },
  petal: {
    width: 34,
    height: 48,
    borderRadius: 20,
    marginTop: 4,
    opacity: 0.92,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  lotusCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  lotusEmoji: {
    fontSize: 22,
  },
  lotusShadow: {
    position: 'absolute',
    bottom: -6,
    width: 64,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(90, 70, 80, 0.12)',
  },
});
