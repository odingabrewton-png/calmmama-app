/**
 * Postpartum vibe check → Mama's Kitchen meal recommendations.
 * Curated from the current postpartum morning / noon / night roster.
 */

import { MAMA_KITCHEN_RECIPES } from './mealsData';

const POSTPARTUM_RECIPE_LOOKUP = new Map(
  MAMA_KITCHEN_RECIPES.filter(
    (recipe) =>
      typeof recipe.id === 'string' &&
      (recipe.id.startsWith('postpartum_') || recipe.id.startsWith('pp-'))
  ).map((recipe) => [recipe.id, recipe])
);

/** Priority meal ids per vibe — newest kitchen roster included. */
export const VIBE_POSTPARTUM_MEAL_PICKS = {
  empty: [
    'postpartum_pb_lactation_bites',
    'postpartum_warm_berry_oatmeal_bowl',
    'postpartum_golden_milk_smoothie',
    'pp-morning-5',
    'postpartum_charcuterie_plate',
    'pp-morning-6',
    'postpartum_tahini_honey_toast',
    'pp-morning-4',
  ],
  grounded: [
    'postpartum_tahini_honey_toast',
    'postpartum_chicken_fiesta_bowl',
    'pp-lunch-1',
    'pp-lunch-4',
    'pp-dinner-6',
    'postpartum_classic_blt_sourdough',
    'pp-lunch-3',
    'pp-dinner-2',
  ],
  overwhelmed: [
    'postpartum_charcuterie_plate',
    'postpartum_pb_lactation_bites',
    'postpartum_golden_milk_smoothie',
    'postpartum_tahini_honey_toast',
    'postpartum_chili_crisp_avocado_toast',
    'pp-morning-6',
    'pp-lunch-5',
    'postpartum_warm_berry_oatmeal_bowl',
  ],
  healing: [
    'postpartum_golden_milk_smoothie',
    'pp-lunch-1',
    'postpartum_turkey_spinach_meatballs',
    'postpartum_creamy_tuscan_chicken',
    'pp-morning-4',
    'postpartum_warm_berry_oatmeal_bowl',
    'postpartum_cheddar_spinach_quesadilla',
    'pp-dinner-1',
  ],
};

export function getPostpartumVibeMeals(vibeIds, limit = 6) {
  if (!Array.isArray(vibeIds) || vibeIds.length === 0) return [];

  const orderedIds = [];
  const seen = new Set();

  vibeIds.forEach((vibeId) => {
    (VIBE_POSTPARTUM_MEAL_PICKS[vibeId] || []).forEach((mealId) => {
      if (!seen.has(mealId)) {
        seen.add(mealId);
        orderedIds.push(mealId);
      }
    });
  });

  return orderedIds
    .map((id) => POSTPARTUM_RECIPE_LOOKUP.get(id))
    .filter(Boolean)
    .slice(0, limit);
}
