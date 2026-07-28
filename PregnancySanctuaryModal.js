/**
 * Pregnancy Sanctuary — Doula Tips, Birth Plan Templates, Contraction Timer.
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import PremiumGateOverlay from './PremiumGateOverlay';
import { getRotatingDoulaTips } from './pregnancyDoulaTips';

const BIRTH_PLAN_KEY = '@calmmama/birth_plan_v1';

const DEFAULT_BIRTH_PLAN = {
  atmosphere: '',
  supportPeople: '',
  comfortTools: '',
  painPreferences: '',
  afterBirth: '',
  feeding: '',
  notes: '',
};

function formatClock(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ModuleTab({ id, label, active, onPress, locked = false }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={() => onPress(id)}
      activeOpacity={0.88}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {locked ? '🔒 ' : ''}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PremiumModuleGate({ title, body, onUpgrade }) {
  return (
    <View style={styles.premiumGateWrap}>
      <PremiumGateOverlay label="Premium Sanctuary tool" />
      <Text style={styles.premiumGateTitle}>{title}</Text>
      <Text style={styles.premiumGateBody}>{body}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onUpgrade} activeOpacity={0.9}>
        <Text style={styles.primaryBtnText}>Unlock with Village access</Text>
      </TouchableOpacity>
    </View>
  );
}

function DoulaTipsPanel({ weeksPregnant }) {
  const [rotationOffset, setRotationOffset] = useState(0);

  const { trimester, week, weeklyNote, tips, totalAvailable } = useMemo(
    () =>
      getRotatingDoulaTips({
        weeksPregnant,
        rotationOffset,
        count: 4,
      }),
    [weeksPregnant, rotationOffset],
  );

  const showAnotherSet = () => {
    setRotationOffset((prev) => prev + 1);
  };

  return (
    <View>
      <Text style={styles.panelEyebrow}>
        DOULA NOTES · WEEK {week || '—'} · T{trimester}
      </Text>
      <Text style={styles.panelLead}>
        Soft wisdom that rotates daily — tap below anytime for a fresh set so these pages keep
        feeling new.
      </Text>
      <View style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>Today’s doula whisper</Text>
        <Text style={styles.highlightText}>{weeklyNote}</Text>
      </View>
      {tips.map((tip) => (
        <View key={`${tip.id}-${rotationOffset}`} style={styles.tipCard}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipBody}>{tip.body}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.secondaryBtn} onPress={showAnotherSet} activeOpacity={0.9}>
        <Text style={styles.secondaryBtnText}>
          Show another set · {totalAvailable} tips in your trimester library
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function BirthPlanPanel() {
  const [plan, setPlan] = useState(DEFAULT_BIRTH_PLAN);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BIRTH_PLAN_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw);
          setPlan({ ...DEFAULT_BIRTH_PLAN, ...parsed });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key, value) => setPlan((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    try {
      await AsyncStorage.setItem(BIRTH_PLAN_KEY, JSON.stringify(plan));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const fields = [
    { key: 'atmosphere', label: 'Atmosphere', placeholder: 'Dim lights, soft playlist, quiet voices…' },
    { key: 'supportPeople', label: 'Support people', placeholder: 'Who do you want present / on call?' },
    { key: 'comfortTools', label: 'Comfort tools', placeholder: 'Birth ball, shower, counter-pressure…' },
    { key: 'painPreferences', label: 'Pain preferences', placeholder: 'What to offer first / preferences to avoid…' },
    { key: 'afterBirth', label: 'Golden hour', placeholder: 'Skin-to-skin, delayed cord clamping…' },
    { key: 'feeding', label: 'Feeding intentions', placeholder: 'Breast, bottle, combo, lactation support…' },
    { key: 'notes', label: 'Anything else', placeholder: 'Allergies, cultural wishes, soft boundaries…' },
  ];

  return (
    <View>
      <Text style={styles.panelEyebrow}>BIRTH PLAN TEMPLATE</Text>
      <Text style={styles.panelLead}>
        Preferences, not rules — customize gently. Your care team can adapt in the moment.
      </Text>
      {fields.map((field) => (
        <View key={field.key} style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={plan[field.key]}
            onChangeText={(v) => update(field.key, v)}
            placeholder={field.placeholder}
            placeholderTextColor="rgba(90,110,88,0.45)"
            multiline
          />
        </View>
      ))}
      <TouchableOpacity style={styles.primaryBtn} onPress={save} activeOpacity={0.9}>
        <Text style={styles.primaryBtnText}>{savedFlash ? 'Saved ✓' : 'Save birth plan'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ContractionTimerPanel() {
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [contractions, setContractions] = useState([]);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!running || !startedAt) return undefined;
    tickRef.current = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 250);
    return () => clearInterval(tickRef.current);
  }, [running, startedAt]);

  const start = () => {
    const now = Date.now();
    setStartedAt(now);
    setElapsed(0);
    setRunning(true);
  };

  const stop = () => {
    if (!startedAt) return;
    const endedAt = Date.now();
    const durationMs = endedAt - startedAt;
    setRunning(false);
    setContractions((prev) => {
      const last = prev[0];
      const frequencyMs = last ? endedAt - last.endedAt : null;
      return [
        {
          id: `${endedAt}`,
          startedAt,
          endedAt,
          durationMs,
          frequencyMs,
        },
        ...prev,
      ].slice(0, 40);
    });
    setStartedAt(null);
    setElapsed(0);
  };

  const clearLog = () => setContractions([]);

  const avgDuration = useMemo(() => {
    if (!contractions.length) return null;
    const sum = contractions.reduce((acc, c) => acc + c.durationMs, 0);
    return sum / contractions.length;
  }, [contractions]);

  return (
    <View>
      <Text style={styles.panelEyebrow}>CONTRACTION TIMER</Text>
      <Text style={styles.panelLead}>
        Tap Start at the beginning of a contraction, Stop when it eases. Frequency is time from end to end.
      </Text>
      <View style={styles.timerFace}>
        <Text style={styles.timerDigits}>{formatClock(elapsed)}</Text>
        <Text style={styles.timerStatus}>{running ? 'Contraction in progress' : 'Ready'}</Text>
      </View>
      <View style={styles.timerActions}>
        {!running ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={start} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, styles.stopBtn]} onPress={stop} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ghostBtn} onPress={clearLog} activeOpacity={0.88}>
          <Text style={styles.ghostBtnText}>Clear log</Text>
        </TouchableOpacity>
      </View>
      {avgDuration != null ? (
        <Text style={styles.avgLine}>Avg duration · {formatClock(avgDuration)}</Text>
      ) : null}
      {contractions.length === 0 ? (
        <Text style={styles.emptyLog}>No contractions logged yet.</Text>
      ) : (
        contractions.map((c, index) => (
          <View key={c.id} style={styles.logRow}>
            <Text style={styles.logIndex}>#{contractions.length - index}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.logMain}>Duration {formatClock(c.durationMs)}</Text>
              <Text style={styles.logSub}>
                {c.frequencyMs != null
                  ? `Frequency from previous end · ${formatClock(c.frequencyMs)}`
                  : 'First in this session'}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function PregnancySanctuaryModal({
  visible,
  onClose,
  weeksPregnant,
  isPro = false,
  isSubscribed = false,
  onRequestUpgrade,
}) {
  const [module, setModule] = useState('doula');
  const hasPremium = Boolean(isPro || isSubscribed);

  useEffect(() => {
    if (visible) setModule('doula');
  }, [visible]);

  const close = useCallback(() => onClose?.(), [onClose]);

  const selectModule = useCallback(
    (next) => {
      if ((next === 'plan' || next === 'timer') && !hasPremium) {
        onRequestUpgrade?.();
        return;
      }
      setModule(next);
    },
    [hasPremium, onRequestUpgrade],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation?.()}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetEyebrow}>PREGNANT MAMA</Text>
              <Text style={styles.sheetTitle}>Pregnancy Sanctuary</Text>
            </View>
            <TouchableOpacity onPress={close} hitSlop={12}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <ModuleTab id="doula" label="Doula Tips" active={module === 'doula'} onPress={selectModule} />
            <ModuleTab
              id="plan"
              label="Birth Plan"
              active={module === 'plan'}
              onPress={selectModule}
              locked={!hasPremium}
            />
            <ModuleTab
              id="timer"
              label="Timer"
              active={module === 'timer'}
              onPress={selectModule}
              locked={!hasPremium}
            />
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {module === 'doula' ? <DoulaTipsPanel weeksPregnant={weeksPregnant} /> : null}
            {module === 'plan' && !hasPremium ? (
              <PremiumModuleGate
                title="Birth plan templates"
                body="Draft atmosphere, support people, comfort tools, and golden-hour preferences — saved privately on your device."
                onUpgrade={onRequestUpgrade}
              />
            ) : null}
            {module === 'plan' && hasPremium ? <BirthPlanPanel /> : null}
            {module === 'timer' && !hasPremium ? (
              <PremiumModuleGate
                title="Contraction timer"
                body="Track duration and frequency during early labor — a calm companion when waves begin."
                onUpgrade={onRequestUpgrade}
              />
            ) : null}
            {module === 'timer' && hasPremium ? <ContractionTimerPanel /> : null}
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
}

export default memo(PregnancySanctuaryModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 56, 46, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: Platform.OS === 'web' ? '92%' : '90%',
    backgroundColor: '#F3F7F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    zIndex: 2,
    width: '100%',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sheetEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#6B8F78',
  },
  sheetTitle: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '700',
    color: '#2A382E',
  },
  closeX: {
    fontSize: 20,
    color: '#5A6E58',
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(107,143,120,0.25)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(143, 179, 154, 0.55)',
    borderColor: '#6B8F78',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6E58',
  },
  tabTextActive: {
    color: '#2A382E',
  },
  body: {
    paddingHorizontal: 16,
  },
  bodyContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  panelEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#6B8F78',
    marginBottom: 8,
  },
  panelLead: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6E58',
    marginBottom: 14,
  },
  highlightCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(143,179,154,0.45)',
    marginBottom: 12,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#6B8F78',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  highlightText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2A382E',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A382E',
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6E58',
  },
  secondaryBtn: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107,143,120,0.35)',
    backgroundColor: 'rgba(255,252,248,0.55)',
  },
  secondaryBtnText: {
    color: '#3D5246',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  fieldBlock: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D5246',
    marginBottom: 6,
  },
  input: {
    minHeight: 64,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(107,143,120,0.28)',
    color: '#2A382E',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#6B8F78',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#A67C6D',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  ghostBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: '#5A6E58',
    fontWeight: '700',
    fontSize: 14,
  },
  timerFace: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(143,179,154,0.4)',
  },
  timerDigits: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2A382E',
    fontVariant: ['tabular-nums'],
  },
  timerStatus: {
    marginTop: 4,
    fontSize: 13,
    color: '#5A6E58',
    fontWeight: '600',
  },
  timerActions: {
    marginBottom: 12,
  },
  avgLine: {
    textAlign: 'center',
    fontSize: 13,
    color: '#3D5246',
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyLog: {
    textAlign: 'center',
    color: '#7A8A7E',
    fontSize: 13,
    marginTop: 8,
  },
  logRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(90,110,88,0.2)',
  },
  logIndex: {
    fontWeight: '800',
    color: '#6B8F78',
    width: 28,
    marginTop: 2,
  },
  logMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A382E',
  },
  logSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#5A6E58',
  },
  premiumGateWrap: {
    position: 'relative',
    minHeight: 220,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(143,179,154,0.35)',
  },
  premiumGateTitle: {
    marginTop: 48,
    fontSize: 18,
    fontWeight: '700',
    color: '#2A382E',
    textAlign: 'center',
  },
  premiumGateBody: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6E58',
    textAlign: 'center',
  },
});
