import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CALM_MAUVE, CALM_SERIF } from './calmLoungeTheme';
import BotanicalGardenFrame from './BotanicalGardenFrame';
import { injectNurseryWebFonts, mamaCardScriptTitle } from './nurseryRetroFonts';
import {
  PREGNANT_HOME_WORD_SEARCH_LEVELS,
  cellKey,
  cellsOnLine,
  getWordSearchLevel,
  readLettersFromCells,
} from './pregnantHomeLayoutConfig';
import { SNAPPY_SPRING, safeAssignSequence, safeAssignTiming } from './reanimatedSafe';
import { runNativeGuard } from './nativeRuntimeGuard';
import { useVillageRewards } from './VillageRewardsContext';

const INK = '#4A3E3D';
const FOUND_GREEN = '#5C7A68';
const FOUND_LAVENDER = 'rgba(118, 82, 112, 0.82)';
const SELECTION_CAPSULE = 'rgba(168, 128, 158, 0.52)';
const GRID_SIZE = 10;
const GRID_GAP = 3;

const FALLBACK_CONTENT_WIDTH = Dimensions.get('window').width - 40;

function cellsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function cellInList(cells, row, col) {
  return cells.some(([r, c]) => r === row && c === col);
}

/** Fit a 10×10 letter grid inside `areaWidth` — never overflow the card. */
function computeGridMetrics(areaWidth) {
  const budget = Math.max(160, Math.floor(areaWidth));
  const gapTotal = GRID_GAP * (GRID_SIZE - 1);
  const rawCell = (budget - gapTotal) / GRID_SIZE;
  // Prefer readable size but always shrink to fit.
  const cellSize = Math.max(18, Math.floor(Math.min(rawCell, 34)));
  const gridSpan = cellSize * GRID_SIZE + gapTotal;
  const fontSize = Math.max(10, Math.round(cellSize * 0.48));
  const capsuleHeight = Math.max(16, cellSize * 0.78);

  return { cellSize, gridSpan, fontSize, capsuleHeight };
}

/** Map a touch point to the nearest grid cell center. */
function pointToNearestCell(locationX, locationY, cellSize) {
  const stride = cellSize + GRID_GAP;
  let bestCell = [0, 0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const centerX = col * stride + cellSize / 2;
      const centerY = row * stride + cellSize / 2;
      const dx = locationX - centerX;
      const dy = locationY - centerY;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCell = [row, col];
      }
    }
  }

  return bestCell;
}

/** Snap a finger cell to the straight line from anchor (horizontal, vertical, diagonal). */
function resolveSelectionLine(anchor, finger) {
  const direct = cellsOnLine(anchor, finger);
  if (direct) return direct;

  const [ar, ac] = anchor;
  const [fr, fc] = finger;
  const candidates = [
    [ar, fc],
    [fr, ac],
    [fr, fc],
  ];

  let bestLine = null;
  let bestLength = -1;

  candidates.forEach((candidate) => {
    const line = cellsOnLine(anchor, candidate);
    if (!line) return;
    if (line.length > bestLength) {
      bestLength = line.length;
      bestLine = line;
    }
  });

  return bestLine;
}

