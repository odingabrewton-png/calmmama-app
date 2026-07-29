import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SANCTUARY_MOODS, CLOUD_IMAGES, getFriendOpeningLine } from './soulSanctuaryData';
import {
  buildMoodCloudTracker,
  buildVentingGuidance,
  createVentingEntry,
} from './ventingSanctuaryEngine';
import { useVillageReveal, useVillageGentleReveal, VILLAGE_SNAPPY_REANIMATED } from './villageScreenTransitions';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';
import SanctuaryStarsLayer from './SanctuaryStarsLayer';
import TextDissolveRelease, { runTextReleaseFlow } from './TextDissolveRelease';
import { SANCTUARY_ZEN } from './designTypography';
import { useVillageRewards } from './VillageRewardsContext';
import {
  normalizeJournalStage,
  pickInAppPromptBatch,
  pickPremiumTeaserPrompt,
  shuffleInAppPromptBatch,
} from './sanctuaryJournalPrompts';
import { recommendOracleFromJournal } from './sanctuaryOracleRecommend';
import { hasSanctuaryPremiumAccess } from './villageRewardsEngine';

const JOURNAL_SPRING = VILLAGE_SNAPPY_REANIMATED;
const JOURNAL_SPRING_GENTLE = { damping: 20, stiffness: 68 };
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/** Spaced cloud grid — room to breathe between mood pills */
const CLOUD_W = 100;
const CLOUD_H = 58;
const CLOUD_GAP_X = 22;
const CLOUD_GAP_Y = 26;
const CLOUD_CLUSTER_W = CLOUD_W * 3 + CLOUD_GAP_X * 2;
const CLOUD_CLUSTER_H = CLOUD_H * 3 + CLOUD_GAP_Y * 2;
const COL = {
  left: 0,
  mid: CLOUD_W + CLOUD_GAP_X,
  right: (CLOUD_W + CLOUD_GAP_X) * 2,
};
const ROW = [0, CLOUD_H + CLOUD_GAP_Y, (CLOUD_H + CLOUD_GAP_Y) * 2];
const PAIR_INSET = (CLOUD_W + CLOUD_GAP_X) / 2;

const CLOUD_LAYOUT = [
  // Row 1 — Happy, Stressed, Overwhelmed
  { top: ROW[0], left: COL.left, width: CLOUD_W, height: CLOUD_H },
  { top: ROW[0], left: COL.mid, width: CLOUD_W, height: CLOUD_H },
  { top: ROW[0], left: COL.right, width: CLOUD_W, height: CLOUD_H },
  // Row 2 — Exhausted, Grateful, Anxious
  { top: ROW[1], left: COL.left, width: CLOUD_W, height: CLOUD_H },
  { top: ROW[1], left: COL.mid, width: CLOUD_W, height: CLOUD_H },
  { top: ROW[1], left: COL.right, width: CLOUD_W, height: CLOUD_H },
  // Row 3 — Hopeful, Lonely (centered pair)
  { top: ROW[2], left: COL.left + PAIR_INSET, width: CLOUD_W, height: CLOUD_H },
  { top: ROW[2], left: COL.mid + PAIR_INSET, width: CLOUD_W, height: CLOUD_H },
];

