import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
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

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const { width: SCREEN_W } = Dimensions.get('window');
const PHONE_MAX_W = 390;
const KITCHEN_H_PAD = 20;
const KITCHEN_CARD_GAP = 12;
const KITCHEN_CONTENT_W = Math.min(SCREEN_W, PHONE_MAX_W);
const CARD_W = Math.floor((KITCHEN_CONTENT_W - KITCHEN_H_PAD * 2 - KITCHEN_CARD_GAP) / 2);

const TIME_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

const THEME = {
  lavender: '#E8DAF4',
  lavenderDeep: '#9A7AB8',
  sage: '#5C7A68',
  sageLight: '#D1FAE5',
  glass: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(186, 198, 188, 0.45)',
};

function RecipeDetailSheet({ recipe, visible, onClose, sheetAnim }) {
  if (!recipe) return null;

  const openLink = (url) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheetPanel, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={styles.sheetHandle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sheetScrollContent}
        >
          <Image source={{ uri: recipe.imageUrl }} style={styles.sheetHeroImage} resizeMode="cover" />
          <Text style={styles.sheetTitle}>{recipe.title}</Text>
          <Text style={styles.sheetSub}>{recipe.subtitle}</Text>
          <Text style={styles.sheetMeta}>
            {recipe.prepMinutes} min · Serves {recipe.servings}
          </Text>

          <View style={styles.sheetOrderRow}>
            <TouchableOpacity
              style={styles.sheetAmazonBtn}
              onPress={() => openLink(recipe.amazonUrl)}
              activeOpacity={0.88}
            >
              <Text style={styles.sheetOrderBtnText}>Order on Amazon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetInstacartBtn}
              onPress={() => openLink(recipe.instacartUrl)}
              activeOpacity={0.88}
            >
              <Text style={styles.sheetOrderBtnText}>Shop Instacart</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetSectionLabel}>Ingredients</Text>
          {recipe.ingredients.map((item) => (
            <View key={item} style={styles.sheetBulletRow}>
              <View style={styles.sheetBulletDot} />
              <Text style={styles.sheetBulletText}>{item}</Text>
            </View>
          ))}

          <Text style={[styles.sheetSectionLabel, styles.sheetSectionSpaced]}>Instructions</Text>
          {recipe.steps.map((step, index) => (
            <View key={step} style={styles.sheetStepRow}>
              <View style={styles.sheetStepNum}>
                <Text style={styles.sheetStepNumText}>{index + 1}</Text>
              </View>
              <Text style={styles.sheetStepText}>{step}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.sheetCloseBtn} onPress={onClose} activeOpacity={0.88}>
          <Text style={styles.sheetCloseBtnText}>Close recipe</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

export default function MamasKitchenScreen({
  timeOfDay,
  onTimeOfDayChange,
  therapeuticTags,
  listHeaderPrefix = null,
}) {
  const activeTime = timeOfDay ?? getDefaultKitchenTimeOfDay();
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(480)).current;

  const filteredRecipes = useMemo(() => {
    let base = filterKitchenRecipes(MAMA_KITCHEN_RECIPES, activeFilter, activeTime);
    if (therapeuticTags?.length) {
      base = getTherapeuticMeals(base, therapeuticTags, 150);
    }
    return base;
  }, [activeFilter, activeTime, therapeuticTags]);

  /** Pad odd-length grids so the last row stays centered in a 2-column layout */
  const gridRecipes = useMemo(() => {
    if (filteredRecipes.length % 2 === 0) return filteredRecipes;
    return [...filteredRecipes, { id: '__kitchen_grid_pad__', __pad: true }];
  }, [filteredRecipes]);

  const activeFilterLabel = activeFilter
    ? KITCHEN_FILTERS.find((f) => f.id === activeFilter)?.label
    : null;

  const openRecipe = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setSheetOpen(true);
    sheetTranslateY.setValue(480);
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [sheetTranslateY]);

  const closeRecipe = () => {
    Animated.timing(sheetTranslateY, {
      toValue: 480,
      duration: 380,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      setSheetOpen(false);
      setSelectedRecipe(null);
    });
  };

  const handleSelectTime = (slot) => {
    onTimeOfDayChange?.(slot);
  };

  const handleAllRecipes = () => {
    setActiveFilter(null);
  };

  const renderRecipeCard = useCallback(
    ({ item: recipe }) => {
      if (recipe.__pad) {
        return <View style={styles.recipeCardPad} pointerEvents="none" />;
      }
      return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => openRecipe(recipe)}
        activeOpacity={0.92}
      >
        <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} resizeMode="cover" />
        <View style={styles.recipeCardBody}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.recipeSub} numberOfLines={2}>
            {recipe.subtitle}
          </Text>
          <Text style={styles.recipeMeta}>
            {recipe.prepMinutes} min · {recipe.servings} servings
          </Text>
        </View>
      </TouchableOpacity>
      );
    },
    [openRecipe]
  );

  const listHeader = useMemo(
    () => (
      <View>
        {listHeaderPrefix}
        <View style={styles.kitchenContent}>
          <View style={styles.introCard}>
            <Text style={styles.introEyebrow}>PREMIUM NOURISHMENT</Text>
            <Text style={styles.introTitle}>Mama's Kitchen</Text>
            <Text style={styles.introSub}>
              Real recipes, village warmth, and gentle filters for your season.
            </Text>

            <View style={styles.timeRow}>
              {['morning', 'afternoon', 'night'].map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeBtn, activeTime === slot && styles.timeBtnActive]}
                  onPress={() => handleSelectTime(slot)}
                  activeOpacity={0.88}
                >
                  <Text style={[styles.timeBtnText, activeTime === slot && styles.timeBtnTextActive]}>
                    {TIME_LABELS[slot]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.glassPanelHeader}>
            <View style={styles.filterWrap}>
              <TouchableOpacity
                style={[styles.filterPill, !activeFilter && styles.filterPillActive]}
                onPress={handleAllRecipes}
                activeOpacity={0.88}
              >
                <Text style={[styles.filterPillText, !activeFilter && styles.filterPillTextActive]}>
                  All Recipes
                </Text>
              </TouchableOpacity>
              {KITCHEN_FILTERS.map((filter) => {
                const active = activeFilter === filter.id;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[styles.filterPill, active && styles.filterPillActive]}
                    onPress={() => setActiveFilter(active ? null : filter.id)}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterResultLine}>
              {filteredRecipes.length} {TIME_LABELS[activeTime]?.toLowerCase() || 'village'} recipes
              {activeFilterLabel ? ` · ${activeFilterLabel}` : ''}
              {therapeuticTags?.length ? ' · therapeutic focus' : ''}
              {!activeFilter && !therapeuticTags?.length ? ' · full village kitchen' : ''}
            </Text>
          </View>
        </View>
      </View>
    ),
    [
      listHeaderPrefix,
      activeTime,
      activeFilter,
      activeFilterLabel,
      filteredRecipes.length,
      therapeuticTags,
    ]
  );

  const listFooter = useMemo(() => {
    if (filteredRecipes.length === 0) return null;
    return (
      <View style={styles.kitchenContent}>
        <View style={styles.recipeListGlassFooter} />
        <View style={styles.kitchenEndCap}>
          <Text style={styles.kitchenEndCapText}>
            You&apos;ve reached the end of the village kitchen — {filteredRecipes.length} gentle
            recipes for your season.
          </Text>
        </View>
      </View>
    );
  }, [filteredRecipes.length]);

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyFilterText}>
          No {TIME_LABELS[activeTime]?.toLowerCase()} recipes match — try All Recipes or another
          filter.
        </Text>
      </View>
    ),
    [activeTime]
  );

  return (
    <>
      <View style={styles.kitchenShell}>
        <FlatList
          data={gridRecipes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderRecipeCard}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={listEmpty}
          style={styles.kitchenList}
          contentContainerStyle={styles.recipeListContent}
          columnWrapperStyle={filteredRecipes.length > 0 ? styles.recipeRow : undefined}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        />
      </View>

      <RecipeDetailSheet
        recipe={selectedRecipe}
        visible={sheetOpen}
        onClose={closeRecipe}
        sheetAnim={sheetTranslateY}
      />
    </>
  );
}

