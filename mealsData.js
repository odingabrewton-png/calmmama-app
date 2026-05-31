/** Mama's Kitchen — curated nourishment recipes with filter tags & grocery links */

import { generateKitchenCatalog } from './mealsCatalogGenerator';

export const KITCHEN_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'peanut-free', label: 'Peanut-Free' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'shellfish-free', label: 'Shellfish-Free' },
];

export const KITCHEN_TIME_OF_DAY = ['morning', 'afternoon', 'night'];

export const KITCHEN_BACKGROUND_VIDEOS = {
  morning: require('./assets/gemini_generated_video_BD991A6E.mp4'),
  afternoon: require('./assets/gemini_generated_video_E0157921.mp4'),
  night: require('./assets/gemini_generated_video_91C45F70.mp4'),
};

const HAND_CRAFTED_KITCHEN_RECIPES = [
  {
    id: 'lemon-ginger-broth',
    title: 'Lemon Ginger Anti-Nausea Broth',
    subtitle: 'Sip slowly — warm, bright, and gentle on a queasy morning stomach.',
    imageUrl:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 15,
    servings: 4,
    mealSlot: 'breakfast',
    tags: {
      pregnant: ['anti-nausea', 'hydration'],
      dietary: ['vegetarian', 'vegan', 'peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '6 cups low-sodium vegetable broth',
      '2-inch fresh ginger, thinly sliced',
      '1 lemon, juiced plus thin rounds for serving',
      '2 cloves garlic, smashed',
      '1 small carrot, sliced',
      '1 tbsp olive oil',
      'Pinch of sea salt and white pepper',
      'Fresh parsley to finish',
    ],
    steps: [
      'Warm olive oil in a pot over medium heat. Add ginger and garlic; stir 60 seconds until fragrant.',
      'Pour in broth and carrot slices. Bring to a gentle simmer — never a rolling boil.',
      'Reduce heat, cover, and steep 12 minutes so the ginger releases calmly.',
      'Stir in lemon juice. Taste and adjust salt. Strain if you prefer a clear sip.',
      'Serve warm in a mug with lemon rounds and parsley. Sip between meals, not all at once.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=organic+vegetable+broth+ginger+tea&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=vegetable+broth+ginger+lemon',
  },
  {
    id: 'iron-lentil-bowl',
    title: 'Iron-Rich Lentil & Spinach Power Bowl',
    subtitle: 'Earthy lentils, wilted greens, and citrus — steady energy for growing blood volume.',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 35,
    servings: 4,
    mealSlot: 'lunch',
    tags: {
      pregnant: ['iron-rich', 'protein'],
      dietary: ['vegetarian', 'vegan', 'peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '1 cup dried green or brown lentils, rinsed',
      '3 cups water or vegetable broth',
      '5 cups baby spinach',
      '1 red bell pepper, diced',
      '1 small red onion, minced',
      '2 tbsp olive oil',
      '1 tsp ground cumin',
      '1 tsp smoked paprika',
      'Juice of 1 lemon',
      'Salt and pepper to taste',
    ],
    steps: [
      'Simmer lentils in broth 22–25 minutes until tender but not mushy. Drain excess liquid if needed.',
      'In a wide pan, sauté onion and pepper in olive oil until softened, about 6 minutes.',
      'Add cumin and paprika; toast 30 seconds. Fold in cooked lentils and warm through.',
      'Remove from heat. Wilt spinach into the hot lentils until just collapsed.',
      'Finish with lemon juice, salt, and pepper. Serve in bowls while steamy.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=organic+lentils+canned+spinach&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=lentils+spinach+bell+pepper',
  },
  {
    id: 'lactation-oat-jar',
    title: 'Lactation Oat & Berry Overnight Jar',
    subtitle: 'Creamy oats, flax, and berries — a make-ahead morning ritual for nursing mamas.',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 10,
    servings: 2,
    mealSlot: 'breakfast',
    tags: {
      pregnant: ['lactation', 'protein'],
      dietary: ['vegetarian', 'peanut-free', 'shellfish-free'],
    },
    ingredients: [
      '1 cup rolled oats',
      '1½ cups whole milk or fortified oat milk',
      '2 tbsp ground flaxseed',
      '1 tbsp chia seeds',
      '1 tbsp honey or maple syrup',
      '1 cup mixed berries (fresh or thawed)',
      '¼ cup chopped walnuts',
      'Pinch of cinnamon',
      'Pinch of sea salt',
    ],
    steps: [
      'Combine oats, milk, flax, chia, sweetener, cinnamon, and salt in a jar. Stir well.',
      'Refrigerate at least 6 hours or overnight until thick and creamy.',
      'In the morning, layer berries and walnuts on top or stir them through.',
      'Eat chilled or warm gently in the microwave 45 seconds if you prefer cozy oats.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=organic+rolled+oats+flaxseed&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=rolled+oats+berries+flaxseed',
  },
  {
    id: 'chickpea-glow-salad',
    title: 'Mediterranean Chickpea Glow Salad',
    subtitle: 'Crunchy cucumbers, herbs, and lemon — light afternoon nourishment.',
    imageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 20,
    servings: 4,
    mealSlot: 'lunch',
    tags: {
      pregnant: ['fiber', 'hydration'],
      dietary: ['vegetarian', 'vegan', 'peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '2 cans chickpeas, rinsed and drained',
      '1 English cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '½ red onion, thinly sliced',
      '½ cup kalamata olives, pitted',
      '¼ cup fresh parsley, chopped',
      '¼ cup fresh mint, chopped',
      '3 tbsp extra-virgin olive oil',
      '2 tbsp lemon juice',
      '1 tsp dried oregano',
      'Salt and pepper to taste',
    ],
    steps: [
      'Pat chickpeas dry for a nicer texture. Combine with cucumber, tomatoes, and onion.',
      'Whisk olive oil, lemon juice, oregano, salt, and pepper in a small bowl.',
      'Toss salad with dressing. Fold in olives, parsley, and mint.',
      'Rest 10 minutes so flavors mingle. Serve at room temperature or chilled.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=organic+chickpeas+extra+virgin+olive+oil&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=chickpeas+cucumber+cherry+tomaotes',
  },
  {
    id: 'salmon-sweet-potato',
    title: 'Salmon & Roasted Sweet Potato Plate',
    subtitle: 'Omega-3 rich salmon with caramelized sweet potato — deeply satisfying dinner.',
    imageUrl:
      'https://images.unsplash.com/photo-1467003909585-bf69a37992c8?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 40,
    servings: 2,
    mealSlot: 'dinner',
    tags: {
      pregnant: ['omega-3', 'lactation', 'protein'],
      dietary: ['peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '2 wild-caught salmon fillets (5–6 oz each)',
      '2 medium sweet potatoes, cubed',
      '2 cups broccoli florets',
      '2 tbsp olive oil',
      '1 lemon, zested and juiced',
      '2 cloves garlic, minced',
      '1 tsp dried dill',
      'Salt and pepper to taste',
    ],
    steps: [
      'Heat oven to 425°F. Toss sweet potato cubes with 1 tbsp oil, salt, and pepper. Roast 18 minutes.',
      'Add broccoli to the sheet pan, drizzle remaining oil, roast 12 more minutes until tender.',
      'Pat salmon dry. Season with garlic, dill, lemon zest, salt, and pepper.',
      'Pan-sear salmon 4 minutes skin-side down, flip, cook 3–4 minutes until opaque.',
      'Plate salmon over roasted vegetables. Finish with lemon juice and serve immediately.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=wild+salmon+fillets+sweet+potato&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=salmon+fillets+sweet+potato+broccoli',
  },
  {
    id: 'coconut-ginger-soup',
    title: 'Creamy Coconut Ginger Comfort Soup',
    subtitle: 'Silky coconut broth with soft vegetables — calming for evening nausea or fatigue.',
    imageUrl:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 30,
    servings: 6,
    mealSlot: 'dinner',
    tags: {
      pregnant: ['anti-nausea', 'hydration'],
      dietary: ['vegetarian', 'vegan', 'peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '1 tbsp coconut oil',
      '1 yellow onion, diced',
      '2 tbsp fresh ginger, grated',
      '3 cups vegetable broth',
      '1 can full-fat coconut milk',
      '2 carrots, sliced',
      '1 zucchini, diced',
      '1 cup baby kale',
      'Juice of 1 lime',
      'Salt to taste',
    ],
    steps: [
      'Melt coconut oil over medium heat. Sauté onion and ginger until soft, about 5 minutes.',
      'Add carrots, zucchini, and broth. Simmer 12 minutes until vegetables yield easily.',
      'Stir in coconut milk and kale. Warm through 3 minutes — do not boil.',
      'Blend partially with an immersion blender for creaminess, or leave chunky.',
      'Finish with lime juice and salt. Ladle into bowls and breathe in the steam.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=coconut+milk+vegetable+broth+ginger&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=coconut+milk+ginger+vegetable+broth',
  },
  {
    id: 'yogurt-parfait',
    title: 'Honey Walnut Yogurt Parfait',
    subtitle: 'Layered protein and crunch — a gentle morning when appetite is returning.',
    imageUrl:
      'https://images.unsplash.com/photo-1571212515414-88974ccee396?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 8,
    servings: 1,
    mealSlot: 'breakfast',
    tags: {
      pregnant: ['lactation', 'protein', 'calcium'],
      dietary: ['vegetarian', 'peanut-free', 'shellfish-free'],
    },
    ingredients: [
      '1 cup plain whole-milk Greek yogurt',
      '2 tbsp honey',
      '¼ cup granola (low sugar)',
      '¼ cup walnuts, chopped',
      '½ cup sliced strawberries',
      '1 tbsp ground flaxseed',
      'Pinch of cinnamon',
    ],
    steps: [
      'Spoon half the yogurt into a glass or bowl.',
      'Drizzle 1 tbsp honey and sprinkle half the granola, walnuts, and flax.',
      'Add remaining yogurt, then top with berries, remaining crunch, and cinnamon.',
      'Enjoy immediately so granola stays crisp.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=greek+yogurt+granola+walnuts&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=greek+yogurt+strawberries+granola',
  },
  {
    id: 'quinoa-harvest-bowl',
    title: 'Roasted Vegetable Quinoa Harvest Bowl',
    subtitle: 'Rainbow roasted vegetables over fluffy quinoa — meal-prep friendly.',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 45,
    servings: 4,
    mealSlot: 'lunch',
    tags: {
      pregnant: ['fiber', 'iron-rich'],
      dietary: ['vegetarian', 'vegan', 'peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '1 cup quinoa, rinsed',
      '2 cups vegetable broth',
      '1 sweet potato, cubed',
      '1 cup Brussels sprouts, halved',
      '1 red bell pepper, chunked',
      '3 tbsp olive oil',
      '2 tsp balsamic vinegar',
      '1 tsp dried thyme',
      'Salt and pepper to taste',
      'Optional: tahini drizzle',
    ],
    steps: [
      'Cook quinoa in broth per package directions. Fluff and set aside.',
      'Toss vegetables with olive oil, thyme, salt, and pepper. Roast at 400°F for 25 minutes.',
      'Drizzle roasted vegetables with balsamic while hot.',
      'Divide quinoa among bowls. Top with vegetables and optional tahini.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=organic+quinoa+balsamic+vinegar&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=quinoa+brussels+sproouts+sweet+potato',
  },
  {
    id: 'golden-milk',
    title: 'Ginger Turmeric Golden Milk',
    subtitle: 'Warming night ritual — anti-inflammatory spices in cozy milk.',
    imageUrl:
      'https://images.unsplash.com/photo-1576092762791-2fd0672467fd?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 12,
    servings: 2,
    mealSlot: 'snack',
    tags: {
      pregnant: ['anti-nausea', 'lactation'],
      dietary: ['vegetarian', 'vegan', 'peanut-free', 'gluten-free', 'dairy-free', 'shellfish-free'],
    },
    ingredients: [
      '2 cups whole milk or unsweetened oat milk',
      '1 tsp ground turmeric',
      '½ tsp ground ginger',
      '¼ tsp ground cinnamon',
      'Pinch of black pepper',
      '1 tbsp honey or maple syrup',
      '½ tsp vanilla extract',
    ],
    steps: [
      'Warm milk in a small saucepan over low heat — gentle bubbles only.',
      'Whisk in turmeric, ginger, cinnamon, and pepper. Simmer 5 minutes.',
      'Sweeten with honey and stir in vanilla.',
      'Pour through a fine mesh strainer if you prefer silkier texture.',
      'Sip slowly before bed. Store leftovers refrigerated up to 2 days.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=organic+turmeric+ginger+golden+milk&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=turmeric+ginger+oat+milk',
  },
  {
    id: 'lactation-smoothie',
    title: 'Village Lactation Power Smoothie',
    subtitle: 'Banana, oats, and almond butter blended smooth — postpartum-friendly fuel.',
    imageUrl:
      'https://images.unsplash.com/photo-1505252585467-054154774f77?auto=format&fit=crop&w=900&q=80',
    prepMinutes: 5,
    servings: 2,
    mealSlot: 'breakfast',
    tags: {
      pregnant: ['lactation', 'protein'],
      dietary: ['vegetarian', 'peanut-free', 'shellfish-free'],
    },
    ingredients: [
      '1 ripe banana, frozen if possible',
      '½ cup rolled oats',
      '2 tbsp almond butter',
      '1 tbsp ground flaxseed',
      '1½ cups whole milk or almond milk',
      '1 tbsp honey',
      '½ tsp cinnamon',
      '1 cup ice (optional for thickness)',
    ],
    steps: [
      'Add all ingredients to a blender. Start on low, increase to high.',
      'Blend 45–60 seconds until completely smooth and pourable.',
      'Taste and adjust sweetness. Pour into glasses and drink within the hour.',
      'For extra lactation support, add a spoonful of brewer\'s yeast if tolerated.',
    ],
    amazonUrl:
      'https://www.amazon.com/s?k=almond+butter+flaxseed+rolled+oats&tag=calmmamavilla-20',
    instacartUrl: 'https://www.instacart.com/store/s?k=banana+almond+butter+oats+flaxseed',
  },
];

export const MAMA_KITCHEN_RECIPES = [
  ...HAND_CRAFTED_KITCHEN_RECIPES,
  ...generateKitchenCatalog(150 - HAND_CRAFTED_KITCHEN_RECIPES.length),
].slice(0, 150);

export function filterKitchenRecipes(recipes, dietaryFilter, timeOfDay) {
  let result = recipes;

  if (timeOfDay && KITCHEN_MEAL_SLOTS_BY_TIME[timeOfDay]) {
    const slots = KITCHEN_MEAL_SLOTS_BY_TIME[timeOfDay];
    result = result.filter((r) => slots.includes(r.mealSlot));
  }

  if (dietaryFilter) {
    result = result.filter((r) => r.tags.dietary?.includes(dietaryFilter));
  }

  return result;
}

export const KITCHEN_MEAL_SLOTS_BY_TIME = {
  morning: ['breakfast'],
  afternoon: ['lunch', 'snack'],
  night: ['dinner', 'snack'],
};

export function getDefaultKitchenTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}
