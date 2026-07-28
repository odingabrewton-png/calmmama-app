import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  formatPregnancyPillLabel,
  formatToddlerPillLabel,
  HOME_TRACKS,
} from './mamaJourneyProfile';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

/**
 * Soft Home header pills for hybrid mamas — switches track without resetting data.
 */
export default function HomeModeToggle({
  homeTrack,
  onChangeTrack,
  weeksPregnant,
  babyAge,
}) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      <TouchableOpacity
        style={[styles.pill, homeTrack === HOME_TRACKS.PREGNANT && styles.pillActive]}
        onPress={() => onChangeTrack?.(HOME_TRACKS.PREGNANT)}
        activeOpacity={0.88}
        accessibilityRole="tab"
        accessibilityState={{ selected: homeTrack === HOME_TRACKS.PREGNANT }}
      >
        <Text
          style={[
            styles.pillText,
            SANS,
            homeTrack === HOME_TRACKS.PREGNANT && styles.pillTextActive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {formatPregnancyPillLabel(weeksPregnant)}
        </Text>
      </TouchableOpacity>

      <Text style={styles.divider}>|</Text>

      <TouchableOpacity
        style={[styles.pill, homeTrack === HOME_TRACKS.TODDLER && styles.pillActive]}
        onPress={() => onChangeTrack?.(HOME_TRACKS.TODDLER)}
        activeOpacity={0.88}
        accessibilityRole="tab"
        accessibilityState={{ selected: homeTrack === HOME_TRACKS.TODDLER }}
      >
        <Text
          style={[
            styles.pillText,
            SANS,
            homeTrack === HOME_TRACKS.TODDLER && styles.pillTextActive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {formatToddlerPillLabel(babyAge)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 8,
    width: '100%',
  },
  pill: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 252, 248, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(138, 99, 190, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: 'rgba(232, 223, 245, 0.98)',
    borderColor: 'rgba(138, 99, 190, 0.7)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7D6B91',
    textAlign: 'center',
  },
  pillTextActive: {
    color: '#4A3B5C',
  },
  divider: {
    color: 'rgba(125, 107, 145, 0.45)',
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'center',
    paddingHorizontal: 2,
  },
});
