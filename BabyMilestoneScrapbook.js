import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import BabyMilestoneDigitalScrapbook from './BabyMilestoneDigitalScrapbook';
import {
  MILESTONE_TILES,
  areAllMilestonesComplete,
  isMilestoneEntryComplete,
} from './babyMilestoneData';
import { POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED } from './postpartumInfantHomeLayoutConfig';

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

async function pickMilestonePhoto(onPicked) {
  try {
    const ImagePicker = require('expo-image-picker');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo access', 'Allow photo library access to add a picture of your little one.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onPicked(result.assets[0].uri);
    }
  } catch {
    Alert.alert(
      'Baby photo',
      'Photo picker will connect on your next native build — you can still save your note.'
    );
  }
}

export default function BabyMilestoneScrapbook({
  babyAge = 'Newborn',
  mamaName = 'Mama',
  entries = {},
  onSaveEntry,
}) {
  if (__DEV__ && !POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED) {
    console.warn(
      '[BabyMilestoneScrapbook] POSTPARTUM_INFANT_HOME_LAYOUT_LOCKED is false — infant home layout edits allowed'
    );
  }

  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState('');
  const [draftPhotoUri, setDraftPhotoUri] = useState(null);
  const [scrapbookOpen, setScrapbookOpen] = useState(false);

  const completedCount = useMemo(
    () => MILESTONE_TILES.filter((tile) => isMilestoneEntryComplete(entries[tile.id])).length,
    [entries]
  );
  const allComplete = useMemo(() => areAllMilestonesComplete(entries), [entries]);

  const openTile = (tile) => {
    const saved = entries[tile.id];
    setActive(tile);
    setDraft(saved?.note ?? '');
    setDraftPhotoUri(saved?.photoUri ?? null);
  };

  const closeModal = () => {
    setActive(null);
    setDraft('');
    setDraftPhotoUri(null);
  };

  const save = () => {
    if (!active) return;
    if (!draft.trim() && !draftPhotoUri) {
      Alert.alert('Save a memory', 'Add a sweet note or a photo of your little one.');
      return;
    }
    onSaveEntry?.(active.id, {
      note: draft.trim(),
      photoUri: draftPhotoUri || undefined,
      savedAt: new Date().toISOString(),
    });
    closeModal();
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.eyebrow, SERIF]}>BABY&apos;S FIRST MILESTONE SCRAPBOOK</Text>
      <Text style={[styles.title, SERIF]}>Tiny moments, forever kept</Text>
      <Text style={[styles.sub, SERIF]}>Tap a polaroid to capture {babyAge} memories</Text>

      <Text style={[styles.progress, SERIF]}>
        {completedCount} of {MILESTONE_TILES.length} memories saved
      </Text>

      <View style={styles.grid}>
        {MILESTONE_TILES.map((tile) => {
          const saved = entries[tile.id];
          const complete = isMilestoneEntryComplete(saved);
          return (
            <TouchableOpacity
              key={tile.id}
              style={[styles.polaroid, { backgroundColor: tile.tint }]}
              onPress={() => openTile(tile)}
              activeOpacity={0.9}
            >
              <View style={styles.polaroidPhoto}>
                {saved?.photoUri ? (
                  <Image source={{ uri: saved.photoUri }} style={styles.polaroidImage} contentFit="cover" />
                ) : (
                  <Text style={styles.polaroidEmoji}>{tile.emoji}</Text>
                )}
                {complete ? <View style={styles.savedDot} /> : null}
              </View>
              <Text style={[styles.polaroidLabel, SERIF]} numberOfLines={2}>
                {tile.label}
              </Text>
              {saved?.note ? (
                <Text style={[styles.polaroidNote, SERIF]} numberOfLines={2}>
                  {saved.note}
                </Text>
              ) : (
                <Text style={styles.polaroidHint}>Tap to document →</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {allComplete ? (
        <TouchableOpacity
          style={styles.scrapbookBtn}
          onPress={() => setScrapbookOpen(true)}
          activeOpacity={0.9}
        >
          <Text style={[styles.scrapbookBtnTitle, SERIF]}>Create digital scrapbook ✨</Text>
          <Text style={[styles.scrapbookBtnSub, SERIF]}>
            All nine milestones are saved — flip through her album anytime.
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.scrapbookHintBox}>
          <Text style={[styles.scrapbookHint, SERIF]}>
            Fill every polaroid with a note or photo to unlock her digital scrapbook.
          </Text>
        </View>
      )}

      <Modal visible={!!active} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, SERIF]}>
              {active?.emoji} {active?.label}
            </Text>

            <TouchableOpacity
              style={styles.photoPickerBtn}
              onPress={() => pickMilestonePhoto(setDraftPhotoUri)}
              activeOpacity={0.88}
            >
              {draftPhotoUri ? (
                <Image source={{ uri: draftPhotoUri }} style={styles.modalPhotoPreview} contentFit="cover" />
              ) : (
                <View style={styles.photoPickerPlaceholder}>
                  <Text style={styles.photoPickerEmoji}>📷</Text>
                  <Text style={[styles.photoPickerText, SERIF]}>Add a picture of your little one</Text>
                </View>
              )}
            </TouchableOpacity>

            {draftPhotoUri ? (
              <TouchableOpacity onPress={() => setDraftPhotoUri(null)} style={styles.removePhotoBtn}>
                <Text style={styles.removePhotoText}>Remove photo</Text>
              </TouchableOpacity>
            ) : null}

            <TextInput
              style={[styles.modalInput, SERIF]}
              value={draft}
              onChangeText={setDraft}
              placeholder="What happened? A date, feeling, or sweet detail…"
              placeholderTextColor="rgba(74, 62, 61, 0.45)"
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.modalBtnGhost}>
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={styles.modalBtnPrimary}>
                <Text style={styles.modalBtnPrimaryText}>Save memory</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BabyMilestoneDigitalScrapbook
        visible={scrapbookOpen}
        onClose={() => setScrapbookOpen(false)}
        entries={entries}
        babyAge={babyAge}
        mamaName={mamaName}
      />
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
    marginBottom: 8,
  },
  progress: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A8A92',
    textAlign: 'center',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  polaroid: {
    width: '47%',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.28)',
    ...Platform.select({
      web: { boxShadow: '0 4px 18px rgba(90, 70, 80, 0.08)' },
      default: { elevation: 2 },
    }),
  },
  polaroidPhoto: {
    height: 88,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  polaroidImage: {
    width: '100%',
    height: '100%',
  },
  polaroidEmoji: { fontSize: 36 },
  savedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C4866C',
  },
  polaroidLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3E3D',
    textAlign: 'center',
    marginBottom: 4,
  },
  polaroidNote: {
    fontSize: 10,
    color: '#6A5A58',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  polaroidHint: {
    fontSize: 9,
    color: '#9A8A92',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrapbookBtn: {
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(196, 134, 108, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
  },
  scrapbookBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF8F4',
    marginBottom: 4,
  },
  scrapbookBtnSub: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255, 248, 244, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrapbookHintBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.2)',
  },
  scrapbookHint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7A6A78',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 32, 36, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF9F6',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.35)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3E3D',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoPickerBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.3)',
  },
  photoPickerPlaceholder: {
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  photoPickerEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  photoPickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A6A78',
    textAlign: 'center',
  },
  modalPhotoPreview: {
    width: '100%',
    height: 180,
  },
  removePhotoBtn: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A6A78',
  },
  modalInput: {
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 14,
    fontSize: 15,
    color: '#4A3E3D',
    marginBottom: 14,
  },
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
});
