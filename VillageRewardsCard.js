import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useVillageRewards, NOTIFICATION_CATEGORIES } from './VillageRewardsContext';
import PremiumUpgradeWelcomeModal from './PremiumUpgradeWelcomeModal';

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

function perkLine(tier) {
  if (tier.type === 'discount' && tier.value != null) {
    return `${tier.value}% OFF · Code ${tier.code || '—'}`;
  }
  return tier.description || tier.perk;
}

function CodeRevealModal({ visible, codes = [], title, onClose }) {
  const [copied, setCopied] = useState(false);
  const list = Array.isArray(codes) ? codes.filter(Boolean) : [];

  if (!list.length) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(list.join(' · '));
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
          <Text style={styles.modalEmoji}>🛍️</Text>
          <Text style={[styles.modalTitle, PLAYFUL]}>{title || 'Your discount codes'}</Text>
          <Text style={[styles.modalHint, SANS]}>Use at The Village Boutique checkout:</Text>
          {list.map((code) => (
            <View key={code} style={styles.codePill}>
              <Text style={[styles.codeText, SANS]}>{code}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.88}>
            <Text style={[styles.copyBtnText, SANS]}>
              {copied ? 'Copied ✓' : list.length > 1 ? 'Copy Codes' : 'Copy Promo Code'}
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

function TierCard({ tier, redeemed, canAfford, redeeming, onRedeem, onViewCodes }) {
  const showCodes =
    redeemed &&
    (tier.type === 'discount' || (tier.type === 'matriarch' && Array.isArray(tier.coupons)));

  let action = null;
  if (redeemed) {
    action = showCodes ? (
      <TouchableOpacity style={styles.claimBtn} onPress={() => onViewCodes(tier)} activeOpacity={0.88}>
        <Text style={[styles.claimBtnText, SANS]}>View Codes</Text>
      </TouchableOpacity>
    ) : (
      <Text style={[styles.redeemedHint, SANS]}>Redeemed ✓</Text>
    );
  } else if (canAfford) {
    action = (
      <TouchableOpacity
        style={[styles.claimBtn, redeeming && styles.claimBtnDisabled]}
        onPress={() => onRedeem(tier)}
        activeOpacity={0.88}
        disabled={redeeming}
      >
        {redeeming ? (
          <ActivityIndicator color="#3F3428" />
        ) : (
          <Text style={[styles.claimBtnText, SANS]}>Redeem</Text>
        )}
      </TouchableOpacity>
    );
  } else {
    action = <Text style={[styles.lockedHint, SANS]}>Need {tier.points.toLocaleString()} pts</Text>;
  }

  return (
    <View style={[styles.badgeCard, redeemed || canAfford ? styles.badgeUnlocked : styles.badgeLocked]}>
      <Text style={styles.badgeLock}>{redeemed || canAfford ? tier.emoji : '🔒'}</Text>
      <Text style={[styles.badgeTitle, SANS, !(redeemed || canAfford) && styles.badgeTitleLocked]}>
        {tier.title}
      </Text>
      <Text style={[styles.badgePts, SANS]}>{tier.points.toLocaleString()} pts</Text>
      <Text style={[styles.badgePerk, SANS, !(redeemed || canAfford) && styles.badgePerkLocked]}>
        {perkLine(tier)}
      </Text>
      {action}
    </View>
  );
}

/**
 * Me-tab Village Rewards & Badges card — redeem Crown Points for tier perks.
 */
export default function VillageRewardsCard() {
  const { rewards, redeemTier, notify } = useVillageRewards();
  const [codeTier, setCodeTier] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);
  const [celebration, setCelebration] = useState(null);

  const progress = useMemo(() => getNextTierProgress(rewards), [rewards]);
  const weeklyJournal = useMemo(() => getWeeklyJournalProgress(rewards), [rewards]);
  const redeemedSet = useMemo(
    () => new Set(rewards.redeemedTiers || rewards.unlockedBadges || []),
    [rewards.redeemedTiers, rewards.unlockedBadges],
  );

  const progressLabel = progress.nextTier
    ? `${Number(rewards.points || 0).toLocaleString()} / ${progress.nextThreshold.toLocaleString()} pts · ${progress.pointsToNext} to go`
    : `${Number(rewards.points || 0).toLocaleString()} pts · all redeemable tiers claimed`;

  const handleRedeem = async (tier) => {
    if (!tier?.id || redeemingId) return;
    setRedeemingId(tier.id);
    try {
      const result = await redeemTier(tier.id);
      if (!result.ok) {
        const msg =
          result.reason === 'insufficient_points'
            ? `Need ${result.pointsNeeded} more pts to redeem`
            : result.reason === 'already_redeemed'
              ? 'Already redeemed'
              : 'Could not redeem this tier';
        notify({ message: msg, category: NOTIFICATION_CATEGORIES.rewards });
        return;
      }

      const codes =
        result.tier?.type === 'discount' && result.tier.code
          ? [result.tier.code]
          : result.tier?.type === 'matriarch'
            ? result.tier.coupons || result.rewards.discountCoupons || []
            : [];

      setCelebration({
        title: result.celebration?.title || `${tier.emoji} ${tier.title}`,
        body: result.celebration?.body || tier.description || tier.perk,
        variant: result.celebration?.variant || 'premium',
        bonusLabel: `−${tier.points.toLocaleString()} Crown Points`,
        codes,
        tier: result.tier,
      });
    } finally {
      setRedeemingId(null);
    }
  };

  const closeCelebration = () => {
    const codes = celebration?.codes || [];
    const tier = celebration?.tier;
    setCelebration(null);
    if (codes.length && tier) {
      setCodeTier(tier);
    }
  };

  const codesForModal = (() => {
    if (!codeTier) return [];
    if (codeTier.type === 'discount' && codeTier.code) return [codeTier.code];
    if (codeTier.type === 'matriarch') {
      return codeTier.coupons || rewards.discountCoupons || [];
    }
    return [];
  })();

  return (
    <View style={styles.card}>
      <Text style={[styles.eyebrow, SANS]}>CROWN POINTS REWARDS</Text>
      <View style={styles.pointsRow}>
        <Text style={styles.crown}>👑</Text>
        <View style={styles.pointsCopy}>
          <Text style={[styles.pointsValue, PLAYFUL]}>
            {Number(rewards.points || 0).toLocaleString()} pts
          </Text>
          <Text style={[styles.streak, SANS]}>
            {rewards.dailyStreak > 0
              ? `${rewards.dailyStreak}-day journal streak ✨`
              : 'Earn points, then redeem them for village perks'}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.round(progress.progress * 100)}%` }]} />
      </View>
      <Text style={[styles.progressLabel, SANS]}>{progressLabel}</Text>
      <Text style={[styles.tierMarks, SANS]}>500 · 1k · 2k · 3k · 4k · 5k</Text>
      <Text style={[styles.weeklyHint, SANS]}>
        {weeklyJournal.bonusClaimed
          ? `Weekly Sanctuary Bonus claimed (${weeklyJournal.threshold}/${weeklyJournal.threshold}) 🌸`
          : `Soul Sanctuary this week: ${weeklyJournal.count}/${weeklyJournal.threshold} entries`}
      </Text>
      <Text style={[styles.matrixSummary, SANS]}>
        Checklist +5/day · Puzzles +15/day · Journal +10 (+50 at 5/week) · Encourage +25
        (max 5/day) · Poll +100 · Registry +250
      </Text>

      <View style={styles.badgeGrid}>
        {REWARD_TIERS.map((tier) => {
          const redeemed = redeemedSet.has(tier.id);
          const canAfford = !redeemed && Number(rewards.points || 0) >= tier.points;
          return (
            <TierCard
              key={tier.id}
              tier={tier}
              redeemed={redeemed}
              canAfford={canAfford}
              redeeming={redeemingId === tier.id}
              onRedeem={handleRedeem}
              onViewCodes={setCodeTier}
            />
          );
        })}
      </View>

      <PremiumUpgradeWelcomeModal
        visible={Boolean(celebration)}
        title={celebration?.title}
        body={celebration?.body}
        bonusLabel={celebration?.bonusLabel}
        variant={celebration?.variant || 'premium'}
        confetti
        onClose={closeCelebration}
      />

      <CodeRevealModal
        visible={Boolean(codeTier) && codesForModal.length > 0}
        codes={codesForModal}
        title={codeTier?.title}
        onClose={() => setCodeTier(null)}
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
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 17,
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
  },
  matrixSummary: {
    marginBottom: 16,
    fontSize: 11,
    lineHeight: 16,
    color: MIDNIGHT.textMuted,
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
    minWidth: 110,
    alignItems: 'center',
  },
  claimBtnDisabled: {
    opacity: 0.7,
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
  redeemedHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: MIDNIGHT.accentGold,
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
