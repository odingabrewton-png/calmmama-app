import React from 'react';
import { View, Image, ImageBackground, StyleSheet, Pressable } from 'react-native';
import MamasGuidanceTitleShine from './MamasGuidanceTitleShine';

const BANNER = require('./assets/mamas-guidance-banner.png');
const GALAXY_BADGE = require('./assets/mamas-guidance-galaxy-badge.png');

/**
 * Mama's Guidance — Sanctuary hub entry.
 * Full-width lake banner; galaxy-mama badge is the sole tap target (centered).
 */
export default function SanctuaryHubScreen({ onMamasGuidance }) {
  return (
    <View style={styles.root}>
      <ImageBackground source={BANNER} style={styles.banner} resizeMode="cover">
        <MamasGuidanceTitleShine />

        <Pressable
          style={styles.badgeHit}
          onPress={onMamasGuidance}
          accessibilityRole="button"
          accessibilityLabel="Enter Mama's Guidance venting journal"
        >
          <Image source={GALAXY_BADGE} style={styles.badge} resizeMode="contain" />
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  banner: {
    width: '100%',
    minHeight: 340,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  badgeHit: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  badge: {
    width: 140,
    height: 140,
    backgroundColor: 'transparent',
  },
});
