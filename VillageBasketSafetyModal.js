import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

const ESPRESSO = '#4A4038';
const ESPRESSO_MUTED = '#5C4A3E';
const TERRACOTTA = '#8B4A35';

const SAFETY_BULLETS = [
  'Double-check expiration dates on all baby formula, food, or postpartum items.',
  'Ensure gear, cribs, and toys have not been recalled and are completely structurally sound.',
  'Calm Mama Village is a matching platform; families accept full responsibility for verifying item safety upon pickup.',
];

export default function VillageBasketSafetyModal({ visible, onClose, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={styles.card}>
          <Text style={styles.title}>Village Safety Check 🤍</Text>

          <View style={styles.bulletList}>
            {SAFETY_BULLETS.map((line) => (
              <View key={line} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.9}>
            <Text style={styles.confirmBtnText}>I Promise & Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(74, 64, 56, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(251, 235, 230, 0.42)',
    borderRadius: 28,
    paddingVertical: 26,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 14px 40px rgba(74, 64, 56, 0.18)',
      },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 22,
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: ESPRESSO,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
      default: {},
    }),
  },
  bulletList: {
    marginBottom: 22,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 18,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: ESPRESSO_MUTED,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: ESPRESSO,
    fontWeight: '500',
  },
  confirmBtn: {
    backgroundColor: TERRACOTTA,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 40, 28, 0.35)',
    ...Platform.select({
      web: { boxShadow: '0 6px 18px rgba(139, 74, 53, 0.32)' },
      default: {
        shadowColor: '#4A281C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
