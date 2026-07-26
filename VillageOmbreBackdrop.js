/**
 * VillageOmbreBackdrop — sage / lavender / peach ombre by default.
 * Fairy Godmother secret themes swap the wash palette when selected.
 *
 * Web: CSS gradient shift (reliable, full-bleed, no flat sage “border” bands).
 * Native: Reanimated wash layers.
 */
import React, { useEffect, useMemo } from 'react';
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
import { getSecretThemeById } from './secretFairyThemes';
import { useVillageRewards } from './VillageRewardsContext';

const WEB_OMBRE_STYLE_ID = 'calmmama-ombre-backdrop-css';
const WEB_TITLE_SHIMMER_ID = 'calmmama-title-shimmer-css';

function ensureTitleShimmerCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(WEB_TITLE_SHIMMER_ID)) return;
  const style = document.createElement('style');
  style.id = WEB_TITLE_SHIMMER_ID;
  style.textContent = `
    @keyframes calmmamaTitleShimmer {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(style);
}

function paletteFromTheme(theme) {
  if (!theme?.colors) {
    return {
      a: CALM_MAMA_PASTEL.sage,
      b: CALM_MAMA_PASTEL.lavender,
      c: CALM_MAMA_PASTEL.peach,
    };
  }
  return { a: theme.colors.a, b: theme.colors.b, c: theme.colors.c };
}

function ensureWebOmbreCss(palette, themeKey) {
  if (typeof document === 'undefined') return;
  const styleId = `${WEB_OMBRE_STYLE_ID}-${themeKey}`;
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = `
    .calmmama-ombre-backdrop[data-theme="${themeKey}"] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      background: linear-gradient(
        155deg,
        ${palette.a} 0%,
        ${palette.b} 35%,
        ${palette.c} 70%,
        ${palette.a} 100%
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
}

function WebOmbreBackdrop({ style, palette, themeKey }) {
  useEffect(() => {
    ensureTitleShimmerCss();
    ensureWebOmbreCss(palette, themeKey);
  }, [palette, themeKey]);

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      // RN Web: className paints the animated CSS gradient edge-to-edge
      className="calmmama-ombre-backdrop"
      dataSet={{ theme: themeKey }}
      // RN Web also supports data-* via native props on some versions
      {...{ 'data-theme': themeKey }}
      style={[styles.webRoot, style]}
    />
  );
}

function NativeOmbreBackdrop({ style, palette }) {
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
      <Animated.View
        style={[styles.fill, { backgroundColor: palette.a }, sageWash]}
        collapsable={false}
      />
      <Animated.View
        style={[styles.fill, { backgroundColor: palette.b }, lavenderWash]}
        collapsable={false}
      />
      <Animated.View
        style={[styles.fill, { backgroundColor: palette.c }, peachWash]}
        collapsable={false}
      />
    </View>
  );
}

export default function VillageOmbreBackdrop({ style }) {
  const { rewards } = useVillageRewards();
  const theme = useMemo(() => {
    if (!rewards?.hasFairyGodmotherPerk) return null;
    return getSecretThemeById(rewards.selectedSecretThemeId);
  }, [rewards?.hasFairyGodmotherPerk, rewards?.selectedSecretThemeId]);

  const palette = useMemo(() => paletteFromTheme(theme), [theme]);
  const themeKey = theme?.id || 'default';

  if (Platform.OS === 'web') {
    return <WebOmbreBackdrop style={style} palette={palette} themeKey={themeKey} />;
  }
  return <NativeOmbreBackdrop style={style} palette={palette} />;
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
});
