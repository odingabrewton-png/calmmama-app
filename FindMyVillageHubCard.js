import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { retroSoft, retroAccent } from './nurseryRetroFonts';

const PROFILE_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

const SAFE_RETRO_ACCENT = retroAccent ?? {};
const SAFE_RETRO_SOFT = retroSoft ?? {};

/**
 * Find My Village entry card — self-contained (no shared animation hooks) for stable Metro boot.
 */
export default function FindMyVillageHubCard({ onPress, style }) {
  const handlePress = useCallback(() => {
    if (typeof onPress === 'function') {
      onPress();
    }
  }, [onPress]);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.findVillageCard}
        onPress={handlePress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Enter Find My Village community network"
      >
        <Text style={styles.findVillageEmoji}>🌍</Text>
        <Text style={[styles.findVillageTitle, SAFE_RETRO_ACCENT, PROFILE_SERIF]}>
          Find My Village Network
        </Text>
        <Text style={[styles.findVillageDesc, SAFE_RETRO_SOFT]}>
          Discover blurred-nearby mamas, mutual aid, and gentle community threads — all
          privacy-shielded.
        </Text>
        <Text style={styles.findVillageCta}>Enter the community village →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  findVillageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  findVillageEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  findVillageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A3860',
    textAlign: 'center',
    marginBottom: 6,
  },
  findVillageDesc: {
    fontSize: 11,
    color: '#5C6E63',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  findVillageCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B5588',
  },
});
