/**
 * Title-aware Unsplash URLs — matches meal names to appetizing, specific photos.
 */

const UNSPLASH = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Neutral aesthetic plate — used when load fails */
export const KITCHEN_PLACEHOLDER_URL = UNSPLASH('photo-1546069901-ba9599a7e63c');

/** Keyword → photo ID (checked in order; first match wins) */
const TITLE_KEYWORD_IMAGES = [
  { keys: ['acai bowl', 'acai'], id: 'photo-1590102538310-3a7725a5580d' },
  { keys: ['croissant', 'pastry'], id: 'photo-1555507036-9914-4f0f9467e7e8' },
  { keys: ['avocado toast'], id: 'photo-1525351484163-7529414344d8' },
  { keys: ['smoothie bowl', 'berry smoothie'], id: 'photo-1590102538310-3a7725a5580d' },
  { keys: ['smoothie', 'shake'], id: 'photo-1505252585467-054154774f77' },
  { keys: ['green smoothie'], id: 'photo-1610970881699-553a48fbed6a' },
  { keys: ['overnight oat', 'oat jar', 'rolled oat', 'oat porridge', 'oatmeal'], id: 'photo-1488477181946-6428a0291777' },
  { keys: ['chia pudding', 'chia cup'], id: 'photo-1490645935967-10de6ba17061' },
  { keys: ['parfait', 'yogurt bowl', 'greek yogurt'], id: 'photo-1571212515414-88974ccee396' },
  { keys: ['pancake', 'crepe', 'waffle'], id: 'photo-1482049010885-56566fdebb37' },
  { keys: ['egg scramble', 'frittata', 'egg white'], id: 'photo-1525351484163-7529414344d8' },
  { keys: ['toast'], id: 'photo-1509440155596-0935e122ef5e' },
  { keys: ['salmon'], id: 'photo-1467003909585-bf69a37992c8' },
  { keys: ['lentil', 'bean chili', 'chickpea'], id: 'photo-1512621776951-a57141f2eefd' },
  { keys: ['salad', 'tabouli', 'caprese'], id: 'photo-1540420773420-3366772f4999' },
  { keys: ['soup', 'broth', 'minestrone', 'stew'], id: 'photo-1547592166-23ac45744acd' },
  { keys: ['curry', 'coconut'], id: 'photo-1604908176997-125f25cc6f3d' },
  { keys: ['quinoa', 'harvest bowl', 'power bowl', 'buddha bowl'], id: 'photo-1621996346565-e3dbc646d9a9' },
  { keys: ['taco', 'wrap'], id: 'photo-1565299624946-b28f40a0ae38' },
  { keys: ['pasta', 'orzo', 'risotto'], id: 'photo-1551183053-bf91a1d81141' },
  { keys: ['golden milk', 'turmeric', 'latte'], id: 'photo-1576092762791-2fd0672467fd' },
  { keys: ['hummus', 'snack', 'energy ball', 'trail mix'], id: 'photo-1576092762791-2fd0672467fd' },
  { keys: ['sheet pan', 'roasted', 'dinner'], id: 'photo-1551183053-bf91a1d81141' },
  { keys: ['muffin', 'scone'], id: 'photo-1488477181946-6428a0291777' },
];

const SLOT_IMAGE_POOLS = {
  breakfast: [
    'photo-1488477181946-6428a0291777',
    'photo-1571212515414-88974ccee396',
    'photo-1525351484163-7529414344d8',
    'photo-1482049010885-56566fdebb37',
    'photo-1505252585467-054154774f77',
    'photo-1590102538310-3a7725a5580d',
    'photo-1490645935967-10de6ba17061',
    'photo-1511690743698-d9d85f2fbf38',
  ],
  snack: [
    'photo-1576092762791-2fd0672467fd',
    'photo-1604908176997-125f25cc6f3d',
    'photo-1547592166-23ac45744acd',
    'photo-1512621776951-a57141f2eefd',
    'photo-1540420773420-3366772f4999',
    'photo-1504674900247-0877df9cc836',
  ],
  lunch: [
    'photo-1512621776951-a57141f2eefd',
    'photo-1540420773420-3366772f4999',
    'photo-1621996346565-e3dbc646d9a9',
    'photo-1546069901-ba9599a7e63c',
    'photo-1565299624946-b28f40a0ae38',
    'photo-1504674900247-0877df9cc836',
    'photo-1551183053-bf91a1d81141',
    'photo-1490645935967-10de6ba17061',
  ],
  dinner: [
    'photo-1467003909585-bf69a37992c8',
    'photo-1565958011703-44f9829ba187',
    'photo-1551183053-bf91a1d81141',
    'photo-1565299624946-b28f40a0ae38',
    'photo-1504674900247-0877df9cc836',
    'photo-1546069901-ba9599a7e63c',
    'photo-1604908176997-125f25cc6f3d',
    'photo-1511690743698-d9d85f2fbf38',
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

/** Pick a title-aware, slot-appropriate image for a recipe */
export function getKitchenImageUrl(recipe) {
  const keywordMatch = matchKeywordImage(recipe);
  if (keywordMatch) return keywordMatch;

  const slot = normalizeSlot(recipe?.mealSlot);
  const pool = SLOT_IMAGE_POOLS[slot] || SLOT_IMAGE_POOLS.lunch;
  const key = recipe?.id || recipe?.title || 'kitchen';
  const index = hashString(key) % pool.length;
  return UNSPLASH(pool[index]);
}

/** Preserve hand-curated imageUrl; assign smart URLs to generated catalog items */
export function assignKitchenImage(recipe) {
  if (!recipe || recipe.__pad) return recipe;
  if (recipe.imageUrl && String(recipe.imageUrl).startsWith('http')) {
    return recipe;
  }
  return {
    ...recipe,
    imageUrl: getKitchenImageUrl(recipe),
  };
}

export function assignKitchenImages(recipes) {
  return recipes.map(assignKitchenImage);
}
