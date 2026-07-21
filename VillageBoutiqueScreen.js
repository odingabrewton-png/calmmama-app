import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Linking,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MIDNIGHT } from './midnightLoungeTheme';
import {
  BOUTIQUE_PRODUCTS,
  formatBoutiquePrice,
  getBoutiqueProductImages,
  getBoutiqueThumbUrl,
  isBoutiqueProductAvailable,
  resetBoutiqueImageWarm,
  warmBoutiqueCatalogImages,
} from './boutiqueProductsData';
import { LIST_PERF } from './tabShellConfig';
import { KITCHEN_SERIF } from './designTypography';
import { injectNurseryWebFonts, retroAccent } from './nurseryRetroFonts';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const DETAIL_FADE_MS = 280;
const DETAIL_EASING = Easing.inOut(Easing.cubic);
const GRID_GAP = 12;
const H_PAD = 16;
const COLS = 2;
const SCREEN_W = Dimensions.get('window').width;
const GALLERY_W = SCREEN_W - H_PAD * 2;
const GALLERY_H = Math.min(360, Math.round(GALLERY_W * 1.08));

/** Same rose-gold family as Bloom "Mama's Journey" on dark lounge. */
const BOUTIQUE_ROSE_GOLD = '#E2C2A8';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

/** Soft writing-style serif for product names (Shopify-adjacent elegant display). */
const PRODUCT_SCRIPT = {
  ...retroAccent,
  fontStyle: 'italic',
};

function getCardWidth() {
  return (SCREEN_W - H_PAD * 2 - GRID_GAP) / COLS;
}

