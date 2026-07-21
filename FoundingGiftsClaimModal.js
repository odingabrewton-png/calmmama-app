import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { VillageTypingDots } from './VillageStreamLoader';
import {
  FOUNDING_GIFT_ITEMS,
  FOUNDING_GIFT_PREVIEW_STYLE,
  FOUNDING_GIFTS_PROMO_COPY,
  FOUNDING_GIFTS_CAP,
  getFoundingGiftPreviewSource,
} from './foundingGiftsConfig';
import { VILLAGE_COMMUNITY } from './designTypography';
import { VILLAGE_SNAPPY_SPRING } from './villageScreenTransitions';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const SAFE_GIFT_ITEMS = Array.isArray(FOUNDING_GIFT_ITEMS) ? FOUNDING_GIFT_ITEMS : [];

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 26, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    ...Platform.select({
      web: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' },
      default: {},
    }),
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: 'rgba(255, 252, 248, 0.97)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 24px 60px rgba(42, 56, 46, 0.22)' },
      default: {
        shadowColor: '#2A382E',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 10,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#6B5588',
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    color: '#2A382E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 28,
  },
  promoCopy: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5C6E63',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  previewRow: {
    marginTop: 14,
    marginHorizontal: -4,
  },
  previewRowContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  previewCard: {
    alignItems: 'center',
    width: 132,
  },
  previewImage: {
    width: FOUNDING_GIFT_PREVIEW_STYLE?.width ?? 120,
    height: FOUNDING_GIFT_PREVIEW_STYLE?.height ?? 120,
    borderRadius: FOUNDING_GIFT_PREVIEW_STYLE?.borderRadius ?? 16,
    backgroundColor: FOUNDING_GIFT_PREVIEW_STYLE?.backgroundColor ?? '#FFF',
    margin: FOUNDING_GIFT_PREVIEW_STYLE?.margin ?? 8,
    alignSelf: 'center',
  },
  previewTitle: {
    fontSize: 11,
    color: '#2A382E',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  previewSub: {
    fontSize: 9,
    color: '#6A7A68',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
    paddingHorizontal: 2,
  },
  slotsBanner: {
    marginTop: 14,
    backgroundColor: 'rgba(92, 122, 104, 0.1)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
  },
  slotsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C7A68',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 198, 188, 0.28)',
  },
  claimBtn: {
    backgroundColor: '#5C7A68',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  claimBtnDisabled: {
    opacity: 0.5,
  },
  claimBtnText: {
    color: '#FFF9F4',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
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

export default function FoundingGiftsClaimModal({
  visible,
  claimCount = 0,
  claiming = false,
  onClose,
  onClaim,
}) {
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const slotsLeft = Math.max(0, FOUNDING_GIFTS_CAP - claimCount);

  useEffect(() => {
    if (!visible) return;
    cardScale.setValue(0.9);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        ...VILLAGE_SNAPPY_SPRING,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [visible, cardOpacity, cardScale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

        <Animated.View
          style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.eyebrow}>FOUNDING SISTERS · FIRST {FOUNDING_GIFTS_CAP}</Text>
            <Text style={[styles.title, VILLAGE_COMMUNITY]}>Your Boutique Gift Bundle</Text>
            <Text style={styles.promoCopy}>{FOUNDING_GIFTS_PROMO_COPY}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.previewRow}
              contentContainerStyle={styles.previewRowContent}
            >
              {SAFE_GIFT_ITEMS.map((item, index) => {
                if (!item) return null;
                const previewSource = getFoundingGiftPreviewSource(item);
                return (
                  <View key={item?.id ?? `gift-${index}`} style={styles.previewCard}>
                    <Image
                      source={previewSource}
                      style={styles.previewImage}
                      resizeMode={FOUNDING_GIFT_PREVIEW_STYLE?.resizeMode ?? 'contain'}
                    />
                    <Text style={[styles.previewTitle, VILLAGE_COMMUNITY]} numberOfLines={2}>
                      {item?.title ?? 'Gift item'}
                    </Text>
                    <Text style={styles.previewSub} numberOfLines={3}>
                      {item?.subtitle ?? ''}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.slotsBanner}>
              <Text style={styles.slotsText}>
                {slotsLeft > 0
                  ? `${slotsLeft} of ${FOUNDING_GIFTS_CAP} founding bundles remaining`
                  : 'All founding bundles have been claimed'}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.claimBtn, (claiming || slotsLeft === 0) && styles.claimBtnDisabled]}
              onPress={onClaim}
              disabled={claiming || slotsLeft === 0}
              activeOpacity={0.88}
            >
              {claiming ? (
                <VillageTypingDots color="#FFF9F4" dotSize={6} gap={5} />
              ) : (
                <Text style={styles.claimBtnText}>
                  {slotsLeft > 0 ? 'Claim My Free Bundle 🎁' : 'Bundle Fully Claimed'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.dismissBtnText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
