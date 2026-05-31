/** Pregnancy week content for Weekly Bloom — fruit scale, mama & baby facts */

const FRUIT_BY_WEEK = [
  '', '', '', '', 'Poppy Seed', 'Sesame Seed', 'Lentil', 'Blueberry', 'Raspberry', 'Grape',
  'Kumquat', 'Fig', 'Lime', 'Lemon', 'Peach', 'Apple', 'Avocado', 'Pear', 'Bell Pepper', 'Banana',
  'Carrot', 'Papaya', 'Grapefruit', 'Cantaloupe', 'Cauliflower', 'Lettuce Head', 'Cabbage', 'Eggplant',
  'Butternut Squash', 'Cucumber', 'Coconut', 'Jicama', 'Pineapple', 'Cantaloupe', 'Honeydew Melon',
  'Romaine Lettuce', 'Swiss Chard', 'Leek', 'Watermelon', 'Pumpkin',
];

const FRUIT_EMOJI = [
  '', '', '', '', '🌱', '✨', '🫘', '🫐', '🍇', '🍇',
  '🍊', '🫒', '🍋', '🍋', '🍑', '🍎', '🥑', '🍐', '🫑', '🍌',
  '🥕', '🥭', '🍊', '🍈', '🥦', '🥬', '🥬', '🍆',
  '🎃', '🥒', '🥥', '🥔', '🍍', '🍈', '🍈',
  '🥬', '🥬', '🧅', '🍉', '🎃',
];

const LENGTH_BY_WEEK = [
  '', '', '', '', '0.2 cm', '0.3 cm', '0.6 cm', '1.3 cm', '1.6 cm', '3.1 cm',
  '4.1 cm', '4.5 cm', '7.4 cm', '8.7 cm', '12.3 cm', '16.4 cm', '18.0 cm', '21.6 cm', '22.3 cm', '25.7 cm',
  '26.7 cm', '27.8 cm', '28.9 cm', '30.0 cm', '31.1 cm', '32.4 cm', '33.9 cm', '37.6 cm',
  '39.9 cm', '40.0 cm', '41.1 cm', '42.0 cm', '42.4 cm', '43.6 cm', '44.5 cm',
  '45.0 cm', '45.5 cm', '46.0 cm', '47.0 cm', '48.5 cm',
];

const T1_PHYSICAL = [
  'Tender breasts and mild fatigue as hormones settle in.',
  'Light spotting may occur — note anything heavy for your provider.',
  'Nausea waves often peak; small, frequent meals can help.',
  'Heightened sense of smell; rest when your body asks.',
];
const T1_EMOTIONAL = [
  'Joy and anxiety may mingle — both are valid.',
  'Dreams about baby or birth can feel vivid.',
  'You may need extra reassurance; reach for your village.',
  'Bonding can begin before you feel kicks.',
];
const T1_MEDICAL = [
  'Neural tube forms — folate-rich foods support development.',
  'Heartbeat may be detectable by ultrasound around weeks 6–7.',
  'Avoid alcohol, raw fish, and unprescribed medications.',
  'Schedule your first prenatal visit if you have not yet.',
];

const T2_PHYSICAL = [
  'Energy often returns; you may feel baby’s first flutters.',
  'Round ligament aches are common with sudden movements.',
  'Skin may glow — or new sensitivities may appear.',
  'Back support and gentle stretching ease growing strain.',
];
const T2_EMOTIONAL = [
  'Excitement grows as bump becomes visible.',
  'Nesting instincts may spark planning and dreaming.',
  'Partner bonding rituals can deepen connection.',
  'It is normal to oscillate between confidence and worry.',
];
const T2_MEDICAL = [
  'Anatomy scan typically occurs around weeks 18–22.',
  'Iron needs rise — pair leafy greens with vitamin C.',
  'Track fetal movement patterns once kicks are clear.',
  'Discuss glucose screening timing with your care team.',
];

const T3_PHYSICAL = [
  'Shortness of breath and heartburn are common as space tightens.',
  'Swelling in feet/hands — elevate and hydrate.',
  'Braxton Hicks practice contractions may appear.',
  'Sleep becomes precious; side-lying with pillows helps.',
];
const T3_EMOTIONAL = [
  'Anticipation and impatience often intensify.',
  'Birth preferences and postpartum support feel more urgent.',
  'Fear of labor is common — education and breathwork help.',
  'Celebrate how far your body has carried life.',
];
const T3_MEDICAL = [
  'Weekly or biweekly visits often begin after 36 weeks.',
  'Watch for regular movement — report decreases promptly.',
  'Know true labor signs vs. false alarms with your provider.',
  'Pack hospital bag and finalize pediatric care by week 36+.',
];

function pick(arr, week) {
  return arr[week % arr.length];
}

