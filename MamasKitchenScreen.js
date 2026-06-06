import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  Image,
  Animated,
  Easing,
  Linking,
  Modal,
  Dimensions,
} from 'react-native';
import {
  MAMA_KITCHEN_RECIPES,
  KITCHEN_FILTERS,
  filterKitchenRecipes,
  getDefaultKitchenTimeOfDay,
} from './mealsData';
import { getTherapeuticMeals } from './mealsTherapeuticMap';
import { getKitchenImageUrl, KITCHEN_PLACEHOLDER_URL } from './kitchenMealImages';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const PHONE_MAX_W = 480;
const H_PAD = 16;
const GRID_GAP = 12;
const THREE_COL_BREAKPOINT = 360;

const MEAL_TABS = [
  { id: 'morning', label: 'Morning', Icon: IconRisingSun },
  { id: 'afternoon', label: 'Noon', Icon: IconFullSun },
  { id: 'night', label: 'Night', Icon: IconCrescentMoon },
];

const THEME = {
  sage: '#5C7A68',
  gold: '#C4A574',
  goldSoft: 'rgba(196, 165, 116, 0.28)',
  goldGlow: 'rgba(196, 165, 116, 0.45)',
  ink: '#1E2622',
  inkSoft: '#5C6E63',
  cream: 'rgba(255, 252, 248, 0.88)',
  glass: 'rgba(255, 255, 255, 0.62)',
  instacart: '#43B02A',
  amazon: '#232F3E',
  amazonSmile: '#FF9900',
};

function useGridLayout() {
  const [screenW, setScreenW] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setScreenW(window.width));
    return () => sub?.remove?.();
  }, []);

  const contentW = Math.min(screenW, PHONE_MAX_W);
  const columns = screenW >= THREE_COL_BREAKPOINT ? 3 : 2;
  const cellW = Math.floor((contentW - H_PAD * 2 - GRID_GAP * (columns - 1)) / columns);

  return { contentW, columns, cellW, screenW };
}

/* ── Minimal line-art tab icons ── */
function IconRisingSun({ color = THEME.ink, size = 18 }) {
  return (
    <View style={[iconStyles.wrap, { width: size, height: size }]}>
      <View style={[iconStyles.horizon, { backgroundColor: color, width: size * 0.9 }]} />
      <View
        style={[
          iconStyles.sunArc,
          { borderColor: color, width: size * 0.55, height: size * 0.28, bottom: size * 0.22 },
        ]}
      />
      <View style={[iconStyles.ray, { backgroundColor: color, top: 0, height: size * 0.22 }]} />
      <View style={[iconStyles.ray, { backgroundColor: color, top: 2, left: 2, height: size * 0.16, transform: [{ rotate: '-28deg' }] }]} />
      <View style={[iconStyles.ray, { backgroundColor: color, top: 2, right: 2, height: size * 0.16, transform: [{ rotate: '28deg' }] }]} />
    </View>
  );
}

