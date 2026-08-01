import React, { useState, useEffect, useCallback, memo } from 'react';
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

/**
 * Intake form keeps drafts local so typing / journey taps don't re-render App
 * (and the living ombre) on every keystroke — that was the onboarding jank.
 */
function OnboardingStageScreen({
  logoUri,
  pulseAnim,
  userJourney: initialJourney = 'pregnant',
  onSelectJourney,
  mamaName: initialMamaName = '',
  onMamaNameChange,
  weeksPregnant: initialWeeks = '24',
  onWeeksPregnantChange,
  dueDate: initialDueDate = '',
  onDueDateChange,
  babyAge: initialBabyAge = 'Newborn',
  onBabyAgeChange,
  onContinue,
}) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [legalDocId, setLegalDocId] = useState(null);
  const [draftJourney, setDraftJourney] = useState(initialJourney);
  const [draftName, setDraftName] = useState(initialMamaName);
  const [draftWeeks, setDraftWeeks] = useState(initialWeeks);
  const [draftDueDate, setDraftDueDate] = useState(initialDueDate);
  const [draftBabyAge, setDraftBabyAge] = useState(initialBabyAge);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  const openLegal = (docId) => setLegalDocId(docId);

  const selectJourney = useCallback((journey) => {
    setDraftJourney(journey);
  }, []);

  const handleContinue = useCallback(() => {
    onMamaNameChange?.(draftName);
    onWeeksPregnantChange?.(draftWeeks);
    onDueDateChange?.(draftDueDate);
    onBabyAgeChange?.(draftBabyAge);
    onSelectJourney?.(draftJourney);
    // Let React commit journey/profile drafts before swapping to welcome.
    setTimeout(() => {
      onContinue?.();
    }, 0);
  }, [
    draftName,
    draftWeeks,
    draftDueDate,
    draftBabyAge,
    draftJourney,
    onMamaNameChange,
    onWeeksPregnantChange,
    onDueDateChange,
    onBabyAgeChange,
    onSelectJourney,
    onContinue,
  ]);

  const showPregnancyFields = draftJourney === 'pregnant' || draftJourney === 'hybrid';
  const showBabyFields = draftJourney === 'postpartum' || draftJourney === 'hybrid';

  return (
    <View style={styles.fullscreenContainer}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews={false}
      >
        <View style={styles.brandBlock}>
          <VillageBrandHeader logoUri={logoUri} pulseAnim={pulseAnim} variant="onboarding" />
          <Text style={[styles.welcomeTitle, ONBOARDING_WELCOME_FONT]}>Welcome, beautiful mama</Text>
          <Text style={[styles.welcomeSub, ONBOARDING_SERIF]}>
            Tell us a little about you — we&apos;ll tailor your village journey from the very first step.
          </Text>
        </View>

        <View style={styles.journeyBlock}>
          <Text style={[styles.sectionLabel, ONBOARDING_SERIF]}>Where are you in your journey?</Text>
          <View style={styles.personaRow}>
            <TouchableOpacity
              style={[styles.personaCard, draftJourney === 'pregnant' && styles.personaCardActive]}
              onPress={() => selectJourney('pregnant')}
              activeOpacity={0.9}
            >
              <View style={styles.personaOrb}>
                <Text style={styles.personaEmoji}>🤰</Text>
              </View>
              <Text
                style={[styles.personaLabel, draftJourney === 'pregnant' && styles.personaLabelActive]}
                numberOfLines={2}
              >
                Pregnant Mama
              </Text>
              <Text
                style={[styles.personaHint, draftJourney === 'pregnant' && styles.personaHintActive]}
                numberOfLines={2}
              >
                Bloom week by week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.personaCard, draftJourney === 'postpartum' && styles.personaCardActive]}
              onPress={() => selectJourney('postpartum')}
              activeOpacity={0.9}
            >
              <View style={styles.personaOrb}>
                <Text style={styles.personaEmoji}>👶</Text>
              </View>
              <Text
                style={[
                  styles.personaLabel,
                  draftJourney === 'postpartum' && styles.personaLabelActive,
                ]}
                numberOfLines={2}
              >
                Postpartum Mama
              </Text>
              <Text
                style={[
                  styles.personaHint,
                  draftJourney === 'postpartum' && styles.personaHintActive,
                ]}
                numberOfLines={2}
              >
                Cloud nursery & recovery
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.hybridCard, draftJourney === 'hybrid' && styles.personaCardActive]}
            onPress={() => selectJourney('hybrid')}
            activeOpacity={0.9}
          >
            <Text style={styles.hybridEmoji}>🤰🧸</Text>
            <View style={styles.hybridCopy}>
              <Text
                style={[styles.personaLabel, draftJourney === 'hybrid' && styles.personaLabelActive]}
                numberOfLines={2}
              >
                Both — Pregnant & Parenting
              </Text>
              <Text
                style={[styles.personaHint, draftJourney === 'hybrid' && styles.personaHintActive]}
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
            value={draftName}
            onChangeText={setDraftName}
            autoCorrect={false}
          />

          {/* Keep both field stacks in-flow so journey taps never reflow the ScrollView.
              Inactive stacks fade out but keep their height — iOS-stable, no absolute jump. */}
          <View
            style={!showPregnancyFields ? styles.journeyFieldsInactive : null}
            pointerEvents={showPregnancyFields ? 'auto' : 'none'}
            accessibilityElementsHidden={!showPregnancyFields}
            importantForAccessibility={showPregnancyFields ? 'yes' : 'no-hide-descendants'}
          >
            <Text style={styles.fieldLabel}>
              {draftJourney === 'hybrid' ? 'Current pregnancy — weeks' : 'Weeks pregnant'}
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={draftWeeks}
              keyboardType="numeric"
              onChangeText={setDraftWeeks}
            />
            <Text style={styles.fieldLabel}>Estimated due date</Text>
            <TextInput style={styles.fieldInput} value={draftDueDate} onChangeText={setDraftDueDate} />
          </View>

          <View
            style={!showBabyFields ? styles.journeyFieldsInactive : null}
            pointerEvents={showBabyFields ? 'auto' : 'none'}
            accessibilityElementsHidden={!showBabyFields}
            importantForAccessibility={showBabyFields ? 'yes' : 'no-hide-descendants'}
          >
            <Text style={styles.fieldLabel}>
              {draftJourney === 'hybrid' ? "Little one's current age" : "Baby's current age"}
            </Text>
            <BabyAgePicker value={draftBabyAge} onChange={setDraftBabyAge} />
          </View>
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
          onPress={handleContinue}
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

