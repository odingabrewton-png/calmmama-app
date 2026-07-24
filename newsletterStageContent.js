/**
 * Stage-specific weekly newsletter content blocks + rewards footer helpers.
 * CommonJS for Node (weeklyNewsletter / Vercel cron).
 */

const REWARD_TIERS = [
  {
    id: 'village_sister',
    points: 500,
    title: 'Village Sister 🌸',
    perk: '10% OFF Merch',
    code: 'VILLAGE10',
  },
  {
    id: 'sanctuary_queen',
    points: 1000,
    title: 'Sanctuary Queen 👑',
    perk: '20% OFF Merch',
    code: 'SANCTUARY20',
  },
  {
    id: 'founding_legend',
    points: 3000,
    title: 'Founding Legend 🏆',
    perk: '30% OFF + Free Shipping',
    code: 'LEGEND30',
  },
];

/** Week → fruit/veggie size (newsletter-friendly subset). */
const BABY_SIZE_BY_WEEK = {
  4: { emoji: '🌱', name: 'Poppy seed', length: '0.04 in' },
  6: { emoji: '🫐', name: 'Sweet pea', length: '0.25 in' },
  8: { emoji: '🍇', name: 'Raspberry', length: '0.6 in' },
  10: { emoji: '🍓', name: 'Strawberry', length: '1.2 in' },
  12: { emoji: '🍋', name: 'Lime', length: '2.1 in' },
  14: { emoji: '🍋', name: 'Lemon', length: '3.4 in' },
  16: { emoji: '🥑', name: 'Avocado', length: '4.6 in' },
  18: { emoji: '🌶️', name: 'Bell pepper', length: '5.6 in' },
  20: { emoji: '🍌', name: 'Banana', length: '6.5 in' },
  22: { emoji: '🥭', name: 'Papaya', length: '10.9 in' },
  24: { emoji: '🌽', name: 'Ear of corn', length: '11.8 in' },
  26: { emoji: '🥬', name: 'Head of lettuce', length: '14 in' },
  28: { emoji: '🍆', name: 'Eggplant', length: '14.8 in' },
  30: { emoji: '🥬', name: 'Cabbage', length: '15.7 in' },
  32: { emoji: '🥥', name: 'Coconut', length: '16.7 in' },
  34: { emoji: '🍈', name: 'Cantaloupe', length: '17.7 in' },
  36: { emoji: '🥬', name: 'Romaine lettuce', length: '18.7 in' },
  38: { emoji: '🎃', name: 'Small pumpkin', length: '19.6 in' },
  40: { emoji: '🍉', name: 'Watermelon', length: '20.2 in' },
};

const TRIMESTER_SURVIVAL_TIPS = {
  1: [
    'Keep crackers by the bed and rise slowly — an empty stomach often wakes nausea first.',
    'Short walks after meals can settle queasiness better than pushing through at your desk.',
    'Permission slip: cancel one non-essential plan this week. First-trimester rest is productive.',
  ],
  2: [
    'Hydrate before you feel thirsty — many “headaches” are just quiet dehydration.',
    'Side-sleep with a pillow between your knees to ease growing-ligament pulls.',
    'Schedule one joy appointment that is not medical: a bath, a call, a soft grocery run alone.',
  ],
  3: [
    'Pack your hospital bag in layers you can grab half-asleep — future-you will thank you.',
    'Practice asking for help out loud once this week, even for something tiny.',
    'When Braxton Hicks or anxiety spikes, lengthen your exhale — out longer than in.',
  ],
};

