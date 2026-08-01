import { useEffect, useRef, useCallback } from 'react';
import { Animated, Easing, Platform, LayoutAnimation, UIManager } from 'react-native';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';
import { logNativeCheckpoint, runNativeGuard } from './nativeRuntimeGuard';

export const VILLAGE_USE_NATIVE_DRIVER = true;

/** Peaceful opacity-only scene swap (native driver). No layout/transform. */
export const NATIVE_SCENE_FADE_MS = 280;

/**
 * Hardware-accelerated canvas fade:
 * 1) fade opacity → 0
 * 2) swap React state (single view)
 * 3) fade opacity → 1
 * Never touches layout dimensions — safe over a living ombre.
 */
export function runNativeOpacitySceneSwap(opacityAnim, onSwap, options = {}) {
  const duration = options.duration ?? NATIVE_SCENE_FADE_MS;
  const easing = options.easing ?? Easing.out(Easing.cubic);
  const useNativeDriver =
    options.useNativeDriver !== undefined
      ? options.useNativeDriver
      : VILLAGE_USE_NATIVE_DRIVER;

  if (!opacityAnim) {
    onSwap?.();
    return;
  }

  logNativeCheckpoint('runNativeOpacitySceneSwap:start');
  opacityAnim.stopAnimation();

  Animated.timing(opacityAnim, {
    toValue: 0,
    duration,
    easing,
    useNativeDriver,
  }).start(({ finished }) => {
    if (!finished) {
      logNativeCheckpoint('runNativeOpacitySceneSwap:aborted');
      return;
    }
    try {
      onSwap?.();
    } catch (err) {
      logNativeCheckpoint('runNativeOpacitySceneSwap:swapError', err);
    }
    opacityAnim.setValue(0);
    requestAnimationFrame(() => {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver,
      }).start((result) => {
        logNativeCheckpoint('runNativeOpacitySceneSwap:complete', result);
        options.onComplete?.(result);
      });
    });
  });
}

/** Snappy touch + tab-indicator spring (RN Animated API) */
export const VILLAGE_SNAPPY_SPRING = Object.freeze({
  friction: 7,
  tension: 40,
});

/** Same feel for react-native-reanimated withSpring */
export const VILLAGE_SNAPPY_REANIMATED = Object.freeze({
  damping: 7,
  stiffness: 40,
});

/** Shared bottom-tab cross-fade + scale pop */
export const VILLAGE_TAB_TRANSITION_MS = 420;

export const VILLAGE_TAB_TRANSITION_EASING = Easing.out(Easing.cubic);

export const VILLAGE_TAB_SPRING_IN = Object.freeze({
  friction: 8,
  tension: 52,
});