export default memo(OnboardingStageScreen);

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
    borderColor: 'rgba(122, 154, 134, 0.55)',
  },
  personaOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  personaEmoji: {
    fontSize: 26,
  },
  personaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D5246',
    textAlign: 'center',
    marginBottom: 4,
  },
  personaLabelActive: {
    color: '#2F4238',
  },
  personaHint: {
    fontSize: 11,
    lineHeight: 15,
    color: '#6A7F72',
    textAlign: 'center',
  },
  personaHintActive: {
    color: '#4A5C50',
  },
  formGroup: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
    // Always reserve hybrid-height so journey taps never resize the card.
    minHeight: 320,
    overflow: 'hidden',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#3D5246',
    marginBottom: 10,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6E62',
    marginBottom: 6,
    marginTop: 8,
  },
  fieldInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(170, 190, 178, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#2F4238',
  },
  journeyFieldsInactive: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    marginTop: 0,
    marginBottom: 0,
  },
  secureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  secureIcon: {
    fontSize: 14,
  },
  secureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6E62',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(90, 110, 98, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  consentCheckboxChecked: {
    backgroundColor: '#7A9A86',
    borderColor: '#7A9A86',
  },
  consentCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  consentLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#4A5C50',
  },
  consentLink: {
    color: '#5A7A68',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  continueBtn: {
    backgroundColor: '#7A9A86',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '0 8px 20px rgba(90, 120, 100, 0.22)' },
      default: { elevation: 3 },
    }),
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(122, 154, 134, 0.35)',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  continueBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
