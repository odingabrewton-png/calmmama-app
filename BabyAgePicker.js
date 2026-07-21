import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';

export const BABY_AGE_OPTIONS = [
  'Newborn',
  '1-3 Months',
  '4-6 Months',
  '7-9 Months',
  '10-12 Months',
  '1 Year Old',
  '1.5 Years Old',
  '2 Years Old',
  '2.5 Years Old',
  '3 Years Old',
  '4 Years Old',
  '5 Years Old',
];

export default function BabyAgePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const openPicker = () => {
    setDraft(value);
    setOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={openPicker} activeOpacity={0.88}>
        <Text style={styles.triggerText}>{value || 'Select baby age'}</Text>
        <Text style={styles.triggerChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Baby&apos;s current age</Text>
            <Text style={styles.sheetSub}>Scroll and tap to choose a milestone</Text>

            <FlatList
              data={BABY_AGE_OPTIONS}
              keyExtractor={(item) => item}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = draft === item;
                return (
                  <TouchableOpacity
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => setDraft(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={confirm} activeOpacity={0.9}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.35)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A382E',
    flex: 1,
  },
  triggerChevron: {
    fontSize: 14,
    color: '#5C7A68',
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 26, 0.45)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' },
      default: {},
    }),
  },
  sheet: {
    backgroundColor: 'rgba(255, 252, 248, 0.94)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '72%',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -12px 40px rgba(42, 56, 46, 0.18)',
      },
      default: {
        shadowColor: '#2A382E',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 12,
      },
    }),
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(92, 122, 104, 0.28)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A382E',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 13,
    color: '#6A7A68',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    maxHeight: 280,
    marginBottom: 14,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
  },
  optionRowSelected: {
    backgroundColor: 'rgba(92, 122, 104, 0.14)',
    borderColor: 'rgba(92, 122, 104, 0.45)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5A6A62',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#2A382E',
  },
  confirmBtn: {
    backgroundColor: '#5C7A68',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF9F4',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
