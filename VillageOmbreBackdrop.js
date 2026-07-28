/**
 * VillageOmbreBackdrop — sage / lavender / peach ombre by default.
 * Fairy Godmother perk swaps the same animated wash to a custom 3-color cycle.
 *
 * Web: CSS gradient + body `#calmmama-body-ombre` sync (full-bleed DOM).
 * Native: Reanimated opacity crossfade across three wash layers.
 *
 * Fairy themes use the exact same animation model as Calm Mama (no static overlay).
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
import { fairyThemeUsesWhiteText, getActiveFairyTheme } from './secretFairyThemes';
import { useVillageRewards } from './VillageRewardsContext';

const WEB_OMBRE_STYLE_ID = 'calmmama-ombre-backdrop-css';
const WEB_TITLE_SHIMMER_ID = 'calmmama-title-shimmer-css';
const WEB_FAIRY_BODY_STYLE_ID = 'calmmama-fairy-body-ombre-css';
const WEB_FAIRY_TEXT_STYLE_ID = 'calmmama-fairy-text-contrast-css';
const WEB_OMBRE_KEYFRAMES_ID = 'calmmama-ombre-keyframes-css';

function ensureOmbreKeyframesCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(WEB_OMBRE_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = WEB_OMBRE_KEYFRAMES_ID;
  style.textContent = `
    @keyframes calmmamaOmbreShift {
      0% { background-position: 0% 40%; }
      50% { background-position: 100% 60%; }
      100% { background-position: 0% 40%; }
    }
  `;
  document.head.appendChild(style);
}

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

/** Same living wash recipe Calm Mama uses — one cycling gradient, not a static overlay. */
function cyclingOmbreCss(palette, cycleMs = CALM_MAMA_PASTEL_CYCLE_MS) {
  return `
    background: linear-gradient(
      155deg,
      ${palette.a} 0%,
      ${palette.b} 35%,
      ${palette.c} 70%,
      ${palette.a} 100%
    );
    background-size: 300% 300%;
    animation: calmmamaOmbreShift ${cycleMs}ms ease-in-out infinite;
  `;
}

/** Soften village ink to white when Fairy Godmother wash needs light copy (web). */
function syncWebFairyTextContrast(theme) {
  if (typeof document === 'undefined') return;
  let style = document.getElementById(WEB_FAIRY_TEXT_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = WEB_FAIRY_TEXT_STYLE_ID;
    document.head.appendChild(style);
  }

  const root = document.documentElement;
  if (!fairyThemeUsesWhiteText(theme)) {
    style.textContent = '';
    root.removeAttribute('data-fairy-ui-text');
    return;
  }

  root.setAttribute('data-fairy-ui-text', 'white');
  style.textContent = `
    html[data-fairy-ui-text="white"] {
      --village-ink: #FFFFFF;
      --village-ink-soft: rgba(255, 255, 255, 0.82);
    }
    html[data-fairy-ui-text="white"] #root [class*="css-text"],
    html[data-fairy-ui-text="white"] #root [class^="r-"][class*="color"] {
      color: #FFFFFF !important;
    }
    html[data-fairy-ui-text="white"] #root [class*="css-text"] {
      text-shadow: 0 1px 2px rgba(20, 16, 28, 0.4);
    }
  `;
}

function restartCssAnimation(node) {
  if (!node) return;
  const prev = node.style.animation;
  node.style.animation = 'none';
  // Force reflow so the browser restarts the infinite ombre shift.
  void node.offsetWidth;
  node.style.animation = prev || '';
}

/** Sync Fairy Godmother wash onto the fixed body ombre DOM node (web). */
function syncWebBodyFairyOmbre(theme) {
  if (typeof document === 'undefined') return;
  ensureOmbreKeyframesCss();

  let style = document.getElementById(WEB_FAIRY_BODY_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = WEB_FAIRY_BODY_STYLE_ID;
    document.head.appendChild(style);
  }

  const layer = document.getElementById('calmmama-body-ombre');
  syncWebFairyTextContrast(theme);
  if (!theme) {
    style.textContent = '';
    if (layer) {
      layer.removeAttribute('data-fairy-theme');
      layer.style.removeProperty('background');
      layer.style.removeProperty('background-size');
      layer.style.removeProperty('animation');
      restartCssAnimation(layer);
    }
    return;
  }

  const palette = paletteFromTheme(theme);
  style.textContent = `
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"],
    .calmmama-ombre-backdrop[data-theme="${theme.id}"] {
      background: linear-gradient(
        155deg,
        ${palette.a} 0%,
        ${palette.b} 35%,
        ${palette.c} 70%,
        ${palette.a} 100%
      ) !important;
      background-size: 300% 300% !important;
      animation: calmmamaOmbreShift ${CALM_MAMA_PASTEL_CYCLE_MS}ms ease-in-out infinite !important;
    }
  `;

  if (layer) {
    layer.setAttribute('data-fairy-theme', theme.id);
    restartCssAnimation(layer);
  }
}

function ensureWebOmbreCss(palette, themeKey) {
  if (typeof document === 'undefined') return;
  ensureOmbreKeyframesCss();
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
      ${cyclingOmbreCss(palette)}
    }
  `;
}

function WebOmbreBackdrop({ style, palette, themeKey, theme }) {
  useEffect(() => {
    ensureTitleShimmerCss();
    ensureOmbreKeyframesCss();
    ensureWebOmbreCss(palette, themeKey);
    syncWebBodyFairyOmbre(theme);
    return () => {
      if (theme) {
        // Keep fairy wash until a new theme syncs; clear only when leaving fairy mode.
      } else {
        syncWebBodyFairyOmbre(null);
      }
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
  const themeId = theme?.id || 'default';

  useEffect(() => {
    let active = true;
    cancelAnimation(phase);
    phase.value = 0;

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
  }, [phase, themeId]);

  // Same opacity crossfade recipe as Calm Mama — fairy only swaps the three wash colors.
  const washA = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.28, 0.55, 0.82, 1], [1, 0.15, 0.1, 0.2, 1]),
  }));

  const washB = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.28, 0.55, 0.82, 1], [0.12, 0.85, 0.2, 0.15, 0.12]),
  }));

  const washC = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 0.28, 0.55, 0.82, 1], [0.1, 0.15, 0.9, 0.2, 0.1]),
  }));

  return (
    <View style={[styles.root, style]} pointerEvents="none" collapsable={false}>
      <Animated.View
        style={[styles.fill, { backgroundColor: palette.a }, washA]}
        collapsable={false}
      />
      <Animated.View
        style={[styles.fill, { backgroundColor: palette.b }, washB]}
        collapsable={false}
      />
      <Animated.View
        style={[styles.fill, { backgroundColor: palette.c }, washC]}
        collapsable={false}
      />
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
