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
    { id: 'p-ia-1', text: 'What is my body asking me to slow down for today?' },
    { id: 'p-ia-2', text: 'One fear I can name without needing to fix it yet…' },
    { id: 'p-ia-3', text: 'Where did I feel connected to baby this week?' },
    { id: 'p-ia-4', text: 'What would “enough” look like for me before bed tonight?' },
    { id: 'p-ia-5', text: 'A tender truth about this trimester I rarely say out loud…' },
    { id: 'p-ia-6', text: 'Who or what made me feel held recently?' },
    { id: 'p-ia-7', text: 'What am I grieving a little as my body changes?' },
    { id: 'p-ia-8', text: 'If I could gift my future self one sentence of courage…' },
    { id: 'p-ia-9', text: 'What part of pregnancy still feels surprising?' },
    { id: 'p-ia-10', text: 'A tiny joy from today that my nervous system needed…' },
    { id: 'p-ia-11', text: 'What boundary would make this week softer?' },
    { id: 'p-ia-12', text: 'How do I want to be spoken to when I feel overwhelmed?' },
  ],
  postpartum: [
    { id: 'pp-ia-1', text: 'What does my body need more of — rest, water, or kindness?' },
    { id: 'pp-ia-2', text: 'A moment today when I mothered myself, even slightly…' },
    { id: 'pp-ia-3', text: 'What emotion visited me most this week, and what did it want?' },
    { id: 'pp-ia-4', text: 'Where do I still feel like “the old me,” and where am I new?' },
    { id: 'pp-ia-5', text: 'One hard thing I handled that nobody saw…' },
    { id: 'pp-ia-6', text: 'What would it feel like to ask for help without apologizing?' },
    { id: 'pp-ia-7', text: 'A soft memory with my baby I want to keep forever…' },
    { id: 'pp-ia-8', text: 'What pressure can I set down for the next 24 hours?' },
    { id: 'pp-ia-9', text: 'How is my heart different at night versus morning?' },
    { id: 'pp-ia-10', text: 'What do I wish someone would say to me right now?' },
    { id: 'pp-ia-11', text: 'Where am I healing — body, mind, or both — even slowly?' },
    { id: 'pp-ia-12', text: 'A truth about motherhood I’m ready to write, not perform…' },
  ],
  hybrid: [
    { id: 'h-ia-1', text: 'How do I hold pregnancy and parenting in the same breath today?' },
    { id: 'h-ia-2', text: 'What does my toddler need from me — and what do I need too?' },
    { id: 'h-ia-3', text: 'A moment I felt stretched thin, and what softens it…' },
    { id: 'h-ia-4', text: 'How is growing a baby while raising a little one rewriting me?' },
    { id: 'h-ia-5', text: 'What can I release so both seasons feel less competing?' },
    { id: 'h-ia-6', text: 'Where did I show up with love even when I was tired?' },
    { id: 'h-ia-7', text: 'What do I want my child to remember about this chapter of me?' },
    { id: 'h-ia-8', text: 'One fear about adding another baby I can name gently…' },
    { id: 'h-ia-9', text: 'How do I protect a pocket of stillness in a loud day?' },
    { id: 'h-ia-10', text: 'What support would make dual-track motherhood feel possible?' },
    { id: 'h-ia-11', text: 'A gratitude for my body doing two sacred jobs at once…' },
    { id: 'h-ia-12', text: 'If I spoke to myself like a village sister tonight, I’d say…' },
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
      affirmation: 'You are becoming a mother and a deeper version of yourself at once.',
      prompt:
        'Write a letter to the woman you are becoming through this pregnancy — not the “perfect mama,” but the real one. What does she need to hear from you this week that nobody else can say?',
    },
    {
      id: 'p-em-2',
      affirmation: 'Your changing body is not a problem to solve — it is a story unfolding.',
      prompt:
        'Describe one place in your body that feels different this week. Without judging it, ask: what might this place be protecting, preparing, or asking for?',
    },
    {
      id: 'p-em-3',
      affirmation: 'Anticipation and uncertainty can sit side by side in a soft heart.',
      prompt:
        'Name one hope and one worry you are carrying into the next few weeks. Then write how you want to be held when either one gets loud.',
    },
    {
      id: 'p-em-4',
      affirmation: 'You do not have to earn rest by proving how hard you are trying.',
      prompt:
        'If your future baby could leave you a sticky note for this week, what would it say about slowing down, receiving care, or staying kind to yourself?',
    },
    {
      id: 'p-em-5',
      affirmation: 'Every trimester asks a different kind of bravery.',
      prompt:
        'What bravery looks quiet for you right now — saying no, asking for help, or letting yourself feel everything? Journal one brave act you will try this week.',
    },
    {
      id: 'p-em-6',
      affirmation: 'You are allowed to miss who you were and love who you are becoming.',
      prompt:
        'What part of your pre-pregnancy self do you miss most — and how can you invite a piece of her into this season without forcing yourself to “go back”?',
    },
    {
      id: 'p-em-7',
      affirmation: 'Support is sacred. You were never meant to grow life alone.',
      prompt:
        'Map your village: who pours into you, who drains you, and who you wish would show up more. Write one sentence you could send asking for something specific.',
    },
    {
      id: 'p-em-8',
      affirmation: 'Your intuition is already practicing motherhood.',
      prompt:
        'Recall a recent moment your gut whispered something about baby, birth, or your needs. What happened when you listened — or when you ignored it?',
    },
  ],
  postpartum: [
    {
      id: 'pp-em-1',
      affirmation: 'Recovery is not linear — and neither is becoming yourself again.',
      prompt:
        'Write about a moment this week when you felt invisible as a person (not only as “mama”). What would it mean to reclaim five minutes that are entirely yours?',
    },
    {
      id: 'pp-em-2',
      affirmation: 'Your love can be fierce and your capacity can still have limits.',
      prompt:
        'Finish this gently: “I can love my baby deeply and still need…” Then write what support, rest, or permission that need is asking for.',
    },
    {
      id: 'pp-em-3',
      affirmation: 'Night hours are holy in their honesty — you don’t have to perform here.',
      prompt:
        'What does the quiet after midnight reveal about your heart that daytime busyness hides? Journal without cleaning it up.',
    },
    {
      id: 'pp-em-4',
      affirmation: 'Healing counts even when it is boring, slow, or unfinished.',
      prompt:
        'List three microscopic signs of healing from this week (sleep, a shower, a kind thought, a softer belly). Which one deserves celebration?',
    },
    {
      id: 'pp-em-5',
      affirmation: 'You are allowed to rewrite the story of “good motherhood.”',
      prompt:
        'What rule about being a “good mom” are you ready to retire? Write the kinder rule you want to live by instead.',
    },
    {
      id: 'pp-em-6',
      affirmation: 'Your baby needs a regulated you more than a perfect you.',
      prompt:
        'Describe a moment you co-regulated (or tried to). What helped your nervous system settle — and what still feels too much?',
    },
    {
      id: 'pp-em-7',
      affirmation: 'Asking for help is an act of motherhood, not a failure of it.',
      prompt:
        'Draft the most honest help-request you have been swallowing. You do not have to send it — just practice the words in Soul Sanctuary.',
    },
    {
      id: 'pp-em-8',
      affirmation: 'Postpartum identity is a soft renovation, not a demolition.',
      prompt:
        'Who are you becoming beyond feeding schedules and milestones? Write three words for the woman rising underneath the logistics.',
    },
  ],
  hybrid: [
    {
      id: 'h-em-1',
      affirmation: 'Holding two seasons at once is holy work — not a productivity contest.',
      prompt:
        'Write about a moment this week when pregnancy needs and toddler needs collided. What did you choose, what did you sacrifice, and what compassion do you owe yourself for that choice?',
    },
    {
      id: 'h-em-2',
      affirmation: 'Your love is expansive enough — your energy still deserves protection.',
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
        'Where are you measuring yourself against mothers who only hold one season? Write what “success” looks like for a mama growing life while raising life.',
    },
    {
      id: 'h-em-5',
      affirmation: 'Your body is carrying history and future in the same heartbeat.',
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

/** Deterministic batch of 3–4 in-app prompts for a stage. */
function pickInAppPromptBatch(stage, { count = 4, seed = 0 } = {}) {
  const pool = [...poolForStage(IN_APP_PROMPTS, stage)];
  const n = Math.min(Math.max(3, count), 4, pool.length);
  const start = hashString(`${normalizeJournalStage(stage)}:${seed}`) % pool.length;
  const batch = [];
  for (let i = 0; i < n; i += 1) {
    batch.push(pool[(start + i) % pool.length]);
  }
  return batch;
}

/** Fresh batch that prefers prompts not in the current visible set. */
function shuffleInAppPromptBatch(stage, currentBatch = [], { count = 4 } = {}) {
  const pool = poolForStage(IN_APP_PROMPTS, stage);
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
  EMAIL_EXCLUSIVE_PROMPTS,
  normalizeJournalStage,
  pickInAppPromptBatch,
  shuffleInAppPromptBatch,
  pickEmailWeeklyPrompt,
  inferNewsletterStage,
  buildJournalDeepLink,
  assertEmailPromptsAreExclusive,
  isoWeekNumber,
};
