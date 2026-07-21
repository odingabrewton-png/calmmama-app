/**
 * Title-aware Unsplash URLs — recipe-id locks first, then keyword matching.
 */

const UNSPLASH = (id, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=90`;

/** Neutral kitchen scene — not a salad loop */
export const KITCHEN_PLACEHOLDER_URL = UNSPLASH('photo-1555939596-153e0a430291');

/** Exact title locks for generated catalog pairings */
export const RECIPE_TITLE_IMAGES = {
  'Ginger Turmeric Golden Milk':
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1400&q=90',
  'Gentle Baked Salmon':
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1400&q=90',
  'Radiant Veggie Spring Rolls':
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1400&q=90',
};

/** Hand-curated recipe locks — verified to match culinary title */
export const RECIPE_IMAGE_BY_ID = {
  'lemon-ginger-broth': 'photo-1547592166-23ac45744acd',
  'iron-lentil-bowl': 'photo-1512621776951-a57141f2eefd',
  'lactation-oat-jar': 'photo-1488477181946-6428a0291777',
  'chickpea-glow-salad': 'photo-1540420773420-3366772f4999',
  'salmon-sweet-potato': 'photo-1467003909585-bf69a37992c8',
  'coconut-ginger-soup': 'photo-1604908176997-125f25cc6f3d',
  'yogurt-parfait': 'photo-1571212515414-88974ccee396',
  'quinoa-harvest-bowl': 'photo-1512058567296-6b3c2a31725a',
  'golden-milk':
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1400&q=90',
  'lactation-smoothie': 'photo-1505252585467-054154774f77',
  'pp-bites-1': 'photo-1488477181946-6428a0291777',
  'pp-bites-2': 'photo-1482049010885-56566fdebb37',
  'pp-bites-3': 'photo-1504674900247-0877df9cc836',
  'pp-bites-4': 'photo-1568901346375-23c9450c58cd',
  'pp-bites-5': 'photo-1519708227418-c8fd9a32b7a2',
  'pp-bites-6': 'photo-1525351484163-7529414344d8',
  'pp-morning-1': 'photo-1488477181946-6428a0291777',
  'pp-morning-2': 'photo-1525351484163-7529414344d8',
  'pp-morning-3': 'photo-1571212515414-88974ccee396',
  'pp-morning-4': 'photo-1504674900247-0877df9cc836',
  'pp-morning-5': 'photo-1488477181946-6428a0291777',
  'pp-morning-6': 'photo-1488477181946-6428a0291777',
  'pp-lunch-1': 'photo-1512621776951-a57141f2eefd',
  'pp-lunch-2': 'photo-1525351484163-7529414344d8',
  'pp-lunch-3': 'photo-1604908176997-125f25cc6f3d',
  'pp-lunch-4': 'photo-1519708227418-c8fd9a32b7a2',
  'pp-lunch-5': 'photo-1512058567296-6b3c2a31725a',
  'pp-lunch-6': 'photo-1565299624946-b28f40a0ae38',
  'pp-dinner-1': 'photo-1551183053-bf91a1d81141',
  'pp-dinner-2': 'photo-1551183053-bf91a1d81141',
  'pp-dinner-3': 'photo-1551183053-bf91a1d81141',
  'pp-dinner-4': 'photo-1551183053-bf91a1d81141',
  'pp-dinner-5': 'photo-1512621776951-a57141f2eefd',
  'pp-dinner-6': 'photo-1519708227418-c8fd9a32b7a2',
};

/** Keyword → photo ID (most specific phrases first) */
const TITLE_KEYWORD_IMAGES = [
  { keys: ['golden milk', 'turmeric latte', 'turmeric milk'], id: 'photo-1597312154070-021ce34b9036' },
  { keys: ['cucumber roll', 'roll-up', 'roll up'], id: 'photo-1626700051175-6818013e1ff4' },
  { keys: ['spring roll', 'veggie roll'], id: 'photo-1626700051175-6818013e1ff4' },
  { keys: ['quinoa harvest', 'roasted vegetable quinoa', 'harvest bowl'], id: 'photo-1512058567296-6b3c2a31725a' },
  { keys: ['lemon ginger', 'anti-nausea broth', 'ginger broth'], id: 'photo-1547592166-23ac45744acd' },
  { keys: ['iron-rich lentil', 'lentil & spinach', 'lentil and spinach'], id: 'photo-1512621776951-a57141f2eefd' },
  { keys: ['overnight oat', 'overnight jar', 'lactation oat'], id: 'photo-1488477181946-6428a0291777' },
  { keys: ['lactation smoothie', 'power smoothie'], id: 'photo-1505252585467-054154774f77' },
  { keys: ['salmon', 'sweet potato plate'], id: 'photo-1467003909585-bf69a37992c8' },
  { keys: ['coconut ginger', 'comfort soup', 'coconut soup'], id: 'photo-1604908176997-125f25cc6f3d' },
  { keys: ['yogurt parfait', 'honey walnut'], id: 'photo-1571212515414-88974ccee396' },
  { keys: ['chickpea glow', 'mediterranean chickpea'], id: 'photo-1540420773420-3366772f4999' },
  { keys: ['acai bowl'], id: 'photo-1590102538310-3a7725a5580d' },
  { keys: ['smoothie bowl', 'berry smoothie bowl'], id: 'photo-1590102538310-3a7725a5580d' },
  { keys: ['green smoothie'], id: 'photo-1610970881699-553a48fbed6a' },
  { keys: ['smoothie', 'shake'], id: 'photo-1505252585467-054154774f77' },
  { keys: ['chia pudding', 'chia cup', 'berry chia'], id: 'photo-1490645935967-10de6ba17061' },
  { keys: ['parfait', 'greek yogurt'], id: 'photo-1571212515414-88974ccee396' },
  { keys: ['pancake', 'crepe', 'waffle'], id: 'photo-1482049010885-56566fdebb37' },
  { keys: ['avocado toast'], id: 'photo-1525351484163-7529414344d8' },
  { keys: ['egg scramble', 'frittata', 'egg white'], id: 'photo-1525351484163-7529414344d8' },
  { keys: ['oat porridge', 'oatmeal', 'rolled oat'], id: 'photo-1488477181946-6428a0291777' },
  { keys: ['minestrone', 'lentil soup', 'bean chili'], id: 'photo-1512621776951-a57141f2eefd' },
  { keys: ['curry bowl', 'coconut curry'], id: 'photo-1604908176997-125f25cc6f3d' },
  { keys: ['buddha bowl', 'power bowl', 'rainbow bowl'], id: 'photo-1512058567296-6b3c2a31725a' },
  { keys: ['quinoa', 'roasted veg'], id: 'photo-1512058567296-6b3c2a31725a' },
  { keys: ['tabouli', 'caprese'], id: 'photo-1540420773420-3366772f4999' },
  { keys: ['salad'], id: 'photo-1540420773420-3366772f4999' },
  { keys: ['soup', 'broth', 'stew'], id: 'photo-1547592166-23ac45744acd' },
  { keys: ['taco'], id: 'photo-1565299624946-b28f40a0ae38' },
  { keys: ['wrap'], id: 'photo-1626700051175-6818013e1ff4' },
  { keys: ['pasta', 'orzo', 'risotto'], id: 'photo-1551183053-bf91a1d81141' },
  { keys: ['sheet pan', 'roasted dinner'], id: 'photo-1551183053-bf91a1d81141' },
  { keys: ['hummus', 'energy ball', 'trail mix', 'roasted chickpea'], id: 'photo-1504674900247-0877df9cc836' },
  { keys: ['muffin', 'scone', 'croissant'], id: 'photo-1488477181946-6428a0291777' },
  { keys: ['toast'], id: 'photo-1509440155596-0935e122ef5e' },
];

const SLOT_IMAGE_POOLS = {
  breakfast: [
    'photo-1488477181946-6428a0291777',
    'photo-1571212515414-88974ccee396',
    'photo-1482049010885-56566fdebb37',
    'photo-1505252585467-054154774f77',
    'photo-1590102538310-3a7725a5580d',
  ],
  snack: [
    'photo-1597312154070-021ce34b9036',
    'photo-1626700051175-6818013e1ff4',
    'photo-1504674900247-0877df9cc836',
    'photo-1490645935967-10de6ba17061',
  ],
  lunch: [
    'photo-1512058567296-6b3c2a31725a',
    'photo-1512621776951-a57141f2eefd',
    'photo-1540420773420-3366772f4999',
    'photo-1565299624946-b28f40a0ae38',
    'photo-1551183053-bf91a1d81141',
  ],
  dinner: [
    'photo-1467003909585-bf69a37992c8',
    'photo-1551183053-bf91a1d81141',
    'photo-1604908176997-125f25cc6f3d',
    'photo-1512058567296-6b3c2a31725a',
  ],
};

function hashString(input) {
  const str = String(input || 'village');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeSlot(mealSlot) {
  if (mealSlot === 'breakfast' || mealSlot === 'snack' || mealSlot === 'lunch' || mealSlot === 'dinner') {
    return mealSlot;
  }
  return 'lunch';
}

function matchKeywordImage(recipe) {
  const haystack = `${recipe?.title || ''} ${recipe?.subtitle || ''}`.toLowerCase();
  for (const entry of TITLE_KEYWORD_IMAGES) {
    if (entry.keys.some((key) => haystack.includes(key))) {
      return UNSPLASH(entry.id);
    }
  }
  return null;
}

function resolveImageUrl(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.startsWith('http')) return value;
  if (typeof value === 'string') return UNSPLASH(value);
  return null;
}

function isLocalKitchenImage(value) {
  return typeof value === 'number';
}

/** Pick a title-aware, slot-appropriate image for a recipe */
export function getKitchenImageUrl(recipe) {
  if (isLocalKitchenImage(recipe?.image) || isLocalKitchenImage(recipe?.imageUrl)) {
    return recipe.image ?? recipe.imageUrl;
  }

  const titleLock = resolveImageUrl(RECIPE_TITLE_IMAGES[recipe?.title?.trim()]);
  if (titleLock) return titleLock;

  const lockedId = RECIPE_IMAGE_BY_ID[recipe?.id];
  if (lockedId) return resolveImageUrl(lockedId) || UNSPLASH(lockedId);

  if (recipe?.imageUrl || recipe?.image) return recipe.imageUrl || recipe.image;

  const keywordMatch = matchKeywordImage(recipe);
  if (keywordMatch) return keywordMatch;

  const slot = normalizeSlot(recipe?.mealSlot);
  const pool = SLOT_IMAGE_POOLS[slot] || SLOT_IMAGE_POOLS.lunch;
  const key = recipe?.id || recipe?.title || 'kitchen';
  const index = hashString(key) % pool.length;
  return UNSPLASH(pool[index]);
}

/** Always resolve through id-lock / keyword matcher for accurate pairing */
export function assignKitchenImage(recipe) {
  if (!recipe || recipe.__pad) return recipe;
  const localImage = isLocalKitchenImage(recipe.image)
    ? recipe.image
    : isLocalKitchenImage(recipe.imageUrl)
      ? recipe.imageUrl
      : null;
  if (localImage != null) {
    return { ...recipe, image: localImage, imageUrl: localImage };
  }
  const imageUrl = getKitchenImageUrl(recipe);
  return {
    ...recipe,
    imageUrl,
    image: imageUrl,
  };
}

export function assignKitchenImages(recipes) {
  return recipes.map(assignKitchenImage);
}