const styles = StyleSheet.create({
  kitchenShell: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: PHONE_MAX_W,
    alignSelf: 'center',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        maxHeight: '100%',
      },
      default: {},
    }),
  },
  kitchenList: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    ...Platform.select({
      web: {
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        maxWidth: '100%',
      },
      default: {},
    }),
  },
  kitchenContent: {
    width: '100%',
    maxWidth: KITCHEN_CONTENT_W,
    alignSelf: 'center',
    paddingHorizontal: KITCHEN_H_PAD,
  },
  recipeListContent: {
    paddingBottom: 104,
    flexGrow: 1,
    width: '100%',
    maxWidth: KITCHEN_CONTENT_W,
    alignSelf: 'center',
  },
  recipeListGlassFooter: {
    marginHorizontal: 20,
    height: 1,
    backgroundColor: THEME.glass,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.glassBorder,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 0,
  },
  introCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.52)',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.48)',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 10px 26px rgba(92, 122, 104, 0.08)' },
      default: { elevation: 3 },
    }),
  },
  introEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: THEME.sage,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2A382E',
    marginTop: 6,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  introSub: {
    fontSize: 11,
    color: '#4A5C50',
    marginTop: 6,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  timeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 218, 244, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.28)',
    alignItems: 'center',
  },
  timeBtnActive: {
    backgroundColor: THEME.sage,
    borderColor: THEME.sage,
  },
  timeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5E4878',
  },
  timeBtnTextActive: {
    color: '#FFFFFF',
  },
  glassPanelHeader: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: THEME.glass,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: THEME.glassBorder,
    overflow: 'hidden',
    marginBottom: 0,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 28px rgba(60, 80, 68, 0.1)',
      },
      default: {
        shadowColor: '#3C5044',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    ...Platform.select({
      web: { rowGap: 8, columnGap: 8 },
      default: {},
    }),
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 218, 244, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.28)',
  },
  filterPillActive: {
    backgroundColor: THEME.sage,
    borderColor: THEME.sage,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5E4878',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterResultLine: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5C6E63',
    fontStyle: 'italic',
    paddingHorizontal: 14,
    paddingBottom: 8,
    textAlign: 'center',
  },
  recipeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: KITCHEN_CONTENT_W,
    paddingHorizontal: KITCHEN_H_PAD,
    paddingBottom: 16,
    gap: KITCHEN_CARD_GAP,
    backgroundColor: THEME.glass,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: THEME.glassBorder,
    ...Platform.select({
      web: { rowGap: KITCHEN_CARD_GAP, columnGap: KITCHEN_CARD_GAP },
      default: {},
    }),
  },
  recipeCardPad: {
    width: CARD_W,
    maxWidth: CARD_W,
    height: 1,
    opacity: 0,
  },
  recipeCard: {
    width: CARD_W,
    maxWidth: CARD_W,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    marginBottom: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(80, 100, 88, 0.08)' },
      default: { elevation: 2 },
    }),
  },
  recipeImage: {
    width: '100%',
    height: 96,
    backgroundColor: THEME.lavender,
  },
  recipeCardBody: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2A382E',
    lineHeight: 16,
    marginBottom: 4,
  },
  recipeSub: {
    fontSize: 10,
    color: '#5C6E63',
    lineHeight: 14,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  recipeMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.sage,
  },
  emptyWrap: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: KITCHEN_CONTENT_W,
    marginHorizontal: KITCHEN_H_PAD,
    paddingHorizontal: 12,
    paddingVertical: 24,
    backgroundColor: THEME.glass,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: THEME.glassBorder,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
  },
  emptyFilterText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    color: '#5C6E63',
    fontStyle: 'italic',
  },
  kitchenEndCap: {
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 218, 244, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.22)',
    alignItems: 'center',
  },
  kitchenEndCapText: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
    color: '#5C6E63',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 48, 40, 0.45)',
  },
  sheetPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '78%',
    backgroundColor: 'rgba(255, 252, 250, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(154, 122, 184, 0.45)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  sheetHeroImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: THEME.lavender,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A382E',
    lineHeight: 24,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  sheetSub: {
    fontSize: 12,
    color: '#5C6E63',
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  sheetMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.sage,
    marginTop: 8,
    marginBottom: 14,
  },
  sheetOrderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sheetAmazonBtn: {
    flex: 1,
    backgroundColor: THEME.sage,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  sheetInstacartBtn: {
    flex: 1,
    backgroundColor: '#6B5588',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  sheetOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sheetSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#6B5588',
    marginBottom: 8,
  },
  sheetSectionSpaced: {
    marginTop: 14,
  },
  sheetBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sheetBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.sage,
    marginTop: 6,
    marginRight: 8,
  },
  sheetBulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#3D5246',
  },
  sheetStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sheetStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.sageLight,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  sheetStepNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.sage,
  },
  sheetStepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#3D5246',
  },
  sheetCloseBtn: {
    marginHorizontal: 18,
    marginTop: 4,
    backgroundColor: 'rgba(232, 218, 244, 0.65)',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.3)',
  },
  sheetCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E4878',
  },
});
