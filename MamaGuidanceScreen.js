import React, { useRef, useState } from 'react';
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
import {
  buildGuidanceReply,
  createVentEntry,
  getGuidanceOpeningMessage,
} from './mamaGuidanceEngine';

let entryId = 0;
const nextId = () => {
  entryId += 1;
  return entryId;
};

function JournalBlock({ entry }) {
  if (entry.role === 'mama') {
    return (
      <View style={styles.mamaBlock}>
        <Text style={styles.mamaLabel}>Your words</Text>
        <Text style={styles.mamaBody}>{entry.body}</Text>
      </View>
    );
  }

  return (
    <View style={styles.responseBlock}>
      <Text style={styles.responseBody}>{entry.body}</Text>
    </View>
  );
}

function MamaGuidanceScreen({
  mamaName = 'Mama',
  onExit,
  guidanceHistory = [],
  onAppendGuidanceHistory,
}) {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState(() => [
    {
      id: nextId(),
      role: 'guide',
      body: getGuidanceOpeningMessage(),
    },
  ]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const releaseThoughts = () => {
    const text = input.trim();
    if (!text) return;

    const mamaEntry = createVentEntry(text);
    const reply = buildGuidanceReply(text, guidanceHistory);

    setEntries((prev) => [
      ...prev,
      { ...mamaEntry, id: nextId() },
      { id: nextId(), role: 'guide', body: reply.body },
    ]);

    onAppendGuidanceHistory?.({
      text,
      markers: reply.markers,
      timestamp: reply.timestamp,
      dateKey: reply.dateKey,
    });

    setInput('');
    inputRef.current?.blur();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const handleDone = () => {
    if (input.trim()) {
      releaseThoughts();
      return;
    }
    inputRef.current?.blur();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onExit} activeOpacity={0.85} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mama&apos;s Guidance</Text>
          <Text style={styles.headerSub}>For you, {mamaName}</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {entries.map((entry) => (
            <JournalBlock key={entry.id} entry={entry} />
          ))}
        </ScrollView>

        <View style={styles.compose}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Write what your heart needs to say…"
            placeholderTextColor="#A89A90"
            multiline
            maxLength={1200}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.releaseBtn}
            onPress={handleDone}
            activeOpacity={0.88}
            accessibilityLabel={input.trim() ? 'Release Thoughts' : 'Done'}
          >
            <Text style={styles.releaseLabel}>
              {input.trim() ? 'Release Thoughts' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const PAPER = '#FAF7F2';
const INK = '#4A4038';
const MUTED = '#7A6E64';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAPER,
  },
  page: {
    flex: 1,
    backgroundColor: PAPER,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 165, 150, 0.25)',
    backgroundColor: PAPER,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: MUTED,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: INK,
    ...Platform.select({
      web: { fontFamily: 'Georgia, serif' },
      default: {},
    }),
  },
  headerSub: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
    backgroundColor: PAPER,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },
  mamaBlock: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 165, 150, 0.2)',
  },
  mamaLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: MUTED,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  mamaBody: {
    fontSize: 17,
    lineHeight: 27,
    color: INK,
    fontStyle: 'italic',
    ...Platform.select({
      web: { fontFamily: 'Georgia, serif' },
      default: {},
    }),
  },
  responseBlock: {
    marginBottom: 28,
  },
  responseBody: {
    fontSize: 16,
    lineHeight: 26,
    color: INK,
    ...Platform.select({
      web: { fontFamily: 'Georgia, serif' },
      default: {},
    }),
  },
  compose: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 18 : 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(180, 165, 150, 0.25)',
    backgroundColor: PAPER,
  },
  input: {
    minHeight: 110,
    maxHeight: 180,
    fontSize: 16,
    lineHeight: 24,
    color: INK,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(180, 165, 150, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  releaseBtn: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#E8DDD4',
    borderWidth: 1,
    borderColor: 'rgba(160, 130, 110, 0.25)',
    alignItems: 'center',
  },
  releaseLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.2,
  },
});

export default React.memo(MamaGuidanceScreen);
