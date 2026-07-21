/**
 * Empathetic venting analysis — grounded friend tone, anti-repetition, pattern-aware.
 */

const MARKER_TOPICS = {
  exhaustion: {
    keywords: [
      'exhausted',
      'tired',
      'no sleep',
      'sleep deprived',
      'sleep gap',
      'can\'t sleep',
      'wiped',
      'drained',
      'burned out',
      'burnout',
      'running on empty',
      'fatigue',
      'nap',
      'night feed',
      'cluster feed',
    ],
    validations: [
      'I hear how heavy today felt — especially with the sleep gap pressing on every hour.',
      'Your body has been running a marathon on broken rest, and that kind of tired is not “just in your head.”',
      'The exhaustion you named is real. Anyone carrying this load would feel wrung out.',
      'Sleep debt stacks quietly until it feels like you are moving through mud — I see that in what you wrote.',
      'You have been showing up while running on fumes. That takes a fierce kind of love, and it costs you too.',
    ],
    comforts: [
      'Can you claim one ten-minute horizontal rest before the next demand — phone face-down, eyes closed, no performance?',
      'Ask someone specific for one task off your plate tonight: dishes, a bottle wash, or holding baby while you shower.',
      'Lower the bar on one thing only — cereal for dinner, unfolded laundry, a shorter walk. Relief counts even when small.',
      'Try a “good enough” nap setup: cool room, one sound loop, feet up. Even drifting counts as repair.',
      'Text one person “I’m depleted” — you do not need a full explanation to deserve backup.',
    ],
  },
  physicalPain: {
    keywords: [
      'pain',
      'hurt',
      'ache',
      'bleeding',
      'cramp',
      'sore',
      'healing',
      'stitches',
      'c-section',
      'cesarean',
      'pelvic',
      'breast',
      'engorged',
      'mastitis',
      'headache',
      'body',
    ],
    validations: [
      'Your body is doing repair work while you care for another human — that double load is brutal.',
      'Physical healing pain on top of new-mama demands is a lot to hold alone. I hear the ache in your words.',
      'When your body hurts and nobody sees it, the loneliness doubles. I believe what you are feeling.',
      'Healing is not linear, and some days the pain speaks louder than the joy. That is allowed here.',
      'You named real physical strain — not weakness, not drama. Your body deserves gentleness right now.',
    ],
    comforts: [
      'Heat or ice for twenty minutes where it helps — set a timer so you actually rest during it.',
      'Sit or lie with support behind your back and under your arms; small alignment shifts can ease deep soreness.',
      'If bleeding or pain spiked suddenly, loop in your care team — you are not bothering anyone.',
      'A warm shower or sitz soak can signal safety to your nervous system when pain feels endless.',
      'Keep water and a snack within reach — healing tissue asks for fuel even when you forget yourself.',
    ],
  },
  loneliness: {
    keywords: [
      'alone',
      'lonely',
      'isolated',
      'no one',
      'nobody',
      'by myself',
      'invisible',
      'unseen',
      'disconnected',
      'miss my friends',
      'far from family',
    ],
    validations: [
      'Feeling alone in a room full of needs is one of the loneliest kinds of tired — I hear you.',
      'You can love your baby deeply and still ache for adult connection. Both truths live in you.',
      'When the village feels far away, every hour can feel longer. Your longing for company makes sense.',
      'Being the constant point person is isolating. You deserve to be witnessed, not only needed.',
      'I hear the quiet underneath your words — the part that wishes someone would sit with you without fixing.',
    ],
    comforts: [
      'Send one voice memo to a trusted friend — thirty seconds of honesty counts as connection.',
      'Open Find My Village when you have a minute; even reading another mama’s thread can soften the edge.',
      'Step outside for five minutes of sky — a small change of scene can interrupt the stuck feeling.',
      'Name one person you could ask for a weekly ten-minute check-in. Specific asks get real answers.',
      'Put on a podcast that feels like company while you feed or fold — borrowed voices can hold you gently.',
    ],
  },
  anxiety: {
    keywords: [
      'anxious',
      'anxiety',
      'worried',
      'worry',
      'panic',
      'scared',
      'afraid',
      'overwhelmed',
      'racing',
      'can\'t breathe',
      'spiral',
      'what if',
      'dread',
      'on edge',
    ],
    validations: [
      'Your nervous system is on high alert — that is a body response, not a character flaw.',
      'The “what if” loop is exhausting. I hear how loud it has been inside your mind today.',
      'Anxiety after birth is more common than people admit. You are not failing — you are human.',
      'When everything feels urgent, even small decisions can shake you. That makes sense with this much change.',
      'You named the fear out loud, which is brave. We can meet it without pretending it is small.',
    ],
    comforts: [
      'Try paced breath: inhale four counts, exhale six — longer exhale tells your body the alarm can soften.',
      'Ground with three senses: one thing you see, one you hear, one you feel under your hands.',
      'Write the worry on paper and park it until tomorrow — not to dismiss it, to give your mind a boundary.',
      'If panic feels physical, splash cool water on your wrists and name “I am safe enough right now.”',
      'Lower stimulation for ten minutes: dim light, slower voice, fewer tabs and notifications.',
    ],
  },
};

