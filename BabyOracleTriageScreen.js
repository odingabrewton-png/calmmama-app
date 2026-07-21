import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { MIDNIGHT } from './midnightLoungeTheme';
import { ORACLE_TRIAGE_TOPICS, getOracleTopic } from './babyOracleTriageEngine';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

function ConcernPicker({ onSelect }) {
  return (
    <View>
      <Text style={[styles.phaseTitle, SANS]}>What is worrying you right now?</Text>
      <Text style={[styles.phaseSub, SANS]}>
        Choose one focus — we will walk through a calm, step-by-step plan together.
      </Text>
      {ORACLE_TRIAGE_TOPICS.map((topic) => (
        <TouchableOpacity
          key={topic.id}
          style={styles.concernCard}
          onPress={() => onSelect(topic.id)}
          activeOpacity={0.9}
        >
          <Text style={styles.concernEmoji}>{topic.emoji}</Text>
          <Text style={[styles.concernLabel, SANS]}>{topic.label}</Text>
          <Text style={styles.concernChevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StepGuide({ topic, stepIndex, onBack, onNext, onFinish }) {
  const step = topic.steps[stepIndex];
  const isLast = stepIndex >= topic.steps.length - 1;

  return (
    <View>
      <Text style={[styles.topicTitle, SANS]}>{topic.title}</Text>
      {stepIndex === 0 ? (
        <Text style={[styles.topicOpener, SANS]}>{topic.opener}</Text>
      ) : null}

      <View style={styles.stepCard}>
        <Text style={[styles.stepMeta, SANS]}>
          Step {stepIndex + 1} of {topic.steps.length}
        </Text>
        <Text style={[styles.stepBody, SANS]}>{step}</Text>
      </View>

      <View style={styles.stepNavRow}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnGhost]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={[styles.navBtnGhostText, SANS]}>
            {stepIndex === 0 ? 'Change concern' : 'Previous'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={isLast ? onFinish : onNext}
          activeOpacity={0.88}
        >
          <Text style={[styles.navBtnText, SANS]}>{isLast ? 'Finish guide' : 'Next step'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EscalationPanel({ topic, onRestart }) {
  return (
    <View>
      <Text style={[styles.phaseTitle, SANS]}>You made it through the guide</Text>
      <Text style={[styles.phaseSub, SANS]}>
        Breathe, mama. Here is when to reach out for hands-on medical support:
      </Text>
      <View style={styles.escalateCard}>
        <Text style={[styles.escalateBody, SANS]}>{topic.escalate}</Text>
      </View>
      <Text style={[styles.disclaimer, SANS]}>
        This guide supports calm assessment — it does not replace your pediatrician or emergency
        services.
      </Text>
      <TouchableOpacity style={styles.navBtn} onPress={onRestart} activeOpacity={0.88}>
        <Text style={[styles.navBtnText, SANS]}>Start over</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BabyOracleTriageScreen({ onExit }) {
  const [concernId, setConcernId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const topic = concernId ? getOracleTopic(concernId) : null;

  const handleBack = () => {
    if (stepIndex === 0) {
      setConcernId(null);
      setFinished(false);
      return;
    }
    setStepIndex((i) => i - 1);
  };

  const handleRestart = () => {
    setConcernId(null);
    setStepIndex(0);
    setFinished(false);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.backBtn} activeOpacity={0.85}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.topMeta}>
          <Text style={[styles.topTitle, SANS]}>The 2 AM Baby Oracle</Text>
          <Text style={[styles.topSub, SANS]}>Calm triage · not emergency care</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!topic ? (
          <ConcernPicker onSelect={setConcernId} />
        ) : finished ? (
          <EscalationPanel topic={topic} onRestart={handleRestart} />
        ) : (
          <StepGuide
            topic={topic}
            stepIndex={stepIndex}
            onBack={handleBack}
            onNext={() => setStepIndex((i) => i + 1)}
            onFinish={() => setFinished(true)}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MIDNIGHT.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MIDNIGHT.borderSoft,
    backgroundColor: MIDNIGHT.bgElevated,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: MIDNIGHT.lavender,
  },
  topMeta: {
    flex: 1,
    marginLeft: 4,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
  },
  topSub: {
    fontSize: 12,
    color: MIDNIGHT.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    marginBottom: 8,
  },
  phaseSub: {
    fontSize: 14,
    lineHeight: 21,
    color: MIDNIGHT.textSecondary,
    marginBottom: 18,
    fontStyle: 'italic',
  },
  concernCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MIDNIGHT.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  concernEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  concernLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: MIDNIGHT.textPrimary,
  },
  concernChevron: {
    fontSize: 22,
    color: MIDNIGHT.lavenderMuted,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MIDNIGHT.peach,
    marginBottom: 10,
  },
  topicOpener: {
    fontSize: 14,
    lineHeight: 22,
    color: MIDNIGHT.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  stepCard: {
    backgroundColor: MIDNIGHT.lavenderTint,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(196, 188, 230, 0.35)',
    padding: 18,
    marginBottom: 20,
  },
  stepMeta: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: MIDNIGHT.lavenderMuted,
    marginBottom: 10,
  },
  stepBody: {
    fontSize: 16,
    lineHeight: 24,
    color: MIDNIGHT.textPrimary,
  },
  stepNavRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtn: {
    flex: 1,
    backgroundColor: MIDNIGHT.lavender,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A2540',
  },
  navBtnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: MIDNIGHT.border,
  },
  navBtnGhostText: {
    fontSize: 14,
    fontWeight: '700',
    color: MIDNIGHT.textSecondary,
  },
  escalateCard: {
    backgroundColor: MIDNIGHT.peachTint,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 217, 206, 0.35)',
    padding: 16,
    marginBottom: 14,
  },
  escalateBody: {
    fontSize: 15,
    lineHeight: 23,
    color: MIDNIGHT.textPrimary,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    color: MIDNIGHT.textMuted,
    marginBottom: 18,
    fontStyle: 'italic',
  },
});
