import React, { useMemo, useState } from 'react';
import { View, Image, Animated, StyleSheet, Platform } from 'react-native';

const LOGO_FIT = {
  sanctuary: { widthScale: 0.72, maxHeight: 72 },
  badge: { widthScale: 0.88, maxHeight: 132 },
  onboarding: { widthScale: 0.98, maxHeight: 196 },
};

const FALLBACK_ASPECT = {
  sanctuary: 115 / 257,
  badge: 1,
  onboarding: 1,
};

function fitLogoToHeader(boxWidth, naturalW, naturalH, variant) {
  const fit = LOGO_FIT[variant] || LOGO_FIT.badge;
  const aspect = naturalW > 0 && naturalH > 0 ? naturalH / naturalW : FALLBACK_ASPECT[variant] || 1;

  if (!boxWidth) {
    const w = 260 * fit.widthScale;
    return { width: w, height: w * aspect };
  }

  let width = boxWidth * fit.widthScale;
  let height = width * aspect;

  if (height > fit.maxHeight) {
    height = fit.maxHeight;
    width = height / aspect;
  }

  return { width, height };
}

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
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  const { width: logoWidth, height: logoHeight } = useMemo(
    () => fitLogoToHeader(wrapWidth, natural.w, natural.h, variant),
    [wrapWidth, natural.w, natural.h, variant]
  );

  const handleLogoLoad = (e) => {
    const source = e?.nativeEvent?.source;
    if (source?.width && source?.height) {
      setNatural({ w: source.width, h: source.height });
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        variant === 'onboarding' && styles.wrapOnboarding,
        sanctuaryMode && styles.wrapSanctuary,
        sanctuaryMode && compact && styles.wrapSanctuaryCompact,
        sanctuaryMode && profileMode && styles.wrapProfileHeader,
        notchSafe && !sanctuaryMode && styles.wrapNotchSafe,
        notchSafe && sanctuaryMode && !compact && styles.wrapSanctuaryNotchSafe,
        notchSafe && sanctuaryMode && profileMode && styles.wrapProfileNotchSafe,
      ]}
      onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.logoWrap,
          sanctuaryMode && styles.logoWrapSanctuary,
          { transform: pulseAnim ? [{ scale: pulseAnim }] : [] },
        ]}
        pointerEvents="none"
      >
        <Image
          source={{ uri: logoUri }}
          style={[
            styles.logo,
            { width: logoWidth, height: logoHeight, maxWidth: '100%' },
          ]}
          resizeMode="contain"
          onLoad={handleLogoLoad}
          accessibilityLabel="Calm Mama Village"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 2,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    width: '100%',
    borderWidth: 0,
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
  logoWrap: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    borderWidth: 0,
    overflow: 'visible',
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  logoWrapSanctuary: {
    backgroundColor: 'transparent',
  },
  logo: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
