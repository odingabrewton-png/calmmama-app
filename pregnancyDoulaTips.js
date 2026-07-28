/**
 * Pregnancy Sanctuary — rotating doula tips.
 * Tips are detailed, trimester-aware, and rotated so mamas don't see the same card set every visit.
 */

function hashSeed(parts) {
  const raw = parts.map((p) => String(p ?? '')).join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(list, seed) {
  const next = [...list];
  const rand = mulberry32(seed);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

export function getPregnancyTrimester(weeksPregnant) {
  const week = parseInt(String(weeksPregnant), 10);
  if (Number.isNaN(week) || week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Soft weekly/daily note shown at the top of Doula Tips. */
export const WEEKLY_DOULA_NOTES = [
  'Your body is already a sanctuary — today’s only job is to notice one kind sensation and stay with it for three breaths.',
  'If the mind spirals into “what if,” gently return to “what is true in my body right now?” Name one sensation without judging it.',
  'Doula wisdom: labor often progresses best when the jaw, hands, and pelvic floor soften together. Practice that softening while you brush your teeth.',
  'Ask for help before you are depleted — early asks protect your nervous system and teach your village how to show up.',
  'You do not need to earn rest. Rest is part of growing a human. A nap counts as prenatal care.',
  'Write one sentence of preference for birth: how you want to feel, not just what you want done to you.',
  'Practice receiving compliments and care without deflecting — it trains the postpartum muscle of letting yourself be held.',
  'Hydration is a comfort tool. Keep a full bottle within reach and sip before you feel thirsty.',
  'Your birth story is allowed to change midstream. Flexibility is strength, not failure.',
  'Tonight, ask your partner or a friend for one concrete act of care — tea, a foot rub, or quiet company — and receive it fully.',
  'When Braxton Hicks or aches arrive, try: exhale longer than you inhale. Longer exhales tell the body it is safe enough to soften.',
  'Doulas watch for the nervous system. Soft lighting, fewer decisions, and a trusted voice can do as much as any gadget.',
];

export const DOULA_TIPS_BY_TRIMESTER = {
  1: [
    {
      id: 't1-nausea-construction',
      title: 'Nausea is construction, not laziness',
      body:
        'First-trimester nausea and fatigue mean your body is building a placenta and shifting hormones at full speed. Rest without apology. Keep water, crackers, and something cold nearby — small, frequent bites often land better than big meals. If you can’t keep fluids down for many hours, call your care team.',
    },
    {
      id: 't1-partner-concrete',
      title: 'Ask for one concrete help each day',
      body:
        'Vague “help more” is hard for partners. Try: dishes tonight, a grocery run, or a protected 20-minute quiet block for you. Specific asks train your village early — the same skill you’ll need postpartum.',
    },
    {
      id: 't1-tiny-nesting',
      title: 'Nest in tiny doses',
      body:
        'Pick one small nesting task this week — wash a few onesies, set a water bottle station, or clear one drawer. Done is enough. Perfection is not required to be ready.',
    },
    {
      id: 't1-protein-snack',
      title: 'Pair carbs with protein when you can',
      body:
        'Many mamas feel steadier when a carb snack includes a little protein or fat (cracker + cheese, toast + nut butter, yogurt). It won’t fix every wave of nausea, but it can soften the crash between them.',
    },
    {
      id: 't1-prenatal-rhythm',
      title: 'Make prenatal visits feel less scary',
      body:
        'Write two questions before each appointment. Bring a support person if hearing “numbers” spikes anxiety. You are allowed to ask for plain language, a slower explanation, or a moment to breathe before decisions.',
    },
    {
      id: 't1-pelvic-rest-soft',
      title: 'Soft belly breathing (even now)',
      body:
        'Sit comfortably, one hand on your belly. Inhale so the hand rises; exhale slowly through pursed lips and unclench your jaw. Thirty seconds, twice a day, builds the calm pathway you’ll want in labor.',
    },
    {
      id: 't1-miscarriage-fear',
      title: 'When fear of loss visits',
      body:
        'Early pregnancy fear is common. You don’t have to “think positive” to be okay — you can hold hope and fear together. If bleeding, severe pain, or dizziness appears, contact your provider. You deserve support either way.',
    },
    {
      id: 't1-smell-triggers',
      title: 'Honor smell and sensory limits',
      body:
        'Strong smells can tip nausea. It’s okay to leave a room, open a window, ask someone to cook outside, or switch detergents. Sensory boundaries are protective, not picky.',
    },
    {
      id: 't1-movement-gentle',
      title: 'Gentle movement over punishment workouts',
      body:
        'A short walk, prenatal stretch, or rocking in a chair counts. Stop if dizzy or breathless beyond comfort. Consistency beats intensity — you’re training circulation and mood, not a race.',
    },
    {
      id: 't1-tell-people',
      title: 'Share the news on your timeline',
      body:
        'You choose who knows and when. Some mamas wait; some need support now. Both are valid. A short script helps: “We’re excited and also taking it day by day — soft check-ins mean a lot.”',
    },
  ],
  2: [
    {
      id: 't2-energy-windows',
      title: 'Use clearer days for birth education',
      body:
        'Second trimester often brings energy windows. Spend them on one class, one chapter, or one birth video — not a marathon to-do list. Small learning sticks better than overwhelm.',
    },
    {
      id: 't2-pelvic-floor-breath',
      title: 'Pelvic floor + breath as a pair',
      body:
        'Practice soft belly breathing while seated. Imagine the inhale creating space; exhale releasing the jaw and buttocks. Avoid chronic clenching — a responsive pelvic floor can lengthen and soften, not only “grip.”',
    },
    {
      id: 't2-preferences-not-rules',
      title: 'Draft preferences, not rigid rules',
      body:
        'Start naming how you want birth to feel: lighting, who is present, music, when to offer pain tools. Preferences guide your team; they are allowed to change if circumstances change.',
    },
    {
      id: 't2-kick-counts-calm',
      title: 'Learn your baby’s pattern calmly',
      body:
        'Once your provider recommends kick awareness, notice your baby’s usual active times. If movement feels markedly different from your normal, call — you know your baby’s rhythm better than a stranger’s chart.',
    },
    {
      id: 't2-side-sleep',
      title: 'Side-sleeping without shame',
      body:
        'Many providers suggest left-side sleep later in pregnancy. Use pillows between knees and behind your back. If you wake on your back, gently roll — waking up “wrong” is not a failure.',
    },
    {
      id: 't2-glucose-appointment',
      title: 'Glucose screening day survival',
      body:
        'Ask your clinic what to expect. Bring water, a sweater, and a gentle distraction. Whatever the result, you still deserve kindness — screening is information, not a moral grade.',
    },
    {
      id: 't2-round-ligament',
      title: 'Round ligament twinges',
      body:
        'Sharp side pulls with sudden movement are common. Slow position changes, support the belly with your hands when standing, and use warmth if it soothes. Severe pain, bleeding, or fever needs a call to your team.',
    },
    {
      id: 't2-sex-intimacy',
      title: 'Intimacy can look different',
      body:
        'Desire may rise, fall, or change shape. Communication beats guessing. If your provider has cleared intimacy, comfort positions and zero pressure matter more than “should.” Affection without expectation still counts.',
    },
    {
      id: 't2-registry-village',
      title: 'Registry as a village map',
      body:
        'Think beyond gadgets: freezer meals, postpartum pads, a water bottle with a straw, lactation support funds. Ask friends for practical help pledges — rides, laundry, overnight presence.',
    },
    {
      id: 't2-mental-load',
      title: 'Offload the mental load weekly',
      body:
        'Once a week, dump every open loop onto paper with your partner: appointments, purchases, fears. Circle one item each. Shared lists reduce the invisible labor that exhausts pregnant nervous systems.',
    },
  ],
  3: [
    {
      id: 't3-pacing',
      title: 'Third trimester pacing',
      body:
        'Shrink the day on purpose. Rest is productive. Pack the hospital/birth bag in layers across evenings so one night is enough. Leave room for last-minute favorites (chapstick, hair tie, charger, snacks).',
    },
    {
      id: 't3-labor-rehearsal',
      title: 'Rehearse comfort tools while calm',
      body:
        'Practice preferred tools before labor: counter-pressure on the low back/hips, warm shower, rocking, birth ball hip circles, breath counts. Muscle memory is easier to find when adrenaline rises.',
    },
    {
      id: 't3-postpartum-village',
      title: 'Map your week-one village now',
      body:
        'Write three people who can bring food, hold baby, or sit with you. Ask them this week — specific asks (“Tuesday lasagna,” “Thursday laundry”) get better yeses than “let me know if you need anything.”',
    },
    {
      id: 't3-511-rule',
      title: 'Know your “when to go / when to call” plan',
      body:
        'Ask your provider for clear guidelines (often based on contraction timing, water breaking, bleeding, or reduced movement). Write them on a card in your bag. Ambiguity raises panic; a plan lowers it.',
    },
    {
      id: 't3-prodromal',
      title: 'If labor starts and stops',
      body:
        'Prodromal or early labor can wax and wane for hours or days. Rest, hydrate, eat light if you can, and use the shower. Call your team if you need reassurance — you are not “bothering” them.',
    },
    {
      id: 't3-induction-talk',
      title: 'Talk through induction calmly ahead of time',
      body:
        'Ask: why recommended, what methods, how long between steps, and how you’ll be supported through waiting. You can request updates in plain language and time to discuss options.',
    },
    {
      id: 't3-perineal-prep',
      title: 'Perineal comfort & pushing prep',
      body:
        'Ask your provider or doula about perineal massage, warm compresses in pushing, and positions that open the pelvis (side-lying, hands-and-knees, supported squat if appropriate). Soft tissue + patience often matter more than force.',
    },
    {
      id: 't3-golden-hour',
      title: 'Protect your golden hour wishes',
      body:
        'Write preferences for skin-to-skin, delayed cord clamping if safe, dim lights, and who cuts the cord. If baby needs extra care, ask how skin-to-skin or presence can still happen as soon as possible.',
    },
    {
      id: 't3-feeding-plan-flexible',
      title: 'Feeding intentions with a soft backup',
      body:
        'Name your hope (breast, bottle, combo) and your backup (donor milk policy questions, formula comfort, lactation consult). Flexibility protects mental health if the first plan needs support.',
    },
    {
      id: 't3-partner-roles',
      title: 'Give your partner a labor job list',
      body:
        'Concrete roles reduce freeze: offer water every 20 minutes, protect the door from chatter, run counter-pressure, speak your preferences to staff, take timed contraction notes. A job is a love language in labor.',
    },
    {
      id: 't3-swelling-warning',
      title: 'Swelling, headaches, vision — don’t tough it out',
      body:
        'Sudden swelling in face/hands, severe headache, vision changes, or upper abdominal pain can be urgent. Call your provider or emergency line. Doulas want you safe more than “tough.”',
    },
    {
      id: 't3-after-birth-body',
      title: 'Prepare for the fourth trimester body',
      body:
        'Stock oversized underwear, heavy pads, peri bottle, witch hazel pads, and easy protein snacks before birth. Night sweats and afterpains surprise many mamas — knowing ahead reduces fear.',
    },
  ],
};

/** Extra tips keyed by approximate week ranges — mixed into rotation when relevant. */
export const DOULA_TIPS_BY_WEEK_BAND = [
  {
    minWeek: 6,
    maxWeek: 12,
    tips: [
      {
        id: 'w6-12-vitamin',
        title: 'Prenatal vitamins that stay down',
        body:
          'If gummies or evening dosing help you keep vitamins down, ask your provider what’s acceptable. Consistency beats a perfect brand you can’t tolerate.',
      },
      {
        id: 'w6-12-commute',
        title: 'Protect energy on work days',
        body:
          'Build micro-rests: sit for calls, snack before meetings, leave buffers between obligations. Pregnancy is a full-time physiological project alongside whatever else you carry.',
      },
    ],
  },
  {
    minWeek: 13,
    maxWeek: 20,
    tips: [
      {
        id: 'w13-20-anatomy',
        title: 'Anatomy scan nerves',
        body:
          'Bring a support person and a written list of questions. It’s okay to ask for results in clear language and time to process before big decisions.',
      },
      {
        id: 'w13-20-clothes',
        title: 'Clothes that don’t fight you',
        body:
          'Soft waistbands and layers reduce sensory irritation. Comfortable shoes matter more now — balance and swelling shift week to week.',
      },
    ],
  },
  {
    minWeek: 21,
    maxWeek: 27,
    tips: [
      {
        id: 'w21-27-heartburn',
        title: 'Heartburn without all-night upright sitting',
        body:
          'Smaller evening meals, elevating the head of the bed, and waiting a bit before lying down help many mamas. Ask your provider before new antacids.',
      },
      {
        id: 'w21-27-baby-moon',
        title: 'A tiny babymoon at home',
        body:
          'One intentionally soft evening — favorite show, takeout, phones down — counts. Connection before newborn logistics arrive is a gift to your relationship.',
      },
    ],
  },
  {
    minWeek: 28,
    maxWeek: 33,
    tips: [
      {
        id: 'w28-33-rhogam',
        title: 'Rhogam / labs week questions',
        body:
          'If you’re Rh-negative or due for third-trimester labs, ask what to expect and how you’ll feel after. Knowledge shrinks anticipatory dread.',
      },
      {
        id: 'w28-33-hospital-tour',
        title: 'Tour the space (even virtually)',
        body:
          'Knowing where parking, triage, and the bathroom are lowers labor-day adrenaline. Note where partners can get ice and snacks without leaving you long.',
      },
    ],
  },
  {
    minWeek: 34,
    maxWeek: 37,
    tips: [
      {
        id: 'w34-37-gbs',
        title: 'GBS swab without shame',
        body:
          'Group B strep screening is common. A positive result usually means antibiotics in labor — not a reflection of hygiene or worth. Ask how it will be handled at your birth place.',
      },
      {
        id: 'w34-37-car-seat',
        title: 'Install the car seat before the scramble',
        body:
          'Install and check the infant seat now. Many fire stations or certified technicians can verify fit. One less decision when you’re sore and holding a newborn.',
      },
    ],
  },
  {
    minWeek: 38,
    maxWeek: 42,
    tips: [
      {
        id: 'w38-42-waiting',
        title: 'The waiting week is a real trimester of its own',
        body:
          'Due dates are estimates. Fill slow days with short walks, baths, naps, and connection — not constant “labor tricks” that spike cortisol. Check in with your provider about monitoring as you pass milestones.',
      },
      {
        id: 'w38-42-membrane',
        title: 'Membrane sweeps & interventions — ask the why',
        body:
          'Before any procedure, ask benefits, risks, alternatives, and what happens if you wait. Informed consent is a doula cornerstone; you are allowed to pause and think.',
      },
    ],
  },
];

export function buildDoulaTipPool(weeksPregnant) {
  const trimester = getPregnancyTrimester(weeksPregnant);
  const week = parseInt(String(weeksPregnant), 10);
  const safeWeek = Number.isFinite(week) ? week : trimester === 1 ? 8 : trimester === 2 ? 20 : 34;

  const pool = [...(DOULA_TIPS_BY_TRIMESTER[trimester] || DOULA_TIPS_BY_TRIMESTER[1])];

  DOULA_TIPS_BY_WEEK_BAND.forEach((band) => {
    if (safeWeek >= band.minWeek && safeWeek <= band.maxWeek) {
      band.tips.forEach((tip) => {
        if (!pool.some((existing) => existing.id === tip.id)) {
          pool.push(tip);
        }
      });
    }
  });

  return { trimester, week: safeWeek, pool };
}

/**
 * Rotate which tips a mama sees.
 * @param {{ weeksPregnant?: number|string, date?: Date, rotationOffset?: number, count?: number }} opts
 */
export function getRotatingDoulaTips({
  weeksPregnant,
  date = new Date(),
  rotationOffset = 0,
  count = 4,
} = {}) {
  const { trimester, week, pool } = buildDoulaTipPool(weeksPregnant);
  const dayOfYear = getDayOfYear(date);
  const seed = hashSeed([dayOfYear, trimester, week, Math.floor(rotationOffset)]);
  const shuffled = shuffleWithSeed(pool, seed);
  const tips = shuffled.slice(0, Math.min(count, shuffled.length));

  const noteSeed = hashSeed([dayOfYear, 'note', Math.floor(rotationOffset)]);
  const weeklyNote = WEEKLY_DOULA_NOTES[noteSeed % WEEKLY_DOULA_NOTES.length];

  return {
    trimester,
    week,
    weeklyNote,
    tips,
    totalAvailable: pool.length,
  };
}
