import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { MIDNIGHT } from '../midnightLoungeTheme';
import PregnancyOracleCard from '../PregnancyOracleCard';
import { useVillageGentleReveal } from '../villageScreenTransitions';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

export default function TwoAMPregnancyOracleScreen({ onExit, gentleEnter = false }) {
  const screenReveal = useVillageGentleReveal(gentleEnter);

  return (
    <Animated.View
      style={[
        styles.screenRoot,
        gentleEnter
          ? { opacity: screenReveal.opacity, transform: screenReveal.transform }
          : null,
      ]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.backBtn} activeOpacity={0.85}>
          <Text style={[styles.backText, SANS]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarHint, SANS]}>Pregnancy oracle · not medical advice</Text>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <PregnancyOracleCard />

        <Text style={[styles.disclaimer, SANS]}>
          These rituals support calm and rest — they do not replace your provider. Call your care
          team for urgent symptoms or concerns about your pregnancy.
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: MIDNIGHT.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MIDNIGHT.borderSoft,
    backgroundColor: MIDNIGHT.bgElevated,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 10,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
    color: MIDNIGHT.lavender,
  },
  topBarHint: {
    fontSize: 13,
    fontWeight: '600',
    color: MIDNIGHT.textMuted,
    letterSpacing: 0.3,
  },
  mainScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
    backgroundColor: 'transparent',
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 19,
    color: MIDNIGHT.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
