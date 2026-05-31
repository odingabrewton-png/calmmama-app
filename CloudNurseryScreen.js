import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  injectNurseryWebFonts,
  retroAccent,
  retroHubTitle,
  retroPageTitle,
  retroSoft,
} from './nurseryRetroFonts';

const GLASS = {
  bg: 'rgba(255, 255, 255, 0.26)',
  border: 'rgba(255, 255, 255, 0.38)',
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function SegmentToggle({ value, onChange }) {
  return (
    <View style={styles.segmentTrack}>
      <TouchableOpacity
        style={[styles.segmentBtn, value === 'baby' && styles.segmentBtnActive]}
        onPress={() => onChange('baby')}
        activeOpacity={0.85}
      >
        <Text style={[styles.segmentText, value === 'baby' && styles.segmentTextActive]}>
          ✨ Baby's Cycles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segmentBtn, value === 'healing' && styles.segmentBtnActive]}
        onPress={() => onChange('healing')}
        activeOpacity={0.85}
      >
        <Text style={[styles.segmentText, value === 'healing' && styles.segmentTextActive]}>
          🌸 My Healing
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function GlassCard({ title, emoji, children }) {
  return (
    <View style={styles.dashCard}>
      <Text style={styles.dashCardTitle}>
        {emoji} {title}
      </Text>
      {children}
    </View>
  );
}

export default function CloudNurseryScreen({
  babyAge = 'Newborn',
  nurseryLogs = [],
  nurseryPerspective = 'baby',
  onPerspectiveChange,
  onAddLog,
  hydrationOz = 0,
  hydrationGoal = 64,
  onHydrationChange,
  recoveryChecks = {},
  onToggleRecoveryCheck,
  minutesForMe = 0,
  onMinutesForMeChange,
}) {
  const [feedMode, setFeedMode] = useState('breast');
  const [feedSide, setFeedSide] = useState('left');
  const [feedAmount, setFeedAmount] = useState('10');

  const [sleepRunning, setSleepRunning] = useState(false);
  const [sleepSeconds, setSleepSeconds] = useState(0);
  const sleepStartedAt = useRef(null);

  const [tummyRunning, setTummyRunning] = useState(false);
  const [tummySeconds, setTummySeconds] = useState(0);
  const tummyStartedAt = useRef(null);

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

  useEffect(() => {
    if (!tummyRunning) return undefined;
    const tick = setInterval(() => {
      if (tummyStartedAt.current) {
        setTummySeconds(Math.floor((Date.now() - tummyStartedAt.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [tummyRunning]);

  const pushLog = (payload) => {
    onAddLog?.({
      category: nurseryPerspective === 'healing' ? 'healing' : 'baby',
      ...payload,
    });
  };

  const logFeed = () => {
    const amount = feedAmount.trim() || '0';
    if (feedMode === 'breast') {
      pushLog({
        type: 'Feed',
        notes: `${amount} min — ${feedSide === 'left' ? 'Left' : 'Right'} breast`,
      });
    } else {
      pushLog({
        type: 'Feed',
        notes: `${amount} oz — Bottle`,
      });
    }
  };

  const toggleSleepTimer = () => {
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
      notes: duration > 0 ? `Nap tracked · ${formatDuration(duration)}` : 'Sleep window logged',
    });
    setSleepSeconds(0);
  };

  const logManualSleep = () => {
    pushLog({ type: 'Sleep', notes: 'Manual sleep window logged' });
  };

  const logDiaper = (kind) => {
    const labels = { wet: 'Wet', dirty: 'Dirty', both: 'Wet & Dirty' };
    pushLog({ type: 'Diaper', notes: labels[kind] });
  };

  const toggleTummyTimer = () => {
    if (!tummyRunning) {
      tummyStartedAt.current = Date.now();
      setTummySeconds(0);
      setTummyRunning(true);
      return;
    }
    const duration = tummySeconds;
    tummyStartedAt.current = null;
    setTummyRunning(false);
    pushLog({
      type: 'Tummy Time',
      notes: duration > 0 ? `Playful session · ${formatDuration(duration)}` : 'Tummy time logged',
    });
    setTummySeconds(0);
  };

  const addHydration = (oz) => {
    const next = Math.max(0, hydrationOz + oz);
    onHydrationChange?.(next);
    pushLog({
      type: 'Hydration',
      notes: `+${oz} oz · ${next}/${hydrationGoal} oz today`,
      category: 'healing',
    });
  };

  const toggleRecovery = (key, label) => {
    const next = !recoveryChecks[key];
    onToggleRecoveryCheck?.(key, next);
    if (next) {
      pushLog({ type: 'Recovery', notes: `Checked · ${label}`, category: 'healing' });
    }
  };

  const addSelfCareMinutes = (mins) => {
    const next = minutesForMe + mins;
    onMinutesForMeChange?.(next);
    pushLog({
      type: 'Self-Care',
      notes: `+${mins} peaceful minutes · ${next} min today`,
      category: 'healing',
    });
  };

  const visibleLogs = nurseryLogs.filter((log) =>
    nurseryPerspective === 'healing' ? log.category === 'healing' : log.category !== 'healing'
  );

  const recoveryItems = [
    { key: 'hydration', label: 'Hydration goal met', emoji: '💧' },
    { key: 'sitzBath', label: 'Sitz bath', emoji: '🛁' },
    { key: 'vitamins', label: 'Vitamins', emoji: '🌿' },
    { key: 'meds', label: 'Recovery meds', emoji: '💊' },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.opHeader}>
        <Text style={styles.opHeaderTitle}>☁️ Cloud Nursery Tracker</Text>
        <Text style={styles.opHeaderSub}>Little one · {babyAge}</Text>
      </View>

      <SegmentToggle value={nurseryPerspective} onChange={onPerspectiveChange} />

      {nurseryPerspective === 'baby' ? (
        <View style={styles.grid}>
          <GlassCard title="Feeding Log" emoji="🍼">
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, feedMode === 'breast' && styles.chipActive]}
                onPress={() => setFeedMode('breast')}
              >
                <Text style={[styles.chipText, feedMode === 'breast' && styles.chipTextActive]}>
                  Breast
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, feedMode === 'bottle' && styles.chipActive]}
                onPress={() => setFeedMode('bottle')}
              >
                <Text style={[styles.chipText, feedMode === 'bottle' && styles.chipTextActive]}>
                  Bottle
                </Text>
              </TouchableOpacity>
            </View>
            {feedMode === 'breast' ? (
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, feedSide === 'left' && styles.chipActive]}
                  onPress={() => setFeedSide('left')}
                >
                  <Text style={[styles.chipText, feedSide === 'left' && styles.chipTextActive]}>
                    Left
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, feedSide === 'right' && styles.chipActive]}
                  onPress={() => setFeedSide('right')}
                >
                  <Text style={[styles.chipText, feedSide === 'right' && styles.chipTextActive]}>
                    Right
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <Text style={styles.fieldLabel}>
              {feedMode === 'breast' ? 'Minutes' : 'Fluid ounces'}
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={feedAmount}
              onChangeText={setFeedAmount}
              keyboardType="numeric"
              placeholder={feedMode === 'breast' ? '10' : '4'}
              placeholderTextColor="#7A8E82"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={logFeed}>
              <Text style={styles.primaryBtnText}>Log Feed</Text>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard title="Sleep Tracker" emoji="😴">
            <Text style={styles.timerReadout}>
              {sleepRunning ? formatDuration(sleepSeconds) : 'Ready for nap timer'}
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, sleepRunning && styles.stopBtn]}
              onPress={toggleSleepTimer}
            >
              <Text style={styles.primaryBtnText}>
                {sleepRunning ? 'Stop & Log Nap' : 'Start Nap Timer'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={logManualSleep}>
              <Text style={styles.ghostBtnText}>Log sleep window manually</Text>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard title="Diaper Hub" emoji="🧷">
            <View style={styles.diaperRow}>
              <TouchableOpacity style={styles.diaperBtn} onPress={() => logDiaper('wet')}>
                <Text style={styles.diaperEmoji}>💧</Text>
                <Text style={styles.diaperLabel}>Wet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.diaperBtn} onPress={() => logDiaper('dirty')}>
                <Text style={styles.diaperEmoji}>🌼</Text>
                <Text style={styles.diaperLabel}>Dirty</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.diaperBtn} onPress={() => logDiaper('both')}>
                <Text style={styles.diaperEmoji}>✨</Text>
                <Text style={styles.diaperLabel}>Both</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          <GlassCard title="Tummy Time" emoji="🌱">
            <Text style={styles.timerReadout}>
              {tummyRunning ? formatDuration(tummySeconds) : 'Tap to play & track'}
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, tummyRunning && styles.stopBtn]}
              onPress={toggleTummyTimer}
            >
              <Text style={styles.primaryBtnText}>
                {tummyRunning ? 'End Play Session' : 'Start Tummy Timer'}
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      ) : (
        <View style={styles.healingStack}>
          <View style={[styles.dashCard, styles.healingCard]}>
            <Text style={styles.dashCardTitle}>💧 Hydration Station</Text>
            <Text style={styles.hydrationCount}>
              {hydrationOz} <Text style={styles.hydrationGoal}>/ {hydrationGoal} oz today</Text>
            </Text>
            <View style={styles.dropRow}>
              {[8, 12, 16].map((oz) => (
                <TouchableOpacity key={oz} style={styles.dropBtn} onPress={() => addHydration(oz)}>
                  <Text style={styles.dropBtnText}>+{oz} oz</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.dashCard, styles.healingCard]}>
            <Text style={styles.dashCardTitle}>💊 Recovery & Med Check</Text>
            {recoveryItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.checkRow}
                onPress={() => toggleRecovery(item.key, item.label)}
              >
                <View
                  style={[
                    styles.checkBox,
                    recoveryChecks[item.key] && styles.checkBoxOn,
                  ]}
                >
                  {recoveryChecks[item.key] ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.checkLabel}>
                  {item.emoji} {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.dashCard, styles.healingCard]}>
            <Text style={styles.dashCardTitle}>☕ Minutes for Me</Text>
            <Text style={styles.minutesCount}>{minutesForMe} min of peaceful self-care today</Text>
            <View style={styles.chipRow}>
              {[5, 10, 15].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={styles.chip}
                  onPress={() => addSelfCareMinutes(mins)}
                >
                  <Text style={styles.chipText}>+{mins} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.privacyBanner}>
            🔒 All physical healing metrics stay secured locally on your device through our
            encryption framework — nothing leaves this sanctuary.
          </Text>
        </View>
      )}

      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Chronological Feed</Text>
        {visibleLogs.length === 0 ? (
          <Text style={styles.timelineEmpty}>
            No entries yet — your gentle timeline will bloom here.
          </Text>
        ) : (
          visibleLogs.map((log) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: 8,
  },
  opHeader: {
    paddingTop: 38,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  opHeaderTitle: {
    ...retroPageTitle,
    fontSize: 22,
    color: '#2A382E',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(163, 83, 56, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  opHeaderSub: {
    ...retroSoft,
    fontSize: 12,
    color: '#5A6E58',
    marginTop: 4,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: GLASS.border,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(26, 41, 31, 0.08)' },
      default: {
        shadowColor: '#1A291F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  segmentText: {
    ...retroSoft,
    fontSize: 11,
    fontWeight: '600',
    color: '#5C6E63',
  },
  segmentTextActive: {
    color: '#2A382E',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  healingStack: {},
  healingCard: {
    width: '100%',
  },
  dashCard: {
    width: '48%',
    backgroundColor: GLASS.bg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    marginBottom: 10,
    minHeight: 168,
  },
  dashCardTitle: {
    ...retroHubTitle,
    fontSize: 15,
    lineHeight: 22,
    color: '#3D5246',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
  },
  chipActive: {
    backgroundColor: '#4A5C50',
    borderColor: '#4A5C50',
  },
  chipText: {
    ...retroSoft,
    fontSize: 10,
    fontWeight: '700',
    color: '#3D4F44',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  fieldLabel: {
    ...retroSoft,
    fontSize: 9,
    fontWeight: '700',
    color: '#5C6E63',
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldInput: {
    ...retroSoft,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.55)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#152219',
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: '#4A5C50',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 'auto',
  },
  stopBtn: {
    backgroundColor: '#8C5A48',
  },
  primaryBtnText: {
    ...retroSoft,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ghostBtn: {
    marginTop: 6,
    alignItems: 'center',
  },
  ghostBtnText: {
    ...retroSoft,
    fontSize: 10,
    color: '#5C6E63',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timerReadout: {
    ...retroAccent,
    fontSize: 20,
    color: '#3D5246',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  diaperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  diaperBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
  },
  diaperEmoji: {
    fontSize: 18,
  },
  diaperLabel: {
    ...retroHubTitle,
    fontSize: 11,
    color: '#3D5246',
    marginTop: 2,
  },
  hydrationCount: {
    ...retroPageTitle,
    fontStyle: 'normal',
    fontSize: 30,
    color: '#2A382E',
  },
  hydrationGoal: {
    ...retroSoft,
    fontSize: 13,
    color: '#5C6E63',
  },
  dropRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dropBtn: {
    flex: 1,
    backgroundColor: 'rgba(186, 214, 220, 0.45)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  dropBtnText: {
    ...retroSoft,
    fontSize: 11,
    fontWeight: '700',
    color: '#2A4550',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.35)',
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#6E8578',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  checkBoxOn: {
    backgroundColor: '#4A5C50',
    borderColor: '#4A5C50',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkLabel: {
    ...retroSoft,
    fontSize: 12,
    fontWeight: '600',
    color: '#2A382E',
    flex: 1,
  },
  minutesCount: {
    ...retroAccent,
    fontSize: 14,
    color: '#3D5246',
    marginBottom: 10,
  },
  privacyBanner: {
    ...retroSoft,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    color: '#3D5246',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(163, 83, 56, 0.25)',
    marginBottom: 6,
  },
  timelineCard: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  timelineTitle: {
    ...retroAccent,
    fontSize: 15,
    color: '#2A382E',
    marginBottom: 10,
  },
  timelineEmpty: {
    ...retroSoft,
    fontSize: 12,
    color: '#5C6E63',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.45)',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A35338',
    marginTop: 5,
    marginRight: 10,
  },
  timelineBody: {
    flex: 1,
  },
  timelineType: {
    ...retroSoft,
    fontSize: 12,
    fontWeight: '700',
    color: '#2A382E',
  },
  timelineNotes: {
    ...retroSoft,
    fontSize: 11,
    color: '#5A6E62',
    marginTop: 2,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
