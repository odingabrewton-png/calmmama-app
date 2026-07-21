import React, { useMemo, useState, memo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { getBloomWeek, getCombinedWeeklyMedicalInsight, TRIMESTER_LABELS } from './bloomWeekData';
import { getWeeklyAffirmation } from './bloomAffirmations';
import BabyGrowthScreen from './BabyGrowthScreen';
import {
  PREGNANT_BLOOM_LAYOUT,
  PREGNANT_BLOOM_LAYOUT_LOCKED,
  PREGNANT_BLOOM_STACK,
} from './pregnantBloomLayoutConfig';
import { KITCHEN_SERIF } from './designTypography';
import { bloomFredokaTitle, injectBloomFredokaFont, injectNurseryWebFonts } from './nurseryRetroFonts';

/** PREGNANT BLOOM TAB — layout locked. User must say "UNLOCK BLOOM LAYOUT" before structural edits. */

const AFFIRMATION_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Times New Roman", serif' },
  default: {},
});

function BloomAffirmationMiniCard({ affirmation, trimesterLabel, week }) {
  return (
    <View style={affirmationMiniStyles.wrap}>
      <View style={affirmationMiniStyles.card}>
        <View style={affirmationMiniStyles.bgBubbleLeft} />
        <View style={affirmationMiniStyles.bgBubbleRight} />
        <View style={affirmationMiniStyles.bgDotRow}>
          <Text style={affirmationMiniStyles.bgDot}>✦</Text>
          <Text style={affirmationMiniStyles.bgDot}>♡</Text>
          <Text style={affirmationMiniStyles.bgDot}>✦</Text>
        </View>

        <View style={affirmationMiniStyles.headerRow}>
          <View style={affirmationMiniStyles.iconOrb}>
            <Text style={affirmationMiniStyles.iconEmoji}>🌷</Text>
          </View>
          <View style={affirmationMiniStyles.headerCopy}>
            <Text style={[affirmationMiniStyles.eyebrow, AFFIRMATION_SERIF]}>Weekly Affirmation</Text>
            <Text style={[affirmationMiniStyles.weekPill, AFFIRMATION_SERIF]}>Week {week} · {trimesterLabel}</Text>
          </View>
        </View>

        <View style={affirmationMiniStyles.divider} />

        <Text style={[affirmationMiniStyles.quote, AFFIRMATION_SERIF]}>"{affirmation}"</Text>

        <View style={affirmationMiniStyles.footer}>
          <Text style={affirmationMiniStyles.footerLeaf}>🌿</Text>
          <Text style={[affirmationMiniStyles.footerText, AFFIRMATION_SERIF]}>for you, mama</Text>
          <Text style={affirmationMiniStyles.footerLeaf}>🌿</Text>
        </View>
      </View>
    </View>
  );
}

function WeightChart({ entries, palette, maxWeek }) {
  if (!entries?.length) {
    return (
      <Text style={bloomStyles.chartEmpty}>Log your first weight to see your gentle trend line grow.</Text>
    );
  }
  const sorted = [...entries].sort((a, b) => a.week - b.week);
  const weights = sorted.map((e) => e.weight);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const range = maxW - minW || 1;

  return (
    <View style={bloomStyles.chartWrap}>
      <View style={bloomStyles.chartBars}>
        {sorted.map((entry) => {
          const h = ((entry.weight - minW) / range) * 72 + 12;
          const isCurrent = entry.week === maxWeek;
          return (
            <View key={`${entry.week}-${entry.weight}`} style={bloomStyles.chartCol}>
              <View
                style={[
                  bloomStyles.chartBar,
                  {
                    height: h,
                    backgroundColor: isCurrent ? palette.primary : palette.accent,
                    opacity: isCurrent ? 0.9 : 0.5,
                  },
                ]}
              />
              <Text style={bloomStyles.chartLabel}>W{entry.week}</Text>
            </View>
          );
        })}
      </View>
      <View style={bloomStyles.chartLegend}>
        <Text style={bloomStyles.chartLegendText}>
          {sorted[sorted.length - 1].weight} lbs · latest entry
        </Text>
      </View>
    </View>
  );
}

