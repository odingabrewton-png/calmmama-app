/**
 * 2 AM Baby Oracle — postpartum chat brain.
 * Uses Gemini when EXPO_PUBLIC_GEMINI_API_KEY is set; otherwise a warm local guide.
 */

const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are the 2 AM Baby Oracle inside Calm Mama Village — a gentle, knowledgeable postpartum companion for mamas caring for babies (newborn through toddler).

Tone: warm, calm, validating, never alarmist. Write like a trusted night nurse friend.

Rules:
- Give practical step-by-step guidance mamas can try right now at 2 AM.
- Keep answers concise: 2–4 short paragraphs, plus numbered steps when helpful.
- You are NOT a doctor. Do not diagnose. Encourage pediatrician or emergency care for: trouble breathing, blue lips, fever 100.4°F+ in babies under 3 months, fewer than 6 wet diapers in 24 hours, signs of dehydration, or anything that feels urgent.
- Never shame. Acknowledge how hard the night feels.
- If the question is unclear, ask one gentle clarifying question while still offering a safe first step.`;

export const BABY_ORACLE_QUICK_TIPS = Object.freeze([
  {
    id: 'sleep',
    emoji: '🌙',
    label: "Can't sleep",
    prompt: 'My baby will not settle or sleep tonight. What should I try first?',
  },
  {
    id: 'tummy',
    emoji: '🌀',
    label: 'Gas / tummy ache',
    prompt: 'I think my baby has gas or a tummy ache. What gentle relief can I try?',
  },
  {
    id: 'teething',
    emoji: '🦷',
    label: 'Teething',
    prompt: 'My baby seems to be teething and is miserable tonight. How can I comfort them?',
  },
]);

const TOPIC_PLAYBOOKS = Object.freeze({
  sleep: {
    title: '🌙 Midnight Care Blueprint · Sleep & Settling',
    body: 'Overtired little ones often fight sleep hardest. Before you rush to fix, run these quiet checks — then layer in a rhythm your baby can feel.',
    signs: [
      'Back of the neck feels sweaty or hot (overheating cue)',
      'Hidden clothing tags, sock seams, or hair wrapped around a tiny finger or toe',
      'Eyes wide but body arching — often overstimulation, not hunger',
    ],
    steps: [
      'Feel the back of baby\'s neck — cool and dry is the goal; peel off one layer if warm.',
      'Scan for tags, tight socks, or hair tourniquets on fingers and toes.',
      'Try a steady rhythmic shush at soft shower volume, about arm\'s length away.',
      'Offer slow skin-to-skin on your chest, or a firm secure swaddle if rolling has not started.',
      'If baby is overtired, shorten the next wake window tomorrow by 10–15 minutes.',
    ],
  },
  tummy: {
    title: '🌀 Midnight Care Blueprint · Tummy Comfort',
    body: 'When little bellies are hurting, your calm hands are medicine. Watch for these signs, then try each relief step in order.',
    signs: [
      'Legs pulling up toward the chest',
      'A firm, tense belly when you gently press',
      'Passing gas or grunting after feeds',
    ],
    steps: [
      'Warm your palms, then trace slow clockwise circles on baby\'s lower belly — gentle pressure only.',
      'Bicycle-pedal their little legs for 20–30 seconds, pause, then repeat two more rounds.',
      'Hold them upright in a "colic carry" — tummy along your forearm, head near your elbow.',
      'Burp with slow pats mid-feed and after; hold upright 10 minutes if spit-up is frequent.',
      'If crying escalates after 20 minutes or baby refuses feeds, tag your partner or call your pediatrician line.',
    ],
  },
  teething: {
    title: '🦷 Midnight Care Blueprint · Teething Relief',
    body: 'Teething pain often spikes at night when distractions fade. These gentle comforts can help you both breathe through the wave.',
    signs: [
      'Extra drool, chewing fists, or rubbing ears and cheeks',
      'Gums look swollen or you feel a firm bump under the surface',
      'Brief fussiness that eases with pressure on the gums',
    ],
    steps: [
      'Offer a clean chilled (not frozen) washcloth or silicone teether from the fridge.',
      'Gently massage gums with a clean finger in small circles for 30 seconds.',
      'Extra cuddles and a low voice — pain spikes feel scarier in the dark.',
      'If your pediatrician has approved infant pain relief, use only the dose they recommended.',
      'Call your provider if fever rises above 100.4°F, baby refuses feeds, or pain seems extreme.',
    ],
  },
  feeding: {
    title: '🍼 Midnight Care Blueprint · Feeding Reset',
    body: 'Night feeds can feel endless. Let us slow down and check the basics before assuming something is wrong.',
    signs: [],
    steps: [
      'Look for hunger cues: rooting, lip smacking, or hands to mouth — crying is a late cue.',
      'Re-latch or re-seat the bottle at a slight angle to reduce air swallowing.',
      'Burp mid-feed and after; hold upright 10 minutes if spit-up is frequent.',
      'Hydrate yourself — your energy and milk follow your cup being filled too.',
      'Track one feed at a time without spiraling; patterns emerge over days, not one night.',
    ],
  },
  fussy: {
    title: '💗 Midnight Care Blueprint · Soothing Fussiness',
    body: 'Sometimes babies cry without a clear label — your steadiness still helps their nervous system feel safe.',
    signs: [],
    steps: [
      'Dim lights and lower voices for five minutes — overstimulation hides in plain sight.',
      'Try skin-to-skin with a slow shhh rhythm matching your heartbeat.',
      'Offer a clean pacifier or gentle non-nutritive sucking if that soothes your baby.',
      'Change scenery: a dark hallway walk or gentle bounce can reset the moment.',
      'Trade off with a partner for a 15-minute breather if you feel overwhelmed — that is wise, not weak.',
    ],
  },
});

const TOPIC_MATCHERS = [
  { id: 'sleep', words: ['sleep', 'nap', 'night', 'wake', 'bedtime', 'restless', 'settle', 'overtired', "won't sleep", 'insomnia'] },
  { id: 'tummy', words: ['tummy', 'gas', 'gassy', 'belly', 'stomach', 'colic', 'cramp', 'wind', 'reflux', 'spit'] },
  { id: 'teething', words: ['teeth', 'teething', 'drool', 'chewing', 'gums', 'tooth'] },
  { id: 'feeding', words: ['feed', 'latch', 'bottle', 'milk', 'hungry', 'nursing', 'formula'] },
  { id: 'fussy', words: ['fussy', 'crying', 'cry', 'scream', 'unsettled', 'won\'t stop'] },
];

function matchTopicId(text) {
  const lower = (text || '').toLowerCase();
  for (const topic of TOPIC_MATCHERS) {
    if (topic.words.some((word) => lower.includes(word))) return topic.id;
  }
  return null;
}

export function getQuickTipBlueprint(tipId) {
  return TOPIC_PLAYBOOKS[tipId] || null;
}

function buildLocalGuideReply(userText) {
  const topicId = matchTopicId(userText);
  if (topicId && TOPIC_PLAYBOOKS[topicId]) {
    return { ...TOPIC_PLAYBOOKS[topicId] };
  }

  return {
    title: '☁️ Midnight guidance for you',
    body: 'Thank you for trusting me with this moment. I hear how heavy tonight feels — you are doing more right than your tired heart gives you credit for.',
    signs: [],
    steps: [
      'Take one slow breath with me: in for four, out for six.',
      'Name what you see baby doing right now — sleepy cues, belly tension, drool, or something else.',
      'Try one small comfort first (dim lights, skin-to-skin, or a belly massage) before stacking fixes.',
      'If anything feels urgent — trouble breathing, high fever in a young infant, or dehydration signs — call your pediatrician or emergency line now.',
    ],
  };
}

function parseGeminiText(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const titleLine = lines.find((line) => line.length < 80) || 'Midnight guidance';
  const bodyParagraphs = lines.filter((line) => line !== titleLine && !/^\d+[\).\]]/.test(line));
  const stepLines = lines
    .filter((line) => /^\d+[\).\]]\s*/.test(line) || /^[-•]\s*/.test(line))
    .map((line) => line.replace(/^\d+[\).\]]\s*/, '').replace(/^[-•]\s*/, '').trim());

  return {
    title: titleLine.replace(/^#+\s*/, ''),
    body: bodyParagraphs.slice(0, 3).join('\n\n') || text,
    signs: [],
    steps: stepLines.slice(0, 6),
  };
}

async function askGemini(userText, history = []) {
  if (!GEMINI_API_KEY) return null;

  const recent = history
    .filter((entry) => entry.role === 'mama' || entry.role === 'guide')
    .slice(-8)
    .map((entry) => ({
      role: entry.role === 'mama' ? 'user' : 'model',
      parts: [{ text: entry.role === 'guide' ? `${entry.title}\n${entry.body}` : entry.body }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...recent,
          { role: 'user', parts: [{ text: userText }] },
        ],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const payload = await response.json();
  const raw =
    payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') || '';
  return parseGeminiText(raw);
}

/** Returns a guide-shaped reply for the oracle chat UI. */
export async function askBabyOracle(userText, history = []) {
  const trimmed = String(userText || '').trim();
  if (!trimmed) {
    return {
      title: 'I am listening',
      body: 'Tell me what your little one is doing — or tap a quick tip above to get started.',
      signs: [],
      steps: [],
    };
  }

  try {
    const geminiReply = await askGemini(trimmed, history);
    if (geminiReply) return geminiReply;
  } catch {
    // Fall through to the local guide when Gemini is unavailable.
  }

  return buildLocalGuideReply(trimmed);
}

export function babyOracleUsesGemini() {
  return Boolean(GEMINI_API_KEY);
}
