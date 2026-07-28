import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import VillageBrandHeader from './VillageBrandHeader';
import BabyAgePicker from './BabyAgePicker';
import OnboardingLegalModal from './OnboardingLegalModal';
import { injectNurseryWebFonts, mamaWelcomeTitle } from './nurseryRetroFonts';

const ONBOARDING_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Times New Roman", serif' },
  default: {},
});

const ONBOARDING_WELCOME_FONT = mamaWelcomeTitle;

export default function OnboardingStageScreen({
  logoUri,
  pulseAnim,
  userJourney,
  onSelectJourney,
  mamaName,
  onMamaNameChange,
  weeksPregnant,
  onWeeksPregnantChange,
  dueDate,
  onDueDateChange,
  babyAge,
  onBabyAgeChange,
  onContinue,
}) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [legalDocId, setLegalDocId] = useState(null);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  const openLegal = (docId) => setLegalDocId(docId);

  return (
    <View style={styles.fullscreenContainer}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brandBlock}>
        <VillageBrandHeader logoUri={logoUri} pulseAnim={null} variant="onboarding" />
        <Text style={[styles.welcomeTitle, ONBOARDING_WELCOME_FONT]}>Welcome, beautiful mama</Text>
        <Text style={[styles.welcomeSub, ONBOARDING_SERIF]}>
          Tell us a little about you — we&apos;ll tailor your village journey from the very first step.
        </Text>
      </View>

      <View style={styles.journeyBlock}>
        <Text style={[styles.sectionLabel, ONBOARDING_SERIF]}>Where are you in your journey?</Text>
        <View style={styles.personaRow}>
          <TouchableOpacity
            style={[styles.personaCard, userJourney === 'pregnant' && styles.personaCardActive]}
            onPress={() => onSelectJourney('pregnant')}
            activeOpacity={0.9}
          >
            <View style={styles.personaOrb}>
              <Text style={styles.personaEmoji}>🤰</Text>
            </View>
            <Text
              style={[styles.personaLabel, userJourney === 'pregnant' && styles.personaLabelActive]}
              numberOfLines={2}
            >
              Pregnant Mama
            </Text>
            <Text
              style={[styles.personaHint, userJourney === 'pregnant' && styles.personaHintActive]}
              numberOfLines={2}
            >
              Bloom week by week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.personaCard, userJourney === 'postpartum' && styles.personaCardActive]}
            onPress={() => onSelectJourney('postpartum')}
            activeOpacity={0.9}
          >
            <View style={styles.personaOrb}>
              <Text style={styles.personaEmoji}>👶</Text>
            </View>
            <Text
              style={[styles.personaLabel, userJourney === 'postpartum' && styles.personaLabelActive]}
              numberOfLines={2}
            >
              Postpartum Mama
            </Text>
            <Text
              style={[styles.personaHint, userJourney === 'postpartum' && styles.personaHintActive]}
              numberOfLines={2}
            >
              Cloud nursery & recovery
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.hybridCard,
            userJourney === 'hybrid' && styles.personaCardActive,
          ]}
          onPress={() => onSelectJourney('hybrid')}
          activeOpacity={0.9}
        >
          <Text style={styles.hybridEmoji}>🤰🧸</Text>
          <View style={styles.hybridCopy}>
            <Text
              style={[styles.personaLabel, userJourney === 'hybrid' && styles.personaLabelActive]}
              numberOfLines={2}
            >
              Both — Pregnant & Parenting
            </Text>
            <Text
              style={[styles.personaHint, userJourney === 'hybrid' && styles.personaHintActive]}
              numberOfLines={3}
            >
              Growing a baby while caring for a little one — toggle Home anytime
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formTitle, ONBOARDING_SERIF]}>Your village profile</Text>
        <Text style={styles.fieldLabel}>Mama nickname</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="What should we call you?"
          placeholderTextColor="#8A9E92"
          value={mamaName}
          onChangeText={onMamaNameChange}
        />

        {(userJourney === 'pregnant' || userJourney === 'hybrid') ? (
          <View>
            <Text style={styles.fieldLabel}>
              {userJourney === 'hybrid' ? 'Current pregnancy — weeks' : 'Weeks pregnant'}
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={weeksPregnant}
              keyboardType="numeric"
              onChangeText={onWeeksPregnantChange}
            />
            <Text style={styles.fieldLabel}>Estimated due date</Text>
            <TextInput style={styles.fieldInput} value={dueDate} onChangeText={onDueDateChange} />
          </View>
        ) : null}

        {(userJourney === 'postpartum' || userJourney === 'hybrid') ? (
          <View>
            <Text style={styles.fieldLabel}>
              {userJourney === 'hybrid' ? "Little one's current age" : "Baby's current age"}
            </Text>
            <BabyAgePicker value={babyAge} onChange={onBabyAgeChange} />
          </View>
        ) : null}
      </View>

      <View style={styles.secureBox}>
        <Text style={styles.secureIcon}>🔒</Text>
        <Text style={styles.secureText}>On-device encryption vault active</Text>
      </View>

      <View style={styles.consentRow}>
        <TouchableOpacity
          onPress={() => setIsAgreed((prev) => !prev)}
          activeOpacity={0.88}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isAgreed }}
          accessibilityLabel="Agree to Privacy Policy, Safety Guidelines, and AI Disclaimer"
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <View style={[styles.consentCheckbox, isAgreed && styles.consentCheckboxChecked]}>
            {isAgreed ? <Text style={styles.consentCheckmark}>✓</Text> : null}
          </View>
        </TouchableOpacity>
        <Text style={[styles.consentLabel, ONBOARDING_SERIF]}>
          I agree to the Calm Mama Village{' '}
          <Text style={styles.consentLink} onPress={() => openLegal('privacy')}>
            Privacy Policy
          </Text>
          ,{' '}
          <Text style={styles.consentLink} onPress={() => openLegal('safety')}>
            Safety Guidelines
          </Text>
          , and{' '}
          <Text style={styles.consentLink} onPress={() => openLegal('ai')}>
            AI Disclaimer
          </Text>
          .
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !isAgreed && styles.continueBtnDisabled]}
        onPress={onContinue}
        activeOpacity={0.92}
        disabled={!isAgreed}
      >
        <Text style={[styles.continueBtnText, !isAgreed && styles.continueBtnTextDisabled]}>
          Continue
        </Text>
      </TouchableOpacity>
    </ScrollView>

    <OnboardingLegalModal docId={legalDocId} onClose={() => setLegalDocId(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 48,
    flexGrow: 1,
    gap: 4,
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  welcomeTitle: {
    marginTop: 6,
    paddingHorizontal: 8,
    fontSize: 28,
    lineHeight: 34,
  },
  welcomeSub: {
    fontSize: 14,
    color: '#4A5C50',
    textAlign: 'center',
    lineHeight: 21,
    fontStyle: 'italic',
    maxWidth: 300,
    marginTop: 4,
    paddingHorizontal: 6,
  },
  journeyBlock: {
    width: '100%',
    marginBottom: 8,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#3D5246',
    marginBottom: 0,
    marginTop: 0,
    textAlign: 'center',
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  hybridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 0,
    width: '100%',
  },
  hybridEmoji: {
    fontSize: 28,
  },
  hybridCopy: {
    flex: 1,
    minWidth: 0,
  },
  personaCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    ...Platform.select({
      web: { boxShadow: '0 8px 22px rgba(80, 100, 88, 0.08)' },
      default: { elevation: 2 },
    }),
  },
  personaCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(92, 122, 104, 0.45)',
    borderWidth: 1.5,
  },
  personaOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232, 218, 244, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.22)',
  },
  personaEmoji: { fontSize: 28 },
  personaLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
    letterSpacing: 0.15,
    textAlign: 'center',
    ...ONBOARDING_SERIF,
  },
  personaLabelActive: { color: '#1A2820', fontWeight: '900' },
  personaHint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5C50',
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'center',
    ...ONBOARDING_SERIF,
  },
  personaHintActive: {
    color: '#2A382E',
    fontWeight: '800',
  },
  formGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#2A382E',
    marginBottom: 14,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C7A68',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2A382E',
    fontWeight: '500',
    marginBottom: 4,
  },
  secureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 218, 244, 0.35)',
    alignSelf: 'center',
  },
  secureIcon: { fontSize: 13 },
  secureText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5E4878',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 2,
    gap: 12,
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(143, 168, 136, 0.65)',
    backgroundColor: 'rgba(168, 187, 160, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  consentCheckboxChecked: {
    backgroundColor: 'rgba(143, 168, 136, 0.72)',
    borderColor: 'rgba(92, 122, 104, 0.75)',
  },
  consentCheckmark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 15,
  },
  consentLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: '#4A4038',
    fontWeight: '500',
  },
  consentLink: {
    color: '#4A4038',
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(92, 122, 104, 0.55)',
  },
  continueBtn: {
    backgroundColor: '#5C7A68',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: { boxShadow: '0 10px 24px rgba(92, 122, 104, 0.22)' },
      default: { elevation: 4 },
    }),
  },
  continueBtnDisabled: {
    opacity: 0.42,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { elevation: 0 },
    }),
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  continueBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
});