function WeeklyBloomScreen({
  embedded = false,
  initialWeek = 24,
  mamaName = 'Mama',
  dueDate = '',
  weightEntries = [],
  onAddWeight,
  onWeekChange,
  onOpenBirthPrompt,
  onLogMeals,
  isActive = true,
}) {
  if (__DEV__ && !PREGNANT_BLOOM_LAYOUT_LOCKED) {
    console.warn('[WeeklyBloomScreen] PREGNANT_BLOOM_LAYOUT_LOCKED is false — bloom layout edits allowed');
  }

  const [week, setWeek] = useState(Math.min(40, Math.max(1, parseInt(String(initialWeek), 10) || 24)));
  const [weightInput, setWeightInput] = useState('');
  const data = getBloomWeek(week);

  const changeWeek = (delta) => {
    const next = Math.min(40, Math.max(1, week + delta));
    setWeek(next);
    onWeekChange?.(String(next));
  };

  const saveWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 50 || w > 400) return;
    onAddWeight?.({ week, weight: w });
    setWeightInput('');
  };

  const weekWeights = weightEntries.filter((e) => e.week <= week);
  const weeklyAffirmation = useMemo(
    () => getWeeklyAffirmation(data.trimester, week, mamaName),
    [data.trimester, week, mamaName]
  );
  const combinedMedicalInsight = useMemo(
    () => getCombinedWeeklyMedicalInsight(week),
    [week]
  );

  useEffect(() => {
    injectNurseryWebFonts();
    injectBloomFredokaFont();
  }, []);

  const body = (
    <>
      <View style={bloomStyles.hero} nativeID={PREGNANT_BLOOM_STACK[0]}>
        <Text style={bloomStyles.heroEyebrow}>WEEKLY BLOOM</Text>
        <Text style={[bloomStyles.heroTitle, { color: data.palette.primary }]}>
          Mama's Journey
        </Text>
        <Text style={bloomStyles.heroSub} numberOfLines={2}>
          {TRIMESTER_LABELS[data.trimester - 1]} · Due {dueDate || 'your beautiful day'}
        </Text>
      </View>

      <View nativeID={PREGNANT_BLOOM_STACK[1]}>
        <BloomAffirmationMiniCard
          affirmation={weeklyAffirmation}
          trimesterLabel={TRIMESTER_LABELS[data.trimester - 1]}
          week={week}
        />
      </View>

      <View
        style={[bloomStyles.weekStepper, { borderColor: data.palette.accent }]}
        nativeID={PREGNANT_BLOOM_STACK[2]}
      >
        <TouchableOpacity style={bloomStyles.stepBtn} onPress={() => changeWeek(-1)} disabled={week <= 1}>
          <Text style={bloomStyles.stepBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={bloomStyles.stepCenter}>
          <Text style={[bloomStyles.stepWeek, { color: data.palette.primary }]}>Week {week}</Text>
          <Text style={bloomStyles.stepMilestone}>{data.milestone}</Text>
        </View>
        <TouchableOpacity style={bloomStyles.stepBtn} onPress={() => changeWeek(1)} disabled={week >= 40}>
          <Text style={bloomStyles.stepBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[bloomStyles.silhouetteCard, { backgroundColor: data.palette.wash, borderColor: data.palette.accent }]}
        nativeID={PREGNANT_BLOOM_STACK[3]}
      >
        <Text style={bloomStyles.bloomingBodyTitle}>YOUR BLOOMING BODY</Text>
        <BabyGrowthScreen week={week} onLogMeals={onLogMeals} embedded isActive={isActive} />
      </View>

      <View
        style={[bloomStyles.fruitCard, { backgroundColor: data.palette.fruitBg, borderColor: data.palette.accent }]}
        nativeID={PREGNANT_BLOOM_STACK[4]}
      >
        <Text style={bloomStyles.bloomSectionTitle}>BABY SIZE THIS WEEK</Text>
        <View style={bloomStyles.fruitRow}>
          <View style={[bloomStyles.fruitOrb, { backgroundColor: data.palette.wash }]}>
            <Text style={bloomStyles.fruitEmoji}>{data.fruitEmoji}</Text>
          </View>
          <View style={bloomStyles.fruitCopy}>
            <Text style={[bloomStyles.fruitName, { color: data.palette.primary }]}>
              Size of a {data.fruit}
            </Text>
            <Text style={bloomStyles.fruitLength}>About {data.babyLength}</Text>
            <Text style={bloomStyles.fruitFact}>{data.fruitFact}</Text>
          </View>
        </View>
      </View>

      <View style={bloomStyles.sectionCard} nativeID={PREGNANT_BLOOM_STACK[5]}>
        <Text style={bloomStyles.bloomSectionTitle}>WEIGHT TRACKER</Text>
        <View style={bloomStyles.weightInputRow}>
          <TextInput
            style={bloomStyles.weightInput}
            placeholder="Today's weight (lbs)"
            placeholderTextColor="#8a968a"
            keyboardType="decimal-pad"
            value={weightInput}
            onChangeText={setWeightInput}
          />
          <TouchableOpacity
            style={[bloomStyles.weightSaveBtn, { backgroundColor: data.palette.primary }]}
            onPress={saveWeight}
          >
            <Text style={bloomStyles.weightSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
        <WeightChart entries={weekWeights} palette={data.palette} maxWeek={week} />
        {weekWeights.length > 0 && (
          <View style={bloomStyles.weightTable}>
            <View style={bloomStyles.tableHeader}>
              <Text style={bloomStyles.tableHeadCell}>Week</Text>
              <Text style={bloomStyles.tableHeadCell}>Weight</Text>
            </View>
            {[...weekWeights].reverse().slice(0, 6).map((row) => (
              <View key={`t-${row.week}-${row.weight}`} style={bloomStyles.tableRow}>
                <Text style={bloomStyles.tableCell}>Week {row.week}</Text>
                <Text style={bloomStyles.tableCell}>{row.weight} lbs</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={[bloomStyles.medicalCard, { borderColor: data.palette.accent }]} nativeID={PREGNANT_BLOOM_STACK[6]}>
        <Text style={bloomStyles.bloomSectionTitle}>WEEKLY MEDICAL INSIGHTS</Text>
        <Text style={bloomStyles.medicalBadge}>Holistic body + baby check-in · not a substitute for care</Text>
        <Text style={bloomStyles.medicalBody}>{combinedMedicalInsight}</Text>
        <Text style={bloomStyles.medicalFooter}>
          Always contact your midwife or OB with concerns — you are never alone in this.
        </Text>
      </View>

      <View
        style={[bloomStyles.sectionCard, { backgroundColor: 'rgba(255,255,255,0.32)' }]}
        nativeID={PREGNANT_BLOOM_STACK[7]}
      >
        <Text style={bloomStyles.bloomSectionTitle}>THIS WEEK FOR YOU</Text>
        <View style={bloomStyles.factBlock}>
          <Text style={bloomStyles.factIcon}>🌿</Text>
          <View style={bloomStyles.factTextWrap}>
            <Text style={bloomStyles.factLabel}>Physical</Text>
            <Text style={bloomStyles.factBody}>{data.physical}</Text>
          </View>
        </View>
        <View style={bloomStyles.factBlock}>
          <Text style={bloomStyles.factIcon}>💗</Text>
          <View style={bloomStyles.factTextWrap}>
            <Text style={bloomStyles.factLabel}>Emotional</Text>
            <Text style={bloomStyles.factBody}>{data.emotional}</Text>
          </View>
        </View>
      </View>

      {onOpenBirthPrompt ? (
        <TouchableOpacity
          style={[bloomStyles.birthPromptLink, { borderColor: data.palette.accent }]}
          onPress={onOpenBirthPrompt}
          activeOpacity={0.88}
          nativeID={PREGNANT_BLOOM_STACK[8]}
        >
          <Text style={bloomStyles.birthPromptTitle}>Little one here sooner than expected?</Text>
          <Text style={bloomStyles.birthPromptCta}>Tap to let your village know →</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <ScrollView
        style={bloomStyles.embeddedScroll}
        contentContainerStyle={bloomStyles.embeddedContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {body}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={bloomStyles.scroll}
      contentContainerStyle={bloomStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  );
}

export default React.memo(WeeklyBloomScreen);

const affirmationMiniStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    maxWidth: 292,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F3EBFA',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 158, 210, 0.45)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(135deg, #FAF4FF 0%, #F0E4F8 45%, #E8DAF4 100%)',
        boxShadow: '0 6px 18px rgba(140, 110, 170, 0.14)',
      },
      default: {
        shadowColor: '#9A7AB8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  bgBubbleLeft: {
    position: 'absolute',
    top: -18,
    left: -14,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 220, 235, 0.45)',
  },
  bgBubbleRight: {
    position: 'absolute',
    bottom: -12,
    right: -10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(200, 230, 210, 0.35)',
  },
  bgDotRow: {
    position: 'absolute',
    top: 8,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    opacity: 0.45,
  },
  bgDot: {
    fontSize: 8,
    color: '#A888C8',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  iconOrb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(186, 158, 210, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconEmoji: {
    fontSize: 18,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#7A6494',
    textTransform: 'uppercase',
  },
  weekPill: {
    fontSize: 12,
    color: '#8E7AA8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(167, 139, 196, 0.22)',
    marginVertical: 8,
    zIndex: 1,
  },
  quote: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3048',
    textAlign: 'center',
    fontStyle: 'italic',
    zIndex: 1,
    paddingHorizontal: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
    zIndex: 1,
  },
  footerLeaf: {
    fontSize: 9,
    opacity: 0.7,
  },
  footerText: {
    fontSize: 11,
    color: '#9A88B0',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});

const bloomStyles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  embeddedScroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { overflowY: 'auto' },
      default: {},
    }),
  },
  embeddedContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingTop: PREGNANT_BLOOM_LAYOUT.embeddedPadTop,
    paddingBottom: PREGNANT_BLOOM_LAYOUT.embeddedScrollFooterPad,
    paddingHorizontal: PREGNANT_BLOOM_LAYOUT.embeddedPadHorizontal,
  },
  scrollContent: { paddingBottom: 88, paddingHorizontal: 16 },
  hero: {
    marginBottom: PREGNANT_BLOOM_LAYOUT.heroMarginBottom,
    paddingHorizontal: 4,
    alignItems: 'center',
    width: '100%',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A5C50',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  heroTitle: {
    ...KITCHEN_SERIF,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 30,
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  heroSub: {
    fontSize: 10,
    color: '#5a6e62',
    marginTop: 3,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 14,
    maxWidth: '100%',
  },
  weekStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    marginBottom: 14,
  },
  stepBtn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 28,
    color: '#3d4f44',
    fontWeight: '300',
    marginTop: -4,
  },
  stepCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  stepWeek: { fontSize: 18, fontWeight: '800' },
  stepMilestone: {
    fontSize: 11,
    color: '#5c6e63',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 15,
  },
  silhouetteCard: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'stretch',
    width: '100%',
  },
  fruitCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  fruitRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  fruitOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fruitEmoji: { fontSize: 36 },
  fruitCopy: { flex: 1 },
  fruitName: { fontSize: 17, fontWeight: '800', lineHeight: 22 },
  fruitLength: { fontSize: 13, color: '#5c6e63', marginTop: 2, fontWeight: '600' },
  fruitFact: { fontSize: 13, color: '#4a5c51', lineHeight: 19, marginTop: 5 },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  cardEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4a5c50',
    letterSpacing: 1,
    marginBottom: 8,
  },
  insightSectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4a5c50',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  bloomingBodyTitle: {
    ...bloomFredokaTitle,
    fontSize: 15,
    color: '#3d4f44',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  bloomSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4a5c50',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  weightInputRow: { flexDirection: 'row', marginBottom: 10 },
  weightInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(140,160,145,0.4)',
    marginRight: 8,
    color: '#1a291f',
  },
  weightSaveBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  weightSaveText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  chartWrap: { marginTop: 4 },
  chartEmpty: { fontSize: 13, color: '#6a7a6e', fontStyle: 'italic', lineHeight: 19 },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 90,
    paddingTop: 8,
  },
  chartCol: { flex: 1, alignItems: 'center', marginHorizontal: 2 },
  chartBar: { width: '70%', borderRadius: 6, minHeight: 8 },
  chartLabel: { fontSize: 11, color: '#6a7a6e', marginTop: 4, fontWeight: '700' },
  chartLegend: { marginTop: 8, alignItems: 'center' },
  chartLegendText: { fontSize: 13, color: '#4a5c51', fontWeight: '600' },
  weightTable: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 8 },
  tableHeader: { flexDirection: 'row', marginBottom: 5 },
  tableHeadCell: { flex: 1, fontSize: 11, fontWeight: '800', color: '#6a7a6e', letterSpacing: 0.5 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  tableCell: { flex: 1, fontSize: 13, color: '#2a3d32', fontWeight: '600' },
  factBlock: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  factIcon: { fontSize: 16, marginRight: 8, marginTop: 1 },
  factTextWrap: { flex: 1 },
  factLabel: { fontSize: 12, fontWeight: '800', color: '#4a5c50', marginBottom: 3 },
  factBody: { fontSize: 14, color: '#3d4f44', lineHeight: 20 },
  medicalCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1.5,
  },
  medicalBadge: {
    fontSize: 12,
    color: '#7a6a5a',
    fontWeight: '600',
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  medicalBody: { fontSize: 14, color: '#2a3d32', lineHeight: 21 },
  medicalFooter: {
    fontSize: 12,
    color: '#6a7a6e',
    marginTop: 10,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  birthPromptLink: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  birthPromptTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2a3d32',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 5,
  },
  birthPromptCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4a6b55',
    textAlign: 'center',
    lineHeight: 17,
  },
});
