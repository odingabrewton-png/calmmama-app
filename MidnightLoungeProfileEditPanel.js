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
import HybridLittleOnesSection from './HybridLittleOnesSection.js';
import { useVillageRewards } from './VillageRewardsContext';
import {
  getMeBackgroundById,
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
  const background = useMemo(
    () => getMeBackgroundById(rewards.selectedMeBackgroundId),
    [rewards.selectedMeBackgroundId],
  );

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
      <LinearGradient
        colors={background.colors}
        locations={background.locations}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentColumn}>
          <Text style={[styles.sectionEyebrow, SANS]}>YOUR LOUNGE IDENTITY</Text>
          <Text style={[styles.sectionTitle, SANS]}>Customize Profile</Text>

          <TouchableOpacity
            style={styles.avatarDashed}
            onPress={onPickProfilePhoto}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
          >
            <View style={styles.avatarInner}>
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
                  <Text style={styles.avatarPlus}>+</Text>
                  <Text style={[styles.avatarHint, SANS]}>Add Photo</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, SANS]}>Display Name</Text>
          <TextInput
            style={[styles.fieldInput, SANS]}
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="How should the village greet you?"
            placeholderTextColor={MIDNIGHT.textMuted}
          />
          <CustomTitleBadge title={rewards.customProfileTitle || titleDraft} />

          {canEditTitle ? (
            <>
              <Text style={[styles.fieldLabel, SANS]}>Custom Profile Title</Text>
              <TextInput
                style={[styles.fieldInput, SANS]}
                value={titleDraft}
                onChangeText={setTitleDraft}
                placeholder="e.g. Feature Fairy Godmother"
                placeholderTextColor={MIDNIGHT.textMuted}
                maxLength={48}
              />
            </>
          ) : null}

          <Text style={[styles.fieldLabel, SANS]}>Short Bio / Mantra</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputMultiline, SANS]}
            value={bioDraft}
            onChangeText={setBioDraft}
            placeholder="A line you carry into the quiet hours…"
            placeholderTextColor={MIDNIGHT.textMuted}
            multiline
            textAlignVertical="top"
          />

          <MamaBirthdayField
            birthday={mamaBirthday}
            onBirthdayChange={onBirthdayChange}
            variant="midnight"
          />

          <Text style={[styles.fieldLabel, SANS]}>Account email</Text>
          <TextInput
            style={[styles.fieldInput, SANS]}
            value={accountEmail || ''}
            onChangeText={onAccountEmailChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Used for membership & village mail"
            placeholderTextColor={MIDNIGHT.textMuted}
          />

          <Text style={[styles.fieldLabel, SANS]}>Your village stage</Text>
          <Text style={[styles.stageHint, SANS]}>
            Pregnant and parenting a little one? Choose Both — then use the Home pills to switch
            tracks.
          </Text>
          <View style={styles.stageRow}>
            {STAGE_OPTIONS.map((option) => {
              const selected = activeMode === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.stagePill, selected && styles.stagePillActive]}
                  onPress={() => onSelectJourneyMode?.(option.id)}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[styles.stagePillLabel, SANS, selected && styles.stagePillLabelActive]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[styles.stagePillHint, SANS, selected && styles.stagePillHintActive]}
                  >
                    {option.hint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {activeMode === 'hybrid' ? (
            <>
              <HybridLittleOnesSection littleOnes={littleOnes} onChildrenChange={onChildrenChange} />
              <Text style={[styles.hybridReadyNote, SANS]}>
                Hybrid on — open Home for Pregnancy / Toddler pills.
              </Text>
            </>
          ) : null}

          <MeProfileBackgroundSwitcher />

          <SecretThemeSwitcher unlocked={secretThemesUnlocked} />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
            <Text style={[styles.saveBtnText, SANS]}>
              {savedFlash ? 'Saved ✓' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={[styles.doneBtnText, SANS]}>Done</Text>
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
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
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
  avatarInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MIDNIGHT.lavenderTint,
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
    color: MIDNIGHT.lavender,
    fontWeight: '300',
  },
  avatarHint: {
    fontSize: 15,
    color: MIDNIGHT.textMuted,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: MIDNIGHT.textMuted,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  fieldInput: {
    backgroundColor: MIDNIGHT.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 19,
    color: MIDNIGHT.textPrimary,
    marginBottom: 14,
    width: '100%',
  },
  titleBadge: {
    alignSelf: 'center',
    marginTop: -6,
    marginBottom: 16,
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
  fieldInputMultiline: {
    minHeight: 96,
    paddingTop: 14,
  },
  stageHint: {
    fontSize: 14,
    lineHeight: 20,
    color: MIDNIGHT.textMuted,
    marginBottom: 10,
    marginTop: -2,
  },
  stageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  stagePill: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: MIDNIGHT.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  stagePillActive: {
    borderColor: MIDNIGHT.lavender,
    backgroundColor: MIDNIGHT.lavenderTint,
  },
  stagePillLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: MIDNIGHT.textPrimary,
    marginBottom: 3,
  },
  stagePillLabelActive: {
    color: '#2A2540',
  },
  stagePillHint: {
    fontSize: 11,
    fontWeight: '600',
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
  },
  stagePillHintActive: {
    color: '#5A4E72',
  },
  hybridReadyNote: {
    fontSize: 13,
    fontWeight: '700',
    color: MIDNIGHT.lavender,
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
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: MIDNIGHT.lavenderMuted,
  },
});
