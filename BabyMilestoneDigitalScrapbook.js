import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MILESTONE_TILES } from './babyMilestoneData';

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

const PAGE_WIDTH = Math.min(Dimensions.get('window').width - 48, 340);

function formatSavedDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function BabyMilestoneDigitalScrapbook({
  visible,
  onClose,
  entries = {},
  babyAge = 'Newborn',
  mamaName = 'Mama',
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const pages = useMemo(() => {
    const filled = MILESTONE_TILES.filter((tile) => entries[tile.id]);
    return [
      { type: 'cover' },
      ...filled.map((tile) => ({ type: 'memory', tile, entry: entries[tile.id] })),
    ];
  }, [entries]);

  const page = pages[pageIndex] ?? pages[0];
  const greeting = mamaName?.trim() && mamaName.trim() !== 'Mama' ? mamaName.trim() : 'Mama';

  const goNext = () => setPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
  const goPrev = () => setPageIndex((prev) => Math.max(prev - 1, 0));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} hitSlop={12} activeOpacity={0.85}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={[styles.topTitle, SERIF]}>Digital scrapbook</Text>
          <Text style={styles.pageCount}>
            {pageIndex + 1}/{pages.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {page?.type === 'cover' ? (
            <View style={[styles.pageCard, styles.coverCard]}>
              <Text style={styles.coverEmoji}>📖</Text>
              <Text style={[styles.coverTitle, SERIF]}>{greeting}&apos;s Baby Milestones</Text>
              <Text style={[styles.coverSub, SERIF]}>{babyAge} · forever kept</Text>
              <Text style={[styles.coverHint, SERIF]}>
                A gentle album of tiny firsts — made with love in CalmMama Village.
              </Text>
            </View>
          ) : (
            <View style={[styles.pageCard, { backgroundColor: page.tile.tint }]}>
              <Text style={[styles.memoryLabel, SERIF]}>
                {page.tile.emoji} {page.tile.label}
              </Text>
              <View style={styles.photoFrame}>
                {page.entry.photoUri ? (
                  <Image
                    source={{ uri: page.entry.photoUri }}
                    style={styles.photo}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.photoPlaceholder}>{page.tile.emoji}</Text>
                )}
              </View>
              {page.entry.note ? (
                <Text style={[styles.memoryNote, SERIF]}>&ldquo;{page.entry.note}&rdquo;</Text>
              ) : null}
              <Text style={[styles.memoryDate, SERIF]}>{formatSavedDate(page.entry.savedAt)}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, pageIndex === 0 && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={pageIndex === 0}
            activeOpacity={0.88}
          >
            <Text style={styles.navBtnText}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary, pageIndex >= pages.length - 1 && styles.navBtnDisabled]}
            onPress={pageIndex >= pages.length - 1 ? onClose : goNext}
            activeOpacity={0.88}
          >
            <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
              {pageIndex >= pages.length - 1 ? 'Done ✨' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5EDE8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 54,
    paddingBottom: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A6A78',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3E3D',
  },
  pageCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A8A92',
    minWidth: 48,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  pageCard: {
    width: PAGE_WIDTH,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.28)',
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(90, 70, 80, 0.12)' },
      default: { elevation: 4 },
    }),
  },
  coverCard: {
    backgroundColor: '#FFF9F6',
    alignItems: 'center',
    paddingVertical: 36,
  },
  coverEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3E3D',
    textAlign: 'center',
    marginBottom: 6,
  },
  coverSub: {
    fontSize: 14,
    color: '#7A6A78',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  coverHint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#9A8A92',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  memoryLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A3E3D',
    textAlign: 'center',
    marginBottom: 14,
  },
  photoFrame: {
    height: 220,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    fontSize: 48,
  },
  memoryNote: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5A4A48',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  memoryDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7A82',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingTop: 8,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.25)',
  },
  navBtnPrimary: {
    backgroundColor: 'rgba(196, 134, 108, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6A5A58',
  },
  navBtnTextPrimary: {
    color: '#FFF8F4',
  },
});
