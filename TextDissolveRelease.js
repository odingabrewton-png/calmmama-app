import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

export const TEXT_RELEASE_MS = 1200;

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function makeParticles(count) {
  return Array.from({ length: count }).map((_, i) => ({
    key: `p${i}`,
    x: (Math.random() - 0.5) * 120,
    size: 3 + Math.random() * 5,
    opacity: 0.55 + Math.random() * 0.35,
  }));
}

/**
 * Universal 1200ms “release” dissolve:
 * scale down + fade out + soft dispersion (ghost layers + shadow blur).
 *
 * `ref.play(text)` → resolves after dissolve completes.
 * `ref.playParticles()` → optional downward particle cloud for subscribed archive.
 */
export async function runTextReleaseFlow({
  releaseRef,
  text,
  isPro,
  isSubscribed,
  onArchive,
  onRequestUpgrade,
}) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return { released: false, archived: false };

  await releaseRef.current?.play(trimmed);

  if (!(isPro || isSubscribed)) {
    onRequestUpgrade?.();
    return { released: true, archived: false };
  }

  await releaseRef.current?.playParticles?.();
  await onArchive?.();
  return { released: true, archived: true };
}

const TextDissolveRelease = forwardRef(function TextDissolveRelease(
  { textStyle, tint = 'rgba(255,255,255,0.9)', containerStyle },
  ref
) {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const [particlesOn, setParticlesOn] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const particleY = useRef(new Animated.Value(0)).current;
  const particleFade = useRef(new Animated.Value(0)).current;

  const particles = useMemo(() => makeParticles(14), []);

  const reset = () => {
    progress.setValue(0);
    particleY.setValue(0);
    particleFade.setValue(0);
    setParticlesOn(false);
  };

  const play = (nextText) =>
    new Promise((resolve) => {
      setText(String(nextText || ''));
      setVisible(true);
      reset();

      Animated.timing(progress, {
        toValue: 1,
        duration: TEXT_RELEASE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(() => {
        setVisible(false);
        resolve();
      });
    });

  const playParticles = () =>
    new Promise((resolve) => {
      setParticlesOn(true);
      particleY.setValue(0);
      particleFade.setValue(0);

      Animated.parallel([
        Animated.timing(particleFade, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(particleY, {
          toValue: 1,
          duration: 780,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(() => {
        setParticlesOn(false);
        resolve();
      });
    });

  useImperativeHandle(ref, () => ({ play, playParticles }), [progress, particleFade, particleY]);

  if (!visible && !particlesOn) return null;

  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });
  const drift = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  const ghostA = {
    transform: [{ translateX: drift }, { translateY: Animated.multiply(drift, -1) }, { scale }],
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0] }),
  };
  const ghostB = {
    transform: [{ translateX: Animated.multiply(drift, -1) }, { translateY: drift }, { scale }],
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.36, 0] }),
  };

  const base = {
    transform: [{ translateY: drift }, { scale }],
    opacity,
    textShadowColor: 'rgba(255,255,255,0.42)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
    color: tint,
  };

  const particleTranslate = particleY.interpolate({ inputRange: [0, 1], outputRange: [0, 160] });

  return (
    <View pointerEvents="none" style={[styles.overlay, containerStyle]}>
      {visible ? (
        <View style={styles.center}>
          <Animated.Text style={[styles.textBase, textStyle, base]} numberOfLines={8}>
            {text}
          </Animated.Text>
          <Animated.Text style={[styles.textBase, textStyle, base, ghostA]} numberOfLines={8}>
            {text}
          </Animated.Text>
          <Animated.Text style={[styles.textBase, textStyle, base, ghostB]} numberOfLines={8}>
            {text}
          </Animated.Text>
        </View>
      ) : null}

      {particlesOn ? (
        <Animated.View
          style={[
            styles.particlesStage,
            { opacity: particleFade, transform: [{ translateY: particleTranslate }] },
          ]}
        >
          {particles.map((p) => (
            <View
              key={p.key}
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  left: '50%',
                  marginLeft: p.x,
                  opacity: p.opacity,
                },
              ]}
            />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  textBase: {
    position: 'absolute',
    textAlign: 'center',
  },
  particlesStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
});

export default TextDissolveRelease;
