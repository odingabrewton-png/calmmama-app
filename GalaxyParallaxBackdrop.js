import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DEEP_STARS = Array.from({ length: 48 }, (_, i) => ({
  id: `d-${i}`,
  left: (i * 47) % 100,
  top: (i * 73) % 100,
  size: 1 + (i % 2),
}));

const SHIMMER_STARS = Array.from({ length: 22 }, (_, i) => ({
  id: `s-${i}`,
  left: (i * 61 + 11) % 100,
  top: (i * 39 + 7) % 100,
  size: 2 + (i % 3),
  warm: i % 3 === 0,
}));

export default function GalaxyParallaxBackdrop() {
  const breathe = useSharedValue(0);
  const drift = useSharedValue(0);
  const nebulaSpin = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    drift.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    nebulaSpin.value = withRepeat(
      withTiming(360, { duration: 120000, easing: Easing.linear }),
      -1,
      false
    );
  }, [breathe, drift, nebulaSpin]);

  const nebulaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${nebulaSpin.value}deg` }, { scale: 1.35 }],
    opacity: 0.03,
  }));

  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (drift.value - 0.5) * 18 },
      { translateY: (drift.value - 0.5) * 12 },
      { rotate: `${(drift.value - 0.5) * 4}deg` },
    ],
  }));

  return (
    <View style={styles.root} pointerEvents="none">
      <LinearGradient
        colors={['#1A1224', '#12101A', '#0B0C10']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.nebulaCloud, nebulaStyle]}>
        <LinearGradient
          colors={['rgba(120, 90, 180, 0.5)', 'rgba(200, 170, 100, 0.25)', 'transparent']}
          style={styles.nebulaBlob}
        />
      </Animated.View>

      {DEEP_STARS.map((star) => (
        <BreathingStar key={star.id} star={star} breathe={breathe} layer="deep" />
      ))}

      <Animated.View style={[styles.shimmerLayer, driftStyle]}>
        {SHIMMER_STARS.map((star) => (
          <ShimmerStar key={star.id} star={star} />
        ))}
      </Animated.View>
    </View>
  );
}

function BreathingStar({ star, breathe, layer }) {
  const style = useAnimatedStyle(() => {
    const phase = breathe.value;
    const min = layer === 'deep' ? 0.12 : 0.35;
    const max = layer === 'deep' ? 0.55 : 0.95;
    const opacity = min + (max - min) * phase;
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        style,
        {
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: '#E8E4F0',
        },
      ]}
    />
  );
}

function ShimmerStar({ star }) {
  return (
    <View
      style={[
        styles.star,
        {
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.warm ? '#F5E6C8' : '#FFF8F0',
          opacity: 0.75,
          shadowColor: star.warm ? '#E8D4A8' : '#FFFFFF',
          shadowOpacity: 0.45,
          shadowRadius: 4,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#0B0C10',
  },
  nebulaCloud: {
    position: 'absolute',
    top: SCREEN_H * 0.08,
    left: SCREEN_W * -0.2,
    width: SCREEN_W * 1.4,
    height: SCREEN_H * 0.55,
  },
  nebulaBlob: {
    flex: 1,
    borderRadius: SCREEN_W,
  },
  shimmerLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
  },
});
