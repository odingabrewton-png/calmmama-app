import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MIDNIGHT } from './midnightLoungeTheme';
import { SECRET_FAIRY_THEMES } from './secretFairyThemes';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

/**
 * Hidden pastel / starlight themes — Fairy Godmother (or Pro) unlock.
 */
export default function SecretThemeSwitcher({ unlocked = false }) {
  const { rewards, updateProfileFields } = useVillageRewards();

  if (!unlocked) return null;

  const selectedId = rewards.selectedSecretThemeId || null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, SANS]}>SECRET STARLIGHT THEMES</Text>
      <Text style={[styles.hint, SANS]}>
        Fairy Godmother unlock — choose a hidden pastel wash for the village backdrop.
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.swatch, !selectedId && styles.swatchActive]}
          onPress={() => updateProfileFields({ selectedSecretThemeId: null })}
          activeOpacity={0.88}
        >
          <View style={[styles.swatchDot, { backgroundColor: '#9CB89C' }]} />
          <Text style={[styles.swatchLabel, SANS]}>Default</Text>
        </TouchableOpacity>
        {SECRET_FAIRY_THEMES.map((theme) => {
          const active = selectedId === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[styles.swatch, active && styles.swatchActive]}
              onPress={() => updateProfileFields({ selectedSecretThemeId: theme.id })}
              activeOpacity={0.88}
              accessibilityLabel={theme.label}
            >
              <View
                style={[
                  styles.swatchDot,
                  {
                    backgroundColor: theme.colors.b,
                    borderColor: theme.colors.accent,
                  },
                ]}
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
    minWidth: 92,
  },
  swatchActive: {
    borderColor: 'rgba(212, 184, 150, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  swatchDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
  },
  swatchLabel: {
    fontSize: 11,
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
