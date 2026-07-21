import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  CALM_BLUSH_TRACK,
  CALM_INK,
  CALM_MAUVE,
  CALM_SERIF,
} from './calmLoungeTheme';
import RegistryRewardModal from './RegistryRewardModal';
import VillageSpokenModal from './VillageSpokenModal';
import {
  getNextUnseenResolvedPoll,
  markVillagePollSeenByPregnant,
  submitVillagePollQuestion,
  subscribeVillagePolls,
} from './villagePollBridge';
import { VILLAGE_SNAPPY_REANIMATED } from './villageScreenTransitions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Matches App.js scrollContent horizontal padding so the pager can break out full-bleed. */
const PARENT_H_PAD = 20;
const PAGE_INNER_PAD = 24;
const GLASS_PAD = 18;

const PROGRESS_STEP = 0.22;
const LINEN = '#FDFBF7';
const BLUSH = '#FCEEEB';

const GLASS_SURFACE = 'rgba(255, 255, 255, 0.28)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.4)';

const REGISTRY_EXTERNAL_LINKS = [
  {
    id: 'amazon',
    label: 'Amazon Registry',
    shortLabel: 'Amazon',
    emoji: '📦',
    url: 'https://www.amazon.com/baby-reg/homepage',
  },
  {
    id: 'target',
    label: 'Target Registry',
    shortLabel: 'Target',
    emoji: '🎯',
    url: 'https://www.target.com/gift-registry/baby-registry',
  },
  {
    id: 'babylist',
    label: 'Babylist',
    shortLabel: 'Babylist',
    emoji: '🍼',
    url: 'https://www.babylist.com/',
  },
];

const LOUNGE_PAGES = [
  {
    id: 'baby',
    title: 'Baby Registry',
    eyebrow: 'Nesting essentials',
    body: 'Cribs, carriers, onesies, and the little luxuries that make the fourth trimester softer.',
    ctaIdle: 'Add to baby registry →',
    ctaComplete: 'Registry complete ✨',
    initialProgress: 0.35,
  },
  {
    id: 'mama',
    title: "Mama's Lounge",
    eyebrow: 'Postpartum recovery',
    body: 'Peri bottles, soft loungewear, nourishing teas, and slow-morning rituals just for you.',
    ctaIdle: 'Add to my lounge →',
    ctaComplete: 'Lounge complete ✨',
    initialProgress: 0.28,
  },
];

const QUOTE_TRACK_WIDTH =
  SCREEN_WIDTH - PAGE_INNER_PAD * 2 - GLASS_PAD * 2;

function FrostedGlass({ children, style }) {
  return (
    <View style={[styles.glassShell, style]}>
      {children}
    </View>
  );
}

function RegistryLinkButton({ link, onPress }) {
  return (
    <TouchableOpacity
      style={styles.linkItem}
      onPress={onPress}
      activeOpacity={0.86}
      accessibilityRole="link"
      accessibilityLabel={`Open ${link.label}`}
    >
      <View style={styles.linkCircle}>
        <Text style={styles.linkCircleEmoji}>{link.emoji}</Text>
      </View>
      <Text style={styles.linkCircleLabel}>{link.shortLabel}</Text>
    </TouchableOpacity>
  );
}

function LoungeProgressBar({ progress, trackWidth, onLayout }) {
  const progressAnim = useSharedValue(progress);

  useEffect(() => {
    progressAnim.value = withSpring(progress, VILLAGE_SNAPPY_REANIMATED);
  }, [progress, progressAnim]);

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, trackWidth * progressAnim.value),
  }));

  return (
    <View style={styles.progressTrack} onLayout={onLayout}>
      <Animated.View style={[styles.progressFillWrap, fillStyle]}>
        <LinearGradient
          colors={[CALM_MAUVE, '#D4B5C4']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.progressFill}
        />
      </Animated.View>
    </View>
  );
}

function VillageAskGlass({ draftItem, onChangeDraft, onAsk }) {
  return (
    <FrostedGlass style={styles.askGlass}>
      <Text style={[styles.glassTitle, CALM_SERIF]}>Ask the Village</Text>
      <Text style={styles.glassSubtitle}>
        Wondering if you really need something? Let the mamas decide.
      </Text>
      <TextInput
        style={styles.askInput}
        placeholder="Type an item you need advice on (e.g., Wipe Warmer)..."
        placeholderTextColor="rgba(74, 62, 61, 0.38)"
        value={draftItem}
        onChangeText={onChangeDraft}
        returnKeyType="done"
        maxLength={64}
      />
      <TouchableOpacity
        style={[styles.askBtn, !draftItem.trim() && styles.askBtnDisabled]}
        onPress={onAsk}
        disabled={!draftItem.trim()}
        activeOpacity={0.9}
      >
        <Text style={styles.askBtnText}>Ask the Village</Text>
      </TouchableOpacity>
    </FrostedGlass>
  );
}

