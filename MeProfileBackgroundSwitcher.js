/**
 * Me-tab background picker — free lounge washes (not Fairy Godmother perk).
 */

import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MIDNIGHT } from './midnightLoungeTheme';
import {
  DEFAULT_ME_BACKGROUND_ID,
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

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, SANS]}>ME PAGE BACKGROUNDS</Text>
      <Text style={[styles.hint, SANS]}>
        Soft lounge washes just for your Me space — pick one that feels like home tonight.
      </Text>
      <View style={styles.row}>
        {ME_PROFILE_BACKGROUNDS.map((theme) => {
          const active = selectedId === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[styles.swatch, active && styles.swatchActive]}
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
                style={styles.swatchPreview}
              />
              <Text style={[styles.swatchLabel, SANS]}>
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
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: MIDNIGHT.accentGold,
    textAlign: 'center',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: MIDNIGHT.textSecondary,
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
  swatchPreview: {
    width: '100%',
    height: 34,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    marginBottom: 6,
  },
  swatchLabel: {
    fontSize: 11,
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
});