function IconFullSun({ color = THEME.ink, size = 18 }) {
  return (
    <View style={[iconStyles.wrap, { width: size, height: size }]}>
      <View style={[iconStyles.fullSun, { borderColor: color, width: size * 0.52, height: size * 0.52 }]} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <View
          key={deg}
          style={[
            iconStyles.sunRay,
            {
              backgroundColor: color,
              transform: [{ rotate: `${deg}deg` }, { translateY: -(size * 0.38) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function IconCrescentMoon({ color = THEME.ink, size = 18 }) {
  return (
    <View style={[iconStyles.wrap, { width: size, height: size }]}>
      <View style={[iconStyles.moonOuter, { borderColor: color, width: size * 0.62, height: size * 0.62 }]} />
      <View
        style={[
          iconStyles.moonInner,
          {
            backgroundColor: '#F7F3EE',
            width: size * 0.48,
            height: size * 0.48,
            right: size * 0.04,
            top: size * 0.04,
          },
        ]}
      />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  horizon: { position: 'absolute', bottom: 2, height: 1.5, borderRadius: 1 },
  sunArc: {
    position: 'absolute',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  ray: { position: 'absolute', width: 1.5, borderRadius: 1 },
  fullSun: { borderRadius: 999, borderWidth: 1.5 },
  sunRay: { position: 'absolute', width: 1.5, height: 4, borderRadius: 1 },
  moonOuter: { borderRadius: 999, borderWidth: 1.5 },
  moonInner: { position: 'absolute', borderRadius: 999 },
});

const RecipeMealImage = memo(function RecipeMealImage({ recipe, style, resizeMode = 'cover' }) {
  const primaryUri = recipe?.imageUrl || getKitchenImageUrl(recipe);
  const [uri, setUri] = useState(primaryUri);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUri(primaryUri);
    setFailed(false);
  }, [primaryUri, recipe?.id]);

  if (failed) {
    return (
      <View style={[style, styles.imageFallback]}>
        <Text style={styles.imageFallbackEmoji}>🥗</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        if (uri !== KITCHEN_PLACEHOLDER_URL) setUri(KITCHEN_PLACEHOLDER_URL);
        else setFailed(true);
      }}
    />
  );
});

const GridMealTile = memo(function GridMealTile({ recipe, cellW, onPress }) {
  if (recipe?.__pad) return <View style={{ width: cellW }} pointerEvents="none" />;

  return (
    <TouchableOpacity
      style={[styles.gridTile, { width: cellW }]}
      onPress={() => onPress(recipe)}
      activeOpacity={0.92}
    >
      <View style={[styles.gridImageWrap, { width: cellW, height: cellW * 1.05 }]}>
        <RecipeMealImage recipe={recipe} style={styles.gridImage} />
      </View>
      <Text style={styles.gridLabel} numberOfLines={2}>
        {recipe.title}
      </Text>
    </TouchableOpacity>
  );
});

function HybridKitchenHeader({
  activeTab,
  onTabChange,
  filtersOpen,
  onToggleFilters,
  activeFilter,
  onFilterChange,
  tabHighlightX,
  tabSlotW,
  onTabTrackLayout,
}) {
  const filterCount = activeFilter ? 1 : 0;

  return (
    <View style={styles.headerWrap}>
      <View style={styles.glassCapsule}>
        <View style={styles.tabTrack} onLayout={onTabTrackLayout}>
          {tabSlotW > 0 ? (
            <Animated.View
              style={[
                styles.tabHighlight,
                {
                  width: tabSlotW,
                  transform: [{ translateX: tabHighlightX }],
                },
              ]}
            />
          ) : null}

          {MEAL_TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.Icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabSlot}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.88}
              >
                <Icon color={active ? THEME.ink : 'rgba(92, 122, 104, 0.55)'} size={17} />
                <Text style={[styles.tabSublabel, active && styles.tabSublabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.filtersBtn} onPress={onToggleFilters} activeOpacity={0.88}>
          <Text style={styles.filtersBtnText}>
            Filters {filtersOpen ? '▴' : '▽'}
            {filterCount ? ' ·' : ''}
          </Text>
          {filterCount ? <View style={styles.filtersDot} /> : null}
        </TouchableOpacity>
      </View>

      {filtersOpen ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterPanel}
          contentContainerStyle={styles.filterPanelContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === null && styles.filterChipActive]}
            onPress={() => onFilterChange(null)}
          >
            <Text style={[styles.filterChipText, activeFilter === null && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {KITCHEN_FILTERS.map((f) => {
            const on = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, on && styles.filterChipActive]}
                onPress={() => onFilterChange(on ? null : f.id)}
              >
                <Text style={[styles.filterChipText, on && styles.filterChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

function InstacartLogoMark() {
  return (
    <View style={styles.logoInstacart}>
      <Text style={styles.logoInstacartText}>instacart</Text>
    </View>
  );
}

function AmazonFreshLogoMark() {
  return (
    <View style={styles.logoAmazonRow}>
      <Text style={styles.logoAmazonText}>amazon</Text>
      <Text style={styles.logoAmazonFresh}>fresh</Text>
    </View>
  );
}

function MealDetailSheet({
  recipe,
  visible,
  onClose,
  sheetAnim,
  backdropAnim,
  badgeAnim,
  contentW,
}) {
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    if (visible && recipe) setChecked(new Set());
  }, [visible, recipe?.id]);

  if (!recipe) return null;

  const toggleIngredient = (item) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const openLink = (url) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const badgeScale = badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const useSideBySide = contentW >= 380;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.sheetBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetPanel,
            {
              opacity: backdropAnim,
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
            {/* Header zone */}
            <RecipeMealImage recipe={recipe} style={styles.sheetHero} />
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>{recipe.title}</Text>
              <Animated.View style={[styles.prepBadge, { transform: [{ scale: badgeScale }] }]}>
                <Text style={styles.prepBadgeText}>{recipe.prepMinutes} min prep</Text>
              </Animated.View>
            </View>

            {/* Content zone */}
            <View style={[styles.contentZone, useSideBySide && styles.contentZoneRow]}>
              <View style={[styles.contentCol, useSideBySide && styles.contentColHalf]}>
                <Text style={styles.zoneLabel}>Ingredients</Text>
                <View style={styles.zoneCard}>
                  {recipe.ingredients.map((item) => {
                    const done = checked.has(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        style={styles.checkRow}
                        onPress={() => toggleIngredient(item)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.checkBox, done && styles.checkBoxDone]}>
                          {done ? <Text style={styles.checkMark}>✓</Text> : null}
                        </View>
                        <Text style={[styles.checkText, done && styles.checkTextDone]}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.contentCol, useSideBySide && styles.contentColHalf]}>
                <Text style={styles.zoneLabel}>Recipe Steps</Text>
                <View style={styles.zoneCard}>
                  {recipe.steps.map((step, i) => (
                    <View key={step} style={styles.stepRow}>
                      <View style={styles.stepTimeline}>
                        <View style={styles.stepDot} />
                        {i < recipe.steps.length - 1 ? <View style={styles.stepLine} /> : null}
                      </View>
                      <View style={styles.stepBody}>
                        <Text style={styles.stepNum}>Step {i + 1}</Text>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Integration footer */}
          <View style={styles.sheetFooter}>
            <Text style={styles.footerHeading}>Order Ingredients via:</Text>
            <View style={styles.footerBtns}>
              <TouchableOpacity
                style={styles.shopBtnInstacart}
                onPress={() => openLink(recipe.instacartUrl)}
                activeOpacity={0.9}
              >
                <InstacartLogoMark />
                <Text style={styles.shopBtnCaption}>Instacart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shopBtnAmazon}
                onPress={() => openLink(recipe.amazonUrl)}
                activeOpacity={0.9}
              >
                <AmazonFreshLogoMark />
                <Text style={styles.shopBtnCaption}>Amazon Fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function MamasKitchenScreen({ therapeuticTags, listHeaderPrefix = null }) {
  const { columns, cellW, contentW } = useGridLayout();
  const [activeTab, setActiveTab] = useState(getDefaultKitchenTimeOfDay);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabTrackW, setTabTrackW] = useState(0);

  const sheetTranslateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const prepBadgeAnim = useRef(new Animated.Value(0)).current;
  const tabHighlightX = useRef(new Animated.Value(0)).current;

  const tabIndex = MEAL_TABS.findIndex((t) => t.id === activeTab);
  const tabSlotW = tabTrackW > 0 ? tabTrackW / MEAL_TABS.length : 0;

  useEffect(() => {
    if (tabSlotW <= 0) return;
    Animated.spring(tabHighlightX, {
      toValue: tabIndex * tabSlotW,
      damping: 22,
      stiffness: 260,
      mass: 0.85,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [tabIndex, tabSlotW, tabHighlightX]);

  const filteredMeals = useMemo(() => {
    let base = filterKitchenRecipes(MAMA_KITCHEN_RECIPES, activeFilter, activeTab);
    if (therapeuticTags?.length) {
      base = getTherapeuticMeals(base, therapeuticTags, 150);
    }
    return base;
  }, [activeFilter, activeTab, therapeuticTags]);

  const gridData = useMemo(() => {
    const items = [...filteredMeals];
    const rem = items.length % columns;
    if (rem !== 0) {
      for (let i = 0; i < columns - rem; i += 1) {
        items.push({ id: `__pad_${i}`, __pad: true });
      }
    }
    return items;
  }, [filteredMeals, columns]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const openRecipe = useCallback(
    (recipe) => {
      setSelectedRecipe(recipe);
      setSheetOpen(true);
      sheetTranslateY.setValue(500);
      backdropOpacity.setValue(0);
      prepBadgeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 24,
          stiffness: 210,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(prepBadgeAnim, {
          toValue: 1,
          delay: 160,
          damping: 11,
          stiffness: 170,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    },
    [sheetTranslateY, backdropOpacity, prepBadgeAnim]
  );

  const closeRecipe = useCallback(() => {
    prepBadgeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 500,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      setSheetOpen(false);
      setSelectedRecipe(null);
    });
  }, [sheetTranslateY, backdropOpacity, prepBadgeAnim]);

  const renderItem = useCallback(
    ({ item }) => <GridMealTile recipe={item} cellW={cellW} onPress={openRecipe} />,
    [cellW, openRecipe]
  );

  return (
    <View style={styles.root}>
      {listHeaderPrefix}

      <HybridKitchenHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        tabHighlightX={tabHighlightX}
        tabSlotW={tabSlotW}
        onTabTrackLayout={(e) => setTabTrackW(e.nativeEvent.layout.width)}
      />

      <FlatList
        key={`kitchen-grid-${columns}-${activeTab}-${activeFilter ?? 'all'}`}
        data={gridData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={columns}
        columnWrapperStyle={styles.gridRow}
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No meals for this time</Text>
            <Text style={styles.emptySub}>Try another tab or adjust filters.</Text>
          </View>
        }
        initialNumToRender={columns * 4}
        maxToRenderPerBatch={columns * 3}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
      />

      <MealDetailSheet
        recipe={selectedRecipe}
        visible={sheetOpen}
        onClose={closeRecipe}
        sheetAnim={sheetTranslateY}
        backdropAnim={backdropOpacity}
        badgeAnim={prepBadgeAnim}
        contentW={contentW}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: PHONE_MAX_W,
    alignSelf: 'center',
  },
  headerWrap: {
    flexShrink: 0,
    zIndex: 30,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 6,
    ...Platform.select({
      web: { position: 'sticky', top: 0 },
      default: {},
    }),
  },
  glassCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.glass,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 6,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(60, 80, 68, 0.1)',
      },
      default: {
        shadowColor: '#3C5044',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  tabTrack: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    minHeight: 44,
  },
  tabHighlight: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 0,
    borderRadius: 999,
    backgroundColor: THEME.goldSoft,
    borderWidth: 1,
    borderColor: THEME.goldGlow,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    zIndex: 1,
  },
  tabSublabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: 'rgba(92, 122, 104, 0.55)',
    textTransform: 'uppercase',
  },
  tabSublabelActive: {
    color: THEME.ink,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.12)',
    marginLeft: 4,
  },
  filtersBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.inkSoft,
    letterSpacing: 0.2,
  },
  filtersDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.gold,
    marginLeft: 4,
  },
  filterPanel: {
    marginTop: 8,
    maxHeight: 44,
  },
  filterPanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: H_PAD,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.14)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: THEME.sage,
    borderColor: THEME.sage,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.inkSoft,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  feed: {
    flex: 1,
    minHeight: 0,
  },
  feedContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    paddingBottom: 28,
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  gridTile: {
    alignItems: 'center',
  },
  gridImageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(92, 122, 104, 0.06)',
    ...Platform.select({
      web: { boxShadow: '0 3px 14px rgba(50, 70, 58, 0.1)' },
      default: { elevation: 2 },
    }),
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridLabel: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '600',
    color: THEME.ink,
    textAlign: 'center',
    lineHeight: 14,
    width: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 218, 244, 0.35)',
  },
  imageFallbackEmoji: { fontSize: 24 },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.ink,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.inkSoft,
    marginTop: 4,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 22, 19, 0.58)',
    ...Platform.select({
      web: { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' },
      default: {},
    }),
  },
  sheetPanel: {
    maxHeight: '92%',
    backgroundColor: THEME.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(92, 122, 104, 0.22)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetScroll: {
    paddingHorizontal: H_PAD,
    paddingBottom: 12,
  },
  sheetHero: {
    width: '100%',
    height: 196,
    borderRadius: 18,
    backgroundColor: 'rgba(92, 122, 104, 0.08)',
    marginBottom: 14,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: THEME.ink,
    lineHeight: 28,
    marginRight: 10,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  prepBadge: {
    backgroundColor: THEME.sage,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginTop: 2,
  },
  prepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  contentZone: {
    gap: 16,
  },
  contentZoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentCol: {
    flex: 1,
  },
  contentColHalf: {
    flex: 1,
    marginRight: 8,
  },
  zoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: THEME.sage,
    marginBottom: 8,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.08)',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(92, 122, 104, 0.35)',
    marginTop: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 122, 104, 0.06)',
  },
  checkBoxDone: {
    backgroundColor: THEME.sage,
    borderColor: THEME.sage,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: THEME.ink,
  },
  checkTextDone: {
    color: THEME.inkSoft,
    textDecorationLine: 'line-through',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepTimeline: {
    width: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.gold,
    borderWidth: 2,
    borderColor: THEME.goldSoft,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(196, 165, 116, 0.35)',
    marginVertical: 4,
    minHeight: 20,
  },
  stepBody: {
    flex: 1,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.gold,
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  stepText: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.ink,
  },
  sheetFooter: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(92, 122, 104, 0.12)',
    backgroundColor: THEME.cream,
  },
  footerHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.inkSoft,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopBtnInstacart: {
    flex: 1,
    backgroundColor: THEME.instacart,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 6,
  },
  shopBtnAmazon: {
    flex: 1,
    backgroundColor: THEME.amazon,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 6,
  },
  shopBtnCaption: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoInstacart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  logoInstacartText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#008000',
    letterSpacing: -0.3,
  },
  logoAmazonRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoAmazonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAmazonFresh: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.amazonSmile,
    marginLeft: 3,
    fontStyle: 'italic',
  },
});
