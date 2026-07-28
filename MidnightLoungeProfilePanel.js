/**
 * Me tab hub — compact identity summary, Crown Points rewards, Village Boutique.
 * Full profile editing lives on MidnightLoungeProfileEditPanel (deep page).
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MIDNIGHT } from './midnightLoungeTheme';
import VillageRewardsCard from './VillageRewardsCard.js';
import AdminPortalPanel from './AdminPortalPanel.js';
import MeProfileBackgroundSwitcher from './MeProfileBackgroundSwitcher.js';
import { isAdmin } from './adminAccess.js';
import { useVillageRewards } from './VillageRewardsContext';
import {
  getMeBackgroundById,
  getMeSurfaceInk,
  ME_PROFILE_CONTENT_MAX_WIDTH,
  ME_PROFILE_H_PAD,
} from './meProfileBackgrounds';
import { getAppIconById, getStickerById } from './villageCosmeticPerks';

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

const ESPRESSO = '#4A4038';
const ESPRESSO_MUTED = '#6B5E54';
const TERRACOTTA = '#8B4A35';

const STAGE_LABELS = {
  pregnant: 'Pregnant',
  postpartum: 'Parenting',
  hybrid: 'Both · Pregnancy + Parenting',
};

function VillageBoutiqueBanner({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.boutiqueBanner}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel="Open The Village Boutique shop"
    >
      <Text style={styles.boutiqueAccentTopLeft} pointerEvents="none">
        ✦ ❀
      </Text>
      <Text style={styles.boutiqueAccentBottomRight} pointerEvents="none">
        ❧ ✦
      </Text>

      <Text style={[styles.boutiqueBannerTitle, PLAYFUL]}>The Village Boutique 🧸</Text>
      <Text style={[styles.boutiqueBannerCopy, SANS]}>
        Explore cute matching merch, cozy loungewear, and curated essentials made for mamas like
        you.
      </Text>

      <View style={styles.boutiqueCtaBtn}>
        <Text style={[styles.boutiqueCtaText, SANS]}>Shop Collection ✨</Text>
      </View>
    </TouchableOpacity>
  );
}

function CustomTitleBadge({ title }) {
  const text = String(title || '').trim();
  if (!text) return null;
  return (
    <View style={styles.titleBadge}>
      <Text style={[styles.titleBadgeSparkle, styles.titleBadgeSparkleLeft]} pointerEvents="none">
        ✦
      </Text>
      <Text style={[styles.titleBadgeText, PLAYFUL]}>{text}</Text>
      <Text style={[styles.titleBadgeSparkle, styles.titleBadgeSparkleRight]} pointerEvents="none">
        ✦
      </Text>
    </View>
  );
}

function MidnightLoungeProfilePanel({
  mamaName,
  shortBio,
  profilePhotoUri,
  onOpenBoutique,
  onOpenProfileEdit,
  onDeleteAccount,
  activeMode = 'pregnant',
  adminUser = null,
  accountEmail = '',
  onAccountEmailChange,
  isVipLifetime = false,
  onToggleVipLifetime,
  onSendTestNewsletter,
  onSendTestWelcomeEmail,
  onGrantTestPoints,
  onResetTestPoints,
  onFireTestNotification,
  onOpenSanctuaryJournalTest,
  onPreviewPremiumWelcome,
  onOpenVillageConstellation,
  onOpenVillageBasket,
  onRefreshPwaCache,
  currentPoints = 0,
}) {
  const { rewards } = useVillageRewards();
  const showAdminPortal = isAdmin(adminUser);
  const displayName = String(mamaName || '').trim() || 'Mama';
  const bioLine = String(shortBio || '').trim();
  const stageLabel = STAGE_LABELS[activeMode] || STAGE_LABELS.pregnant;
  const background = useMemo(
    () => getMeBackgroundById(rewards.selectedMeBackgroundId),
    [rewards.selectedMeBackgroundId],
  );
  const ink = useMemo(() => getMeSurfaceInk(background), [background]);
  const activeSticker = rewards.hasCustomSticker
    ? getStickerById(rewards.selectedStickerId)
    : null;
  const activeAppIcon = rewards.hasExclusiveBadge
    ? getAppIconById(rewards.selectedAppIconId)
    : null;

  return (
    <View style={styles.root}>
      {!background.passThrough ? (
        <LinearGradient
          colors={background.colors}
          locations={background.locations}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentColumn}>
          <Text style={[styles.sectionEyebrow, { color: ink.muted }, SANS]}>
            YOUR LOUNGE IDENTITY
          </Text>
          <Text style={[styles.sectionTitle, { color: ink.primary }, SANS]}>Me</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryAvatarWrap}>
              {activeAppIcon ? (
                <LinearGradient
                  colors={activeAppIcon.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.summaryAppIcon}
                >
                  <Text style={styles.summaryAppIconEmoji}>{activeAppIcon.emoji}</Text>
                </LinearGradient>
              ) : null}
              {profilePhotoUri ? (
                <Image
                  source={{ uri: profilePhotoUri }}
                  style={styles.summaryAvatar}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={180}
                  accessibilityLabel="Your profile photo"
                />
              ) : (
                <View style={[styles.summaryAvatar, styles.summaryAvatarEmpty]}>
                  <Text style={styles.summaryAvatarInitial}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {activeSticker ? (
                <View style={styles.summaryStickerBadge}>
                  <Text style={styles.summaryStickerEmoji}>{activeSticker.emoji}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.summaryName, PLAYFUL]}>{displayName}</Text>
            <CustomTitleBadge title={rewards.customProfileTitle} />
            {activeAppIcon || activeSticker ? (
              <Text style={[styles.summaryCosmetics, SANS]}>
                {[
                  activeAppIcon ? `Icon · ${activeAppIcon.label}` : null,
                  activeSticker ? `Sticker · ${activeSticker.label}` : null,
                ]
                  .filter(Boolean)
                  .join('  ·  ')}
              </Text>
            ) : null}
            {bioLine ? (
              <Text style={[styles.summaryBio, SANS]} numberOfLines={3}>
                {bioLine}
              </Text>
            ) : (
              <Text style={[styles.summaryBioMuted, SANS]}>
                Add a short bio on your profile page.
              </Text>
            )}
            <Text style={[styles.summaryStage, SANS]}>{stageLabel}</Text>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={onOpenProfileEdit}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Customize profile"
            >
              <Text style={[styles.editProfileBtnText, SANS]}>Customize Profile</Text>
            </TouchableOpacity>
          </View>

          <MeProfileBackgroundSwitcher />

          <VillageRewardsCard />

          {showAdminPortal ? (
            <AdminPortalPanel
              accountEmail={accountEmail}
              onAccountEmailChange={onAccountEmailChange}
              isVipLifetime={isVipLifetime}
              onToggleVipLifetime={onToggleVipLifetime}
              onSendTestNewsletter={onSendTestNewsletter}
              onSendTestWelcomeEmail={onSendTestWelcomeEmail}
              onGrantTestPoints={onGrantTestPoints}
              onResetTestPoints={onResetTestPoints}
              onFireTestNotification={onFireTestNotification}
              onOpenSanctuaryJournalTest={onOpenSanctuaryJournalTest}
              onPreviewPremiumWelcome={onPreviewPremiumWelcome}
              onOpenVillageConstellation={onOpenVillageConstellation}
              onOpenVillageBasket={onOpenVillageBasket}
              onRefreshPwaCache={onRefreshPwaCache}
              currentPoints={currentPoints}
            />
          ) : null}

          <VillageBoutiqueBanner onPress={onOpenBoutique} />

          <TouchableOpacity
            style={styles.deleteAccountBtn}
            onPress={onDeleteAccount}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Text style={[styles.deleteAccountText, SANS]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default MidnightLoungeProfilePanel;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  scroll: { flex: 1, width: '100%' },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 120,
    paddingHorizontal: ME_PROFILE_H_PAD,
  },
  contentColumn: {
    width: '100%',
    maxWidth: ME_PROFILE_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  sectionEyebrow: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: MIDNIGHT.bgCard,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    marginBottom: 8,
    width: '100%',
  },
  summaryAvatarWrap: {
    marginBottom: 12,
    marginTop: 4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 112,
    height: 112,
    overflow: 'visible',
  },
  summaryAppIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    zIndex: 2,
  },
  summaryAppIconEmoji: {
    fontSize: 18,
  },
  summaryStickerBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(37, 34, 50, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  summaryStickerEmoji: {
    fontSize: 16,
  },
  summaryAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  summaryAvatarEmpty: {
    backgroundColor: MIDNIGHT.lavenderTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MIDNIGHT.lavender,
  },
  summaryAvatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: MIDNIGHT.lavender,
  },
  summaryName: {
    fontSize: 26,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
  },
  summaryCosmetics: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: MIDNIGHT.accentGold,
    textAlign: 'center',
  },
  titleBadge: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.65)',
    backgroundColor: 'rgba(196, 184, 232, 0.22)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(110deg, rgba(232,223,245,0.35) 0%, rgba(212,184,150,0.45) 45%, rgba(232,223,245,0.35) 100%)',
        backgroundSize: '220% 100%',
        animation: 'calmmamaTitleShimmer 2.8s ease-in-out infinite',
        boxShadow: '0 0 22px rgba(212, 184, 150, 0.35)',
      },
      default: {
        shadowColor: '#D4B896',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  titleBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5E6C8',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  titleBadgeSparkle: {
    position: 'absolute',
    top: 4,
    fontSize: 10,
    color: 'rgba(245, 230, 200, 0.85)',
  },
  titleBadgeSparkleLeft: {
    left: 8,
  },
  titleBadgeSparkleRight: {
    right: 8,
  },
  summaryBio: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: MIDNIGHT.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  summaryBioMuted: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryStage: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: MIDNIGHT.lavenderMuted,
    letterSpacing: 0.3,
  },
  editProfileBtn: {
    marginTop: 16,
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 200,
    width: '100%',
    maxWidth: 280,
  },
  editProfileBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A2540',
  },
  boutiqueBanner: {
    backgroundColor: 'rgba(251, 235, 230, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(235, 215, 210, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginTop: 18,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0 8px 22px rgba(74, 64, 56, 0.12)' },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
      },
    }),
  },
  boutiqueAccentTopLeft: {
    position: 'absolute',
    top: 12,
    left: 14,
    fontSize: 12,
    color: 'rgba(196, 188, 230, 0.65)',
    letterSpacing: 3,
  },
  boutiqueAccentBottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    fontSize: 12,
    color: 'rgba(196, 188, 230, 0.65)',
    letterSpacing: 3,
  },
  boutiqueBannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: ESPRESSO,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  boutiqueBannerCopy: {
    fontSize: 17,
    lineHeight: 25,
    color: ESPRESSO_MUTED,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  boutiqueCtaBtn: {
    alignSelf: 'center',
    backgroundColor: TERRACOTTA,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(74, 40, 28, 0.3)',
  },
  boutiqueCtaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  deleteAccountBtn: {
    marginTop: 32,
    marginBottom: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  deleteAccountText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#E07070',
    letterSpacing: 0.2,
  },
});
