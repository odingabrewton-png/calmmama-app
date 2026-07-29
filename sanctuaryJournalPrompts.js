/**
 * Stage-based Soul Sanctuary journaling prompts.
 * In-app pools and email-exclusive pools stay separate (never reused).
 *
 * CommonJS so weeklyNewsletter.js (Node) and Expo Metro can both consume it.
 */

const JOURNAL_STAGES = Object.freeze(['pregnant', 'postpartum', 'hybrid']);

/** In-app Inspiration pills — soft, short, tap-to-fill. */
const IN_APP_PROMPTS = Object.freeze({
  pregnant: [
    { id: 'p-ia-1', text: 'What snack or rest break would actually help my body today?' },
    { id: 'p-ia-2', text: 'One pregnancy symptom I keep brushing off that deserves gentleness…' },
    { id: 'p-ia-3', text: 'When did I last feel baby move — and what was I doing?' },
    { id: 'p-ia-4', text: 'What am I tired of explaining to people about this pregnancy?' },
    { id: 'p-ia-5', text: 'A worry about birth or after that keeps looping in my head…' },
    { id: 'p-ia-6', text: 'Who could I text tonight if I need a real human, not advice?' },
    { id: 'p-ia-7', text: 'What part of getting ready (bag, nursery, plans) feels most unfinished?' },
    { id: 'p-ia-8', text: 'How do I want my partner / support person to show up this week?' },
    { id: 'p-ia-9', text: 'Something I miss from before pregnancy that I can still do in a smaller way…' },
    { id: 'p-ia-10', text: 'What would “taking it easy” look like for the next 24 hours?' },
    { id: 'p-ia-11', text: 'A appointment or conversation I’m dreading — and what would make it softer…' },
    { id: 'p-ia-12', text: 'One thing I’m proud of handling lately, even if nobody noticed…' },
  ],
  postpartum: [
    { id: 'pp-ia-1', text: 'Did I drink water / eat a real meal today — and if not, what’s in the way?' },
    { id: 'pp-ia-2', text: 'The hardest stretch of last night / this morning looked like…' },
    { id: 'pp-ia-3', text: 'A moment I felt annoyed, lonely, or touched-out — what did I need instead?' },
    { id: 'pp-ia-4', text: 'What do I wish people would stop asking me right now?' },
    { id: 'pp-ia-5', text: 'One thing that went okay with baby today (feeding, nap, walk, bath)…' },
    { id: 'pp-ia-6', text: 'Where is my body still sore, leaking, or healing — and how can I care for it?' },
    { id: 'pp-ia-7', text: 'If I had 20 quiet minutes, how would I actually spend them?' },
    { id: 'pp-ia-8', text: 'Who could take the baby for one short window so I could shower / nap / cry?' },
    { id: 'pp-ia-9', text: 'A feeling about my “old life” that showed up this week…' },
    { id: 'pp-ia-10', text: 'What pressure am I putting on myself that I can drop until tomorrow?' },
    { id: 'pp-ia-11', text: 'Something sweet my baby did that I want to remember…' },
    { id: 'pp-ia-12', text: 'What would help tonight feel 10% more doable?' },
  ],
  hybrid: [
    { id: 'h-ia-1', text: 'When did toddler needs and pregnancy needs collide today?' },
    { id: 'h-ia-2', text: 'What does my little one need from me that I can still give while tired?' },
    { id: 'h-ia-3', text: 'One shortcut that saved us this week (snack, screen, takeout, early bed)…' },
    { id: 'h-ia-4', text: 'How is my body handling pregnancy on top of chasing a little one?' },
    { id: 'h-ia-5', text: 'A guilt thought I keep having about “not enough” for either kid…' },
    { id: 'h-ia-6', text: 'What help would change this week — laundry, dinner, an hour of childcare?' },
    { id: 'h-ia-7', text: 'How can I give my older child a pocket of “just us” this week?' },
    { id: 'h-ia-8', text: 'Something I’m nervous about with a newborn + toddler under one roof…' },
    { id: 'h-ia-9', text: 'Where can I lower the bar at home without feeling like I failed?' },
    { id: 'h-ia-10', text: 'A moment both of us (me + my little one) actually laughed or softened…' },
    { id: 'h-ia-11', text: 'What do I need my partner / village to understand about this season?' },
    { id: 'h-ia-12', text: 'If tomorrow only had three priorities, what would they be?' },
  ],
});

/**
 * Premium / Fairy Godmother prompts — unlocked with Pro or Fairy Godmother perk.
 * Never duplicated into free IN_APP_PROMPTS.
 */
