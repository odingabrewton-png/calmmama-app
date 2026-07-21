import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated, Easing } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const FADE_MS = 300;
const STAGGER_MS = 42;

function usePulseLoop(values, duration = 900) {
  useEffect(() => {
    const loops = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(value, {
            toValue: 0.28,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [duration, values]);
}

/** Staggered opacity reveal — layout paints first, content fades in without spinners. */
export function VillageStaggerFadeIn({
  children,
  delay = 0,
  staggerMs = STAGGER_MS,
  style,
  itemStyle,
}) {
  const items = React.Children.toArray(children).filter(Boolean);
  const opacitiesRef = useRef([]);
  if (opacitiesRef.current.length !== items.length) {
    opacitiesRef.current = items.map((_, index) => opacitiesRef.current[index] ?? new Animated.Value(0));
  }
  const opacities = opacitiesRef.current;

  useEffect(() => {
    opacities.forEach((opacity) => opacity.setValue(0));
    Animated.parallel(
      opacities.map((opacity, index) =>
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_MS,
          delay: delay + index * staggerMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        })
      )
    ).start();
  }, [delay, items.length, opacities, staggerMs]);

  return (
    <View style={style}>
      {items.map((child, index) => (
        <Animated.View key={index} style={[{ opacity: opacities[index] }, itemStyle]}>
          {child}
        </Animated.View>
      ))}
    </View>
  );
}

/** Lightweight typing indicator — three pulsing dots, no ActivityIndicator. */
export function VillageTypingDots({ color = '#8FA888', dotSize = 7, gap = 6 }) {
  const dots = useRef([new Animated.Value(0.35), new Animated.Value(0.35), new Animated.Value(0.35)]).current;
  usePulseLoop(dots, 720);

  return (
    <View style={styles.typingDotsRow} accessibilityLabel="Loading response">
      {dots.map((opacity, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
              marginHorizontal: gap / 2,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

function StreamBlock({ style }) {
  return <View style={[styles.streamBlock, style]} />;
}

function StreamShell({ backgroundColor, accentColor, blocks, header }) {
  const pulses = useRef(blocks.map(() => new Animated.Value(0.32))).current;
  usePulseLoop(pulses, 1100);

  return (
    <View style={[styles.streamShell, { backgroundColor }]}>
      {header}
      <View style={styles.streamBody}>
        {blocks.map((blockStyle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.streamBlock,
              blockStyle,
              { backgroundColor: accentColor, opacity: pulses[index] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/** Oracle lazy-load shell — pastel structure before JS bundle hydrates chat UI. */
export function VillageOracleStreamShell() {
  return (
    <StreamShell
      backgroundColor="#E8E4F3"
      accentColor="rgba(168, 187, 160, 0.45)"
      header={
        <View style={styles.oracleStreamHeader}>
          <StreamBlock style={styles.oracleStreamBack} />
          <View style={styles.oracleStreamTitleCol}>
            <StreamBlock style={styles.oracleStreamTitle} />
            <StreamBlock style={styles.oracleStreamSub} />
          </View>
        </View>
      }
      blocks={[
        styles.oracleStreamDisclaimer,
        styles.oracleStreamGridCell,
        styles.oracleStreamGridCell,
        styles.oracleStreamGridCell,
        styles.oracleStreamGridCell,
        styles.oracleStreamChat,
      ]}
    />
  );
}

/** Village Basket lazy-load shell — living-room tint + card/list placeholders. */
export function VillageBasketStreamShell() {
  return (
    <StreamShell
      backgroundColor="#E8EDE4"
      accentColor="rgba(186, 205, 176, 0.5)"
      blocks={[
        styles.basketStreamShareCard,
        styles.basketStreamSection,
        styles.basketStreamListing,
        styles.basketStreamListing,
      ]}
    />
  );
}

/** Generic sanctuary / boutique / lazy tab shell. */
export function VillageSanctuaryStreamShell({ backgroundColor = '#F3EDE6' }) {
  return (
    <StreamShell
      backgroundColor={backgroundColor}
      accentColor="rgba(200, 190, 178, 0.55)"
      blocks={[styles.sanctuaryStreamHero, styles.sanctuaryStreamLine, styles.sanctuaryStreamLineShort]}
    />
  );
}

const styles = StyleSheet.create({
  typingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {},
  streamShell: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  streamBody: {
    flex: 1,
    gap: 12,
  },
  streamBlock: {
    borderRadius: 18,
  },
  oracleStreamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  oracleStreamBack: {
    width: 56,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(184, 197, 187, 0.5)',
  },
  oracleStreamTitleCol: {
    flex: 1,
    gap: 8,
  },
  oracleStreamTitle: {
    height: 22,
    width: '72%',
    borderRadius: 8,
    backgroundColor: 'rgba(184, 197, 187, 0.5)',
  },
  oracleStreamSub: {
    height: 14,
    width: '48%',
    borderRadius: 6,
    backgroundColor: 'rgba(184, 197, 187, 0.38)',
  },
  oracleStreamDisclaimer: {
    height: 88,
    borderRadius: 24,
    marginBottom: 4,
  },
  oracleStreamGridCell: {
    width: '47%',
    height: 88,
    alignSelf: 'flex-start',
  },
  oracleStreamChat: {
    flex: 1,
    minHeight: 160,
    borderRadius: 20,
    marginTop: 8,
  },
  basketStreamShareCard: {
    height: 200,
    borderRadius: 28,
  },
  basketStreamSection: {
    height: 18,
    width: '42%',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  basketStreamListing: {
    height: 120,
    borderRadius: 20,
  },
  sanctuaryStreamHero: {
    height: 140,
    borderRadius: 22,
    marginBottom: 8,
  },
  sanctuaryStreamLine: {
    height: 16,
    width: '88%',
    borderRadius: 8,
  },
  sanctuaryStreamLineShort: {
    height: 16,
    width: '56%',
    borderRadius: 8,
  },
});
