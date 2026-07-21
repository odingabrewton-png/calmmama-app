import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

export const VILLAGE_HERO_ASSETS = {
  oracleMama: require('./assets/images/baby_oracle_bg.png'),
  villageLivingroom: require('./assets/images/village-livingroom.png'),
};

/**
 * Full-bleed village illustration — disk + memory cache, progressive fade-in.
 */
export default function VillageHeroImage({
  source,
  style,
  imageOpacity = 1,
  contentFit = 'cover',
  transition = 220,
}) {
  return (
    <Image
      source={source}
      style={[StyleSheet.absoluteFillObject, style, imageOpacity !== 1 && { opacity: imageOpacity }]}
      contentFit={contentFit}
      priority="high"
      cachePolicy="memory-disk"
      transition={transition}
      pointerEvents="none"
    />
  );
}
