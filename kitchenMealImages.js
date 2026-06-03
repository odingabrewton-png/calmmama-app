/**
 * Slot-aware Unsplash URLs so meal cards match breakfast / lunch / dinner context.
 */

const UNSPLASH = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Neutral aesthetic plate — used when load fails */
export const KITCHEN_PLACEHOLDER_URL = UNSPLASH('photo-1546069901-ba9599a7e63c');

const SLOT_IMAGE_POOLS = {
  breakfast: [
    'photo-1488477181946-6428a0291777',
    'photo-1571212515414-88974ccee396',
    'photo-1525351484163-7529414344d8',
    'photo-1482049010885-56566fdebb37',
    'photo-1505252585467-054154774f77',
    'photo-1476224203421-9ac39bceb794',
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

/** Pick a stable, slot-appropriate image for a recipe */
export function getKitchenImageUrl(recipe) {
  const slot = normalizeSlot(recipe?.mealSlot);
  const pool = SLOT_IMAGE_POOLS[slot] || SLOT_IMAGE_POOLS.lunch;
  const key = recipe?.id || recipe?.title || 'kitchen';
  const index = hashString(key) % pool.length;
  return UNSPLASH(pool[index]);
}

/** Ensure every recipe has a valid imageUrl aligned to its meal slot */
export function assignKitchenImage(recipe) {
  if (!recipe || recipe.__pad) return recipe;
  return {
    ...recipe,
    imageUrl: getKitchenImageUrl(recipe),
  };
}

export function assignKitchenImages(recipes) {
  return recipes.map(assignKitchenImage);
}
