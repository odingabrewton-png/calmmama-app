/** Supportive Village Remedy copy for the Daily Symptom Tracker */

export const VILLAGE_REMEDY_BY_SYMPTOM = {
  fatigue: {
    title: 'Gentle energy return',
    tip: 'Try a 12-minute horizontal rest with knees elevated — even awake rest refills your tank. Pair a small protein snack (Greek yogurt, nuts) with water before you stand up again.',
  },
  nausea: {
    title: 'Settle the waves',
    tip: 'Keep plain crackers or ginger tea bedside. Eat tiny bites every 1–2 hours instead of large meals — an empty stomach often makes nausea louder.',
  },
  heartburn: {
    title: 'Cool the burn',
    tip: 'Stay upright 30 minutes after eating and favor smaller, slower meals. A pillow wedge at night and sips of almond milk can ease evening flare-ups.',
  },
  connected: {
    title: 'Savor this glow',
    tip: 'Place a hand on your belly and name one thing you love about today out loud. These bonded moments are medicine for you and baby — let them linger.',
  },
  foggy: {
    title: 'Clear the haze',
    tip: 'Write one must-do on a sticky note and release the rest. A short walk, fresh air, and a big glass of water often lift pregnancy brain fog within twenty minutes.',
  },
};

export function getVillageRemedy(symptomId) {
  return VILLAGE_REMEDY_BY_SYMPTOM[symptomId] || null;
}
