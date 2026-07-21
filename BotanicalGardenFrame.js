import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TOP_GARLAND = '🌿 · ✿ · 🌸 · ✿ · 🌼 · ✿ · 🌸 · ✿ · 🌿';
const BOTTOM_GARLAND = '🌼 · ✿ · 🌸 · ✿ · 🌿 · ✿ · 🌼 · ✿ · 🌸';
const TOP_GARLAND_FULL = '🌿 · 🍃 · ✿ · 🌸 · 🌼 · ✿ · 🌷 · ✿ · 🌸 · 🌼 · ✿ · 🍃 · 🌿';
const BOTTOM_GARLAND_FULL = '🌸 · 🌼 · ✿ · 🍃 · 🌿 · ✿ · 🌼 · 🌸 · ✿ · 🌷 · ✿ · 🍃 · 🌿';
const SIDE_GARLAND = ['🍃', '✿', '🌸', '✿', '🍃'];
const SIDE_GARLAND_FULL = ['🌿', '🍃', '✿', '🌸', '🌼', '✿', '🍃', '🌿'];
const SIDE_GARLAND_LUSH = ['🌿', '🍃', '✿', '🌸', '🌼', '✿', '🍃', '🌸', '✿', '🌿'];
/** Dense wrap for baby registry — flowers + leaves fully frame the card */
const SIDE_GARLAND_WRAP = [
  '🌿',
  '🍃',
  '✿',
  '🌸',
  '🌼',
  '🌷',
  '✿',
  '🍃',
  '🌸',
  '✿',
  '🍃',
  '🌿',
];

function resolveVariant({ variant, compact, full }) {
  if (variant) return variant;
  if (compact) return 'compact';
  if (full) return 'full';
  return 'default';
}

function BotanicalGardenFrame({
  children,
  topColor = '#5C7A68',
  bottomColor = '#E9A889',
  sideColor = '#5C7A68',
  compact = false,
  full = false,
  lushSides = false,
  /** Extra-dense flower/leaf border (e.g. baby registry) */
  wrap = false,
  variant,
}) {
  const resolved = resolveVariant({ variant, compact, full });
  const isCompact = resolved === 'compact';
  const isFull = resolved === 'full' || wrap;
  const isWrap = wrap;
  const topGarland = isWrap || isFull ? TOP_GARLAND_FULL : TOP_GARLAND;
  const bottomGarland = isWrap || isFull ? BOTTOM_GARLAND_FULL : BOTTOM_GARLAND;
  const sideGlyphs = isWrap
    ? SIDE_GARLAND_WRAP
    : isFull
      ? SIDE_GARLAND_FULL
      : lushSides
        ? SIDE_GARLAND_LUSH
        : SIDE_GARLAND;
  const showSideCaps = isFull || lushSides || isWrap;

  return (
    <View
      style={[
        styles.outer,
        isCompact && styles.outerCompact,
        isFull && styles.outerFull,
        isWrap && styles.outerWrap,
      ]}
    >
      <Text
        style={[
          styles.edgeTop,
          isCompact && styles.edgeTopCompact,
          isFull && styles.edgeTopFull,
          isWrap && styles.edgeTopWrap,
          { color: topColor },
        ]}
      >
        {topGarland}
      </Text>

      {isFull ? (
        <View style={[styles.cornerRow, isWrap && styles.cornerRowWrap]}>
          <Text style={[styles.cornerGlyph, isWrap && styles.cornerGlyphWrap, { color: sideColor }]}>
            🌿
          </Text>
          <Text style={[styles.cornerMid, isWrap && styles.cornerMidWrap, { color: topColor }]}>
            ✿ · 🌸 · ✿
          </Text>
          <Text style={[styles.cornerGlyph, isWrap && styles.cornerGlyphWrap, { color: topColor }]}>
            🌸
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.middleRow,
          isCompact && styles.middleRowCompact,
          isFull && styles.middleRowFull,
          lushSides && styles.middleRowLush,
          isWrap && styles.middleRowWrap,
        ]}
      >
        <View
          style={[
            styles.sideColumn,
            isCompact && styles.sideColumnCompact,
            isFull && styles.sideColumnFull,
            lushSides && styles.sideColumnLush,
            isWrap && styles.sideColumnWrap,
          ]}
        >
          {showSideCaps ? (
            <Text
              style={[styles.sideCap, lushSides && styles.sideCapLush, isWrap && styles.sideCapWrap, { color: sideColor }]}
            >
              🌿
            </Text>
          ) : null}
          {sideGlyphs.map((glyph, index) => (
            <Text
              key={`left-${glyph}-${index}`}
              style={[
                styles.sideGlyph,
                isFull && styles.sideGlyphFull,
                lushSides && styles.sideGlyphLush,
                isWrap && styles.sideGlyphWrap,
                { color: sideColor },
              ]}
            >
              {glyph}
            </Text>
          ))}
          {showSideCaps ? (
            <Text
              style={[
                styles.sideCap,
                lushSides && styles.sideCapLush,
                isWrap && styles.sideCapWrap,
                { color: bottomColor },
              ]}
            >
              🌸
            </Text>
          ) : null}
        </View>

        <View style={styles.inner}>{children}</View>

        <View
          style={[
            styles.sideColumn,
            isCompact && styles.sideColumnCompact,
            isFull && styles.sideColumnFull,
            lushSides && styles.sideColumnLush,
            isWrap && styles.sideColumnWrap,
          ]}
        >
          {showSideCaps ? (
            <Text
              style={[styles.sideCap, lushSides && styles.sideCapLush, isWrap && styles.sideCapWrap, { color: sideColor }]}
            >
              🍃
            </Text>
          ) : null}
          {sideGlyphs.map((glyph, index) => (
            <Text
              key={`right-${glyph}-${index}`}
              style={[
                styles.sideGlyph,
                isFull && styles.sideGlyphFull,
                lushSides && styles.sideGlyphLush,
                isWrap && styles.sideGlyphWrap,
                { color: sideColor },
              ]}
            >
              {glyph}
            </Text>
          ))}
          {showSideCaps ? (
            <Text
              style={[
                styles.sideCap,
                lushSides && styles.sideCapLush,
                isWrap && styles.sideCapWrap,
                { color: bottomColor },
              ]}
            >
              ✿
            </Text>
          ) : null}
        </View>
      </View>

      {isFull ? (
        <View style={[styles.cornerRow, isWrap && styles.cornerRowWrap]}>
          <Text style={[styles.cornerGlyph, isWrap && styles.cornerGlyphWrap, { color: bottomColor }]}>
            🌼
          </Text>
          <Text style={[styles.cornerMid, isWrap && styles.cornerMidWrap, { color: bottomColor }]}>
            ✿ · 🍃 · ✿
          </Text>
          <Text style={[styles.cornerGlyph, isWrap && styles.cornerGlyphWrap, { color: sideColor }]}>
            🍃
          </Text>
        </View>
      ) : null}

      <Text
        style={[
          styles.edgeBottom,
          isCompact && styles.edgeBottomCompact,
          isFull && styles.edgeBottomFull,
          isWrap && styles.edgeBottomWrap,
          { color: bottomColor },
        ]}
      >
        {bottomGarland}
      </Text>
    </View>
  );
}

