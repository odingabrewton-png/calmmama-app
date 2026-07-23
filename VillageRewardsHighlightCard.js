import React, { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getNextTierProgress,
  REWARD_TIERS,
} from './villageRewardsEngine';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const PLAYFUL = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

/**
 * Home highlight card — points preview + CTA into Me-tab rewards.
 * @param {'day'|'midnight'} [variant]
 */
export default function VillageRewardsHighlightCard({
  onExploreRewards,
  variant = 'day',
}) {
  const { rewards } = useVillageRewards();
  const isMidnight = variant === 'midnight';

  const progress = useMemo(() => getNextTierProgress(rewards.points), [rewards.points]);
  const points = Number(rewards.points || 0);

  const headline = progress.nextTier
    ? `👑 ${points.toLocaleString()} / ${progress.nextThreshold.toLocaleString()} pts to ${progress.nextTier.title.replace(/[🌸👑🏆]/g, '').trim()} Badge`
    : `👑 ${points.toLocaleString()} pts · Founding Legend unlocked`;

  return (
    <View style={[styles.card, isMidnight && styles.cardMidnight]}>
      <Text style={[styles.eyebrow, SANS, isMidnight && styles.eyebrowMidnight]}>
        VILLAGE REWARDS & MERCH DISCOUNTS
      </Text>
      <Text style={[styles.headline, PLAYFUL, isMidnight && styles.headlineMidnight]}>
        {headline}
      </Text>

      <View style={[styles.track, isMidnight && styles.trackMidnight]}>
        <View
          style={[
            styles.trackFill,
            { width: `${Math.round((progress.progress || 0) * 100)}%` },
          ]}
        />
      </View>

      <Text style={[styles.bullets, SANS, isMidnight && styles.bulletsMidnight]}>
        +10pt Journal  ·  +15pt Daily Puzzles  ·  +5pt Daily Checklist
      </Text>
      <Text style={[styles.matrix, SANS, isMidnight && styles.matrixMidnight]}>
        Support a mama +25 (max 5/day) · Poll +100 · Registry +250 · 5 journals/week +50 bonus
      </Text>

      <TouchableOpacity
        style={[styles.cta, isMidnight && styles.ctaMidnight]}
        onPress={onExploreRewards}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Explore Rewards and Merch Tiers"
      >
        <Text style={[styles.ctaText, SANS]}>Explore Rewards & Merch Tiers</Text>
      </TouchableOpacity>

      {!progress.nextTier ? (
        <Text style={[styles.tierHint, SANS]}>
          Tiers: {REWARD_TIERS.map((t) => t.points.toLocaleString()).join(' · ')}
        </Text>
      ) : (
        <Text style={[styles.tierHint, SANS, isMidnight && styles.tierHintMidnight]}>
          Next unlock at {progress.nextThreshold.toLocaleString()} pts
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 4,
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 250, 252, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 216, 0.42)',
    ...Platform.select({
      web: { boxShadow: '0 10px 26px rgba(110, 80, 140, 0.1)' },
      default: {
        shadowColor: '#6E508C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  cardMidnight: {
    backgroundColor: 'rgba(37, 34, 50, 0.94)',
    borderColor: 'rgba(212, 184, 150, 0.35)',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#8A63BE',
    textAlign: 'center',
    marginBottom: 8,
  },
  eyebrowMidnight: {
    color: '#D4B896',
  },
  headline: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A3B5C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  headlineMidnight: {
    color: '#F4F2FA',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(138, 99, 190, 0.14)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  trackMidnight: {
    backgroundColor: 'rgba(232, 229, 247, 0.12)',
  },
  trackFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#C4B8E8',
  },
  bullets: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7D6B91',
    textAlign: 'center',
    fontWeight: '600',
  },
  bulletsMidnight: {
    color: 'rgba(232, 229, 247, 0.72)',
  },
  matrix: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: '#A493B8',
    textAlign: 'center',
  },
  matrixMidnight: {
    color: 'rgba(232, 229, 247, 0.48)',
  },
  cta: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: '#8A63BE',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },
  ctaMidnight: {
    backgroundColor: 'rgba(212, 184, 150, 0.92)',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  tierHint: {
    marginTop: 10,
    fontSize: 11,
    color: '#A493B8',
    textAlign: 'center',
  },
  tierHintMidnight: {
    color: 'rgba(232, 229, 247, 0.48)',
  },
});
