/**
 * Mama's Kitchen dietary filter tags.
 *
 * Add an explicit `dietary` array on any new meal for precise control, e.g.:
 *   dietary: ['vegetarian', 'gluten-free', 'peanut-free', 'dairy-free', 'shellfish-free']
 *
 * When omitted, tags are inferred from title + ingredients + instructions.
 */

export const KITCHEN_DIETARY_FILTER_IDS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'peanut-free',
  'shellfish-free',
];

const MEAT_POULTRY_KEYWORDS =
  /\b(chicken|turkey|beef|pork|bacon|ham|prosciutto|jam[oó]n|sausage|ground turkey|ground beef|ground chicken|meatball|pepperoni|deli|burger|patty|veal|lamb)\b/i;

const FISH_KEYWORDS = /\b(salmon|cod|tilapia|tuna|trout|mahi|halibut|sardine|anchovy|fish fillet|fish)\b/i;

const SHELLFISH_KEYWORDS = /\b(shrimp|prawn|crab|lobster|scallop|clam|mussel|oyster|shellfish|crawfish)\b/i;

const EGG_KEYWORDS = /\b(eggs?|omelette|frittata|egg white)\b/i;

const DAIRY_KEYWORDS =
  /\b(milk|cheese|butter|cream|yogurt|feta|brie|cheddar|parmesan|cotija|mozzarella|greek yogurt|heavy cream|cottage cheese|whey|ricotta|swiss cheese|sour cream|crema)\b/i;

const HONEY_KEYWORDS = /\bhoney\b/i;

const PEANUT_KEYWORDS = /\b(peanut|peanuts)\b/i;

const GLUTEN_KEYWORDS =
  /\b(bread|sourdough|tortilla|flour|pasta|gnocchi|english muffin|wrap|panko|breadcrumb|wheat|barley|rye|bagel|cracker|pizza|bun|panini|burrito|angel hair|linguine|spaghetti|noodle|waffle|pancake mix|whole-wheat|whole grain bread|whole-grain bread)\b/i;

const GLUTEN_FREE_MARKER = /\b(gluten[- ]free|certified gluten[- ]free)\b/i;

const PLANT_MILK_ONLY_MARKER =
  /\b(almond milk|oat milk|coconut milk|soy milk|plant[- ]based milk|plant[- ]based alternative|unsweetened almond|unsweetened oat)\b/i;

const DAIRY_OPTION_MARKER =
  /\b(milk or|whole milk|dairy milk|buttermilk|heavy cream|greek yogurt|cheddar|cheese)\b/i;

function collectMealText(meal) {
  const parts = [
    meal.title,
    meal.description,
    meal.vibe,
    meal.subtitle,
    ...(Array.isArray(meal.ingredients) ? meal.ingredients : []),
    ...(Array.isArray(meal.instructions) ? meal.instructions : []),
    ...(Array.isArray(meal.recipeSteps) ? meal.recipeSteps : []),
    ...(Array.isArray(meal.steps) ? meal.steps : []),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function hasMatch(pattern, text) {
  return pattern.test(text);
}

function resolveGlutenFree(text) {
  if (GLUTEN_FREE_MARKER.test(text)) return true;
  if (hasMatch(GLUTEN_KEYWORDS, text)) return false;
  if (/\b(oats?|oatmeal|rolled oats)\b/i.test(text) && !GLUTEN_FREE_MARKER.test(text)) {
    return false;
  }
  return true;
}

function resolveDairyFree(text) {
  if (!hasMatch(DAIRY_KEYWORDS, text)) return true;
  if (
    /\b(milk or|or whole milk|whole milk or|or dairy|milk or plant|almond milk, whole milk)\b/i.test(
      text
    )
  ) {
    return false;
  }
  if (/\bwhole milk\b/i.test(text)) return false;
  if (
    PLANT_MILK_ONLY_MARKER.test(text) &&
    !/\b(cheese|butter|cream|yogurt|feta|parmesan|cheddar|mozzarella|brie|cotija|ricotta|whey|heavy cream|greek yogurt)\b/i.test(
      text
    )
  ) {
    return true;
  }
  return false;
}

function resolveVegan(text) {
  if (hasMatch(MEAT_POULTRY_KEYWORDS, text)) return false;
  if (hasMatch(FISH_KEYWORDS, text)) return false;
  if (hasMatch(SHELLFISH_KEYWORDS, text)) return false;
  if (hasMatch(EGG_KEYWORDS, text)) return false;
  if (!resolveDairyFree(text)) return false;
  if (hasMatch(HONEY_KEYWORDS, text)) return false;
  return true;
}

function resolveVegetarian(text) {
  if (hasMatch(MEAT_POULTRY_KEYWORDS, text)) return false;
  if (hasMatch(FISH_KEYWORDS, text)) return false;
  if (hasMatch(SHELLFISH_KEYWORDS, text)) return false;
  return true;
}

/** Infer dietary filter tags from meal copy + ingredients. */
export function resolveMealDietaryTags(meal) {
  if (Array.isArray(meal?.dietary) && meal.dietary.length > 0) {
    return [...new Set(meal.dietary.filter((tag) => KITCHEN_DIETARY_FILTER_IDS.includes(tag)))];
  }

  const text = collectMealText(meal);
  const tags = [];

  if (resolveVegetarian(text)) tags.push('vegetarian');
  if (resolveVegan(text)) tags.push('vegan');
  if (resolveGlutenFree(text)) tags.push('gluten-free');
  if (resolveDairyFree(text)) tags.push('dairy-free');
  if (!hasMatch(PEANUT_KEYWORDS, text)) tags.push('peanut-free');
  if (!hasMatch(SHELLFISH_KEYWORDS, text)) tags.push('shellfish-free');

  return tags;
}

export function mealMatchesDietaryFilter(meal, filterId) {
  if (!filterId) return true;
  const dietary = meal?.tags?.dietary ?? resolveMealDietaryTags(meal);
  return dietary.includes(filterId);
}

export function withMealDietaryTags(meal, existingTags = {}) {
  const dietary = resolveMealDietaryTags(meal);
  return {
    ...meal,
    dietary,
    tags: {
      ...existingTags,
      dietary,
    },
  };
}