const REGISTRY_SPOTLIGHTS = [
  {
    title: 'Organic Muslin Swaddle Set (4-Pack)',
    tip: 'Lightweight muslin for contact naps and spit-up surprises — size up if you can.',
    emoji: '🧸',
    affiliateUrl: 'https://www.amazon.com/s?k=organic+muslin+swaddle+set',
  },
  {
    title: 'Blackout Nursery Curtains (Thermal)',
    tip: 'Village mamas swear by easy one-handed pulls for nap protection.',
    emoji: '🌙',
    affiliateUrl: 'https://www.amazon.com/s?k=blackout+nursery+curtains',
  },
  {
    title: 'Postpartum Recovery Care Basket',
    tip: 'Stock peri bottle, mesh undies, and stool softener before baby arrives.',
    emoji: '🌸',
    affiliateUrl: 'https://www.amazon.com/s?k=postpartum+recovery+kit',
  },
  {
    title: 'Sound Machine + Night Light Duo',
    tip: 'White noise + dim amber light for middle-of-night feeds.',
    emoji: '✨',
    affiliateUrl: 'https://www.amazon.com/s?k=baby+sound+machine+night+light',
  },
  {
    title: 'Hospital-Grade Electric Breast Pump Kit',
    tip: 'Ask insurance first — many plans cover a pump fully.',
    emoji: '🍼',
    affiliateUrl: 'https://www.amazon.com/s?k=hospital+grade+breast+pump',
  },
  {
    title: 'Supportive Nursing Pillow',
    tip: 'Saves shoulders during marathon feeds — look for washable covers.',
    emoji: '🤍',
    affiliateUrl: 'https://www.amazon.com/s?k=nursing+pillow',
  },
  {
    title: 'Portable White Noise + Carrier Bundle',
    tip: 'A soft carrier + hush sound helps toddler-to-newborn transitions.',
    emoji: '🧺',
    affiliateUrl: 'https://www.amazon.com/s?k=baby+carrier+newborn',
  },
  {
    title: 'Mama Hydration Tumbler (Straw Lid)',
    tip: 'One-handed sipping during feeds — keep it filled by the nursing chair.',
    emoji: '🥤',
    affiliateUrl: 'https://www.amazon.com/s?k=insulated+tumbler+straw+lid',
  },
];

const POSTPARTUM_MILESTONES = [
  { age: 'Newborn', note: 'Week 1–2: tiny wake windows, huge heart work. Feeding and healing are the whole curriculum.' },
  { age: '0–3 months', note: 'Social smiles may bloom soon — every snuggle is wiring safety into their nervous system.' },
  { age: '3–6 months', note: 'More alert play and longer stretches of sleep for some babies — celebrate micro-wins, not averages.' },
  { age: '6–9 months', note: 'Sitting, reaching, and curious mouths everywhere — babyproof one drawer this week, not the whole house.' },
  { age: '9–12 months', note: 'Cruising, waving, and big feelings — your calm presence is still their favorite classroom.' },
  { age: '12–18 months', note: 'First steps and first “no’s” — independence and clinginess can share the same afternoon.' },
  { age: '18–24 months', note: 'Language explosions and boundary testing — narrate feelings; it teaches emotional vocabulary.' },
  { age: '2–3 years', note: 'Big imagination, bigger opinions — offer two good choices to keep power struggles soft.' },
];

const POSTPARTUM_SNACKS = [
  {
    title: '5-Minute Peanut Butter Banana Toast',
    recipe: 'Toast whole-grain bread, smear peanut butter, top with banana coins + cinnamon. Protein + potassium in under five minutes.',
  },
  {
    title: 'Greek Yogurt Berry Cup',
    recipe: 'Scoop plain Greek yogurt, add frozen berries (they thaw as you eat), drizzle honey. Keep spoons by the fridge for one-handed nights.',
  },
  {
    title: 'Cheese + Apple Plate',
    recipe: 'Slice an apple, add cheddar cubes and a handful of almonds. No cooking, steady blood sugar for nursing or pumping.',
  },
  {
    title: 'Warm Oat Mug',
    recipe: 'Microwave oats + milk 90 seconds, stir in nut butter. Sit while it cools — that pause counts as care.',
  },
  {
    title: 'Hummus + Pretzel Scoop',
    recipe: 'Single-serve hummus cup + pretzels or carrots. Keep two packs in the diaper bag for park or appointment days.',
  },
  {
    title: 'Avocado Egg Mash',
    recipe: 'Mash half an avocado with a soft-boiled egg and salt. Eat with a spoon straight from the bowl — village approved.',
  },
  {
    title: 'Cottage Cheese Peach Bowl',
    recipe: 'Cottage cheese + canned peaches in juice (drained) + chia sprinkle. Soft, cold, and ready in two minutes.',
  },
  {
    title: 'Date + Nut Butter Bites',
    recipe: 'Split two Medjool dates, fill with almond butter. Natural sugar + fat for the 3 a.m. dip.',
  },
];

