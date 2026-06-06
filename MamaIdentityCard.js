import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import VillageBrandHeader from './VillageBrandHeader';
import { injectNurseryWebFonts, retroSoft, retroAccent, retroHubTitle } from './nurseryRetroFonts';
import {
  getBirthdayProfileSummary,
  getDaysInMonth,
  getZodiacSign,
  isValidBirthday,
  MONTH_SHORT,
  normalizeBirthday,
} from './mamaBirthdayUtils';
import { useVillagePressTransition } from './villageScreenTransitions';

const AVATAR_SIZE = 101;

const PROFILE_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

const DISCOVERY_FIELDS = [
  {
    id: 'heartSpace',
    emoji: '☕',
    label: 'How are you truly filling your cup today, mama?',
    placeholder: 'Rest, nourishment, joy — what’s refilling you right now?',
  },
  {
    id: 'centerRitual',
    emoji: '🕯️',
    label: 'What small ritual brings you back to your center when things get chaotic?',
    placeholder: 'A breath, a song, a warm shower — your reset button…',
  },
];

function getJourneyTrackLabel(userJourney, weeksPregnant) {
  if (userJourney !== 'pregnant') return 'Postpartum path';
  const week = parseInt(String(weeksPregnant), 10);
  if (Number.isNaN(week)) return 'Pregnant path';
  if (week >= 28) return 'Third trimester';
  if (week >= 14) return 'Second trimester';
  return 'First trimester';
}

