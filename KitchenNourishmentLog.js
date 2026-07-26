/**
 * Kitchen nourishment log UI — cook confirm modal + history archive.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  categoryLabel,
  formatMealLogTime,
  getVillageFavoriteMeal,
  groupMealLogByPeriod,
} from './kitchenMealLogEngine';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

const INK = '#3D4F42';
const MUTED = 'rgba(61, 79, 66, 0.62)';
const SAGE = '#5C7A68';
const CREAM = '#FFF9F4';

const CATEGORY_OPTIONS = [
  { id: 'morning', label: 'Morning' },
  { id: 'noon', label: 'Afternoon' },
  { id: 'night', label: 'Night' },
  { id: 'little_bites', label: 'Little Bites' },
  { id: 'custom', label: 'Other' },
];

/**
 * Confirm / record a cooked meal before persisting.
 */
export function KitchenCookLogModal({
  visible,
  recipe = null,
  busy = false,
  onClose,
  onConfirm,
}) {
  const [mealName, setMealName] = useState('');
  const [category, setCategory] = useState('custom');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) return;
    setMealName(String(recipe?.title || '').trim());
    const cat = recipe?.category;
    if (cat === 'morning' || cat === 'noon' || cat === 'night' || cat === 'little_bites') {
      setCategory(cat);
    } else if (recipe?.id) {
      setCategory('custom');
    } else {
      setCategory('custom');
    }
    setNotes('');
  }, [visible, recipe?.title, recipe?.category, recipe?.id]);

  const canSave = Boolean(mealName.trim()) && !busy;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation?.()}>
          <Text style={[styles.eyebrow, SANS]}>LOG NOURISHMENT</Text>
          <Text style={[styles.title, SERIF]}>I cooked this</Text>
          <Text style={[styles.subtitle, SANS]}>
            Save this meal to your kitchen history so you can see what feeds you across weeks and
            months.
          </Text>

          <Text style={[styles.label, SANS]}>Meal name</Text>
          <TextInput
            style={[styles.input, SANS]}
            value={mealName}
            onChangeText={setMealName}
            placeholder="What did you make?"
            placeholderTextColor="rgba(61,79,66,0.4)"
            editable={!busy}
          />

          <Text style={[styles.label, SANS]}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORY_OPTIONS.map((opt) => {
              const on = category === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setCategory(opt.id)}
                  activeOpacity={0.88}
                  disabled={busy}
                >
                  <Text style={[styles.chipText, SANS, on && styles.chipTextOn]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, SANS]}>Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti, SANS]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it feel / taste?"
            placeholderTextColor="rgba(61,79,66,0.4)"
            multiline
            editable={!busy}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
            onPress={() =>
              onConfirm?.({
                mealName: mealName.trim(),
                category,
                notes: notes.trim(),
                mealId: recipe?.id || null,
              })
            }
            activeOpacity={0.9}
            disabled={!canSave}
          >
            <Text style={[styles.primaryBtnText, SANS]}>
              {busy ? 'Saving…' : 'Save to my nourishment log'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} activeOpacity={0.85} disabled={busy}>
            <Text style={[styles.cancelText, SANS]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Archive popup — grouped by This Week / Last Week / Month archives.
 */
export function KitchenMealHistoryModal({ visible, entries = [], onClose, onLogCustom }) {
  const favorite = useMemo(() => getVillageFavoriteMeal(entries), [entries]);
  const sections = useMemo(() => groupMealLogByPeriod(entries), [entries]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.historySheet} onPress={(e) => e.stopPropagation?.()}>
          <View style={styles.historyHandle} />
          <Text style={[styles.eyebrow, SANS]}>NOURISHMENT HISTORY</Text>
          <Text style={[styles.title, SERIF]}>View My Nourishment History</Text>

          {favorite ? (
            <View style={styles.favoriteBanner}>
              <Text style={[styles.favoriteText, SANS]}>{favorite.headline}</Text>
            </View>
          ) : (
            <Text style={[styles.emptyHint, SANS]}>
              No meals logged yet — cook something soft and tap “I cooked this.”
            </Text>
          )}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onLogCustom}
            activeOpacity={0.9}
          >
            <Text style={[styles.secondaryBtnText, SANS]}>Log a custom meal</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.historyScroll}
            contentContainerStyle={styles.historyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.length === 0 ? (
              <Text style={[styles.emptyHint, SANS]}>Your archive will bloom here.</Text>
            ) : (
              sections.map((section) => (
                <View key={section.id} style={styles.sectionBlock}>
                  <Text style={[styles.sectionLabel, SANS]}>{section.label}</Text>
                  {section.entries.map((entry) => (
                    <View key={entry.id} style={styles.entryRow}>
                      <View style={styles.entryCopy}>
                        <Text style={[styles.entryTitle, SANS]}>{entry.mealName}</Text>
                        <Text style={[styles.entryMeta, SANS]}>
                          {categoryLabel(entry.category)} · {formatMealLogTime(entry.timestamp)}
                        </Text>
                        {entry.notes ? (
                          <Text style={[styles.entryNotes, SANS]}>{entry.notes}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeHistoryBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={[styles.closeHistoryText, SANS]}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Compact favorite strip for the Kitchen feed. */
export function KitchenFavoriteBanner({ favorite, onPressHistory }) {
  if (!favorite) return null;
  return (
    <TouchableOpacity style={styles.feedFavorite} onPress={onPressHistory} activeOpacity={0.9}>
      <Text style={[styles.feedFavoriteText, SANS]} numberOfLines={3}>
        {favorite.headline}
      </Text>
      <Text style={[styles.feedFavoriteCta, SANS]}>View history →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 52, 44, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 22,
    backgroundColor: CREAM,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.28)',
    ...Platform.select({
      web: { boxShadow: '0 18px 40px rgba(40,52,44,0.22)' },
      default: {
        shadowColor: '#28342C',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: SAGE,
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.28)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: INK,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },
  inputMulti: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.3)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  chipOn: {
    backgroundColor: 'rgba(92, 122, 104, 0.18)',
    borderColor: SAGE,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
  },
  chipTextOn: {
    color: INK,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: SAGE,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelText: {
    marginTop: 14,
    textAlign: 'center',
    color: MUTED,
    fontWeight: '600',
    fontSize: 14,
  },
  historySheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    marginTop: 'auto',
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: Platform.OS === 'web' ? 28 : 0,
    borderBottomRightRadius: Platform.OS === 'web' ? 28 : 0,
    backgroundColor: CREAM,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
  },
  historyHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(92, 122, 104, 0.28)',
    marginBottom: 12,
  },
  favoriteBanner: {
    marginTop: 10,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 184, 150, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(184, 148, 96, 0.4)',
  },
  favoriteText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  emptyHint: {
    marginVertical: 12,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
    textAlign: 'center',
  },
  secondaryBtn: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.35)',
    marginBottom: 8,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: SAGE,
  },
  historyScroll: {
    flexGrow: 0,
    maxHeight: 360,
  },
  historyScrollContent: {
    paddingBottom: 12,
  },
  sectionBlock: {
    marginTop: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: SAGE,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  entryRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.16)',
    marginBottom: 8,
  },
  entryCopy: {
    gap: 2,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  entryMeta: {
    fontSize: 12,
    color: MUTED,
  },
  entryNotes: {
    marginTop: 4,
    fontSize: 12,
    fontStyle: 'italic',
    color: MUTED,
  },
  closeHistoryBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeHistoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: MUTED,
  },
  feedFavorite: {
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 249, 244, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(184, 148, 96, 0.35)',
  },
  feedFavoriteText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: INK,
  },
  feedFavoriteCta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: SAGE,
  },
});
