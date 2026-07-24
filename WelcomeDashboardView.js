import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { retroHubTitle } from './nurseryRetroFonts';

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

const BASE_FEATURES = [
  {
    id: 'home',
    emoji: '🏡',
    title: 'Your Village Home',
    body: 'A calm dashboard that grows with your season — sprout garden, milestones, or time capsules.',
  },
  {
    id: 'kitchen',
    emoji: '🍳',
    title: "Mama's Kitchen",
    body: 'Therapeutic meals and gentle recipes matched to how your body and heart feel today.',
  },
  {
    id: 'bloom',
    emoji: '🌱',
    title: 'Weekly Bloom',
    body: 'Track your miracle week by week with bloom videos, gentle body graphics, and due-date grace.',
  },
  {
    id: 'lounge',
    emoji: '🪷',
    title: 'Midnight Lounge',
    body: 'Evening rituals, village connection, and quiet-hour rest at the center lotus.',
  },
];

const PREGNANT_WELCOME_GRADIENT = Object.freeze({
  colors: ['#FAD4C8', '#F8E6DC', '#F0EBF4', '#DCE8F6', '#C8D8F0'],
  locations: [0, 0.24, 0.5, 0.76, 1],
});

const POSTPARTUM_WELCOME_GRADIENT = Object.freeze({
  colors: ['#F5EDE4', '#F8F2EC', '#F4EFE8', '#ECEFF8', '#E2EAF0'],
  locations: [0, 0.24, 0.5, 0.76, 1],
});

const DEFAULT_WELCOME_GRADIENT = Object.freeze({
  colors: ['#FAD4C8', '#F7E8DF', '#E4EDF8', '#C8D8F0'],
  locations: [0, 0.35, 0.72, 1],
});

const JOURNEY_FEATURES = {
  postpartum: {
    emoji: '☁️',
    title: 'Cloud Nursery',
    body: 'Gentle sleep, feeding, and recovery logs — plus golden-hour keepsakes for your story.',
  },
};

function FeatureCard({ emoji, title, body }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureCopy}>
        <Text style={[styles.featureTitle, SERIF]}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function WelcomeDashboardView({
  logoUri,
  mamaName = 'Mama',
  userJourney = 'pregnant',
  onGetStarted,
}) {
  const features = useMemo(() => {
    if (userJourney === 'hybrid') {
      return [
        {
          id: 'hybrid',
          emoji: '🤰🧸',
          title: 'Pregnancy + Toddler Mode',
          body: 'Toggle Home between your pregnancy track and little-one track anytime — one village, both seasons.',
        },
        ...BASE_FEATURES,
      ];
    }
    const core =
      userJourney === 'pregnant'
        ? BASE_FEATURES
        : BASE_FEATURES.filter((feature) => feature.id !== 'bloom');

    if (userJourney === 'postpartum') {
      return [...core, { id: 'journey', ...JOURNEY_FEATURES.postpartum }];
    }
    return core;
  }, [userJourney]);

  const greeting = mamaName?.trim() && mamaName.trim() !== 'Mama' ? mamaName.trim() : 'beautiful mama';
  const isPregnant = userJourney === 'pregnant' || userJourney === 'hybrid';
  const isPostpartum = userJourney === 'postpartum' || userJourney === 'hybrid';
  const usesFullBleedWelcome = isPregnant || isPostpartum;
  const gradient = userJourney === 'postpartum'
    ? POSTPARTUM_WELCOME_GRADIENT
    : isPregnant
      ? PREGNANT_WELCOME_GRADIENT
      : DEFAULT_WELCOME_GRADIENT;

  const content = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        usesFullBleedWelcome && styles.scrollContentFullBleed,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.badgeWrap}>
        <View style={styles.badgeHalo} />
        <Image source={{ uri: logoUri }} style={styles.badgeImage} resizeMode="contain" />
      </View>

      <Text style={[styles.eyebrow, SERIF]}>YOUR VILLAGE AWAITS</Text>
      <Text style={[styles.headline, retroHubTitle]}>Welcome, {greeting}</Text>
      <Text style={[styles.subhead, SERIF]}>
        Everything here was designed to hold you — softly, beautifully, and without hurry.
      </Text>

      <View style={styles.cardStack}>
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            emoji={feature.emoji}
            title={feature.title}
            body={feature.body}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.ctaBtn} onPress={onGetStarted} activeOpacity={0.9}>
        <Text style={styles.ctaText}>Let&apos;s get started →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (usesFullBleedWelcome) {
    return (
      <View style={styles.welcomeFullBleedRoot}>
        <LinearGradient
          colors={gradient.colors}
          locations={gradient.locations}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.welcomeFullBleedSafe} edges={['left', 'right']}>
          {content}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradient.colors}
      locations={gradient.locations}
      style={styles.gradientRoot}
    >
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientRoot: {
    flex: 1,
  },
  welcomeFullBleedRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  welcomeFullBleedSafe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
    flexGrow: 1,
  },
  scrollContentFullBleed: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  badgeWrap: {
    alignSelf: 'center',
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  badgeHalo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 54,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(200, 160, 140, 0.25)' },
      default: {
        shadowColor: '#D4A898',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  badgeImage: {
    width: 88,
    height: 88,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(61, 82, 70, 0.65)',
    textAlign: 'center',
    marginBottom: 8,
  },
  headline: {
    fontSize: 30,
    lineHeight: 38,
    color: '#3D5246',
    textAlign: 'center',
    marginBottom: 8,
  },
  subhead: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4A5C50',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 320,
    alignSelf: 'center',
    marginBottom: 22,
  },
  cardStack: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    ...Platform.select({
      web: { boxShadow: '0 8px 22px rgba(92, 122, 104, 0.08)' },
      default: { elevation: 2 },
    }),
  },
  featureEmoji: {
    fontSize: 26,
    marginRight: 12,
    marginTop: 2,
  },
  featureCopy: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A382E',
    marginBottom: 4,
  },
  featureBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5C6E63',
  },
  ctaBtn: {
    backgroundColor: '#E9A889',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(233, 168, 137, 0.35)' },
      default: { elevation: 4 },
    }),
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
