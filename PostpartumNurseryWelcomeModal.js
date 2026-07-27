/**
 * Celebration modal after pregnant → postpartum transition.
 * Prompts unlocking / switching into the Nursery swipe-scroll checklist.
 */

import React, { memo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CelebrationConfetti from './CelebrationConfetti';

function PostpartumNurseryWelcomeModal({ visible, onExploreNursery, onDismiss }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <CelebrationConfetti active={visible} density="rich" seed={63} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={styles.card}>
          <Text style={styles.sparkle}>☁️ · ✦ · 🌸</Text>
          <Text style={styles.eyebrow}>YOU DID IT</Text>
          <Text style={styles.title}>Welcome to your Nursery</Text>
          <Text style={styles.body}>
            Your Pregnancy chapter softens into postpartum. Unlock the new Nursery swipe cards —
            Postpartum Survival & Daily Checklist — and earn Crown Points with every gentle check.
          </Text>
          <TouchableOpacity style={styles.primary} onPress={onExploreNursery} activeOpacity={0.9}>
            <Text style={styles.primaryText}>Open Nursery experience</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={onDismiss} activeOpacity={0.88}>
            <Text style={styles.secondaryText}>I&apos;ll explore in a moment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default memo(PostpartumNurseryWelcomeModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 56, 46, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F3F7F2',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#2A382E',
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  sparkle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#8FB39A',
    marginBottom: 10,
    letterSpacing: 4,
  },
  eyebrow: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#6B8F78',
  },
  title: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: '#2A382E',
  },
  body: {
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#5A6E58',
  },
  primary: {
    backgroundColor: '#6B8F78',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondary: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#5A6E58',
    fontWeight: '700',
    fontSize: 14,
  },
});
