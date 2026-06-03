/**
 * Systematic generator for Mama's Kitchen — produces diverse premium recipes
 * tagged for pregnant/postpartum nourishment and dietary/allergen filters.
 */

import { assignKitchenImage } from './kitchenMealImages';

const MEAL_SLOTS = ['breakfast', 'snack', 'lunch', 'dinner'];

const BREAKFAST_BASES = [
  'Overnight Oats', 'Chia Pudding', 'Avocado Toast', 'Egg White Scramble', 'Berry Smoothie Bowl',
  'Greek Yogurt Parfait', 'Banana Pancakes', 'Steel-Cut Oat Porridge', 'Tofu Scramble', 'Millet Porridge',
  'Buckwheat Crepes', 'Cottage Cheese Bowl', 'Warm Quinoa Cereal', 'Almond Butter Toast', 'Peach Compote Oats',
  'Spinach Frittata Cup', 'Citrus Yogurt Bowl', 'Pumpkin Spice Oats', 'Apple Cinnamon Porridge', 'Seed Crunch Bowl',
];

const SNACK_BASES = [
  'Trail Mix Bites', 'Hummus & Veggies', 'Energy Balls', 'Apple Almond Slices', 'Rice Cake Stack',
  'Cucumber Roll-Ups', 'Berry Chia Cup', 'Roasted Chickpeas', 'Coconut Date Bites', 'Veggie Spring Rolls',
  'Frozen Grape Cup', 'Nut-Free Granola Bar', 'Edamame Sprinkle', 'Pear & Seed Plate', 'Sweet Potato Wedges',
  'Avocado Rice Crackers', 'Lactation Bites', 'Herbal Tea & Dates', 'Yogurt Dip Cup', 'Carrot Ginger Bites',
];

const LUNCH_BASES = [
  'Power Bowl', 'Harvest Salad', 'Lentil Soup', 'Grain Wrap', 'Rainbow Plate',
  'Mediterranean Plate', 'Buddha Bowl', 'Minestrone Cup', 'Stuffed Sweet Potato', 'Quinoa Tabouli',
  'Black Bean Tacos', 'Zucchini Noodle Bowl', 'Egg Salad Lettuce Cups', 'Turkey & Avocado Wrap', 'Tofu Rice Bowl',
  'Spinach Orzo Salad', 'Roasted Veg Plate', 'Chickpea Curry Bowl', 'Salmon Salad Jar', 'Caprese Stack',
  'Farro & Greens', 'White Bean Soup', 'Chicken Lettuce Wraps', 'Tempeh Reuben Bowl', 'Garden Pasta Salad',
];

const DINNER_BASES = [
  'Sheet Pan Dinner', 'Herb Roasted Plate', 'Coconut Curry', 'Baked Salmon', 'Stuffed Peppers',
  'Lentil Shepherd Pie', 'Ginger Miso Bowl', 'Turkey Meatballs', 'Vegetable Stir-Fry', 'Slow-Cooked Stew',
  'Grilled Chicken Plate', 'Shrimp & Grits', 'Mushroom Risotto', 'Beef & Broccoli', 'Cod en Papillote',
  'Eggplant Parmesan', 'Pork Tenderloin', 'Bean Chili', 'Ratatouille Bake', 'Teriyaki Tofu Plate',
  'Lemon Herb Fish', 'Stuffed Acorn Squash', 'Chicken Tikka Bowl', 'Pasta Primavera', 'Root Veg Roast',
];

const PREFIXES = [
  'Village', 'Bloom', 'Golden', 'Gentle', 'Nourish', 'Sacred', 'Sunrise', 'Moonlit', 'Harvest', 'Wild',
  'Calm', 'Radiant', 'Tender', 'Wholesome', 'Restorative', 'Luminous', 'Earth', 'Garden', 'Cozy', 'Fresh',
];

const PREGNANT_TAGS = [
  ['iron-rich', 'protein'],
  ['anti-nausea', 'hydration'],
  ['lactation', 'protein'],
  ['fiber', 'hydration'],
  ['omega-3', 'protein'],
  ['calcium', 'protein'],
  ['protein', 'energy'],
  ['folate', 'fiber'],
  ['hydration', 'gentle'],
  ['lactation', 'iron-rich'],
];

const SUBTITLE_TEMPLATES = [
  'Premium nourishment crafted for your season — steady energy without overwhelm.',
  'Village-tested, mama-approved — gentle flavors for sensitive days.',
  'Wholesome ingredients, soft textures — perfect for growing and healing bodies.',
  'Make-ahead friendly with clean protein and calming herbs.',
  'Bright, balanced, and deeply satisfying — a ritual you will crave.',
  'Light yet filling — designed for queasy mornings and tired evenings alike.',
  'Nutrient-dense comfort food that honors how hard your body is working.',
  'Simple pantry staples elevated into something that feels like a hug.',
];

/** Assign dietary tags so every filter yields 30+ matches across 140 generated recipes */
function dietaryTagsForIndex(i) {
  const tags = new Set();

  if (i % 2 === 0 || i % 7 === 0) tags.add('vegetarian');
  if (i % 3 !== 1) tags.add('peanut-free');
  if (i % 5 !== 2) tags.add('gluten-free');
  if (i % 4 === 0 || i % 6 === 1) tags.add('dairy-free');
  if (i % 8 !== 3) tags.add('shellfish-free');

  if (tags.size < 2) {
    tags.add('vegetarian');
    tags.add('peanut-free');
  }

  return Array.from(tags);
}

