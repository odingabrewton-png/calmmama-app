import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { CALM_SERIF } from './calmLoungeTheme';
import { injectNurseryWebFonts, mamaCardScriptTitle } from './nurseryRetroFonts';
import { pickOracleQuestions, computeNameReveal, ORACLE_QUESTION_COUNT } from './nameOracleEngine';

const INK = '#000000';

const ORACLE_GLASS = {
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.25)',
  overflow: 'hidden',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function springStep() {
  // Opacity only — Presets.easeInEaseOut also animates bounds and warps text.
  LayoutAnimation.configureNext({
    duration: 220,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

const FrostedOracleCard = memo(function FrostedOracleCard({ children, style }) {
  // Solid frosted card — BlurView re-snapshots when Home becomes visible and flashes.
  return (
    <View style={[styles.oracleShell, ORACLE_GLASS, styles.oracleWebFallback]}>
      <View style={[styles.oracleInner, style]}>{children}</View>
    </View>
  );
});

function NameOracleGame() {
  const [stage, setStage] = useState('welcome');
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  const currentQuestion = questions[questionIndex] ?? null;
  const questionProgress = questions.length ? `${questionIndex + 1} / ${questions.length}` : '';

  const startGame = useCallback(() => {
    springStep();
    setQuestions(pickOracleQuestions(ORACLE_QUESTION_COUNT));
    setQuestionIndex(0);
    setAnswers([]);
    setReveal(null);
    setStage('question');
  }, []);

  const playAgain = useCallback(() => {
    springStep();
    setStage('welcome');
    setQuestions([]);
    setQuestionIndex(0);
    setAnswers([]);
    setReveal(null);
  }, []);

  const handleOptionPress = useCallback(
    (option) => {
      springStep();
      const nextAnswers = [...answers, option];
      setAnswers(nextAnswers);

      if (questionIndex >= questions.length - 1) {
        setReveal(computeNameReveal(nextAnswers));
        setStage('reveal');
        return;
      }

      setQuestionIndex((prev) => prev + 1);
    },
    [answers, questionIndex, questions.length],
  );

  const stageBody = useMemo(() => {
    if (stage === 'welcome') {
      return (
        <>
          <Text style={[styles.oracleSubtitle, CALM_SERIF]}>
            Five quick vibe checks — then the oracle weaves names that match your energy, Mama.
          </Text>
          <TouchableOpacity style={styles.oraclePrimaryBtn} onPress={startGame} activeOpacity={0.88}>
            <Text style={styles.oraclePrimaryBtnText}>Begin the ritual ✨</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (stage === 'question' && currentQuestion) {
      return (
        <>
          <Text style={styles.oracleEyebrow}>VIBE CHECK · {questionProgress}</Text>
          <Text style={[styles.oracleQuestion, CALM_SERIF]}>{currentQuestion.prompt}</Text>
          <View style={styles.oracleOptions}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.oracleOptionBtn}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.86}
              >
                <Text style={styles.oracleOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }

    if (stage === 'reveal' && reveal) {
      return (
        <>
          <Text style={styles.oracleEyebrow}>YOUR ORACLE REVEAL</Text>
          <Text style={[styles.oracleSubtitle, CALM_SERIF, styles.oracleRevealLead]}>
            Two names woven from your vibe: {reveal.vibeSignature}
          </Text>

          <View style={styles.nameRevealRow}>
            <View style={styles.nameRevealCard}>
              <Text style={styles.nameRevealTag}>Baby Boy</Text>
              <Text style={[styles.nameRevealName, CALM_SERIF]}>{reveal.boy.name}</Text>
              <Text style={styles.nameRevealMeaning}>{reveal.boy.meaning}</Text>
            </View>
            <View style={styles.nameRevealCard}>
              <Text style={styles.nameRevealTag}>Baby Girl</Text>
              <Text style={[styles.nameRevealName, CALM_SERIF]}>{reveal.girl.name}</Text>
              <Text style={styles.nameRevealMeaning}>{reveal.girl.meaning}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.oraclePrimaryBtn} onPress={playAgain} activeOpacity={0.88}>
            <Text style={styles.oraclePrimaryBtnText}>Play Again 🔄</Text>
          </TouchableOpacity>
        </>
      );
    }

    return null;
  }, [
    stage,
    currentQuestion,
    questionProgress,
    startGame,
    handleOptionPress,
    reveal,
    playAgain,
  ]);

  return (
    <FrostedOracleCard style={styles.oracleCardSpacing}>
      <Text style={[styles.oracleScriptTitle, mamaCardScriptTitle]}>The Baby Name Oracle</Text>
      {stageBody}
    </FrostedOracleCard>
  );
}

export default memo(NameOracleGame);

const styles = StyleSheet.create({
  oracleShell: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  oracleWebFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      },
      default: {},
    }),
  },
  oracleBlur: {
    width: '100%',
  },
  oracleInner: {
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  oracleCardSpacing: {
    marginTop: 0,
    marginBottom: 0,
  },
  oracleScriptTitle: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  oracleSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
    opacity: 0.95,
  },
  oracleRevealLead: {
    marginBottom: 16,
  },
  oracleEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: INK,
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.9,
  },
  oracleQuestion: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  oracleOptions: {
    gap: 10,
  },
  oracleOptionBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  oracleOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    lineHeight: 20,
  },
  oraclePrimaryBtn: {
    alignSelf: 'center',
    marginTop: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  oraclePrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: 0.3,
  },
  nameRevealRow: {
    gap: 12,
    marginBottom: 18,
  },
  nameRevealCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  nameRevealTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.85,
    marginBottom: 6,
    textAlign: 'center',
  },
  nameRevealName: {
    fontSize: 26,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    marginBottom: 8,
  },
  nameRevealMeaning: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.92,
  },
});
