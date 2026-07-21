import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CALM_SERIF } from './calmLoungeTheme';
import BotanicalGardenFrame from './BotanicalGardenFrame';
import { injectNurseryWebFonts, mamaCardScriptTitle } from './nurseryRetroFonts';
import {
  BABY_TRIVIA_DECK_SIZE,
  getDailyBabyTriviaDeck,
} from './pregnantHomeLayoutConfig';
import { SNAPPY_SPRING, safeAssignSequence, safeAssignTiming } from './reanimatedSafe';
import { runNativeGuard } from './nativeRuntimeGuard';

const INK = '#4A3E3D';
const LEAF_GREEN = '#5C7A68';
const PASTEL_FLOWER = '#E9A889';
const LAVENDER = '#C7A2B3';
const MINT = '#A8D5BA';
const PEACH = '#E9A889';

const FROSTED_GLASS = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.35)',
  padding: 16,
};

const PARTICLE_SPECS = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  angle: (index / 16) * Math.PI * 2 + (index % 3) * 0.18,
  distance: 24 + (index % 5) * 12,
  glyph: ['✿', '✾', '❀', '🌸', '✿', '✾'][index % 6],
  color: [LAVENDER, PEACH, MINT, '#D4B5CE', '#B8D4C8', LAVENDER][index % 6],
}));

const FlowerParticle = memo(function FlowerParticle({ spec, burstKey }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  useEffect(() => {
    if (!burstKey) return;
    progress.value = 0;
    runNativeGuard('babyTrivia:particle', () => {
      progress.value = withTiming(1, {
        duration: 920,
        easing: Easing.out(Easing.cubic),
      });
    });
  }, [burstKey, progress]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -7,
    marginTop: -7,
    opacity: interpolate(progress.value, [0, 0.12, 0.55, 1], [0, 1, 0.85, 0]),
    transform: [
      { translateX: Math.cos(spec.angle) * spec.distance * progress.value },
      { translateY: Math.sin(spec.angle) * spec.distance * progress.value },
      { scale: interpolate(progress.value, [0, 0.3, 1], [0.15, 1.2, 0.5]) },
    ],
  }));

  return (
    <Animated.Text style={[style, { color: spec.color, fontSize: 12 }]}>
      {spec.glyph}
    </Animated.Text>
  );
});

const FlowerBurst = memo(function FlowerBurst({ burstKey }) {
  if (!burstKey) return null;

  return (
    <View style={styles.burstStage} pointerEvents="none">
      {PARTICLE_SPECS.map((spec) => (
        <FlowerParticle key={spec.id} spec={spec} burstKey={burstKey} />
      ))}
    </View>
  );
});

function triggerIncorrectHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, 90);
}

