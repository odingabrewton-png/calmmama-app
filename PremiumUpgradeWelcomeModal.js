import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const PLAYFUL = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const { height: SCREEN_H } = Dimensions.get('window');
const CONFETTI_PIECES = ['🌸', '👑', '✨', '💗', '🎉', '⭐', '💫', '🎀', '🫧'];

function ConfettiPiece({ emoji, index }) {
  const fall = useRef(new Animated.Value(-40)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const left = (index * 17 + 8) % 92;
  const delay = (index * 137) % 900;
  const duration = 2600 + ((index * 211) % 1200);

  useEffect(() => {
    const loopFall = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, {
          toValue: SCREEN_H,
          duration,
          easing: Easing.linear,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(fall, {
          toValue: -40,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    const loopSway = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 14,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(sway, {
          toValue: -14,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loopFall.start();
    loopSway.start();
    return () => {
      loopFall.stop();
      loopSway.stop();
    };
  }, [delay, duration, fall, sway]);

  return (
    <Animated.Text
      style={[
        styles.confettiPiece,
        { left: `${left}%`, transform: [{ translateY: fall }, { translateX: sway }] },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

function ConfettiLayer({ active }) {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {CONFETTI_PIECES.map((emoji, index) => (
        <ConfettiPiece key={`${emoji}-${index}`} emoji={emoji} index={index} />
      ))}
    </View>
  );
}

/**
 * Celebratory modal after Stripe success, VIP, or Founding Mother code redeem.
 */
export default function PremiumUpgradeWelcomeModal({
  visible,
  planLabel,
  onClose,
  variant = 'premium',
  title,
  body,
  bonusLabel,
  confetti = false,
}) {
  const isVip = variant === 'vip';
  const isFoundingMother = variant === 'founding_mother';
  const showConfetti = confetti || isVip || isFoundingMother;

  const header =
    title ||
    (isFoundingMother
      ? 'Welcome Founding Mother! Your lifetime access is active 🌸👑'
      : isVip
        ? 'VIP Access Activated! Welcome home, Queen 🌸👑'
        : 'Welcome to Premium Sanctuary Access! 🌸👑');
  const copy =
    body ||
    (isFoundingMother
      ? 'Stripe skipped — your Founding Mother lifetime pass is unlocked. Enjoy the full Village, forever.'
      : isVip
        ? 'Your lifetime VIP pass is unlocked on this device. Enjoy unlimited sanctuary tools, AI companion care, and full Village access — forever.'
        : 'Your account is now fully upgraded. Enjoy unlimited access to all features, AI companion responses, and special rewards!');
  const bonus =
    bonusLabel ||
    (isFoundingMother || isVip
      ? '+500 pts Welcome Bonus'
      : '+250 pts Premium Upgrade Bonus');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <ConfettiLayer active={visible && showConfetti} />
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation?.()}>
          <Text style={styles.emoji}>🌸👑</Text>
          <Text style={[styles.header, PLAYFUL]}>{header}</Text>
          <Text style={[styles.body, SANS]}>{copy}</Text>
          {planLabel ? (
            <Text style={[styles.planChip, SANS]}>{planLabel}</Text>
          ) : null}
          <Text style={[styles.bonus, SANS]}>{bonus}</Text>
          <TouchableOpacity style={styles.cta} onPress={onClose} activeOpacity={0.88}>
            <Text style={[styles.ctaText, SANS]}>Enter Your Sanctuary ✨</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(74, 59, 92, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    fontSize: 16,
    opacity: 0.9,
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 216, 0.5)',
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      web: { boxShadow: '0 18px 40px rgba(110, 80, 140, 0.22)' },
      default: {
        shadowColor: '#6E508C',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  emoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A3B5C',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: '#7D6B91',
    textAlign: 'center',
  },
  planChip: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#8A63BE',
    textTransform: 'uppercase',
  },
  bonus: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#5A4570',
  },
  cta: {
    marginTop: 20,
    backgroundColor: '#8A63BE',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