const MOM_BRAIN_NOTES = [
  'Losing your keys while holding the baby is not a character flaw — it is a brain reallocating bandwidth to keep a human alive.',
  'Forgetting why you walked into a room is classic postpartum cognition. Write the thought down; shame is optional.',
  '“Mom brain” is often sleep debt + vigilance, not brokenness. You are tracking tiny cues all day — of course grocery lists slip.',
  'If you replay a conversation three times, that is a nervous system looking for safety. Soft distraction still counts as regulation.',
  'Misplacing your coffee is a rite of passage. Warm it up again. You are allowed a redo on small things.',
  'Comparing your memory to pre-baby you is unfair math. This season asks different brilliance.',
  'You can be highly capable and still need sticky notes on the door. Systems are self-respect, not failure.',
  'Foggy days do not cancel wise days. Both can live in the same week.',
];

const HYBRID_SURVIVAL_HACKS = [
  {
    title: 'Dual-Duty Survival Hack',
    body: 'Park a “both of us” snack bin by the couch: toddler pouch + your crackers/water. When they climb into your lap, you are already resourced.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'Use nap time as body time, not catch-up time twice a week — lie down with feet up even for ten minutes while baby-in-belly rests with you.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'One-room rule: toys live in a basket you can kick shut. Visual calm lowers toddler chaos and pregnancy overstimulation together.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'Batch “yes” energy: say yes to two toddler requests before breakfast, then protect a quiet sit with tea. Predictable yeses reduce power struggles.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'Stroller walks double as contraction-friendly movement and toddler outdoor time — pack a snack, not a perfect itinerary.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'When both need you, narrate: “I am holding you and growing your sibling.” Toddlers settle when the story includes them.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'Keep a “hospital-ready” tote and a “park-ready” tote separately so packing never steals evening calm.',
  },
  {
    title: 'Dual-Duty Survival Hack',
    body: 'Trade one chore for floor time: sit on the rug while they play — pregnancy rest + toddler connection in the same block.',
  },
];

const BIG_SIBLING_TIPS = [
  'Practice “gentle belly” hands with a doll this week — make it a game, not a lecture.',
  'Let your toddler “pack” a small gift for baby (a board book or soft toy). Ownership softens jealousy later.',
  'Read one big-sibling story at bedtime for seven nights — repetition builds safety.',
  'Offer a special job: “You can bring mama water.” Purpose beats displacement.',
  'Keep one ritual that stays only theirs after baby arrives (same Saturday pancake, same song). Continuity is medicine.',
  'Use “our family is growing” language instead of “you will share mama.” Growth feels expansive; sharing can feel like loss.',
  'Visit friends with babies if you can — familiarity reduces the shock of newborn sounds and smells.',
  'Take a photo of just the two of you this week. Frame it before baby arrives as a promise of unbroken belonging.',
];

function clampWeek(weeksPregnant) {
  const week = parseInt(String(weeksPregnant), 10);
  if (!Number.isFinite(week)) return 24;
  return Math.min(40, Math.max(4, week));
}