const SelectionCapsule = memo(function SelectionCapsule({ cells, cellSize, capsuleHeight }) {
  if (!cells?.length) return null;

  const center = (row, col) => ({
    x: col * (cellSize + GRID_GAP) + cellSize / 2,
    y: row * (cellSize + GRID_GAP) + cellSize / 2,
  });

  if (cells.length === 1) {
    const [row, col] = cells[0];
    const { x, y } = center(row, col);
    const size = cellSize * 0.88;
    return (
      <View
        pointerEvents="none"
        style={[
          styles.selectionCapsule,
          {
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  const [r0, c0] = cells[0];
  const [r1, c1] = cells[cells.length - 1];
  const start = center(r0, c0);
  const end = center(r1, c1);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy) + cellSize * 0.9;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.selectionCapsule,
        {
          left: midX - length / 2,
          top: midY - capsuleHeight / 2,
          width: length,
          height: capsuleHeight,
          borderRadius: capsuleHeight / 2,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
});

const MamaDailyWordSearch = memo(function MamaDailyWordSearch({
  contentWidth = FALLBACK_CONTENT_WIDTH,
  onDragStateChange,
}) {
  const { addPoints } = useVillageRewards();
  const [levelIndex, setLevelIndex] = useState(0);
  const dailyPuzzle = useMemo(() => getWordSearchLevel(levelIndex), [levelIndex]);
  const { today, level, puzzle } = dailyPuzzle;

  const gridRows = useMemo(
    () => puzzle.grid.map((row) => row.split('')),
    [puzzle.grid],
  );

  const [gridAreaWidth, setGridAreaWidth] = useState(0);
  const [activeCells, setActiveCells] = useState([]);
  const [foundWordIds, setFoundWordIds] = useState(() => new Set());
  const [foundCellKeys, setFoundCellKeys] = useState(() => new Set());
  const [showCompletion, setShowCompletion] = useState(false);

  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.92);
  const prevFoundRef = useRef(0);
  const anchorRef = useRef(null);
  const activeCellsRef = useRef([]);
  const draggingRef = useRef(false);
  const metricsRef = useRef(computeGridMetrics(contentWidth));

  const measuredWidth = gridAreaWidth > 0 ? gridAreaWidth : Math.max(160, contentWidth - 72);
  const { cellSize, gridSpan, fontSize, capsuleHeight } = useMemo(
    () => computeGridMetrics(measuredWidth),
    [measuredWidth],
  );

  useEffect(() => {
    metricsRef.current = { cellSize, gridSpan, fontSize, capsuleHeight };
  }, [cellSize, gridSpan, fontSize, capsuleHeight]);

  const allFound = foundWordIds.size === puzzle.words.length;
  const frostedPadding = contentWidth < 340 ? 10 : 12;

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  useEffect(() => {
    activeCellsRef.current = activeCells;
  }, [activeCells]);

  const setDragging = useCallback(
    (next) => {
      if (draggingRef.current === next) return;
      draggingRef.current = next;
      onDragStateChange?.(next);
    },
    [onDragStateChange],
  );

  useEffect(() => {
    return () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        onDragStateChange?.(false);
      }
    };
  }, [onDragStateChange]);

  useEffect(() => {
    anchorRef.current = null;
    setActiveCells([]);
    setFoundWordIds(new Set());
    setFoundCellKeys(new Set());
    setShowCompletion(false);
    completionOpacity.value = 0;
    completionScale.value = 0.92;
    prevFoundRef.current = 0;
  }, [puzzle.id, completionOpacity, completionScale]);

  useEffect(() => {
    if (allFound && prevFoundRef.current < puzzle.words.length) {
      setShowCompletion(true);
      addPoints(15, 'dailyPuzzle');
      runNativeGuard('wordSearch:complete', () => {
        safeAssignTiming(completionOpacity, 1, { duration: 360 }, 'wordSearch:opacity');
        safeAssignSequence(
          completionScale,
          [withSpring(1.04, SNAPPY_SPRING), withSpring(1, SNAPPY_SPRING)],
          'wordSearch:scale',
        );
      });
    }
    if (!allFound) {
      setShowCompletion(false);
      completionOpacity.value = 0;
      completionScale.value = 0.92;
    }
    prevFoundRef.current = foundWordIds.size;
  }, [allFound, foundWordIds.size, puzzle.words.length, completionOpacity, completionScale, addPoints]);

  const completionStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
    transform: [{ scale: completionScale.value }],
  }));

  const registerFoundWord = useCallback((word) => {
    setFoundWordIds((prev) => {
      if (prev.has(word.id)) return prev;
      const next = new Set(prev);
      next.add(word.id);
      return next;
    });
    setFoundCellKeys((prev) => {
      const next = new Set(prev);
      word.cells.forEach(([row, col]) => next.add(cellKey(row, col)));
      return next;
    });
  }, []);

  const tryMatchSelection = useCallback(
    (cells) => {
      if (!cells?.length) return false;
      const forward = readLettersFromCells(gridRows, cells);
      const backward = forward.split('').reverse().join('');
      let matched = false;

      puzzle.words.forEach((word) => {
        if (foundWordIds.has(word.id)) return;
        if (forward === word.text || backward === word.text) {
          registerFoundWord(word);
          matched = true;
        }
      });

      return matched;
    },
    [gridRows, puzzle.words, foundWordIds, registerFoundWord],
  );

  const pointToCell = useCallback((locationX, locationY) => {
    const { cellSize: size } = metricsRef.current;
    return pointToNearestCell(locationX, locationY, size);
  }, []);

  const updateSelectionAtPoint = useCallback(
    (locationX, locationY) => {
      if (allFound) return;
      const cell = pointToCell(locationX, locationY);
      if (!cell) return;

      if (!anchorRef.current) {
        anchorRef.current = cell;
        setActiveCells([cell]);
        return;
      }

      if (cellsMatch(anchorRef.current, cell)) {
        setActiveCells([cell]);
        return;
      }

      const line = resolveSelectionLine(anchorRef.current, cell);
      if (line?.length) {
        setActiveCells(line);
      }
    },
    [allFound, pointToCell],
  );

  const finishSelection = useCallback(() => {
    setDragging(false);

    if (!anchorRef.current) {
      setActiveCells([]);
      return;
    }

    const cells = activeCellsRef.current;
    if (cells.length <= 1) {
      anchorRef.current = null;
      setActiveCells([]);
      return;
    }

    const matched = tryMatchSelection(cells);
    anchorRef.current = null;
    setTimeout(() => setActiveCells([]), matched ? 120 : 280);
  }, [setDragging, tryMatchSelection]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !allFound,
        onStartShouldSetPanResponderCapture: () => !allFound,
        onMoveShouldSetPanResponder: () => !allFound,
        onMoveShouldSetPanResponderCapture: () => !allFound,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          setDragging(true);
          anchorRef.current = null;
          setActiveCells([]);
          updateSelectionAtPoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderMove: (evt) => {
          updateSelectionAtPoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderRelease: finishSelection,
        onPanResponderTerminate: finishSelection,
      }),
    [allFound, finishSelection, setDragging, updateSelectionAtPoint],
  );

  const handleLevelChange = useCallback((nextIndex) => {
    setLevelIndex(nextIndex);
  }, []);

  const handleGridAreaLayout = useCallback((event) => {
    const next = Math.floor(event.nativeEvent.layout.width);
    if (next > 0) {
      setGridAreaWidth((prev) => (prev === next ? prev : next));
    }
  }, []);

  return (
    <BotanicalGardenFrame
      lushSides
      topColor={CALM_MAUVE}
      bottomColor="#E9A889"
      sideColor={CALM_MAUVE}
    >
      <View
        style={[
          styles.frostedCard,
          {
            padding: frostedPadding,
          },
        ]}
      >
        <Text style={[styles.wsTitle, mamaCardScriptTitle]}>Mama&apos;s Daily Word Search</Text>
        <Text style={styles.wsSubtitle}>Press and drag to circle each hidden word.</Text>
        <Text style={styles.wsDate}>{today}</Text>

        <View style={styles.levelRow}>
          {PREGNANT_HOME_WORD_SEARCH_LEVELS.map((entry, index) => {
            const active = levelIndex === index;
            return (
              <TouchableOpacity
                key={entry.id}
                style={[styles.levelChip, active && styles.levelChipActive]}
                onPress={() => handleLevelChange(index)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={entry.label}
              >
                <Text style={[styles.levelChipText, active && styles.levelChipTextActive]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.levelLabel}>{level.label}</Text>

        <View style={styles.gridMeasure} onLayout={handleGridAreaLayout}>
          <View
            style={[styles.gridTouchLayer, { width: gridSpan, height: gridSpan }]}
            collapsable={false}
            {...panResponder.panHandlers}
          >
            <View
              style={[styles.wsGrid, { width: gridSpan, gap: GRID_GAP }]}
              pointerEvents="none"
            >
              <SelectionCapsule
                cells={activeCells}
                cellSize={cellSize}
                capsuleHeight={capsuleHeight}
              />

              {gridRows.map((row, rowIndex) => (
                <View
                  key={`ws-row-${rowIndex}`}
                  style={[styles.wsGridRow, { gap: GRID_GAP }]}
                  pointerEvents="none"
                >
                  {row.map((letter, colIndex) => {
                    const key = cellKey(rowIndex, colIndex);
                    const isFound = foundCellKeys.has(key);
                    const isActive = cellInList(activeCells, rowIndex, colIndex);

                    return (
                      <View
                        key={key}
                        style={[
                          styles.wsCell,
                          {
                            width: cellSize,
                            height: cellSize,
                            borderRadius: Math.max(4, Math.floor(cellSize * 0.2)),
                          },
                          isActive && styles.wsCellActive,
                          isFound && styles.wsCellFound,
                        ]}
                        accessibilityLabel={`Letter ${letter}`}
                      >
                        <Text style={[styles.wsCellLetter, { fontSize }]} pointerEvents="none">
                          {letter}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.wsWordList}>
          {puzzle.words.map((word) => {
            const solved = foundWordIds.has(word.id);
            return (
              <Text key={word.id} style={[styles.wsWordChip, solved && styles.wsWordChipFound]}>
                {word.text}
              </Text>
            );
          })}
        </View>

        {showCompletion ? (
          <Animated.View style={[styles.wsCompletion, completionStyle]}>
            <Text style={[styles.wsCompletionText, CALM_SERIF]}>
              Beautifully solved, Mama! Try the next level or come back tomorrow for a fresh puzzle.
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </BotanicalGardenFrame>
  );
});

export default MamaDailyWordSearch;

const styles = StyleSheet.create({
  frostedCard: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  wsTitle: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  wsSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 4,
    opacity: 0.88,
  },
  wsDate: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.45,
    textAlign: 'center',
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  levelChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  levelChipActive: {
    backgroundColor: 'rgba(199, 162, 179, 0.35)',
    borderColor: 'rgba(199, 162, 179, 0.65)',
  },
  levelChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    opacity: 0.7,
  },
  levelChipTextActive: {
    opacity: 1,
    color: '#7A6B8A',
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: INK,
    opacity: 0.55,
    textAlign: 'center',
    marginBottom: 12,
  },
  gridMeasure: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  gridTouchLayer: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  wsGrid: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  wsGridRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'transparent',
  },
  wsCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  wsCellActive: {
    backgroundColor: SELECTION_CAPSULE,
  },
  wsCellFound: {
    backgroundColor: FOUND_LAVENDER,
  },
  selectionCapsule: {
    position: 'absolute',
    backgroundColor: SELECTION_CAPSULE,
    zIndex: 4,
  },
  wsCellLetter: {
    fontWeight: '800',
    color: INK,
    letterSpacing: 0.2,
  },
  wsWordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  wsWordChip: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  wsWordChipFound: {
    color: FOUND_GREEN,
    opacity: 0.72,
    textDecorationLine: 'line-through',
  },
  wsCompletion: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  wsCompletionText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
