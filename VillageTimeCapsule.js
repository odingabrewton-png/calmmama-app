import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  Image,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import TextDissolveRelease, { runTextReleaseFlow } from './TextDissolveRelease';
import PremiumGateOverlay from './PremiumGateOverlay';
import {
  entryHasContent,
  getEntryPhotos,
  persistTimeCapsulePhotos,
} from './timeCapsuleStorage';

function isPremiumCapsuleMonth(month, entries, isPro) {
  if (isPro) return false;
  if (entryHasContent(entries[month.id])) return false;
  return month.id > 1;
}

const MONTHS = [
  { id: 1, label: 'Jan', tint: '#F8E6DE' },
  { id: 2, label: 'Feb', tint: '#F3E4EC' },
  { id: 3, label: 'Mar', tint: '#E8E0F2' },
  { id: 4, label: 'Apr', tint: '#D8E6F4' },
  { id: 5, label: 'May', tint: '#E6ECE6' },
  { id: 6, label: 'Jun', tint: '#F5DDD0' },
  { id: 7, label: 'Jul', tint: '#F8EDE4' },
  { id: 8, label: 'Aug', tint: '#D4E8F7' },
  { id: 9, label: 'Sep', tint: '#E8E0F2' },
  { id: 10, label: 'Oct', tint: '#F8E6DE' },
  { id: 11, label: 'Nov', tint: '#F3E4EC' },
  { id: 12, label: 'Dec', tint: '#D8E6F4' },
];

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pickMemoryPhotos() {
  try {
    const ImagePicker = require('expo-image-picker');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo access', 'Allow photo library access to add photos to your time capsule.');
      return [];
    }
    // Brief pause so the month sheet can dismiss before iOS presents the picker
    await waitMs(280);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 12,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return [];
    return result.assets.map((asset) => asset.uri).filter(Boolean);
  } catch {
    Alert.alert(
      'Add photos',
      'Photo picker will connect on your next native build — you can still save your note.'
    );
    return [];
  }
}

