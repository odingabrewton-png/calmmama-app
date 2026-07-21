import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { VILLAGE_SNAPPY_REANIMATED } from './villageScreenTransitions';

const PROMO_CODE = 'VILLAGE15';
const INK = '#4A3E3D';
const PEACH = '#F5D9CE';
const PEACH_DEEP = '#E9A889';

const MUG_ASSET = require('./assets/founding-gifts-mug-front.png');

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

export default function RegistryRewardModal({ visible, onClose }) {
  const [copied, setCopied] = useState(false);
  const backdrop = useSharedValue(0);
  const card = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setCopied(false);
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
      { scale: 0.88 + card.value * 0.12 },
      { translateY: (1 - card.value) * 28 },
    ],
  }));

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(PROMO_CODE);
      setCopied(true);
    } catch (_) {
      setCopied(false);
    }
  }, []);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.mugWrap}>
            <Image source={MUG_ASSET} style={styles.mugImage} resizeMode="contain" />
            <Text style={styles.mugEmoji} pointerEvents="none">
              ☕
            </Text>
          </View>

          <Text style={[styles.eyebrow, SERIF]}>NEST COMPLETE</Text>
          <Text style={[styles.title, SERIF]}>Your village reward is here</Text>
          <Text style={styles.body}>
            You nourished your nest with heart. Enjoy 15% off our signature Calm Mama mug and
            cozy recovery essentials — a gentle gift for you, mama.
          </Text>

          <View style={styles.promoBox}>
            <Text style={styles.promoLabel}>Promo code</Text>
            <Text style={styles.promoCode}>{PROMO_CODE}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.88}>
              <Text style={styles.copyBtnText}>{copied ? 'Copied ✓' : 'Tap to Copy'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.dismissBtnText}>Continue nesting</Text>
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
    backgroundColor: 'rgba(74, 62, 61, 0.42)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      },
      default: {},
    }),
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255, 252, 248, 0.94)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 20px 50px rgba(74, 62, 61, 0.22)' },
      default: {
        shadowColor: INK,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 14,
      },
    }),
  },
  mugWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mugImage: {
    width: 88,
    height: 88,
  },
  mugEmoji: {
    position: 'absolute',
    bottom: -4,
    right: -2,
    fontSize: 22,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(74, 62, 61, 0.55)',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(74, 62, 61, 0.82)',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  promoBox: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(233, 168, 137, 0.75)',
    backgroundColor: 'rgba(245, 217, 206, 0.35)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  promoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(74, 62, 61, 0.55)',
    marginBottom: 6,
  },
  promoCode: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
    color: INK,
    marginBottom: 12,
  },
  copyBtn: {
    backgroundColor: INK,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    minWidth: 140,
    alignItems: 'center',
  },
  copyBtnText: {
    color: '#FFFCF8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dismissBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dismissBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: PEACH_DEEP,
  },
});