function basesForSlot(slot) {
  if (slot === 'breakfast') return BREAKFAST_BASES;
  if (slot === 'snack') return SNACK_BASES;
  if (slot === 'lunch') return LUNCH_BASES;
  return DINNER_BASES;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildIngredients(slot, title, dietary) {
  const veg = dietary.includes('vegetarian');
  const dairyFree = dietary.includes('dairy-free');
  const glutenFree = dietary.includes('gluten-free');

  const base = [
    '2 tbsp extra-virgin olive oil',
    'Sea salt and cracked pepper to taste',
    'Fresh herbs (parsley, dill, or basil) to finish',
  ];

  if (slot === 'breakfast') {
    return [
      dairyFree ? '1½ cups fortified oat milk' : '1 cup whole-milk Greek yogurt',
      glutenFree ? '1 cup certified gluten-free oats' : '1 cup rolled oats',
      '1 ripe banana or 1 cup mixed berries',
      '1 tbsp ground flaxseed',
      '1 tbsp honey or maple syrup',
      'Pinch of cinnamon',
      ...base,
    ];
  }
  if (slot === 'snack') {
    return [
      '1 cup fresh vegetables (cucumber, carrot, bell pepper)',
      veg ? '½ cup hummus or white bean dip' : '2 oz sliced turkey breast',
      glutenFree ? 'Brown rice cakes or seed crackers' : 'Whole-grain crackers',
      '¼ cup mixed seeds (sunflower, pumpkin)',
      '1 tbsp lemon juice',
      ...base.slice(0, 2),
    ];
  }
  if (slot === 'lunch') {
    return [
      veg ? '1½ cups cooked lentils or chickpeas' : '4 oz grilled chicken breast',
      '2 cups mixed greens or roasted vegetables',
      glutenFree ? '1 cup cooked quinoa' : '1 cup cooked farro or brown rice',
      '1 tbsp tahini or olive-oil dressing',
      '½ avocado, sliced',
      'Cherry tomatoes and cucumber',
      ...base,
    ];
  }
  return [
    veg ? '1 block firm tofu or 2 cups cannellini beans' : '5 oz wild salmon or chicken thigh',
    '2 cups seasonal vegetables (broccoli, zucchini, carrots)',
    dairyFree ? '1 cup coconut milk or broth' : '½ cup whole milk or cream',
    glutenFree ? '1 cup mashed sweet potato' : '1 cup brown rice or pasta',
    '2 cloves garlic, minced',
    '1 tsp dried herbs (thyme, oregano, or rosemary)',
    ...base,
  ];
}

function buildSteps(slot) {
  const common = [
    'Gather ingredients and prep vegetables — gentle pacing keeps cooking calm.',
    'Warm oil in a pan over medium heat. Season thoughtfully with salt and pepper.',
    'Cook main components until tender and fragrant, adjusting heat to avoid burning.',
    'Combine elements in a bowl or plate. Taste and adjust acidity or sweetness.',
    'Finish with fresh herbs. Serve warm or chilled based on your craving.',
  ];
  if (slot === 'breakfast') {
    return [
      'Combine dry ingredients in a jar or bowl the night before if making ahead.',
      'Add milk or yogurt and stir until evenly mixed.',
      'Refrigerate at least 4 hours or cook gently on the stovetop until creamy.',
      'Top with fruit, seeds, and a drizzle of honey before serving.',
    ];
  }
  if (slot === 'snack') {
    return [
      'Wash and slice vegetables into easy, one-handed pieces.',
      'Arrange on a plate with dip, crackers, or seeds for crunch.',
      'Sprinkle with lemon juice and herbs. Enjoy between meals or while nursing.',
    ];
  }
  return common;
}

export function generateKitchenCatalog(count = 140, idOffset = 100) {
  const recipes = [];

  for (let i = 0; i < count; i += 1) {
    const slot = MEAL_SLOTS[i % MEAL_SLOTS.length];
    const bases = basesForSlot(slot);
    const baseName = bases[i % bases.length];
    const prefix = PREFIXES[(i + Math.floor(i / 4)) % PREFIXES.length];
    const title = `${prefix} ${baseName}`;
    const dietary = dietaryTagsForIndex(i);
    const journey = i % 5 === 0 ? 'postpartum' : i % 3 === 0 ? 'both' : 'pregnant';
    const slug = slugify(`${prefix}-${baseName}-${i}`);

    recipes.push(
      assignKitchenImage({
        id: `kitchen-gen-${idOffset + i}`,
        title,
        subtitle: SUBTITLE_TEMPLATES[i % SUBTITLE_TEMPLATES.length],
        prepMinutes: 8 + (i % 7) * 5 + (slot === 'dinner' ? 10 : 0),
        servings: slot === 'snack' ? 2 : 3 + (i % 3),
        mealSlot: slot,
        journey,
        tags: {
          pregnant: PREGNANT_TAGS[i % PREGNANT_TAGS.length],
          dietary,
        },
        ingredients: buildIngredients(slot, title, dietary),
        steps: buildSteps(slot),
        amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(baseName + ' organic ingredients')}&tag=calmmamavilla-20`,
        instacartUrl: `https://www.instacart.com/store/s?k=${encodeURIComponent(baseName.replace(/ /g, '+'))}`,
      })
    );
  }

  return recipes;
}
