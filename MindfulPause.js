import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SANCTUARY_ZEN } from './designTypography';
import { MIDNIGHT } from './midnightLoungeTheme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const INHALE_MS = 4000;
const HOLD_MS = 7000;
const EXHALE_MS = 8000;
const SESSION_MS = 60_000;
const CIRCLE_BASE = 168;
const SCALE_MIN = 0.62;
const SCALE_MAX = 1;

const INHALE_PHRASES = [
  'Take a full, deep breath.',
  "Take your longest, deepest breath of the day. Don't rush it.",
];

const HOLD_PHRASE = 'Unclench your jaw. Drop your shoulders. Relax your facial muscles.';

const EXHALE_PHRASES = [
  'Exhale slowly. Release the weight of today.',
  'Ground your feet. Feel the earth holding you. You are supported.',
];

const VALIDATION_MANTRAS = [
  'Forgive yourself for one thing. Right now, let it go.',
  "You don't have to fix everything today. Just don't abandon yourself, love.",
  'Let a gentle smile find your face.',
];

const PHASE_LABELS = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function MindfulPause({ onExit }) {
  const [screenPhase, setScreenPhase] = useState('breathing');
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [mantra, setMantra] = useState(INHALE_PHRASES[0]);
  const [validationMantra, setValidationMantra] = useState(VALIDATION_MANTRAS[0]);

  const circleScale = useRef(new Animated.Value(SCALE_MIN)).current;
  const glowOpacity = useRef(new Animated.Value(0.35)).current;
  const mantraOpacity = useRef(new Animated.Value(1)).current;
  const breathingOpacity = useRef(new Animated.Value(1)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  const completionLift = useRef(new Animated.Value(16)).current;
  const sessionEndRef = useRef(Date.now() + SESSION_MS);
  const cancelledRef = useRef(false);
  const [progressTrackW, setProgressTrackW] = useState(0);

  const elapsedRatio = useRef(new Animated.Value(0)).current;

  const fadeToMantra = useCallback(
    (nextText) =>
      new Promise((resolve) => {
        Animated.timing(mantraOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start(() => {
          setMantra(nextText);
          Animated.timing(mantraOpacity, {
            toValue: 1,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }).start(() => resolve());
        });
      }),
    [mantraOpacity]
  );

  const animateInhale = useCallback(() => {
    return Animated.parallel([
      Animated.timing(circleScale, {
        toValue: SCALE_MAX,
        duration: INHALE_MS,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.92,
        duration: INHALE_MS,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);
  }, [circleScale, glowOpacity]);

  const animateExhale = useCallback(() => {
    return Animated.parallel([
      Animated.timing(circleScale, {
        toValue: SCALE_MIN,
        duration: EXHALE_MS,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.38,
        duration: EXHALE_MS,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);
  }, [circleScale, glowOpacity]);

  const finishSession = useCallback(() => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;

    const chosen = pickRandom(VALIDATION_MANTRAS);
    setValidationMantra(chosen);
    setScreenPhase('complete');

    Animated.parallel([
      Animated.timing(breathingOpacity, {
        toValue: 0,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(completionOpacity, {
        toValue: 1,
        duration: 720,
        delay: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(completionLift, {
        toValue: 0,
        duration: 720,
        delay: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [breathingOpacity, completionLift, completionOpacity]);

  useEffect(() => {
    cancelledRef.current = false;
    sessionEndRef.current = Date.now() + SESSION_MS;

    Animated.timing(elapsedRatio, {
      toValue: 1,
      duration: SESSION_MS,
      easing: Easing.linear,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    const runSession = async () => {
      while (!cancelledRef.current && Date.now() < sessionEndRef.current) {
        setBreathPhase('inhale');
        await fadeToMantra(pickRandom(INHALE_PHRASES));
        if (cancelledRef.current || Date.now() >= sessionEndRef.current) break;
        await new Promise((resolve) => {
          animateInhale().start(({ finished }) => resolve(finished));
        });
        if (cancelledRef.current || Date.now() >= sessionEndRef.current) break;

        setBreathPhase('hold');
        await fadeToMantra(HOLD_PHRASE);
        if (cancelledRef.current || Date.now() >= sessionEndRef.current) break;
        await wait(HOLD_MS);
        if (cancelledRef.current || Date.now() >= sessionEndRef.current) break;

        setBreathPhase('exhale');
        await fadeToMantra(pickRandom(EXHALE_PHRASES));
        if (cancelledRef.current || Date.now() >= sessionEndRef.current) break;
        await new Promise((resolve) => {
          animateExhale().start(({ finished }) => resolve(finished));
        });
      }

      if (!cancelledRef.current) {
        finishSession();
      }
    };

    runSession();

    return () => {
      cancelledRef.current = true;
      circleScale.stopAnimation();
      glowOpacity.stopAnimation();
      mantraOpacity.stopAnimation();
      breathingOpacity.stopAnimation();
      completionOpacity.stopAnimation();
      completionLift.stopAnimation();
      elapsedRatio.stopAnimation();
    };
  }, [
    animateExhale,
    animateInhale,
    breathingOpacity,
    circleScale,
    completionLift,
    completionOpacity,
    elapsedRatio,
    fadeToMantra,
    finishSession,
    glowOpacity,
    mantraOpacity,
  ]);

  const progressHalfW = progressTrackW / 2;
  const progressFillStyle =
    progressTrackW > 0
      ? {
          width: progressTrackW,
          transform: [
            { translateX: -progressHalfW },
            { scaleX: elapsedRatio },
            { translateX: progressHalfW },
          ],
        }
      : null;

  const phaseLabel = useMemo(() => PHASE_LABELS[breathPhase] || '', [breathPhase]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {screenPhase === 'breathing' ? (
          <Animated.View style={[styles.breathingStage, { opacity: breathingOpacity }]}>
            <Text style={[styles.eyebrow, SANCTUARY_ZEN]}>MINDFUL PAUSE</Text>
            <Text style={[styles.sessionHint, SANCTUARY_ZEN]}>One minute · 4 · 7 · 8 breath</Text>

            <View style={styles.circleStage}>
              <Animated.View
                style={[
                  styles.glowHalo,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: circleScale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.pacingCircle,
                  {
                    transform: [{ scale: circleScale }],
                  },
                ]}
              >
                <View style={styles.pacingCircleInner} />
              </Animated.View>
            </View>

            <Text style={[styles.phaseLabel, SANCTUARY_ZEN]}>{phaseLabel}</Text>

            <Animated.Text style={[styles.mantraText, SANCTUARY_ZEN, { opacity: mantraOpacity }]}>
              {mantra}
            </Animated.Text>

            <View
              style={styles.progressTrack}
              onLayout={(e) => setProgressTrackW(e.nativeEvent.layout.width)}
            >
              {progressFillStyle ? (
                <Animated.View style={[styles.progressFill, progressFillStyle]} />
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        {screenPhase === 'complete' ? (
          <Animated.View
            style={[
              styles.completionStage,
              {
                opacity: completionOpacity,
                transform: [{ translateY: completionLift }],
              },
            ]}
          >
            <Text style={[styles.completionEyebrow, SANCTUARY_ZEN]}>TODAY&apos;S DAILY VALIDATION</Text>
            <Text style={[styles.completionMantra, SANCTUARY_ZEN]}>{validationMantra}</Text>
          </Animated.View>
        ) : null}

        {screenPhase === 'complete' ? (
          <Animated.View style={{ opacity: completionOpacity, width: '100%' }}>
            <TouchableOpacity style={styles.closeBtn} onPress={onExit} activeOpacity={0.88}>
              <Text style={[styles.closeBtnText, SANCTUARY_ZEN]}>Back to Sanctuary</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

export default React.memo(MindfulPause);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0910',
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 8 : 18,
  },
  breathingStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
  },
  sessionHint: {
    fontSize: 11,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  circleStage: {
    width: CIRCLE_BASE * SCALE_MAX + 80,
    height: CIRCLE_BASE * SCALE_MAX + 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 28,
  },
  glowHalo: {
    position: 'absolute',
    width: CIRCLE_BASE,
    height: CIRCLE_BASE,
    borderRadius: CIRCLE_BASE / 2,
    backgroundColor: 'rgba(196, 184, 230, 0.28)',
    ...Platform.select({
      web: { boxShadow: '0 0 48px rgba(196, 184, 230, 0.55)' },
      default: {
        shadowColor: '#C4B8E8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 32,
        elevation: 12,
      },
    }),
  },
  pacingCircle: {
    width: CIRCLE_BASE,
    height: CIRCLE_BASE,
    borderRadius: CIRCLE_BASE / 2,
    backgroundColor: 'rgba(232, 229, 247, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pacingCircleInner: {
    width: CIRCLE_BASE * 0.72,
    height: CIRCLE_BASE * 0.72,
    borderRadius: (CIRCLE_BASE * 0.72) / 2,
    backgroundColor: 'rgba(196, 184, 230, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.2)',
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: MIDNIGHT.accent,
    marginBottom: 14,
  },
  mantraText: {
    fontSize: 17,
    lineHeight: 26,
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    maxWidth: 320,
    minHeight: 78,
    fontStyle: 'italic',
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
      default: {},
    }),
  },
  progressTrack: {
    width: '100%',
    maxWidth: 280,
    height: 2,
    borderRadius: 1,
    backgroundColor: MIDNIGHT.borderSoft,
    marginTop: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 1,
  },
  completionStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  completionEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: MIDNIGHT.lavenderMuted,
    textAlign: 'center',
    marginBottom: 22,
  },
  completionMantra: {
    fontSize: 24,
    lineHeight: 34,
    color: MIDNIGHT.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 340,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
      default: { fontStyle: 'italic' },
    }),
  },
  closeBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: MIDNIGHT.bgCard,
    minWidth: 220,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: MIDNIGHT.lavender,
  },
});
