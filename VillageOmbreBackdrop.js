/**
 * VillageOmbreBackdrop — sage / lavender / peach ombre by default.
 * Fairy Godmother perk swaps the same living wash to a custom 3-color cycle.
 *
 * Web: body `#calmmama-body-ombre` is the full-bleed layer.
 *   - Calm Mama: CSS gradient position shift (existing)
 *   - Fairy: three wash layers with opacity crossfade (same recipe as native)
 * Native / RN Web React layer: Reanimated opacity crossfade across three washes.
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

const WEB_TITLE_SHIMMER_ID = 'calmmama-title-shimmer-css';
const WEB_FAIRY_BODY_STYLE_ID = 'calmmama-fairy-body-ombre-css';
const WEB_FAIRY_TEXT_STYLE_ID = 'calmmama-fairy-text-contrast-css';
const FAIRY_WASH_CLASS = 'fairy-wash';

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

function clearFairyWashes(layer) {
  if (!layer) return;
  layer.querySelectorAll(`.${FAIRY_WASH_CLASS}`).forEach((node) => node.remove());
}

function ensureFairyWashes(layer, palette) {
  if (!layer) return;
  const specs = [
    { key: 'a', color: palette.a },
    { key: 'b', color: palette.b },
    { key: 'c', color: palette.c },
  ];
  specs.forEach(({ key, color }) => {
    let node = layer.querySelector(`.${FAIRY_WASH_CLASS}-${key}`);
    if (!node) {
      node = document.createElement('div');
      node.className = `${FAIRY_WASH_CLASS} ${FAIRY_WASH_CLASS}-${key}`;
      node.setAttribute('aria-hidden', 'true');
      layer.appendChild(node);
    }
    node.style.backgroundColor = color;
  });
}

/**
 * Fairy themes: opacity-crossfade washes on the body ombre (mirrors native).
 * Calm Mama default keeps the existing CSS gradient shift from mobileWebLayout.
 */
function syncWebBodyFairyOmbre(theme) {
  if (typeof document === 'undefined') return;

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
      clearFairyWashes(layer);
      layer.style.removeProperty('background');
      layer.style.removeProperty('background-color');
      layer.style.removeProperty('background-size');
      layer.style.removeProperty('animation');
    }
    return;
  }

  const palette = paletteFromTheme(theme);
  const ms = CALM_MAMA_PASTEL_CYCLE_MS;

  style.textContent = `
    @keyframes calmmamaFairyWashA {
      0%, 100% { opacity: 1; }
      28% { opacity: 0.15; }
      55% { opacity: 0.1; }
      82% { opacity: 0.2; }
    }
    @keyframes calmmamaFairyWashB {
      0%, 100% { opacity: 0.12; }
      28% { opacity: 0.85; }
      55% { opacity: 0.2; }
      82% { opacity: 0.15; }
    }
    @keyframes calmmamaFairyWashC {
      0%, 100% { opacity: 0.1; }
      28% { opacity: 0.15; }
      55% { opacity: 0.9; }
      82% { opacity: 0.2; }
    }
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"] {
      background: ${palette.a} !important;
      background-image: none !important;
      background-size: auto !important;
      animation: none !important;
    }
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"] .wash {
      display: none !important;
    }
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"] .${FAIRY_WASH_CLASS} {
      display: block !important;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      will-change: opacity;
    }
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"] .${FAIRY_WASH_CLASS}-a {
      animation: calmmamaFairyWashA ${ms}ms ease-in-out infinite;
    }
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"] .${FAIRY_WASH_CLASS}-b {
      animation: calmmamaFairyWashB ${ms}ms ease-in-out infinite;
    }
    #calmmama-body-ombre[data-fairy-theme="${theme.id}"] .${FAIRY_WASH_CLASS}-c {
      animation: calmmamaFairyWashC ${ms}ms ease-in-out infinite;
    }
  `;

  if (layer) {
    layer.setAttribute('data-fairy-theme', theme.id);
    layer.style.animation = 'none';
    layer.style.backgroundImage = 'none';
    layer.style.backgroundColor = palette.a;
    ensureFairyWashes(layer, palette);
  }
}

function OmbreWashLayers({ style, palette, themeId }) {
  const phase = useSharedValue(0);

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

function WebOmbreBackdrop({ style, palette, themeKey, theme }) {
  useEffect(() => {
    ensureTitleShimmerCss();
    syncWebBodyFairyOmbre(theme);
    return () => {
      if (!theme) syncWebBodyFairyOmbre(null);
    };
  }, [palette, themeKey, theme]);

  // Always render Reanimated washes so fairy + default animate inside the app shell too.
  return <OmbreWashLayers style={style} palette={palette} themeId={themeKey} />;
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

  return <OmbreWashLayers style={style} palette={palette} themeId={themeKey} />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
