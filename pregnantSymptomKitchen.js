/**
 * Pregnant daily symptom tracker → Mama's Kitchen meal recommendations.
 * Curated from the current pregnant morning / noon / night roster.
 */

import { getPregnantKitchenCatalogMeals } from './MamasKitchenScreen';

let pregnantRecipeLookup = null;

function getPregnantRecipeLookup() {
  if (!pregnantRecipeLookup) {
    pregnantRecipeLookup = new Map(
      getPregnantKitchenCatalogMeals().map((recipe) => [recipe.id, recipe])
    );
  }
  return pregnantRecipeLookup;
}

/** Priority meal ids per symptom — aligned with the pregnant kitchen roster. */
export const SYMPTOM_PREGNANT_MEAL_PICKS = {
  fatigue: [
    'apple-oats_01',
    'omelette_01',
    'lunch_salmon_salad',
    'dinner_well_done_burger',
    'pancakes_01',
    'lunch_turkey_melt',
    'burrito_01',
    'dinner_chicken_alfredo',
  ],
  nausea: [
    'smoothie_01',
    'apple-oats_01',
    'toast_01',
    'lunch_mini_pizzas',
    'dinner_sheet_pan_gnocchi',
    'pancakes_01',
    'lunch_turkey_melt',
  ],
  heartburn: [
    'smoothie_01',
    'toast_01',
    'lunch_salmon_salad',
    'dinner_sheet_pan_gnocchi',
    'apple-oats_01',
    'lunch_chicken_wrap',
    'omelette_01',
  ],
  connected: [
    'pancakes_01',
    'lunch_chicken_wrap',
    'dinner_rotisserie_pesto',
    'toast_01',
    'lunch_panini',
    'burrito_01',
    'lunch_salmon_salad',
    'dinner_well_done_burger',
  ],
  foggy: [
    'smoothie_01',
    'apple-oats_01',
    'lunch_salmon_salad',
    'dinner_chicken_alfredo',
    'omelette_01',
    'lunch_chicken_wrap',
    'dinner_rotisserie_pesto',
  ],
};

export function getPregnantSymptomMeals(symptomIds, limit = 6) {
  if (!Array.isArray(symptomIds) || symptomIds.length === 0) return [];

  const lookup = getPregnantRecipeLookup();
  const orderedIds = [];
  const seen = new Set();

  symptomIds.forEach((symptomId) => {
    (SYMPTOM_PREGNANT_MEAL_PICKS[symptomId] || []).forEach((mealId) => {
      if (!seen.has(mealId)) {
        seen.add(mealId);
        orderedIds.push(mealId);
      }
    });
  });

  return orderedIds
    .map((id) => lookup.get(id))
    .filter(Boolean)
    .slice(0, limit);
}
