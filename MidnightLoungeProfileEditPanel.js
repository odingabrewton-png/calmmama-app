/**
 * Deep Me page — customize lounge identity (fields formerly above Save Changes).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MIDNIGHT } from './midnightLoungeTheme';
import MamaBirthdayField from './MamaBirthdayField.js';
import SecretThemeSwitcher from './SecretThemeSwitcher.js';
import MeProfileBackgroundSwitcher from './MeProfileBackgroundSwitcher.js';
import {
  VillageAppIconPicker,
  VillageStickerPicker,
} from './VillageCosmeticPickers.js';
import HybridLittleOnesSection from './HybridLittleOnesSection.js';
import { useVillageRewards } from './VillageRewardsContext';
import {
  getMeBackgroundById,
  getMeSurfaceInk,
  ME_PROFILE_CONTENT_MAX_WIDTH,
  ME_PROFILE_H_PAD,
} from './meProfileBackgrounds';

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

const STAGE_OPTIONS = [
  { id: 'pregnant', label: 'Pregnant', hint: 'Pregnancy Home' },
  { id: 'postpartum', label: 'Parenting', hint: 'Little one Home' },
  { id: 'hybrid', label: 'Both', hint: 'Toggle on Home' },
];

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

export default function MidnightLoungeProfileEditPanel({
  mamaName,
  onMamaNameChange,
  shortBio,
  onShortBioChange,
  mamaBirthday,
  onBirthdayChange,
  profilePhotoUri,
  onPickProfilePhoto,
  onSave,
  onClose,
  activeMode = 'pregnant',
  onSelectJourneyMode,
  accountEmail = '',
  onAccountEmailChange,
  littleOnes = [],
  onChildrenChange,
}) {
  const { rewards, updateProfileFields } = useVillageRewards();
  const [nameDraft, setNameDraft] = useState(mamaName || '');
  const [bioDraft, setBioDraft] = useState(shortBio || '');
  const [titleDraft, setTitleDraft] = useState(rewards.customProfileTitle || '');
  const [savedFlash, setSavedFlash] = useState(false);
  const canEditTitle = Boolean(rewards.hasFairyGodmotherPerk || rewards.hasMatriarchPerk);
  const secretThemesUnlocked = Boolean(rewards.hasFairyGodmotherPerk);
  const stickerUnlocked = Boolean(rewards.hasCustomSticker);
  const appIconUnlocked = Boolean(rewards.hasExclusiveBadge);
  const background = useMemo(
    () => getMeBackgroundById(rewards.selectedMeBackgroundId),
    [rewards.selectedMeBackgroundId],
  );
  const ink = useMemo(() => getMeSurfaceInk(background), [background]);
  /** Calm Mama pass-through → original midnight lounge boxes; pastel Me washes → soft hybrid cards. */
  const cardMode = background.passThrough
    ? 'midnight'
    : background.light
      ? 'hybridLight'
      : 'hybrid';
  const lightCards = cardMode === 'hybridLight';
  const midnightCards = cardMode === 'midnight';

  useEffect(() => {
    setNameDraft(mamaName || '');
  }, [mamaName]);

  useEffect(() => {
    setBioDraft(shortBio || '');
  }, [shortBio]);

  useEffect(() => {
    setTitleDraft(rewards.customProfileTitle || '');
  }, [rewards.customProfileTitle]);

  const handleSave = () => {
    onMamaNameChange?.(nameDraft.trim() || 'Mama');
    onShortBioChange?.(bioDraft.trim());
    if (canEditTitle) {
      updateProfileFields({ customProfileTitle: titleDraft.trim().slice(0, 48) });
    }
    onSave?.();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

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
          <Text style={[styles.sectionTitle, { color: ink.primary }, SANS]}>
            Customize Profile
          </Text>

          <TouchableOpacity
            style={[styles.avatarDashed, ink.onLight && styles.avatarDashedOnLight]}
            onPress={onPickProfilePhoto}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
          >
            <View style={[styles.avatarInner, ink.onLight && styles.avatarInnerOnLight]}>
              {profilePhotoUri ? (
                <Image
                  source={{ uri: profilePhotoUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={180}
                  accessibilityLabel="Your profile photo"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={[styles.avatarPlus, { color: ink.accent }]}>+</Text>
                  <Text style={[styles.avatarHint, { color: ink.muted }, SANS]}>Add Photo</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.fieldCard,
              midnightCards && styles.fieldCardMidnight,
              lightCards && styles.fieldCardOnLight,
            ]}
          >
            <Text
              style={[
                styles.fieldCardLabel,
                { color: lightCards ? '#3D5246' : MIDNIGHT.textPrimary },
                SANS,
              ]}
            >
              Display Name
            </Text>
            <TextInput
              style={[
                styles.fieldCardInput,
                midnightCards && styles.fieldCardInputMidnight,
                lightCards && styles.fieldCardInputOnLight,
                SANS,
              ]}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="How should the village greet you?"
              placeholderTextColor={
                lightCards ? '#9AA89A' : midnightCards ? MIDNIGHT.textMuted : 'rgba(232,229,247,0.45)'
              }
            />
          </View>
          <CustomTitleBadge title={rewards.customProfileTitle || titleDraft} />

          {canEditTitle ? (
            <View
              style={[
                styles.fieldCard,
                midnightCards && styles.fieldCardMidnight,
                lightCards && styles.fieldCardOnLight,
              ]}
            >
              <Text
                style={[
                  styles.fieldCardLabel,
                  { color: lightCards ? '#3D5246' : MIDNIGHT.textPrimary },
                  SANS,
                ]}
              >
                Custom Profile Title
              </Text>
              <TextInput
                style={[
                  styles.fieldCardInput,
                  midnightCards && styles.fieldCardInputMidnight,
                  lightCards && styles.fieldCardInputOnLight,
                  SANS,
                ]}
                value={titleDraft}
                onChangeText={setTitleDraft}
                placeholder="e.g. Feature Fairy Godmother"
                placeholderTextColor={
                  lightCards ? '#9AA89A' : midnightCards ? MIDNIGHT.textMuted : 'rgba(232,229,247,0.45)'
                }
                maxLength={48}
              />
            </View>
          ) : null}

          <View
            style={[
              styles.fieldCard,
              midnightCards && styles.fieldCardMidnight,
              lightCards && styles.fieldCardOnLight,
            ]}
          >
            <Text
              style={[
                styles.fieldCardLabel,
                { color: lightCards ? '#3D5246' : MIDNIGHT.textPrimary },
                SANS,
              ]}
            >
              Short Bio / Mantra
            </Text>
            <TextInput
              style={[
                styles.fieldCardInput,
                styles.fieldCardInputMultiline,
                midnightCards && styles.fieldCardInputMidnight,
                lightCards && styles.fieldCardInputOnLight,
                SANS,
              ]}
              value={bioDraft}
              onChangeText={setBioDraft}
              placeholder="A line you carry into the quiet hours…"
              placeholderTextColor={
                lightCards ? '#9AA89A' : midnightCards ? MIDNIGHT.textMuted : 'rgba(232,229,247,0.45)'
              }
              multiline
              textAlignVertical="top"
            />
          </View>

          <MamaBirthdayField
            birthday={mamaBirthday}
            onBirthdayChange={onBirthdayChange}
            variant={
              midnightCards ? 'midnight' : lightCards ? 'hybridLight' : 'hybrid'
            }
          />

          <View
            style={[
              styles.fieldCard,
              midnightCards && styles.fieldCardMidnight,
              lightCards && styles.fieldCardOnLight,
            ]}
          >
            <Text
              style={[
                styles.fieldCardLabel,
                { color: lightCards ? '#3D5246' : MIDNIGHT.textPrimary },
                SANS,
              ]}
            >
              Account email
            </Text>
            <TextInput
              style={[
                styles.fieldCardInput,
                midnightCards && styles.fieldCardInputMidnight,
                lightCards && styles.fieldCardInputOnLight,
                SANS,
              ]}
              value={accountEmail || ''}
              onChangeText={onAccountEmailChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Used for membership & village mail"
              placeholderTextColor={
                lightCards ? '#9AA89A' : midnightCards ? MIDNIGHT.textMuted : 'rgba(232,229,247,0.45)'
              }
            />
          </View>

          <View
            style={[
              styles.fieldCard,
              midnightCards && styles.fieldCardMidnight,
              lightCards && styles.fieldCardOnLight,
            ]}
          >
            <Text
              style={[
                styles.fieldCardLabel,
                { color: lightCards ? '#3D5246' : MIDNIGHT.textPrimary },
                SANS,
              ]}
            >
              Your village stage
            </Text>
            <Text
              style={[
                styles.stageHint,
                {
                  color: lightCards
                    ? '#5A6E58'
                    : midnightCards
                      ? MIDNIGHT.textMuted
                      : 'rgba(232, 229, 247, 0.72)',
                },
                SANS,
              ]}
            >
              Pregnant and parenting a little one? Choose Both — then use the Home pills to switch
              tracks.
            </Text>
            <View style={styles.stageRow}>
              {STAGE_OPTIONS.map((option) => {
                const selected = activeMode === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.stagePill,
                      midnightCards && styles.stagePillMidnight,
                      lightCards && styles.stagePillOnLight,
                      selected && styles.stagePillActive,
                      selected && midnightCards && styles.stagePillActiveMidnight,
                      selected && lightCards && styles.stagePillActiveOnLight,
                    ]}
                    onPress={() => onSelectJourneyMode?.(option.id)}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.stagePillLabel,
                        {
                          color: lightCards
                            ? selected
                              ? '#3F3428'
                              : '#5A6E58'
                            : selected
                              ? midnightCards
                                ? '#2A2540'
                                : '#3F3428'
                              : MIDNIGHT.textPrimary,
                        },
                        SANS,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.stagePillHint,
                        {
                          color: lightCards
                            ? selected
                              ? '#5A4E72'
                              : '#7A8A7E'
                            : selected
                              ? '#5A4E72'
                              : MIDNIGHT.textMuted,
                        },
                        SANS,
                      ]}
                    >
                      {option.hint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {activeMode === 'hybrid' ? (
            <>
              <HybridLittleOnesSection
                littleOnes={littleOnes}
                onChildrenChange={onChildrenChange}
                variant={midnightCards || !lightCards ? 'midnight' : 'daily'}
              />
              <Text style={[styles.hybridReadyNote, { color: ink.accent }, SANS]}>
                Hybrid on — open Home for Pregnancy / Toddler pills.
              </Text>
            </>
          ) : null}

          <MeProfileBackgroundSwitcher />

          <VillageStickerPicker unlocked={stickerUnlocked} />

          <VillageAppIconPicker unlocked={appIconUnlocked} />

          <SecretThemeSwitcher unlocked={secretThemesUnlocked} />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
            <Text style={[styles.saveBtnText, SANS]}>
              {savedFlash ? 'Saved ✓' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.doneBtn, ink.onLight && styles.doneBtnOnLight]}
            onPress={onClose}
            activeOpacity={0.88}
          >
            <Text
              style={[
                styles.doneBtnText,
                { color: ink.onLight ? ink.accent : MIDNIGHT.lavenderMuted },
                SANS,
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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
    paddingTop: 4,
    paddingBottom: 48,
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
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  avatarDashed: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: MIDNIGHT.lavender,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    padding: 4,
    backgroundColor: 'transparent',
  },
  avatarDashedOnLight: {
    borderColor: 'rgba(107, 85, 136, 0.55)',
  },
  avatarInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MIDNIGHT.lavenderTint,
  },
  avatarInnerOnLight: {
    backgroundColor: 'rgba(255, 252, 248, 0.75)',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlus: {
    fontSize: 40,
    fontWeight: '300',
  },
  avatarHint: {
    fontSize: 15,
    marginTop: 4,
  },
  /** Matches HybridLittleOnesSection "Little one 1" child card. */
  fieldCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    width: '100%',
    backgroundColor: 'rgba(37, 34, 50, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.22)',
  },
  /** Original Midnight Lounge field surface (Calm Mama Me default). */
  fieldCardMidnight: {
    backgroundColor: MIDNIGHT.bgCard,
    borderColor: MIDNIGHT.border,
    borderRadius: 14,
    padding: 14,
  },
  fieldCardOnLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(107, 143, 120, 0.25)',
  },
  fieldCardLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  fieldCardInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#F5F0FF',
  },
  fieldCardInputMidnight: {
    backgroundColor: MIDNIGHT.bgElevated,
    borderColor: MIDNIGHT.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 19,
    color: MIDNIGHT.textPrimary,
  },
  fieldCardInputOnLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(107, 143, 120, 0.28)',
    color: '#2A382E',
  },
  fieldCardInputMultiline: {
    minHeight: 88,
    paddingTop: 10,
  },
  titleBadge: {
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 12,
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
  stageHint: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  stageRow: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  stagePill: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 184, 150, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  stagePillMidnight: {
    borderRadius: 16,
    borderColor: MIDNIGHT.border,
    backgroundColor: MIDNIGHT.bgElevated,
    paddingVertical: 12,
  },
  stagePillOnLight: {
    borderColor: 'rgba(107, 143, 120, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  stagePillActive: {
    backgroundColor: 'rgba(212, 184, 150, 0.85)',
    borderColor: 'rgba(212, 184, 150, 0.95)',
  },
  stagePillActiveMidnight: {
    borderColor: MIDNIGHT.lavender,
    backgroundColor: MIDNIGHT.lavenderTint,
  },
  stagePillActiveOnLight: {
    backgroundColor: 'rgba(212, 184, 150, 0.85)',
    borderColor: 'rgba(212, 184, 150, 0.95)',
  },
  stagePillLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  stagePillHint: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  hybridReadyNote: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    width: '100%',
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A2540',
  },
  doneBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  doneBtnOnLight: {
    marginBottom: 4,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
