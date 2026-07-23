import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MIDNIGHT } from './midnightLoungeTheme';
import {
  getNextTierProgress,
  getWeeklyJournalProgress,
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

function ClaimDiscountModal({ visible, badge, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!badge) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(badge.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      setCopied(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
          <Text style={styles.modalEmoji}>{badge.emoji}</Text>
          <Text style={[styles.modalTitle, PLAYFUL]}>{badge.title}</Text>
          <Text style={[styles.modalPerk, SANS]}>{badge.perk}</Text>
          <Text style={[styles.modalHint, SANS]}>
            Use this code in The Village Boutique checkout:
          </Text>
          <View style={styles.codePill}>
            <Text style={[styles.codeText, SANS]}>{badge.code}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.88}>
            <Text style={[styles.copyBtnText, SANS]}>
              {copied ? 'Copied ✓' : 'Copy Promo Code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
            <Text style={[styles.modalClose, SANS]}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function BadgeCard({ tier, unlocked, onClaim }) {
  return (
    <View style={[styles.badgeCard, unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
      <Text style={styles.badgeLock}>{unlocked ? tier.emoji : '🔒'}</Text>
      <Text style={[styles.badgeTitle, SANS, !unlocked && styles.badgeTitleLocked]}>
        {tier.title}
      </Text>
      <Text style={[styles.badgePts, SANS]}>{tier.points.toLocaleString()} pts</Text>
      <Text style={[styles.badgePerk, SANS, !unlocked && styles.badgePerkLocked]}>
        {tier.perk} Code
      </Text>
      {unlocked ? (
        <TouchableOpacity style={styles.claimBtn} onPress={() => onClaim(tier)} activeOpacity={0.88}>
          <Text style={[styles.claimBtnText, SANS]}>Claim Discount</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.lockedHint, SANS]}>Keep blooming to unlock</Text>
      )}
    </View>
  );
}

/**
 * Me-tab Village Rewards & Badges card.
 */
export default function VillageRewardsCard() {
  const { rewards } = useVillageRewards();
  const [claimBadge, setClaimBadge] = useState(null);

  const progress = useMemo(() => getNextTierProgress(rewards.points), [rewards.points]);
  const weeklyJournal = useMemo(
    () => getWeeklyJournalProgress(rewards),
    [rewards],
  );
  const unlockedSet = useMemo(
    () => new Set(rewards.unlockedBadges || []),
    [rewards.unlockedBadges],
  );

  const progressLabel = progress.nextTier
    ? `${Number(rewards.points || 0).toLocaleString()} / ${progress.nextThreshold.toLocaleString()} pts · ${progress.pointsToNext} to go`
    : `${Number(rewards.points || 0).toLocaleString()} pts · all tiers unlocked`;

  return (
    <View style={styles.card}>
      <Text style={[styles.eyebrow, SANS]}>VILLAGE REWARDS & BADGES</Text>
      <View style={styles.pointsRow}>
        <Text style={styles.crown}>👑</Text>
        <View style={styles.pointsCopy}>
          <Text style={[styles.pointsValue, PLAYFUL]}>
            {Number(rewards.points || 0).toLocaleString()} pts
          </Text>
          <Text style={[styles.streak, SANS]}>
            {rewards.dailyStreak > 0
              ? `${rewards.dailyStreak}-day journal streak ✨`
              : 'Earn points by showing up for yourself & the village'}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.round(progress.progress * 100)}%` }]} />
      </View>
      <Text style={[styles.progressLabel, SANS]}>{progressLabel}</Text>
      <Text style={[styles.tierMarks, SANS]}>500 · 1,000 · 3,000</Text>
      <Text style={[styles.weeklyHint, SANS]}>
        {weeklyJournal.bonusClaimed
          ? `Weekly Sanctuary Bonus claimed (${weeklyJournal.threshold}/${weeklyJournal.threshold}) 🌸`
          : `Soul Sanctuary this week: ${weeklyJournal.count}/${weeklyJournal.threshold} entries`}
      </Text>

      <View style={styles.badgeGrid}>
        {REWARD_TIERS.map((tier) => (
          <BadgeCard
            key={tier.id}
            tier={tier}
            unlocked={unlockedSet.has(tier.id) || rewards.points >= tier.points}
            onClaim={setClaimBadge}
          />
        ))}
      </View>

      <ClaimDiscountModal
        visible={Boolean(claimBadge)}
        badge={claimBadge}
        onClose={() => setClaimBadge(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 22,
    marginBottom: 8,
    padding: 18,
    borderRadius: 22,
    backgroundColor: MIDNIGHT.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.28)',
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(0,0,0,0.22)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
      },
    }),
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: MIDNIGHT.accentGold,
    textAlign: 'center',
    marginBottom: 12,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  crown: {
    fontSize: 34,
  },
  pointsCopy: {
    flex: 1,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
  },
  streak: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: MIDNIGHT.textSecondary,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 229, 247, 0.12)',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#C4B8E8',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(90deg, #C4B8E8 0%, #D4B896 100%)',
      },
      default: {},
    }),
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 13,
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
  },
  tierMarks: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 1,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
  },
  weeklyHint: {
    marginBottom: 16,
    fontSize: 12,
    lineHeight: 17,
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
  },
  badgeGrid: {
    gap: 10,
  },
  badgeCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: 'rgba(196, 184, 232, 0.22)',
    borderColor: 'rgba(212, 184, 150, 0.55)',
    ...Platform.select({
      web: { boxShadow: '0 0 18px rgba(196, 184, 232, 0.35)' },
      default: {},
    }),
  },
  badgeLocked: {
    backgroundColor: 'rgba(37, 34, 50, 0.65)',
    borderColor: MIDNIGHT.borderSoft,
    opacity: 0.62,
  },
  badgeLock: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: MIDNIGHT.textSecondary,
  },
  badgePts: {
    marginTop: 2,
    fontSize: 12,
    color: MIDNIGHT.accentGold,
    textAlign: 'center',
    fontWeight: '700',
  },
  badgePerk: {
    marginTop: 4,
    fontSize: 13,
    color: MIDNIGHT.textSecondary,
    textAlign: 'center',
  },
  badgePerkLocked: {
    color: MIDNIGHT.textMuted,
  },
  claimBtn: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(212, 184, 150, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  claimBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3F3428',
  },
  lockedHint: {
    marginTop: 8,
    fontSize: 12,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 28, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 216, 0.45)',
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3B5C',
    textAlign: 'center',
  },
  modalPerk: {
    marginTop: 6,
    fontSize: 15,
    color: '#7D6B91',
    textAlign: 'center',
  },
  modalHint: {
    marginTop: 16,
    fontSize: 13,
    color: '#A493B8',
    textAlign: 'center',
  },
  codePill: {
    marginTop: 12,
    backgroundColor: 'rgba(232, 223, 245, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#5A4570',
  },
  copyBtn: {
    marginTop: 16,
    backgroundColor: '#8A63BE',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  copyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalClose: {
    marginTop: 14,
    fontSize: 14,
    color: '#A493B8',
    fontWeight: '600',
  },
});
