import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import {
  getBirthdayProfileSummary,
  getDaysInMonth,
  getZodiacSign,
  isValidBirthday,
  MONTH_SHORT,
  normalizeBirthday,
} from './mamaBirthdayUtils';
import { MIDNIGHT } from './midnightLoungeTheme';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const PALETTES = {
  midnight: {
    field: {
      backgroundColor: MIDNIGHT.bgCard,
      borderColor: MIDNIGHT.border,
    },
    eyebrow: { color: MIDNIGHT.lavenderMuted },
    dateText: { color: MIDNIGHT.textPrimary },
    chevron: { color: MIDNIGHT.lavenderMuted },
    pickerBorder: { borderTopColor: MIDNIGHT.border },
    pickerLabel: { color: MIDNIGHT.lavenderMuted },
    chip: {
      backgroundColor: MIDNIGHT.lavenderTint,
      borderColor: MIDNIGHT.border,
      text: { color: MIDNIGHT.textSecondary },
    },
    chipActive: {
      backgroundColor: MIDNIGHT.lavender,
      borderColor: MIDNIGHT.lavender,
      text: { color: '#2A2540' },
    },
    zodiacBadge: {
      backgroundColor: MIDNIGHT.lavenderTint,
      borderColor: MIDNIGHT.border,
      text: { color: MIDNIGHT.lavender },
    },
  },
  light: {
    field: {
      backgroundColor: '#FBF9F6',
      borderColor: 'rgba(195, 169, 149, 0.2)',
    },
    eyebrow: { color: '#6B5588' },
    dateText: { color: '#2A382E' },
    chevron: { color: '#6B5588' },
    pickerBorder: { borderTopColor: 'rgba(154, 122, 184, 0.18)' },
    pickerLabel: { color: '#6B5588' },
    chip: {
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      borderColor: 'rgba(186, 198, 188, 0.35)',
      text: { color: '#5E4878' },
    },
    chipActive: {
      backgroundColor: '#5C7A68',
      borderColor: '#5C7A68',
      text: { color: '#FFFFFF' },
    },
    zodiacBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: 'rgba(154, 122, 184, 0.22)',
      text: { color: '#5E4878' },
    },
  },
};

export default function MamaBirthdayField({ birthday, onBirthdayChange, variant = 'midnight' }) {
  const [expanded, setExpanded] = useState(false);
  const palette = PALETTES[variant] || PALETTES.midnight;
  const summary = getBirthdayProfileSummary(birthday);
  const activeMonth = birthday?.month ?? null;
  const activeDay = birthday?.day ?? null;

  const zodiac = useMemo(() => {
    if (!isValidBirthday(birthday)) return null;
    return getZodiacSign(birthday.month, birthday.day);
  }, [birthday]);

  const handleSelectMonth = (month) => {
    const nextDay = activeDay ? Math.min(activeDay, getDaysInMonth(month)) : 1;
    onBirthdayChange?.(normalizeBirthday({ month, day: nextDay }));
    setExpanded(true);
  };

  const handleSelectDay = (day) => {
    if (!activeMonth) return;
    onBirthdayChange?.(normalizeBirthday({ month: activeMonth, day }));
  };

  return (
    <View style={[styles.field, palette.field]}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.9}
      >
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, palette.eyebrow, SANS]}>🎂 Birthday</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.dateText, palette.dateText, SANS]}>{summary.dateLabel}</Text>
            {zodiac ? (
              <View style={[styles.zodiacBadge, palette.zodiacBadge]}>
                <Text style={styles.zodiacEmoji}>{zodiac.emoji}</Text>
                <Text style={[styles.zodiacSignText, palette.zodiacBadge.text, SANS]}>
                  {zodiac.sign}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.hint, SANS]}>
            We&apos;ll celebrate you with a special village gift on your day.
          </Text>
        </View>
        <Text style={[styles.chevron, palette.chevron]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={[styles.pickerBody, palette.pickerBorder]}>
          <Text style={[styles.pickerLabel, palette.pickerLabel, SANS]}>Month</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthChipRow}
          >
            {MONTH_SHORT.map((label, index) => {
              const month = index + 1;
              const active = activeMonth === month;
              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.chip,
                    palette.chip,
                    active && palette.chipActive,
                  ]}
                  onPress={() => handleSelectMonth(month)}
                  activeOpacity={0.88}
                >
                  <Text
                    style={[
                      styles.chipText,
                      palette.chip.text,
                      active && palette.chipActive.text,
                      SANS,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {activeMonth ? (
            <>
              <Text style={[styles.pickerLabel, styles.pickerLabelSpaced, palette.pickerLabel, SANS]}>
                Day
              </Text>
              <View style={styles.dayGrid}>
                {Array.from({ length: getDaysInMonth(activeMonth) }, (_, i) => i + 1).map((day) => {
                  const active = activeDay === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayChip,
                        palette.chip,
                        active && palette.chipActive,
                      ]}
                      onPress={() => handleSelectDay(day)}
                      activeOpacity={0.88}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          palette.chip.text,
                          active && palette.chipActive.text,
                          SANS,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 8,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateText: {
    fontSize: 19,
    fontWeight: '700',
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    color: MIDNIGHT.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderWidth: 1,
    gap: 4,
  },
  zodiacEmoji: {
    fontSize: 17,
  },
  zodiacSignText: {
    fontSize: 14,
    fontWeight: '800',
  },
  chevron: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  pickerBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pickerLabelSpaced: {
    marginTop: 10,
  },
  monthChipRow: {
    gap: 6,
    paddingRight: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
