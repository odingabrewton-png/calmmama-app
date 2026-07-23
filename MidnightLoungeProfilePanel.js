import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { MIDNIGHT } from './midnightLoungeTheme';
import MamaBirthdayField from './MamaBirthdayField.js';
import VillageRewardsCard from './VillageRewardsCard.js';

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

function MidnightLoungeProfilePanel({
  mamaName,
  onMamaNameChange,
  shortBio,
  onShortBioChange,
  mamaBirthday,
  onBirthdayChange,
  profilePhotoUri,
  onPickProfilePhoto,
  onOpenBoutique,
  onDeleteAccount,
  onSave,
}) {
  const [nameDraft, setNameDraft] = useState(mamaName || '');
  const [bioDraft, setBioDraft] = useState(shortBio || '');
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setNameDraft(mamaName || '');
  }, [mamaName]);

  useEffect(() => {
    setBioDraft(shortBio || '');
  }, [shortBio]);

  const handleSave = () => {
    onMamaNameChange?.(nameDraft.trim() || 'Mama');
    onShortBioChange?.(bioDraft.trim());
    onSave?.();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  const openBoutique = () => {
    onOpenBoutique?.();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionEyebrow, SANS]}>YOUR LOUNGE IDENTITY</Text>
      <Text style={[styles.sectionTitle, SANS]}>Me</Text>

      <TouchableOpacity style={styles.avatarDashed} onPress={onPickProfilePhoto} activeOpacity={0.88}>
        {profilePhotoUri ? (
          <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlus}>+</Text>
            <Text style={[styles.avatarHint, SANS]}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={[styles.fieldLabel, SANS]}>Display Name</Text>
      <TextInput
        style={[styles.fieldInput, SANS]}
        value={nameDraft}
        onChangeText={setNameDraft}
        placeholder="How should the village greet you?"
        placeholderTextColor={MIDNIGHT.textMuted}
      />

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

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
        <Text style={[styles.saveBtnText, SANS]}>{savedFlash ? 'Saved ✓' : 'Save Changes'}</Text>
      </TouchableOpacity>

      <VillageRewardsCard />

      <VillageBoutiqueBanner onPress={openBoutique} />

      <TouchableOpacity
        style={styles.deleteAccountBtn}
        onPress={onDeleteAccount}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Delete account"
      >
        <Text style={[styles.deleteAccountText, SANS]}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default MidnightLoungeProfilePanel;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 120,
  },
  sectionEyebrow: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  avatarDashed: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: MIDNIGHT.lavender,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: MIDNIGHT.lavenderTint,
  },
  avatarImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlus: {
    fontSize: 30,
    color: MIDNIGHT.lavender,
    fontWeight: '300',
  },
  avatarHint: {
    fontSize: 16,
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
  },
  fieldInputMultiline: {
    minHeight: 96,
    paddingTop: 14,
  },
  saveBtn: {
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 18,
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
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
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
