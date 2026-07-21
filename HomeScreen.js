import React, { useCallback, useEffect, useRef, useState, useMemo, lazy, Suspense, memo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CALM_MAUVE, CALM_SERIF } from './calmLoungeTheme';
import {
  SNAPPY_SPRING,
  safeAssignSequence,
  safeAssignSpring,
  safeAssignTiming,
} from './reanimatedSafe';
import { runNativeGuard } from './nativeRuntimeGuard';
import NameOracleGame from './NameOracleGame';
import MamaDailyWordSearch from './MamaDailyWordSearch';
import BabyTriviaCard from './BabyTriviaCard';
import BotanicalGardenFrame from './BotanicalGardenFrame';
import RegistryVillageAskPanel from './RegistryVillageAskPanel';
import { injectNurseryWebFonts, mamaCardScriptTitle } from './nurseryRetroFonts';
import {
  PREGNANT_HOME_LAYOUT,
  PREGNANT_HOME_LAYOUT_LOCKED,
  PREGNANT_HOME_LOUNGE_PAGES,
} from './pregnantHomeLayoutConfig';
import {
  PREGNANT_HOME_CROSSWORD_LEVELS,
  crosswordCellSize,
  getCrosswordLevel,
} from './pregnantCrosswordConfig';

/** PREGNANT MAMA HOME — layout locked. User must say "UNLOCK LAYOUT" before structural edits. */

const RegistryRewardModal = lazy(() => import('./RegistryRewardModal'));

const PARENT_H_PAD = PREGNANT_HOME_LAYOUT.parentHorizontalPad;
const FALLBACK_PAGE_WIDTH =
  Platform.OS === 'web' ? 295 : Dimensions.get('window').width - PARENT_H_PAD * 2;
const LINK_PROGRESS_BUMP = 0.15;

const INK = '#000000';
const CELL_BLOCK = 'rgba(255, 255, 255, 0.2)';
const BOTANICAL_GREEN = '#5C7A68';
const BOTANICAL_PEACH = '#E9A889';

function cellKey(row, col) {
  return `${row}-${col}`;
}

function readWordFromGrid(puzzle, entries, word) {
  const letters = [];
  for (let i = 0; i < word.answer.length; i += 1) {
    const row = word.direction === 'across' ? word.row : word.row + i;
    const col = word.direction === 'across' ? word.col + i : word.col;
    const value = (entries[cellKey(row, col)] || '').trim().toUpperCase();
    if (!value) return null;
    letters.push(value);
  }
  return letters.join('');
}

function isWordSolved(puzzle, entries, word) {
  const attempt = readWordFromGrid(puzzle, entries, word);
  return attempt !== null && attempt === word.answer;
}

const CROSSWORD_MAX_HINTS = 3;

const CrosswordClueLine = memo(function CrosswordClueLine({ word, solved, hinted }) {
  const arrow = word.direction === 'across' ? '→' : '↓';
  return (
    <View style={styles.clueRow}>
      <Text style={[styles.clueArrow, solved && styles.clueSolved]}>{arrow}</Text>
      <Text style={[styles.clueText, solved && styles.clueSolved]}>
        {hinted && !solved ? `Starts with “${word.answer[0]}” · ` : ''}
        {word.clue}
        {solved ? ' ✓' : ''}
      </Text>
    </View>
  );
});

