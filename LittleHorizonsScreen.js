import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import TextDissolveRelease, { runTextReleaseFlow } from './TextDissolveRelease';
import PremiumGateOverlay from './PremiumGateOverlay';

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

const DAILY_DISCOVERIES = [
  'Fill a shallow bin with dry pasta and let tiny hands scoop and pour — 10 calm minutes.',
  'Tape paper to the floor and offer chunky crayons for big-arm scribbles.',
  'Stack plastic cups in the kitchen — knock-down is the best part.',
  'Read one board book twice: once for story, once for pointing at pictures.',
  'Play “where is your nose?” with gentle mirror giggles.',
  'Offer a warm bath with a few measuring cups — pour party!',
  'Put stickers on a window at toddler height — peel, stick, repeat.',
  'Dance to one song together — freeze when the music stops.',
  'Walk outside and collect three safe leaves or rocks for a “nature bowl.”',
  'Sing a nursery rhyme while folding laundry — they love watching mama move.',
  'Offer a spoon and yogurt cup for supervised stirring “cooking.”',
  'Build a pillow path on the floor for crawling or walking practice.',
];

const VICTORY_TILES = [
  { id: 'potty', emoji: '🚽', label: 'Potty Try', tint: '#F8E8DE' },
  { id: 'taste', emoji: '🥗', label: 'New Taste', tint: '#E8F0E4' },
  { id: 'brushes', emoji: '🧼', label: 'Little Brushes', tint: '#E4EEF8' },
  { id: 'sensory', emoji: '🎨', label: 'Sensory Play', tint: '#F3E4EC' },
  { id: 'story', emoji: '📚', label: 'Storytime', tint: '#F5EDD8' },
  { id: 'move', emoji: '🏃‍♂️', label: 'Active Move', tint: '#D8E6F4' },
];

function getDailyDiscovery() {
  const day = new Date().getDate();
  return DAILY_DISCOVERIES[day % DAILY_DISCOVERIES.length];
}

function formatLogTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

