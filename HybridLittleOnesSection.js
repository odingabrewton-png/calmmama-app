/**
 * Hybrid mama — name & age for little ones under 5 (supports multiple children).
 */

import React, { memo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createChildEntry } from './mamaJourneyProfile';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

export const MAX_HYBRID_CHILDREN = 5;

const AGE_OPTIONS = [
  'Newborn',
  '0-3 months',
  '3-6 months',
  '6-12 months',
  '12-24 months',
  '2-3 years',
  '3-4 years',
  '4-5 years',
];

function HybridLittleOnesSection({
  littleOnes = [],
  onChildrenChange,
  variant = 'midnight',
}) {
  const isDaily = variant === 'daily';

  const updateChild = (childId, patch) => {
    onChildrenChange?.(
      littleOnes.map((child) => (child.id === childId ? { ...child, ...patch } : child)),
    );
  };

  const addChild = () => {
    if (littleOnes.length >= MAX_HYBRID_CHILDREN) return;
    onChildrenChange?.([...littleOnes, createChildEntry({ ageLabel: '12-24 months', name: '' })]);
  };

  const removeChild = (childId) => {
    if (littleOnes.length <= 1) return;
    onChildrenChange?.(littleOnes.filter((child) => child.id !== childId));
  };

  const list =
    littleOnes.length > 0
      ? littleOnes
      : [createChildEntry({ ageLabel: '12-24 months', name: '' })];

  return (
    <View style={[styles.wrap, isDaily && styles.wrapDaily]}>
      <Text style={[styles.eyebrow, isDaily && styles.eyebrowDaily, SANS]}>
        HYBRID MAMA · LITTLE ONES
      </Text>
      <Text style={[styles.title, isDaily && styles.titleDaily, SANS]}>
        Your children under 5
      </Text>
      <Text style={[styles.hint, isDaily && styles.hintDaily, SANS]}>
        Add each little one&apos;s name so the village can speak to your whole family story.
      </Text>

      {list.map((child, index) => (
        <View key={child.id || `child-${index}`} style={[styles.childCard, isDaily && styles.childCardDaily]}>
          <View style={styles.childHeader}>
            <Text style={[styles.childLabel, isDaily && styles.childLabelDaily, SANS]}>
              Little one {index + 1}
            </Text>
            {list.length > 1 ? (
              <TouchableOpacity onPress={() => removeChild(child.id)} hitSlop={8}>
                <Text style={[styles.removeText, SANS]}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={[styles.fieldLabel, isDaily && styles.fieldLabelDaily, SANS]}>Name</Text>
          <TextInput
            style={[styles.input, isDaily && styles.inputDaily, SANS]}
            value={child.name || ''}
            onChangeText={(name) => updateChild(child.id, { name })}
            placeholder="e.g. Luna"
            placeholderTextColor={isDaily ? '#9AA89A' : 'rgba(232,229,247,0.45)'}
            maxLength={32}
          />

          <Text style={[styles.fieldLabel, isDaily && styles.fieldLabelDaily, SANS]}>Age</Text>
          <View style={styles.ageRow}>
            {AGE_OPTIONS.map((age) => {
              const active = child.ageLabel === age;
              return (
                <TouchableOpacity
                  key={`${child.id}-${age}`}
                  style={[styles.ageChip, active && styles.ageChipActive, isDaily && styles.ageChipDaily]}
                  onPress={() => updateChild(child.id, { ageLabel: age })}
                  activeOpacity={0.88}
                >
                  <Text
                    style={[
                      styles.ageChipText,
                      active && styles.ageChipTextActive,
                      isDaily && styles.ageChipTextDaily,
                      SANS,
                    ]}
                  >
                    {age}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {list.length < MAX_HYBRID_CHILDREN ? (
        <TouchableOpacity
          style={[styles.addBtn, isDaily && styles.addBtnDaily]}
          onPress={addChild}
          activeOpacity={0.88}
        >
          <Text style={[styles.addBtnText, isDaily && styles.addBtnTextDaily, SANS]}>
            + Add another little one
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.maxNote, isDaily && styles.maxNoteDaily, SANS]}>
          Up to {MAX_HYBRID_CHILDREN} little ones saved.
        </Text>
      )}
    </View>
  );
}

export default memo(HybridLittleOnesSection);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 184, 232, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.35)',
  },
  wrapDaily: {
    marginTop: 0,
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#D4B896',
    textAlign: 'center',
    marginBottom: 4,
  },
  eyebrowDaily: {
    color: '#6B8F78',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F0FF',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleDaily: {
    color: '#2A382E',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(232, 229, 247, 0.72)',
    textAlign: 'center',
    marginBottom: 12,
  },
  hintDaily: {
    color: '#5A6E58',
  },
  childCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 34, 50, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.22)',
  },
  childCardDaily: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(107, 143, 120, 0.25)',
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  childLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5F0FF',
  },
  childLabelDaily: {
    color: '#3D5246',
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4A8A8',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(232, 229, 247, 0.8)',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldLabelDaily: {
    color: '#5A6E58',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#F5F0FF',
    marginBottom: 8,
  },
  inputDaily: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(107, 143, 120, 0.28)',
    color: '#2A382E',
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ageChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  ageChipDaily: {
    borderColor: 'rgba(107, 143, 120, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  ageChipActive: {
    backgroundColor: 'rgba(212, 184, 150, 0.85)',
    borderColor: 'rgba(212, 184, 150, 0.95)',
  },
  ageChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(232, 229, 247, 0.75)',
  },
  ageChipTextDaily: {
    color: '#5A6E58',
  },
  ageChipTextActive: {
    color: '#3F3428',
  },
  addBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.45)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  addBtnDaily: {
    borderColor: 'rgba(107, 143, 120, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4B896',
  },
  addBtnTextDaily: {
    color: '#3D5246',
  },
  maxNote: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(232, 229, 247, 0.55)',
  },
  maxNoteDaily: {
    color: '#7A8A7E',
  },
});
