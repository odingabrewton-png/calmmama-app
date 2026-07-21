import React, { useMemo, useState } from 'react';
import { View, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLogoStack, fitBrandLogo, LOGO_HEART_BLEED } from './brandLogoShine';

const LOGO_FIT = {
  sanctuary: { widthScale: 0.68, maxHeight: 72, safeWidthRatio: 0.86 },
  badge: { widthScale: 0.88, maxHeight: 132 },
  onboarding: { widthScale: 0.98, maxHeight: 196 },
};

const FALLBACK_ASPECT = {
  sanctuary: 323 / 1024,
  badge: 1,
  onboarding: 1,
};

const SANCTUARY_HEADER_SHELL = {
  notchTop: 44,
  logoMaxHeight: LOGO_FIT.sanctuary.maxHeight,
  heartBleedTop: LOGO_HEART_BLEED.top,
  bottomPad: 2,
};
SANCTUARY_HEADER_SHELL.minHeight =
  SANCTUARY_HEADER_SHELL.notchTop +
  SANCTUARY_HEADER_SHELL.logoMaxHeight +
  SANCTUARY_HEADER_SHELL.heartBleedTop +
  SANCTUARY_HEADER_SHELL.bottomPad;

function fitLogoToHeader(boxWidth, naturalW, naturalH, variant) {
  const fit = LOGO_FIT[variant] || LOGO_FIT.badge;
  const aspect =
    naturalW > 0 && naturalH > 0 ? naturalH / naturalW : FALLBACK_ASPECT[variant] || 1;

  if (!boxWidth) {
    const w = 260 * fit.widthScale;
    return { width: w, height: w * aspect };
  }

  let width = boxWidth * fit.widthScale;
  if (fit.safeWidthRatio) {
    width = Math.min(width, boxWidth * fit.safeWidthRatio);
  }
  let height = width * aspect;

  if (height > fit.maxHeight) {
    height = fit.maxHeight;
    width = height / aspect;
  }

  return { width, height };
}

/** Unified animated brand header — logo letter-path shine only. Onboarding is static. */
export default function AppBrandHeader({
  logoUri,
  pulseAnim,
  variant = 'badge',
  sanctuaryMode = false,
  compact = false,
  profileMode = false,
  notchSafe = false,
  notchInsetExtra = 0,
  enableShine = true,
}) {
  const insets = useSafeAreaInsets();
  const mockNotchClearance = Platform.select({ web: 36, default: 0 });
  const resolvedTopInset = Math.max(insets.top, mockNotchClearance);
  const [natural] = useState({ w: 1024, h: 323 });
  const [wrapWidth, setWrapWidth] = useState(() => {
    const windowW = Dimensions.get('window').width;
    if (Platform.OS === 'web' && windowW > 768) return 390;
    return windowW > 0 ? Math.round(windowW) : 390;
  });

  const isOnboarding = variant === 'onboarding';
  const shineOn = enableShine && !isOnboarding;

  const { width: logoWidth, height: logoHeight } = useMemo(
    () => fitLogoToHeader(wrapWidth, natural.w, natural.h, variant),
    [wrapWidth, natural.w, natural.h, variant]
  );

  const fallbackLogo = useMemo(() => fitBrandLogo(wrapWidth, LOGO_FIT[variant] || LOGO_FIT.badge), [
    wrapWidth,
    variant,
  ]);

  const renderW = logoWidth || fallbackLogo.width;
  const renderH = logoHeight || fallbackLogo.height;
  const edgeToEdgeNotch =
    notchInsetExtra > 0 && sanctuaryMode && notchSafe && !compact;
  const pregnantHomeShell = edgeToEdgeNotch
    ? {
        paddingTop: 0,
        minHeight:
          resolvedTopInset +
          notchInsetExtra +
          SANCTUARY_HEADER_SHELL.logoMaxHeight +
          SANCTUARY_HEADER_SHELL.heartBleedTop +
          SANCTUARY_HEADER_SHELL.bottomPad,
      }
    : null;
  const pregnantHomeNotchShell = edgeToEdgeNotch
    ? {
        paddingTop: resolvedTopInset + notchInsetExtra,
        justifyContent: 'center',
        alignItems: 'center',
      }
    : null;

  return (
    <View
      style={[
        styles.wrap,
        isOnboarding && styles.wrapOnboarding,
        sanctuaryMode && styles.wrapSanctuary,
        sanctuaryMode && compact && styles.wrapSanctuaryCompact,
        sanctuaryMode && profileMode && styles.wrapProfileHeader,
        sanctuaryMode && notchSafe && !compact && !edgeToEdgeNotch && styles.wrapSanctuaryShellLocked,
        notchSafe && !sanctuaryMode && styles.wrapNotchSafe,
        notchSafe && sanctuaryMode && !compact && !edgeToEdgeNotch && styles.wrapSanctuaryNotchSafe,
        notchSafe && sanctuaryMode && profileMode && styles.wrapProfileNotchSafe,
        pregnantHomeShell,
      ]}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next > 0) {
          setWrapWidth((prev) => (Math.abs(prev - next) <= 1 ? prev : next));
        }
      }}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.notchCenterShell,
          notchSafe && !edgeToEdgeNotch && styles.notchCenterShellSafe,
          pregnantHomeNotchShell,
        ]}
      >
        <Animated.View
          style={[styles.logoPulseWrap, { transform: pulseAnim ? [{ scale: pulseAnim }] : [] }]}
          pointerEvents="none"
        >
          <BrandLogoStack
            logoUri={logoUri}
            logoWidth={renderW}
            logoHeight={renderH}
            enableShine={shineOn}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 2,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    width: '100%',
    overflow: 'visible',
  },
  notchCenterShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  notchCenterShellSafe: {
    paddingTop: 36,
  },
  wrapOnboarding: {
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 4,
  },
  wrapNotchSafe: {
    paddingTop: 36,
    paddingBottom: 4,
  },
  wrapSanctuary: {
    paddingTop: 38,
    paddingBottom: 2,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  wrapSanctuaryNotchSafe: {
    paddingTop: 44,
  },
  wrapSanctuaryCompact: {
    paddingTop: 2,
    paddingBottom: 0,
  },
  wrapProfileHeader: {
    paddingTop: 30,
    paddingBottom: 4,
  },
  wrapProfileNotchSafe: {
    paddingTop: 42,
  },
  wrapSanctuaryShellLocked: {
    minHeight: SANCTUARY_HEADER_SHELL.minHeight,
  },
  logoPulseWrap: {
    overflow: 'visible',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
});
