/**
 * Mama-friend notes for Soul Sanctuary venting entries.
 * Uses Gemini when EXPO_PUBLIC_GEMINI_API_KEY is set so replies actually
 * read what she wrote; otherwise falls back to a warmer local letter.
 */

const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-flash-latest';

const MOOD_LABELS = {
  happy: 'Happy 🌻',
  stressed: 'Stressed 🌧️',
  overwhelmed: 'Overwhelmed 🌊',
  exhausted: 'Exhausted ☕',
  grateful: 'Grateful ✨',
  anxious: 'Anxious 🦋',
  hopeful: 'Hopeful 🌅',
  lonely: 'Lonely 🌙',
};

const SYSTEM_PROMPT = `You are a warm, supportive village friend. Write a complete, empathetic 2-paragraph response. Ensure you finish your final sentence completely.

You are a mama friend inside Calm Mama Village's Soul Sanctuary — a private journal corner for pregnant and postpartum mamas.

You are NOT a therapist, coach, or chatbot. You are a warm, real-feeling friend who just read her journal entry.

Tone:
- Soft, conversational, human — like a voice note or a late-night text from someone who gets it
- Validate first. Never lecture, diagnose, or shame
- Mirror specific details from what she wrote (words, moments, people, body feelings) so she feels truly heard
- You may offer one gentle, optional comfort idea — never a checklist of tips

Rules:
- Write exactly 2 complete paragraphs (about 120–220 words total). Not one short line. Not a long essay.
- Keep the note cohesive and complete — finish every thought and every sentence. Never stop mid-sentence or trail off.
- Fully express your response within the space you have; land on a warm, finished closing line
- Speak directly to her by first name when given
- Do not use bullet points, numbered lists, headings, hashtags, or emoji walls
- Do not start with "As an AI" or mention being a model
- Do not give medical advice; if something sounds urgent, gently suggest checking with her care team
- Avoid repeating the same stock phrases ("you've got this", "one day at a time") unless they truly fit
- End in a way that feels like presence, not a pep rally`;

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
    focus:
      'her changing pregnant body and how much work it is to grow someone while still showing up for life',
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
    focus: 'healing and physical recovery while still mothering — how unfair and real that pain is',
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
    focus: 'feeding pressure and the quiet guilt that shows up when feeds feel messy',
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
    focus: 'bone-deep tiredness and how devotion can still cost her body',
  },
  emotional: {
    keywords: [
      'anxious',
      'lonely',
      'overwhelm',
      'overwhelming',
      'cry',
      'cried',
      'crying',
      'tears',
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
      'invisible',
      'alone inside',
    ],
    focus: 'the big, layered feelings that motherhood rarely makes room for out loud',
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
    focus: 'wanting to feel backed up by her person, and how lonely that gap can feel',
  },
};

const MOOD_COLOR = {
  happy: 'a little light breaking through',
  stressed: 'pressure sitting on her chest',
  overwhelmed: 'too much landing at once',
  exhausted: 'a body and heart that are spent',
  grateful: 'a soft grateful glow she still managed to notice',
  anxious: 'a mind that will not quiet down',
  hopeful: 'a brave little thread of hope',
  lonely: 'the ache of wanting to be seen',
};

function firstName(mamaName) {
  const raw = (mamaName || 'Mama').trim().split(/\s+/)[0];
  return raw || 'Mama';
}

export function detectVentingMarkers(text) {
  const lower = (text || '').toLowerCase();
  const scored = [];
  for (const [id, topic] of Object.entries(MARKERS)) {
    const hits = topic.keywords.filter((w) => lower.includes(w)).length;
    if (hits > 0) scored.push({ id, hits });
  }
  scored.sort((a, b) => b.hits - a.hits);
  return scored.map((row) => row.id);
}

const MOOD_PREFERRED_MARKER = {
  stressed: 'emotional',
  overwhelmed: 'emotional',
  exhausted: 'fatigue',
  anxious: 'emotional',
  lonely: 'emotional',
};

function pickPrimaryMarker(markers, moodId) {
  const preferred = MOOD_PREFERRED_MARKER[moodId];
  // Mood cloud is her clearest signal — prefer it over a weak keyword like "nap".
  if (preferred) return preferred;
  return markers[0] || null;
}

