import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CelebrationConfetti from './CelebrationConfetti';

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
        <CelebrationConfetti active={visible && showConfetti} density="dense" seed={11} />
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
