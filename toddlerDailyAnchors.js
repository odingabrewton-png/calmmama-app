/** Toddler Daily Village — rotating daily anchors (fresh set each calendar day). */

export const TODDLER_DAILY_ANCHORS_COUNT = 5;

const TODDLER_ANCHORS_POOL = [
  { text: 'Nap window secured 💤' },
  { text: 'Real food / solid hydration check 🥦' },
  { text: 'Energy release outdoors or active play ☀️' },
  { text: 'Drank a hot beverage in peace ☕' },
  { text: 'Logged a funny quote or win to the Time Capsule ✏️' },
  { text: 'Read one short book together 📚' },
  { text: 'Named a big feeling out loud with them 💬' },
  { text: 'Offered a snack before the meltdown window 🍎' },
  { text: 'Got fresh air for both of you 🌿' },
  { text: 'Protected one quiet corner of your day 🛡️' },
  { text: 'Shared a silly dance or song together 🎵' },
  { text: 'Changed into comfy clothes after a messy morning 👕' },
  { text: 'Filled a water bottle for the afternoon stretch 💧' },
  { text: 'Connected eye-to-eye for a soft reset hug 🤗' },
  { text: 'Let one imperfect moment pass without fixing it 🌸' },
  { text: 'Prepped tomorrow\'s toddler bag / outfit 🎒' },
  { text: 'Chose connection over correcting once today 💗' },
  { text: 'Took three breaths before responding to a tantrum 🌬️' },
  { text: 'Offered two choices instead of a power struggle ✌️' },
  { text: 'Sat on the floor and played on their terms 🧸' },
  { text: 'Logged bedtime start time so tonight feels lighter 🌙' },
  { text: 'Asked for (or accepted) one hand of help 🤝' },
  { text: 'Celebrated a tiny win they had today ⭐' },
  { text: 'Kept screens off during one meal together 📵' },
  { text: 'Stretched your own shoulders while they played nearby 🧘' },
  { text: 'Wiped a sticky face with patience, not rush 🧼' },
  { text: 'Named what went well before bed tonight ✨' },
  { text: 'Protected a nap or quiet rest — even a short one 😴' },
];

function hashDateString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function shuffleIndicesWithSeed(length, seed) {
  const indices = Array.from({ length }, (_, index) => index);
  let state = seed || 1;

  for (let i = length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (i + 1);
    const current = indices[i];
    indices[i] = indices[swapIndex];
    indices[swapIndex] = current;
  }

  return indices;
}

export function getToddlerAnchorsDayKey(date = new Date()) {
  return date.toDateString();
}

/** Five unique toddler anchors for the given calendar day. */
export function getToddlerDailyAnchors(date = new Date()) {
  const dayKey = getToddlerAnchorsDayKey(date);
  const pool = TODDLER_ANCHORS_POOL;
  const count = Math.min(TODDLER_DAILY_ANCHORS_COUNT, pool.length);
  const order = shuffleIndicesWithSeed(pool.length, hashDateString(`toddler-anchors-${dayKey}`));
  return order.slice(0, count).map((poolIndex, slot) => ({
    id: `${dayKey}-${slot}`,
    text: pool[poolIndex].text,
    done: false,
  }));
}
