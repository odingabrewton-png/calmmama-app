import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Image,
  Dimensions,
  LayoutAnimation,
  UIManager,
  InteractionManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MIDNIGHT } from './midnightLoungeTheme';
import { ORACLE_AMBIENT_TRACKS } from './oracleAmbientTracks';
import { useOracleAmbientSound } from './useOracleAmbientSound';
import MaternalYogaStretchSanctuary from './MaternalYogaStretchSanctuary';

const CLOUD_IMAGE = require('./assets/soul-cloud-lavender.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BREATH_PAGE_WIDTH = SCREEN_WIDTH - 92;

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const ORACLE_GLASS = {
  backgroundColor: 'rgba(30, 27, 48, 0.32)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(196, 184, 232, 0.28)',
};

const BREATHING_EXERCISES = [
  {
    id: 'box',
    title: 'Box Breathing',
    pattern: 'In 4s · Hold 4s · Out 4s · Rest 4s',
    phases: [
      { label: 'In', ms: 4000 },
      { label: 'Hold', ms: 4000 },
      { label: 'Out', ms: 4000 },
      { label: 'Rest', ms: 4000 },
    ],
  },
  {
    id: '478',
    title: 'Calming 4-7-8 Technique',
    pattern: 'Deep In 4s · Hold 7s · Exhale 8s',
    phases: [
      { label: 'In', ms: 4000 },
      { label: 'Hold', ms: 7000 },
      { label: 'Out', ms: 8000 },
    ],
  },
  {
    id: 'sleep',
    title: 'Oracle Sleep Pulse',
    pattern: 'Slow In 5s · Slow Out 5s',
    phases: [
      { label: 'In', ms: 5000 },
      { label: 'Out', ms: 5000 },
    ],
  },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureOracleSpringLayout() {
  // Opacity only — Presets.spring animates layout bounds and warps text under the ombre.
  LayoutAnimation.configureNext({
    duration: 280,
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

const CelestialSoundButton = memo(function CelestialSoundButton({ isPlaying, activeTrack, onPress }) {
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    let loop = null;
    const task = InteractionManager.runAfterInteractions(() => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0.4,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
    });
    return () => {
      task.cancel();
      loop?.stop();
    };
  }, [glowPulse]);

  const glowScale = glowPulse.interpolate({
    inputRange: [0.4, 1],
    outputRange: [1, 1.06],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0.35, 0.85],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause Sound' : 'Tap to Settle Your Mind'}
      accessibilityState={{ selected: isPlaying }}
    >
      <Animated.View
        style={[
          styles.soundGlowRing,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />
      <View style={[styles.soundCelestialBtn, isPlaying && styles.soundCelestialBtnActive]}>
        <Text style={[styles.soundCelestialBtnText, SANS]}>
          {isPlaying ? '⏸️ Pause Sound' : '🎵 Tap to Settle Your Mind'}
        </Text>
        {isPlaying ? (
          <Text style={[styles.soundTrackLabel, SANS]}>Now playing · {activeTrack}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const TwilightSoundOracle = memo(function TwilightSoundOracle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(ORACLE_AMBIENT_TRACKS[0].label);
  const { togglePlayback } = useOracleAmbientSound(activeTrack);

  const handleSelectTrack = useCallback((trackLabel) => {
    setActiveTrack(trackLabel);
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const handleTogglePlay = useCallback(async () => {
    configureOracleSpringLayout();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const nextPlaying = await togglePlayback();
      setIsPlaying(nextPlaying);
    } catch (error) {
      if (__DEV__) {
        console.error('[CalmMama native] pregnancyOracle:togglePlay', error?.message ?? error);
      }
      setIsPlaying(false);
    }
  }, [togglePlayback]);

  return (
    <View style={styles.moduleBlock}>
      <Text style={[styles.moduleLabel, SANS]}>🔊 The Sound Oracle</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.soundPillRow}
      >
        {ORACLE_AMBIENT_TRACKS.map((track) => {
          const active = activeTrack === track.label;
          return (
            <TouchableOpacity
              key={track.id}
              style={[styles.soundPill, active && styles.soundPillActive]}
              onPress={() => handleSelectTrack(track.label)}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[styles.soundPillText, active && styles.soundPillTextActive, SANS]}
                numberOfLines={1}
              >
                {track.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <CelestialSoundButton
        isPlaying={isPlaying}
        activeTrack={activeTrack}
        onPress={handleTogglePlay}
      />
      <Text style={[styles.soundSubtitle, SANS]}>
        Close your eyes, Mama. Let the ambient sounds of the village guide you back to sleep.
      </Text>
    </View>
  );
});

const BreathingCloudPage = memo(function BreathingCloudPage({ exercise }) {
  const [holding, setHolding] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState('Just hold');
  const cloudScale = useRef(new Animated.Value(1)).current;
  const cloudGlow = useRef(new Animated.Value(0.3)).current;
  const breathAbortRef = useRef({ cancelled: false, timeout: null });

  const stopBreathCycle = useCallback(() => {
    breathAbortRef.current.cancelled = true;
    if (breathAbortRef.current.timeout) {
      clearTimeout(breathAbortRef.current.timeout);
      breathAbortRef.current.timeout = null;
    }
    Animated.parallel([
      Animated.spring(cloudScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(cloudGlow, { toValue: 0.3, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [cloudGlow, cloudScale]);

  const runBreathCycle = useCallback(() => {
    const phases = exercise.phases;
    let phaseIndex = 0;

    const tick = () => {
      if (breathAbortRef.current.cancelled) return;
      const phase = phases[phaseIndex];
      setPhaseLabel(phase.label);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      const expand = phase.label === 'In';
      Animated.parallel([
        Animated.timing(cloudScale, {
          toValue: expand ? 1.14 : phase.label === 'Out' ? 0.92 : 1,
          duration: Math.min(phase.ms, 1200),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cloudGlow, {
          toValue: expand ? 0.8 : 0.35,
          duration: Math.min(phase.ms, 1200),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start();

      phaseIndex = (phaseIndex + 1) % phases.length;
      breathAbortRef.current.timeout = setTimeout(tick, phase.ms);
    };

    tick();
  }, [cloudGlow, cloudScale, exercise.phases]);

  const startHold = useCallback(() => {
    breathAbortRef.current.cancelled = false;
    setHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    runBreathCycle();
  }, [runBreathCycle]);

  const endHold = useCallback(() => {
    setHolding(false);
    setPhaseLabel('Just hold');
    stopBreathCycle();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [stopBreathCycle]);

  useEffect(
    () => () => {
      breathAbortRef.current.cancelled = true;
      stopBreathCycle();
    },
    [stopBreathCycle],
  );

  return (
    <View style={[styles.breathPage, { width: BREATH_PAGE_WIDTH }]}>
      <Text style={[styles.breathTitle, SANS]}>{exercise.title}</Text>
      <Text style={[styles.breathPattern, SANS]}>{exercise.pattern}</Text>
      <Pressable
        onPressIn={startHold}
        onPressOut={endHold}
        style={styles.holdPressable}
        accessibilityRole="button"
        accessibilityLabel={`Hold for ${exercise.title}`}
      >
        <Animated.View
          style={[styles.cloudGlow, { opacity: cloudGlow, transform: [{ scale: cloudScale }] }]}
        />
        <Animated.View style={[styles.cloudWrap, { transform: [{ scale: cloudScale }] }]}>
          <Image source={CLOUD_IMAGE} style={styles.cloudImage} resizeMode="contain" />
          <Text style={[styles.cloudHoldLabel, SANS]}>{holding ? phaseLabel : 'Just hold'}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
});

const SwipeableBreathingCompanion = memo(function SwipeableBreathingCompanion() {
  const [activePage, setActivePage] = useState(0);

  const handleScrollEnd = useCallback((e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / BREATH_PAGE_WIDTH);
    setActivePage(Math.min(BREATHING_EXERCISES.length - 1, Math.max(0, page)));
  }, []);

  return (
    <View style={styles.holdCompanionBlock}>
      <Text style={[styles.moduleLabel, SANS]}>☁️ The Just Hold Breathing Companion</Text>
      <Text style={[styles.holdHint, SANS]}>
        Swipe for a technique · long-press the cloud for rhythmic haptics.
      </Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        nestedScrollEnabled
        removeClippedSubviews
        contentContainerStyle={styles.breathPagerContent}
      >
        {BREATHING_EXERCISES.map((exercise, index) => {
          const nearActive = Math.abs(index - activePage) <= 1;
          return nearActive ? (
            <BreathingCloudPage key={exercise.id} exercise={exercise} />
          ) : (
            <View key={exercise.id} style={[styles.breathPage, { width: BREATH_PAGE_WIDTH }]} />
          );
        })}
      </ScrollView>
      <View style={styles.breathDots}>
        {BREATHING_EXERCISES.map((exercise, index) => (
          <Text
            key={exercise.id}
            style={[styles.breathDot, index === activePage && styles.breathDotActive, SANS]}
          >
            {index === activePage ? '•' : '◦'}
          </Text>
        ))}
      </View>
    </View>
  );
});

export default function PregnancyOracleCard() {
  return (
    <View style={[styles.oracleCard, ORACLE_GLASS]}>
      <Text style={[styles.oracleTitle, SANS]}>🌙 The 2 AM Pregnancy Oracle</Text>

      <TwilightSoundOracle />

      <View style={styles.moduleDivider} />

      <SwipeableBreathingCompanion />

      <View style={styles.moduleDivider} />

      <MaternalYogaStretchSanctuary />
    </View>
  );
}

const styles = StyleSheet.create({
  oracleCard: {
    padding: 22,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  oracleTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  moduleBlock: {
    gap: 12,
  },
  moduleLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: MIDNIGHT.peach,
    textAlign: 'left',
  },
  moduleHint: {
    fontSize: 16,
    lineHeight: 23,
    color: MIDNIGHT.textSecondary,
    marginTop: -4,
    textAlign: 'left',
  },
  moduleDivider: {
    height: 1,
    backgroundColor: MIDNIGHT.border,
    marginVertical: 22,
  },
  soundPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  soundPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    backgroundColor: 'rgba(37, 34, 50, 0.55)',
    maxWidth: 220,
  },
  soundPillActive: {
    borderColor: 'rgba(196, 184, 232, 0.55)',
    backgroundColor: 'rgba(196, 188, 230, 0.22)',
  },
  soundPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: MIDNIGHT.textSecondary,
  },
  soundPillTextActive: {
    color: MIDNIGHT.textPrimary,
    fontWeight: '700',
  },
  soundGlowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 999,
    backgroundColor: 'rgba(196, 184, 232, 0.35)',
  },
  soundCelestialBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196, 184, 232, 0.2)',
    borderRadius: 999,
    paddingVertical: 22,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 229, 247, 0.45)',
    minHeight: 72,
    marginTop: 4,
  },
  soundCelestialBtnActive: {
    backgroundColor: 'rgba(196, 184, 232, 0.32)',
    borderColor: MIDNIGHT.lavender,
  },
  soundCelestialBtnText: {
    fontSize: 19,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  soundTrackLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: MIDNIGHT.powderBlue,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  soundSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: MIDNIGHT.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  holdCompanionBlock: {
    gap: 10,
    alignItems: 'center',
    paddingTop: 4,
  },
  holdHint: {
    fontSize: 15,
    lineHeight: 21,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  breathPagerContent: {
    alignItems: 'center',
  },
  breathPage: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  breathTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MIDNIGHT.powderBlue,
    marginBottom: 4,
    textAlign: 'center',
  },
  breathPattern: {
    fontSize: 14,
    color: MIDNIGHT.textMuted,
    marginBottom: 10,
    textAlign: 'center',
  },
  breathDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  breathDot: {
    fontSize: 16,
    color: MIDNIGHT.textMuted,
  },
  breathDotActive: {
    color: MIDNIGHT.lavender,
    fontWeight: '700',
  },
  holdPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    marginTop: 4,
  },
  cloudGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(196, 184, 232, 0.4)',
  },
  cloudWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudImage: {
    width: 112,
    height: 72,
  },
  cloudHoldLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: MIDNIGHT.lavender,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