export default function VillageTimeCapsule({
  babyAge = '1 Year',
  entries = {},
  onSaveMonth,
  isPro = false,
  isSubscribed = false,
  onRequestUpgrade,
  onOpenSubscription,
}) {
  const hasPro = Boolean(isPro || isSubscribed);
  const [activeMonth, setActiveMonth] = useState(null);
  const [draft, setDraft] = useState('');
  const [photoUris, setPhotoUris] = useState([]);
  const [shareWithVillage, setShareWithVillage] = useState(false);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [releasing, setReleasing] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [pickingPhotos, setPickingPhotos] = useState(false);
  const releaseRef = useRef(null);
  const editSessionRef = useRef(null);

  const savedMonths = useMemo(
    () => MONTHS.filter((m) => entryHasContent(entries[m.id])),
    [entries]
  );

  const slideshowSlides = useMemo(() => {
    const slides = [];
    for (const month of MONTHS) {
      const entry = entries[month.id];
      if (!entryHasContent(entry)) continue;
      const photos = getEntryPhotos(entry);
      if (photos.length === 0) {
        slides.push({ month, photoUri: null, summary: entry.summary });
        continue;
      }
      for (const photoUri of photos) {
        slides.push({ month, photoUri, summary: entry.summary });
      }
    }
    return slides;
  }, [entries]);

  const buildMonthPayload = (month, overrides = {}) => {
    const saved = entries[month.id] || {};
    return {
      summary: overrides.summary ?? saved.summary ?? '',
      photoUris: overrides.photoUris ?? getEntryPhotos(saved),
      shareWithVillage: overrides.shareWithVillage ?? !!saved.shareWithVillage,
      lockedAt: overrides.lockedAt ?? saved.lockedAt ?? new Date().toISOString(),
      monthLabel: month.label,
    };
  };

  const persistMonthPhotos = async (month, nextPhotoUris, extra = {}) => {
    if (!month) return nextPhotoUris;
    setSavingPhotos(true);
    try {
      const persisted = await persistTimeCapsulePhotos(nextPhotoUris);
      setPhotoUris(persisted);
      if (editSessionRef.current?.month?.id === month.id) {
        editSessionRef.current = {
          ...editSessionRef.current,
          photoUris: persisted,
        };
      }
      onSaveMonth?.(month.id, buildMonthPayload(month, { ...extra, photoUris: persisted }));
      return persisted;
    } catch {
      // Still keep the picked URIs in the UI so mama can save the month
      setPhotoUris(nextPhotoUris);
      onSaveMonth?.(month.id, buildMonthPayload(month, { ...extra, photoUris: nextPhotoUris }));
      return nextPhotoUris;
    } finally {
      setSavingPhotos(false);
    }
  };

  const openMonth = (month) => {
    if (isPremiumCapsuleMonth(month, entries, hasPro)) {
      onOpenSubscription?.();
      return;
    }
    const saved = entries[month.id] || {};
    const photos = getEntryPhotos(saved);
    const summary = saved.summary ?? '';
    const share = !!saved.shareWithVillage;
    editSessionRef.current = { month, photoUris: photos, draft: summary, shareWithVillage: share };
    setActiveMonth(month);
    setDraft(summary);
    setPhotoUris(photos);
    setShareWithVillage(share);
  };

  const closeModal = () => {
    if (pickingPhotos) return;
    editSessionRef.current = null;
    setActiveMonth(null);
    setDraft('');
    setPhotoUris([]);
    setShareWithVillage(false);
  };

  const restoreEditSheet = (session) => {
    if (!session?.month) return;
    setActiveMonth(session.month);
    setDraft(session.draft ?? '');
    setPhotoUris(session.photoUris ?? []);
    setShareWithVillage(!!session.shareWithVillage);
  };

  const handleAddPhotos = async () => {
    if (!activeMonth || savingPhotos || pickingPhotos) return;

    const session = {
      month: activeMonth,
      draft,
      photoUris: [...photoUris],
      shareWithVillage,
    };
    editSessionRef.current = session;

    // Hide the month sheet first — iOS picker + RN Modal fight each other,
    // so after the blue check the sheet never came back to save.
    setPickingPhotos(true);
    setActiveMonth(null);

    try {
      const pickedUris = await pickMemoryPhotos();
      const base = editSessionRef.current || session;
      if (!pickedUris.length) {
        restoreEditSheet(base);
        return;
      }

      const merged = [
        ...(base.photoUris || []),
        ...pickedUris.filter((uri) => !(base.photoUris || []).includes(uri)),
      ];
      const nextSession = { ...base, photoUris: merged };
      editSessionRef.current = nextSession;

      // Bring the sheet back right away so Save month is reachable
      restoreEditSheet(nextSession);
      setPickingPhotos(false);
      await waitMs(80);
      await persistMonthPhotos(base.month, merged, { shareWithVillage: base.shareWithVillage });
    } finally {
      setPickingPhotos(false);
    }
  };

  const handleRemovePhoto = async (uri) => {
    if (!activeMonth || savingPhotos || pickingPhotos) return;
    const next = photoUris.filter((item) => item !== uri);
    setPhotoUris(next);
    if (editSessionRef.current) {
      editSessionRef.current = { ...editSessionRef.current, photoUris: next };
    }
    await persistMonthPhotos(activeMonth, next, { shareWithVillage });
  };

  const save = async () => {
    if (!activeMonth || releasing || pickingPhotos) return;
    const trimmed = draft.trim();

    if (trimmed) {
      setReleasing(true);
      const { archived } = await runTextReleaseFlow({
        releaseRef,
        text: trimmed,
        isPro: hasPro,
        isSubscribed: hasPro,
        onRequestUpgrade,
        onArchive: async () => {
          onSaveMonth?.(activeMonth.id, {
            ...buildMonthPayload(activeMonth, { summary: trimmed, photoUris, shareWithVillage }),
            lockedAt: new Date().toISOString(),
          });
          closeModal();
        },
      });
      setReleasing(false);
      if (!archived) {
        setDraft('');
        if (!hasPro) closeModal();
      }
      return;
    }

    // Photos are already persisted when added — just lock the month and close
    if (photoUris.length) {
      onSaveMonth?.(activeMonth.id, {
        ...buildMonthPayload(activeMonth, { summary: '', photoUris, shareWithVillage }),
        lockedAt: new Date().toISOString(),
      });
      closeModal();
      return;
    }

    Alert.alert('Add photos', 'Add at least one photo or write a memory note for this month.');
  };

  const openSlideshow = () => {
    if (!hasPro) {
      onOpenSubscription?.();
      return;
    }
    if (slideshowSlides.length === 0) {
      Alert.alert('Yearly slideshow', 'Add photos or notes to at least one month to begin your slideshow.');
      return;
    }
    setSlideIndex(0);
    setSlideshowOpen(true);
  };

  const advanceSlide = () => {
    setSlideIndex((i) => (i + 1 >= slideshowSlides.length ? 0 : i + 1));
  };

  const activeSlide = slideshowSlides[slideIndex];

  return (
    <View style={styles.root}>
      <Text style={[styles.eyebrow, SERIF]}>THE VILLAGE TIME CAPSULE</Text>
      <Text style={[styles.title, SERIF]}>Toddler Time Capsule</Text>
      <Text style={[styles.sub, SERIF]}>Add photos and notes each month — {babyAge} and counting</Text>

      <View style={styles.grid}>
        {MONTHS.map((month) => {
          const saved = entries[month.id];
          const photos = getEntryPhotos(saved);
          const premiumLocked = isPremiumCapsuleMonth(month, entries, hasPro);
          return (
            <TouchableOpacity
              key={month.id}
              style={[styles.slot, { backgroundColor: month.tint }]}
              onPress={() => openMonth(month)}
              activeOpacity={0.88}
            >
              <View style={styles.polaroidFrame}>
                {photos[0] ? (
                  <Image source={{ uri: photos[0] }} style={styles.slotPhoto} resizeMode="cover" />
                ) : (
                  <Text style={styles.monthNum}>{month.id}</Text>
                )}
                {photos.length > 1 ? (
                  <View style={styles.photoCountBadge}>
                    <Text style={styles.photoCountText}>{photos.length}</Text>
                  </View>
                ) : null}
                {premiumLocked ? (
                  <PremiumGateOverlay compact />
                ) : saved ? (
                  <Text style={styles.lockedBadge}>{saved.shareWithVillage ? '💕' : '🔒'}</Text>
                ) : (
                  <Text style={styles.addIcon}>＋</Text>
                )}
              </View>
              <Text style={[styles.monthLabel, SERIF]}>{month.label}</Text>
              {saved?.summary ? (
                <Text style={[styles.monthSummary, SERIF]} numberOfLines={2}>
                  {saved.summary}
                </Text>
              ) : (
                <Text style={[styles.monthHint, SERIF]}>Add photos</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.slideshowBtn} onPress={openSlideshow} activeOpacity={0.9}>
        <Text style={[styles.slideshowBtnText, SERIF]}>View Yearly Slideshow ✨</Text>
      </TouchableOpacity>

      <Modal
        visible={!!activeMonth && !pickingPhotos}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <TextDissolveRelease
            ref={releaseRef}
            textStyle={[styles.modalInput, SERIF]}
            tint="rgba(74, 62, 61, 0.92)"
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, SERIF]}>
              {activeMonth?.label} — toddler memory
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoStrip}
            >
              {photoUris.map((uri) => (
                <View key={uri} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => handleRemovePhoto(uri)}
                    disabled={savingPhotos}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.photoAddTile}
                onPress={handleAddPhotos}
                activeOpacity={0.88}
                disabled={savingPhotos}
              >
                <Text style={styles.photoAddEmoji}>📷</Text>
                <Text style={[styles.photoAddLabel, SERIF]}>
                  {photoUris.length ? 'Add more' : 'Add photos'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {savingPhotos ? (
              <Text style={[styles.savingHint, SERIF]}>Saving your photos…</Text>
            ) : null}

            <TextInput
              style={[styles.modalInput, SERIF, releasing && styles.modalInputReleasing]}
              value={draft}
              onChangeText={(text) => {
                setDraft(text);
                if (editSessionRef.current) {
                  editSessionRef.current = { ...editSessionRef.current, draft: text };
                }
              }}
              placeholder="Describe the memory or milestone…"
              placeholderTextColor="rgba(74, 62, 61, 0.45)"
              multiline
              textAlignVertical="top"
              editable={!releasing && !savingPhotos && !pickingPhotos}
            />
            <View style={styles.shareRow}>
              <Text style={[styles.shareLabel, SERIF]}>Share with Village Mamas</Text>
              <Switch
                value={shareWithVillage}
                onValueChange={(value) => {
                  setShareWithVillage(value);
                  if (editSessionRef.current) {
                    editSessionRef.current = { ...editSessionRef.current, shareWithVillage: value };
                  }
                }}
                trackColor={{ false: '#D8CEC8', true: 'rgba(196, 134, 108, 0.55)' }}
                thumbColor={shareWithVillage ? '#C4866C' : '#F5F0EC'}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalBtnGhost}
                disabled={releasing || pickingPhotos}
              >
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={save}
                style={styles.modalBtnPrimary}
                disabled={releasing || pickingPhotos}
              >
                <Text style={styles.modalBtnPrimaryText}>Save month</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={slideshowOpen} transparent animationType="fade" onRequestClose={() => setSlideshowOpen(false)}>
        <View style={styles.slideshowBackdrop}>
          <View style={styles.slideshowCard}>
            <Text style={[styles.slideshowTitle, SERIF]}>
              {activeSlide?.month?.label} · Year in review
            </Text>
            {activeSlide?.photoUri ? (
              <Image
                source={{ uri: activeSlide.photoUri }}
                style={styles.slideshowPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.slideshowPhotoPlaceholder}>
                <Text style={styles.slideshowPlaceholderEmoji}>🌸</Text>
              </View>
            )}
            <ScrollView style={styles.slideshowCaptionScroll}>
              <Text style={[styles.slideshowCaption, SERIF]}>
                {activeSlide?.summary || 'A beautiful month in the village.'}
              </Text>
            </ScrollView>
            <View style={styles.slideshowActions}>
              <TouchableOpacity onPress={() => setSlideshowOpen(false)} style={styles.modalBtnGhost}>
                <Text style={styles.modalBtnGhostText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={advanceSlide} style={styles.modalBtnPrimary}>
                <Text style={styles.modalBtnPrimaryText}>
                  {slideshowSlides.length > 1 ? 'Next →' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 4, paddingBottom: 16 },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#8A6A78',
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3E3D',
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#7A6A78',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  slot: {
    width: '31%',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.22)',
    minHeight: 124,
  },
  polaroidFrame: {
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  slotPhoto: { width: '100%', height: '100%', borderRadius: 8 },
  monthNum: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(74, 62, 61, 0.35)',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(74, 62, 61, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF8F4',
  },
  lockedBadge: { position: 'absolute', top: 6, right: 8, fontSize: 12 },
  addIcon: { position: 'absolute', bottom: 6, right: 8, fontSize: 14, color: '#B88A7E' },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3E3D',
    textAlign: 'center',
    marginBottom: 3,
  },
  monthSummary: {
    fontSize: 10,
    color: '#6A5A58',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 13,
  },
  monthHint: {
    fontSize: 11,
    color: '#7A6A78',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  slideshowBtn: {
    marginTop: 18,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 134, 108, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(196, 134, 108, 0.45)',
    alignItems: 'center',
  },
  slideshowBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3E3D',
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 32, 36, 0.42)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'rgba(255, 249, 246, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.28)',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(198, 134, 108, 0.35)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3E3D',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoStrip: {
    gap: 10,
    paddingBottom: 12,
    alignItems: 'center',
  },
  photoThumbWrap: {
    width: 92,
    height: 92,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.35)',
  },
  photoThumb: { width: '100%', height: '100%' },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(74, 62, 61, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    color: '#FFF8F4',
    fontSize: 11,
    fontWeight: '700',
  },
  photoAddTile: {
    width: 92,
    height: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  photoAddEmoji: { fontSize: 22, marginBottom: 4 },
  photoAddLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6A78',
    textAlign: 'center',
  },
  savingHint: {
    fontSize: 12,
    color: '#8A7A82',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  modalInput: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 14,
    fontSize: 15,
    color: '#4A3E3D',
    marginBottom: 12,
  },
  modalInputReleasing: {
    opacity: 0,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  shareLabel: { fontSize: 14, color: '#4A3E3D', fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalBtnGhost: { paddingVertical: 10, paddingHorizontal: 14 },
  modalBtnGhostText: { color: '#7A6A78', fontWeight: '600' },
  modalBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(196, 134, 108, 0.85)',
  },
  modalBtnPrimaryText: { color: '#FFF8F4', fontWeight: '700' },
  slideshowBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 28, 30, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  slideshowCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.35)',
  },
  slideshowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A3E3D',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideshowPhoto: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 12,
  },
  slideshowPhotoPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 230, 222, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  slideshowPlaceholderEmoji: { fontSize: 48 },
  slideshowCaptionScroll: { maxHeight: 100, marginBottom: 12 },
  slideshowCaption: {
    fontSize: 14,
    color: '#5A4A48',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  slideshowActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
