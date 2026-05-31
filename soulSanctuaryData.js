/** Soul Sanctuary moods, dialogue, derived assistance, and cloud assets */

export const CLOUD_IMAGES = {
  sage: require('./assets/soul-cloud-sage.png'),
  peach: require('./assets/soul-cloud-peach.png'),
  lavender: require('./assets/soul-cloud-lavender.png'),
};

export const SANCTUARY_MOODS = [
  { id: 'happy', label: 'Happy 🌻', cloudKey: 'sage' },
  { id: 'stressed', label: 'Stressed 🌧️', cloudKey: 'lavender' },
  { id: 'overwhelmed', label: 'Overwhelmed 🌊', cloudKey: 'lavender' },
  { id: 'exhausted', label: 'Exhausted ☕', cloudKey: 'peach' },
  { id: 'grateful', label: 'Grateful ✨', cloudKey: 'peach' },
];

const OPENING_LINES = {
  happy:
    "Oh mama, I'm listening. What's blooming beautifully in your heart today? 🌻",
  stressed:
    "Oh mama, I'm listening. What's pressing on you right now? You don't have to hold it alone. 🌧️",
  overwhelmed:
    "Oh mama, I'm listening. What's heavy on your mind today? Let it all out — I'm right here. 🌊",
  exhausted:
    "Oh mama, I'm listening. How tired is your beautiful soul? Rest your words here with me. ☕",
  grateful:
    "Oh mama, I'm listening. What gratitude is glowing in you today? ✨",
};

const FOLLOW_UPS = {
  happy: [
    'That joy matters so much. Keep collecting these little sunbeams — they are medicine for hard days too.',
    'I can feel your smile through your words. Your baby is lucky to grow inside all this love.',
  ],
  stressed: [
    'Thank you for trusting me with that. One breath, one moment — you are doing better than you think.',
    'Your feelings are valid. Would it help to name just one tiny thing you can set down tonight?',
  ],
  overwhelmed: [
    "I'm not going anywhere. You don't have to carry the whole world — just the next small, gentle step.",
    'Your courage in sharing this is already healing. Let your shoulders drop; I have got you.',
  ],
  exhausted: [
    'You have given enough today. Rest is holy work, not laziness. I am proud of you for being honest.',
    'If I could, I would bring you tea and silence. For now, let my words hold you like a soft blanket.',
  ],
  grateful: [
    'Holding this gratitude with you. These moments become anchors when the waves get high.',
    'Your heart is teaching your little one what love sounds like. This is beautiful, mama.',
  ],
};

const DERIVED_TIPS = {
  happy: 'Try a five-minute nesting ritual: one song, one deep breath, one thing you are proud of today.',
  stressed: 'Grounding tip: name five things you can see, four you can touch — bring your nervous system back home.',
  overwhelmed: 'Micro-step method: write only the very next kind thing — not the whole list, just one.',
  exhausted: 'Permission slip: drink water, dim one light, and let "good enough" be sacred for the next hour.',
  grateful: 'Anchor this feeling: screenshot your words or whisper them to your baby — memory becomes medicine.',
};

const DERIVED_AFFIRMATIONS = {
  happy: 'Your light is not too much — it is exactly what your village needs to see.',
  stressed: 'Storms pass, mama. You are still the safe harbor your little one is sailing toward.',
  overwhelmed: 'You are not failing — you are human, loving hard in a heavy season.',
  exhausted: 'Tired is not weak. Rest is how love refuels itself.',
  grateful: 'Gratitude is proof your heart still knows how to bloom — even after hard days.',
};

const KEYWORD_MOOD_HINTS = [
  { words: ['tired', 'sleep', 'exhausted', 'drained'], mood: 'exhausted' },
  { words: ['grateful', 'thankful', 'blessed', 'joy'], mood: 'grateful' },
  { words: ['happy', 'excited', 'nest', 'glow'], mood: 'happy' },
  { words: ['overwhelm', 'too much', 'cant', "can't", 'drowning'], mood: 'overwhelmed' },
  { words: ['stress', 'anxious', 'worry', 'panic'], mood: 'stressed' },
];

export function getFriendOpeningLine(moodId) {
  return OPENING_LINES[moodId] || OPENING_LINES.grateful;
}

export function getFriendFollowUp(moodId, mamaName = 'Mama') {
  const pool = FOLLOW_UPS[moodId] || FOLLOW_UPS.grateful;
  const name = (mamaName || 'Mama').trim().split(/\s+/)[0];
  const line = pool[Math.floor(Math.random() * pool.length)];
  return line.replace(/\bmama\b/gi, name);
}

export function inferMoodFromText(text, fallbackMoodId = 'grateful') {
  const lower = (text || '').toLowerCase();
  for (const hint of KEYWORD_MOOD_HINTS) {
    if (hint.words.some((w) => lower.includes(w))) return hint.mood;
  }
  return fallbackMoodId;
}

export function getDerivedAssistance(moodId, journalText = '') {
  const derivedMood = inferMoodFromText(journalText, moodId);
  return {
    derivedMood,
    tip: DERIVED_TIPS[derivedMood] || DERIVED_TIPS.grateful,
    affirmation: DERIVED_AFFIRMATIONS[derivedMood] || DERIVED_AFFIRMATIONS.grateful,
  };
}
