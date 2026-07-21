import React from 'react';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import BabyOracleCard from '../BabyOracleCard';
import { useVillageGentleReveal } from '../villageScreenTransitions';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

const INK = '#FFFFFF';

export default function TwoAMBabyOracleScreen({ onExit, gentleEnter = false, loungeSubView = false }) {
  const screenReveal = useVillageGentleReveal(gentleEnter);
  const useSolidLoungeBackdrop = loungeSubView || gentleEnter;

  return (
    <Animated.View
      style={[
        styles.screenRoot,
        useSolidLoungeBackdrop && styles.screenRootLounge,
        gentleEnter
          ? { opacity: screenReveal.opacity, transform: screenReveal.transform }
          : null,
      ]}
    >
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={onExit} style={styles.backBtn} activeOpacity={0.85}>
          <Text style={[styles.backText, SANS]}>← Back</Text>
        </TouchableOpacity>

        <BabyOracleCard />

        <Text style={[styles.disclaimer, SANS]}>
          This guide supports calm assessment — it does not replace your pediatrician or emergency
          services. Call your provider for breathing distress, high fever in infants under 3 months,
          or symptoms that feel urgent.
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screenRootLounge: {
    backgroundColor: '#14121C',
  },
  mainScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 10,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    paddingHorizontal: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
