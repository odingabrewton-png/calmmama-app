import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

export const NOTIFICATION_CATEGORIES = Object.freeze({
  rewards: 'rewards',
  checklist: 'checklist',
  kitchen: 'kitchen',
  sanctuary: 'sanctuary',
  bloom: 'bloom',
  nursery: 'nursery',
  community: 'community',
  membership: 'membership',
});

const CATEGORY_THEME = {
  rewards: {
    emoji: '🌸',
    border: 'rgba(196, 168, 216, 0.6)',
    bg: 'rgba(252, 238, 245, 0.97)',
    title: '#5A4570',
    body: '#7A668F',
  },
  checklist: {
    emoji: '✅',
    border: 'rgba(122, 168, 130, 0.55)',
    bg: 'rgba(236, 247, 238, 0.97)',
    title: '#3D5A42',
    body: '#5A7A60',
  },
  kitchen: {
    emoji: '🥗',
    border: 'rgba(214, 164, 110, 0.55)',
    bg: 'rgba(255, 246, 236, 0.97)',
    title: '#6A4A2E',
    body: '#8A6A4A',
  },
  sanctuary: {
    emoji: '🕯️',
    border: 'rgba(168, 148, 196, 0.55)',
    bg: 'rgba(246, 242, 252, 0.97)',
    title: '#4A3B5C',
    body: '#6E5A82',
  },
  bloom: {
    emoji: '🌿',
    border: 'rgba(140, 176, 148, 0.55)',
    bg: 'rgba(240, 248, 242, 0.97)',
    title: '#355540',
    body: '#5A7460',
  },
  nursery: {
    emoji: '🍼',
    border: 'rgba(160, 188, 214, 0.55)',
    bg: 'rgba(238, 246, 252, 0.97)',
    title: '#3A5068',
    body: '#5A7088',
  },
  community: {
    emoji: '💗',
    border: 'rgba(214, 148, 168, 0.55)',
    bg: 'rgba(252, 240, 244, 0.97)',
    title: '#6A3A4E',
    body: '#8A5A6E',
  },
  membership: {
    emoji: '👑',
    border: 'rgba(196, 165, 116, 0.6)',
    bg: 'rgba(255, 248, 236, 0.97)',
    title: '#5A4A2E',
    body: '#7A6A4A',
  },
};

/**
 * Soft category toast for Village moments (rewards, kitchen, checklist, etc.).
 */
export default function VillageNotificationToast({ toast }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (!toast) return undefined;

    opacity.setValue(0);
    translateY.setValue(14);
    scale.setValue(0.94);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const hide = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }, toast.durationMs || 2600);

    return () => clearTimeout(hide);
  }, [toast, opacity, translateY, scale]);

  if (!toast) return null;

  const theme = CATEGORY_THEME[toast.category] || CATEGORY_THEME.rewards;
  const emoji = toast.emoji || theme.emoji;
  const actionable = typeof toast.onPress === 'function';

  const card = (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          backgroundColor: theme.bg,
          borderColor: theme.border,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.copy}>
        {toast.title ? (
          <Text style={[styles.title, SANS, { color: theme.title }]}>{toast.title}</Text>
        ) : null}
        <Text style={[styles.message, SANS, { color: toast.title ? theme.body : theme.title }]}>
          {toast.message}
        </Text>
        {actionable ? (
          <Text style={[styles.actionHint, SANS, { color: theme.title }]}>
            Tap to open Weekly Bloom →
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );

  return (
    <View pointerEvents={actionable ? 'box-none' : 'none'} style={styles.host}>
      {actionable ? (
        <Pressable
          onPress={toast.onPress}
          accessibilityRole="button"
          accessibilityLabel={toast.title || 'Open notification'}
          style={styles.pressWrap}
        >
          {card}
        </Pressable>
      ) : (
        card
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.select({ ios: 58, default: 44 }),
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  pressWrap: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    maxWidth: 420,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(61, 68, 58, 0.14)', cursor: 'pointer' },
      default: {
        shadowColor: '#3D443A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  emoji: {
    fontSize: 22,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  message: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.15,
    lineHeight: 20,
  },
  actionHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
