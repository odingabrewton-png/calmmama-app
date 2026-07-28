/**
 * Me-tab background picker — free lounge washes (not Fairy Godmother perk).
 */

import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DEFAULT_ME_BACKGROUND_ID,
  getMeBackgroundById,
  getMeSurfaceInk,
  ME_PROFILE_BACKGROUNDS,
  resolveMeBackgroundId,
} from './meProfileBackgrounds';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

export default function MeProfileBackgroundSwitcher() {
  const { rewards, updateProfileFields } = useVillageRewards();
  const selectedId = resolveMeBackgroundId(
    rewards.selectedMeBackgroundId || DEFAULT_ME_BACKGROUND_ID,
  );
  const ink = useMemo(
    () => getMeSurfaceInk(getMeBackgroundById(selectedId)),
    [selectedId],
  );

  return (
    <View style={[styles.wrap, ink.onLight && styles.wrapOnLight]}>
      <Text style={[styles.eyebrow, { color: ink.gold }, SANS]}>ME PAGE BACKGROUNDS</Text>
      <Text style={[styles.hint, { color: ink.secondary }, SANS]}>
        Soft lounge washes just for your Me space — Calm Mama keeps the village ombre; the others are
        lighter pastel rooms.
      </Text>
      <View style={styles.row}>
        {ME_PROFILE_BACKGROUNDS.map((theme) => {
          const active = selectedId === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.swatch,
                active && styles.swatchActive,
                active && ink.onLight && styles.swatchActiveOnLight,
              ]}
              onPress={() => updateProfileFields({ selectedMeBackgroundId: theme.id })}
              activeOpacity={0.88}
              accessibilityLabel={theme.label}
              accessibilityState={{ selected: active }}
            >
              <LinearGradient
                colors={theme.colors}
                locations={theme.locations}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={[styles.swatchPreview, ink.onLight && styles.swatchPreviewOnLight]}
              />
              <Text style={[styles.swatchLabel, { color: ink.primary }, SANS]}>
                {theme.emoji} {theme.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 18,
    width: '100%',
    backgroundColor: 'rgba(196, 184, 232, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.3)',
  },
  wrapOnLight: {
    backgroundColor: 'rgba(255, 252, 248, 0.72)',
    borderColor: 'rgba(42, 37, 64, 0.14)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textAlign: 'center',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  swatch: {
    width: '47%',
    maxWidth: 180,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: 'rgba(212, 184, 150, 0.75)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  swatchActiveOnLight: {
    borderColor: 'rgba(107, 85, 136, 0.55)',
    backgroundColor: 'rgba(42, 37, 64, 0.06)',
  },
  swatchPreview: {
    width: '100%',
    height: 34,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    marginBottom: 6,
  },
  swatchPreviewOnLight: {
    borderColor: 'rgba(42, 37, 64, 0.18)',
  },
  swatchLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 14,
  },
});