const PREMIUM_IN_APP_PROMPTS = Object.freeze({
  pregnant: [
    {
      id: 'p-pr-1',
      premium: true,
      text: 'What am I most afraid will change about me after baby — and what do I hope stays?',
    },
    {
      id: 'p-pr-2',
      premium: true,
      text: 'If I could design my birth support team without people-pleasing, who would be there?',
    },
    {
      id: 'p-pr-3',
      premium: true,
      text: 'Write the honest update I’d send a close friend — not the polished “we’re so excited” version.',
    },
    {
      id: 'p-pr-4',
      premium: true,
      text: 'Where do I need more information, and where do I need more comfort?',
    },
  ],
  postpartum: [
    {
      id: 'pp-pr-1',
      premium: true,
      text: 'What part of postpartum feels lonelier than I expected — and who could sit in it with me?',
    },
    {
      id: 'pp-pr-2',
      premium: true,
      text: 'The version of motherhood I thought I’d have vs. the one I’m living — what surprised me?',
    },
    {
      id: 'pp-pr-3',
      premium: true,
      text: 'If my mental load had a “stop doing” list this week, what three things would be on it?',
    },
    {
      id: 'pp-pr-4',
      premium: true,
      text: 'What do I need to hear on the hard nights when everyone else is asleep?',
    },
  ],
  hybrid: [
    {
      id: 'h-pr-1',
      premium: true,
      text: 'How do I want my older child to feel about the new baby — and what might get in the way?',
    },
    {
      id: 'h-pr-2',
      premium: true,
      text: 'What am I pretending I can still do alone that this season clearly can’t hold?',
    },
    {
      id: 'h-pr-3',
      premium: true,
      text: 'Write a note to myself for the first weeks with two littles — practical and kind.',
    },
    {
      id: 'h-pr-4',
      premium: true,
      text: 'Where do I need adult conversation, and where do I need actual hands-on help?',
    },
  ],
});

/**
 * Email-only Reflection Prompt of the Week — must never duplicate in-app copy.
 * Longer, letter-like reflections tailored by stage.
 */
