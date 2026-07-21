const EXPERT_GREETING =
  'Welcome to Mama\'s Guidance — your gentle newborn specialist. Tell me what your little one is going through, and I will offer calm, step-by-step care you can try right now.';

const CHECKLISTS = {
  fussy: {
    match: ['fussy', 'crying', 'colic', 'unsettled', 'screaming', "won't stop"],
    title: 'When baby is fussy',
    steps: [
      'Dim lights and lower voices for five minutes — overstimulation is often the hidden culprit.',
      'Try skin-to-skin on your chest with a slow shhh rhythm matching your heartbeat.',
      'Offer a clean pacifier or a pinky to suck; non-nutritive sucking soothes the nervous system.',
      'Bicycle legs gently, then hold knees to tummy for 20 seconds — gas relief in two passes.',
      'If crying escalates after 20 minutes, tag your partner or village contact for a handoff breath.',
    ],
  },
  teething: {
    match: ['teeth', 'teething', 'drool', 'chewing', 'gums', 'bite'],
    title: 'Teething comfort plan',
    steps: [
      'Chill a clean wet washcloth — let baby gnaw for supervised relief.',
      'Offer a silicone teether from the fridge (never freezer-solid).',
      'Gently massage gums with a clean finger in small circles.',
      'Extra cuddles before naps; teething spikes pain at night.',
      'If fever rises above 100.4°F or baby refuses feeds, loop in your pediatrician.',
    ],
  },
  sleep: {
    match: ['sleep', 'nap', 'night', 'wake', 'bedtime', 'tired', 'overtired'],
    title: 'Sleepless night rescue',
    steps: [
      'Watch wake windows — newborn sweet spot is often 45–60 minutes between sleeps.',
      'Swaddle snug (if rolling has not started) + white noise at a soft shower volume.',
      'Feed on demand, then lay down drowsy-but-awake when calm.',
      'For night wakings: lights off, voice low, change only if needed.',
      'Trade 90-minute shifts with a partner so you protect one uninterrupted sleep block.',
    ],
  },
  feeding: {
    match: ['feed', 'latch', 'bottle', 'milk', 'hungry', 'spit', 'reflux'],
    title: 'Feeding reset',
    steps: [
      'Pause and breathe — hunger cues look like rooting, lip smacking, or hands to mouth.',
      'Re-latch or re-seat the bottle at a slight angle to reduce air swallowing.',
      'Burp mid-feed and after; hold upright 10 minutes if spit-up is frequent.',
      'Track one side or ounces so you can spot patterns without obsessing.',
      'Hydrate yourself — your milk and energy follow your cup being filled too.',
    ],
  },
};

let usedReplyKeys = new Set();

function pickUnused(pool, key) {
  const available = pool.filter((_, i) => !usedReplyKeys.has(`${key}-${i}`));
  const list = available.length ? available : pool;
  const pick = list[Math.floor(Math.random() * list.length)];
  usedReplyKeys.add(`${key}-${pool.indexOf(pick)}`);
  if (usedReplyKeys.size > 60) usedReplyKeys = new Set();
  return pick;
}

function findTopic(text) {
  const lower = (text || '').toLowerCase();
  for (const topic of Object.values(CHECKLISTS)) {
    if (topic.match.some((word) => lower.includes(word))) return topic;
  }
  return null;
}

export function getExpertOpeningMessage() {
  return EXPERT_GREETING;
}

export function getExpertReply(userText) {
  const topic = findTopic(userText);
  if (!topic) {
    const intros = [
      'Thank you for trusting me with this moment. Let us breathe together — inhale for four, exhale for six.',
      'I hear you reaching for help. That alone shows how deeply you care for your little one.',
      'Before we problem-solve, know this: you are doing more right than your tired brain gives you credit for.',
    ];
    return {
      title: 'A gentle pause with you',
      body: pickUnused(intros, 'intro'),
      steps: [
        'Name one thing you see, one thing you hear, and one thing you feel under your feet.',
        'When you are ready, tell me if baby is fussy, teething, or struggling with sleep — I will map a clear checklist.',
      ],
    };
  }

  const leadIns = [
    `I hear the ${topic.title.toLowerCase()} thread in what you shared — let us walk through this gently.`,
    `This sounds like a ${topic.title.toLowerCase()} moment. Here is a loving action plan, one step at a time:`,
    `You are not alone in this. For ${topic.title.toLowerCase()}, try these calm steps in order:`,
  ];

  return {
    title: topic.title,
    body: pickUnused(leadIns, `lead-${topic.title}`),
    steps: topic.steps,
  };
}