function extractEcho(text) {
  const cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length < 18) return cleaned;

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12 && s.length <= 110);

  let echo = sentences[0] || cleaned.slice(0, 100).trim();
  echo = echo.replace(/^["'“”]+|["'“”]+$/g, '').trim();
  if (echo.length > 96) {
    echo = `${echo.slice(0, 93).replace(/\s+\S*$/, '')}…`;
  }
  return echo;
}

function buildLocalVentingGuidance({ text, moodId, moodLabel, priorEntries = [], mamaName = 'Mama' }) {
  const name = firstName(mamaName);
  const markers = detectVentingMarkers(text);
  const primary = pickPrimaryMarker(markers, moodId);
  const topic = primary ? MARKERS[primary] : null;
  const echo = extractEcho(text);
  const moodColor = MOOD_COLOR[moodId] || 'whatever she is carrying tonight';

  const recentSameMood = priorEntries.filter(
    (e) => e.moodId === moodId && Date.now() - new Date(e.timestamp).getTime() < 7 * 86400000,
  ).length;

  const paragraphs = [];

  paragraphs.push(
    `Hey ${name} — I just sat with what you wrote. When you said “${echo || 'all of this'}”, I felt the weight of it. That isn’t small, and you didn’t have to tidy it up for me.`,
  );

  if (topic) {
    paragraphs.push(
      `Choosing the ${moodLabel || 'emotion'} cloud makes sense with ${topic.focus}. I’m not here to fix you or hurry you past it — I’m here because what you named deserves to be held exactly as it is.`,
    );
  } else {
    paragraphs.push(
      `That ${moodLabel || 'feeling'} cloud you tapped — ${moodColor} — matches the heart of your words. Thank you for trusting this quiet corner with something real instead of the polished version.`,
    );
  }

  paragraphs.push(
    `You can love your baby (or this pregnancy) and still ache, still be tired, still want more support. Both can be true in the same breath. Tonight you don’t have to solve the whole story — just knowing someone heard you is enough for this moment.`,
  );

  if (recentSameMood >= 2) {
    const feeling = (moodLabel || 'feeling').replace(/[^\w\s]/g, '').trim() || 'feeling';
    paragraphs.push(
      `I’ve noticed this ${feeling.toLowerCase()} showing up more than once this week. That tells me your heart keeps asking to be held — and I’m holding it with you, without judging the repeat.`,
    );
  } else {
    paragraphs.push(
      `If your body lets you, unclench your shoulders on the next exhale. I’m still here after you close this note — no performance needed, mama.`,
    );
  }

  return {
    title: 'A note from a mama friend',
    body: paragraphs.join('\n\n'),
    markers,
    moodId,
    source: 'local',
    timestamp: new Date().toISOString(),
  };
}

async function askGeminiFriendNote({ text, moodId, moodLabel, priorEntries = [], mamaName = 'Mama' }) {
  if (!GEMINI_API_KEY) return null;

  const name = firstName(mamaName);
  const recent = priorEntries
    .slice(-4)
    .map((entry) => {
      const snippet = String(entry.text || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      return `- Mood cloud: ${entry.moodLabel || entry.moodId} · “${snippet}${snippet.length >= 160 ? '…' : ''}”`;
    })
    .join('\n');

  const userPrompt = `Mama's first name: ${name}
Emotion cloud she just chose: ${moodLabel || moodId || 'unspecified'}

What she just wrote in her journal (read this carefully and respond to the specifics):
"""
${String(text || '').trim()}
"""

Recent entries from her venting timeline (for continuity — do not copy them; just avoid sounding identical):
${recent || '- (no recent entries yet)'}

Now write your mama-friend note back to her. You are a warm, supportive village friend. Write a complete, empathetic 2-paragraph response. Ensure you finish your final sentence completely.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.85,
          // Headroom for a full 2-paragraph note without mid-sentence cutoffs.
          maxOutputTokens: 2048,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const payload = await response.json();
  const candidate = payload?.candidates?.[0];
  const finishReason = String(candidate?.finishReason || '');

  // Read every text part — do not stop after the first chunk or truncate response text.
  const raw = (candidate?.content?.parts || [])
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!raw) return null;

  // If Gemini still hit the token ceiling, prefer the local letter over a half-finished note.
  if (/MAX_TOKENS/i.test(finishReason) && !/[.!?…]"?\s*$/.test(raw)) {
    return null;
  }

  return raw
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .trim();
}

/**
 * Build a personalized mama-friend note.
 * Prefers Gemini (reads her actual words); falls back to a local letter.
 */
export async function buildVentingGuidance({
  text,
  moodId,
  moodLabel,
  priorEntries = [],
  mamaName = 'Mama',
}) {
  const markers = detectVentingMarkers(text);

  try {
    const geminiBody = await askGeminiFriendNote({
      text,
      moodId,
      moodLabel,
      priorEntries,
      mamaName,
    });
    if (geminiBody) {
      return {
        title: 'A note from a mama friend',
        body: geminiBody,
        markers,
        moodId,
        source: 'gemini',
        timestamp: new Date().toISOString(),
      };
    }
  } catch (_) {
    // Fall through to local guidance when Gemini is unavailable.
  }

  return buildLocalVentingGuidance({
    text,
    moodId,
    moodLabel,
    priorEntries,
    mamaName,
  });
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
      source: guidance.source,
    },
  };
}

export function sanctuaryUsesGemini() {
  return Boolean(GEMINI_API_KEY);
}

const DAY_MS = 86400000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function moodMeta(moodId) {
  const label = MOOD_LABELS[moodId];
  return label ? { id: moodId, label } : null;
}

/**
 * Postpartum emotion-cloud progress from journal mood picks.
 * Groups the last N days + overall counts for the tracker UI.
 */
export function buildMoodCloudTracker(ventingHistory = [], dayCount = 7) {
  const now = startOfDay(new Date());
  const days = [];

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const day = new Date(now.getTime() - offset * DAY_MS);
    const dayEnd = day.getTime() + DAY_MS;
    const entries = (ventingHistory || []).filter((entry) => {
      const t = new Date(entry.timestamp).getTime();
      return t >= day.getTime() && t < dayEnd;
    });

    const moods = entries.map((entry) => ({
      id: entry.moodId,
      label: entry.moodLabel || moodMeta(entry.moodId)?.label || entry.moodId,
    }));

    days.push({
      key: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      dateLabel: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isToday: offset === 0,
      moods,
      latest: moods.length ? moods[moods.length - 1] : null,
    });
  }

  const counts = {};
  for (const entry of ventingHistory || []) {
    const age = now.getTime() - startOfDay(entry.timestamp).getTime();
    if (age > (dayCount - 1) * DAY_MS || age < 0) continue;
    counts[entry.moodId] = (counts[entry.moodId] || 0) + 1;
  }

  const ranked = Object.entries(counts)
    .map(([id, count]) => ({
      id,
      count,
      label: moodMeta(id)?.label || id,
    }))
    .sort((a, b) => b.count - a.count);

  const total = ranked.reduce((sum, row) => sum + row.count, 0);

  return {
    days,
    ranked,
    total,
    dominant: ranked[0] || null,
  };
}
