import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import LiveVillagePollFeedCard from './LiveVillagePollFeedCard';
import { subscribeVillagePolls, ensureTempPreviewRegistryPolls } from './villagePollBridge';
import { canAnswerVillageRegistryPolls } from './homeJourneyUtils';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const FADE_MS = 280;
const INK = '#4A3E3D';
const INK_SOFT = 'rgba(74, 62, 61, 0.7)';
const BLUSH = '#FDF6F2';
const PEACH = '#E9A889';
const PEACH_DEEP = '#D4896A';

/**
 * Home-page popup for postpartum mamas: yes/no (+ reason) on pregnant registry asks.
 * Daytime CalmMama vibe — soft peach / blush, not midnight lounge.
 */
export default function PostpartumHomePollModal({ active = true, babyAge = null }) {
  const [queue, setQueue] = useState([]);
  const [visible, setVisible] = useState(false);
  const [displayPoll, setDisplayPoll] = useState(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);
  const eligible = active && canAnswerVillageRegistryPolls(babyAge);

  useEffect(() => {
    if (!eligible) return undefined;
    ensureTempPreviewRegistryPolls();
    return subscribeVillagePolls((snapshot) => {
      setQueue(snapshot.open);
    });
  }, [eligible]);

  const current = queue[0] || null;
  const shouldShow = eligible && Boolean(current);

  useEffect(() => {
    if (current) {
      setDisplayPoll(current);
      closingRef.current = false;
    }
  }, [current]);

  useEffect(() => {
    if (shouldShow) {
      setVisible(true);
      backdropOpacity.stopAnimation();
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!visible || closingRef.current) return;

    closingRef.current = true;
    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setVisible(false);
      setDisplayPoll(null);
      closingRef.current = false;
    });
  }, [shouldShow, visible, backdropOpacity]);

  const handleDismissed = useCallback(() => {
    // Poll bridge moves answered poll to resolved; subscription advances the queue.
  }, []);

  if (!visible || !displayPoll) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => {}}>
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { opacity: backdropOpacity }]}>
          <Text style={[styles.eyebrow, SANS]}>VILLAGE REGISTRY ASK · TEMP PREVIEW</Text>
          <Text style={[styles.title, SANS]}>A pregnant mama needs your vote</Text>
          <Text style={[styles.sub, SANS]}>
            Say whether she should add this to her registry — and why, if you like.
          </Text>
          <LiveVillagePollFeedCard
            key={displayPoll.id}
            poll={displayPoll}
            variant="dayPop"
            babyAge={babyAge}
            onDismissed={handleDismissed}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233, 168, 137, 0.42)',
  },
  sheet: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: BLUSH,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.45)',
    ...Platform.select({
      web: { boxShadow: '0 16px 36px rgba(74, 62, 61, 0.14)' },
      default: {
        shadowColor: '#4A3E3D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
        elevation: 7,
      },
    }),
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: PEACH_DEEP,
    marginBottom: 6,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: INK,
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    lineHeight: 19,
    color: INK_SOFT,
    marginBottom: 14,
  },
});
