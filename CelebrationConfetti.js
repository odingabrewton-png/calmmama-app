/**
 * Shared celebration confetti — smooth falling emoji rain for modals & overlays.
 * Pieces fade out before reset so loops never snap visibly.
 */

import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export const CELEBRATION_EMOJIS = [
  '🌸',
  '🌷',
  '🌼',
  '💐',
  '🪷',
  '🌺',
  '🏵️',
  '💮',
  '🌻',
  '🌿',
  '✨',
  '💫',
  '⭐',
  '🌟',
  '💗',
  '💕',
  '🎀',
  '👑',
  '🎉',
  '🫧',
  '☁️',
  '🦋',
  '🌱',
  '🍃',
  '✿',
  '❀',
  '✾',
  '💖',
];

const DENSITY_COUNTS = {
  soft: 18,
  normal: 28,
  rich: 36,
  dense: 48,
};

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPieces(count, emojis, seed = 42) {
  const rand = mulberry32(seed);
  const screenH = Dimensions.get('window').height || 720;
  const fallDistance = Math.max(640, screenH + 120);

  return Array.from({ length: count }, (_, index) => {
    const emoji = emojis[index % emojis.length];
    const left = 2 + rand() * 96;
    const size = 12 + Math.floor(rand() * 14);
    const delay = Math.floor(rand() * 2200);
    const duration = 3200 + Math.floor(rand() * 2800);
    const swayAmp = 10 + rand() * 22;
    const swayMs = 1100 + Math.floor(rand() * 900);
    const spin = (rand() > 0.5 ? 1 : -1) * (18 + rand() * 42);
    const opacityPeak = 0.72 + rand() * 0.28;
    const startY = -48 - rand() * 80;

    return {
      id: `c-${index}-${emoji}`,
      emoji,
      left,
      size,
      delay,
      duration,
      swayAmp,
      swayMs,
      spin,
      opacityPeak,
      startY,
      fallDistance,
    };
  });
}

function ConfettiPiece({ piece, active }) {
  const fall = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      fall.stopAnimation();
      sway.stopAnimation();
      spin.stopAnimation();
      fall.setValue(0);
      sway.setValue(0);
      spin.setValue(0);
      return undefined;
    }

    fall.setValue(0);
    sway.setValue(0);
    spin.setValue(0);

    const fallLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(piece.delay),
        Animated.timing(fall, {
          toValue: 1,
          duration: piece.duration,
          // Soft gravity — accelerates gently, never harsh linear.
          easing: Easing.bezier(0.22, 0.08, 0.28, 1),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(fall, {
          toValue: 0,
          duration: 1,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(180 + (piece.delay % 400)),
      ]),
    );

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: piece.swayMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: piece.swayMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: piece.duration * 0.95,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    );

    fallLoop.start();
    swayLoop.start();
    spinLoop.start();

    return () => {
      fallLoop.stop();
      swayLoop.stop();
      spinLoop.stop();
    };
  }, [active, fall, piece, spin, sway]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [piece.startY, piece.fallDistance],
  });

  // Fade in near the top, hold, fade out before the bottom so resets stay invisible.
  const opacity = fall.interpolate({
    inputRange: [0, 0.06, 0.14, 0.78, 0.92, 1],
    outputRange: [0, piece.opacityPeak * 0.55, piece.opacityPeak, piece.opacityPeak, 0.2, 0],
  });

  const translateX = sway.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-piece.swayAmp, 0, piece.swayAmp],
  });

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${piece.spin}deg`],
  });

  const scale = fall.interpolate({
    inputRange: [0, 0.12, 0.55, 1],
    outputRange: [0.55, 1.05, 1, 0.82],
  });

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.piece,
        {
          left: `${piece.left}%`,
          fontSize: piece.size,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }, { scale }],
        },
      ]}
    >
      {piece.emoji}
    </Animated.Text>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.active
 * @param {'soft'|'normal'|'rich'|'dense'} [props.density]
 * @param {string[]} [props.emojis]
 * @param {number} [props.seed]
 */
function CelebrationConfetti({
  active = false,
  density = 'rich',
  emojis = CELEBRATION_EMOJIS,
  seed = 42,
}) {
  const count = DENSITY_COUNTS[density] || DENSITY_COUNTS.rich;
  const pieces = useMemo(
    () => buildPieces(count, emojis?.length ? emojis : CELEBRATION_EMOJIS, seed),
    [count, emojis, seed],
  );

  if (!active) return null;

  return (
    <View style={styles.layer} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} active={active} />
      ))}
    </View>
  );
}

export default memo(CelebrationConfetti);

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    marginLeft: -8,
  },
});
