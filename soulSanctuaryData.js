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
  { id: 'anxious', label: 'Anxious 🦋', cloudKey: 'lavender' },
  { id: 'hopeful', label: 'Hopeful 🌅', cloudKey: 'sage' },
  { id: 'lonely', label: 'Lonely 🌙', cloudKey: 'peach' },
];

const OPENING_LINES = {
  happy:
    "Hey love — I'm right here with you. What's blooming beautifully in your heart today? 🌻",
  stressed:
    "Hey love — no rush, no fixing. What's pressing on you right now? You don't have to hold it alone. 🌧️",
  overwhelmed:
    "Hey love — I can feel the weight from here. What's heavy on your mind? Pour it out; I'm not going anywhere. 🌊",
  exhausted:
    "Hey love — how tired is your beautiful soul? Rest your words here with me. No performance needed. ☕",
  grateful:
    "Hey love — I love when you land here with gratitude. What's glowing in you today? ✨",
  anxious:
    "Hey love — my heart is with yours. What is your mind spinning on? Say it out loud here; it loses some of its grip. 🦋",
  hopeful:
    "Hey love — hope is brave. What are you quietly wishing for or looking forward to? 🌅",
  lonely:
    "Hey love — you are not invisible here. What feels lonely tonight? I'll sit in it with you. 🌙",
};

const FOLLOW_UPS = {
  happy: [
    'That joy matters so much. Keep collecting these little sunbeams — they are medicine for hard days too.',
    'I can feel your smile through your words. Your little one is lucky to be held by a heart this warm.',
    'Thank you for letting me witness this brightness. Savor it — you earned this moment.',
  ],
  stressed: [
    'Thank you for trusting me with that. One breath, one moment — you are doing better than you think.',
    'Your feelings are valid. Would it help to name just one tiny thing you can set down tonight?',
    'I hear the pressure in what you wrote. You are allowed to be human and still be enough.',
  ],
  overwhelmed: [
    "I'm not going anywhere. You don't have to carry the whole world — just the next small, gentle step.",
    'Your courage in sharing this is already healing. Let your shoulders drop; I have got you.',
    'When everything feels like too much, shrinking the list to one kind thing is not giving up — it is wisdom.',
  ],
  exhausted: [
    'You have given enough today. Rest is holy work, not laziness. I am proud of you for being honest.',
    'If I could, I would bring you tea and silence. For now, let my words hold you like a soft blanket.',
    'Running on empty and still showing up? That is fierce love. Please let something be unfinished tonight.',
  ],
  grateful: [
    'Holding this gratitude with you. These moments become anchors when the waves get high.',
    'Your heart is teaching your little one what love sounds like. This is beautiful, mama.',
    'Gratitude does not erase the hard — it reminds you both can be true. I am glad you named this one.',
  ],
  anxious: [
    'Anxiety can lie loud. What you wrote is real, and you are still safe in this moment with me.',
    'Naming the worry is already a brave exhale. We can take the next breath together — no rush.',
    'Your nervous system is working overtime to protect you. Thank you for letting me in anyway.',
  ],
  hopeful: [
    'Hope is not naive — it is fuel. I am cheering for the future you are quietly building.',
    'Keeping hope alive in a hard season is one of the bravest things a mama can do.',
    'I love that you still make room for tomorrow. That softness will reach your baby too.',
  ],
  lonely: [
    'Loneliness in motherhood can feel shameful — it is not. You deserved to be seen tonight.',
    'I am here in the quiet with you. You do not have to make this feeling smaller for anyone.',
    'Even when the house is full, the heart can feel alone. Your honesty here matters so much.',
  ],
};

const DERIVED_TIPS = {
  happy: 'Try a five-minute nesting ritual: one song, one deep breath, one thing you are proud of today.',
  stressed: 'Grounding tip: name five things you can see, four you can touch — bring your nervous system back home.',
  overwhelmed: 'Micro-step method: write only the very next kind thing — not the whole list, just one.',
  exhausted: 'Permission slip: drink water, dim one light, and let "good enough" be sacred for the next hour.',
  grateful: 'Anchor this feeling: screenshot your words or whisper them to your baby — memory becomes medicine.',
  anxious: 'Try box breathing: in for four, hold four, out for four — repeat until your shoulders drop a little.',
  hopeful: 'Write one sentence that starts with "I am looking forward to…" — even something tiny counts.',
  lonely: 'Send one honest text to someone safe: "I feel alone tonight — can you just sit with me in a message?"',
};

const DERIVED_AFFIRMATIONS = {
  happy: 'Your light is not too much — it is exactly what your village needs to see.',
  stressed: 'Storms pass, mama. You are still the safe harbor your little one is sailing toward.',
  overwhelmed: 'You are not failing — you are human, loving hard in a heavy season.',
  exhausted: 'Tired is not weak. Rest is how love refuels itself.',
  grateful: 'Gratitude is proof your heart still knows how to bloom — even after hard days.',
  anxious: 'Worried thoughts are visitors, not the whole house. You are still the home.',
  hopeful: 'Hope is a muscle — and you are strengthening it every time you show up like this.',
  lonely: 'Being lonely does not mean you are unlovable. It means you need connection — and that is human.',
};

const KEYWORD_MOOD_HINTS = [
  { words: ['tired', 'sleep', 'exhausted', 'drained'], mood: 'exhausted' },
  { words: ['grateful', 'thankful', 'blessed', 'joy'], mood: 'grateful' },
  { words: ['happy', 'excited', 'nest', 'glow'], mood: 'happy' },
  { words: ['overwhelm', 'too much', 'cant', "can't", 'drowning'], mood: 'overwhelmed' },
  { words: ['stress', 'anxious', 'worry', 'panic'], mood: 'stressed' },
  { words: ['anxiety', 'racing', 'spiral', 'nervous'], mood: 'anxious' },
  { words: ['hope', 'excited for', 'looking forward', 'dream'], mood: 'hopeful' },
  { words: ['lonely', 'alone', 'isolated', 'nobody'], mood: 'lonely' },
  { words: ['tender', 'soft', 'weepy', 'emotional', 'sensitive'], mood: 'lonely' },
  { words: ['scared', 'afraid', 'fear', 'terrified'], mood: 'anxious' },
];

export function getFriendOpeningLine(moodId, mamaName = 'Mama') {
  const name = (mamaName || 'Mama').trim().split(/\s+/)[0];
  const line = OPENING_LINES[moodId] || OPENING_LINES.grateful;
  return line.replace(/\blove\b/gi, name);
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
