/**
 * Mama US state picker — organizes Village constellation by state.
 */

import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUsStateByCode, getUsStateLabel, US_STATES } from './usStates';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

export default function MamaStatePicker({
  usState,
  onSelectState,
  label = 'Your state',
  hint = 'Constellation organizes nearby mamas by the state you choose.',
  compact = false,
  tone = 'midnight',
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => getUsStateByCode(usState), [usState]);
  const light = tone === 'light' || tone === 'cosmic';

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, light && styles.wrapLight]}>
      <Text style={[styles.label, light && styles.labelLight, SANS]}>{label}</Text>
      {!compact ? (
        <Text style={[styles.hint, light && styles.hintLight, SANS]}>{hint}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.trigger, light && styles.triggerLight]}
        onPress={() => setOpen(true)}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={`Choose state, currently ${getUsStateLabel(usState)}`}
      >
        <Text style={[styles.triggerText, light && styles.triggerTextLight, SANS]}>
          {selected ? `${selected.name} · ${selected.code}` : 'Choose your state'}
        </Text>
        <Text style={[styles.chevron, light && styles.chevronLight]}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation?.()}>
            <Text style={[styles.sheetTitle, SANS]}>Which state do you live in?</Text>
            <Text style={[styles.sheetHint, SANS]}>
              Your constellation only shows mamas in that state. Exact address stays private.
            </Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {US_STATES.map((state) => {
                const active = selected?.code === state.code;
                return (
                  <TouchableOpacity
                    key={state.code}
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => {
                      onSelectState?.(state.code);
                      setOpen(false);
                    }}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.rowCode, SANS]}>{state.code}</Text>
                    <Text style={[styles.rowName, SANS]}>{state.name}</Text>
                    {active ? <Text style={styles.rowCheck}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)} activeOpacity={0.88}>
              <Text style={[styles.closeBtnText, SANS]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 12,
  },
  wrapCompact: {
    marginBottom: 10,
  },
  wrapLight: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5F0FF',
    marginBottom: 4,
  },
  labelLight: {
    color: '#3D5246',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(232, 229, 247, 0.72)',
    marginBottom: 8,
  },
  hintLight: {
    color: '#5A6E58',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 150, 0.35)',
    backgroundColor: 'rgba(37, 34, 50, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerLight: {
    backgroundColor: 'rgba(255, 252, 248, 0.88)',
    borderColor: 'rgba(107, 143, 120, 0.28)',
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F0FF',
  },
  triggerTextLight: {
    color: '#2A382E',
  },
  chevron: {
    fontSize: 11,
    color: 'rgba(232, 229, 247, 0.7)',
    marginLeft: 8,
  },
  chevronLight: {
    color: '#5A6E58',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 16, 28, 0.55)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    maxHeight: '78%',
    borderRadius: 22,
    backgroundColor: '#FFFCF8',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 99, 190, 0.22)',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A3B5C',
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7D6B91',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    maxHeight: 360,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowActive: {
    backgroundColor: 'rgba(232, 223, 245, 0.85)',
  },
  rowCode: {
    width: 36,
    fontSize: 13,
    fontWeight: '800',
    color: '#8A63BE',
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3B5C',
  },
  rowCheck: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5C7A68',
  },
  closeBtn: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7D6B91',
  },
});
