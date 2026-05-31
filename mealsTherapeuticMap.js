/** Maps daily symptoms & postpartum vibes → mama nourishment tag priorities */

export const SYMPTOM_THERAPEUTIC_TAGS = {
  fatigue: ['iron-rich', 'protein', 'energy'],
  nausea: ['anti-nausea', 'hydration'],
  heartburn: ['anti-nausea', 'hydration', 'fiber'],
  connected: ['protein', 'hydration', 'folate'],
  foggy: ['hydration', 'protein', 'iron-rich'],
};

export const VIBE_THERAPEUTIC_TAGS = {
  empty: ['lactation', 'protein', 'energy'],
  grounded: ['fiber', 'hydration', 'protein'],
  overwhelmed: ['hydration', 'anti-nausea', 'gentle'],
  healing: ['lactation', 'protein', 'iron-rich'],
};

export const SYMPTOM_MEAL_HEADLINES = {
  fatigue: 'Iron & steady-energy meals for tired mamas',
  nausea: 'Gentle anti-nausea nourishment',
  heartburn: 'Light, soothing bites for heartburn days',
  connected: 'Grounding, feel-good village plates',
  foggy: 'Hydrating clarity-support meals',
};

export const VIBE_MEAL_HEADLINES = {
  empty: 'Recovery fuel when you are running on empty',
  grounded: 'Balanced hormone-steadying nutrition',
  overwhelmed: 'Soft, calming meals for overwhelmed days',
  healing: 'Postpartum healing & lactation support',
};

export function collectTherapeuticTagsFromSymptoms(symptomIds) {
  const set = new Set();
  (symptomIds || []).forEach((id) => {
    (SYMPTOM_THERAPEUTIC_TAGS[id] || []).forEach((tag) => set.add(tag));
  });
  return Array.from(set);
}

export function collectTherapeuticTagsFromVibes(vibeIds) {
  const set = new Set();
  (vibeIds || []).forEach((id) => {
    (VIBE_THERAPEUTIC_TAGS[id] || []).forEach((tag) => set.add(tag));
  });
  return Array.from(set);
}

/** Score and rank recipes by therapeutic tag overlap */
export function getTherapeuticMeals(recipes, tagKeys, limit = 6) {
  if (!recipes?.length) return [];
  const keys = tagKeys || [];

  if (!keys.length) {
    return recipes.slice(0, limit);
  }

  const scored = recipes
    .map((recipe) => {
      const pregnantTags = recipe.tags?.pregnant || [];
      const score = keys.filter((t) => pregnantTags.includes(t)).length;
      return { recipe, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return recipes.slice(0, limit);
  }

  return scored.slice(0, limit).map(({ recipe }) => recipe);
}

export function getTherapeuticHeadlineForSymptoms(symptomIds) {
  const active = symptomIds?.[symptomIds.length - 1];
  return SYMPTOM_MEAL_HEADLINES[active] || 'Therapeutic meals curated for you today';
}

export function getTherapeuticHeadlineForVibes(vibeIds) {
  const active = vibeIds?.[vibeIds.length - 1];
  return VIBE_MEAL_HEADLINES[active] || 'Recovery-focused village nourishment';
}
