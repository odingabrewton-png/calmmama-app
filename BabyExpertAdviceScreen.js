import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import MamasGuidanceTitleShine from './MamasGuidanceTitleShine';
import { getExpertOpeningMessage, getExpertReply } from './babyExpertAdviceEngine';

let msgId = 0;
const nextId = () => {
  msgId += 1;
  return msgId;
};

const INK = '#4A3E3D';
const ROSE_GOLD = 'rgba(198, 134, 108, 0.62)';

const EDITORIAL_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Book Antiqua", serif' },
  ios: { fontFamily: 'Georgia' },
  android: { fontFamily: 'serif' },
  default: {},
});

const PASTEL_WASH = ['#D4E8F7', '#E8E0F2', '#F5DDD0', '#F8EDE4'];
const PASTEL_OVERLAY = [
  'rgba(212, 232, 247, 0.55)',
  'rgba(232, 224, 242, 0.45)',
  'rgba(245, 221, 208, 0.5)',
];

function AdvicePassage({ entry }) {
  if (entry.role === 'mama') {
    return (
      <View style={styles.mamaPassage}>
        <Text style={[styles.mamaLabel, EDITORIAL_SERIF]}>Your question</Text>
        <Text style={[styles.mamaBody, EDITORIAL_SERIF]}>{entry.body}</Text>
      </View>
    );
  }

  return (
    <View style={styles.guidePassage}>
      <Text style={[styles.guideTitle, EDITORIAL_SERIF]}>{entry.title}</Text>
      <Text style={[styles.guideBody, EDITORIAL_SERIF]}>{entry.body}</Text>
      {entry.steps?.map((step, idx) => (
        <View key={`${entry.id}-s-${idx}`} style={styles.stepRow}>
          <Text style={[styles.stepNum, EDITORIAL_SERIF]}>{idx + 1}</Text>
          <Text style={[styles.stepText, EDITORIAL_SERIF]}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

function BabyExpertAdviceScreen({ mamaName = 'Mama', onExit }) {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState(() => [
    {
      id: nextId(),
      role: 'guide',
      title: "Mama's Guidance",
      body: getExpertOpeningMessage(),
      steps: [],
    },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, [entrance]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
  }));

  const pageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(entrance.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(entrance.value, [0, 1], [0.92, 1]) }],
  }));

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    const reply = getExpertReply(text);
    setEntries((prev) => [
      ...prev,
      { id: nextId(), role: 'mama', body: text },
      { id: nextId(), role: 'guide', title: reply.title, body: reply.body, steps: reply.steps },
    ]);
    setInput('');
    inputRef.current?.blur();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleAction = () => {
    if (input.trim()) submit();
    else inputRef.current?.blur();
  };

  return (
    <View style={styles.canvasRoot}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <LinearGradient
          colors={PASTEL_WASH}
          locations={[0, 0.32, 0.66, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={PASTEL_OVERLAY}
          locations={[0, 0.48, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255, 252, 248, 0.42)', 'transparent', 'rgba(232, 224, 242, 0.35)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.flex, pageStyle]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <View style={styles.page}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onExit} activeOpacity={0.85}>
                <Text style={[styles.back, EDITORIAL_SERIF]}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.titleShineWrap}>
                <MamasGuidanceTitleShine variant="inline" />
              </View>
              <Text style={[styles.sub, EDITORIAL_SERIF]}>
                Expert baby care for {mamaName}
              </Text>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {entries.map((e) => (
                <AdvicePassage key={e.id} entry={e} />
              ))}
            </ScrollView>

            <View style={styles.compose}>
              <View style={styles.inputGlass}>
                <Text style={[styles.inputEyebrow, EDITORIAL_SERIF]}>Ask your village guide</Text>
                <TextInput
                  ref={inputRef}
                  style={[styles.input, EDITORIAL_SERIF]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask about fussiness, sleep, feeding, teething…"
                  placeholderTextColor="rgba(74, 62, 61, 0.45)"
                  multiline
                  maxLength={600}
                  textAlignVertical="top"
                />
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleAction}
                activeOpacity={0.88}
              >
                <Text style={[styles.actionLabel, EDITORIAL_SERIF]}>
                  {input.trim() ? 'Ask Guidance' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

export default React.memo(BabyExpertAdviceScreen);

const styles = StyleSheet.create({
  canvasRoot: {
    flex: 1,
    backgroundColor: '#E8E0F2',
  },
  flex: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  page: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ROSE_GOLD,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  back: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(74, 62, 61, 0.72)',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  titleShineWrap: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 2,
    overflow: 'hidden',
  },
  sub: {
    fontSize: 14,
    color: 'rgba(74, 62, 61, 0.72)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 22, paddingBottom: 32 },
  mamaPassage: {
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ROSE_GOLD,
  },
  mamaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(74, 62, 61, 0.55)',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  mamaBody: {
    fontSize: 17,
    lineHeight: 27,
    color: INK,
    fontStyle: 'italic',
  },
  guidePassage: {
    marginBottom: 28,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(198, 134, 108, 0.28)',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    marginBottom: 10,
  },
  guideBody: {
    fontSize: 15,
    lineHeight: 25,
    color: INK,
    marginBottom: 12,
  },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 232, 247, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 11,
    fontWeight: '800',
    color: INK,
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22, color: INK },
  compose: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 20 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ROSE_GOLD,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  inputGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROSE_GOLD,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 12,
    ...Platform.select({
      web: { backdropFilter: 'blur(12px)' },
    }),
  },
  inputEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(74, 62, 61, 0.5)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 96,
    maxHeight: 150,
    fontSize: 16,
    lineHeight: 25,
    color: INK,
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ROSE_GOLD,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.2,
  },
});
