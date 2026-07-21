import React, { useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { resolveBundledAssetSource } from './resolveBundledAsset';

/** Extra viewport space so the rose-gold accent heart is never clipped. Symmetric so the logo centers. */
export const LOGO_HEART_BLEED = { top: 16, right: 14, bottom: 4, left: 14 };

export const LOGO_ASPECT = 323 / 1024;
export const LOGO_SHINE_MS = 3400;

/** Short Metro URL for CSS mask-image — base64 data URIs are too large for style masks. */
const BUNDLED_LOGO_MASK = require('./assets/calmmama-official-logo.png');

const AnimatedLinearGradient = Reanimated.createAnimatedComponent(LinearGradient);

export function fitBrandLogo(boxWidth, options = {}) {
  const { widthScale = 0.68, maxHeight = 72, safeWidthRatio = 0.86 } = options;

  if (!boxWidth) {
    const width = 260 * widthScale;
    return { width, height: width * LOGO_ASPECT };
  }

  let width = boxWidth * widthScale;
  if (safeWidthRatio) {
    width = Math.min(width, boxWidth * safeWidthRatio);
  }
  let height = width * LOGO_ASPECT;
  if (height > maxHeight) {
    height = maxHeight;
    width = height / LOGO_ASPECT;
  }
  return { width, height };
}

function resolveWebMaskUri(logoUri) {
  try {
    const bundled = resolveBundledAssetSource(BUNDLED_LOGO_MASK);
    if (bundled?.uri) return bundled.uri;
  } catch (_) {
    /* fall through */
  }
  if (typeof logoUri === 'string' && logoUri.length < 8000) {
    return logoUri;
  }
  return null;
}

function LogoMask({ logoUri, width, height }) {
  return (
    <View style={[styles.maskRoot, { width, height }]}>
      <Image
        source={{ uri: logoUri }}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="Calm Mama Village logo mask"
      />
    </View>
  );
}

function LogoShineSweep({ logoWidth, logoHeight }) {
  const shine = useSharedValue(0);

  useEffect(() => {
    shine.value = withRepeat(
      withTiming(1, { duration: LOGO_SHINE_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [shine]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -logoWidth * 0.85 + shine.value * logoWidth * 2.7 }],
  }));

  return (
    <AnimatedLinearGradient
      colors={[
        'rgba(255,255,255,0)',
        'rgba(255,248,235,0.35)',
        'rgba(255,255,255,0.92)',
        'rgba(255,230,200,0.55)',
        'rgba(255,255,255,0)',
      ]}
      locations={[0, 0.32, 0.5, 0.68, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[
        styles.shineBand,
        { width: logoWidth * 0.48, height: logoHeight },
        shineStyle,
      ]}
    />
  );
}

/**
 * Web: CSS alpha-mask keeps the gloss on letterforms only.
 * MaskedView.web is a stub (renders children unmasked), so we cannot use it here.
 */
function WebLogoShineOverlay({ logoUri, logoWidth, logoHeight }) {
  const shine = useSharedValue(0);
  const maskUri = useMemo(() => resolveWebMaskUri(logoUri), [logoUri]);

  useEffect(() => {
    shine.value = withRepeat(
      withTiming(1, { duration: LOGO_SHINE_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [shine]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -logoWidth * 0.7 + shine.value * logoWidth * 2.4 }],
  }));

  if (!maskUri) {
    return null;
  }

  const cssMask = `url("${maskUri}")`;
  const maskStyle = {
    width: logoWidth,
    height: logoHeight,
    overflow: 'hidden',
    maskImage: cssMask,
    WebkitMaskImage: cssMask,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.webMaskHost, maskStyle]}>
      <Reanimated.View
        style={[styles.webShineTrack, { width: logoWidth * 2.6, height: logoHeight }, bandStyle]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,248,235,0.4)',
            'rgba(255,255,255,0.95)',
            'rgba(255,230,200,0.5)',
            'transparent',
          ]}
          locations={[0, 0.32, 0.5, 0.68, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: logoWidth * 0.46, height: logoHeight }}
        />
      </Reanimated.View>
    </View>
  );
}

/** Logo image + letter-path masked gloss (UI-thread Reanimated). */
export function BrandLogoStack({ logoUri, logoWidth, logoHeight, enableShine = true }) {
  const bleed = LOGO_HEART_BLEED;
  const frameW = logoWidth + bleed.left + bleed.right;
  const frameH = logoHeight + bleed.top + bleed.bottom;

  return (
    <View style={[styles.frame, { width: frameW, height: frameH }]}>
      <View
        style={[
          styles.logoSlot,
          {
            position: 'absolute',
            top: bleed.top,
            left: bleed.left,
            width: logoWidth,
            height: logoHeight,
          },
        ]}
      >
        <Image
          source={{ uri: logoUri }}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
          accessibilityLabel="Calm Mama Village"
        />

        {enableShine ? (
          Platform.OS === 'web' ? (
            <WebLogoShineOverlay
              logoUri={logoUri}
              logoWidth={logoWidth}
              logoHeight={logoHeight}
            />
          ) : (
            <MaskedView
              style={[StyleSheet.absoluteFill, styles.maskViewport]}
              maskElement={<LogoMask logoUri={logoUri} width={logoWidth} height={logoHeight} />}
            >
              <View style={[styles.shineTrack, { width: logoWidth * 2.4, height: logoHeight }]}>
                <LogoShineSweep logoWidth={logoWidth} logoHeight={logoHeight} />
              </View>
            </MaskedView>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  logoSlot: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  maskRoot: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskViewport: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  shineTrack: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shineBand: {
    backgroundColor: 'transparent',
  },
  webMaskHost: {
    backgroundColor: 'transparent',
  },
  webShineTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
