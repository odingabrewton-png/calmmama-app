/**
 * Customize Profile — sticker pack + themed app icon pickers (unlocked via Crown Points).
 */

import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getAppIconById,
  getStickerById,
  VILLAGE_APP_ICONS,
  VILLAGE_STICKERS,
} from './villageCosmeticPerks';
import {
  getMeBackgroundById,
  getMeSurfaceInk,
} from './meProfileBackgrounds';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

function useMeInk() {
  const { rewards } = useVillageRewards();
  return useMemo(
    () => getMeSurfaceInk(getMeBackgroundById(rewards.selectedMeBackgroundId)),
    [rewards.selectedMeBackgroundId],
  );
}

export function VillageStickerPicker({ unlocked = false }) {
  const { rewards, updateProfileFields } = useVillageRewards();
  const ink = useMeInk();
  if (!unlocked) return null;

  const selected = getStickerById(rewards.selectedStickerId);

  return (
    <View style={[styles.wrap, ink.onLight && styles.wrapOnLight]}>
      <Text style={[styles.eyebrow, { color: ink.gold }, SANS]}>CUSTOM STICKER PACK</Text>
      <Text style={[styles.hint, { color: ink.secondary }, SANS]}>
        Your 300-pt sticker perk is active — pin one soft sticker to your Me profile.
      </Text>
      <View style={styles.row}>
        {VILLAGE_STICKERS.map((sticker) => {
          const active = selected.id === sticker.id;
          return (
            <TouchableOpacity
              key={sticker.id}
              style={[
                styles.stickerChip,
                ink.onLight && styles.chipOnLight,
                active && styles.chipActive,
                active && ink.onLight && styles.chipActiveOnLight,
              ]}
              onPress={() => updateProfileFields({ selectedStickerId: sticker.id })}
              activeOpacity={0.88}
              accessibilityLabel={sticker.label}
              accessibilityState={{ selected: active }}
            >
              <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
              <Text style={[styles.chipLabel, { color: ink.primary }, SANS]}>{sticker.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function VillageAppIconPicker({ unlocked = false }) {
  const { rewards, updateProfileFields } = useVillageRewards();
  const ink = useMeInk();
  if (!unlocked) return null;

  const selected = getAppIconById(rewards.selectedAppIconId);

  return (
    <View style={[styles.wrap, ink.onLight && styles.wrapOnLight]}>
      <Text style={[styles.eyebrow, { color: ink.gold }, SANS]}>THEMED APP ICON</Text>
      <Text style={[styles.hint, { color: ink.secondary }, SANS]}>
        Your 500-pt icon swap is unlocked — choose a home-screen vibe for your Me sanctuary.
      </Text>
      <View style={styles.previewRow}>
        <LinearGradient
          colors={selected.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconPreview}
        >
          <Text style={styles.iconPreviewEmoji}>{selected.emoji}</Text>
        </LinearGradient>
        <View style={styles.previewCopy}>
          <Text style={[styles.previewTitle, { color: ink.primary }, SANS]}>{selected.label}</Text>
          <Text style={[styles.previewSub, { color: ink.muted }, SANS]}>Active on your Me profile</Text>
        </View>
      </View>
      <View style={styles.row}>
        {VILLAGE_APP_ICONS.map((icon) => {
          const active = selected.id === icon.id;
          return (
            <TouchableOpacity
              key={icon.id}
              style={[
                styles.iconChip,
                ink.onLight && styles.chipOnLight,
                active && styles.chipActive,
                active && ink.onLight && styles.chipActiveOnLight,
              ]}
              onPress={() => updateProfileFields({ selectedAppIconId: icon.id })}
              activeOpacity={0.88}
              accessibilityLabel={icon.label}
              accessibilityState={{ selected: active }}
            >
              <LinearGradient
                colors={icon.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconSwatch}
              >
                <Text style={styles.iconSwatchEmoji}>{icon.emoji}</Text>
              </LinearGradient>
              <Text style={[styles.chipLabel, { color: ink.primary }, SANS]}>{icon.label}</Text>
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
  stickerChip: {
    width: '47%',
    maxWidth: 180,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(37, 34, 50, 0.35)',
  },
  iconChip: {
    width: '47%',
    maxWidth: 180,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(37, 34, 50, 0.35)',
  },
  chipOnLight: {
    backgroundColor: 'rgba(42, 37, 64, 0.06)',
  },
  chipActive: {
    borderColor: 'rgba(212, 184, 150, 0.75)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActiveOnLight: {
    borderColor: 'rgba(107, 85, 136, 0.55)',
    backgroundColor: 'rgba(42, 37, 64, 0.08)',
  },
  stickerEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  chipLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 14,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  iconPreviewEmoji: {
    fontSize: 30,
  },
  previewCopy: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  previewSub: {
    marginTop: 2,
    fontSize: 12,
  },
  iconSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  iconSwatchEmoji: {
    fontSize: 22,
  },
});
