/** Postpartum Daily Village — rotating mama-first wins (one fresh set per calendar day). */

export const POSTPARTUM_DAILY_WINS_COUNT = 4;

const POSTPARTUM_WINS_POOL = [
  { text: 'Take a warm, uninterrupted shower 🚿' },
  { text: 'Eat a nourishing meal with two hands 🍲' },
  { text: 'Breathe fresh air outside for five minutes 🌿' },
  { text: 'Take postpartum vitamins / pain relief as prescribed 💊' },
  { text: 'Drink a full glass of water before your next feed 💧' },
  { text: 'Rest your eyes for ten minutes — no scrolling 📵' },
  { text: 'Ask someone to hold baby so you can use the bathroom in peace 🚪' },
  { text: 'Put on fresh, comfortable clothes that make you feel human 👕' },
  { text: 'Eat a protein-rich snack within arm\'s reach 🥜' },
  { text: 'Do three slow belly breaths before the next task 🌬️' },
  { text: 'Text one person who makes you feel seen — no pressure to reply 💬' },
  { text: 'Sit in sunlight near a window for a few minutes ☀️' },
  { text: 'Log one feed or nap so your brain can let go of tracking 🍼' },
  { text: 'Stretch your neck and shoulders for sixty seconds 🧘' },
  { text: 'Prep tomorrow\'s water bottle tonight 🫗' },
  { text: 'Accept help with dishes or laundry — no guilt 🧺' },
  { text: 'Eat something warm, not just whatever is fastest 🔥' },
  { text: 'Celebrate one tiny thing your body did today 🌸' },
  { text: 'Lie down horizontally for fifteen minutes — eyes open or closed 😴' },
  { text: 'Change your nursing/pumping station setup for comfort 🪑' },
  { text: 'Step outside barefoot on grass or pavement if safe 🌱' },
  { text: 'Listen to one song that softens your nervous system 🎵' },
  { text: 'Write one sentence in your journal — messy is fine ✍️' },
  { text: 'Pack a bedside snack stash for middle-of-the-night hunger 🍌' },
  { text: 'Say no to one non-essential task today 🛡️' },
  { text: 'Apply belly balm or lotion with slow, kind hands 🤲' },
  { text: 'Open a window for fresh air in your recovery space 🪟' },
  { text: 'Drink an electrolyte or coconut water if you feel depleted 🥥' },
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

export function getPostpartumWinsDayKey(date = new Date()) {
  return date.toDateString();
}

/** Four unique wins for the given calendar day. */
export function getPostpartumDailyWins(date = new Date()) {
  const dayKey = getPostpartumWinsDayKey(date);
  const pool = POSTPARTUM_WINS_POOL;
  const count = Math.min(POSTPARTUM_DAILY_WINS_COUNT, pool.length);
  const order = shuffleIndicesWithSeed(pool.length, hashDateString(`postpartum-wins-${dayKey}`));
  return order.slice(0, count).map((poolIndex, slot) => ({
    id: `${dayKey}-${slot}`,
    text: pool[poolIndex].text,
    done: false,
  }));
}
