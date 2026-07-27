/**
 * VillageOmbreBackdrop — sage / lavender / peach ombre by default.
 * Fairy Godmother perk explicitly applies one of 5 custom ombre overlays.
 *
 * Web: CSS gradient + body `#calmmama-body-ombre` sync (full-bleed DOM).
 * Native: Reanimated wash layers + translucent overlay blend.
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
import { getActiveFairyTheme } from './secretFairyThemes';
import { useVillageRewards } from './VillageRewardsContext';

const WEB_OMBRE_STYLE_ID = 'calmmama-ombre-backdrop-css';
const WEB_TITLE_SHIMMER_ID = 'calmmama-title-shimmer-css';
const WEB_FAIRY_BODY_STYLE_ID = 'calmmama-fairy-body-ombre-css';

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

function defaultPalette() {
  return {
    a: CALM_MAMA_PASTEL.sage,
    b: CALM_MAMA_PASTEL.lavender,
    c: CALM_MAMA_PASTEL.peach,
  };
}

function paletteFromTheme(theme) {
  if (!theme?.colors) return defaultPalette();
  return { a: theme.colors.a, b: theme.colors.b, c: theme.colors.c };
}

/** Sync Fairy Godmother wash onto the fixed body ombre DOM node (web). */
function syncWebBodyFairyOmbre(theme) {
  if (typeof document === 'undefined') return;

  let style = document.getElementById(WEB_FAIRY_BODY_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = WEB_FAIRY_BODY_STYLE_ID;
    document.head.appendChild(style);
  }

  const layer = document.getElementById('calmmama-body-ombre');
  if (!theme) {
    style.textContent = '';
    if (layer) {
      layer.removeAttribute('data-fairy-theme');
      layer.style.removeProperty('background');
      layer.style.removeProperty('background-size');
      layer.style.removeProperty('animation');
    }
    return;
  }

  const { a, b, c } = theme.colors;
  const overlay = theme.overlay || {};
  const from = overlay.from || a;
  const via = overlay.via || b;
  const to = overlay.to || c;

  style.textContent = `
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"],
    .calmmama-ombre-backdrop[data-theme="${theme.id}"] {
      background:
        linear-gradient(165deg, ${from} 0%, ${via} 48%, ${to} 100%),
        linear-gradient(155deg, ${a} 0%, ${b} 38%, ${c} 72%, ${a} 100%) !important;
      background-size: 280% 280%, 300% 300% !important;
      animation: calmmamaOmbreShift ${CALM_MAMA_PASTEL_CYCLE_MS}ms ease-in-out infinite !important;
    }
  `;

  if (layer) {
    layer.setAttribute('data-fairy-theme', theme.id);
  }
}

function ensureWebOmbreCss(palette, themeKey, theme) {
  if (typeof document === 'undefined') return;
  const styleId = `${WEB_OMBRE_STYLE_ID}-${themeKey}`;
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  const overlay = theme?.overlay;
  const layered = overlay
    ? `
      background:
        linear-gradient(165deg, ${overlay.from} 0%, ${overlay.via} 48%, ${overlay.to} 100%),
        linear-gradient(155deg, ${palette.a} 0%, ${palette.b} 35%, ${palette.c} 70%, ${palette.a} 100%);
      background-size: 280% 280%, 300% 300%;
    `
    : `
      background: linear-gradient(
        155deg,
        ${palette.a} 0%,
        ${palette.b} 35%,
        ${palette.c} 70%,
        ${palette.a} 100%
      );
      background-size: 300% 300%;
    `;

  style.textContent = `
    .calmmama-ombre-backdrop[data-theme="${themeKey}"] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      ${layered}
      animation: calmmamaOmbreShift ${CALM_MAMA_PASTEL_CYCLE_MS}ms ease-in-out infinite;
    }
    @keyframes calmmamaOmbreShift {
      0% { background-position: 0% 40%, 0% 40%; }
      50% { background-position: 100% 60%, 100% 60%; }
      100% { background-position: 0% 40%, 0% 40%; }
    }
  `;
}

function WebOmbreBackdrop({ style, palette, themeKey, theme }) {
  useEffect(() => {
    ensureTitleShimmerCss();
    ensureWebOmbreCss(palette, themeKey, theme);
    syncWebBodyFairyOmbre(theme);
    return () => {
      if (!theme) syncWebBodyFairyOmbre(null);
    };
  }, [palette, themeKey, theme]);

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      className="calmmama-ombre-backdrop"
      dataSet={{ theme: themeKey }}
      {...{ 'data-theme': themeKey }}
      style={[styles.webRoot, style]}
    />
  );
}

function NativeOmbreBackdrop({ style, palette, theme }) {
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

  const overlayPulse = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.35, 0.7, 1], [0.55, 0.72, 0.48, 0.55]),
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
      {theme?.overlay ? (
        <Animated.View
          pointerEvents="none"
          collapsable={false}
          style={[
            styles.fill,
            overlayPulse,
            {
              backgroundColor: 'transparent',
              // RN can't do multi-stop CSS gradients natively — layered translucent fills approximate the blend.
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.overlay.from, opacity: 0.85 },
            ]}
          />
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.overlay.via,
                opacity: 0.7,
                top: '28%',
              },
            ]}
          />
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.overlay.to,
                opacity: 0.75,
                top: '55%',
              },
            ]}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function VillageOmbreBackdrop({ style }) {
  const { rewards } = useVillageRewards();

  const fairyTheme = useMemo(
    () =>
      getActiveFairyTheme({
        hasFairyGodmotherPerk: Boolean(rewards?.hasFairyGodmotherPerk),
        selectedSecretThemeId: rewards?.selectedSecretThemeId,
      }),
    [rewards?.hasFairyGodmotherPerk, rewards?.selectedSecretThemeId],
  );

  const palette = useMemo(
    () => (fairyTheme ? paletteFromTheme(fairyTheme) : defaultPalette()),
    [fairyTheme],
  );
  const themeKey = fairyTheme?.id || 'default';

  if (Platform.OS === 'web') {
    return (
      <WebOmbreBackdrop
        style={style}
        palette={palette}
        themeKey={themeKey}
        theme={fairyTheme}
      />
    );
  }
  return <NativeOmbreBackdrop style={style} palette={palette} theme={fairyTheme} />;
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
