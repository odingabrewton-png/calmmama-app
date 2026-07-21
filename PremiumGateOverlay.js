import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

/**
 * Frosted lock veil for premium-gated tiles and panels.
 */
export default function PremiumGateOverlay({ label = 'Premium', compact = false }) {
  return (
    <View style={[styles.veil, compact && styles.veilCompact]} pointerEvents="none">
      <View style={styles.lockBadge}>
        <Text style={styles.lockIcon}>🔒</Text>
        {!compact ? <Text style={styles.lockLabel}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 248, 0.62)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      },
      default: {},
    }),
  },
  veilCompact: {
    borderRadius: 12,
  },
  lockBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(196, 165, 116, 0.45)',
  },
  lockIcon: {
    fontSize: 18,
  },
  lockLabel: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#6A5A48',
    textTransform: 'uppercase',
  },
});
