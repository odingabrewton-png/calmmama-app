import React, { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CALM_SERIF } from './calmLoungeTheme';
import { ORACLE_BACKGROUND_SOURCE, preloadOracleBackground } from './oracleBackgroundAsset';
import {
  askBabyOracle,
  BABY_ORACLE_QUICK_TIPS,
  babyOracleUsesGemini,
  getQuickTipBlueprint,
} from './babyOracleChatEngine';

const INK = '#1F1A19';
const GLASS_FILL = 'rgba(255, 255, 255, 0.58)';
const GLASS_SURFACE = 'rgba(255, 255, 255, 0.76)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.52)';

const OPENING_COPY =
  'You made it to the quiet hours, Mama. Tap a quick tip below or type your question — I will meet you with gentle, step-by-step guidance.';

let msgId = 0;
const nextMsgId = () => {
  msgId += 1;
  return msgId;
};

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const titleType = [CALM_SERIF, { color: INK, fontWeight: '700' }];
const subheaderType = [CALM_SERIF, { color: INK, fontWeight: '600' }];
const bodyType = [CALM_SERIF, { color: INK, fontWeight: '600' }];
const labelType = [SANS, { color: INK, fontWeight: '700' }];

const SanctuaryBackdrop = memo(function SanctuaryBackdrop({ children, style }) {
  useEffect(() => {
    preloadOracleBackground();
  }, []);

  return (
    <ImageBackground
      source={ORACLE_BACKGROUND_SOURCE}
      style={[styles.sanctuaryCanvas, style]}
      imageStyle={styles.sanctuaryImage}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
});

const ChatPassage = memo(
  function ChatPassage({ entry }) {
    if (entry.role === 'thinking') {
      return (
        <View style={[styles.guideBubble, styles.thinkingBubble]}>
          <ActivityIndicator size="small" color={INK} />
          <Text style={[styles.thinkingText, subheaderType]}>Thinking with you...</Text>
        </View>
      );
    }

    if (entry.role === 'mama') {
      return (
        <View style={styles.mamaBubble}>
          <Text style={[styles.mamaBubbleLabel, labelType]}>You</Text>
          <Text style={[styles.mamaBubbleBody, subheaderType]}>{entry.body}</Text>
        </View>
      );
    }

    return (
      <View style={styles.guideBubble}>
        <Text style={[styles.guideBubbleTitle, titleType]}>{entry.title}</Text>
        <Text style={[styles.guideBubbleBody, subheaderType]}>{entry.body}</Text>
        {entry.signs?.length ? (
          <View style={styles.signsBlock}>
            <Text style={[styles.signsEyebrow, labelType]}>Signs to look for</Text>
            {entry.signs.map((sign, idx) => (
              <View key={`${entry.id}-sign-${idx}`} style={styles.signRow}>
                <Text style={[styles.signDot, subheaderType]}>·</Text>
                <Text style={[styles.signText, subheaderType]}>{sign}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {entry.steps?.map((step, idx) => (
          <View key={`${entry.id}-step-${idx}`} style={styles.stepRow}>
            <Text style={[styles.stepNum, labelType]}>{idx + 1}</Text>
            <Text style={[styles.stepText, bodyType]}>{step}</Text>
          </View>
        ))}
      </View>
    );
  },
  (prev, next) =>
    prev.entry.id === next.entry.id &&
    prev.entry.body === next.entry.body &&
    prev.entry.role === next.entry.role,
);

const FussyBabyChatBox = memo(function FussyBabyChatBox() {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [entries, setEntries] = useState(() => [
    {
      id: nextMsgId(),
      role: 'guide',
      title: 'Your Calm Mama sanctuary guide',
      body: OPENING_COPY,
      signs: [],
      steps: [],
    },
  ]);
  const scrollRef = useRef(null);
  const usesGemini = babyOracleUsesGemini();

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const deliverGuideReply = useCallback(
    async (question, historySnapshot) => {
      const thinkingId = nextMsgId();
      setEntries((prev) => [...prev, { id: thinkingId, role: 'thinking' }]);
      scrollToEnd();

      try {
        const blueprint = await askBabyOracle(question, historySnapshot);
        setEntries((prev) => [
          ...prev.filter((entry) => entry.id !== thinkingId),
          {
            id: nextMsgId(),
            role: 'guide',
            title: blueprint.title,
            body: blueprint.body,
            signs: blueprint.signs || [],
            steps: blueprint.steps || [],
          },
        ]);
      } catch {
        setEntries((prev) => [
          ...prev.filter((entry) => entry.id !== thinkingId),
          {
            id: nextMsgId(),
            role: 'guide',
            title: 'I am still here with you',
            body: 'Something interrupted my reply — please try again in a moment, or tap a quick tip above.',
            signs: [],
            steps: [],
          },
        ]);
      } finally {
        setIsThinking(false);
        scrollToEnd();
      }
    },
    [scrollToEnd],
  );

  const handleAsk = useCallback(
    async (question) => {
      const text = String(question || '').trim();
      if (!text || isThinking) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const mamaEntry = { id: nextMsgId(), role: 'mama', body: text };
      const historySnapshot = [...entries, mamaEntry];
      setEntries((prev) => [...prev, mamaEntry]);
      setInput('');
      setIsThinking(true);
      scrollToEnd();
      await deliverGuideReply(text, historySnapshot);
    },
    [deliverGuideReply, entries, isThinking, scrollToEnd],
  );

  const handleSend = useCallback(() => {
    handleAsk(input);
  }, [handleAsk, input]);

  const handleQuickTip = useCallback(
    (tip) => {
      if (isThinking) return;
      const blueprint = getQuickTipBlueprint(tip.id);
      if (!blueprint) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const mamaEntry = { id: nextMsgId(), role: 'mama', body: tip.prompt };
      setEntries((prev) => [
        ...prev,
        mamaEntry,
        {
          id: nextMsgId(),
          role: 'guide',
          title: blueprint.title,
          body: blueprint.body,
          signs: blueprint.signs || [],
          steps: blueprint.steps || [],
        },
      ]);
      scrollToEnd();
    },
    [isThinking, scrollToEnd],
  );

  const chatEntries = useMemo(() => entries, [entries]);

  return (
    <>
      <Text style={[styles.chatEyebrow, labelType]}>💬 Fussy Baby Support</Text>
      <Text style={[styles.chatHint, subheaderType]}>
        Tap a quick tip or type any question — {usesGemini ? 'your oracle answers with live AI guidance' : 'your oracle answers with gentle midnight care steps'}.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickTipsRow}
        style={styles.quickTipsScroll}
      >
        {BABY_ORACLE_QUICK_TIPS.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            style={[styles.quickTipChip, isThinking && styles.quickTipChipDisabled]}
            onPress={() => handleQuickTip(tip)}
            disabled={isThinking}
            activeOpacity={0.88}
          >
            <Text style={[styles.quickTipEmoji, subheaderType]}>{tip.emoji}</Text>
            <Text style={[styles.quickTipLabel, labelType]}>{tip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {chatEntries.map((entry) => (
          <ChatPassage key={entry.id} entry={entry} />
        ))}
      </ScrollView>

      <TextInput
        style={[styles.chatInput, bodyType]}
        value={input}
        onChangeText={setInput}
        placeholder="Ask anything about baby tonight..."
        placeholderTextColor="rgba(31, 26, 25, 0.5)"
        multiline
        maxLength={500}
        editable={!isThinking}
        textAlignVertical="top"
        {...Platform.select({ web: { outlineStyle: 'none' }, default: {} })}
      />
      <TouchableOpacity
        style={[styles.sendBtn, (!input.trim() || isThinking) && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!input.trim() || isThinking}
        activeOpacity={0.88}
      >
        <Text style={[styles.sendBtnText, labelType]}>
          {isThinking ? 'Thinking...' : 'Send comfort'}
        </Text>
      </TouchableOpacity>
    </>
  );
});

const BabyOracleCard = memo(function BabyOracleCard() {
  return (
    <SanctuaryBackdrop style={styles.oracleRoot}>
      <View style={styles.oracleCard}>
        <Text style={[styles.oracleTitle, titleType]}>🌙 The 2 AM Baby Oracle</Text>
        <Text style={[styles.oracleSubtitle, subheaderType]}>
          A soft-lit sanctuary for postpartum mamas — comforting guidance, not emergency care.
        </Text>
        <FussyBabyChatBox />
      </View>
    </SanctuaryBackdrop>
  );
});

export default BabyOracleCard;

const styles = StyleSheet.create({
  sanctuaryCanvas: {
    minHeight: 560,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sanctuaryImage: {
    borderRadius: 24,
  },
  oracleRoot: {
    flex: 1,
    width: '100%',
    minHeight: 560,
  },
  oracleCard: {
    flex: 1,
    margin: 8,
    padding: 24,
    backgroundColor: GLASS_FILL,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    gap: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      },
      default: {},
    }),
  },
  oracleTitle: {
    fontSize: 22,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  oracleSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  chatEyebrow: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  chatHint: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  quickTipsScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  quickTipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  quickTipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: GLASS_SURFACE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  quickTipChipDisabled: {
    opacity: 0.55,
  },
  quickTipEmoji: {
    fontSize: 14,
  },
  quickTipLabel: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  chatScroll: {
    maxHeight: 300,
    borderRadius: 24,
    backgroundColor: GLASS_SURFACE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  chatScrollContent: {
    padding: 14,
    gap: 12,
  },
  mamaBubble: {
    alignSelf: 'flex-end',
    maxWidth: '88%',
    backgroundColor: GLASS_SURFACE,
    borderRadius: 24,
    borderTopRightRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  mamaBubbleLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  mamaBubbleBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  guideBubble: {
    alignSelf: 'flex-start',
    maxWidth: '96%',
    backgroundColor: GLASS_SURFACE,
    borderRadius: 24,
    borderTopLeftRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thinkingText: {
    fontSize: 14,
    lineHeight: 21,
  },
  guideBubbleTitle: {
    fontSize: 15,
    marginBottom: 6,
  },
  guideBubbleBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  signsBlock: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 24,
    backgroundColor: GLASS_FILL,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  signsEyebrow: {
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  signRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  signDot: {
    width: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  signText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNum: {
    width: 20,
    fontSize: 13,
    lineHeight: 21,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
  },
  chatInput: {
    minHeight: 72,
    maxHeight: 120,
    backgroundColor: GLASS_SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 21,
  },
  sendBtn: {
    alignSelf: 'flex-end',
    height: 50,
    paddingHorizontal: 22,
    backgroundColor: GLASS_SURFACE,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