const BabyTriviaCard = memo(function BabyTriviaCard() {
  const { deck } = useMemo(() => getDailyBabyTriviaDeck(), []);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);
  const [selection, setSelection] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [deckCompleted, setDeckCompleted] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [burstChoice, setBurstChoice] = useState(null);

  const cardOpacity = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const feedbackTranslateY = useSharedValue(8);
  const progressWidth = useSharedValue(0);

  const fadeTimerRef = useRef(null);

  const card = deck[questionIndex];
  const questionNumber = questionIndex + 1;
  const isLastQuestion = questionIndex >= deck.length - 1;

  const clearFadeTimer = useCallback(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearFadeTimer(), [clearFadeTimer]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ translateY: feedbackTranslateY.value }],
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const advanceToNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      setDeckCompleted(true);
      return;
    }

    runNativeGuard('babyTrivia:fadeOut', () => {
      safeAssignTiming(cardOpacity, 0, { duration: 280 }, 'babyTrivia:cardFadeOut');
    });

    fadeTimerRef.current = setTimeout(() => {
      setQuestionIndex((prev) => prev + 1);
      setSelection(null);
      setFeedback(null);
      setBurstChoice(null);
      feedbackOpacity.value = 0;
      feedbackTranslateY.value = 8;

      runNativeGuard('babyTrivia:fadeIn', () => {
        safeAssignTiming(cardOpacity, 1, { duration: 340 }, 'babyTrivia:cardFadeIn');
      });
    }, 300);
  }, [cardOpacity, feedbackOpacity, feedbackTranslateY, isLastQuestion]);

  const handleNext = useCallback(() => {
    if (!selection) return;
    advanceToNextQuestion();
  }, [selection, advanceToNextQuestion]);

  const handleAnswer = useCallback(
    (choice) => {
      if (selection || deckCompleted) return;

      const isCorrect = choice === card.correctAnswer;
      setSelection(choice);
      setFeedback(choice === 'true' ? card.feedbackTrue : card.feedbackFalse);

      if (isCorrect) {
        setBurstChoice(choice);
        setBurstKey((prev) => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        triggerIncorrectHaptic();
      }

      runNativeGuard('babyTrivia:feedback', () => {
        safeAssignTiming(feedbackOpacity, 1, { duration: 320 }, 'babyTrivia:feedbackOpacity');
        safeAssignSequence(
          feedbackTranslateY,
          [withSpring(0, SNAPPY_SPRING)],
          'babyTrivia:feedbackTranslate',
        );
        safeAssignTiming(
          progressWidth,
          ((questionIndex + 1) / BABY_TRIVIA_DECK_SIZE) * 100,
          { duration: 420, easing: Easing.out(Easing.cubic) },
          'babyTrivia:progress',
        );
      });
    },
    [
      selection,
      deckCompleted,
      card,
      feedbackOpacity,
      feedbackTranslateY,
      progressWidth,
      questionIndex,
    ],
  );

  if (deckCompleted) {
    return (
      <BotanicalGardenFrame topColor={LEAF_GREEN} bottomColor={PASTEL_FLOWER} sideColor={LEAF_GREEN}>
        <View style={[FROSTED_GLASS, styles.triviaCard]}>
          <Text style={[styles.triviaTitle, mamaCardScriptTitle]}>Baby Trivia</Text>
          <View style={styles.triviaDivider} />
          <Text style={[styles.completionTitle, CALM_SERIF]}>
            You bloomed through all {BABY_TRIVIA_DECK_SIZE}!
          </Text>
          <Text style={styles.completionBody}>
            Beautiful work, Mama. A fresh trivia deck will greet you tomorrow.
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, styles.progressFillComplete]} />
          </View>
        </View>
      </BotanicalGardenFrame>
    );
  }

  return (
    <BotanicalGardenFrame topColor={LEAF_GREEN} bottomColor={PASTEL_FLOWER} sideColor={LEAF_GREEN}>
      <View style={[FROSTED_GLASS, styles.triviaCard]}>
        <Text style={[styles.triviaTitle, mamaCardScriptTitle]}>Baby Trivia</Text>

        <Text style={styles.progressLabel}>
          Question {questionNumber} of {BABY_TRIVIA_DECK_SIZE}
        </Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressFillStyle]} />
        </View>

        <Animated.View style={cardStyle}>
          <View style={styles.triviaDivider} />
          <Text style={styles.triviaQuestion}>{card.question}</Text>

          <View style={styles.triviaActions}>
            <View style={styles.answerBtnWrap}>
              <TouchableOpacity
                style={[
                  styles.triviaBtn,
                  selection === 'true' && styles.triviaBtnSelected,
                  selection === 'true' && card.correctAnswer === 'true' && styles.triviaBtnCorrect,
                  selection === 'true' && card.correctAnswer !== 'true' && styles.triviaBtnIncorrect,
                ]}
                onPress={() => handleAnswer('true')}
                activeOpacity={0.88}
                disabled={!!selection}
              >
                <Text
                  style={[
                    styles.triviaBtnText,
                    selection === 'true' && styles.triviaBtnTextSelected,
                  ]}
                >
                  True
                </Text>
              </TouchableOpacity>
              {burstChoice === 'true' && card.correctAnswer === 'true' ? (
                <FlowerBurst burstKey={burstKey} />
              ) : null}
            </View>

            <View style={styles.answerBtnWrap}>
              <TouchableOpacity
                style={[
                  styles.triviaBtn,
                  selection === 'false' && styles.triviaBtnSelected,
                  selection === 'false' && card.correctAnswer === 'false' && styles.triviaBtnCorrect,
                  selection === 'false' && card.correctAnswer !== 'false' && styles.triviaBtnIncorrect,
                ]}
                onPress={() => handleAnswer('false')}
                activeOpacity={0.88}
                disabled={!!selection}
              >
                <Text
                  style={[
                    styles.triviaBtnText,
                    selection === 'false' && styles.triviaBtnTextSelected,
                  ]}
                >
                  False
                </Text>
              </TouchableOpacity>
              {burstChoice === 'false' && card.correctAnswer === 'false' ? (
                <FlowerBurst burstKey={burstKey} />
              ) : null}
            </View>
          </View>

          {feedback ? (
            <Animated.View style={[styles.triviaFeedback, feedbackStyle]}>
              <Text style={[styles.triviaFeedbackText, CALM_SERIF]}>{feedback}</Text>
              <TouchableOpacity
                style={styles.triviaNextBtn}
                onPress={handleNext}
                activeOpacity={0.88}
              >
                <Text style={styles.triviaNextBtnText}>
                  {isLastQuestion ? 'Finish 🌸' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>
    </BotanicalGardenFrame>
  );
});

export default BabyTriviaCard;

const styles = StyleSheet.create({
  triviaCard: {
    width: '100%',
    overflow: 'visible',
  },
  triviaTitle: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: INK,
    opacity: 0.55,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(199, 162, 179, 0.72)',
  },
  progressFillComplete: {
    width: '100%',
    backgroundColor: 'rgba(92, 122, 104, 0.65)',
  },
  triviaDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 14,
  },
  triviaQuestion: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    marginBottom: 18,
    opacity: 0.92,
  },
  triviaActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    overflow: 'visible',
  },
  answerBtnWrap: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },
  burstStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 20,
  },
  triviaBtn: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'visible',
  },
  triviaBtnSelected: {
    backgroundColor: 'rgba(92, 122, 104, 0.22)',
    borderColor: 'rgba(92, 122, 104, 0.45)',
  },
  triviaBtnCorrect: {
    backgroundColor: 'rgba(168, 213, 186, 0.28)',
    borderColor: 'rgba(92, 122, 104, 0.55)',
  },
  triviaBtnIncorrect: {
    backgroundColor: 'rgba(233, 168, 137, 0.22)',
    borderColor: 'rgba(199, 162, 179, 0.5)',
  },
  triviaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.2,
  },
  triviaBtnTextSelected: {
    color: LEAF_GREEN,
  },
  triviaFeedback: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  triviaFeedbackText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: INK,
    opacity: 0.78,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  triviaNextBtn: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.45)',
    backgroundColor: 'rgba(92, 122, 104, 0.18)',
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  triviaNextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: LEAF_GREEN,
    letterSpacing: 0.3,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LEAF_GREEN,
    textAlign: 'center',
    marginBottom: 10,
  },
  completionBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: INK,
    opacity: 0.78,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
});