const DailyMiniCrossword = memo(function DailyMiniCrossword() {
  const [levelIndex, setLevelIndex] = useState(0);
  const dailyCrossword = useMemo(() => getCrosswordLevel(levelIndex), [levelIndex]);
  const { today, level, puzzle } = dailyCrossword;

  const [entries, setEntries] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [hintedWordIds, setHintedWordIds] = useState(() => new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const successScale = useSharedValue(0.85);
  const successOpacity = useSharedValue(0);
  const prevSolvedRef = useRef(0);

  const solvedFlags = useMemo(
    () => puzzle.words.map((word) => isWordSolved(puzzle, entries, word)),
    [puzzle, entries],
  );

  const solvedCount = useMemo(
    () => solvedFlags.filter(Boolean).length,
    [solvedFlags],
  );

  const allSolved = solvedCount === puzzle.words.length;

  useEffect(() => {
    setEntries({});
    setShowSuccess(false);
    setHintedWordIds(new Set());
    setHintsUsed(0);
    successOpacity.value = 0;
    successScale.value = 0.85;
    prevSolvedRef.current = 0;
  }, [puzzle.id, successOpacity, successScale]);

  useEffect(() => {
    if (allSolved && prevSolvedRef.current < puzzle.words.length) {
      setShowSuccess(true);
      runNativeGuard('crossword:successReveal', () => {
        safeAssignTiming(successOpacity, 1, { duration: 280 }, 'crossword:successOpacity');
        safeAssignSequence(
          successScale,
          [withSpring(1.06, SNAPPY_SPRING), withSpring(1, SNAPPY_SPRING)],
          'crossword:successScale',
        );
      });
    }
    if (!allSolved) {
      setShowSuccess(false);
      runNativeGuard('crossword:successReset', () => {
        successOpacity.value = 0;
        successScale.value = 0.85;
      });
    }
    prevSolvedRef.current = solvedCount;
  }, [allSolved, solvedCount, puzzle.words.length, successOpacity, successScale]);

  const successBannerStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successScale.value }],
  }));

  const handleCellChange = useCallback((row, col, value) => {
    const letter = value.replace(/[^a-zA-Z]/g, '').slice(-1).toUpperCase();
    setEntries((prev) => {
      const key = cellKey(row, col);
      if (!letter) {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: letter };
    });
  }, []);

  const cellSize = crosswordCellSize(puzzle.size);

  const handleLevelChange = useCallback((nextIndex) => {
    setLevelIndex(nextIndex);
  }, []);

  const hintsRemaining = CROSSWORD_MAX_HINTS - hintsUsed;

  const handleHintPress = useCallback(() => {
    if (hintsRemaining <= 0 || allSolved) return;

    const unsolved = puzzle.words.filter(
      (word) => !isWordSolved(puzzle, entries, word) && !hintedWordIds.has(word.id),
    );
    const pool = unsolved.length > 0 ? unsolved : puzzle.words.filter((word) => !isWordSolved(puzzle, entries, word));
    if (!pool.length) return;

    const target = pool[Math.floor(Math.random() * pool.length)];
    const firstRow = target.row;
    const firstCol = target.col;
    const letter = target.answer[0];

    setEntries((prev) => ({ ...prev, [cellKey(firstRow, firstCol)]: letter }));
    setHintedWordIds((prev) => {
      const next = new Set(prev);
      next.add(target.id);
      return next;
    });
    setHintsUsed((prev) => prev + 1);
  }, [allSolved, entries, hintsRemaining, hintedWordIds, puzzle]);

  return (
    <BotanicalGardenFrame
      lushSides
      topColor={CALM_MAUVE}
      bottomColor={BOTANICAL_PEACH}
      sideColor={BOTANICAL_GREEN}
    >
      <FrostedGlassCard style={styles.crosswordCard}>
        <Text style={[styles.crosswordScriptTitle, mamaCardScriptTitle]}>
          Mama&apos;s Daily Crossword
        </Text>
        <Text style={[styles.crosswordEyebrow, CALM_SERIF]}>DAILY MINI · {today}</Text>

        <View style={styles.crosswordLevelRow}>
          {PREGNANT_HOME_CROSSWORD_LEVELS.map((entry, index) => {
            const active = levelIndex === index;
            return (
              <TouchableOpacity
                key={entry.id}
                style={[styles.crosswordLevelChip, active && styles.crosswordLevelChipActive]}
                onPress={() => handleLevelChange(index)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={entry.label}
              >
                <Text style={[styles.crosswordLevelChipText, active && styles.crosswordLevelChipTextActive]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.crosswordLevelLabel}>{level.label}</Text>

        <Text style={[styles.crosswordTheme, CALM_SERIF]}>{puzzle.theme}</Text>
      <Text style={[styles.crosswordSubtitle, CALM_SERIF]}>
        {puzzle.words.length} mama words refresh every morning — type gently.
      </Text>

      <View style={[styles.crosswordGrid, { width: cellSize * puzzle.size + (puzzle.size - 1) * 4 }]}>
        {puzzle.grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.crosswordGridRow}>
            {row.map((solution, colIndex) => {
              if (solution === null) {
                return (
                  <View
                    key={cellKey(rowIndex, colIndex)}
                    style={[styles.crosswordBlock, { width: cellSize, height: cellSize }]}
                  />
                );
              }

              const key = cellKey(rowIndex, colIndex);
              const filled = entries[key] || '';
              const isCorrect = filled && filled === solution;

              return (
                <TextInput
                  key={key}
                  style={[
                    styles.crosswordCell,
                    { width: cellSize, height: cellSize },
                    isCorrect && styles.crosswordCellCorrect,
                  ]}
                  value={filled}
                  onChangeText={(text) => handleCellChange(rowIndex, colIndex, text)}
                  maxLength={1}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  textAlign="center"
                  keyboardType="default"
                  returnKeyType="next"
                  selectTextOnFocus
                  {...Platform.select({ web: { outlineStyle: 'none' }, default: {} })}
                />
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.crosswordProgress, CALM_SERIF]}>
        {solvedCount}/{puzzle.words.length} Solved
      </Text>

      {hintsRemaining > 0 && !allSolved ? (
        <TouchableOpacity
          style={styles.crosswordHintButton}
          onPress={handleHintPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Reveal a hint. ${hintsRemaining} hints remaining.`}
        >
          <Text style={[styles.crosswordHintButtonText, CALM_SERIF]}>
            ✨ Hint ({hintsRemaining} left)
          </Text>
        </TouchableOpacity>
      ) : null}

      {showSuccess ? (
        <Animated.View style={[styles.crosswordSuccessBanner, successBannerStyle]}>
          <Text style={[styles.crosswordSuccessText, CALM_SERIF]}>✨ Splendid work, Mama!</Text>
        </Animated.View>
      ) : null}

      <View style={styles.cluesSection}>
        <Text style={[styles.cluesHeading, CALM_SERIF]}>Across</Text>
        {puzzle.words
          .filter((word) => word.direction === 'across')
          .map((word, index) => (
            <CrosswordClueLine
              key={word.id}
              word={word}
              solved={solvedFlags[puzzle.words.indexOf(word)]}
              hinted={hintedWordIds.has(word.id)}
            />
          ))}

        <Text style={[styles.cluesHeading, styles.cluesHeadingDown, CALM_SERIF]}>Down</Text>
        {puzzle.words
          .filter((word) => word.direction === 'down')
          .map((word) => (
            <CrosswordClueLine
              key={word.id}
              word={word}
              solved={solvedFlags[puzzle.words.indexOf(word)]}
              hinted={hintedWordIds.has(word.id)}
            />
          ))}
      </View>
    </FrostedGlassCard>
    </BotanicalGardenFrame>
  );
});

const SanctuaryCanvas = memo(function SanctuaryCanvas({ children }) {
  return (
    <View style={styles.fullscreenContainer}>
      {/*
        Ombre lives only in VillageOmbreBackdrop.js (app root).
        Keep this screen transparent — do not add a local backdrop here.
      */}
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
});

const FROSTED_GLASS = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.35)',
  padding: 16,
};

const REGISTRY_EXTERNAL_LINKS = [
  { id: 'amazon', label: 'Amazon Registry', shortLabel: 'Amazon', emoji: '📦', url: 'https://www.amazon.com/baby-reg/homepage' },
  { id: 'target', label: 'Target Registry', shortLabel: 'Target', emoji: '🎯', url: 'https://www.target.com/gift-registry/baby-registry' },
  { id: 'babylist', label: 'Babylist', shortLabel: 'Babylist', emoji: '🍼', url: 'https://www.babylist.com/' },
];

const LOUNGE_PAGES = PREGNANT_HOME_LOUNGE_PAGES;

function ModalFallback() {
  return null;
}

const RegistryLinkButton = memo(
  function RegistryLinkButton({ link, onPress }) {
    return (
      <TouchableOpacity
        style={styles.registryLinkBtn}
        onPress={onPress}
        activeOpacity={0.86}
        accessibilityRole="link"
        accessibilityLabel={`Open ${link.label}`}
      >
        <Text style={styles.registryLinkEmoji}>{link.emoji}</Text>
        <Text style={styles.registryLinkLabel}>{link.shortLabel}</Text>
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.link.id === next.link.id && prev.onPress === next.onPress,
);

const LoungeProgressBar = memo(function LoungeProgressBar({ progress }) {
  const progressAnim = useSharedValue(progress);
  const trackWidthSv = useSharedValue(Math.max(1, FALLBACK_PAGE_WIDTH - 32));

  useEffect(() => {
    safeAssignSpring(progressAnim, progress, SNAPPY_SPRING, 'registry:progressSpring');
  }, [progress, progressAnim]);

  const handleLayout = useCallback((e) => {
    const next = e.nativeEvent.layout.width;
    if (next > 0 && Math.abs(trackWidthSv.value - next) > 1) {
      trackWidthSv.value = next;
    }
  }, [trackWidthSv]);

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, trackWidthSv.value * progressAnim.value),
  }));

  return (
    <View
      style={{ height: 8, borderRadius: 99, backgroundColor: 'rgba(255, 255, 255, 0.15)', overflow: 'hidden', marginBottom: 20 }}
      onLayout={handleLayout}
    >
      <Animated.View style={[{ height: '100%', overflow: 'hidden', borderRadius: 99 }, fillStyle]}>
        <LinearGradient
          colors={[CALM_MAUVE, '#D4B5C4']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, height: '100%', borderRadius: 99 }}
        />
      </Animated.View>
    </View>
  );
});

const FrostedGlassCard = memo(function FrostedGlassCard({ children, style }) {
  return <View style={[FROSTED_GLASS, style]}>{children}</View>;
});

const BabyRegistryTrackerFrame = memo(
  function BabyRegistryTrackerFrame({ title, progress, onRegistryLinkPress }) {
    return (
      <BotanicalGardenFrame
        topColor={BOTANICAL_GREEN}
        bottomColor={BOTANICAL_PEACH}
        sideColor={BOTANICAL_GREEN}
      >
        <View style={styles.registryGlassCard}>
          <RegistryTrackingBox
            title={title}
            progress={progress}
            onRegistryLinkPress={onRegistryLinkPress}
          />
        </View>
      </BotanicalGardenFrame>
    );
  },
  (prev, next) =>
    prev.title === next.title &&
    prev.progress === next.progress &&
    prev.onRegistryLinkPress === next.onRegistryLinkPress,
);

const RegistryTrackingBox = memo(
  function RegistryTrackingBox({ title, progress, onRegistryLinkPress }) {
    const percent = Math.round(progress * 100);

    return (
      <>
        <View style={styles.registryHeaderBlock}>
          <Text style={[styles.registryScriptTitle, mamaCardScriptTitle]}>{title}</Text>
          <View style={styles.registryPercentPill}>
            <Text style={styles.registryPercentText}>{percent}%</Text>
          </View>
        </View>

        <LoungeProgressBar progress={progress} />

        <Text style={styles.registrySyncLabel}>Universal registry sync</Text>
        <View style={styles.registryLinksRow}>
          {REGISTRY_EXTERNAL_LINKS.map((link) => (
            <RegistryLinkButton
              key={link.id}
              link={link}
              onPress={() => onRegistryLinkPress(link.url)}
            />
          ))}
        </View>

        <RegistryVillageAskPanel />
      </>
    );
  },
  (prev, next) =>
    prev.title === next.title &&
    prev.progress === next.progress &&
    prev.onRegistryLinkPress === next.onRegistryLinkPress,
);

const LoungePage = memo(
  function LoungePage({
    pageId,
    title,
    progress,
    pageIndex,
    pageWidth,
    onRegistryLinkPress,
    onWordSearchDragChange,
  }) {
    const handleLinkPress = useCallback(
      (url) => onRegistryLinkPress(url, pageIndex),
      [onRegistryLinkPress, pageIndex],
    );

    if (pageId === 'word-search') {
      return (
        <View style={[styles.loungePage, styles.wordSearchPage, { width: pageWidth }]} nativeID="daily-word-search-box">
          <MamaDailyWordSearch
            contentWidth={pageWidth}
            onDragStateChange={onWordSearchDragChange}
          />
        </View>
      );
    }

    if (pageId === 'crossword') {
      return (
        <View style={[styles.loungePage, { width: pageWidth }]} nativeID="daily-crossword-box">
          <DailyMiniCrossword />
        </View>
      );
    }

    return (
      <View style={[styles.loungePage, { width: pageWidth }]}>
        <View style={styles.homeDomainBlock} nativeID="baby-registry-box">
          <BabyRegistryTrackerFrame
            title={title}
            progress={progress}
            onRegistryLinkPress={handleLinkPress}
          />
        </View>
        <View style={[styles.homeDomainBlock, styles.registryOracleGap]} nativeID="name-oracle-box">
          <BotanicalGardenFrame
            topColor={BOTANICAL_GREEN}
            bottomColor={BOTANICAL_PEACH}
            sideColor={BOTANICAL_GREEN}
          >
            <NameOracleGame />
          </BotanicalGardenFrame>
        </View>
        <View style={[styles.homeDomainBlock, styles.oracleTriviaGap]} nativeID="baby-trivia-box">
          <BabyTriviaCard />
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.pageId === next.pageId &&
    prev.title === next.title &&
    prev.progress === next.progress &&
    prev.pageIndex === next.pageIndex &&
    prev.pageWidth === next.pageWidth &&
    prev.onRegistryLinkPress === next.onRegistryLinkPress &&
    prev.onWordSearchDragChange === next.onWordSearchDragChange,
);

function HomeScreen() {
  if (__DEV__ && !PREGNANT_HOME_LAYOUT_LOCKED) {
    console.warn('[HomeScreen] PREGNANT_HOME_LAYOUT_LOCKED is false — layout edits allowed');
  }
  const carouselRef = useRef(null);
  const [pagerWidth, setPagerWidth] = useState(() => Math.max(1, Math.round(FALLBACK_PAGE_WIDTH)));
  const pageWidth = pagerWidth;
  const [activePage, setActivePage] = useState(0);
  const [babyProgress, setBabyProgress] = useState(LOUNGE_PAGES[0].initialProgress);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [isDraggingWord, setIsDraggingWord] = useState(false);

  const handleWordSearchDragChange = useCallback((dragging) => {
    setIsDraggingWord(dragging);
  }, []);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  const loungePageData = useMemo(
    () =>
      LOUNGE_PAGES.map((page, index) => ({
        ...page,
        progress: page.id === 'baby' ? babyProgress : 0,
        pageIndex: index,
      })),
    [babyProgress],
  );

  const handlePagerLayout = useCallback((e) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0) {
      setPagerWidth((prev) => (Math.abs(prev - next) <= 1 ? prev : next));
    }
  }, []);

  const handleRegistryLinkPress = useCallback((url, pageIndex) => {
    if (pageIndex !== 0) return;

    Linking.openURL(url).catch(() => {});

    setBabyProgress((prev) => {
      const next = Math.min(1, prev + LINK_PROGRESS_BUMP);
      if (next >= 1) {
        setTimeout(() => {
          setRewardModalVisible(true);
        }, 320);
      }
      return next;
    });
  }, []);

  const handleMomentumScrollEnd = useCallback((e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setActivePage(Math.min(LOUNGE_PAGES.length - 1, Math.max(0, page)));
  }, [pageWidth]);

  const handlePageDotPress = useCallback((index) => {
    carouselRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    setActivePage(index);
  }, [pageWidth]);

  const closeRewardModal = useCallback(() => {
    setRewardModalVisible(false);
  }, []);

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent],
    [],
  );

  return (
    <SanctuaryCanvas>
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        style={styles.homeScroll}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        scrollEnabled={!isDraggingWord}
        bounces={!isDraggingWord}
      >
        <View style={styles.homeDomainBlock}>
          <View style={styles.paginationRow}>
            {LOUNGE_PAGES.map((page, index) => (
              <TouchableOpacity
                key={page.id}
                onPress={() => handlePageDotPress(index)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={[styles.paginationDot, index === activePage && styles.paginationDotActive]}
                >
                  {index === activePage ? '•' : '◦'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={[styles.homeDomainBlock, styles.homePagerDomain]}
          onLayout={handlePagerLayout}
        >
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            bounces={!isDraggingWord}
            scrollEnabled={!isDraggingWord}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            style={[styles.loungePager, { width: pageWidth }]}
            contentContainerStyle={styles.loungePagerContent}
            keyboardShouldPersistTaps="handled"
          >
            {loungePageData.map((item) => (
              <LoungePage
                key={item.id}
                pageId={item.id}
                title={item.title}
                progress={item.progress}
                pageIndex={item.pageIndex}
                pageWidth={pageWidth}
                onRegistryLinkPress={handleRegistryLinkPress}
                onWordSearchDragChange={handleWordSearchDragChange}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Suspense fallback={<ModalFallback />}>
        <RegistryRewardModal visible={rewardModalVisible} onClose={closeRewardModal} />
      </Suspense>
    </SanctuaryCanvas>
  );
}

export default memo(HomeScreen);

export function PregnantHomeFallback() {
  return (
    <View style={styles.fullscreenContainer}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    // Transparent so shell cream + ombre show through; cream is the shell fallback.
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  homeScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: PARENT_H_PAD,
    paddingTop: 10,
    paddingBottom: 120,
    backgroundColor: 'transparent',
  },
  homeDomainBlock: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: PREGNANT_HOME_LAYOUT.domainBlockMarginBottom,
    backgroundColor: 'transparent',
  },
  registryOracleGap: {
    marginBottom: 0,
  },
  oracleTriviaGap: {
    marginBottom: 0,
  },
  homePagerDomain: {
    marginBottom: PREGNANT_HOME_LAYOUT.pagerDomainMarginBottom,
  },
  homeDomainEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.85,
    marginBottom: 10,
  },
  registryLinkBtn: {
    alignItems: 'center',
    minWidth: 72,
    backgroundColor: 'transparent',
  },
  registryLinkEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  registryLinkLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  registryHeaderBlock: {
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  registryScriptTitle: {
    width: '100%',
    paddingHorizontal: 4,
  },
  registryPercentPill: {
    backgroundColor: 'transparent',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  registryPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
    letterSpacing: 0.3,
  },
  registrySyncLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.85,
    marginBottom: 16,
    textAlign: 'center',
  },
  registryLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  paginationDot: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.35)',
    lineHeight: 18,
  },
  paginationDotActive: {
    color: '#000000',
    fontWeight: '800',
  },
  loungePage: {
    flexDirection: 'column',
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  wordSearchPage: {
    paddingTop: 0,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  loungeGlassCard: {
    marginVertical: 12,
  },
  registryGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    padding: 16,
  },
  loungePager: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  loungePagerContent: {
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  crosswordCard: {
    marginTop: 0,
    marginBottom: 0,
  },
  crosswordScriptTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  crosswordEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.85,
    marginBottom: 10,
  },
  crosswordLevelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  crosswordLevelChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  crosswordLevelChipActive: {
    backgroundColor: 'rgba(199, 162, 179, 0.35)',
    borderColor: 'rgba(199, 162, 179, 0.65)',
  },
  crosswordLevelChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    opacity: 0.7,
  },
  crosswordLevelChipTextActive: {
    opacity: 1,
    color: '#7A6B8A',
  },
  crosswordLevelLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: INK,
    opacity: 0.55,
    textAlign: 'center',
    marginBottom: 8,
  },
  crosswordTheme: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.2,
    marginBottom: 6,
    textAlign: 'center',
  },
  crosswordSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    lineHeight: 20,
    marginBottom: 16,
  },
  crosswordGrid: {
    alignSelf: 'center',
    marginBottom: 14,
    gap: 4,
  },
  crosswordGridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  crosswordBlock: {
    borderRadius: 8,
    backgroundColor: CELL_BLOCK,
  },
  crosswordCell: {
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    padding: 0,
  },
  crosswordCellCorrect: {
    backgroundColor: 'rgba(199, 162, 179, 0.35)',
    borderColor: CALM_MAUVE,
  },
  crosswordProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  crosswordHintButton: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(199, 162, 179, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(199, 162, 179, 0.5)',
  },
  crosswordHintButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A6B8A',
    letterSpacing: 0.3,
  },
  crosswordSuccessBanner: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  crosswordSuccessText: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  cluesSection: {
    gap: 6,
  },
  cluesHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: INK,
    marginBottom: 2,
  },
  cluesHeadingDown: {
    marginTop: 10,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  clueArrow: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    width: 16,
    lineHeight: 20,
  },
  clueText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    lineHeight: 20,
  },
  clueSolved: {
    opacity: 0.55,
  },
});
