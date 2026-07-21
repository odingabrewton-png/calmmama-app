import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const STAR_LAYOUT = [
  { top: '4%', left: '6%', size: 12 },
  { top: '8%', left: '22%', size: 9 },
  { top: '5%', left: '48%', size: 11 },
  { top: '10%', left: '68%', size: 10 },
  { top: '6%', left: '88%', size: 8 },
  { top: '16%', left: '12%', size: 10 },
  { top: '18%', left: '38%', size: 8 },
  { top: '14%', left: '58%', size: 12 },
  { top: '20%', left: '82%', size: 9 },
  { top: '26%', left: '4%', size: 11 },
  { top: '28%', left: '30%', size: 9 },
  { top: '24%', left: '72%', size: 10 },
  { top: '32%', left: '50%', size: 8 },
  { top: '36%', left: '16%', size: 10 },
  { top: '38%', left: '90%', size: 11 },
  { top: '44%', left: '34%', size: 9 },
  { top: '46%', left: '64%', size: 12 },
  { top: '52%', left: '8%', size: 8 },
  { top: '54%', left: '48%', size: 10 },
  { top: '50%', left: '78%', size: 9 },
  { top: '60%', left: '20%', size: 11 },
  { top: '62%', left: '56%', size: 8 },
  { top: '58%', left: '86%', size: 10 },
  { top: '68%', left: '10%', size: 9 },
  { top: '70%', left: '40%', size: 12 },
  { top: '66%', left: '70%', size: 8 },
  { top: '76%', left: '26%', size: 10 },
  { top: '78%', left: '52%', size: 9 },
  { top: '74%', left: '84%', size: 11 },
  { top: '84%', left: '14%', size: 8 },
  { top: '86%', left: '44%', size: 10 },
  { top: '82%', left: '68%', size: 9 },
  { top: '90%', left: '32%', size: 11 },
  { top: '92%', left: '58%', size: 8 },
];

export const PREGNANT_VILLAGE_COSMIC = {
  top: '#2D2352',
  bottom: '#1A1438',
};

export default function VillageCosmicStarsLayer() {
  const twinkles = useRef(STAR_LAYOUT.map(() => new Animated.Value(0.25 + Math.random() * 0.35))).current;

  useEffect(() => {
    const loops = twinkles.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + index * 120,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0.25,
            duration: 2000 + index * 120,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [twinkles]);

  return (
    <View style={styles.layer} pointerEvents="none">
      {STAR_LAYOUT.map((star, index) => (
        <Animated.Text
          key={`cosmic-star-${index}`}
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              fontSize: star.size,
              opacity: twinkles[index],
            },
          ]}
        >
          ✦
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    color: 'rgba(255, 248, 240, 0.92)',
    textShadowColor: 'rgba(255, 214, 140, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