function ProductCard({ product, cardWidth, onPress }) {
  const available = isBoutiqueProductAvailable(product);
  const thumb = getBoutiqueThumbUrl(product.imageUrl, 640);

  return (
    <Pressable
      onPress={() => onPress(product)}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth },
        pressed && styles.cardPressed,
        !available && styles.cardSoldOut,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatBoutiquePrice(product.price)}`}
    >
      <View style={[styles.cardImageWrap, { height: cardWidth * 1.05 }]}>
        <Image
          source={{ uri: thumb }}
          style={styles.cardImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={product.id}
          transition={180}
        />
        {!available ? (
          <View style={styles.soldBadge}>
            <Text style={[styles.soldBadgeText, SANS]}>Sold out</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.cardTitle, PRODUCT_SCRIPT]} numberOfLines={3}>
        {product.title}
      </Text>
      <Text style={[styles.cardPrice, SANS]}>{formatBoutiquePrice(product.price)}</Text>
    </Pressable>
  );
}

function MockupGallery({ images, productId }) {
  const [page, setPage] = useState(0);
  const count = images.length;

  const onScrollEnd = useCallback(
    (event) => {
      const x = event.nativeEvent.contentOffset.x;
      const next = Math.round(x / GALLERY_W);
      setPage(Math.max(0, Math.min(count - 1, next)));
    },
    [count],
  );

  if (!count) return null;

  return (
    <View style={styles.galleryWrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        style={styles.galleryScroll}
        contentContainerStyle={styles.galleryContent}
      >
        {images.map((uri, index) => (
          <View key={`${productId}-${index}`} style={[styles.gallerySlide, { width: GALLERY_W }]}>
            <Image
              source={{ uri: getBoutiqueThumbUrl(uri) }}
              style={styles.galleryImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`${productId}-mock-${index}`}
              transition={160}
            />
          </View>
        ))}
      </ScrollView>

      {count > 1 ? (
        <>
          <View style={styles.galleryDots}>
            {images.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[styles.galleryDot, index === page && styles.galleryDotActive]}
              />
            ))}
          </View>
          <Text style={[styles.galleryHint, SANS]}>
            Swipe mockups · {page + 1} of {count}
          </Text>
        </>
      ) : null}
    </View>
  );
}

function ProductDetail({ product, opacity, onShop }) {
  if (!product) return null;
  const available = isBoutiqueProductAvailable(product);
  const images = getBoutiqueProductImages(product);

  return (
    <Animated.View style={[styles.detailLayer, { opacity }]} pointerEvents="auto">
      <ScrollView
        style={styles.detailScroll}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MockupGallery images={images} productId={product.id} />

        <Text style={[styles.detailTitle, PRODUCT_SCRIPT]}>{product.title}</Text>
        <Text style={[styles.detailPrice, SANS]}>{formatBoutiquePrice(product.price)}</Text>
        <Text style={[styles.detailBrowseNote, SANS]}>
          Browse every mockup here first. When you are ready, continue to the official store to
          choose size/color and checkout.
        </Text>

        <TouchableOpacity
          style={[styles.shopBtn, !available && styles.shopBtnDisabled]}
          onPress={onShop}
          activeOpacity={0.88}
          disabled={!available}
          accessibilityRole="button"
          accessibilityLabel="Continue to official Village Boutique website"
        >
          <Text style={[styles.shopBtnText, SANS]}>
            {available ? 'Continue to official store →' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.shopHint, SANS]}>
          Opens calmmamavillagemerch.com so you can finish checkout securely.
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

/**
 * Native Village Boutique — local catalog for instant browse;
 * Shopify product URLs only when mama taps Shop now.
 */
const VillageBoutiqueScreen = forwardRef(function VillageBoutiqueScreen(
  { onCanGoBackChange },
  ref,
) {
  const [selectedId, setSelectedId] = useState(null);
  const detailOpacity = useRef(new Animated.Value(0)).current;
  const catalogOpacity = useRef(new Animated.Value(1)).current;
  const animatingRef = useRef(false);
  const cardWidth = useMemo(() => getCardWidth(), []);

  const selectedProduct = useMemo(
    () => BOUTIQUE_PRODUCTS.find((p) => p.id === selectedId) || null,
    [selectedId],
  );

  useEffect(() => {
    injectNurseryWebFonts();
    resetBoutiqueImageWarm();
    warmBoutiqueCatalogImages();
  }, []);

  const notifyCanGoBack = useCallback(
    (canGoBack) => {
      onCanGoBackChange?.(Boolean(canGoBack));
    },
    [onCanGoBackChange],
  );

  const openDetail = useCallback(
    (product) => {
      if (!product || animatingRef.current) return;
      animatingRef.current = true;
      setSelectedId(product.id);
      notifyCanGoBack(true);
      detailOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(catalogOpacity, {
          toValue: 0.35,
          duration: DETAIL_FADE_MS,
          easing: DETAIL_EASING,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(detailOpacity, {
          toValue: 1,
          duration: DETAIL_FADE_MS,
          easing: DETAIL_EASING,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(() => {
        animatingRef.current = false;
      });
    },
    [catalogOpacity, detailOpacity, notifyCanGoBack],
  );

  const closeDetail = useCallback(() => {
    if (!selectedId || animatingRef.current) return false;
    animatingRef.current = true;
    Animated.parallel([
      Animated.timing(detailOpacity, {
        toValue: 0,
        duration: DETAIL_FADE_MS,
        easing: DETAIL_EASING,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(catalogOpacity, {
        toValue: 1,
        duration: DETAIL_FADE_MS,
        easing: DETAIL_EASING,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(({ finished }) => {
      animatingRef.current = false;
      if (!finished) return;
      setSelectedId(null);
      notifyCanGoBack(false);
    });
    return true;
  }, [catalogOpacity, detailOpacity, notifyCanGoBack, selectedId]);

  useImperativeHandle(
    ref,
    () => ({
      goBack: () => closeDetail(),
      canGoBack: () => Boolean(selectedId),
    }),
    [closeDetail, selectedId],
  );

  const handleShop = useCallback(() => {
    if (!selectedProduct?.productUrl) return;
    Linking.openURL(selectedProduct.productUrl).catch(() => {});
  }, [selectedProduct]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard product={item} cardWidth={cardWidth} onPress={openDetail} />
    ),
    [cardWidth, openDetail],
  );

  return (
    <View style={styles.shell}>
      <Animated.View
        style={[styles.catalogLayer, { opacity: catalogOpacity }]}
        pointerEvents={selectedId ? 'none' : 'auto'}
      >
        <Text style={[styles.heading, KITCHEN_SERIF]}>The Village Boutique</Text>
        <Text style={[styles.subhead, SANS]}>
          Live Calm Mama Village merch — tap an item, swipe the mockups, then continue to checkout.
        </Text>
        <FlatList
          data={BOUTIQUE_PRODUCTS}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={COLS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          {...LIST_PERF}
        />
      </Animated.View>

      {selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          opacity={detailOpacity}
          onShop={handleShop}
        />
      ) : null}
    </View>
  );
});

export default VillageBoutiqueScreen;

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    backgroundColor: MIDNIGHT.bg,
    overflow: 'hidden',
  },
  catalogLayer: {
    flex: 1,
  },
  heading: {
    fontSize: 34,
    fontWeight: '800',
    color: BOUTIQUE_ROSE_GOLD,
    paddingHorizontal: H_PAD,
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 40,
    letterSpacing: 0.2,
  },
  subhead: {
    fontSize: 16,
    lineHeight: 24,
    color: MIDNIGHT.textSecondary,
    paddingHorizontal: H_PAD,
    marginBottom: 18,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: 28,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  card: {
    backgroundColor: MIDNIGHT.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cardSoldOut: {
    opacity: 0.72,
  },
  cardImageWrap: {
    width: '100%',
    backgroundColor: MIDNIGHT.bgElevated,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  soldBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(20, 18, 28, 0.78)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  soldBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: MIDNIGHT.peach,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MIDNIGHT.textPrimary,
    lineHeight: 20,
    paddingHorizontal: 10,
    marginTop: 10,
    minHeight: 60,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: MIDNIGHT.accentGold,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  detailLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MIDNIGHT.bg,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    zIndex: 4,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    paddingBottom: 36,
  },
  galleryWrap: {
    marginBottom: 14,
  },
  galleryScroll: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: MIDNIGHT.bgElevated,
  },
  galleryContent: {
    alignItems: 'stretch',
  },
  gallerySlide: {
    height: GALLERY_H,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  galleryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(232, 229, 247, 0.28)',
  },
  galleryDotActive: {
    backgroundColor: MIDNIGHT.accentGold,
    width: 16,
  },
  galleryHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    lineHeight: 30,
    marginBottom: 8,
  },
  detailPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: MIDNIGHT.accentGold,
    marginBottom: 10,
  },
  detailBrowseNote: {
    fontSize: 13,
    lineHeight: 19,
    color: MIDNIGHT.textSecondary,
    marginBottom: 18,
  },
  shopBtn: {
    backgroundColor: '#8B4A35',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  shopBtnDisabled: {
    opacity: 0.45,
  },
  shopBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  shopHint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
  },
});
