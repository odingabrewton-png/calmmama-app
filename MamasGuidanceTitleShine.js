import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Reanimated.createAnimatedComponent(LinearGradient);
const SHINE_MS = 3600;
const TITLE_COPY = "Mama's Guidance ♡";

const TITLE_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

const LAYOUT = {
  banner: { fontSize: 34, maxWidth: 300 },
  header: { fontSize: 26, maxWidth: 280 },
  inline: { fontSize: 24, maxWidth: 260 },
};

function TitleMask({ fontSize, width, height }) {
  return (
    <View style={[styles.maskRoot, { width, height }]}>
      <Text
        style={[styles.titleMask, TITLE_SERIF, { fontSize, width, lineHeight: fontSize * 1.15 }]}
        numberOfLines={1}
        allowFontScaling={false}
        accessibilityElementsHidden
      >
        {TITLE_COPY}
      </Text>
    </View>
  );
}

function LetteringShine({ width, height }) {
  const shine = useSharedValue(0);

  useEffect(() => {
    shine.value = withRepeat(
      withTiming(1, { duration: SHINE_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [shine]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -width * 0.65 + shine.value * width * 2.1 }],
  }));

  return (
    <AnimatedLinearGradient
      colors={[
        'rgba(255,255,255,0)',
        'rgba(255,248,235,0.42)',
        'rgba(255,255,255,0.94)',
        'rgba(255,220,180,0.5)',
        'rgba(255,255,255,0)',
      ]}
      locations={[0, 0.35, 0.5, 0.65, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.shineBand, { width: width * 0.44, height }, shineStyle]}
    />
  );
}

/**
 * Letter-path masked gloss — viewport hugs measured glyph width.
 * @param {'banner'|'header'|'inline'} variant
 */
export default function MamasGuidanceTitleShine({ variant = 'banner' }) {
  const preset = LAYOUT[variant] || LAYOUT.header;
  const { width: screenW } = useWindowDimensions();
  const maxWidth = Math.min(preset.maxWidth, screenW - 48);
  const fontSize = preset.fontSize;

  const [box, setBox] = useState(null);

  const textStyle = [
    styles.baseTitle,
    TITLE_SERIF,
    { fontSize, maxWidth, lineHeight: fontSize * 1.15 },
  ];

  const handleMeasure = (e) => {
    const { width, height } = e.nativeEvent.layout;
    const w = Math.min(Math.ceil(width) + 2, maxWidth);
    const h = Math.ceil(height) + 2;
    setBox((prev) => {
      if (prev && prev.width === w && prev.height === h) return prev;
      return { width: w, height: h };
    });
  };

  if (Platform.OS === 'web') {
    return (
      <Text style={[styles.staticTitle, TITLE_SERIF, { fontSize, maxWidth }]} numberOfLines={1}>
        {TITLE_COPY}
      </Text>
    );
  }

  const isBanner = variant === 'banner';
  const boxW = box?.width ?? maxWidth;
  const boxH = box?.height ?? fontSize * 1.2;

  return (
    <View
      style={[
        isBanner ? styles.anchorBanner : styles.anchorFlow,
        { width: boxW, height: boxH, maxWidth },
      ]}
      pointerEvents="none"
    >
      {!box ? (
        <Text
          style={[textStyle, styles.measureText]}
          numberOfLines={1}
          allowFontScaling={false}
          onLayout={handleMeasure}
        >
          {TITLE_COPY}
        </Text>
      ) : (
        <>
          <Text
            style={[textStyle, { width: boxW, textAlign: 'center' }]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {TITLE_COPY}
          </Text>
          <MaskedView
            style={[StyleSheet.absoluteFillObject, styles.maskViewport]}
            maskElement={<TitleMask fontSize={fontSize} width={boxW} height={boxH} />}
          >
            <View style={[styles.shineTrack, { width: boxW * 2.2, height: boxH }]}>
              <LetteringShine width={boxW} height={boxH} />
            </View>
          </MaskedView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  anchorBanner: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  anchorFlow: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  measureText: {
    opacity: 0,
    textAlign: 'center',
    alignSelf: 'center',
  },
  baseTitle: {
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#8A5E52',
    textAlign: 'center',
    letterSpacing: 0,
    backgroundColor: 'transparent',
  },
  maskViewport: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  maskRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  titleMask: {
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0,
    backgroundColor: 'transparent',
  },
  shineTrack: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shineBand: {
    backgroundColor: 'transparent',
  },
  staticTitle: {
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#4A3E3D',
    textAlign: 'center',
    letterSpacing: 0,
  },
});
