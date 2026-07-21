import { getBloomWeek } from './bloomWeekData';

/** Curated weekly baby-development spotlight copy for the growth video card. */
const WEEK_HIGHLIGHTS = Object.freeze({
  4: {
    title: 'Your baby is taking shape!',
    body:
      'The neural tube is forming and a tiny heart may soon begin its first beats. Rest, folate-rich nourishment, and gentle pacing are powerful gifts this week.',
  },
  8: {
    title: 'Little fingers are forming!',
    body:
      'Tiny limb buds are becoming arms and legs, and facial features are beginning to emerge. Your body is doing remarkable sculpting work behind the scenes.',
  },
  12: {
    title: 'Your baby can make faces!',
    body:
      'Reflexes are developing and your little one may practice small movements you cannot feel yet. Many mamas share their news as the first trimester closes.',
  },
  16: {
    title: 'Your baby can hear your voice!',
    body:
      'Little ears are tuning in to the rhythm of your heartbeat and the warmth of your words. Singing, reading, or talking to your bump is already bonding magic.',
  },
  18: {
    title: 'Your baby is stretching & wiggling!',
    body:
      'Arms and legs are moving with more purpose as muscles strengthen. You may start feeling those first gentle flutters — tiny hellos from inside.',
  },
  20: {
    title: 'Your baby can taste!',
    body:
      'Taste buds are sending sweet signals to their growing brain. They swallow tiny molecules of the foods you eat through amniotic fluid — a perfect excuse for something delicious today, Mama.',
  },
  24: {
    title: 'Your baby is practicing breath!',
    body:
      'Lungs are maturing with practice breathing movements in the womb. Those tiny rehearsals help prepare for the first real breath on the outside.',
  },
  28: {
    title: 'Your baby recognizes your voice!',
    body:
      'Brain waves for hearing are active, and familiar voices may feel like home. Your tone, humming, and lullabies are already part of their comfort soundtrack.',
  },
  32: {
    title: 'Your baby is gaining strength!',
    body:
      'Bones are hardening, muscles are strengthening, and movements may feel more purposeful. Every kick is a little hello from your growing miracle.',
  },
  36: {
    title: 'Your baby is getting ready!',
    body:
      'Fat layers are building, organs are fine-tuning, and your little one may settle head-down. Your body and baby are rehearsing for birth in quiet, beautiful ways.',
  },
  40: {
    title: 'Your baby is full bloom!',
    body:
      'Your little one is considered full term and ready to meet you when they choose their moment. You have carried an entire world — what an honor.',
  },
});

export function getBabyGrowthHighlight(weekInput) {
  const week = Math.min(40, Math.max(1, parseInt(String(weekInput), 10) || 20));
  const curated = WEEK_HIGHLIGHTS[week];
  if (curated) {
    return { week, ...curated };
  }

  const bloom = getBloomWeek(week);
  return {
    week,
    title: `Growing like a ${bloom.fruit.toLowerCase()}!`,
    body: `${bloom.fruitFact} ${bloom.physical} Take a slow breath — you are nourishing this bloom every single day.`,
  };
}
