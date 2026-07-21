import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';

export default function GoldenHourCapsule({ keepsakes = [], onAddKeepsake }) {
  const [text, setText] = useState('');

  const saveLine = () => {
    const line = text.trim();
    if (!line) return;
    onAddKeepsake?.({ type: 'text', body: line, createdAt: Date.now() });
    setText('');
  };

  const saveQuickAudioNote = () => {
    onAddKeepsake?.({
      type: 'audio-note',
      body: 'Newborn sounds captured ✨',
      createdAt: Date.now(),
    });
  };

  return (
    <View style={styles.chest}>
      <Text style={styles.title}>✨ The Golden Hour Capsule</Text>
      <Text style={styles.sub}>One tap to tuck away a newborn memory — text or a quick sound note.</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.audioBtn} onPress={saveQuickAudioNote} activeOpacity={0.88}>
          <Text style={styles.audioBtnText}>🎙️ Record newborn sounds</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={'e.g. "He locked eyes with me today"'}
        placeholderTextColor="rgba(110, 94, 88, 0.5)"
        multiline
        maxLength={280}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={saveLine} activeOpacity={0.88}>
        <Text style={styles.saveBtnText}>Save to keepsakes chest</Text>
      </TouchableOpacity>

      {keepsakes.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {keepsakes.map((item) => (
            <View key={String(item.id)} style={styles.keepsakeCard}>
              <Text style={styles.keepsakeType}>{item.type === 'audio-note' ? '🎙️' : '💌'}</Text>
              <Text style={styles.keepsakeBody} numberOfLines={3}>
                {item.body}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chest: {
    backgroundColor: 'rgba(255, 248, 240, 0.55)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 196, 160, 0.45)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A4A42',
    marginBottom: 4,
    ...Platform.select({ web: { fontFamily: 'Georgia, serif' }, default: {} }),
  },
  sub: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7A6A62',
    marginBottom: 12,
  },
  actionRow: {
    marginBottom: 10,
  },
  audioBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 180, 160, 0.35)',
  },
  audioBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6A5248',
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 180, 160, 0.35)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#4A3E38',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#C3A995',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: {
    color: '#FFF8F4',
    fontWeight: '700',
    fontSize: 13,
  },
  scroll: {
    marginTop: 4,
  },
  keepsakeCard: {
    width: 140,
    marginRight: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(232, 196, 160, 0.35)',
  },
  keepsakeType: {
    fontSize: 18,
    marginBottom: 4,
  },
  keepsakeBody: {
    fontSize: 11,
    lineHeight: 16,
    color: '#5A4A42',
  },
});
