import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import GoldenHourCapsule from './GoldenHourCapsule';
import {
  injectNurseryWebFonts,
  retroPageTitle,
  retroSoft,
} from './nurseryRetroFonts';

const GLASS = {
  bg: 'rgba(255, 255, 255, 0.26)',
  border: 'rgba(255, 255, 255, 0.38)',
};

const SAFE_RETRO_SOFT = retroSoft ?? {};
const SAFE_RETRO_PAGE_TITLE = retroPageTitle ?? {};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function CloudNurseryScreen({
  babyAge = 'Newborn',
  nurseryLogs = [],
  onAddLog,
  goldenHourKeepsakes = [],
  onAddGoldenHourKeepsake,
}) {
  const [sleepRunning, setSleepRunning] = useState(false);
  const [sleepSeconds, setSleepSeconds] = useState(0);
  const sleepStartedAt = useRef(null);

  useEffect(() => {
    injectNurseryWebFonts();
  }, []);

  useEffect(() => {
    if (!sleepRunning) return undefined;
    const tick = setInterval(() => {
      if (sleepStartedAt.current) {
        setSleepSeconds(Math.floor((Date.now() - sleepStartedAt.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [sleepRunning]);

  const pushLog = (payload) => {
    onAddLog?.({
      category: 'baby',
      ...payload,
    });
  };

  const oneTapFeed = () => pushLog({ type: 'Feed', notes: 'Feed logged · one tap 🍼' });
  const oneTapSleep = () => {
    if (!sleepRunning) {
      sleepStartedAt.current = Date.now();
      setSleepSeconds(0);
      setSleepRunning(true);
      return;
    }
    const duration = sleepSeconds;
    sleepStartedAt.current = null;
    setSleepRunning(false);
    pushLog({
      type: 'Sleep',
      notes: duration > 0 ? `Nap · ${formatDuration(duration)}` : 'Sleep logged',
    });
    setSleepSeconds(0);
  };
  const oneTapDiaper = (kind) => {
    const labels = { wet: 'Wet 💧', dirty: 'Dirty 🌼', both: 'Both ✨' };
    pushLog({ type: 'Diaper', notes: labels[kind] });
  };
  const oneTapTummy = () => pushLog({ type: 'Tummy Time', notes: 'Tummy time · playful moment 🌱' });

  const babyLogs = nurseryLogs.filter((log) => log.category !== 'healing');

  const oneTapIcons = [
    { id: 'feed', emoji: '🍼', label: 'Feed', onPress: oneTapFeed },
    {
      id: 'sleep',
      emoji: sleepRunning ? '⏱️' : '😴',
      label: sleepRunning ? formatDuration(sleepSeconds) : 'Sleep',
      onPress: oneTapSleep,
    },
    { id: 'wet', emoji: '💧', label: 'Wet', onPress: () => oneTapDiaper('wet') },
    { id: 'dirty', emoji: '🌼', label: 'Dirty', onPress: () => oneTapDiaper('dirty') },
    { id: 'tummy', emoji: '🌱', label: 'Tummy', onPress: oneTapTummy },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.opHeader}>
        <Text style={styles.opHeaderTitle}>☁️ Cloud Nursery Tracker</Text>
        <Text style={styles.opHeaderSub}>Little one · {babyAge}</Text>
      </View>

      <View style={styles.oneTapGrid}>
        {oneTapIcons.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.oneTapBtn}
            onPress={item.onPress}
            activeOpacity={0.88}
          >
            <Text style={styles.oneTapEmoji}>{item.emoji}</Text>
            <Text style={styles.oneTapLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Today&apos;s baby logs</Text>
        {babyLogs.length === 0 ? (
          <Text style={styles.timelineEmpty}>Tap an icon above to log instantly.</Text>
        ) : (
          babyLogs.map((log) => (
            <View key={log.id} style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineType}>
                  {log.type} · {log.time}
                </Text>
                <Text style={styles.timelineNotes}>{log.notes}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <GoldenHourCapsule
        keepsakes={goldenHourKeepsakes}
        onAddKeepsake={onAddGoldenHourKeepsake}
      />
    </View>
  );
}

export default React.memo(CloudNurseryScreen);

const styles = StyleSheet.create({
  root: { paddingBottom: 8 },
  opHeader: { paddingTop: 38, paddingBottom: 10, paddingHorizontal: 2 },
  opHeaderTitle: {
    ...SAFE_RETRO_PAGE_TITLE,
    fontSize: 22,
    color: '#2A382E',
    letterSpacing: 0.6,
  },
  opHeaderSub: { ...SAFE_RETRO_SOFT, fontSize: 12, color: '#5A6E58', marginTop: 4 },
  oneTapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  oneTapBtn: {
    width: '30%',
    minWidth: 96,
    backgroundColor: GLASS.bg,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  oneTapEmoji: { fontSize: 28, marginBottom: 6 },
  oneTapLabel: { ...SAFE_RETRO_SOFT, fontSize: 11, fontWeight: '700', color: '#3D5246' },
  timelineCard: {
    backgroundColor: GLASS.bg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: GLASS.border,
    marginBottom: 12,
  },
  timelineTitle: {
    ...SAFE_RETRO_PAGE_TITLE,
    fontSize: 16,
    color: '#3D5246',
    marginBottom: 10,
  },
  timelineEmpty: { ...SAFE_RETRO_SOFT, fontSize: 13, color: '#7A8A7E', lineHeight: 19 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8FB39A',
    marginTop: 5,
    marginRight: 10,
  },
  timelineBody: { flex: 1 },
  timelineType: { ...SAFE_RETRO_SOFT, fontSize: 12, fontWeight: '700', color: '#3D5246' },
  timelineNotes: { ...SAFE_RETRO_SOFT, fontSize: 12, color: '#5A6E58', marginTop: 2, lineHeight: 17 },
});