export default memo(BotanicalGardenFrame);

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    paddingHorizontal: 2,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  outerCompact: {
    paddingHorizontal: 0,
    paddingVertical: 6,
  },
  outerFull: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  outerWrap: {
    paddingHorizontal: 2,
    paddingVertical: 12,
  },
  edgeTop: {
    fontSize: 11,
    letterSpacing: 1.6,
    opacity: 0.88,
    marginBottom: 10,
    textAlign: 'center',
  },
  edgeTopCompact: {
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  edgeTopFull: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
    opacity: 0.92,
  },
  edgeTopWrap: {
    fontSize: 11,
    letterSpacing: 0.9,
    marginBottom: 4,
    opacity: 0.95,
  },
  edgeBottom: {
    fontSize: 11,
    letterSpacing: 1.6,
    opacity: 0.88,
    marginTop: 10,
    textAlign: 'center',
  },
  edgeBottomCompact: {
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 8,
  },
  edgeBottomFull: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 6,
    opacity: 0.92,
  },
  edgeBottomWrap: {
    fontSize: 11,
    letterSpacing: 0.9,
    marginTop: 4,
    opacity: 0.95,
  },
  cornerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
    marginTop: 2,
  },
  cornerRowWrap: {
    paddingHorizontal: 2,
    marginBottom: 2,
    marginTop: 0,
  },
  cornerGlyph: {
    fontSize: 13,
    opacity: 0.72,
    lineHeight: 18,
  },
  cornerGlyphWrap: {
    fontSize: 14,
    opacity: 0.82,
  },
  cornerMid: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 1.2,
    opacity: 0.55,
  },
  cornerMidWrap: {
    fontSize: 11,
    letterSpacing: 1.4,
    opacity: 0.7,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    backgroundColor: 'transparent',
  },
  middleRowCompact: {
    gap: 4,
  },
  middleRowFull: {
    gap: 6,
  },
  middleRowLush: {
    gap: 5,
  },
  middleRowWrap: {
    gap: 4,
  },
  sideColumn: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    minWidth: 18,
    backgroundColor: 'transparent',
  },
  sideColumnCompact: {
    minWidth: 12,
    paddingVertical: 6,
  },
  sideColumnFull: {
    minWidth: 20,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  sideColumnLush: {
    minWidth: 20,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  sideColumnWrap: {
    minWidth: 22,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  sideCap: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  sideCapLush: {
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.76,
  },
  sideCapWrap: {
    fontSize: 12,
    lineHeight: 15,
    opacity: 0.82,
  },
  sideGlyph: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.62,
  },
  sideGlyphFull: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.72,
  },
  sideGlyphLush: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.74,
  },
  sideGlyphWrap: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  inner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
