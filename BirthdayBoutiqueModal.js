import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import {
  BIRTHDAY_MERCH_DISCOUNT_PERCENT,
  BIRTHDAY_MERCH_STORE_URL,
} from './birthdayBoutiqueConfig';
import CelebrationConfetti from './CelebrationConfetti';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';
import { VILLAGE_SNAPPY_SPRING } from './villageScreenTransitions';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function BirthdayBoutiqueModal({ visible, onClose }) {
  const cardScale = useRef(new Animated.Value(0.86)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const heroPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    cardScale.setValue(0.86);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        ...VILLAGE_SNAPPY_SPRING,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1.06,
          duration: 1200,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(heroPulse, {
          toValue: 1,
          duration: 1200,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [visible, cardOpacity, cardScale, heroPulse]);

  const handleShopMerch = () => {
    Linking.openURL(BIRTHDAY_MERCH_STORE_URL).catch(() => {});
    onClose?.();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <CelebrationConfetti active={visible} density="dense" seed={27} />
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

      <Animated.View
        style={[styles.modalCard, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
      >
        <Animated.View style={[styles.heroBadge, { transform: [{ scale: heroPulse }] }]}>
          <Text style={styles.heroEmoji}>🎂</Text>
        </Animated.View>

        <Text style={styles.title}>Happy Birthday, Sister! ✨</Text>
        <Text style={styles.subtitle}>
          To celebrate your incredible journey, we&apos;ve unlocked an exclusive gift just for you:
          Enjoy {BIRTHDAY_MERCH_DISCOUNT_PERCENT}% OFF all CalmMama Merch for the next 24 hours!
        </Text>

        <View style={styles.perkBanner}>
          <Text style={styles.perkBannerText}>
            Your code <Text style={styles.codeText}>BDAYMAMA20</Text> is ready at checkout
          </Text>
        </View>

        <TouchableOpacity style={styles.shopBtn} onPress={handleShopMerch} activeOpacity={0.88}>
          <Text style={styles.shopBtnText}>Shop CalmMama Merch 🛍️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.dismissBtnText}>Celebrate quietly for now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 11000,
    backgroundColor: 'rgba(36, 28, 48, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255, 252, 250, 0.98)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(232, 218, 244, 0.65)',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 22 : 18,
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      web: { boxShadow: '0 24px 60px rgba(80, 60, 100, 0.28)' },
      default: {
        shadowColor: '#503C64',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(232, 218, 244, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2A382E',
    textAlign: 'center',
    lineHeight: 28,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5C6E63',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  perkBanner: {
    marginTop: 16,
    backgroundColor: 'rgba(233, 168, 137, 0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.32)',
    width: '100%',
  },
  perkBannerText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: '#6B3D2E',
    textAlign: 'center',
  },
  codeText: {
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  shopBtn: {
    marginTop: 18,
    backgroundColor: '#5C7A68',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  dismissBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dismissBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B5588',
    fontStyle: 'italic',
  },
});
