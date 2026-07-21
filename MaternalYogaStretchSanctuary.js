import React, { useCallback, useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MIDNIGHT } from './midnightLoungeTheme';

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function configureStretchAccordion() {
  LayoutAnimation.configureNext({
    duration: 280,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

export const PREGNANCY_STRETCHES = [
  {
    id: 'cat-cow',
    title: 'Cat-Cow Flow',
    benefit: 'Relieves lower back tension and helps baby align',
    trimester: 'All trimesters · especially 2nd & 3rd',
    tint: 'rgba(200, 216, 240, 0.14)',
    accent: MIDNIGHT.powderBlue,
    poseImage: require('./assets/yoga/yoga-cat-cow.png'),
    poseCue: 'Hands & knees · gently wave the spine',
    steps: [
      'Come onto hands and knees — wrists under shoulders, knees under hips.',
      'As you inhale, gently drop your belly and lift your gaze (Cow).',
      'As you exhale, round your spine toward the ceiling and tuck your chin (Cat).',
      'Flow slowly for 5–8 breaths. Move only as far as feels soft and easy.',
    ],
  },
  {
    id: 'childs-pose',
    title: "Supported Child's Pose",
    benefit: 'Wide knees — perfect for pelvic floor relaxation',
    trimester: 'All trimesters · use pillows as needed',
    tint: 'rgba(196, 188, 230, 0.16)',
    accent: MIDNIGHT.lavender,
    poseImage: require('./assets/yoga/yoga-childs-pose.png'),
    poseCue: 'Wide knees · forehead on a pillow',
    steps: [
      'Kneel and open your knees wide enough for your belly to rest comfortably.',
      'Walk your hands forward and rest your forehead on a pillow or the mat.',
      'Let your hips sink back toward your heels — use a cushion under your seat if needed.',
      'Breathe into your lower back and hips for 6–10 slow breaths.',
    ],
  },
  {
    id: 'butterfly',
    title: 'Gentle Butterfly Stretch',
    benefit: 'Opens hips and stretches inner thighs',
    trimester: '1st & 2nd · go gently in late 3rd',
    tint: 'rgba(245, 217, 206, 0.14)',
    accent: MIDNIGHT.peach,
    poseImage: require('./assets/yoga/yoga-butterfly.png'),
    poseCue: 'Soles together · knees soft & open',
    steps: [
      'Sit tall with the soles of your feet together and knees falling open.',
      'Hold your ankles or shins — never force your knees down.',
      'Lengthen through your crown and soften your shoulders.',
      'Hold for 5–8 breaths, rocking gently side to side if it feels good.',
    ],
  },
  {
    id: 'side-stretch',
    title: 'Seated Side Stretch',
    benefit: 'Creates breathing room in the ribcage',
    trimester: 'All trimesters · wonderful in 3rd',
    tint: 'rgba(212, 184, 150, 0.12)',
    accent: MIDNIGHT.accentGold,
    poseImage: require('./assets/yoga/yoga-side-stretch.png'),
    poseCue: 'Seated · one arm arcs overhead',
    steps: [
      'Sit comfortably cross-legged or on a cushion with a long spine.',
      'Place your left hand on the floor beside you and reach your right arm overhead.',
      'Inhale to lengthen; exhale and tip gently toward the left.',
      'Hold for 4–6 breaths, then switch sides. Keep both sit bones rooted.',
    ],
  },
];

const StretchCard = memo(function StretchCard({ stretch, expanded, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: stretch.tint }]}
      onPress={onToggle}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`${stretch.title}. ${stretch.benefit}`}
    >
      <View style={styles.cardHeader}>
        <Image
          source={stretch.poseImage}
          style={styles.poseThumb}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardTitle, SANS]}>{stretch.title}</Text>
          <Text style={[styles.cardBenefit, SANS]}>{stretch.benefit}</Text>
          <View style={[styles.trimesterPill, { borderColor: stretch.accent }]}>
            <Text style={[styles.trimesterText, { color: stretch.accent }, SANS]}>
              {stretch.trimester}
            </Text>
          </View>
        </View>
        <Text style={[styles.chevron, { color: stretch.accent }, SANS]}>
          {expanded ? '−' : '+'}
        </Text>
      </View>

      {expanded ? (
        <View style={styles.cardBody}>
          <View style={styles.poseGuide}>
            <Image
              source={stretch.poseImage}
              style={styles.poseHero}
              resizeMode="cover"
              accessibilityLabel={`Visual guide for ${stretch.title}`}
            />
            <Text style={[styles.poseCue, { color: stretch.accent }, SANS]}>
              {stretch.poseCue}
            </Text>
          </View>

          <Text style={[styles.stepsLabel, SANS]}>How to move</Text>
          {stretch.steps.map((step, index) => (
            <View key={`${stretch.id}-step-${index}`} style={styles.stepRow}>
              <Text style={[styles.stepNum, { color: stretch.accent }, SANS]}>{index + 1}</Text>
              <Text style={[styles.stepText, SANS]}>{step}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

export default function MaternalYogaStretchSanctuary() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleStretch = useCallback((id) => {
    configureStretchAccordion();
    Haptics.selectionAsync().catch(() => {});
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <View style={styles.root}>
      <Text style={[styles.moduleLabel, SANS]}>🪷 Maternal Yoga & Stretch Sanctuary</Text>
      <Text style={[styles.moduleHint, SANS]}>
        Soft, restorative stretches for a quieter body — tap a card to see the pose and open the
        flow.
      </Text>

      <View style={styles.safetyBanner}>
        <Text style={[styles.safetyText, SANS]}>
          Always listen to your body and check with your midwife or OB before beginning any new
          movement practice.
        </Text>
      </View>

      <View style={styles.list}>
        {PREGNANCY_STRETCHES.map((stretch) => (
          <StretchCard
            key={stretch.id}
            stretch={stretch}
            expanded={expandedId === stretch.id}
            onToggle={() => toggleStretch(stretch.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
    width: '100%',
  },
  moduleLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: MIDNIGHT.peach,
    textAlign: 'left',
  },
  moduleHint: {
    fontSize: 16,
    lineHeight: 23,
    color: MIDNIGHT.textSecondary,
    marginTop: -4,
    textAlign: 'left',
  },
  safetyBanner: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(245, 217, 206, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 217, 206, 0.28)',
  },
  safetyText: {
    fontSize: 14,
    lineHeight: 21,
    color: MIDNIGHT.peach,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.14)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  poseThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 18, 28, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.16)',
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MIDNIGHT.textPrimary,
    letterSpacing: 0.2,
  },
  cardBenefit: {
    fontSize: 15,
    lineHeight: 21,
    color: MIDNIGHT.textSecondary,
  },
  trimesterPill: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(20, 18, 28, 0.35)',
  },
  trimesterText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 26,
    paddingTop: 2,
    minWidth: 20,
    textAlign: 'center',
  },
  cardBody: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 229, 247, 0.12)',
    gap: 12,
  },
  poseGuide: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 18, 28, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 247, 0.14)',
  },
  poseHero: {
    width: '100%',
    height: 168,
  },
  poseCue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    letterSpacing: 0.2,
  },
  stepsLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: MIDNIGHT.textMuted,
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNum: {
    fontSize: 15,
    fontWeight: '800',
    minWidth: 18,
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: MIDNIGHT.textSecondary,
  },
});
