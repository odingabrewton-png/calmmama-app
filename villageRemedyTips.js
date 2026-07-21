/** Supportive Village Remedy copy for the Daily Symptom Tracker — rotating tips per symptom */

export const VILLAGE_REMEDY_POOLS = Object.freeze({
  fatigue: [
    {
      title: 'Gentle energy return',
      tip: 'Try a 12-minute horizontal rest with knees elevated — even awake rest refills your tank. Pair a small protein snack (Greek yogurt, nuts) with water before you stand up again.',
    },
    {
      title: 'Micro-rest counts',
      tip: 'Set a timer for ten minutes, phone face-down, eyes soft. You do not have to sleep for rest to count — your nervous system still exhales.',
    },
    {
      title: 'Fuel before you fade',
      tip: 'Sip water with a pinch of salt and eat something with protein within arm\'s reach. Blood sugar dips often masquerade as pregnancy exhaustion.',
    },
    {
      title: 'Ask for the small help',
      tip: 'Text one person: "Could you handle dishes tonight?" Delegating one tiny task is not weakness — it protects your energy for baby and you.',
    },
  ],
  nausea: [
    {
      title: 'Settle the waves',
      tip: 'Keep plain crackers or ginger tea bedside. Eat tiny bites every 1–2 hours instead of large meals — an empty stomach often makes nausea louder.',
    },
    {
      title: 'Cold + plain wins',
      tip: 'Try chilled watermelon, frozen grapes, or lemon water through a straw. Strong smells and hot rooms can turn gentle queasiness into a wave.',
    },
    {
      title: 'Motion & breath',
      tip: 'Slow exhale breathing — in for four, out for six — while seated upright. Fresh air near a window often quiets the stomach faster than forcing food.',
    },
    {
      title: 'Ginger & wrist comfort',
      tip: 'Ginger chews, peppermint tea, or acupressure on the inner wrist (about three finger widths above the crease) are gentle allies many mamas swear by.',
    },
  ],
  heartburn: [
    {
      title: 'Cool the burn',
      tip: 'Stay upright 30 minutes after eating and favor smaller, slower meals. A pillow wedge at night and sips of almond milk can ease evening flare-ups.',
    },
    {
      title: 'Timing your bites',
      tip: 'Finish dinner earlier when you can and keep late snacks small and bland — banana, yogurt, or toast often sit gentler than rich or spicy foods.',
    },
    {
      title: 'Loosen & lift',
      tip: 'Soft, loose waistbands and sleeping slightly propped can ease pressure on your stomach. Gravity is a quiet friend in the third trimester.',
    },
    {
      title: 'Sip, don\'t gulp',
      tip: 'Drink between meals rather than with big bites. Still water in small sips tends to calm reflux better than large gulps at the table.',
    },
  ],
  connected: [
    {
      title: 'Savor this glow',
      tip: 'Place a hand on your belly and name one thing you love about today out loud. These bonded moments are medicine for you and baby — let them linger.',
    },
    {
      title: 'Voice memo to baby',
      tip: 'Record thirty seconds of whatever is on your heart — a song, a wish, a silly joke. Your voice is already home to them.',
    },
    {
      title: 'Gratitude snapshot',
      tip: 'Snap one photo of something beautiful you noticed today. Tiny joys become anchors when harder days visit.',
    },
    {
      title: 'Share the warmth',
      tip: 'Tell your partner or a friend one specific moment you felt close to baby. Speaking joy aloud makes it grow roots.',
    },
  ],
  foggy: [
    {
      title: 'Clear the haze',
      tip: 'Write one must-do on a sticky note and release the rest. A short walk, fresh air, and a big glass of water often lift pregnancy brain fog within twenty minutes.',
    },
    {
      title: 'One tray, one task',
      tip: 'Gather everything for a single chore on a tray before you start — keys, snack, water. Reducing mental load is a real remedy for foggy days.',
    },
    {
      title: 'Brain dump reset',
      tip: 'Set a three-minute timer and list every worry on paper. Close the notebook — your mind can rest knowing nothing was forgotten, only parked.',
    },
    {
      title: 'Move to unlock',
      tip: 'Ten shoulder rolls and a slow walk to the mailbox can sharpen focus. Gentle movement sends fresh oxygen upstairs without exhausting you.',
    },
  ],
});

/** @deprecated use getVillageRemedy with pickIndex */
export const VILLAGE_REMEDY_BY_SYMPTOM = Object.fromEntries(
  Object.entries(VILLAGE_REMEDY_POOLS).map(([id, tips]) => [id, tips[0]])
);

export function getVillageRemedyPoolSize(symptomId) {
  return VILLAGE_REMEDY_POOLS[symptomId]?.length ?? 0;
}

export function getVillageRemedy(symptomId, pickIndex = 0) {
  const pool = VILLAGE_REMEDY_POOLS[symptomId];
  if (!pool?.length) return null;
  const index = ((pickIndex % pool.length) + pool.length) % pool.length;
  return pool[index];
}