function trimesterFromWeek(week) {
  if (week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

function nearestBabySize(week) {
  const keys = Object.keys(BABY_SIZE_BY_WEEK)
    .map(Number)
    .sort((a, b) => a - b);
  let best = keys[0];
  for (const key of keys) {
    if (Math.abs(key - week) < Math.abs(best - week)) best = key;
  }
  return { week: best, ...BABY_SIZE_BY_WEEK[best] };
}

function pickFrom(list, seed) {
  if (!list?.length) return null;
  const index = Math.abs(Number(seed) || 0) % list.length;
  return list[index];
}

function normalizeAgeLabel(babyAge) {
  const raw = String(babyAge || '').trim().toLowerCase();
  if (!raw || raw.includes('newborn')) return 'Newborn';
  if (raw.includes('0-3') || raw.includes('0–3') || raw.includes('3 month')) return '0–3 months';
  if (raw.includes('3-6') || raw.includes('3–6') || raw.includes('6 month')) return '3–6 months';
  if (raw.includes('6-9') || raw.includes('6–9') || raw.includes('9 month')) return '6–9 months';
  if (raw.includes('9-12') || raw.includes('9–12') || raw.includes('12 month') || raw.includes('1 year')) {
    return '9–12 months';
  }
  if (raw.includes('12-18') || raw.includes('12–18') || raw.includes('18 month')) return '12–18 months';
  if (raw.includes('18-24') || raw.includes('18–24') || raw.includes('24 month') || raw.includes('2 year')) {
    return '18–24 months';
  }
  if (raw.includes('toddler') || raw.includes('2-3') || raw.includes('3 year')) return '2–3 years';
  return '0–3 months';
}

function getNextTierProgress(points) {
  const total = Math.max(0, Number(points) || 0);
  const thresholds = REWARD_TIERS.map((tier) => tier.points);
  const next = REWARD_TIERS.find((tier) => total < tier.points) || null;
  const prevThreshold =
    [...thresholds].reverse().find((mark) => mark <= total) || 0;

  if (!next) {
    const last = REWARD_TIERS[REWARD_TIERS.length - 1];
    return {
      points: total,
      nextTier: null,
      nextTitle: 'All merch tiers unlocked',
      nextPerk: last.perk,
      progress: 1,
      pointsToNext: 0,
      nextThreshold: last.points,
    };
  }

  const span = Math.max(1, next.points - prevThreshold);
  const progress = Math.min(1, Math.max(0, (total - prevThreshold) / span));
  return {
    points: total,
    nextTier: next,
    nextTitle: next.title,
    nextPerk: next.perk,
    progress,
    pointsToNext: Math.max(0, next.points - total),
    nextThreshold: next.points,
  };
}

function buildPregnantStageBlocks({ weeksPregnant, weekSeed = 0 } = {}) {
  const week = clampWeek(weeksPregnant);
  const size = nearestBabySize(week);
  const trimester = trimesterFromWeek(week);
  const tip = pickFrom(TRIMESTER_SURVIVAL_TIPS[trimester], weekSeed + trimester);
  const registry = pickFrom(REGISTRY_SPOTLIGHTS, weekSeed + week);

  return [
    {
      eyebrow: 'Baby Size Visual',
      title: `${size.emoji} Size of a ${size.name}`,
      body: `Around week ${week}, baby is about the size of a ${size.name.toLowerCase()} (${size.length}). A sweet reminder of how much is blooming within you.`,
    },
    {
      eyebrow: 'Trimester Survival Tip',
      title: `Trimester ${trimester} soft strategy`,
      body: tip,
    },
    {
      eyebrow: 'Registry Item Spotlight',
      title: `${registry.emoji} ${registry.title}`,
      body: registry.tip,
      ctaLabel: 'View on Amazon →',
      ctaUrl: registry.affiliateUrl,
    },
  ];
}

function buildPostpartumStageBlocks({ babyAge, weekSeed = 0 } = {}) {
  const ageLabel = normalizeAgeLabel(babyAge);
  const milestone =
    POSTPARTUM_MILESTONES.find((row) => row.age === ageLabel) || POSTPARTUM_MILESTONES[1];
  const snack = pickFrom(POSTPARTUM_SNACKS, weekSeed);
  const validation = pickFrom(MOM_BRAIN_NOTES, weekSeed + 3);

  return [
    {
      eyebrow: 'Age / Milestone Note',
      title: milestone.age,
      body: milestone.note,
    },
    {
      eyebrow: '5-Minute Postpartum Snack',
      title: snack.title,
      body: snack.recipe,
    },
    {
      eyebrow: 'Mom Brain Validation',
      title: 'You are not broken — you are overloaded with love labor',
      body: validation,
    },
  ];
}

function buildHybridStageBlocks({ weekSeed = 0 } = {}) {
  const hack = pickFrom(HYBRID_SURVIVAL_HACKS, weekSeed);
  const sibling = pickFrom(BIG_SIBLING_TIPS, weekSeed + 5);

  return [
    {
      eyebrow: 'Dual-Duty Survival Hack',
      title: 'Toddler + pregnancy, same hour',
      body: hack.body,
    },
    {
      eyebrow: 'Big Sibling Prep Tip',
      title: 'Help them feel included, not replaced',
      body: sibling,
    },
  ];
}

function buildStageContentBlocks({
  stage = 'pregnant',
  weeksPregnant,
  babyAge,
  weekSeed = 0,
} = {}) {
  const key = String(stage || 'pregnant').toLowerCase();
  if (key === 'hybrid') return buildHybridStageBlocks({ weekSeed });
  if (key === 'postpartum') return buildPostpartumStageBlocks({ babyAge, weekSeed });
  return buildPregnantStageBlocks({ weeksPregnant, weekSeed });
}

module.exports = {
  REWARD_TIERS,
  getNextTierProgress,
  buildStageContentBlocks,
  buildPregnantStageBlocks,
  buildPostpartumStageBlocks,
  buildHybridStageBlocks,
  clampWeek,
  normalizeAgeLabel,
};
