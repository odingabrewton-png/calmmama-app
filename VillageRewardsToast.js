import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

/**
 * Soft pastel toast for Village Rewards point pops ("+50 pts! 🌸").
 */
export default function VillageRewardsToast({ toast }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!toast) return undefined;

    opacity.setValue(0);
    translateY.setValue(12);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const hide = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }, 1900);

    return () => clearTimeout(hide);
  }, [toast, opacity, translateY]);

  if (!toast) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      <Animated.View
        style={[
          styles.pill,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={[styles.text, SANS]}>{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.select({ ios: 64, default: 48 }),
    zIndex: 9999,
    elevation: 9999,
  },
  pill: {
    backgroundColor: 'rgba(252, 238, 245, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 216, 0.55)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    ...Platform.select({
      web: { boxShadow: '0 10px 28px rgba(110, 80, 140, 0.16)' },
      default: {
        shadowColor: '#6E508C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5A4570',
    letterSpacing: 0.2,
  },
});
