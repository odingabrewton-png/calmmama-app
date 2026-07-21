/**
 * Mama-friend notes for Soul Sanctuary venting entries.
 * Warm, conversational feedback — attached per timeline card.
 */

const MARKERS = {
  pregnancyBody: {
    keywords: [
      'kick',
      'bump',
      'trimester',
      'pregnant',
      'pregnancy',
      'contractions',
      'braxton',
      'nausea',
      'morning sickness',
      'heartburn',
      'swollen',
      'round ligament',
      'fundal',
    ],
    notes: [
      "Girl, pregnancy is a whole job nobody clocks you for. That ache you named? Real. You're not being dramatic — your body is doing something huge.",
      "I hear you. Growing a person while trying to stay upright is a lot. Soften your jaw for a second… you've been bracing all day.",
      "If something feels new or sharp, text your care team — they would rather hear from you early. And drink a little water when you can. Tiny care still counts.",
    ],
  },
  recoveryPain: {
    keywords: [
      'pain',
      'bleed',
      'stitch',
      'c-section',
      'cesarean',
      'pelvic',
      'sore',
      'ache',
      'healing',
      'cramp',
    ],
    notes: [
      "Healing while mothering is unfair work. Your pain isn't something to apologize for — it's your body asking for gentleness.",
      "Heat or ice for twenty minutes if it helps, and please don't tough through a sudden spike alone. Call your people if it feels off.",
      "Keep a snack and water within reach. Your body is repairing and still showing up. That deserves softness, not guilt.",
    ],
  },
  feeding: {
    keywords: [
      'feed',
      'latch',
      'bottle',
      'milk',
      'hungry',
      'spit',
      'reflux',
      'cluster',
      'formula',
      'breast',
    ],
    notes: [
      "Feeding can make you feel like you're failing when you're actually showing up again and again. Your baby feels that care — even on the messy ones.",
      "Breathe before the next latch or bottle. Calm hands help both of you. And hydrate yourself too, mama — you matter in this equation.",
      "You don't have to perfect every feed. Connection over perfection. I mean that.",
    ],
  },
  fatigue: {
    keywords: [
      'tired',
      'exhausted',
      'sleep',
      'no sleep',
      'drained',
      'fatigue',
      'wiped',
      'empty',
      'nap',
      'insomnia',
      'running on',
      'burned out',
      'burnt out',
    ],
    notes: [
      "Running on empty and still loving this hard? That's devotion — and it costs you. Ten minutes horizontal with your phone face-down is not laziness. It's medicine.",
      "I see how wrung out you are. Ask someone for one specific thing tonight — dishes, a bottle wash, holding baby. Specific beats vague.",
      "Lower the bar on one thing only. Relief counts even when it's small. You don't have to earn rest.",
    ],
  },
  emotional: {
    keywords: [
      'anxious',
      'lonely',
      'overwhelm',
      'overwhelming',
      'cry',
      'scared',
      'sad',
      'angry',
      'guilt',
      'worry',
      'dread',
      'numb',
      'hopeless',
      'loud',
      'too much',
      'validate',
    ],
    notes: [
      "Big feelings in this season are so normal, even when nobody talks about them. Naming it out loud was brave — I'm right here with you in it.",
      "You can love your baby deeply and still ache inside. Both can be true. Tonight can be a soft landing: dim light, warm drink, unfinished list.",
      "When the day felt loud from the jump, needing quiet validation tonight makes complete sense. Breathe in for four, out for six if you can. I'm not rushing you.",
    ],
  },
  partnerSupport: {
    keywords: [
      'partner',
      'husband',
      'wife',
      'spouse',
      'alone',
      'unsupported',
      'argue',
      'fight',
      'distance',
    ],
    notes: [
      "Feeling unseen by your person on top of everything else hits different. Wanting backup isn't needy — it's human.",
      "Ask for one concrete thing, not the whole mountain: \"Can you take bedtime tonight?\" Specific is kinder to both of you.",
      "You shouldn't have to mother alone in a two-person home. Naming the need isn't nagging. It's honesty.",
    ],
  },
};

