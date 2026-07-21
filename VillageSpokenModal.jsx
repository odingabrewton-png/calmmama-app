import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  CALM_BLUSH_TRACK,
  CALM_INK,
  CALM_MAUVE,
  CALM_PILLOW_CARD,
  CALM_SERIF,
} from './calmLoungeTheme';
import { VILLAGE_SNAPPY_REANIMATED } from './villageScreenTransitions';

const REGISTRY_EXTERNAL_LINKS = [
  {
    id: 'amazon',
    shortLabel: 'Amazon',
    emoji: '📦',
    url: 'https://www.amazon.com/baby-reg/homepage',
  },
  {
    id: 'target',
    shortLabel: 'Target',
    emoji: '🎯',
    url: 'https://www.target.com/gift-registry/baby-registry',
  },
  {
    id: 'babylist',
    shortLabel: 'Babylist',
    emoji: '🍼',
    url: 'https://www.babylist.com/',
  },
];

export default function VillageSpokenModal({ visible, poll, onClose }) {
  const [pagerWidth, setPagerWidth] = useState(0);
  const [quotePage, setQuotePage] = useState(0);
  const scrollRef = useRef(null);
  const backdrop = useSharedValue(0);
  const card = useSharedValue(0);

  const tips = poll?.tips?.length ? poll.tips : [{ id: 'fallback', text: 'Your village is rooting for you — trust your nest.' }];
  const neededPct = poll?.neededPct ?? 20;
  const skipPct = poll?.skipPct ?? 80;
  const itemLabel = poll?.item ?? 'this item';

  useEffect(() => {
    if (visible) {
      setQuotePage(0);
      backdrop.value = withTiming(1, { duration: 220 });
      card.value = withSpring(1, VILLAGE_SNAPPY_REANIMATED);
    } else {
      backdrop.value = withTiming(0, { duration: 180 });
      card.value = withTiming(0, { duration: 160 });
    }
  }, [visible, backdrop, card]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: card.value,
    transform: [
      { scale: 0.9 + card.value * 0.1 },
      { translateY: (1 - card.value) * 32 },
    ],
  }));

  const openLink = useCallback((url) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const handleQuoteScrollEnd = useCallback(
    (e) => {
      if (!pagerWidth) return;
      const page = Math.round(e.nativeEvent.contentOffset.x / pagerWidth);
      setQuotePage(Math.min(tips.length - 1, Math.max(0, page)));
    },
    [pagerWidth, tips.length],
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={[styles.title, CALM_SERIF]}>🌸 Your Village Has Spoken!</Text>
          <Text style={styles.itemEyebrow}>About {itemLabel}</Text>

          <View style={styles.splitTrack}>
            <LinearGradient
              colors={[CALM_MAUVE, '#D4B5C4']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.splitNeeded, { flex: neededPct }]}
            />
            <View style={[styles.splitSkip, { flex: skipPct }]} />
          </View>
          <View style={styles.splitLabels}>
            <Text style={styles.splitLabel}>Needed {neededPct}%</Text>
            <Text style={styles.splitLabel}>Skip {skipPct}%</Text>
          </View>

          <View
            style={styles.quotePagerShell}
            onLayout={(e) => setPagerWidth(e.nativeEvent.layout.width)}
          >
            {pagerWidth > 0 ? (
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                onMomentumScrollEnd={handleQuoteScrollEnd}
                contentContainerStyle={styles.quotePagerContent}
              >
                {tips.map((tip) => (
                  <View key={tip.id} style={[styles.quotePage, { width: pagerWidth }]}>
                    <Text style={[styles.quoteMark, CALM_SERIF]}>&ldquo;</Text>
                    <Text style={[styles.quoteText, CALM_SERIF]}>{tip.text}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>

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

          <View style={styles.linkPads}>
            {REGISTRY_EXTERNAL_LINKS.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkPad}
                onPress={() => openLink(link.url)}
                activeOpacity={0.86}
                accessibilityRole="link"
                accessibilityLabel={`Open ${link.shortLabel} registry`}
              >
                <Text style={styles.linkPadEmoji}>{link.emoji}</Text>
                <Text style={styles.linkPadLabel}>{link.shortLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={styles.dismissBtnText}>Back to my lounge</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 62, 61, 0.32)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      },
      default: {},
    }),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 28,
    paddingHorizontal: 22,
    ...CALM_PILLOW_CARD,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: CALM_INK,
    textAlign: 'left',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  itemEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(74, 62, 61, 0.58)',
    marginBottom: 16,
  },
  splitTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: CALM_BLUSH_TRACK,
    marginBottom: 8,
  },
  splitNeeded: {
    height: '100%',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  splitSkip: {
    height: '100%',
    backgroundColor: CALM_BLUSH_TRACK,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  splitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CALM_MAUVE,
    letterSpacing: 0.3,
  },
  quotePagerShell: {
    minHeight: 108,
    marginBottom: 8,
  },
  quotePagerContent: {
    alignItems: 'stretch',
  },
  quotePage: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  quoteMark: {
    fontSize: 28,
    color: CALM_MAUVE,
    lineHeight: 30,
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 22,
    color: CALM_INK,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  quoteDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quoteDot: {
    fontSize: 14,
    color: 'rgba(199, 162, 179, 0.35)',
    fontWeight: '600',
  },
  quoteDotActive: {
    color: CALM_MAUVE,
    fontWeight: '800',
  },
  linkPads: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  linkPad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 238, 235, 0.65)',
  },
  linkPadEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  linkPadLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CALM_INK,
    letterSpacing: 0.2,
  },
  dismissBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dismissBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: CALM_MAUVE,
  },
});
