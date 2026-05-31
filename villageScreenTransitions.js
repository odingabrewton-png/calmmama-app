import { useEffect, useRef, useCallback } from 'react';
import { Animated, Easing, Platform, LayoutAnimation, UIManager } from 'react-native';

export const VILLAGE_USE_NATIVE_DRIVER = Platform.OS !== 'web';

/** Smooth layout reflow — call right before state changes that show/hide panels */
export function configureVillageLayoutTransition() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  LayoutAnimation.configureNext({
    duration: 460,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: { type: LayoutAnimation.Types.spring, springDamping: 0.84 },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

/** Fade + slide reveal when a screen or panel mounts */
export function useVillageReveal(active = true, delay = 0) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 580,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }).start();
  }, [active, delay, progress]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [32, 0],
        }),
      },
    ],
  };
}

/** Press-triggered reveal — runs callback mid-animation for navigation handoff */
export function useVillagePressTransition() {
  const progress = useRef(new Animated.Value(1)).current;

  const runTransition = useCallback(
    (onMidTransition) => {
      configureVillageLayoutTransition();
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
      }).start();
      setTimeout(() => onMidTransition?.(), 120);
    },
    [progress]
  );

  const animatedStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  };

  return { animatedStyle, runTransition };
}
