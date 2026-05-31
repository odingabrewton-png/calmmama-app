import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import {
  SANCTUARY_MOODS,
  CLOUD_IMAGES,
  getFriendOpeningLine,
  getFriendFollowUp,
  getDerivedAssistance,
} from './soulSanctuaryData';
import { useVillageReveal } from './villageScreenTransitions';
import SanctuaryStarsLayer from './SanctuaryStarsLayer';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const CLOUD_LAYOUT = [
  { top: 16, left: 0, width: 128, height: 76 },
  { top: 88, right: 0, width: 124, height: 74 },
  { top: 178, left: 28, width: 130, height: 78 },
  { top: 36, left: 102, width: 118, height: 70 },
  { top: 248, right: 4, width: 122, height: 72 },
];

let messageId = 0;
const nextId = () => {
  messageId += 1;
  return messageId;
};

export default function SoulSanctuaryScreen({
  mamaName = 'Mama',
  onExit,
  journalLogs = [],
  onSaveJournalEntry,
}) {
  const [phase, setPhase] = useState('clouds');
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [assistancePopup, setAssistancePopup] = useState(null);

  const othersFade = useRef(new Animated.Value(1)).current;
  const panelSlide = useRef(new Animated.Value(0)).current;
  const chatReveal = useRef(new Animated.Value(0)).current;
  const chatDrawerSlide = useRef(new Animated.Value(0)).current;
  const popupAnim = useRef(new Animated.Value(0)).current;
  const cloudDrifts = useRef(SANCTUARY_MOODS.map(() => new Animated.Value(0))).current;
  const cloudScales = useRef(SANCTUARY_MOODS.map(() => new Animated.Value(1))).current;
  const cloudFloats = useRef(SANCTUARY_MOODS.map(() => new Animated.Value(0))).current;
  const screenReveal = useVillageReveal(true);

  useEffect(() => {
    const floatLoops = cloudFloats.map((anim, index) => {
      const duration = 4800 + index * 520;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 280),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );
    });
    floatLoops.forEach((loop) => loop.start());
    return () => floatLoops.forEach((loop) => loop.stop());
  }, [cloudFloats]);

  const resetSanctuary = () => {
    setPhase('clouds');
    setSelectedMood(null);
    setSelectedIndex(null);
    setJournalText('');
    setChatInput('');
    setMessages([]);
    setAssistancePopup(null);
    popupAnim.setValue(0);
    othersFade.setValue(1);
    panelSlide.setValue(0);
    chatReveal.setValue(0);
    chatDrawerSlide.setValue(0);
    cloudDrifts.forEach((d) => d.setValue(0));
    cloudScales.forEach((s) => s.setValue(1));
  };

  const handleMoodSelect = (mood, index) => {
    if (phase !== 'clouds') return;
    setSelectedMood(mood);
    setSelectedIndex(index);
    setMessages([{ id: nextId(), role: 'friend', text: getFriendOpeningLine(mood.id) }]);
    setPhase('journal');
    panelSlide.setValue(0);
    chatReveal.setValue(0);
    chatDrawerSlide.setValue(0);

    Animated.parallel([
      Animated.timing(cloudScales[index], {
        toValue: 1.08,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(cloudDrifts[index], {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(othersFade, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(panelSlide, {
        toValue: 1,
        duration: 680,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(520),
      Animated.parallel([
        Animated.spring(chatDrawerSlide, {
          toValue: 1,
          friction: 9,
          tension: 52,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(chatReveal, {
          toValue: 1,
          duration: 640,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ]).start();
  };

  const sendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed || !selectedMood) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: trimmed },
      { id: nextId(), role: 'friend', text: getFriendFollowUp(selectedMood.id, mamaName) },
    ]);
    setChatInput('');
  };

  const handleShare = () => {
    if (!selectedMood) return;
    const trimmed = journalText.trim();
    if (!trimmed) return;

    const assistance = getDerivedAssistance(selectedMood.id, trimmed);
    const entry = {
      id: Date.now(),
      moodId: selectedMood.id,
      moodLabel: selectedMood.label,
      derivedMood: assistance.derivedMood,
      text: trimmed,
      messages: [...messages],
      timestamp: new Date().toISOString(),
    };

    onSaveJournalEntry?.(entry);
    setAssistancePopup(assistance);

    popupAnim.setValue(0);
    Animated.spring(popupAnim, {
      toValue: 1,
      friction: 7,
      tension: 48,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const dismissPopup = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => setAssistancePopup(null));
  };

  const panelOpacity = panelSlide;
  const panelTranslateY = panelSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
  });
  const chatOpacity = chatReveal.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.55, 1],
  });
  const chatTranslateY = chatDrawerSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [160, 0],
  });
  const popupScale = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenReveal.opacity, transform: screenReveal.transform }]}>
      <SanctuaryStarsLayer />

      <TouchableOpacity style={styles.backBtn} onPress={onExit}>
        <Text style={styles.backBtnText}>← Sanctuary Home</Text>
      </TouchableOpacity>

      <Text style={styles.retroTitle}>The Soul Sanctuary</Text>
      <Text style={styles.pageSubtitle}>How is your heart, mama?</Text>

      <View style={styles.stage}>
        <View
          style={styles.cloudCluster}
          pointerEvents={phase === 'clouds' ? 'auto' : 'none'}
        >
          {SANCTUARY_MOODS.map((mood, index) => {
              const layout = CLOUD_LAYOUT[index];
              const isSelected = selectedIndex === index;
              const floatY = cloudFloats[index].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [-18, 0, 18],
              });
              const driftY = cloudDrifts[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, -340],
              });
              const driftX = cloudDrifts[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 56],
              });
              const driftOpacity = cloudDrifts[index].interpolate({
                inputRange: [0, 0.65, 1],
                outputRange: [1, 0.75, 0],
              });
              const cloudOpacity =
                selectedIndex === null ? 1 : isSelected ? driftOpacity : othersFade;

              return (
                <Animated.View
                  key={mood.id}
                  style={[
                    styles.cloudWrap,
                    {
                      top: layout.top,
                      left: layout.left,
                      right: layout.right,
                      width: layout.width,
                      height: layout.height,
                    },
                    {
                      opacity: cloudOpacity,
                      transform: [
                        { translateY: Animated.add(floatY, driftY) },
                        { translateX: driftX },
                        { scale: cloudScales[index] },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleMoodSelect(mood, index)}
                    style={styles.cloudTouchable}
                  >
                    <Image
                      source={CLOUD_IMAGES[mood.cloudKey]}
                      style={[
                        styles.cloudImage,
                        { width: layout.width, height: Math.round(layout.height * 0.78) },
                      ]}
                      resizeMode="contain"
                    />
                    <Text style={styles.cloudLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
        </View>

        {selectedMood && (
          <Animated.View
            style={[
              styles.hybridPanel,
              { opacity: panelOpacity, transform: [{ translateY: panelTranslateY }] },
            ]}
          >
            <View style={styles.diarySection}>
              <Text style={styles.diaryTitle}>Mama's Heartfelt Words</Text>
              <TextInput
                style={styles.diaryInput}
                placeholder="Pour every thought here, love…"
                placeholderTextColor="rgba(220, 210, 235, 0.55)"
                multiline
                scrollEnabled
                textAlignVertical="top"
                value={journalText}
                onChangeText={setJournalText}
              />
            </View>

            <Animated.View
              style={[
                styles.chatDrawer,
                {
                  opacity: chatOpacity,
                  transform: [{ translateY: chatTranslateY }],
                },
              ]}
            >
              <View style={styles.chatSection}>
              <Text style={styles.chatTitle}>Your village companion</Text>
              <ScrollView
                style={styles.chatLog}
                contentContainerStyle={styles.chatLogContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubble,
                      msg.role === 'user' ? styles.userBubble : styles.friendBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.role === 'user' ? styles.userBubbleText : styles.friendBubbleText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Talk to your friend…"
                  placeholderTextColor="rgba(200, 190, 220, 0.6)"
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={sendChat}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendChat}>
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
              </View>
            </Animated.View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share with your village friend</Text>
            </TouchableOpacity>

            {journalLogs.length > 0 && (
              <View style={styles.logsSection}>
                <Text style={styles.logsTitle}>Chronological soul entries</Text>
                {journalLogs.slice(-3).reverse().map((log) => (
                  <View key={log.id} style={styles.logRow}>
                    <Text style={styles.logMeta}>
                      {log.moodLabel} · {new Date(log.timestamp).toLocaleDateString()}
                    </Text>
                    <Text style={styles.logSnippet} numberOfLines={2}>
                      {log.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.resetLink} onPress={resetSanctuary}>
              <Text style={styles.resetLinkText}>Choose a different mood cloud →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.privacyBanner}>
        <Text style={styles.privacyIcon}>🛡️</Text>
        <View style={styles.privacyCopy}>
          <Text style={styles.privacyTitle}>Private & Secured</Text>
          <Text style={styles.privacyBody}>
            End-to-End On-Device Encryption Active. Your personal thoughts remain yours alone.
          </Text>
        </View>
      </View>

      <Modal visible={!!assistancePopup} transparent animationType="fade" onRequestClose={dismissPopup}>
        <View style={styles.popupOverlay}>
          <TouchableOpacity style={styles.popupScrim} activeOpacity={1} onPress={dismissPopup} />
          {assistancePopup && (
            <Animated.View
              style={[styles.popupCard, { opacity: popupAnim, transform: [{ scale: popupScale }] }]}
            >
              <Text style={styles.popupEyebrow}>Kind affirmation for you</Text>
              <Text style={styles.popupAffirmation}>{assistancePopup.affirmation}</Text>
              <Text style={styles.popupTipLabel}>Derived village tip</Text>
              <Text style={styles.popupTip}>{assistancePopup.tip}</Text>
              <TouchableOpacity style={styles.popupBtn} onPress={dismissPopup}>
                <Text style={styles.popupBtnText}>Hold this warmth close</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    position: 'relative',
    overflow: 'visible',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: 38,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backBtnText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    fontStyle: 'italic',
  },
  retroTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FFF5FA',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginTop: 0,
    marginBottom: 8,
    textShadowColor: 'rgba(233, 168, 137, 0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", "Book Antiqua", serif' },
    }),
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(248, 244, 255, 0.88)',
    textAlign: 'center',
    marginBottom: 14,
    fontStyle: 'italic',
    letterSpacing: 0.3,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  stage: {
    minHeight: 380,
    position: 'relative',
    overflow: 'visible',
    zIndex: 1,
  },
  cloudCluster: {
    height: 360,
    position: 'relative',
    marginBottom: 10,
    overflow: 'visible',
    zIndex: 2,
  },
  cloudWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  cloudTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cloudLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#F8F4FF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hybridPanel: {
    marginTop: 4,
    zIndex: 2,
  },
  diarySection: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      web: { backdropFilter: 'blur(14px)' },
    }),
  },
  diaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8F4FF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 14,
    paddingBottom: 4,
  },
  diaryInput: {
    minHeight: 140,
    maxHeight: 200,
    fontSize: 14,
    lineHeight: 21,
    color: '#FFF9FC',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  chatDrawer: {
    marginBottom: 12,
  },
  chatSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 12,
    marginBottom: 12,
    ...Platform.select({
      web: { backdropFilter: 'blur(10px)' },
    }),
  },
  chatTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 8,
    textAlign: 'center',
  },
  chatLog: {
    maxHeight: 150,
    marginBottom: 10,
  },
  chatLogContent: {
    paddingBottom: 4,
  },
  bubble: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    maxWidth: '92%',
  },
  friendBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(233, 168, 137, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.55)',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  friendBubbleText: {
    color: '#FFF5F8',
  },
  userBubbleText: {
    color: '#F8F4FF',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#F8F4FF',
    fontStyle: 'italic',
  },
  sendBtn: {
    backgroundColor: 'rgba(233, 168, 137, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: 'rgba(140, 119, 71, 0.9)',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  logsSection: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  logRow: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logMeta: {
    fontSize: 10,
    color: 'rgba(233, 184, 212, 0.9)',
    marginBottom: 2,
  },
  logSnippet: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  resetLink: {
    marginBottom: 12,
    alignItems: 'center',
  },
  resetLinkText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  privacyIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  privacyCopy: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8F4FF',
    letterSpacing: 0.3,
  },
  privacyBody: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 3,
    fontStyle: 'italic',
  },
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  popupScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 11, 31, 0.72)',
  },
  popupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.45)',
    zIndex: 2,
  },
  popupEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8C7747',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  popupAffirmation: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3d4a42',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  popupTipLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6b7d72',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  popupTip: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5a6e62',
    marginTop: 4,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  popupBtn: {
    backgroundColor: '#8C7747',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  popupBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
