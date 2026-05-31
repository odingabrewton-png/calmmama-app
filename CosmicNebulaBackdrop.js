import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Platform } from 'react-native';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const STAR_COUNT = 18;

const STAR_SEEDS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: `${8 + ((i * 37) % 84)}%`,
  top: `${6 + ((i * 53) % 78)}%`,
  size: i % 4 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
  delay: i * 180,
}));

/** Lightweight cosmic backdrop — twinkling stars + shifting nebula washes */
export default function CosmicNebulaBackdrop({ phaseAnim }) {
  const starAnims = useRef(STAR_SEEDS.map(() => new Animated.Value(0.35))).current;

  const violetWash = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 0.2, 0.55],
  });
  const magentaWash = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.5, 0.15],
  });
  const horizonGlow = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.25, 0.45, 0.25],
  });

  useEffect(() => {
    const twinkles = starAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(STAR_SEEDS[index].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1400 + (index % 5) * 220,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 1400 + (index % 5) * 220,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      )
    );
    twinkles.forEach((t) => t.start());
    return () => twinkles.forEach((t) => t.stop());
  }, [starAnims]);

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.baseSky} />
      <Animated.View style={[styles.nebulaLayer, styles.violetNebula, { opacity: violetWash }]} />
      <Animated.View style={[styles.nebulaLayer, styles.magentaNebula, { opacity: magentaWash }]} />
      <Animated.View style={[styles.nebulaLayer, styles.horizonBand, { opacity: horizonGlow }]} />
      {STAR_SEEDS.map((star, index) => (
        <Animated.View
          key={`star-${index}`}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: starAnims[index],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
    backgroundColor: '#050B1F',
  },
  baseSky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1026',
  },
  nebulaLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  violetNebula: Platform.select({
    web: {
      backgroundImage:
        'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(123, 31, 162, 0.55) 0%, rgba(75, 0, 130, 0.2) 45%, transparent 70%)',
    },
    default: { backgroundColor: 'rgba(123, 31, 162, 0.35)' },
  }),
  magentaNebula: Platform.select({
    web: {
      backgroundImage:
        'radial-gradient(ellipse 70% 50% at 65% 35%, rgba(216, 27, 96, 0.4) 0%, rgba(233, 30, 99, 0.15) 50%, transparent 75%)',
    },
    default: { backgroundColor: 'rgba(216, 27, 96, 0.22)' },
  }),
  horizonBand: Platform.select({
    web: {
      backgroundImage:
        'linear-gradient(180deg, transparent 0%, rgba(255, 171, 145, 0.12) 72%, rgba(255, 204, 188, 0.2) 100%)',
    },
    default: { backgroundColor: 'rgba(255, 171, 145, 0.1)' },
  }),
  star: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
});