function CommunityVoiceGlass({ activePoll, resolvedPoll }) {
  const quoteScrollRef = useRef(null);
  const [quotePage, setQuotePage] = useState(0);

  const displayPoll = activePoll || resolvedPoll;
  const isResolved = Boolean(displayPoll && displayPoll.status === 'resolved');
  const neededPct = isResolved ? displayPoll.neededPct : 0;
  const skipPct = isResolved ? displayPoll.skipPct : 0;
  const tips = isResolved && displayPoll.tips?.length
    ? displayPoll.tips
    : [];

  const handleQuoteScrollEnd = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / QUOTE_TRACK_WIDTH);
    setQuotePage(Math.min(tips.length - 1, Math.max(0, page)));
  }, [tips.length]);

  useEffect(() => {
    setQuotePage(0);
  }, [displayPoll?.id]);

  return (
    <FrostedGlass style={styles.voiceGlass}>
      <Text style={[styles.glassTitle, CALM_SERIF]}>💬 Community Voice</Text>

      {!displayPoll ? (
        <Text style={styles.voiceEmpty}>
          Ask the village above — postpartum mamas will share honest wisdom here.
        </Text>
      ) : (
        <>
          <Text style={styles.voiceQuestion}>
            {isResolved
              ? `Do I really need a ${displayPoll.item}?`
              : `The village is weighing in on your ${displayPoll.item}…`}
          </Text>

          <View style={styles.voteBarRow}>
            <Text style={styles.voteBarLabel}>Needed</Text>
            <Text style={styles.voteBarPct}>
              {isResolved ? `${neededPct}%` : '—'}
            </Text>
          </View>
          <View style={styles.voteBarTrack}>
            {isResolved ? (
              <View style={[styles.voteBarFillNeeded, { width: `${neededPct}%` }]} />
            ) : (
              <View style={styles.voteBarPulse} />
            )}
          </View>

          <View style={[styles.voteBarRow, styles.voteBarRowSpaced]}>
            <Text style={styles.voteBarLabel}>Skip It</Text>
            <Text style={styles.voteBarPct}>
              {isResolved ? `${skipPct}%` : '—'}
            </Text>
          </View>
          <View style={styles.voteBarTrack}>
            {isResolved ? (
              <View style={[styles.voteBarFillSkip, { width: `${skipPct}%` }]} />
            ) : (
              <View style={styles.voteBarPulse} />
            )}
          </View>

          {isResolved && tips.length > 0 ? (
            <>
              <ScrollView
                ref={quoteScrollRef}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                bounces={true}
                nestedScrollEnabled={true}
                decelerationRate="fast"
                onMomentumScrollEnd={handleQuoteScrollEnd}
                scrollEventThrottle={16}
                style={styles.quotePager}
                contentContainerStyle={styles.quotePagerContent}
              >
                {tips.map((tip) => (
                  <View key={tip.id} style={[styles.quotePage, { width: QUOTE_TRACK_WIDTH }]}>
                    <Text style={[styles.quoteText, CALM_SERIF]}>&ldquo;{tip.text}&rdquo;</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.quoteDots}>
                {tips.map((tip, index) => (
                  <Text
                    key={tip.id}
                    style={[styles.quoteDot, index === quotePage && styles.quoteDotActive]}
                  >
                    {index === quotePage ? '•' : '◦'}
                  </Text>
                ))}
              </View>
            </>
          ) : !isResolved ? (
            <Text style={styles.voiceWaiting}>
              Postpartum mamas in The Midnight Lounge are sharing their honest takes now.
            </Text>
          ) : null}
        </>
      )}
    </FrostedGlass>
  );
}

function LoungePage({
  page,
  progress,
  onAdvance,
  onOpenLink,
  showVillagePanels,
  askProps,
  activePoll,
  resolvedPoll,
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const percent = Math.round(progress * 100);
  const isComplete = progress >= 1;

  return (
    <View style={styles.pageShell}>
      <View style={styles.pageInner}>
        {showVillagePanels ? (
          <>
            <VillageAskGlass {...askProps} />
            <CommunityVoiceGlass activePoll={activePoll} resolvedPoll={resolvedPoll} />
          </>
        ) : null}

        <View style={styles.pageHeaderRow}>
          <View style={styles.pageTitleCol}>
            <Text style={styles.pageEyebrow}>{page.eyebrow}</Text>
            <Text style={[styles.pageTitle, CALM_SERIF]}>{page.title}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{percent}%</Text>
          </View>
        </View>

        <LoungeProgressBar
          progress={progress}
          trackWidth={trackWidth}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        />

        <Text style={styles.pageBody}>{page.body}</Text>

        <View style={styles.registryLinksSection}>
          <Text style={styles.registryLinksEyebrow}>Universal registry sync</Text>
          <View style={styles.registryLinksRow}>
            {REGISTRY_EXTERNAL_LINKS.map((link) => (
              <RegistryLinkButton
                key={link.id}
                link={link}
                onPress={() => onOpenLink(link.url)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.ctaBtn, isComplete && styles.ctaBtnComplete]}
          onPress={onAdvance}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>
            {isComplete ? page.ctaComplete : page.ctaIdle}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RegistryLounge() {
  const scrollRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [babyProgress, setBabyProgress] = useState(LOUNGE_PAGES[0].initialProgress);
  const [mamaProgress, setMamaProgress] = useState(LOUNGE_PAGES[1].initialProgress);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [spokenModalVisible, setSpokenModalVisible] = useState(false);
  const [resultPoll, setResultPoll] = useState(null);
  const [draftItem, setDraftItem] = useState('');
  const [pendingPolls, setPendingPolls] = useState([]);
  const [resolvedPolls, setResolvedPolls] = useState([]);

  const progressByPage = [babyProgress, mamaProgress];
  const activePoll = pendingPolls[0] || null;
  const latestResolvedPoll = resolvedPolls[0] || null;

  const handleAskVillage = useCallback(() => {
    const result = submitVillagePollQuestion(draftItem);
    if (!result?.ok) return;
    setDraftItem('');
  }, [draftItem]);

  const askProps = {
    draftItem,
    onChangeDraft: setDraftItem,
    onAsk: handleAskVillage,
  };

  const showNextResolvedPoll = useCallback(() => {
    const poll = getNextUnseenResolvedPoll();
    if (!poll) return;
    setResultPoll(poll);
    setSpokenModalVisible(true);
    markVillagePollSeenByPregnant(poll.id);
  }, []);

  useEffect(() => {
    return subscribeVillagePolls((snapshot) => {
      setPendingPolls(snapshot.open);
      setResolvedPolls(snapshot.resolved);
      const unseen = snapshot.resolved.find((poll) => !poll.seenByPregnant);
      if (unseen) {
        setResultPoll(unseen);
        setSpokenModalVisible(true);
        markVillagePollSeenByPregnant(unseen.id);
      }
    });
  }, []);

  const openRewardModal = useCallback(() => {
    setTimeout(() => setRewardModalVisible(true), 320);
  }, []);

  const bumpProgress = useCallback(
    (pageIndex) => {
      const setter = pageIndex === 0 ? setBabyProgress : setMamaProgress;
      setter((prev) => {
        if (prev >= 1) {
          setRewardModalVisible(true);
          return prev;
        }
        const next = Math.min(1, prev + PROGRESS_STEP);
        if (next >= 1) {
          openRewardModal();
        }
        return next;
      });
    },
    [openRewardModal],
  );

  const openRegistryLink = useCallback((url) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const handleMomentumScrollEnd = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActivePage(Math.min(LOUNGE_PAGES.length - 1, Math.max(0, page)));
  }, []);

  const closeSpokenModal = useCallback(() => {
    setSpokenModalVisible(false);
    setTimeout(showNextResolvedPoll, 400);
  }, [showNextResolvedPoll]);

  return (
    <>
      <LinearGradient
        colors={[LINEN, BLUSH]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.canvas}
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.loungeTitle, CALM_SERIF]}>The Registry Lounge</Text>
          <View style={styles.paginationRow}>
            {LOUNGE_PAGES.map((page, index) => (
              <Text
                key={page.id}
                style={[styles.paginationDot, index === activePage && styles.paginationDotActive]}
              >
                {index === activePage ? '•' : '◦'}
              </Text>
            ))}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          bounces={true}
          decelerationRate="fast"
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          style={styles.pager}
          contentContainerStyle={styles.pagerContent}
        >
          {LOUNGE_PAGES.map((page, index) => (
            <LoungePage
              key={page.id}
              page={page}
              progress={progressByPage[index]}
              onAdvance={() => bumpProgress(index)}
              onOpenLink={openRegistryLink}
              showVillagePanels={index === 0}
              askProps={askProps}
              activePoll={activePoll}
              resolvedPoll={latestResolvedPoll}
            />
          ))}
        </ScrollView>
      </LinearGradient>

      <VillageSpokenModal
        visible={spokenModalVisible}
        poll={resultPoll}
        onClose={closeSpokenModal}
      />
      <RegistryRewardModal visible={rewardModalVisible} onClose={() => setRewardModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 28,
  },
  headerBlock: {
    paddingHorizontal: PAGE_INNER_PAD,
    marginBottom: 20,
  },
  loungeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: CALM_INK,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  paginationDot: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(199, 162, 179, 0.35)',
    lineHeight: 18,
  },
  paginationDotActive: {
    color: CALM_MAUVE,
    fontWeight: '800',
  },
  pager: {
    width: SCREEN_WIDTH,
    marginLeft: -PARENT_H_PAD,
  },
  pagerContent: {
    alignItems: 'flex-start',
  },
  pageShell: {
    width: SCREEN_WIDTH,
  },
  pageInner: {
    paddingHorizontal: PAGE_INNER_PAD,
    paddingTop: 4,
    paddingBottom: 12,
  },
  glassShell: {
    backgroundColor: GLASS_SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: GLASS_PAD,
    marginBottom: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 32px rgba(199, 162, 179, 0.1)',
      },
      default: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 2,
      },
    }),
  },
  askGlass: {
    marginBottom: 14,
  },
  voiceGlass: {
    marginBottom: 24,
  },
  glassTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CALM_INK,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  glassSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(74, 62, 61, 0.62)',
    marginBottom: 14,
  },
  askInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 99,
    paddingVertical: 16,
    paddingHorizontal: 22,
    fontSize: 14,
    lineHeight: 20,
    color: CALM_INK,
    fontWeight: '500',
    marginBottom: 14,
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  askBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderRadius: 99,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  askBtnDisabled: {
    opacity: 0.45,
  },
  askBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: CALM_INK,
    letterSpacing: 0.2,
  },
  voiceEmpty: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: 'rgba(74, 62, 61, 0.62)',
    fontStyle: 'italic',
  },
  voiceQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: CALM_INK,
    lineHeight: 20,
    marginBottom: 16,
  },
  voteBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  voteBarRowSpaced: {
    marginTop: 10,
  },
  voteBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(74, 62, 61, 0.72)',
  },
  voteBarPct: {
    fontSize: 12,
    fontWeight: '800',
    color: CALM_INK,
  },
  voteBarTrack: {
    height: 7,
    borderRadius: 99,
    backgroundColor: CALM_BLUSH_TRACK,
    overflow: 'hidden',
    marginBottom: 2,
  },
  voteBarFillNeeded: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: CALM_MAUVE,
  },
  voteBarFillSkip: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: 'rgba(199, 162, 179, 0.45)',
  },
  voteBarPulse: {
    width: '38%',
    height: '100%',
    borderRadius: 99,
    backgroundColor: 'rgba(199, 162, 179, 0.22)',
  },
  voiceWaiting: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(74, 62, 61, 0.58)',
    fontStyle: 'italic',
  },
  quotePager: {
    marginTop: 16,
    width: QUOTE_TRACK_WIDTH,
  },
  quotePagerContent: {
    alignItems: 'flex-start',
  },
  quotePage: {
    justifyContent: 'center',
    minHeight: 72,
    paddingRight: 8,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: CALM_INK,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  quoteDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  quoteDot: {
    fontSize: 13,
    color: 'rgba(199, 162, 179, 0.35)',
    fontWeight: '600',
  },
  quoteDotActive: {
    color: CALM_MAUVE,
    fontWeight: '800',
  },
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  pageTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  pageEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: CALM_MAUVE,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CALM_INK,
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: CALM_MAUVE,
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: CALM_BLUSH_TRACK,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFillWrap: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 99,
  },
  progressFill: {
    flex: 1,
    height: '100%',
    borderRadius: 99,
  },
  pageBody: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(74, 62, 61, 0.72)',
    fontWeight: '500',
    marginBottom: 28,
  },
  registryLinksSection: {
    marginBottom: 28,
  },
  registryLinksEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: 'rgba(199, 162, 179, 0.85)',
    marginBottom: 16,
    textAlign: 'center',
  },
  registryLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  linkItem: {
    alignItems: 'center',
    minWidth: 72,
  },
  linkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      web: { boxShadow: '0 6px 18px rgba(199, 162, 179, 0.1)' },
      default: {
        shadowColor: CALM_MAUVE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  linkCircleEmoji: {
    fontSize: 22,
  },
  linkCircleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: CALM_INK,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  ctaBtn: {
    backgroundColor: CALM_INK,
    borderRadius: 99,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 28px rgba(74, 62, 61, 0.14)' },
      default: {
        shadowColor: CALM_INK,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  ctaBtnComplete: {
    backgroundColor: CALM_MAUVE,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFCF8',
    letterSpacing: 0.2,
  },
});
