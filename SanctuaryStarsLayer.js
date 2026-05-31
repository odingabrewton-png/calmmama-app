import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Platform } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const STAR_LAYOUT = [
  { top: '6%', left: '8%', size: 14 },
  { top: '12%', left: '72%', size: 10 },
  { top: '4%', left: '44%', size: 12 },
  { top: '18%', left: '28%', size: 9 },
  { top: '22%', left: '86%', size: 11 },
  { top: '8%', left: '58%', size: 8 },
  { top: '28%', left: '12%', size: 10 },
  { top: '32%', left: '64%', size: 13 },
  { top: '14%', left: '92%', size: 9 },
  { top: '36%', left: '38%', size: 10 },
  { top: '42%', left: '78%', size: 12 },
  { top: '46%', left: '18%', size: 8 },
  { top: '52%', left: '52%', size: 11 },
  { top: '58%', left: '8%', size: 10 },
  { top: '62%', left: '88%', size: 9 },
  { top: '68%', left: '32%', size: 12 },
  { top: '72%', left: '68%', size: 10 },
  { top: '78%', left: '48%', size: 8 },
  { top: '84%', left: '22%', size: 11 },
  { top: '88%', left: '76%', size: 10 },
];

export default function SanctuaryStarsLayer() {
  const twinkles = useRef(STAR_LAYOUT.map(() => new Animated.Value(0.3 + Math.random() * 0.4))).current;

  useEffect(() => {
    const loops = twinkles.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1800 + index * 140,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 1800 + index * 140,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [twinkles]);

  return (
    <View style={styles.layer} pointerEvents="none">
      {STAR_LAYOUT.map((star, index) => (
        <Animated.Text
          key={`star-${index}`}
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
    color: 'rgba(255, 248, 240, 0.95)',
    textShadowColor: 'rgba(233, 168, 137, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