function LittleHorizonsScreen({
  babyAge = '1 Year',
  history = [],
  onSaveEntry,
  isPro = false,
  isSubscribed = false,
  isYearlyMember = false,
  onRequestUpgrade,
  onOpenSubscription,
}) {
  const [activeTile, setActiveTile] = useState(null);
  const [notes, setNotes] = useState('');
  const [releasing, setReleasing] = useState(false);
  const [upgradeSheetOpen, setUpgradeSheetOpen] = useState(false);
  const dailyPrompt = useMemo(() => getDailyDiscovery(), []);
  const releaseRef = useRef(null);

  const hasPro = Boolean(isPro || isSubscribed);
  const showVictoryPremiumLock = !(isYearlyMember || hasPro);

  const openUpgradeSheet = () => {
    setUpgradeSheetOpen(true);
  };

  const openTile = (tile) => {
    if (showVictoryPremiumLock) {
      openUpgradeSheet();
      return;
    }
    setActiveTile(tile);
    setNotes('');
  };

  const closePanel = () => {
    setActiveTile(null);
    setNotes('');
  };

  const saveEntry = async () => {
    if (!activeTile || releasing) return;
    const trimmed = notes.trim();
    if (!trimmed) {
      closePanel();
      return;
    }

    setReleasing(true);
    const { archived } = await runTextReleaseFlow({
      releaseRef,
      text: trimmed,
      isPro: hasPro,
      isSubscribed: hasPro,
      onRequestUpgrade,
      onArchive: async () => {
        onSaveEntry?.({
          id: `${activeTile.id}-${Date.now()}`,
          tileId: activeTile.id,
          tileLabel: activeTile.label,
          tileEmoji: activeTile.emoji,
          notes: trimmed,
          timestamp: new Date().toISOString(),
        });
        closePanel();
      },
    });
    setReleasing(false);
    if (!archived) {
      setNotes('');
      if (!hasPro) closePanel();
    }
  };

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [history]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.rootContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌅 Little Horizons</Text>
        <Text style={styles.headerSub}>Toddler rhythms · {babyAge}</Text>
      </View>

      <View style={styles.discoveryCard}>
        <Text style={[styles.discoveryEyebrow, SERIF]}>TODAY&apos;S DISCOVERY</Text>
        <Text style={[styles.discoveryBody, SERIF]}>{dailyPrompt}</Text>
      </View>

      <Text style={[styles.gridTitle, SERIF]}>Little Victories</Text>
      <View style={styles.victoryGrid}>
        {VICTORY_TILES.map((tile) => (
          <TouchableOpacity
            key={tile.id}
            style={[styles.victoryTile, { backgroundColor: tile.tint }]}
            onPress={() => openTile(tile)}
            activeOpacity={0.88}
          >
            {showVictoryPremiumLock ? (
              <View style={styles.premiumVeil} pointerEvents="none">
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>🔒 ✨ Premium</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.victoryEmoji}>{tile.emoji}</Text>
            <Text style={[styles.victoryLabel, SERIF]}>{tile.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.historyTitle, SERIF]}>Today&apos;s logged rhythm</Text>
      <View style={styles.historySection}>
        {!hasPro && sortedHistory.length > 0 ? (
          <TouchableOpacity
            style={styles.historyGateTap}
            onPress={() => onOpenSubscription?.()}
            activeOpacity={0.92}
          >
            <PremiumGateOverlay label="Unlock history" />
          </TouchableOpacity>
        ) : null}
      {sortedHistory.length === 0 ? (
        <Text style={[styles.historyEmpty, SERIF]}>
          Tap a victory tile to journal — your toddler story builds here.
        </Text>
      ) : (
        sortedHistory.map((entry) => (
          <View
            key={entry.id}
            style={[styles.historyRow, !hasPro && styles.historyRowBlurred]}
          >
            <Text style={styles.historyEmoji}>{entry.tileEmoji}</Text>
            <View style={styles.historyBody}>
              <Text style={[styles.historyLabel, SERIF]}>
                {entry.tileLabel} · {formatLogTime(entry.timestamp)}
              </Text>
              {entry.notes ? (
                <Text style={[styles.historyNotes, SERIF]}>{entry.notes}</Text>
              ) : (
                <Text style={styles.historyNotesMuted}>Logged with love.</Text>
              )}
            </View>
          </View>
        ))
      )}
      </View>

      <Modal visible={upgradeSheetOpen} transparent animationType="fade" onRequestClose={() => setUpgradeSheetOpen(false)}>
        <View style={styles.upgradeBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setUpgradeSheetOpen(false)}
            activeOpacity={1}
          />
          <View style={styles.upgradeSheet}>
            <Text style={[styles.upgradeTitle, SERIF]}>Unlock the Full Village Circle</Text>
            <Text style={[styles.upgradeBody, SERIF]}>
              This milestone logger is exclusive to our Yearly Village members. Upgrade today to unlock
              tracking and claim your 3-piece Founding Gift Box!
            </Text>
            <TouchableOpacity
              style={styles.upgradePrimaryBtn}
              onPress={() => {
                setUpgradeSheetOpen(false);
                onOpenSubscription?.();
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.upgradePrimaryBtnText}>View Yearly Village Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.upgradeGhostBtn}
              onPress={() => setUpgradeSheetOpen(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeGhostBtnText}>Not right now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!activeTile} transparent animationType="slide" onRequestClose={closePanel}>
        <View style={styles.modalBackdrop}>
          <TextDissolveRelease
            ref={releaseRef}
            textStyle={[styles.modalInput, SERIF]}
            tint="rgba(74, 62, 61, 0.92)"
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, SERIF]}>
              {activeTile?.emoji} {activeTile?.label}
            </Text>
            <Text style={[styles.modalHint, SERIF]}>
              Micro-journal this little victory — details mama will treasure later.
            </Text>
            <TextInput
              style={[styles.modalInput, SERIF, releasing && styles.modalInputReleasing]}
              value={notes}
              onChangeText={setNotes}
              placeholder="What happened? A funny moment, a first try, a sweet win…"
              placeholderTextColor="rgba(74, 62, 61, 0.45)"
              multiline
              textAlignVertical="top"
              editable={!releasing}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closePanel} style={styles.modalBtnGhost} disabled={releasing}>
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEntry} style={styles.modalBtnPrimary} disabled={releasing}>
                <Text style={styles.modalBtnPrimaryText}>Save victory</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default React.memo(LittleHorizonsScreen);

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootContent: { paddingBottom: 24 },
  header: { paddingTop: 38, paddingBottom: 10, paddingHorizontal: 2 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2A382E',
    letterSpacing: 0.4,
  },
  headerSub: { fontSize: 12, color: '#5A6E58', marginTop: 4 },
  discoveryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    marginBottom: 16,
  },
  discoveryEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: '#6A7A68',
    marginBottom: 8,
  },
  discoveryBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3D5246',
    fontStyle: 'italic',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D5246',
    marginBottom: 10,
  },
  victoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  victoryTile: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
    overflow: 'hidden',
    position: 'relative',
  },
  premiumVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 16,
    zIndex: 2,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(196, 165, 116, 0.55)',
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A7B4F',
    letterSpacing: 0.3,
  },
  victoryEmoji: { fontSize: 28, marginBottom: 6 },
  victoryLabel: { fontSize: 12, fontWeight: '700', color: '#3D5246', textAlign: 'center' },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D5246',
    marginBottom: 10,
  },
  historySection: {
    position: 'relative',
    minHeight: 48,
  },
  historyGateTap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    minHeight: 120,
  },
  historyRowBlurred: {
    opacity: 0.35,
  },
  historyEmpty: {
    fontSize: 12,
    color: '#6A7A68',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(186, 198, 188, 0.35)',
  },
  historyEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  historyBody: { flex: 1 },
  historyLabel: { fontSize: 12, fontWeight: '700', color: '#3D5246', marginBottom: 4 },
  historyNotes: { fontSize: 12, color: '#5A6A62', lineHeight: 17, fontStyle: 'italic' },
  historyNotesMuted: { fontSize: 11, color: '#8A9A92', fontStyle: 'italic' },
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
    marginBottom: 6,
    textAlign: 'center',
  },
  modalHint: {
    fontSize: 12,
    color: '#7A6A78',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(198, 134, 108, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 14,
    fontSize: 15,
    color: '#4A3E3D',
    marginBottom: 14,
  },
  modalInputReleasing: {
    opacity: 0,
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
  upgradeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 48, 40, 0.45)',
    justifyContent: 'center',
    padding: 24,
    ...Platform.select({
      web: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' },
      default: {},
    }),
  },
  upgradeSheet: {
    backgroundColor: 'rgba(255, 252, 248, 0.94)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A382E',
    textAlign: 'center',
    marginBottom: 12,
  },
  upgradeBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5C6E63',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 18,
  },
  upgradePrimaryBtn: {
    backgroundColor: '#5C7A68',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradePrimaryBtnText: {
    color: '#FFF9F4',
    fontSize: 14,
    fontWeight: '800',
  },
  upgradeGhostBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  upgradeGhostBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B5588',
    fontStyle: 'italic',
  },
});
