/**
 * VillageOmbreBackdrop — sage / lavender / peach ombre ONLY.
 * Keep this file self-contained. Do not put screen layout, tabs, or navigation here.
 *
 * Web: CSS gradient shift (reliable, full-bleed, no flat sage “border” bands).
 * Native: Reanimated wash layers.
 */
import React, { useEffect } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { CALM_MAMA_PASTEL, CALM_MAMA_PASTEL_CYCLE_MS } from './calmMamaPastelPalette';
import { safeStartOmbrePhase } from './reanimatedSafe';

const WEB_OMBRE_STYLE_ID = 'calmmama-ombre-backdrop-css';

function ensureWebOmbreCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(WEB_OMBRE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = WEB_OMBRE_STYLE_ID;
  style.textContent = `
    .calmmama-ombre-backdrop {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      background: linear-gradient(
        155deg,
        ${CALM_MAMA_PASTEL.sage} 0%,
        ${CALM_MAMA_PASTEL.lavender} 35%,
        ${CALM_MAMA_PASTEL.peach} 70%,
        ${CALM_MAMA_PASTEL.sage} 100%
      );
      background-size: 300% 300%;
      animation: calmmamaOmbreShift ${CALM_MAMA_PASTEL_CYCLE_MS}ms ease-in-out infinite;
    }
    @keyframes calmmamaOmbreShift {
      0% { background-position: 0% 40%; }
      50% { background-position: 100% 60%; }
      100% { background-position: 0% 40%; }
    }
  `;
  document.head.appendChild(style);
}

function WebOmbreBackdrop({ style }) {
  useEffect(() => {
    ensureWebOmbreCss();
  }, []);

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      // RN Web: className paints the animated CSS gradient edge-to-edge
      className="calmmama-ombre-backdrop"
      style={[styles.webRoot, style]}
    />
  );
}

function NativeOmbreBackdrop({ style }) {
  const phase = useSharedValue(0);

  useEffect(() => {
    let active = true;

    const startLoop = () => {
      if (!active) return;
      safeStartOmbrePhase(
        phase,
        withRepeat(
          withTiming(1, {
            duration: CALM_MAMA_PASTEL_CYCLE_MS,
            easing: Easing.linear,
          }),
          -1,
          false,
        ),
        'VillageOmbreBackdrop',
      );
    };

    startLoop();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') startLoop();
      else cancelAnimation(phase);
    });

    return () => {
      active = false;
      cancelAnimation(phase);
      sub.remove();
    };
  }, [phase]);

  const sageWash = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.28, 0.55, 0.82, 1], [1, 0.15, 0.1, 0.2, 1]),
  }));

  const lavenderWash = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.28, 0.55, 0.82, 1], [0.12, 0.85, 0.2, 0.15, 0.12]),
  }));

  const peachWash = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.28, 0.55, 0.82, 1], [0.1, 0.15, 0.9, 0.2, 0.1]),
  }));

  return (
    <View style={[styles.root, style]} pointerEvents="none" collapsable={false}>
      <Animated.View style={[styles.fill, styles.sage, sageWash]} collapsable={false} />
      <Animated.View style={[styles.fill, styles.lavender, lavenderWash]} collapsable={false} />
      <Animated.View style={[styles.fill, styles.peach, peachWash]} collapsable={false} />
    </View>
  );
}

export default function VillageOmbreBackdrop({ style }) {
  if (Platform.OS === 'web') {
    return <WebOmbreBackdrop style={style} />;
  }
  return <NativeOmbreBackdrop style={style} />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  sage: {
    backgroundColor: CALM_MAMA_PASTEL.sage,
  },
  lavender: {
    backgroundColor: CALM_MAMA_PASTEL.lavender,
  },
  peach: {
    backgroundColor: CALM_MAMA_PASTEL.peach,
  },
});