const MOOD_NOTES = {
  happy:
    "I'm smiling with you. Hold onto this little bright spot — you earned every bit of it.",
  stressed:
    "I hear the pressure in what you wrote. One breath, one moment. You're doing better than you think.",
  overwhelmed:
    "That weight is real. You don't have to carry the whole world tonight — just the next gentle step.",
  exhausted:
    "Tired isn't weak. You've given enough today. Rest is how love refuels, mama.",
  grateful:
    "I love that you named something good. Keep that little glow close — it's medicine for harder days too.",
  anxious:
    "Anxious thoughts get loud, but they aren't the whole house. You're still home here. I've got you.",
  hopeful:
    "Hope is brave work. I'm cheering quietly for whatever you're looking toward.",
  lonely:
    "Loneliness in motherhood is more common than people admit. You deserved to be seen tonight — and you are.",
};

const GENERIC_NOTES = [
  "Thank you for trusting me with that. You don't have to polish anything here — raw is welcome.",
  "I read every word. Nothing you shared is too small or too messy for this corner of the village.",
  "You showed up for yourself by writing this. That alone counts. I'm proud of you for that.",
  "I'm glad these words landed somewhere safe. Sit with that for a second — you did something kind for your own heart.",
];

const SOFT_NUDGES = [
  "If it helps: unclench your shoulders on the next exhale. Tiny, but your body notices.",
  "Maybe name one tiny thing that went okay today — even \"we both ate once.\"",
  "Be as soft with yourself as you are with your little one. You deserve that same gentleness.",
  "No rush to fix anything. You already did something brave by saying it out loud.",
];

let usedKeys = new Set();

function pickUnused(pool, key) {
  const available = pool.filter((_, i) => !usedKeys.has(`${key}-${i}`));
  const list = available.length ? available : pool;
  const pick = list[Math.floor(Math.random() * list.length)];
  usedKeys.add(`${key}-${pool.indexOf(pick)}`);
  if (usedKeys.size > 80) usedKeys = new Set();
  return pick;
}

export function detectVentingMarkers(text) {
  const lower = (text || '').toLowerCase();
  const hits = [];
  for (const [id, topic] of Object.entries(MARKERS)) {
    if (topic.keywords.some((w) => lower.includes(w))) hits.push(id);
  }
  return hits;
}

function firstName(mamaName) {
  const raw = (mamaName || 'Mama').trim().split(/\s+/)[0];
  return raw || 'Mama';
}

export function buildVentingGuidance({ text, moodId, moodLabel, priorEntries = [], mamaName = 'Mama' }) {
  const markers = detectVentingMarkers(text);
  const primary = markers[0] || null;
  const topic = primary ? MARKERS[primary] : null;
  const name = firstName(mamaName);

  const mainNote = topic
    ? pickUnused(topic.notes, `${primary}-note`)
    : pickUnused(GENERIC_NOTES, 'generic-note');

  const moodNote = MOOD_NOTES[moodId] || MOOD_NOTES.grateful;
  const nudge = pickUnused(SOFT_NUDGES, 'nudge');

  let patternNote = '';
  const recentSameMood = priorEntries.filter(
    (e) => e.moodId === moodId && Date.now() - new Date(e.timestamp).getTime() < 7 * 86400000
  ).length;
  if (recentSameMood >= 2) {
    const feeling = (moodLabel || 'feeling').replace(/[^\w\s]/g, '').trim() || 'feeling';
    patternNote = ` I've noticed this ${feeling.toLowerCase()} popping up more than once this week — your heart keeps asking to be held, and I'm holding it with you.`;
  }

  const body = `Hey ${name} — ${mainNote}${patternNote}\n\n${moodNote}\n\n${nudge}`;

  return {
    title: 'A note from a mama friend',
    body,
    markers,
    moodId,
    timestamp: new Date().toISOString(),
  };
}

export function createVentingEntry({ text, mood, guidance }) {
  return {
    id: `vent-${Date.now()}`,
    text: text.trim(),
    moodId: mood.id,
    moodLabel: mood.label,
    timestamp: new Date().toISOString(),
    guidance: {
      title: guidance.title,
      body: guidance.body,
      markers: guidance.markers,
    },
  };
}