function DiscoveryInputBox({ field, value, onChange, onSave, saved }) {
  return (
    <View style={[styles.discoveryBlock, saved && styles.discoveryBlockSaved]}>
      <Text style={[styles.discoveryQuestion, PROFILE_SERIF]}>{field.label}</Text>
      <TextInput
        style={[styles.discoveryInput, retroSoft]}
        value={value}
        onChangeText={onChange}
        multiline
        placeholder={field.placeholder}
        placeholderTextColor="rgba(92, 110, 99, 0.55)"
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.discoverySaveBtn, saved && styles.discoverySaveBtnSaved]}
        onPress={onSave}
        activeOpacity={0.88}
      >
        <Text style={[styles.discoverySaveBtnText, saved && styles.discoverySaveBtnTextSaved]}>
          {saved ? 'Saved ✓' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function BirthdayField({ birthday, onBirthdayChange }) {
  const [expanded, setExpanded] = useState(false);
  const summary = getBirthdayProfileSummary(birthday);
  const activeMonth = birthday?.month ?? null;
  const activeDay = birthday?.day ?? null;

  const handleSelectMonth = (month) => {
    const nextDay = activeDay ? Math.min(activeDay, getDaysInMonth(month)) : 1;
    onBirthdayChange?.(normalizeBirthday({ month, day: nextDay }));
    setExpanded(true);
  };

  const handleSelectDay = (day) => {
    if (!activeMonth) return;
    onBirthdayChange?.(normalizeBirthday({ month: activeMonth, day }));
  };

  const zodiac =
    isValidBirthday(birthday) && getZodiacSign(birthday.month, birthday.day);

  return (
    <View style={styles.birthdayField}>
      <TouchableOpacity
        style={styles.birthdayHeaderRow}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.9}
      >
        <View style={styles.birthdayHeaderCopy}>
          <Text style={styles.birthdayEyebrow}>🎂 Birthday</Text>
          <View style={styles.birthdayValueRow}>
            <Text style={[styles.birthdayDateText, retroSoft]}>{summary.dateLabel}</Text>
            {zodiac ? (
              <View style={styles.zodiacBadge}>
                <Text style={styles.zodiacEmoji}>{zodiac.emoji}</Text>
                <Text style={styles.zodiacSignText}>{zodiac.sign}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={styles.birthdayChevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.birthdayPickerBody}>
          <Text style={styles.birthdayPickerLabel}>Month</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.monthChipRow}
          >
            {MONTH_SHORT.map((label, index) => {
              const month = index + 1;
              const active = activeMonth === month;
              return (
                <TouchableOpacity
                  key={label}
                  style={[styles.monthChip, active && styles.monthChipActive]}
                  onPress={() => handleSelectMonth(month)}
                  activeOpacity={0.88}
                >
                  <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {activeMonth ? (
            <>
              <Text style={[styles.birthdayPickerLabel, styles.birthdayPickerLabelSpaced]}>Day</Text>
              <View style={styles.dayGrid}>
                {Array.from({ length: getDaysInMonth(activeMonth) }, (_, i) => i + 1).map((day) => {
                  const active = activeDay === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayChip, active && styles.dayChipActive]}
                      onPress={() => handleSelectDay(day)}
                      activeOpacity={0.88}
                    >
                      <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function MamaIdentityCard({
  logoUri,
  pulseAnim,
  mamaName,
  mamaBirthday,
  onBirthdayChange,
  approximateCity,
  userJourney,
  weeksPregnant,
  dueDate,
  babyAge,
  discovery,
  onSaveDiscoveryField,
  profilePhotoUri,
  onPickProfilePhoto,
  onOpenVillagePortal,
  onOpenCandleSanctum,
  candles,
  onGraduation,
  showGraduation,
}) {
  const [drafts, setDrafts] = useState(() => ({ ...discovery }));
  const [savedFields, setSavedFields] = useState({});
  const { animatedStyle: villagePortalStyle, runTransition: runVillagePortalTransition } =
    useVillagePressTransition();
  const { animatedStyle: candleSanctumStyle, runTransition: runCandleSanctumTransition } =
    useVillagePressTransition();

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  useEffect(() => {
    setDrafts({ ...discovery });
  }, [discovery]);

  const journeyTrack = getJourneyTrackLabel(userJourney, weeksPregnant);
  const timelineValue = userJourney === 'pregnant' ? dueDate : babyAge;
  const timelineLabel = userJourney === 'pregnant' ? 'Due date' : 'Baby age';

  const handleOpenVillage = () => {
    runVillagePortalTransition(() => onOpenVillagePortal?.());
  };

  const handleOpenCandleSanctum = () => {
    runCandleSanctumTransition(() => onOpenCandleSanctum?.());
  };

  const handleSaveField = (fieldId) => {
    const value = (drafts[fieldId] ?? '').trim();
    onSaveDiscoveryField?.(fieldId, value);
    setSavedFields((prev) => ({ ...prev, [fieldId]: true }));
    setTimeout(() => {
      setSavedFields((prev) => ({ ...prev, [fieldId]: false }));
    }, 2200);
  };

  return (
    <View style={styles.root}>
      <View style={styles.profileLogoHeader}>
        <VillageBrandHeader
          logoUri={logoUri}
          pulseAnim={pulseAnim}
          variant="sanctuary"
          sanctuaryMode
          compact
          profileMode
          notchSafe
        />
      </View>

      <View style={styles.identityCard}>
        <TouchableOpacity
          style={styles.avatarRing}
          onPress={onPickProfilePhoto}
          activeOpacity={0.88}
          accessibilityLabel="Upload profile photo"
        >
          <View style={styles.avatarCircle}>
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>🌸</Text>
            )}
          </View>
          <View style={styles.avatarCameraBadge}>
            <Text style={styles.avatarCameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to add photo</Text>
        <Text style={[styles.nickname, retroHubTitle]} numberOfLines={2}>
          {mamaName}
        </Text>
        <Text style={[styles.journeyTrack, retroSoft, PROFILE_SERIF]}>{journeyTrack}</Text>

        <BirthdayField birthday={mamaBirthday} onBirthdayChange={onBirthdayChange} />

        <View style={styles.metaStrip}>
          <Text style={styles.metaStripText}>
            {timelineLabel}: {timelineValue}
          </Text>
          <Text style={styles.metaStripDot}>·</Text>
          <Text style={styles.metaStripText}>{approximateCity}</Text>
          <Text style={styles.metaStripDot}>·</Text>
          <Text style={styles.metaStripText}>
            {userJourney === 'pregnant' ? `Week ${weeksPregnant}` : 'Postpartum'}
          </Text>
        </View>

        <View style={styles.getToKnowSection}>
          <Text style={[styles.getToKnowTitle, PROFILE_SERIF]}>Get to Know Mama</Text>
          {DISCOVERY_FIELDS.map((field) => (
            <DiscoveryInputBox
              key={field.id}
              field={field}
              value={drafts[field.id] ?? ''}
              onChange={(text) => {
                setDrafts((prev) => ({ ...prev, [field.id]: text }));
                setSavedFields((prev) => ({ ...prev, [field.id]: false }));
              }}
              onSave={() => handleSaveField(field.id)}
              saved={!!savedFields[field.id]}
            />
          ))}
        </View>
      </View>

      <Animated.View style={villagePortalStyle}>
        <TouchableOpacity style={styles.findVillageCard} onPress={handleOpenVillage} activeOpacity={0.92}>
          <Text style={styles.findVillageEmoji}>🌍</Text>
          <Text style={[styles.findVillageTitle, retroAccent, PROFILE_SERIF]}>
            Find My Village Network
          </Text>
          <Text style={[styles.findVillageDesc, retroSoft]}>
            Discover blurred-nearby mamas, mutual aid, and gentle community threads — all privacy-shielded.
          </Text>
          <Text style={styles.findVillageCta}>Enter the community village →</Text>
        </TouchableOpacity>
      </Animated.View>

      {onOpenCandleSanctum ? (
        <Animated.View style={candleSanctumStyle}>
          <TouchableOpacity
            style={styles.candleSanctumCard}
            onPress={handleOpenCandleSanctum}
            activeOpacity={0.92}
          >
            <Text style={styles.candleSanctumEyebrow}>🕯️ VILLAGE CANDLE SANCTUM</Text>
            <Text style={[styles.candleSanctumTitle, retroAccent, PROFILE_SERIF]}>
              Hand-poured ritual candles
            </Text>
            <Text style={[styles.candleSanctumDesc, retroSoft]}>
              Sunrise Village & Sweet Dreams Cloud 9 — enter for full sensory stories.
            </Text>
            {candles?.length ? (
              <View style={styles.candleSanctumPreviewRow}>
                {candles.map((candle) => (
                  <View key={candle.id} style={styles.candleSanctumPreviewTile}>
                    {candle.imageSource ? (
                      <Image
                        source={candle.imageSource}
                        style={styles.candleSanctumPreviewImage}
                        resizeMode="cover"
                      />
                    ) : null}
                    <Text style={[styles.candleSanctumPreviewLabel, retroSoft]} numberOfLines={2}>
                      {candle.title}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text style={styles.candleSanctumCta}>Enter the Candle Sanctum →</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      {showGraduation ? (
        <View style={styles.graduationCard}>
          <Text style={[styles.gradTitle, retroAccent]}>✨ Did Baby Come Early?</Text>
          <Text style={[styles.gradDesc, retroSoft]}>
            Instantly transition your entire navigation setup to unlock active infant tracking grids.
          </Text>
          <TouchableOpacity style={styles.gradButton} onPress={onGraduation} activeOpacity={0.88}>
            <Text style={styles.gradButtonText}>Welcome My Miracle! 👋</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: 8,
  },
  profileLogoHeader: {
    paddingTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  identityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarRing: {
    padding: 3,
    borderRadius: AVATAR_SIZE / 2 + 4,
    marginBottom: 6,
    position: 'relative',
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A35338',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCameraIcon: {
    fontSize: 12,
  },
  avatarHint: {
    fontSize: 8,
    fontWeight: '700',
    color: '#6B3D2E',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  nickname: {
    fontSize: 18,
    color: '#1F2E24',
    textAlign: 'center',
    lineHeight: 22,
  },
  journeyTrack: {
    fontSize: 12,
    color: '#6B3D2E',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  metaStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingVertical: 8,
    gap: 6,
  },
  metaStripText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(42, 56, 46, 0.72)',
    letterSpacing: 0.2,
  },
  metaStripDot: {
    fontSize: 11,
    color: 'rgba(92, 122, 104, 0.45)',
  },
  birthdayField: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  birthdayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  birthdayHeaderCopy: {
    flex: 1,
    paddingRight: 8,
  },
  birthdayEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#6B5588',
    marginBottom: 4,
  },
  birthdayValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  birthdayDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A382E',
  },
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.22)',
    gap: 4,
  },
  zodiacEmoji: {
    fontSize: 14,
  },
  zodiacSignText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5E4878',
  },
  birthdayChevron: {
    fontSize: 10,
    color: '#6B5588',
    fontWeight: '800',
  },
  birthdayPickerBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(154, 122, 184, 0.18)',
  },
  birthdayPickerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#6B5588',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  birthdayPickerLabelSpaced: {
    marginTop: 10,
  },
  monthChipRow: {
    gap: 6,
    paddingRight: 4,
  },
  monthChip: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
  },
  monthChipActive: {
    backgroundColor: '#5C7A68',
    borderColor: '#5C7A68',
  },
  monthChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5E4878',
  },
  monthChipTextActive: {
    color: '#FFFFFF',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
  },
  dayChipActive: {
    backgroundColor: '#6B5588',
    borderColor: '#6B5588',
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A3860',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  getToKnowSection: {
    width: '100%',
    marginTop: 4,
    paddingTop: 20,
  },
  getToKnowTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#2A382E',
    textAlign: 'center',
    marginBottom: 18,
  },
  discoveryBlock: {
    width: '100%',
    marginBottom: 22,
  },
  discoveryBlockSaved: {},
  discoveryQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A382E',
    lineHeight: 21,
    marginBottom: 10,
    textAlign: 'center',
  },
  discoveryInput: {
    minHeight: 72,
    maxHeight: 120,
    fontSize: 14,
    lineHeight: 21,
    color: '#2A382E',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  discoverySaveBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#5C7A68',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  discoverySaveBtnSaved: {
    backgroundColor: 'rgba(186, 214, 198, 0.85)',
  },
  discoverySaveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  discoverySaveBtnTextSaved: {
    color: '#2A382E',
  },
  findVillageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  findVillageEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  findVillageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A3860',
    textAlign: 'center',
    marginBottom: 6,
  },
  findVillageDesc: {
    fontSize: 11,
    color: '#5C6E63',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  findVillageCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B5588',
  },
  candleSanctumCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  candleSanctumEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#6B3D2E',
    marginBottom: 6,
  },
  candleSanctumTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B3D2E',
    textAlign: 'center',
    marginBottom: 6,
  },
  candleSanctumDesc: {
    fontSize: 11,
    color: '#5C6E63',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  candleSanctumPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  candleSanctumPreviewTile: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.28)',
    alignItems: 'center',
  },
  candleSanctumPreviewImage: {
    width: '100%',
    height: 68,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 252, 248, 0.8)',
  },
  candleSanctumPreviewLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#4A5E52',
    textAlign: 'center',
    lineHeight: 12,
  },
  candleSanctumCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A35338',
  },
  graduationCard: {
    backgroundColor: 'rgba(255, 248, 242, 0.55)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.35)',
  },
  gradTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B4A38',
    marginBottom: 6,
  },
  gradDesc: {
    fontSize: 11,
    color: '#5C4A42',
    lineHeight: 16,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  gradButton: {
    backgroundColor: '#A35338',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  gradButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
