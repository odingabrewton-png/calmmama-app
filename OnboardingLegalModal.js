import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { ONBOARDING_LEGAL_DOCS } from './legalContent';

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

export default function OnboardingLegalModal({ docId, onClose }) {
  if (!docId || !ONBOARDING_LEGAL_DOCS[docId]) return null;

  const { title, body } = ONBOARDING_LEGAL_DOCS[docId];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={[styles.title, SERIF]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.body}>{body}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={styles.dismissText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 56, 46, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '82%',
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.55)',
    padding: 18,
    ...Platform.select({
      web: { boxShadow: '0 18px 48px rgba(74, 64, 56, 0.18)' },
      default: {
        shadowColor: '#4A4038',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#4A4038',
    paddingRight: 12,
  },
  close: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(74, 64, 56, 0.45)',
  },
  scroll: {
    maxHeight: 360,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  body: {
    fontSize: 12,
    lineHeight: 19,
    color: '#4A4038',
    ...Platform.select({
      web: { fontFamily: 'system-ui, -apple-system, sans-serif' },
      default: {},
    }),
  },
  dismissBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C7A68',
  },
});
