import React, { useMemo, useState } from 'react';
import { View, Animated, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { BrandLogoStack, LOGO_HEART_BLEED } from './brandLogoShine';
import { DESKTOP_BREAKPOINT, DESKTOP_PHONE } from './mobileWebLayout';

const LOGO_ASPECT = 323 / 1024;
const ONBOARDING_LOGO_RATIO = 0.42;
const ONBOARDING_LOGO_MAX = 148;

/** Content width inside the app surface — never the desktop marketing viewport. */
function getAppContentWidth() {
  const windowW = Dimensions.get('window').width;
  if (Platform.OS === 'web' && windowW > DESKTOP_BREAKPOINT) {
    return DESKTOP_PHONE.width;
  }
  return windowW;
}

function getOnboardingLogoSize() {
  return Math.min(getAppContentWidth() * ONBOARDING_LOGO_RATIO, ONBOARDING_LOGO_MAX);
}

const LOGO_FIT = {
  sanctuary: { widthScale: 0.68, maxHeight: 72, safeWidthRatio: 0.86 },
  badge: { widthScale: 0.88, maxHeight: 132 },
  onboarding: { viewportWidthRatio: ONBOARDING_LOGO_RATIO },
};

const FALLBACK_ASPECT = {
  sanctuary: LOGO_ASPECT,
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
    naturalW > 0 && naturalH > 0 ? naturalH / naturalW : FALLBACK_ASPECT[variant] || LOGO_ASPECT;

  if (variant === 'onboarding') {
    const size = getOnboardingLogoSize();
    return { width: size, height: size };
  }

  if (!boxWidth) {
    const w = 260 * (fit.widthScale ?? 0.88);
    return { width: w, height: w * aspect };
  }

  let width = boxWidth * (fit.widthScale ?? 0.88);
  if (fit.safeWidthRatio) {
    width = Math.min(width, boxWidth * fit.safeWidthRatio);
  }
  let height = width * aspect;

  if (fit.maxHeight && height > fit.maxHeight) {
    height = fit.maxHeight;
    width = height / aspect;
  }

  return { width, height };
}

/** Static logo header — onboarding only (no Reanimated shine). */
export default function VillageBrandHeader({
  logoUri,
  pulseAnim,
  variant = 'badge',
  sanctuaryMode = false,
  compact = false,
  profileMode = false,
  notchSafe = false,
}) {
  const [wrapWidth, setWrapWidth] = useState(0);
  const [natural] = useState({ w: 1024, h: 323 });

  const isOnboarding = variant === 'onboarding';
  const onboardingLogoSize = useMemo(() => getOnboardingLogoSize(), []);

  const { width: logoWidth, height: logoHeight } = useMemo(
    () => fitLogoToHeader(wrapWidth, natural.w, natural.h, variant),
    [wrapWidth, natural.w, natural.h, variant]
  );

  if (isOnboarding) {
    return (
      <Animated.View
        style={[
          styles.onboardingLogoWrap,
          pulseAnim ? { transform: [{ scale: pulseAnim }] } : null,
        ]}
        pointerEvents="none"
      >
        <Image
          source={{ uri: logoUri }}
          style={{
            width: onboardingLogoSize,
            height: onboardingLogoSize,
            alignSelf: 'center',
          }}
          resizeMode="contain"
          accessibilityLabel="Calm Mama Village"
        />
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        variant === 'onboarding' && styles.wrapOnboarding,
        sanctuaryMode && styles.wrapSanctuary,
        sanctuaryMode && compact && styles.wrapSanctuaryCompact,
        sanctuaryMode && profileMode && styles.wrapProfileHeader,
        sanctuaryMode && notchSafe && !compact && styles.wrapSanctuaryShellLocked,
        notchSafe && !sanctuaryMode && styles.wrapNotchSafe,
        notchSafe && sanctuaryMode && !compact && styles.wrapSanctuaryNotchSafe,
        notchSafe && sanctuaryMode && profileMode && styles.wrapProfileNotchSafe,
      ]}
      onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[styles.logoPulseWrap, { transform: pulseAnim ? [{ scale: pulseAnim }] : [] }]}
        pointerEvents="none"
      >
        <BrandLogoStack
          logoUri={logoUri}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
          enableShine={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 2,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    width: '100%',
    overflow: 'visible',
  },
  wrapOnboarding: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 0,
    minHeight: 0,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  onboardingLogoWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
    paddingBottom: 0,
    overflow: 'visible',
  },
  wrapNotchSafe: {
    paddingTop: 36,
    paddingBottom: 4,
  },
  wrapSanctuary: {
    paddingTop: 38,
    paddingBottom: 2,
    paddingHorizontal: 14,
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
    paddingRight: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
    }),
  },
});