const OPENING_INVITE =
  'This page is yours — open, quiet, and private. Write freely; I will listen and respond with care, not scripts.';

const GENERIC_VALIDATIONS = [
  'Thank you for trusting this space with the truth of your day.',
  'What you wrote matters. I am reading it with care, not hurry.',
  'You do not have to polish your feelings here — raw is welcome.',
];

const GENERIC_COMFORTS = [
  'Place a hand on your chest and take one slow breath before the next task.',
  'Name one tiny thing that went okay today — even “we both ate once.”',
  'You are allowed to pause without earning it.',
];

let sessionUsedKeys = new Set();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pickUnused(pool, categoryKey) {
  const available = pool.filter((_, idx) => !sessionUsedKeys.has(`${categoryKey}-${idx}`));
  const list = available.length ? available : pool;
  const idx = Math.floor(Math.random() * list.length);
  const originalIdx = pool.indexOf(list[idx]);
  sessionUsedKeys.add(`${categoryKey}-${originalIdx}`);
  if (sessionUsedKeys.size > 80) {
    sessionUsedKeys = new Set([...sessionUsedKeys].slice(-40));
  }
  return list[idx];
}

export function detectMarkers(text) {
  const lower = (text || '').toLowerCase();
  const hits = [];
  for (const [id, topic] of Object.entries(MARKER_TOPICS)) {
    if (topic.keywords.some((word) => lower.includes(word))) {
      hits.push(id);
    }
  }
  return hits;
}

function summarizePattern(history = []) {
  const last7 = history.filter((entry) => {
    const age = Date.now() - new Date(entry.timestamp).getTime();
    return age < 7 * 24 * 60 * 60 * 1000;
  });
  const counts = {};
  last7.forEach((entry) => {
    (entry.markers || []).forEach((m) => {
      counts[m] = (counts[m] || 0) + 1;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { counts, dominant: sorted[0]?.[0] || null, entries: last7.length };
}

const PATTERN_LINES = {
  exhaustion: 'I notice exhaustion has visited you more than once this week — your body is asking for backup, not more grit.',
  physicalPain: 'Your healing body keeps showing up in what you share — please keep treating that pain as data, not drama.',
  loneliness: 'Loneliness has been a thread across your recent entries — connection is a need, not a luxury.',
  anxiety: 'Anxiety has been circling your days — your nervous system may need slower rhythms, not more pushing.',
};

export function getGuidanceOpeningMessage() {
  return OPENING_INVITE;
}

export function buildGuidanceReply(userText, history = []) {
  const markers = detectMarkers(userText);
  const primary = markers[0] || null;
  const pattern = summarizePattern(history);

  const topic = primary ? MARKER_TOPICS[primary] : null;
  const validation = topic
    ? pickUnused(topic.validations, `${primary}-val`)
    : pickUnused(GENERIC_VALIDATIONS, 'generic-val');

  let patternNote = '';
  if (pattern.dominant && pattern.entries >= 2 && PATTERN_LINES[pattern.dominant]) {
    patternNote = ` ${PATTERN_LINES[pattern.dominant]}`;
  } else if (markers.length > 1) {
    patternNote =
      ' Several threads are tangled today — exhaustion, body, heart, mind — and you do not have to untangle them all at once.';
  }

  const comfort = topic
    ? pickUnused(topic.comforts, `${primary}-comfort`)
    : pickUnused(GENERIC_COMFORTS, 'generic-comfort');

  const body =
    `${validation}${patternNote} Here is one gentle thing you might try when you have a breath: ${comfort}`;

  return {
    title: primary ? 'A friend beside you' : 'Held in this moment',
    body,
    markers,
    steps: [],
    timestamp: new Date().toISOString(),
    dateKey: todayKey(),
  };
}

export function createVentEntry(userText) {
  return {
    id: `vent-${Date.now()}`,
    role: 'mama',
    body: userText.trim(),
    timestamp: new Date().toISOString(),
    markers: detectMarkers(userText),
    dateKey: todayKey(),
  };
}