const EMAIL_EXCLUSIVE_PROMPTS = Object.freeze({
  pregnant: [
    {
      id: 'p-em-1',
      affirmation: 'You do not have to feel glowing to be doing this well.',
      prompt:
        'Be honest: what has felt harder than the pregnancy books made it sound? Write what you wish someone had warned you — and what help would make this week lighter.',
    },
    {
      id: 'p-em-2',
      affirmation: 'Your body is working overtime. Rest is not lazy.',
      prompt:
        'Walk through a normal day in your body right now — nausea, sleep, hips, energy. What is one adjustment you can make this week without apologizing for it?',
    },
    {
      id: 'p-em-3',
      affirmation: 'Excitement and fear can share the same week.',
      prompt:
        'Name one hope and one worry you are carrying into the next few weeks. Then write how you want to be supported when either one gets loud.',
    },
    {
      id: 'p-em-4',
      affirmation: 'You do not have to earn rest by proving how hard you are trying.',
      prompt:
        'If your future baby left you a sticky note for this week, what would it say about slowing down, asking for help, or being kinder to yourself?',
    },
    {
      id: 'p-em-5',
      affirmation: 'Every trimester asks a different kind of bravery.',
      prompt:
        'What does bravery look like for you right now — saying no, asking for help, or letting yourself feel everything? Journal one brave act you will try this week.',
    },
    {
      id: 'p-em-6',
      affirmation: 'You are allowed to miss who you were and love who you are becoming.',
      prompt:
        'What part of your pre-pregnancy self do you miss most — and how can you invite a small piece of her into this season without forcing yourself to “go back”?',
    },
    {
      id: 'p-em-7',
      affirmation: 'Support is practical. You were never meant to do this alone.',
      prompt:
        'Map your village: who shows up, who drains you, and who you wish would help more. Write one clear ask you could send this week.',
    },
    {
      id: 'p-em-8',
      affirmation: 'Your gut is already practicing motherhood.',
      prompt:
        'Recall a recent moment your gut whispered something about baby, birth, or your needs. What happened when you listened — or when you ignored it?',
    },
  ],
  postpartum: [
    {
      id: 'pp-em-1',
      affirmation: 'Recovery is not linear — and neither is becoming yourself again.',
      prompt:
        'Write about a moment this week when you felt invisible as a person (not only as “mama”). What would five minutes that are entirely yours look like?',
    },
    {
      id: 'pp-em-2',
      affirmation: 'Your love can be fierce and your capacity can still have limits.',
      prompt:
        'Finish this gently: “I can love my baby deeply and still need…” Then write what support, rest, or permission that need is asking for.',
    },
    {
      id: 'pp-em-3',
      affirmation: 'Night hours tell the truth — you don’t have to perform here.',
      prompt:
        'What does the quiet after midnight reveal about your heart that daytime busyness hides? Journal without cleaning it up.',
    },
    {
      id: 'pp-em-4',
      affirmation: 'Healing counts even when it is boring, slow, or unfinished.',
      prompt:
        'List three tiny signs of healing from this week (a shower, a meal, a kind thought, a softer belly). Which one deserves a quiet celebration?',
    },
    {
      id: 'pp-em-5',
      affirmation: 'You are allowed to rewrite what “good mom” means.',
      prompt:
        'What rule about being a “good mom” are you ready to retire? Write the kinder rule you want to live by instead.',
    },
    {
      id: 'pp-em-6',
      affirmation: 'Your baby needs a regulated you more than a perfect you.',
      prompt:
        'Describe a moment you tried to calm yourself while calming baby. What helped — and what still felt like too much?',
    },
    {
      id: 'pp-em-7',
      affirmation: 'Asking for help is part of motherhood, not a failure of it.',
      prompt:
        'Draft the most honest help-request you have been swallowing. You do not have to send it — just practice the words here.',
    },
    {
      id: 'pp-em-8',
      affirmation: 'Postpartum identity is a renovation, not a demolition.',
      prompt:
        'Who are you becoming beyond feeding schedules and milestones? Write three words for the woman rising underneath the logistics.',
    },
  ],
  hybrid: [
    {
      id: 'h-em-1',
      affirmation: 'Holding two seasons at once is real work — not a productivity contest.',
      prompt:
        'Write about a moment this week when pregnancy needs and toddler needs collided. What did you choose, what got dropped, and what compassion do you owe yourself?',
    },
    {
      id: 'h-em-2',
      affirmation: 'Your love is big enough — your energy still deserves protection.',
      prompt:
        'If you could design a “both/and” day that honors baby-in-womb and child-in-arms, what three non-negotiables would it include for you?',
    },
    {
      id: 'h-em-3',
      affirmation: 'You can prepare for a new baby without abandoning the one already here.',
      prompt:
        'What does your older child need to feel secure as your belly grows? Journal one ritual, phrase, or pocket of attention you can offer this week.',
    },
    {
      id: 'h-em-4',
      affirmation: 'Dual-track motherhood asks for a softer scoreboard.',
      prompt:
        'Where are you measuring yourself against moms who only hold one season? Write what “success” looks like for a mama growing life while raising life.',
    },
    {
      id: 'h-em-5',
      affirmation: 'Your body is carrying today and tomorrow in the same heartbeat.',
      prompt:
        'Describe the physical and emotional weight of being pregnant while parenting. What support would make that weight feel shared, not solo?',
    },
    {
      id: 'h-em-6',
      affirmation: 'It is okay if wonder and overwhelm arrive in the same hour.',
      prompt:
        'Capture one wonder-moment and one overwhelm-moment from this week. What bridge of care could connect them for you?',
    },
    {
      id: 'h-em-7',
      affirmation: 'You are teaching your child that mothers are human — and that is a gift.',
      prompt:
        'When your little one saw you tired, emotional, or needing rest, how did you respond? Journal what you want them to learn about soft strength.',
    },
    {
      id: 'h-em-8',
      affirmation: 'Village care multiplies when you stop pretending you can do both alone.',
      prompt:
        'Name the specific help that would change this week for a pregnant mama with a toddler. Write the ask as if a sister already said yes.',
    },
  ],
});

function normalizeJournalStage(stage) {
  const raw = String(stage || '')
    .trim()
    .toLowerCase();
  if (raw === 'hybrid' || raw === 'both') return 'hybrid';
  if (raw === 'postpartum' || raw === 'parenting' || raw === 'toddler') return 'postpartum';
  return 'pregnant';
}

