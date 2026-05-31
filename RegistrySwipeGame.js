import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { injectNurseryWebFonts, retroSoft, retroAccent, retroHubTitle } from './nurseryRetroFonts';
import { IMAGE_TINTS } from './registryData';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const THEME = {
  sage: '#8BAF9A',
  sageDark: '#5C7A68',
  sageLight: 'rgba(186, 214, 198, 0.55)',
  lavender: '#B8A4D4',
  lavenderDark: '#8B74A8',
  lavenderLight: 'rgba(210, 190, 225, 0.55)',
};

function buildExportText(wishlist) {
  return wishlist
    .map(
      (item, index) =>
        `${index + 1}. ${item.title} (${item.category})\n` +
        `   Curated by: ${item.curatedBy}\n` +
        `   Amazon: ${item.links.amazon}\n` +
        `   Target: ${item.links.target}\n` +
        `   Babylist: ${item.links.babylist}`
    )
    .join('\n\n');
}

function ExportWishlistModal({ visible, exportText, copyStatus, onClose }) {
  if (!visible) return null;

  return (
    <View style={styles.exportOverlay}>
      <View style={styles.exportSheet}>
        <Text style={[styles.exportSheetTitle, retroAccent]}>Your Village Wishlist</Text>
        <Text style={[styles.exportSheetSub, retroSoft]}>
          {copyStatus === 'copied'
            ? 'Links copied to your clipboard — paste anywhere you like.'
            : 'Copy the links below to save or share.'}
        </Text>
        <ScrollView style={styles.exportScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.exportBody, retroSoft]} selectable>
            {exportText}
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.exportDoneBtn} onPress={onClose} activeOpacity={0.88}>
          <Text style={styles.exportDoneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RegistryProductImage({ product, style, emojiStyle }) {
  const [failed, setFailed] = useState(false);
  const source = product.imageUrl ? { uri: product.imageUrl } : product.imageSource;

  if (!source || failed) {
    return <Text style={emojiStyle}>{product.imageEmoji}</Text>;
  }

  return (
    <Image source={source} style={style} resizeMode="cover" onError={() => setFailed(true)} />
  );
}

function RegistryProductCard({ product }) {
  const tint = IMAGE_TINTS[product.imageTint] || IMAGE_TINTS.sage;

  return (
    <View style={styles.productCard}>
      <View style={[styles.productImageWrap, { backgroundColor: tint.bg, borderColor: tint.border }]}>
        <RegistryProductImage
          product={product}
          style={styles.productImageFill}
          emojiStyle={styles.productImageEmoji}
        />
      </View>
      <Text style={styles.productCategory}>{product.category}</Text>
      <Text style={[styles.productTitle, retroAccent]}>{product.title}</Text>

      <View style={styles.curatorNoteCard}>
        <Text style={[styles.curatorLabel, retroSoft]}>
          Curated by Postpartum Mama {product.curatedBy}
        </Text>
        <Text style={[styles.curatorTip, retroSoft]}>"{product.tip}"</Text>
      </View>
    </View>
  );
}

function CategoryChips({ categories, selected, onSelect }) {
  if (!categories.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}
        activeOpacity={0.88}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>
      {categories.map((cat) => {
        const active = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.88}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function openExternalLink(url) {
  if (!url) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function SavedRegistryList({ wishlist }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = Array.from(
    new Set((wishlist ?? []).map((i) => i.category).filter(Boolean))
  ).slice(0, 12);

  const items = (wishlist ?? [])
    .filter((i) => !selectedCategory || i.category === selectedCategory)
    .slice()
    .reverse(); // newest saved last -> show newest first after reverse? wishlist appended in App.js

  return (
    <View style={styles.savedWrap}>
      <View style={styles.savedHeaderRow}>
        <Text style={[styles.savedTitle, retroAccent]}>Saved Village Registry</Text>
        <Text style={styles.savedCount}>{wishlist.length} items</Text>
      </View>

      <CategoryChips
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <View style={styles.savedList}>
        {items.map((item) => {
          const tint = IMAGE_TINTS[item.imageTint] || IMAGE_TINTS.sage;
          return (
            <View key={item.id} style={styles.savedItemCard}>
              <View style={[styles.savedThumb, { backgroundColor: tint.bg, borderColor: tint.border }]}>
                <Text style={styles.savedThumbEmoji}>{item.imageEmoji}</Text>
              </View>
              <View style={styles.savedMeta}>
                <Text style={styles.savedCategory}>{item.category}</Text>
                <Text style={[styles.savedItemTitle, retroSoft]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.savedCurator} numberOfLines={1}>
                  Curated by {item.curatedBy}
                </Text>
                <View style={styles.savedLinkRow}>
                  <TouchableOpacity
                    style={[styles.linkBtn, styles.linkBtnAmazon]}
                    onPress={() => openExternalLink(item.links?.amazon)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.linkBtnText}>Amazon</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.linkBtn, styles.linkBtnTarget]}
                    onPress={() => openExternalLink(item.links?.target)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.linkBtnText}>Target</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.linkBtn, styles.linkBtnBabylist]}
                    onPress={() => openExternalLink(item.links?.babylist)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.linkBtnText}>Babylist</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function RegistrySwipeGame({ deck, wishlist, onSkip, onSave }) {
  const current = deck[0] ?? null;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardRotate = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [exportText, setExportText] = useState('');
  const [copyStatus, setCopyStatus] = useState('manual');

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  useEffect(() => {
    cardSlide.setValue(0);
    cardOpacity.setValue(1);
    cardRotate.setValue(0);
  }, [current?.id, cardSlide, cardOpacity, cardRotate]);

  const animateCardOut = (direction, onComplete) => {
    if (isAnimating || !current) return;
    setIsAnimating(true);
    const toX = direction === 'save' ? 320 : -320;
    const toRotate = direction === 'save' ? 12 : -12;

    Animated.parallel([
      Animated.timing(cardSlide, {
        toValue: toX,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(cardRotate, {
        toValue: toRotate,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      onComplete();
      setIsAnimating(false);
    });
  };

  const handleSkip = () => {
    animateCardOut('skip', () => onSkip(current.id));
  };

  const handleSave = () => {
    animateCardOut('save', () => onSave(current));
  };

  const handleExportPress = async () => {
    if (wishlist.length === 0) return;
    const text = buildExportText(wishlist);
    setExportText(text);
    setCopyStatus('manual');

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyStatus('copied');
      } catch {
        setCopyStatus('manual');
      }
    }

    setExportVisible(true);
  };

  if (!current && wishlist.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, retroHubTitle]}>Village Registry Swipe</Text>
        <View style={styles.wishlistPill}>
          <Text style={styles.wishlistPillText}>♥ {wishlist.length} saved</Text>
        </View>
      </View>
      <Text style={[styles.sectionSub, retroSoft]}>
        Swipe through postpartum-mama picks — save favorites to export later
      </Text>

      {current ? (
        <>
          <View style={styles.cardStage}>
            {deck[1] ? (
              <View style={[styles.cardBack, styles.cardShadow]} pointerEvents="none">
                <View style={styles.cardBackInner} />
              </View>
            ) : null}
            <Animated.View
              style={[
                styles.cardFront,
                styles.cardShadow,
                {
                  opacity: cardOpacity,
                  transform: [
                    { translateX: cardSlide },
                    {
                      rotate: cardRotate.interpolate({
                        inputRange: [-20, 20],
                        outputRange: ['-20deg', '20deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <RegistryProductCard product={current} />
            </Animated.View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.skipBtn]}
              onPress={handleSkip}
              disabled={isAnimating}
              activeOpacity={0.88}
              accessibilityLabel="Skip item"
            >
              <Text style={styles.skipBtnIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.actionHint}>{deck.length} left in deck</Text>
            <TouchableOpacity
              style={[styles.actionBtn, styles.heartBtn]}
              onPress={handleSave}
              disabled={isAnimating}
              activeOpacity={0.88}
              accessibilityLabel="Save to wishlist"
            >
              <Text style={styles.heartBtnIcon}>♥</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.doneCard}>
          <Text style={[styles.doneTitle, retroAccent]}>You browsed the village deck!</Text>
          <Text style={[styles.doneSub, retroSoft]}>
            {wishlist.length > 0
              ? `${wishlist.length} treasures saved — export your links whenever you are ready.`
              : 'Check back soon for more curated picks from local mamas.'}
          </Text>
        </View>
      )}

      {wishlist.length > 0 ? (
        <>
          <SavedRegistryList wishlist={wishlist} />
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportPress} activeOpacity={0.88}>
            <Text style={styles.exportBtnText}>Export Wishlist Links</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <ExportWishlistModal
        visible={exportVisible}
        exportText={exportText}
        copyStatus={copyStatus}
        onClose={() => setExportVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    paddingHorizontal: 2,
    position: 'relative',
  },
  savedWrap: {
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 252, 248, 0.52)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    ...Platform.select({
      web: { boxShadow: '0 8px 22px rgba(92, 122, 104, 0.1)' },
      default: { elevation: 3 },
    }),
  },
  savedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savedTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2A382E',
  },
  savedCount: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B3D2E',
  },
  chipRow: {
    gap: 8,
    paddingBottom: 10,
    paddingRight: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
  },
  chipActive: {
    backgroundColor: THEME.lavenderLight,
    borderColor: 'rgba(139, 116, 168, 0.35)',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C6E63',
    maxWidth: 160,
  },
  chipTextActive: {
    color: THEME.lavenderDark,
  },
  savedList: {
    gap: 10,
  },
  savedItemCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.3)',
  },
  savedThumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedThumbEmoji: {
    fontSize: 26,
  },
  savedMeta: {
    flex: 1,
    minWidth: 0,
  },
  savedCategory: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.sageDark,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  savedItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2E24',
    lineHeight: 16,
  },
  savedCurator: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '700',
    color: '#6B3D2E',
    fontStyle: 'italic',
  },
  savedLinkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  linkBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  linkBtnAmazon: {
    backgroundColor: 'rgba(186, 214, 198, 0.55)',
    borderColor: 'rgba(92, 122, 104, 0.35)',
  },
  linkBtnTarget: {
    backgroundColor: 'rgba(210, 190, 225, 0.55)',
    borderColor: 'rgba(139, 116, 168, 0.35)',
  },
  linkBtnBabylist: {
    backgroundColor: 'rgba(233, 168, 137, 0.28)',
    borderColor: 'rgba(163, 83, 56, 0.28)',
  },
  linkBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2A382E',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#2A382E',
    flex: 1,
  },
  wishlistPill: {
    backgroundColor: THEME.lavenderLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.35)',
  },
  wishlistPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.lavenderDark,
  },
  sectionSub: {
    fontSize: 11,
    color: '#4A5C50',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 16,
  },
  cardStage: {
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardBack: {
    position: 'absolute',
    width: '92%',
    height: 300,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    transform: [{ scale: 0.96 }, { translateY: 8 }],
  },
  cardBackInner: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(210, 190, 225, 0.2)',
  },
  cardFront: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 252, 248, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
  },
  cardShadow: Platform.select({
    web: { boxShadow: '0 12px 32px rgba(92, 122, 104, 0.14)' },
    default: {
      shadowColor: '#5C7A68',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  }),
  productCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  productImageWrap: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImageFill: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
  productImageEmoji: {
    fontSize: 52,
  },
  productCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.sageDark,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2E24',
    lineHeight: 20,
    marginBottom: 12,
  },
  curatorNoteCard: {
    backgroundColor: THEME.lavenderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.3)',
  },
  curatorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.lavenderDark,
    marginBottom: 6,
  },
  curatorTip: {
    fontSize: 11,
    color: '#3D5246',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 4,
  },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    ...Platform.select({
      web: { boxShadow: '0 6px 16px rgba(92, 122, 104, 0.18)' },
      default: { elevation: 4 },
    }),
  },
  skipBtn: {
    backgroundColor: THEME.sageLight,
    borderColor: THEME.sage,
  },
  skipBtnIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.sageDark,
    marginTop: -2,
  },
  heartBtn: {
    backgroundColor: THEME.lavenderLight,
    borderColor: THEME.lavender,
  },
  heartBtnIcon: {
    fontSize: 24,
    color: THEME.lavenderDark,
    marginTop: 2,
  },
  actionHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C6E63',
    fontStyle: 'italic',
    minWidth: 72,
    textAlign: 'center',
  },
  doneCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.55)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    marginBottom: 12,
    alignItems: 'center',
  },
  doneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A382E',
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 11,
    color: '#4A5C50',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  exportBtn: {
    backgroundColor: THEME.sageDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.sage,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  exportOverlay: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      default: StyleSheet.absoluteFillObject,
    }),
    backgroundColor: 'rgba(42, 56, 46, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  exportSheet: {
    width: '100%',
    maxHeight: '72%',
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 116, 168, 0.4)',
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(92, 122, 104, 0.22)' },
      default: { elevation: 10 },
    }),
  },
  exportSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A382E',
    textAlign: 'center',
    marginBottom: 6,
  },
  exportSheetSub: {
    fontSize: 11,
    color: '#5C6E63',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 16,
  },
  exportScroll: {
    maxHeight: 280,
    marginBottom: 14,
    backgroundColor: THEME.sageLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.25)',
  },
  exportBody: {
    fontSize: 11,
    color: '#1F2E24',
    lineHeight: 17,
  },
  exportDoneBtn: {
    backgroundColor: THEME.lavenderDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.lavender,
  },
  exportDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