function MoodCloudTracker({ history }) {
  const tracker = buildMoodCloudTracker(history, 7);
  if (!tracker.total) {
    return (
      <View style={styles.trackerCard}>
        <Text style={styles.trackerTitle}>Your emotion clouds</Text>
        <Text style={styles.trackerHint}>
          Each cloud you tap becomes a quiet map of how your heart is moving through postpartum —
          day by day, moment by moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.trackerCard}>
      <Text style={styles.trackerTitle}>Your emotion clouds · 7 days</Text>
      <Text style={styles.trackerHint}>
        A soft tracker of the moods you chose — your postpartum heart in weather form.
      </Text>

      <View style={styles.trackerDayRow}>
        {tracker.days.map((day) => (
          <View key={day.key} style={[styles.trackerDay, day.isToday && styles.trackerDayToday]}>
            <Text style={styles.trackerDayLabel}>{day.label}</Text>
            <Text style={styles.trackerDayMood} numberOfLines={1}>
              {day.latest ? day.latest.label.replace(/\s+/g, ' ') : '·'}
            </Text>
            {day.moods.length > 1 ? (
              <Text style={styles.trackerDayCount}>{day.moods.length}×</Text>
            ) : (
              <Text style={styles.trackerDayCount}> </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.trackerCountWrap}>
        {tracker.ranked.slice(0, 4).map((row) => (
          <View key={row.id} style={styles.trackerCountPill}>
            <Text style={styles.trackerCountText}>
              {row.label} · {row.count}
            </Text>
          </View>
        ))}
      </View>

      {tracker.dominant ? (
        <Text style={styles.trackerDominant}>
          Most present lately: {tracker.dominant.label}
        </Text>
      ) : null}
    </View>
  );
}

function TimelineCard({ entry, isLast, expanded, onPress }) {
  const when = new Date(entry.timestamp);
  const timeLabel = when.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={styles.timelineItem}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={
        expanded ? 'Collapse journal entry' : 'Review your entry and mama-friend note'
      }
    >
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={[styles.timelineCard, expanded && styles.timelineCardExpanded]}>
        <Text style={styles.timelineMeta}>
          {entry.moodLabel} · {timeLabel}
        </Text>
        {expanded ? (
          <>
            <Text style={styles.timelineBody}>{entry.text}</Text>
            {entry.guidance ? (
              <View style={styles.friendNoteWrap}>
                <Text style={styles.friendNoteLabel}>{entry.guidance.title}</Text>
                <View style={styles.friendNoteBox}>
                  <Text style={styles.friendNoteBody}>{entry.guidance.body}</Text>
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.timelineLockedHint}>
            Tap to read your words & a note from a mama friend
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SoulSanctuaryScreen({
  mamaName = 'Mama',
  onExit,
  ventingHistory = [],
  onAppendVentingEntry,
  isPro = false,
  isSubscribed = false,
  onRequestUpgrade,
  gentleEnter = false,
  loungeSubView = false,
  /** Postpartum lounge — show emotion-cloud progress tracker */
  showMoodTracker = false,
  journeyContext = '',
  /** pregnant | postpartum | hybrid — drives Inspiration pills */
  journeyStage = 'pregnant',
  /** Prefill from email deep link / newsletter CTA */
  initialJournalPrompt = '',
  /** Open Midnight Lounge oracle from a journal recommendation */
  onOpenOracle,
}) {
  const { addPoints, rewards } = useVillageRewards();
  const hasPremiumPrompts = hasSanctuaryPremiumAccess({
    isPro,
    isSubscribed,
    hasFairyGodmotherPerk: rewards?.hasFairyGodmotherPerk,
  });
  const hasPro = hasPremiumPrompts;
  const stage = normalizeJournalStage(journeyStage);
  const [phase, setPhase] = useState('clouds');
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [releasing, setReleasing] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [openingPrompt, setOpeningPrompt] = useState('');
  const [inspirationPrompts, setInspirationPrompts] = useState(() =>
    pickInAppPromptBatch(stage, { count: 4, seed: 1, includePremium: false }),
  );
  const [premiumTeaser, setPremiumTeaser] = useState(() => pickPremiumTeaserPrompt(stage, 1));
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const pendingEmailPromptRef = useRef(String(initialJournalPrompt || '').trim());

  const othersFade = useRef(new Animated.Value(1)).current;
  const journalReveal = useSharedValue(0);
  const cloudDrifts = useRef(SANCTUARY_MOODS.map(() => new Animated.Value(0))).current;
  const cloudScales = useRef(SANCTUARY_MOODS.map(() => new Animated.Value(1))).current;
  const cloudFloats = useRef(SANCTUARY_MOODS.map(() => new Animated.Value(0))).current;
  const gentleReveal = useVillageGentleReveal(gentleEnter);
  const standardReveal = useVillageReveal(!gentleEnter);
  const screenReveal = gentleEnter ? gentleReveal : standardReveal;
  const scrollRef = useRef(null);
  const releaseRef = useRef(null);

  useEffect(() => {
    setInspirationPrompts(
      pickInAppPromptBatch(stage, {
        count: 4,
        seed: Date.now() % 1000,
        includePremium: hasPremiumPrompts,
      }),
    );
    setPremiumTeaser(pickPremiumTeaserPrompt(stage, Date.now() % 1000));
    setSelectedPromptId(null);
  }, [stage, hasPremiumPrompts]);

  useEffect(() => {
    pendingEmailPromptRef.current = String(initialJournalPrompt || '').trim();
  }, [initialJournalPrompt]);

  useEffect(() => {
    const floatLoops = cloudFloats.map((anim, index) => {
      const duration = 4800 + index * 520;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 280),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: VILLAGE_IN_OUT_SIN,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );
    });
    floatLoops.forEach((loop) => loop.start());
    return () => floatLoops.forEach((loop) => loop.stop());
  }, [cloudFloats]);

  useEffect(() => {
    if (phase === 'journal' && selectedMood) {
      journalReveal.value = 0;
      journalReveal.value = withSpring(1, gentleEnter ? JOURNAL_SPRING_GENTLE : JOURNAL_SPRING);
    } else {
      journalReveal.value = 0;
    }
  }, [phase, selectedMood, journalReveal, gentleEnter]);

  const journalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: journalReveal.value,
    transform: [
      {
        translateY: interpolate(journalReveal.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const resetSanctuary = () => {
    setPhase('clouds');
    setSelectedMood(null);
    setSelectedIndex(null);
    setJournalText('');
    setExpandedEntryId(null);
    setOpeningPrompt('');
    setSelectedPromptId(null);
    othersFade.setValue(1);
    journalReveal.value = 0;
    cloudDrifts.forEach((d) => d.setValue(0));
    cloudScales.forEach((s) => s.setValue(1));
  };

  const handleSelectInspiration = (prompt) => {
    if (!prompt?.text || releasing) return;
    if (prompt.premium && !hasPremiumPrompts) {
      onRequestUpgrade?.();
      return;
    }
    setSelectedPromptId(prompt.id);
    setJournalText(prompt.text);
  };

  const handleShuffleInspiration = () => {
    setInspirationPrompts((prev) =>
      shuffleInAppPromptBatch(stage, prev, { count: 4, includePremium: hasPremiumPrompts }),
    );
    if (!hasPremiumPrompts) {
      setPremiumTeaser(pickPremiumTeaserPrompt(stage, Date.now() % 1000));
    }
    setSelectedPromptId(null);
  };

  const handleTimelineEntryPress = (entryId) => {
    if (expandedEntryId === entryId) {
      setExpandedEntryId(null);
      return;
    }

    setExpandedEntryId(entryId);
  };

  const handleMoodSelect = (mood, index) => {
    if (phase !== 'clouds') return;
    setSelectedMood(mood);
    setSelectedIndex(index);
    const seeded = pendingEmailPromptRef.current;
    setJournalText(seeded || '');
    if (seeded) pendingEmailPromptRef.current = '';
    setSelectedPromptId(null);
    setOpeningPrompt(getFriendOpeningLine(mood.id, mamaName));
    setPhase('journal');

    Animated.parallel([
      Animated.timing(cloudScales[index], {
        toValue: 1.08,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(cloudDrifts[index], {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(othersFade, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const archiveEntry = async (trimmed) => {
    // Gemini (when keyed) reads her exact words and writes a warm reply;
    // local fallback still builds a full letter if the network/key is missing.
    const guidance = await buildVentingGuidance({
      text: trimmed,
      moodId: selectedMood.id,
      moodLabel: selectedMood.label,
      priorEntries: ventingHistory,
      mamaName,
      journeyContext,
    });
    const entry = createVentingEntry({
      text: trimmed,
      mood: selectedMood,
      guidance,
    });
    onAppendVentingEntry?.(entry);
    setJournalText('');
    setExpandedEntryId(entry.id);
    await addPoints(10, 'dailyJournal');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 220);
  };

  const handleRelease = async () => {
    const trimmed = journalText.trim();
    if (!trimmed || !selectedMood || releasing) return;

    setReleasing(true);
    // Always archive to the timeline so companion insight is reviewable.
    // Soft upsell may still fire for free members after the save.
    await runTextReleaseFlow({
      releaseRef,
      text: trimmed,
      isSubscribed: true,
      onRequestUpgrade,
      onArchive: async () => {
        await archiveEntry(trimmed);
      },
    });
    if (!hasPro) {
      onRequestUpgrade?.();
    }
    setReleasing(false);
  };

  const handleDoneEmpty = () => {
    if (journalText.trim()) {
      handleRelease();
      return;
    }
    resetSanctuary();
  };

  const sortedHistory = [...ventingHistory].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const oracleRecommendation = useMemo(
    () =>
      recommendOracleFromJournal({
        text: journalText,
        stage,
      }),
    [journalText, stage],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, loungeSubView && styles.loungeFlex]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Animated.View
        style={[
          styles.root,
          gentleEnter ? { opacity: screenReveal.opacity, transform: screenReveal.transform } : null,
        ]}
      >
        <SanctuaryStarsLayer />

        <TouchableOpacity style={styles.backBtn} onPress={onExit}>
          <Text style={styles.backBtnText}>← Sanctuary Home</Text>
        </TouchableOpacity>

        <Text style={styles.retroTitle}>The Soul Sanctuary</Text>
        <Text style={styles.pageSubtitle}>How is your heart, {mamaName}?</Text>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {phase === 'journal' && selectedMood ? (
            <Reanimated.View style={[styles.journalAnchor, journalAnimatedStyle]}>
              <View style={styles.diarySection}>
                <Text style={styles.diaryTitle}>
                  {selectedMood.label} — pour your heart here
                </Text>
                {openingPrompt ? (
                  <Text style={styles.openingPrompt}>{openingPrompt}</Text>
                ) : null}

                <View style={styles.inspirationBlock}>
                  <View style={styles.inspirationHeader}>
                    <Text style={styles.inspirationPillLabel}>Journaling Inspiration 💡</Text>
                    <TouchableOpacity
                      style={styles.shuffleBtn}
                      onPress={handleShuffleInspiration}
                      activeOpacity={0.85}
                      disabled={releasing}
                      accessibilityRole="button"
                      accessibilityLabel="Shuffle journaling prompts"
                    >
                      <Text style={styles.shuffleBtnText}>Shuffle 🎲</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inspirationList}>
                    {inspirationPrompts.map((prompt) => {
                      const selected = selectedPromptId === prompt.id;
                      return (
                        <TouchableOpacity
                          key={prompt.id}
                          style={[
                            styles.inspirationChip,
                            selected && styles.inspirationChipActive,
                            prompt.premium && styles.inspirationChipPremium,
                          ]}
                          onPress={() => handleSelectInspiration(prompt)}
                          activeOpacity={0.88}
                          disabled={releasing}
                        >
                          <Text
                            style={[
                              styles.inspirationChipText,
                              selected && styles.inspirationChipTextActive,
                            ]}
                          >
                            {prompt.premium ? '✨ ' : ''}
                            {prompt.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {!hasPremiumPrompts && premiumTeaser ? (
                      <TouchableOpacity
                        style={[styles.inspirationChip, styles.inspirationChipLocked]}
                        onPress={() => onRequestUpgrade?.()}
                        activeOpacity={0.88}
                        disabled={releasing}
                      >
                        <Text style={styles.inspirationChipLockedText}>
                          🔒 Premium · {premiumTeaser.text}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                <View style={styles.releaseStage}>
                  <TextInput
                    style={[styles.diaryInput, releasing && styles.diaryInputReleasing]}
                    placeholder="Write freely… then Release Thoughts when you are ready."
                    placeholderTextColor="rgba(220, 210, 235, 0.55)"
                    multiline
                    scrollEnabled
                    textAlignVertical="top"
                    value={journalText}
                    onChangeText={(text) => {
                      setJournalText(text);
                      if (selectedPromptId) setSelectedPromptId(null);
                    }}
                    editable={!releasing}
                  />
                  <TextDissolveRelease
                    ref={releaseRef}
                    textStyle={styles.diaryInput}
                    tint="rgba(232, 224, 242, 0.95)"
                  />
                </View>

                {oracleRecommendation && onOpenOracle ? (
                  <TouchableOpacity
                    style={styles.oracleRecommendCard}
                    onPress={() => onOpenOracle(oracleRecommendation.target)}
                    activeOpacity={0.9}
                    disabled={releasing}
                    accessibilityRole="button"
                    accessibilityLabel={oracleRecommendation.ctaLabel}
                  >
                    <Text style={styles.oracleRecommendEyebrow}>
                      {oracleRecommendation.emoji} MIDNIGHT SUPPORT
                    </Text>
                    <Text style={styles.oracleRecommendTitle}>{oracleRecommendation.title}</Text>
                    <Text style={styles.oracleRecommendBody}>{oracleRecommendation.body}</Text>
                    <Text style={styles.oracleRecommendCta}>{oracleRecommendation.ctaLabel}</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.releaseBtn, releasing && styles.releaseBtnDisabled]}
                  onPress={handleDoneEmpty}
                  activeOpacity={0.88}
                  disabled={releasing}
                >
                  <Text style={styles.releaseBtnText}>
                    {releasing
                      ? 'Your friend is reading…'
                      : journalText.trim()
                        ? 'Release Thoughts'
                        : 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.resetLink} onPress={resetSanctuary}>
                <Text style={styles.resetLinkText}>Choose a different mood cloud →</Text>
              </TouchableOpacity>
            </Reanimated.View>
          ) : null}

          {phase === 'clouds' ? (
          <View style={styles.stage}>
            <View style={styles.cloudCluster} pointerEvents="auto">
              {SANCTUARY_MOODS.map((mood, index) => {
                const layout = CLOUD_LAYOUT[index];
                const isSelected = selectedIndex === index;
                const floatY = cloudFloats[index].interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [-8, 0, 8],
                });
                const driftY = cloudDrifts[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -340],
                });
                const driftX = cloudDrifts[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 56],
                });
                const driftOpacity = cloudDrifts[index].interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [1, 0.75, 0],
                });
                const cloudOpacity =
                  selectedIndex === null ? 1 : isSelected ? driftOpacity : othersFade;

                return (
                  <Animated.View
                    key={mood.id}
                    style={[
                      styles.cloudWrap,
                      {
                        top: layout.top,
                        left: layout.left,
                        width: layout.width,
                        height: layout.height,
                      },
                      {
                        opacity: cloudOpacity,
                        transform: [
                          { translateY: Animated.add(floatY, driftY) },
                          { translateX: driftX },
                          { scale: cloudScales[index] },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleMoodSelect(mood, index)}
                      style={styles.cloudTouchable}
                    >
                      <Image
                        source={CLOUD_IMAGES[mood.cloudKey]}
                        style={[
                          styles.cloudImage,
                          { width: layout.width, height: Math.round(layout.height * 0.78) },
                        ]}
                        resizeMode="contain"
                      />
                      <Text style={styles.cloudLabel}>{mood.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
          ) : null}

          {showMoodTracker ? <MoodCloudTracker history={sortedHistory} /> : null}

          {sortedHistory.length > 0 ? (
            <View style={styles.timelineSection}>
              <Text style={styles.timelineTitle}>Your venting timeline</Text>
              <Text style={styles.timelineHint}>
                Tap an entry to unlock your words and a soft note from a mama friend.
              </Text>
              {sortedHistory.map((entry, idx) => (
                <TimelineCard
                  key={entry.id}
                  entry={entry}
                  isLast={idx === sortedHistory.length - 1}
                  expanded={expandedEntryId === entry.id}
                  onPress={() => handleTimelineEntryPress(entry.id)}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.privacyBanner}>
          <Text style={styles.privacyIcon}>🕊️</Text>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Your quiet corner</Text>
            <Text style={styles.privacyBody}>
              These thoughts stay on your device — a soft place just for you.
            </Text>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loungeFlex: {
    backgroundColor: '#14121C',
  },
  root: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 12,
    position: 'relative',
    overflow: 'visible',
    justifyContent: 'flex-start',
  },
  scroll: { flex: 1, flexShrink: 1 },
  scrollContent: {
    paddingBottom: 24,
    justifyContent: 'flex-start',
    flexGrow: 1,
  },
  journalAnchor: {
    marginTop: 24,
    justifyContent: 'flex-start',
    width: '100%',
    zIndex: 10,
    flexShrink: 0,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: 38,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backBtnText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    fontStyle: 'italic',
  },
  retroTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FFF5FA',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 4,
    textShadowColor: 'rgba(233, 168, 137, 0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", "Book Antiqua", serif' },
    }),
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(248, 244, 255, 0.88)',
    textAlign: 'center',
    marginBottom: 6,
    fontStyle: 'italic',
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  stage: {
    minHeight: CLOUD_CLUSTER_H + 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'visible',
    zIndex: 1,
    paddingTop: 8,
    paddingBottom: 12,
  },
  cloudCluster: {
    width: CLOUD_CLUSTER_W,
    height: CLOUD_CLUSTER_H,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 10,
    overflow: 'visible',
    zIndex: 2,
  },
  cloudWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  cloudTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cloudLabel: {
    position: 'absolute',
    bottom: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#F8F4FF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  diarySection: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      web: { backdropFilter: 'blur(14px)' },
    }),
  },
  diaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8F4FF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 14,
    paddingBottom: 4,
  },
  openingPrompt: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 236, 246, 0.88)',
    textAlign: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
    ...SANCTUARY_ZEN,
  },
  inspirationBlock: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  inspirationPillLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255, 244, 250, 0.95)',
    letterSpacing: 0.2,
  },
  shuffleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  shuffleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 244, 250, 0.92)',
  },
  inspirationList: {
    gap: 8,
  },
  inspirationChip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 200, 240, 0.28)',
  },
  inspirationChipActive: {
    backgroundColor: 'rgba(232, 223, 245, 0.28)',
    borderColor: 'rgba(196, 168, 216, 0.7)',
  },
  inspirationChipText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(245, 238, 255, 0.88)',
    ...SANCTUARY_ZEN,
  },
  inspirationChipTextActive: {
    color: '#FFF9FC',
    fontWeight: '600',
  },
  inspirationChipPremium: {
    borderColor: 'rgba(212, 184, 150, 0.55)',
    backgroundColor: 'rgba(212, 184, 150, 0.12)',
  },
  inspirationChipLocked: {
    borderColor: 'rgba(196, 168, 216, 0.35)',
    backgroundColor: 'rgba(40, 32, 55, 0.45)',
    opacity: 0.9,
  },
  inspirationChipLockedText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(220, 210, 235, 0.72)',
    fontStyle: 'italic',
    ...SANCTUARY_ZEN,
  },
  oracleRecommendCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 168, 216, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(232, 214, 255, 0.45)',
  },
  oracleRecommendEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(232, 214, 255, 0.9)',
    marginBottom: 6,
  },
  oracleRecommendTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF9FC',
    marginBottom: 6,
  },
  oracleRecommendBody: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(245, 238, 255, 0.88)',
    marginBottom: 10,
    ...SANCTUARY_ZEN,
  },
  oracleRecommendCta: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E8D6FF',
  },
  diaryInput: {
    minHeight: 140,
    maxHeight: 200,
    fontSize: 16,
    color: '#FFF9FC',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    ...SANCTUARY_ZEN,
  },
  diaryInputReleasing: {
    opacity: 0,
  },
  releaseStage: {
    position: 'relative',
    minHeight: 140,
  },
  releaseBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(233, 168, 137, 0.88)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  releaseBtnDisabled: {
    opacity: 0.55,
  },
  releaseBtnText: {
    color: '#FFF8F4',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resetLink: {
    marginBottom: 12,
    alignItems: 'center',
  },
  resetLinkText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  timelineSection: {
    marginTop: 8,
    paddingHorizontal: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  trackerCard: {
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  trackerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 248, 252, 0.94)',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  trackerHint: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(230, 220, 240, 0.62)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  trackerDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 12,
  },
  trackerDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  trackerDayToday: {
    borderWidth: 1,
    borderColor: 'rgba(233, 184, 212, 0.55)',
    backgroundColor: 'rgba(233, 184, 212, 0.12)',
  },
  trackerDayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(233, 184, 212, 0.9)',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  trackerDayMood: {
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    minHeight: 26,
  },
  trackerDayCount: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  trackerCountWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  trackerCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 252, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  trackerCountText: {
    fontSize: 11,
    color: 'rgba(255, 248, 244, 0.88)',
  },
  trackerDominant: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(233, 184, 212, 0.92)',
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 248, 252, 0.92)',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  timelineHint: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(230, 220, 240, 0.62)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineRail: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(233, 184, 212, 0.9)',
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 4,
    minHeight: 24,
  },
  timelineCard: {
    flex: 1,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timelineCardExpanded: {
    borderColor: 'rgba(233, 184, 212, 0.45)',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  timelineLockedHint: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  timelineMeta: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(233, 184, 212, 0.95)',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  timelineBody: {
    ...SANCTUARY_ZEN,
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.94)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  friendNoteWrap: {
    marginTop: 4,
  },
  friendNoteLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(233, 184, 212, 0.88)',
    marginBottom: 8,
  },
  friendNoteBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 252, 248, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 96,
  },
  friendNoteBody: {
    ...SANCTUARY_ZEN,
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255, 248, 244, 0.94)',
    fontStyle: 'italic',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  privacyIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  privacyCopy: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8F4FF',
    letterSpacing: 0.3,
  },
  privacyBody: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 3,
    fontStyle: 'italic',
  },
});
