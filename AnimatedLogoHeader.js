import React, { useMemo, useState } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { BrandLogoStack, fitBrandLogo, LOGO_HEART_BLEED } from './brandLogoShine';

const LOGO_FIT = { widthScale: 0.68, maxHeight: 72, safeWidthRatio: 0.86 };
const LOGO_ASPECT = 323 / 1024;

const HEADER_SHELL = {
  notchTop: 44,
  logoMaxHeight: LOGO_FIT.maxHeight,
  heartBleedTop: LOGO_HEART_BLEED.top,
  bottomPad: 6,
};
HEADER_SHELL.minHeight =
  HEADER_SHELL.notchTop +
  HEADER_SHELL.logoMaxHeight +
  HEADER_SHELL.heartBleedTop +
  HEADER_SHELL.bottomPad;

function fitLogo(boxWidth) {
  if (!boxWidth) {
    const width = 260 * LOGO_FIT.widthScale;
    return { width, height: width * LOGO_ASPECT };
  }

  let width = boxWidth * LOGO_FIT.widthScale;
  width = Math.min(width, boxWidth * LOGO_FIT.safeWidthRatio);
  let height = width * LOGO_ASPECT;

  if (height > LOGO_FIT.maxHeight) {
    height = LOGO_FIT.maxHeight;
    width = height / LOGO_ASPECT;
  }

  return { width, height };
}

export default function AnimatedLogoHeader({ logoUri, pulseAnim, compact = false }) {
  const [wrapWidth, setWrapWidth] = useState(0);

  const { width: logoWidth, height: logoHeight } = useMemo(
    () => fitLogo(wrapWidth),
    [wrapWidth]
  );

  const fallback = useMemo(() => fitBrandLogo(wrapWidth, LOGO_FIT), [wrapWidth]);
  const renderW = logoWidth || fallback.width;
  const renderH = logoHeight || fallback.height;

  if (compact) {
    return (
      <View
        style={[styles.wrap, styles.wrapCompact]}
        onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.logoPulseWrap,
            pulseAnim ? { transform: [{ scale: pulseAnim }] } : null,
          ]}
          pointerEvents="none"
        >
          <BrandLogoStack
            logoUri={logoUri}
            logoWidth={renderW}
            logoHeight={renderH}
            enableShine
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        !compact && styles.wrapShellLocked,
      ]}
      onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      <View style={styles.notchCenterShell}>
        <Animated.View
          style={[
            styles.logoPulseWrap,
            pulseAnim ? { transform: [{ scale: pulseAnim }] } : null,
          ]}
          pointerEvents="none"
        >
          <BrandLogoStack
            logoUri={logoUri}
            logoWidth={renderW}
            logoHeight={renderH}
            enableShine
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
    paddingTop: 44,
    paddingBottom: 6,
    paddingHorizontal: 12,
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
  wrapCompact: {
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapShellLocked: {
    minHeight: HEADER_SHELL.minHeight,
  },
  logoPulseWrap: {
    overflow: 'visible',
    paddingRight: 10,
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
