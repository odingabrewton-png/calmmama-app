import React from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';

/** Brand ombre: sage #BAC6BC ↔ terracotta #E9A889 — smooth breathing wave */
export default function CalmMamaOmbreBackdrop({ phaseAnim }) {
  if (!phaseAnim?.interpolate) {
    return (
      <View style={styles.ombreRoot} pointerEvents="none">
        <View style={[styles.ombreFill, styles.ombreWebSage]} />
        <View style={[styles.ombreFill, styles.ombreWebPeach, { opacity: 0.35 }]} />
      </View>
    );
  }

  const sageWashOpacity = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.12, 1],
  });
  const peachWashOpacity = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.12, 1, 0.12],
  });

  const topColor = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#BAC6BC', '#D9C4B0', '#BAC6BC'],
  });
  const bottomColor = phaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#D4C8B8', '#E9A889', '#D4C8B8'],
  });

  if (Platform.OS === 'web') {
    return (
      <View style={styles.ombreRoot} pointerEvents="none">
        <Animated.View style={[styles.ombreFill, styles.ombreWebSage, { opacity: sageWashOpacity }]} />
        <Animated.View style={[styles.ombreFill, styles.ombreWebPeach, { opacity: peachWashOpacity }]} />
      </View>
    );
  }

  return (
    <View style={styles.ombreRoot} pointerEvents="none">
      <Animated.View style={[styles.ombreFill, { backgroundColor: topColor, opacity: sageWashOpacity }]} />
      <Animated.View style={[styles.ombreFill, { backgroundColor: bottomColor, opacity: peachWashOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ombreRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  ombreFill: {
    ...StyleSheet.absoluteFillObject,
  },
  ombreWebSage: Platform.select({
    web: {
      backgroundImage: 'linear-gradient(180deg, #BAC6BC 0%, #C8D4BC 45%, #D9C8B8 100%)',
    },
    default: {},
  }),
  ombreWebPeach: Platform.select({
    web: {
      backgroundImage: 'linear-gradient(180deg, #D4C8B8 0%, #E9A889 55%, #E9A889 100%)',
    },
    default: {},
  }),
});
