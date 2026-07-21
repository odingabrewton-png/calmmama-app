import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import {
  PRIVACY_POLICY_COPY,
  TERMS_OF_SERVICE_EULA_COPY,
  MEDICAL_DISCLAIMER_COPY,
} from './legalContent';

const TABS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms & EULA' },
  { id: 'medical', label: 'Medical' },
];

const TAB_COPY = {
  privacy: PRIVACY_POLICY_COPY,
  terms: TERMS_OF_SERVICE_EULA_COPY,
  medical: MEDICAL_DISCLAIMER_COPY,
};

export default function LegalComplianceModal({ anim, onClose, onDestroyAccount }) {
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <Animated.View style={[styles.overlay, { opacity: anim.opacity }]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.card,
          {
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { translateX: anim.translateX },
              { translateY: anim.translateY },
            ],
          },
        ]}
      >
        <View style={styles.topRow}>
          <Text style={styles.title}>Legal & Safety</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.88}
              >
                <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.bodyText}>{TAB_COPY[activeTab]}</Text>
        </ScrollView>

        {onDestroyAccount ? (
          <TouchableOpacity onPress={onDestroyAccount} activeOpacity={0.85} style={styles.deleteRow}>
            <Text style={styles.deleteText}>Permanently Delete My Account & Wipe Data</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.88}>
          <Text style={styles.dismissText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(10, 9, 16, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    zIndex: 11050,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '86%',
    backgroundColor: '#14121C',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.14)',
    padding: 18,
    ...Platform.select({
      web: { boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)' },
      default: { elevation: 16 },
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E8E5F7',
    flex: 1,
  },
  close: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(232, 229, 247, 0.55)',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.16)',
    backgroundColor: 'rgba(37, 34, 50, 0.65)',
  },
  tabPillActive: {
    backgroundColor: 'rgba(196, 184, 230, 0.28)',
    borderColor: 'rgba(196, 184, 230, 0.45)',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(232, 229, 247, 0.55)',
  },
  tabPillTextActive: {
    color: '#E8E5F7',
  },
  bodyScroll: {
    maxHeight: 360,
  },
  bodyScrollContent: {
    paddingBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(232, 229, 247, 0.88)',
    ...Platform.select({
      web: { fontFamily: 'system-ui, -apple-system, sans-serif' },
      default: {},
    }),
  },
  deleteRow: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E07070',
    textDecorationLine: 'underline',
  },
  dismissBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C4B8E8',
  },
});
