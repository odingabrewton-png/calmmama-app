import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MIDNIGHT } from './midnightLoungeTheme';
import {
  DEFAULT_FAIRY_OMBRE_ID,
  SECRET_FAIRY_THEMES,
} from './secretFairyThemes';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

/**
 * Fairy Godmother settings — pick one of 5 custom ombre blends for the village backdrop.
 */
export default function SecretThemeSwitcher({ unlocked = false }) {
  const { rewards, updateProfileFields } = useVillageRewards();

  if (!unlocked) return null;

  const selectedId = rewards.selectedSecretThemeId || DEFAULT_FAIRY_OMBRE_ID;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, SANS]}>FAIRY GODMOTHER OMBRE BLENDS</Text>
      <Text style={[styles.hint, SANS]}>
        Your 4,000-pt Fairy Godmother perk is active — choose a custom ombre wash for the whole
        village backdrop.
      </Text>
      <View style={styles.row}>
        {SECRET_FAIRY_THEMES.map((theme) => {
          const active = selectedId === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[styles.swatch, active && styles.swatchActive]}
              onPress={() => updateProfileFields({ selectedSecretThemeId: theme.id })}
              activeOpacity={0.88}
              accessibilityLabel={theme.label}
              accessibilityState={{ selected: active }}
            >
              <View style={styles.swatchPreview}>
                <View style={[styles.swatchBand, { backgroundColor: theme.colors.a }]} />
                <View style={[styles.swatchBand, { backgroundColor: theme.colors.b }]} />
                <View style={[styles.swatchBand, { backgroundColor: theme.colors.c }]} />
              </View>
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
    marginTop: 18,
    marginBottom: 4,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 184, 232, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.35)',
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
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 118,
    maxWidth: '48%',
    flexGrow: 1,
  },
  swatchActive: {
    borderColor: 'rgba(212, 184, 150, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  swatchPreview: {
    width: '100%',
    height: 28,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginBottom: 6,
  },
  swatchBand: {
    flex: 1,
  },
  swatchLabel: {
    fontSize: 11,
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
});
