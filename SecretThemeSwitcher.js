import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MIDNIGHT } from './midnightLoungeTheme';
import {
  DEFAULT_FAIRY_OMBRE_ID,
  FAIRY_VILLAGE_DEFAULT_ID,
  SECRET_FAIRY_THEMES,
} from './secretFairyThemes';
import { CALM_MAMA_PASTEL } from './calmMamaPastelPalette';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const WEB_SWATCH_ANIM_ID = 'calmmama-fairy-swatch-anim-css';

function ensureSwatchAnimCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(WEB_SWATCH_ANIM_ID)) return;
  const style = document.createElement('style');
  style.id = WEB_SWATCH_ANIM_ID;
  style.textContent = `
    @keyframes calmmamaFairySwatchShift {
      0% { background-position: 0% 40%; }
      50% { background-position: 100% 60%; }
      100% { background-position: 0% 40%; }
    }
    .calmmama-fairy-swatch-preview {
      background-size: 220% 220% !important;
      animation: calmmamaFairySwatchShift 4.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Fairy Godmother settings — pick animated ombre blends for the village backdrop.
 */
export default function SecretThemeSwitcher({ unlocked = false }) {
  const { rewards, updateProfileFields } = useVillageRewards();

  useEffect(() => {
    if (Platform.OS === 'web') ensureSwatchAnimCss();
  }, []);

  if (!unlocked) return null;

  const selectedId = rewards.selectedSecretThemeId || DEFAULT_FAIRY_OMBRE_ID;
  const picks = [
    {
      id: FAIRY_VILLAGE_DEFAULT_ID,
      label: 'Calm Mama Village',
      emoji: '🪷',
      colors: [CALM_MAMA_PASTEL.sage, CALM_MAMA_PASTEL.lavender, CALM_MAMA_PASTEL.peach],
    },
    ...SECRET_FAIRY_THEMES.map((theme) => ({
      id: theme.id,
      label: theme.label,
      emoji: theme.emoji,
      colors: [theme.colors.a, theme.colors.b, theme.colors.c],
    })),
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, SANS]}>FAIRY GODMOTHER OMBRE BLENDS</Text>
      <Text style={[styles.hint, SANS]}>
        Your 4,000-pt Fairy Godmother perk is active — choose an animated ombre wash for the whole
        village, or return to the classic Calm Mama blend.
      </Text>
      <View style={styles.row}>
        {picks.map((theme) => {
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
              {Platform.OS === 'web' ? (
                <View
                  className="calmmama-fairy-swatch-preview"
                  style={[
                    styles.swatchPreview,
                    {
                      backgroundImage: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]}, ${theme.colors[0]})`,
                      backgroundSize: '220% 220%',
                    },
                  ]}
                />
              ) : (
                <LinearGradient
                  colors={[...theme.colors, theme.colors[0]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.swatchPreview}
                />
              )}
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
    height: 34,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginBottom: 6,
  },
  swatchLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
