import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {
  BIRTHDAY_BUNDLE_OPTIONS,
  BIRTHDAY_DISCOUNT_PERCENT,
  buildBirthdayBundleProductIds,
} from './birthdayBoutiqueConfig';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const { width: SCREEN_W } = Dimensions.get('window');
const CONFETTI_PIECES = [
  '🎀', '✨', '🌸', '🎁', '💗', '🎉', '⭐', '🫧', '🕯️', '💫',
  '🎀', '✨', '🌸', '🎁', '💗', '🎉', '⭐', '🫧', '🕯️', '💫',
];

function ConfettiLayer({ active }) {
  const pieces = useMemo(
    () =>
      CONFETTI_PIECES.map((emoji, index) => ({
        emoji,
        left: (index * 17 + 8) % 92,
        delay: (index * 137) % 900,
        duration: 2800 + (index * 211) % 1400,
        drift: index % 2 === 0 ? 1 : -1,
      })),
    []
  );

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {pieces.map((piece, index) => (
        <ConfettiPiece key={`${piece.emoji}-${index}`} {...piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({ emoji, left, delay, duration, drift }) {
  const fall = useRef(new Animated.Value(-40)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopFall = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, {
          toValue: SCREEN_W * 1.1,
          duration,
          easing: Easing.linear,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(fall, {
          toValue: -40,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    const loopSway = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: drift * 14,
          duration: 900 + delay * 0.2,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(sway, {
          toValue: drift * -14,
          duration: 900 + delay * 0.2,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    const loopSpin = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2400 + delay,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );

    loopFall.start();
    loopSway.start();
    loopSpin.start();
    return () => {
      loopFall.stop();
      loopSway.stop();
      loopSpin.stop();
    };
  }, [delay, drift, duration, fall, spin, sway]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.confettiPiece,
        {
          left: `${left}%`,
          transform: [{ translateY: fall }, { translateX: sway }, { rotate }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

function ScentPickerCard({ product, selected, onPress, label }) {
  if (!product) return null;

  const discounted = product.price * (1 - BIRTHDAY_DISCOUNT_PERCENT / 100);

  return (
    <TouchableOpacity
      style={[styles.scentCard, selected && styles.scentCardSelected]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={styles.scentCardLabel}>{label}</Text>
      {product.imageSource ? (
        <Image source={product.imageSource} style={styles.scentCardImage} resizeMode="cover" />
      ) : null}
      <Text style={styles.scentCardTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <View style={styles.scentCardPriceRow}>
        <Text style={styles.scentCardPriceOld}>${product.price.toFixed(0)}</Text>
        <Text style={styles.scentCardPriceNew}>${discounted.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BirthdayBoutiqueModal({
  visible,
  mamaName,
  candles,
  scrubs,
  onClose,
  onFinalize,
}) {
  const [bundleId, setBundleId] = useState('candle-scrub');
  const [candle1, setCandle1] = useState(candles?.[0]?.id ?? null);
  const [candle2, setCandle2] = useState(candles?.[1]?.id ?? candles?.[0]?.id ?? null);
  const [scrub1, setScrub1] = useState(scrubs?.[0]?.id ?? null);
  const [scrub2, setScrub2] = useState(scrubs?.[1]?.id ?? scrubs?.[0]?.id ?? null);

  const cardScale = useRef(new Animated.Value(0.86)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const heroPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    cardScale.setValue(0.86);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 58,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1.06,
          duration: 1200,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(heroPulse, {
          toValue: 1,
          duration: 1200,
          easing: VILLAGE_IN_OUT_SIN,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [visible, cardOpacity, cardScale, heroPulse]);

  const productMap = useMemo(() => {
    const map = {};
    [...(candles || []), ...(scrubs || [])].forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [candles, scrubs]);

  const selectedProductIds = buildBirthdayBundleProductIds(bundleId, {
    candle1,
    candle2,
    scrub1,
    scrub2,
  });

  const bundleSubtotal = selectedProductIds.reduce(
    (sum, id) => sum + (productMap[id]?.price || 0),
    0
  );
  const bundleTotal = bundleSubtotal * (1 - BIRTHDAY_DISCOUNT_PERCENT / 100);
  const canFinalize = selectedProductIds.length > 0 && selectedProductIds.every((id) => productMap[id]);

  const handleFinalize = () => {
    if (!canFinalize) return;
    onFinalize?.({
      bundleId,
      productIds: selectedProductIds,
      discountPercent: BIRTHDAY_DISCOUNT_PERCENT,
    });
  };

  if (!visible) return null;

  const renderCandlePickers = () => {
    const slots =
      bundleId === 'two-candles'
        ? [
            { label: 'First candle', value: candle1, onSelect: setCandle1 },
            { label: 'Second candle', value: candle2, onSelect: setCandle2 },
          ]
        : [{ label: 'Choose your candle', value: candle1, onSelect: setCandle1 }];

    return slots.map((slot) => (
      <View key={slot.label} style={styles.scentPickerGroup}>
        <Text style={styles.scentPickerHeading}>{slot.label}</Text>
        <View style={styles.scentPickerRow}>
          {(candles || []).map((candle) => (
            <ScentPickerCard
              key={`${slot.label}-${candle.id}`}
              product={candle}
              selected={slot.value === candle.id}
              onPress={() => slot.onSelect(candle.id)}
              label={candle.collection === 'sunrise' ? 'Sunrise' : 'Cloud 9'}
            />
          ))}
        </View>
      </View>
    ));
  };

  const renderScrubPickers = () => {
    const slots =
      bundleId === 'two-scrubs'
        ? [
            { label: 'First body scrub', value: scrub1, onSelect: setScrub1 },
            { label: 'Second body scrub', value: scrub2, onSelect: setScrub2 },
          ]
        : [{ label: 'Choose your body scrub', value: scrub1, onSelect: setScrub1 }];

    return slots.map((slot) => (
      <View key={slot.label} style={styles.scentPickerGroup}>
        <Text style={styles.scentPickerHeading}>{slot.label}</Text>
        <View style={styles.scentPickerRow}>
          {(scrubs || []).map((scrub) => (
            <ScentPickerCard
              key={`${slot.label}-${scrub.id}`}
              product={scrub}
              selected={slot.value === scrub.id}
              onPress={() => slot.onSelect(scrub.id)}
              label={scrub.collection === 'sunrise' ? 'Wild Berry' : 'Cloud 9'}
            />
          ))}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.overlay}>
      <ConfettiLayer active={visible} />
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

      <Animated.View
        style={[
          styles.modalCard,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.heroBadge, { transform: [{ scale: heroPulse }] }]}>
            <Text style={styles.heroEmoji}>🎂</Text>
          </Animated.View>

          <Text style={styles.eyebrow}>BIRTHDAY BOUTIQUE · 50% OFF</Text>
          <Text style={styles.title}>Happy Birthday, {mamaName || 'Beautiful Mama'}!</Text>
          <Text style={styles.subtitle}>
            Your village curated a birthday curation box — mix & match candles and scrubs at half
            price, plus free village stickers & surprise goodies inside.
          </Text>

          <View style={styles.perkBanner}>
            <Text style={styles.perkBannerText}>
              🎁 Every birthday bundle ships with complimentary stickers, tissue wrap & village treats
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Choose your bundle architecture</Text>
          <View style={styles.bundleRow}>
            {BIRTHDAY_BUNDLE_OPTIONS.map((option) => {
              const active = bundleId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.bundleOption, active && styles.bundleOptionActive]}
                  onPress={() => setBundleId(option.id)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.bundleOptionEmoji}>{option.emoji}</Text>
                  <Text style={[styles.bundleOptionLabel, active && styles.bundleOptionLabelActive]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.bundleOptionTitle, active && styles.bundleOptionTitleActive]}>
                    {option.title}
                  </Text>
                  <Text style={styles.bundleOptionSub}>{option.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {bundleId === 'candle-scrub' || bundleId === 'two-candles' ? renderCandlePickers() : null}
          {bundleId === 'candle-scrub' || bundleId === 'two-scrubs' ? renderScrubPickers() : null}

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Birthday boutique total</Text>
            <View style={styles.totalPriceRow}>
              <Text style={styles.totalWas}>${bundleSubtotal.toFixed(2)}</Text>
              <Text style={styles.totalNow}>${bundleTotal.toFixed(2)}</Text>
            </View>
            <Text style={styles.totalHint}>{BIRTHDAY_DISCOUNT_PERCENT}% birthday blessing applied</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finalizeBtn, !canFinalize && styles.finalizeBtnDisabled]}
            onPress={handleFinalize}
            disabled={!canFinalize}
            activeOpacity={0.88}
          >
            <Text style={styles.finalizeBtnText}>Finalize Birthday Goodies 🎁</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.dismissBtnText}>Celebrate quietly for now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    backgroundColor: 'rgba(36, 28, 48, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    fontSize: 16,
    opacity: 0.88,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '92%',
    backgroundColor: 'rgba(255, 252, 250, 0.98)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(232, 218, 244, 0.65)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 24px 60px rgba(80, 60, 100, 0.28)',
      },
      default: {
        shadowColor: '#503C64',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  modalScrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 12,
  },
  heroBadge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(232, 218, 244, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 34,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: '#6B5588',
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2A382E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 28,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5C6E63',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  perkBanner: {
    marginTop: 14,
    backgroundColor: 'rgba(233, 168, 137, 0.18)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.32)',
  },
  perkBannerText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    color: '#6B3D2E',
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#6B5588',
    textTransform: 'uppercase',
  },
  bundleRow: {
    gap: 8,
  },
  bundleOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.42)',
    marginBottom: 8,
  },
  bundleOptionActive: {
    backgroundColor: 'rgba(92, 122, 104, 0.12)',
    borderColor: 'rgba(92, 122, 104, 0.55)',
  },
  bundleOptionEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  bundleOptionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#6B5588',
  },
  bundleOptionLabelActive: {
    color: '#5C7A68',
  },
  bundleOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
    marginTop: 2,
  },
  bundleOptionTitleActive: {
    color: '#2A382E',
  },
  bundleOptionSub: {
    fontSize: 10,
    color: '#5C6E63',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  scentPickerGroup: {
    marginTop: 12,
  },
  scentPickerHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A3860',
    marginBottom: 8,
  },
  scentPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scentCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.38)',
  },
  scentCardSelected: {
    borderColor: 'rgba(92, 122, 104, 0.72)',
    backgroundColor: 'rgba(209, 250, 229, 0.35)',
  },
  scentCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B5588',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scentCardImage: {
    width: '100%',
    height: 62,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 252, 248, 0.9)',
  },
  scentCardTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2A382E',
    lineHeight: 12,
    minHeight: 24,
  },
  scentCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  scentCardPriceOld: {
    fontSize: 9,
    color: '#8A9E92',
    textDecorationLine: 'line-through',
  },
  scentCardPriceNew: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C7A68',
  },
  totalCard: {
    marginTop: 14,
    backgroundColor: 'rgba(232, 218, 244, 0.32)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.25)',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B5588',
    letterSpacing: 0.6,
  },
  totalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  totalWas: {
    fontSize: 12,
    color: '#8A9E92',
    textDecorationLine: 'line-through',
  },
  totalNow: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2A382E',
  },
  totalHint: {
    fontSize: 9,
    color: '#5C6E63',
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 18 : 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 198, 188, 0.28)',
    backgroundColor: 'rgba(255, 252, 250, 0.98)',
  },
  finalizeBtn: {
    backgroundColor: '#5C7A68',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  finalizeBtnDisabled: {
    opacity: 0.45,
  },
  finalizeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  dismissBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dismissBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B5588',
    fontStyle: 'italic',
  },
});
