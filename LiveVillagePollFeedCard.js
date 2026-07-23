import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { MIDNIGHT } from './midnightLoungeTheme';
import { submitPostpartumPollResponse } from './villagePollBridge';
import { useVillageRewards } from './VillageRewardsContext';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const POP_DISMISS_MS = 460;
const DEFAULT_DISMISS_MS = 380;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configurePollDismissLayout(variant) {
  const isAnimatedPop = variant === 'pop' || variant === 'dayPop';
  if (isAnimatedPop) {
    LayoutAnimation.configureNext({
      duration: 520,
      create: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    return;
  }

  LayoutAnimation.configureNext({
    duration: 420,
    create: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.opacity,
    },
    delete: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

export default function LiveVillagePollFeedCard({
  poll,
  onDismissed,
  variant = 'default',
  babyAge = null,
}) {
  const isPop = variant === 'pop' || variant === 'dayPop';
  const isDay = variant === 'dayPop';
  const { addPoints } = useVillageRewards();
  const [vote, setVote] = useState(null);
  const [tip, setTip] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const opacity = useRef(new Animated.Value(isPop ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(isPop ? 18 : 0)).current;
  const scale = useRef(new Animated.Value(isPop ? 0.94 : 1)).current;

  useEffect(() => {
    opacity.setValue(isPop ? 0 : 1);
    translateY.setValue(isPop ? 18 : 0);
    scale.setValue(isPop ? 0.94 : 1);
    setVote(null);
    setTip('');
    setSubmitting(false);

    if (!isPop) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 9,
        tension: 52,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 48,
        useNativeDriver: true,
      }),
    ]).start();
  }, [poll.id, isPop, opacity, translateY, scale]);

  const handleSubmit = useCallback(() => {
    if (!vote || submitting) return;
    setSubmitting(true);

    const dismissMs = isPop ? POP_DISMISS_MS : DEFAULT_DISMISS_MS;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: dismissMs,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: isPop ? -36 : -28,
        duration: dismissMs,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: isPop ? 0.92 : 1,
        duration: dismissMs,
        useNativeDriver: true,
      }),
    ]).start(() => {
      configurePollDismissLayout(variant);
      const ok = submitPostpartumPollResponse(poll.id, vote, tip, babyAge);
      if (ok) {
        addPoints(100, 'pollFeedback');
      }
      onDismissed?.(poll.id);
    });
  }, [
    vote,
    tip,
    submitting,
    poll.id,
    isPop,
    variant,
    opacity,
    translateY,
    scale,
    onDismissed,
    babyAge,
    addPoints,
  ]);

  return (
    <Animated.View
      style={[
        isDay ? styles.dayPopCard : isPop ? styles.livePollPopCard : styles.livePollCard,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {isPop ? (
        <View style={styles.popBadgeRow}>
          <Text style={styles.popBadgeEmoji}>🗳️</Text>
          <Text style={[isDay ? styles.dayPopBadgeText : styles.popBadgeText, SANS]}>
            A mama needs your vote
          </Text>
        </View>
      ) : (
        <Text style={[styles.livePollEyebrow, SANS]}>LIVE · PREGNANT MAMA ASKS</Text>
      )}

      <Text
        style={[
          isDay ? styles.dayPopQuestion : isPop ? styles.livePollPopQuestion : styles.livePollQuestion,
          SANS,
        ]}
      >
        Do I really need a {poll.item}?
      </Text>

      <View style={styles.voteRow}>
        <TouchableOpacity
          style={[
            styles.voteBtn,
            isDay && styles.voteBtnDay,
            isPop && !isDay && styles.voteBtnPop,
            vote === 'needed' && (isDay ? styles.voteBtnDayActive : styles.voteBtnActive),
            vote === 'needed' && isPop && !isDay && styles.voteBtnPopActive,
          ]}
          onPress={() => setVote('needed')}
          activeOpacity={0.88}
          disabled={submitting}
        >
          <Text
            style={[
              styles.voteBtnText,
              isDay && styles.voteBtnTextDay,
              isPop && !isDay && styles.voteBtnTextPop,
              vote === 'needed' && (isDay ? styles.voteBtnTextDayActive : styles.voteBtnTextActive),
              vote === 'needed' && isPop && !isDay && styles.voteBtnTextPopActive,
              SANS,
            ]}
          >
            Needed ✨
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.voteBtn,
            isDay && styles.voteBtnDay,
            isPop && !isDay && styles.voteBtnPop,
            vote === 'skip' && (isDay ? styles.voteBtnDayActive : styles.voteBtnActive),
            vote === 'skip' && isPop && !isDay && styles.voteBtnPopActive,
          ]}
          onPress={() => setVote('skip')}
          activeOpacity={0.88}
          disabled={submitting}
        >
          <Text
            style={[
              styles.voteBtnText,
              isDay && styles.voteBtnTextDay,
              isPop && !isDay && styles.voteBtnTextPop,
              vote === 'skip' && (isDay ? styles.voteBtnTextDayActive : styles.voteBtnTextActive),
              vote === 'skip' && isPop && !isDay && styles.voteBtnTextPopActive,
              SANS,
            ]}
          >
            Skip it
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.tipInput,
          isDay && styles.tipInputDay,
          isPop && !isDay && styles.tipInputPop,
          SANS,
        ]}
        placeholder="Why should she add or skip this? (optional)"
        placeholderTextColor={
          isDay
            ? 'rgba(74, 62, 61, 0.42)'
            : isPop
              ? 'rgba(255, 255, 255, 0.42)'
              : 'rgba(232, 229, 247, 0.38)'
        }
        value={tip}
        onChangeText={setTip}
        multiline
        maxLength={180}
        editable={!submitting}
      />

      <TouchableOpacity
        style={[
          styles.shareBtn,
          isDay && styles.shareBtnDay,
          isPop && !isDay && styles.shareBtnPop,
          (!vote || submitting) && styles.shareBtnDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!vote || submitting}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.shareBtnText,
            isDay && styles.shareBtnTextDay,
            isPop && !isDay && styles.shareBtnTextPop,
            SANS,
          ]}
        >
          Share with her village
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  livePollCard: {
    backgroundColor: 'rgba(37, 34, 50, 0.72)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 232, 0.35)',
    padding: 18,
    marginBottom: 16,
  },
  livePollPopCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    padding: 18,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 14px 34px rgba(20, 16, 32, 0.22)' },
      default: {
        shadowColor: '#1A1430',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 5,
      },
    }),
  },
  dayPopCard: {
    backgroundColor: 'rgba(255, 248, 244, 0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.4)',
    padding: 16,
    marginBottom: 4,
  },
  popBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  popBadgeEmoji: {
    fontSize: 18,
  },
  popBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.78)',
  },
  dayPopBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#D4896A',
  },
  livePollEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: MIDNIGHT.peach,
    marginBottom: 8,
  },
  livePollQuestion: {
    fontSize: 17,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    lineHeight: 24,
    marginBottom: 14,
  },
  livePollPopQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 14,
  },
  dayPopQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3E3D',
    lineHeight: 25,
    marginBottom: 14,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: 'rgba(196, 188, 230, 0.14)',
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  voteBtnPop: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  voteBtnDay: {
    backgroundColor: 'rgba(233, 168, 137, 0.14)',
    borderColor: 'rgba(233, 168, 137, 0.38)',
  },
  voteBtnActive: {
    backgroundColor: 'rgba(196, 188, 230, 0.32)',
    borderColor: MIDNIGHT.lavender,
  },
  voteBtnPopActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  voteBtnDayActive: {
    backgroundColor: 'rgba(233, 168, 137, 0.32)',
    borderColor: '#E9A889',
  },
  voteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: MIDNIGHT.textMuted,
  },
  voteBtnTextPop: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  voteBtnTextDay: {
    color: 'rgba(74, 62, 61, 0.72)',
  },
  voteBtnTextActive: {
    color: MIDNIGHT.textPrimary,
  },
  voteBtnTextPopActive: {
    color: '#FFFFFF',
  },
  voteBtnTextDayActive: {
    color: '#4A3E3D',
  },
  tipInput: {
    backgroundColor: 'rgba(30, 27, 48, 0.55)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20,
    color: MIDNIGHT.textPrimary,
    minHeight: 68,
    textAlignVertical: 'top',
    marginBottom: 12,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  tipInputPop: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    color: '#FFFFFF',
  },
  tipInputDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(233, 168, 137, 0.4)',
    color: '#4A3E3D',
  },
  shareBtn: {
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  shareBtnPop: {
    backgroundColor: 'rgba(233, 168, 137, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  shareBtnDay: {
    backgroundColor: '#E9A889',
    borderWidth: 1,
    borderColor: 'rgba(212, 137, 106, 0.45)',
  },
  shareBtnDisabled: {
    opacity: 0.45,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A2540',
  },
  shareBtnTextPop: {
    color: '#FFFFFF',
  },
  shareBtnTextDay: {
    color: '#4A3E3D',
  },
});