export function getVillageTabFlowStyle(flowAnim) {
  if (!flowAnim || typeof flowAnim.interpolate !== 'function') {
    return {};
  }
  return {
    opacity: flowAnim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.28, 0.92, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: flowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: flowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
}

/** Pregnant journey — gentler tab cross-fade (home ↔ kitchen included). */
export const PREGNANT_TAB_TRANSITION_MS = 520;

export function getPregnantVillageTabFlowStyle(flowAnim) {
  if (!flowAnim || typeof flowAnim.interpolate !== 'function') {
    return {};
  }
  return {
    opacity: flowAnim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0, 0.96, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: flowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
}

export function runPregnantVillageTabTransition(flowAnim, flowReadyRef, swapTab) {
  if (!flowReadyRef.current) {
    flowReadyRef.current = true;
    flowAnim.setValue(1);
    swapTab?.();
    return;
  }

  flowAnim.stopAnimation();
  Animated.timing(flowAnim, {
    toValue: 0,
    duration: Math.round(PREGNANT_TAB_TRANSITION_MS * 0.34),
    easing: Easing.inOut(Easing.cubic),
    useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
  }).start(({ finished }) => {
    if (!finished) return;
    flowAnim.setValue(0);
    swapTab?.();
    // Fade in immediately in the same turn — delayed rAF left a blank ombre frame.
    Animated.timing(flowAnim, {
      toValue: 1,
      duration: Math.round(PREGNANT_TAB_TRANSITION_MS * 0.56),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }).start();
  });
}

/** Gentle rise-in when onboarding completes — shell only, no stacked tab spring */
export const VILLAGE_APP_ENTER_MS = 1200;

export const VILLAGE_APP_ENTER_EASING = VILLAGE_IN_OUT_SIN;

export function animateAppEnterFromOnboarding(shellEnterAnim, flowAnim) {
  shellEnterAnim.stopAnimation();
  flowAnim.stopAnimation();
  flowAnim.setValue(1);
  shellEnterAnim.setValue(0);
  return Animated.timing(shellEnterAnim, {
    toValue: 1,
    duration: VILLAGE_APP_ENTER_MS,
    easing: VILLAGE_APP_ENTER_EASING,
    useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
  });
}

/** Fade-in only — used when journey/onboarding context changes without a tab press */
export function animateVillageTabFlow(flowAnim, flowReadyRef) {
  if (!flowReadyRef.current) {
    flowReadyRef.current = true;
    flowAnim.setValue(1);
    return;
  }
  flowAnim.stopAnimation();
  flowAnim.setValue(0.28);
  Animated.timing(flowAnim, {
    toValue: 1,
    duration: Math.round(VILLAGE_TAB_TRANSITION_MS * 0.72),
    easing: Easing.out(Easing.cubic),
    useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
  }).start();
}

/** Two-phase tab switch: ease out → swap → soft ease-in (no hard opacity flash) */
export function runVillageTabTransition(flowAnim, flowReadyRef, swapTab) {
  if (!flowReadyRef.current) {
    flowReadyRef.current = true;
    flowAnim.setValue(1);
    swapTab?.();
    return;
  }

  flowAnim.stopAnimation();
  Animated.timing(flowAnim, {
    toValue: 0,
    duration: Math.round(VILLAGE_TAB_TRANSITION_MS * 0.32),
    easing: Easing.inOut(Easing.cubic),
    useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
  }).start(({ finished }) => {
    if (!finished) return;
    swapTab?.();
    flowAnim.setValue(0);
    Animated.timing(flowAnim, {
      toValue: 1,
      duration: Math.round(VILLAGE_TAB_TRANSITION_MS * 0.55),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }).start();
  });
}

/** Midnight Lounge — expands from lotus while petals bloom */
export const VILLAGE_LOUNGE_BLOOM_MS = 480;

export const VILLAGE_LOUNGE_BLOOM_SPRING = Object.freeze({
  friction: 10,
  tension: 38,
});

export function animateMidnightLoungeOpen({ opacity, scale, translateY }) {
  opacity.stopAnimation();
  scale.stopAnimation();
  translateY.stopAnimation();
  opacity.setValue(0);
  scale.setValue(0.07);
  translateY.setValue(110);

  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: VILLAGE_LOUNGE_BLOOM_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
    Animated.spring(scale, {
      toValue: 1,
      ...VILLAGE_LOUNGE_BLOOM_SPRING,
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
    Animated.spring(translateY, {
      toValue: 0,
      ...VILLAGE_LOUNGE_BLOOM_SPRING,
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
  ]);
}

export function animateMidnightLoungeClose({ opacity, scale, translateY }) {
  opacity.stopAnimation();
  scale.stopAnimation();
  translateY.stopAnimation();

  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 0,
      duration: 340,
      easing: Easing.in(Easing.quad),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
    Animated.timing(scale, {
      toValue: 0.08,
      duration: 340,
      easing: Easing.in(Easing.quad),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
    Animated.timing(translateY, {
      toValue: 88,
      duration: 340,
      easing: Easing.in(Easing.quad),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
  ]);
}

export function animateBottomNavHide({ opacity, translateY }) {
  opacity.stopAnimation();
  translateY.stopAnimation();

  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 0,
      duration: VILLAGE_LOUNGE_BLOOM_MS * 0.55,
      easing: Easing.out(Easing.quad),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
    Animated.timing(translateY, {
      toValue: 36,
      duration: VILLAGE_LOUNGE_BLOOM_MS * 0.55,
      easing: Easing.out(Easing.quad),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
  ]);
}

export function animateBottomNavShow({ opacity, translateY }) {
  opacity.stopAnimation();
  translateY.stopAnimation();

  return Animated.parallel([
    Animated.spring(opacity, {
      toValue: 1,
      ...VILLAGE_SNAPPY_SPRING,
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
    Animated.spring(translateY, {
      toValue: 0,
      ...VILLAGE_SNAPPY_SPRING,
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }),
  ]);
}

/** Smooth layout reflow — opacity only (never bounds/scale — that warps text under the living ombre). */
export function configureVillageLayoutTransition() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  LayoutAnimation.configureNext({
    duration: 280,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

/** Kill pending LayoutAnimation before big scene swaps (onboarding ↔ tabs). */
export function suppressVillageLayoutAnimation() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  LayoutAnimation.configureNext({
    duration: 0,
    create: {
      type: LayoutAnimation.Types.linear,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.linear,
      property: LayoutAnimation.Properties.opacity,
    },
    delete: {
      type: LayoutAnimation.Types.linear,
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
      duration: 480,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }).start();
  }, [active, delay, progress]);

  return {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };
}

/** Postpartum Midnight Lounge — journal / baby oracle sub-view enter */
export const POSTPARTUM_LOUNGE_SUBVIEW_ENTER_MS = 640;
export const LOUNGE_SUBVIEW_ENTER_MS = 560;
export const LOUNGE_SUBVIEW_EXIT_MS = 380;
export const POSTPARTUM_LOUNGE_CHROME_FADE_MS = 280;

/** Soft bloom-in for pregnant mama lounge rituals — slower, no snap */
export const VILLAGE_GENTLE_REVEAL_MS = 980;

export function useVillageGentleReveal(active = true, delay = 0) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: VILLAGE_GENTLE_REVEAL_MS,
      delay,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }).start();
  }, [active, delay, progress]);

  return {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.22, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.985, 1],
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

  const animatedStyle =
    progress && typeof progress.interpolate === 'function'
      ? {
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
        }
      : {};

  return { animatedStyle, runTransition };
}
