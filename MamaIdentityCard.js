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
  Linking,
} from 'react-native';
import { injectNurseryWebFonts, retroSoft, retroAccent, retroHubTitle } from './nurseryRetroFonts';
import { VILLAGE_BOUTIQUE_COLLECTION_URL } from './retailConfig';
import {
  getBirthdayProfileSummary,
  getDaysInMonth,
  getZodiacSign,
  isValidBirthday,
  MONTH_SHORT,
  normalizeBirthday,
} from './mamaBirthdayUtils';
import FindMyVillageHubCard from './FindMyVillageHubCard';

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
    placeholder: 'Affirmations, rest, joy — what refills you right now?',
    grid: 'wide',
  },
  {
    id: 'groundedActivities',
    emoji: '🌿',
    label: 'What activities keep you grounded?',
    placeholder: 'Walks, journaling, breathwork, creative rituals…',
    grid: 'left',
  },
  {
    id: 'villageShares',
    emoji: '📺',
    label: 'TV, books, or media you would share with other mamas?',
    placeholder: 'Shows, podcasts, or books that helped in overwhelming times…',
    grid: 'right',
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
  onGraduation,
  showGraduation,
}) {
  const [drafts, setDrafts] = useState(() => ({ ...discovery }));
  const [savedFields, setSavedFields] = useState({});

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
    onOpenVillagePortal?.();
  };

  const handleOpenBoutique = () => {
    Linking.openURL(VILLAGE_BOUTIQUE_COLLECTION_URL).catch(() => {});
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
        <Text style={[styles.nickname, retroHubTitle]} numberOfLines={2}>
          {mamaName || 'Amelia Foster'}
        </Text>
        <Text style={[styles.cityLine, PROFILE_SERIF]}>{approximateCity || 'Your village'}</Text>

        <BirthdayField birthday={mamaBirthday} onBirthdayChange={onBirthdayChange} />

        <Text style={[styles.gridSectionTitle, PROFILE_SERIF]}>Sanctuary Journal Cards</Text>
        <View style={styles.discoveryGrid}>
          {DISCOVERY_FIELDS.map((field) => (
            <View
              key={field.id}
              style={[
                styles.gridCard,
                field.grid === 'wide' && styles.gridCardWide,
                field.grid === 'left' && styles.gridCardLeft,
                field.grid === 'right' && styles.gridCardRight,
              ]}
            >
              <DiscoveryInputBox
                field={field}
                value={drafts[field.id] ?? ''}
                onChange={(text) => {
                  setDrafts((prev) => ({ ...prev, [field.id]: text }));
                  setSavedFields((prev) => ({ ...prev, [field.id]: false }));
                }}
                onSave={() => handleSaveField(field.id)}
                saved={!!savedFields[field.id]}
              />
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.boutiqueRow} onPress={handleOpenBoutique} activeOpacity={0.88}>
        <Text style={[styles.boutiqueRowLabel, PROFILE_SERIF]}>✨ The Village Boutique</Text>
        <Text style={styles.boutiqueRowChevron}>›</Text>
      </TouchableOpacity>

      <FindMyVillageHubCard onPress={handleOpenVillage} />

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
  boutiqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 252, 248, 0.72)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.42)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  boutiqueRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D5246',
    letterSpacing: 0.2,
  },
  boutiqueRowChevron: {
    fontSize: 22,
    fontWeight: '300',
    color: '#8A9E92',
    marginTop: -2,
  },
  identityCard: {
    backgroundColor: '#E6ECE6',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(195, 169, 149, 0.25)',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#C3A995',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 8,
    marginBottom: 4,
  },
  cityLine: {
    fontSize: 13,
    color: '#7A6A62',
    marginBottom: 12,
  },
  gridSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A4E48',
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 10,
  },
  discoveryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCard: {
    width: '100%',
  },
  gridCardWide: {
    width: '100%',
  },
  gridCardLeft: {
    width: '48%',
  },
  gridCardRight: {
    width: '48%',
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
    backgroundColor: '#FBF9F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(195, 169, 149, 0.2)',
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
    marginBottom: 0,
    backgroundColor: '#F3EBE9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(195, 169, 149, 0.3)',
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
    backgroundColor: '#FBF9F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(195, 169, 149, 0.2)',
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