export function getBloomWeek(weekInput) {
  const week = Math.min(40, Math.max(1, parseInt(String(weekInput), 10) || 1));
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
  const season =
    trimester === 1 ? 'spring' : trimester === 2 ? 'summer' : 'autumn';
  const palette =
    trimester === 1
      ? { primary: '#8fa882', accent: '#b8c9a8', wash: '#e8efe3', fruitBg: '#f4f8f0' }
      : trimester === 2
        ? { primary: '#9a8460', accent: '#d4c4a0', wash: '#f7f2e6', fruitBg: '#faf6ec' }
        : { primary: '#a67d6e', accent: '#dfc7b8', wash: '#f9f0eb', fruitBg: '#fdf5f0' };

  const fruit = FRUIT_BY_WEEK[week] || 'Little One';
  const fruitEmoji = FRUIT_EMOJI[week] || '🌸';
  const babyLength = LENGTH_BY_WEEK[week] || 'Growing';

  const physical =
    trimester === 1 ? pick(T1_PHYSICAL, week) : trimester === 2 ? pick(T2_PHYSICAL, week) : pick(T3_PHYSICAL, week);
  const emotional =
    trimester === 1 ? pick(T1_EMOTIONAL, week) : trimester === 2 ? pick(T2_EMOTIONAL, week) : pick(T3_EMOTIONAL, week);
  const medical =
    trimester === 1 ? pick(T1_MEDICAL, week) : trimester === 2 ? pick(T2_MEDICAL, week) : pick(T3_MEDICAL, week);

  const fruitFact = `Baby is about the size of a ${fruit.toLowerCase()} — roughly ${babyLength} crown-to-rump.`;

  return {
    week,
    trimester,
    season,
    palette,
    fruit,
    fruitEmoji,
    babyLength,
    fruitFact,
    physical,
    emotional,
    medical,
    milestone:
      week === 12
        ? 'End of first trimester — many mamas share the news.'
        : week === 20
          ? 'Halfway bloom — anatomy often reviewed this season.'
          : week === 28
            ? 'Third trimester begins — baby’s lungs mature steadily.'
            : week === 37
              ? 'Early term — baby is considered full enough for birth.'
              : `Week ${week} of your sacred 40-week journey.`,
  };
}

export const TRIMESTER_LABELS = ['First Bloom', 'Golden Summer', 'Autumn Harvest'];

/** Trimester-span holistic body + baby insight for the weekly medical card */
export function getHolisticMedicalInsight(weeksPregnant) {
  const week = Math.min(40, Math.max(1, parseInt(String(weeksPregnant), 10) || 24));
  if (week <= 4) {
    return 'Your body is laying the earliest foundations: hormones rise quickly, energy can swing, and rest becomes medicine. Stay hydrated, keep meals small and steady, and remember that “doing less” is still doing something powerful for growth.';
  }
  if (week <= 12) {
    return 'The first trimester is a full-body rewrite: progesterone can bring fatigue, nausea, and vivid emotions as the placenta forms and your blood volume begins to expand. Prioritize gentle protein, slow mornings, and short walks; a warm bath, ginger tea, and early bedtimes can be surprisingly protective.';
  }
  if (week <= 20) {
    return 'Second-trimester momentum often returns as the placenta takes over and your body settles into new rhythms. You may feel growing round-ligament pulls, skin stretching, and shifts in posture—support with water, magnesium-rich foods, and a belly-friendly pillow; add a few minutes of light movement to keep circulation and mood steady.';
  }
  if (week <= 28) {
    return 'Your baby’s senses and sleep cycles deepen while your body carries more fluid, warmth, and breath-demanding volume. Notice swelling, heartburn, or back tension as signals—not failures. Try smaller meals, side-sleep supports, and gentle hip-openers; choose one daily “soft ritual” (tea, journaling, slow shower) to steady your nervous system.';
  }
  if (week <= 36) {
    return 'The third trimester is strength and surrender at once: ligaments loosen, your center of gravity shifts, and your energy may come in waves. Hydrate early in the day, pace chores into tiny chunks, and practice calm exhale breathing to support sleep and pelvic relaxation; your body is rehearsing labor in quiet ways.';
  }
  return 'These final weeks are about readiness and tenderness: Braxton Hicks, pelvic pressure, and frequent bathroom trips are common as baby settles. Keep your world cozy and simple, choose nourishing snacks, and ask for help without apology; every rested hour is part of your birth preparation.';
}

/** One flowing weekly medical insight — holistic trimester wisdom + week-specific care note */
export function getCombinedWeeklyMedicalInsight(weekInput) {
  const week = Math.min(40, Math.max(1, parseInt(String(weekInput), 10) || 24));
  const { medical } = getBloomWeek(week);
  const holistic = getHolisticMedicalInsight(week);
  const weekNote = medical.endsWith('.') ? medical : `${medical}.`;
  return `${holistic} ${weekNote}`;
}