function hashString(input) {
  const str = String(input || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isoWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function poolForStage(map, stage) {
  const key = normalizeJournalStage(stage);
  return map[key] || map.pregnant;
}

function buildInAppPool(stage, { includePremium = false } = {}) {
  const free = poolForStage(IN_APP_PROMPTS, stage);
  if (!includePremium) return [...free];
  const premium = poolForStage(PREMIUM_IN_APP_PROMPTS, stage);
  return [...free, ...premium];
}

/** Deterministic batch of 3–4 in-app prompts for a stage. */
function pickInAppPromptBatch(stage, { count = 4, seed = 0, includePremium = false } = {}) {
  const pool = buildInAppPool(stage, { includePremium });
  const n = Math.min(Math.max(3, count), 4, pool.length);
  const start = hashString(`${normalizeJournalStage(stage)}:${seed}:${includePremium ? 1 : 0}`) % pool.length;
  const batch = [];
  for (let i = 0; i < n; i += 1) {
    batch.push(pool[(start + i) % pool.length]);
  }
  return batch;
}

/** Fresh batch that prefers prompts not in the current visible set. */
function shuffleInAppPromptBatch(
  stage,
  currentBatch = [],
  { count = 4, includePremium = false } = {},
) {
  const pool = buildInAppPool(stage, { includePremium });
  const currentIds = new Set((currentBatch || []).map((p) => p.id));
  const preferred = pool.filter((p) => !currentIds.has(p.id));
  const source = preferred.length >= 3 ? preferred : pool;
  // Rotate start by time so shuffle feels fresh.
  const seed = Date.now() % 997;
  const start = seed % source.length;
  const n = Math.min(Math.max(3, count), 4, source.length);
  const batch = [];
  for (let i = 0; i < n; i += 1) {
    batch.push(source[(start + i * 3) % source.length]);
  }
  return batch;
}

/** One locked teaser premium prompt for free members (paywall / Fairy upsell). */
function pickPremiumTeaserPrompt(stage, seed = 0) {
  const pool = poolForStage(PREMIUM_IN_APP_PROMPTS, stage);
  if (!pool.length) return null;
  const index = hashString(`${normalizeJournalStage(stage)}:teaser:${seed}`) % pool.length;
  return pool[index];
}

/** Exclusive weekly email reflection for a stage (never from in-app pool). */
function pickEmailWeeklyPrompt(stage, date = new Date()) {
  const key = normalizeJournalStage(stage);
  const pool = EMAIL_EXCLUSIVE_PROMPTS[key] || EMAIL_EXCLUSIVE_PROMPTS.pregnant;
  const index = (isoWeekNumber(date) - 1) % pool.length;
  const entry = pool[index];
  return {
    stage: key,
    id: entry.id,
    affirmation: entry.affirmation,
    prompt: entry.prompt,
    source: 'email_exclusive',
  };
}

/** Fallback stage when contact has no journey property. */
function inferNewsletterStage(recipient = {}, date = new Date()) {
  const raw =
    recipient.journey ||
    recipient.stage ||
    recipient.properties?.mama_journey ||
    recipient.properties?.journey ||
    '';
  if (raw) return normalizeJournalStage(raw);
  const stages = JOURNAL_STAGES;
  return stages[hashString(recipient.email || String(isoWeekNumber(date))) % stages.length];
}

function buildJournalDeepLink({
  appUrl = 'https://calmmamavillage.com/app',
  prompt,
  stage,
  promptId,
} = {}) {
  try {
    const url = new URL(appUrl);
    url.searchParams.set('sanctuary', '1');
    url.searchParams.set('emailPrompt', '1');
    url.searchParams.set('stage', normalizeJournalStage(stage));
    if (promptId) url.searchParams.set('promptId', String(promptId));
    if (prompt) url.searchParams.set('journalPrompt', String(prompt).slice(0, 480));
    url.searchParams.set('pts', '10');
    return url.toString();
  } catch (_) {
    const base = String(appUrl || 'https://calmmamavillage.com/app').split('?')[0];
    const params = new URLSearchParams({
      sanctuary: '1',
      emailPrompt: '1',
      stage: normalizeJournalStage(stage),
      pts: '10',
    });
    if (promptId) params.set('promptId', String(promptId));
    if (prompt) params.set('journalPrompt', String(prompt).slice(0, 480));
    return `${base}?${params.toString()}`;
  }
}

function assertEmailPromptsAreExclusive() {
  const inAppTexts = new Set();
  JOURNAL_STAGES.forEach((stage) => {
    (IN_APP_PROMPTS[stage] || []).forEach((p) => inAppTexts.add(String(p.text).trim().toLowerCase()));
    (PREMIUM_IN_APP_PROMPTS[stage] || []).forEach((p) =>
      inAppTexts.add(String(p.text).trim().toLowerCase()),
    );
  });
  const collisions = [];
  JOURNAL_STAGES.forEach((stage) => {
    (EMAIL_EXCLUSIVE_PROMPTS[stage] || []).forEach((p) => {
      const text = String(p.prompt).trim().toLowerCase();
      if (inAppTexts.has(text)) collisions.push(p.id);
    });
  });
  return collisions;
}

module.exports = {
  JOURNAL_STAGES,
  IN_APP_PROMPTS,
  PREMIUM_IN_APP_PROMPTS,
  EMAIL_EXCLUSIVE_PROMPTS,
  normalizeJournalStage,
  pickInAppPromptBatch,
  shuffleInAppPromptBatch,
  pickPremiumTeaserPrompt,
  pickEmailWeeklyPrompt,
  inferNewsletterStage,
  buildJournalDeepLink,
  assertEmailPromptsAreExclusive,
  isoWeekNumber,
};
