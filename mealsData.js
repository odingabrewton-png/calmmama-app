/** Mama's Kitchen — pregnancy rotation + postpartum plan + Little Bites */

import { assignKitchenImage } from './kitchenMealImages';
import { mealMatchesDietaryFilter, resolveMealDietaryTags } from './kitchenDietaryTags';

export const KITCHEN_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'peanut-free', label: 'Peanut-Free' },
  { id: 'shellfish-free', label: 'Shellfish-Free' },
];

export const KITCHEN_TIME_OF_DAY = ['morning', 'afternoon', 'night'];

export const KITCHEN_BACKGROUND_VIDEOS = {
  morning: require('./assets/gemini_generated_video_BD991A6E.mp4'),
  afternoon: require('./assets/gemini_generated_video_E0157921.mp4'),
  night: require('./assets/gemini_generated_video_91C45F70.mp4'),
};

export const mealsData = [
  // ==========================================
  // ☀️ MORNING CATEGORY (6 ITEMS)
  // ==========================================
  {
    id: 'm1',
    category: 'morning',
    title: 'Calm Overnight Oats',
    description:
      'Creamy, cold-soaked oats topped with chia, hemp seeds, and fresh berries for steady morning energy.',
    image:
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'm2',
    category: 'morning',
    title: 'Ginger Turmeric Golden Milk',
    description:
      'A warm, soothing anti-inflammatory tonic tailored for maternal recovery and cellular warmth.',
    image:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'm3',
    category: 'morning',
    title: 'Sunrise Cucumber Roll-Ups',
    description:
      'Crisp, refreshing, and packed with vital hydrating micronutrients and light herb cream cheese.',
    image:
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'm4',
    category: 'morning',
    title: 'Avocado Toast with Soft Eggs',
    description:
      'Thick whole-grain toast layered with rich mashed avocado, microgreens, and a soft-boiled egg for healthy fats.',
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'm5',
    category: 'morning',
    title: 'Sacred Berry Smoothie Bowl',
    description:
      'Blended berries, banana, and creamy yogurt crowned with granola — bright antioxidant fuel for busy mornings.',
    image:
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'm6',
    category: 'morning',
    title: 'Iron-Rich Lentil & Spinach Power Bowl',
    description:
      'A savory breakfast alternative packed with deep plant-based iron stores to beat maternal fatigue.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // 🌤️ NOON CATEGORY (6 ITEMS)
  // ==========================================
  {
    id: 'n1',
    category: 'noon',
    title: 'Radiant Veggie Spring Rolls',
    description:
      'Fresh rice paper rolls stuffed with crisp vegetables, herbs, and a light peanut dipping sauce.',
    image:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'n2',
    category: 'noon',
    title: 'Gentle Baked Salmon',
    description:
      'Flaky omega-3 rich salmon with roasted sweet potato rounds and a squeeze of lemon.',
    image:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'n3',
    category: 'noon',
    title: 'Chickpea Glow Salad',
    description:
      'Protein-packed chickpeas, cucumber ribbons, cherry tomatoes, and a lemon-tahini drizzle.',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'n4',
    category: 'noon',
    title: 'Quinoa Harvest Bowl',
    description:
      'Nutty quinoa topped with roasted seasonal vegetables, avocado, and a creamy herb dressing.',
    image:
      'https://images.unsplash.com/photo-1512058567296-6b3c2a31725a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'n5',
    category: 'noon',
    title: 'Coconut Ginger Comfort Soup',
    description:
      'Silky coconut broth with ginger, carrots, and soft lentils — gentle warmth for midday reset.',
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'n6',
    category: 'noon',
    title: 'Mediterranean Stuffed Peppers',
    description:
      'Bell peppers filled with herbed rice, olives, and feta — colorful, filling, and mama-friendly.',
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  },

  // ==========================================
  // 🌙 NIGHT CATEGORY (6 ITEMS)
  // ==========================================
  {
    id: 'e1',
    category: 'night',
    title: 'Lemon Ginger Anti-Nausea Broth',
    description:
      'A light, warming broth with fresh ginger and lemon — soothing for evening digestion.',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'e2',
    category: 'night',
    title: 'Lactation Power Smoothie',
    description:
      'Oats, flax, berries, and almond butter blended into a creamy evening nourishment shake.',
    image:
      'https://images.unsplash.com/photo-1505252585467-054154774f77?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'e3',
    category: 'night',
    title: 'Sheet Pan Herb Chicken',
    description:
      'Tender chicken thighs roasted with rainbow vegetables — one pan, minimal cleanup.',
    image:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'e4',
    category: 'night',
    title: 'Sweet Potato Black Bean Tacos',
    description:
      'Warm corn tortillas filled with spiced sweet potato, black beans, and creamy avocado.',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'e5',
    category: 'night',
    title: 'Creamy Mushroom Risotto',
    description:
      'Slow-stirred arborio rice with sautéed mushrooms — cozy, grounding evening comfort.',
    image:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'e6',
    category: 'night',
    title: 'Sesame Tofu Buddha Bowl',
    description:
      'Sesame-glazed tofu, steamed broccoli florets, and purple cabbage over a bed of fluffy brown jasmine rice.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },
];

/** Postpartum morning meals — local asset thumbnails + full recipes */
export const morningPostpartumMeals = [
  {
    id: 'postpartum_tahini_honey_toast',
    title: 'Tahini & Honey Drizzled Toast',
    description:
      'A creamy, nutty, and subtly sweet artisanal toast packed with healthy fats and essential minerals for early recovery.',
    vibe:
      'A creamy, nutty, and subtly sweet artisanal toast packed with healthy fats and essential minerals for early recovery.',
    benefits:
      "Postpartum Healing Benefits: Sesame tahini is an ancient postpartum powerhouse. It is exceptionally rich in highly absorbable calcium and healthy fats, which are vital for replenishing bone density depleted during childbirth and promoting a rich, steady breastmilk supply. The pure honey provides a gentle, easily digestible glycogen boost to help restore tired muscles.",
    image: require('./assets/images/tahini-honey-toast.jpg'),
    ingredients: [
      '2 Slices of artisanal whole-grain or sourdough bread',
      '2 tablespoons Sesame tahini paste',
      '1 tablespoon Pure honey',
      '1/2 teaspoon Toasted sesame seeds',
      'Optional: A few fresh, washed mint leaves for garnish',
    ],
    instructions: [
      'STEP 1: Toast the Bread: Toast your whole-grain or sourdough slices until beautifully crisp and warm.',
      'STEP 2: Spread the Base: Spread 1 tablespoon of rich, creamy tahini evenly across each warm slice.',
      'STEP 3: Drizzle and Finish: Drizzle the honey beautifully over the top, sprinkle with toasted sesame seeds, and enjoy immediately.',
    ],
    recipeSteps: [
      'STEP 1: Toast the Bread: Toast your whole-grain or sourdough slices until beautifully crisp and warm.',
      'STEP 2: Spread the Base: Spread 1 tablespoon of rich, creamy tahini evenly across each warm slice.',
      'STEP 3: Drizzle and Finish: Drizzle the honey beautifully over the top, sprinkle with toasted sesame seeds, and enjoy immediately.',
    ],
  },
  {
    id: 'postpartum_chili_crisp_avocado_toast',
    title: 'Chili Crisp Avocado Toast with a Fried Egg',
    description:
      'Creamy mashed avocado over crispy sourdough, topped with a fried egg and a warm, savory drizzle of chili crisp.',
    vibe:
      'Creamy mashed avocado over crispy sourdough, topped with a fried egg and a warm, savory drizzle of chili crisp.',
    benefits:
      "Postpartum Healing Benefits: Eggs are nature's premium source of Choline and high-quality protein, essential for repairing stretched tissues and supporting continuous infant brain development via breastmilk. The healthy monounsaturated fats in avocado aid in postpartum hormone stabilization and help keep energy levels steady throughout sleepless nights.",
    image: require('./assets/images/chili-crisp-avocado-toast.jpg'),
    ingredients: [
      '1-2 Slices of artisanal sourdough bread',
      '1 Ripe avocado, mashed',
      '1 Large egg (cooked to your preference)',
      '1-2 teaspoons Commercial chili crisp oil',
      'A pinch of everything bagel seasoning or sea salt',
    ],
    instructions: [
      'STEP 1: Layer the Toast: Toast your sourdough to a golden crunch, then spread your freshly mashed avocado generously from edge to edge.',
      'STEP 2: Cook the Egg: Fry or scramble your egg in a small skillet to your exact liking (runny yolks are 100% back on the menu for postpartum mamas!).',
      'STEP 3: Assemble and Garnish: Top the avocado with your hot egg, drizzle with savory chili crisp oil, dust with everything bagel seasoning, and dig in.',
    ],
    recipeSteps: [
      'STEP 1: Layer the Toast: Toast your sourdough to a golden crunch, then spread your freshly mashed avocado generously from edge to edge.',
      'STEP 2: Cook the Egg: Fry or scramble your egg in a small skillet to your exact liking (runny yolks are 100% back on the menu for postpartum mamas!).',
      'STEP 3: Assemble and Garnish: Top the avocado with your hot egg, drizzle with savory chili crisp oil, dust with everything bagel seasoning, and dig in.',
    ],
  },
  {
    id: 'postpartum_golden_milk_smoothie',
    title: 'Golden Milk Turmeric Smoothie',
    description:
      'A vibrant, velvety cold smoothie blended with warming, traditional anti-inflammatory spices.',
    vibe:
      'A vibrant, velvety cold smoothie blended with warming, traditional anti-inflammatory spices.',
    benefits:
      "Postpartum Healing Benefits: This smoothie acts as a deep tissue anti-inflammatory tonic. Turmeric (haridra) and ginger are celebrated in traditional postpartum recovery to dramatically soothe joint soreness, reduce systemic swelling, and actively protect nursing mamas against clogged ducts and mastitis. The tiny pinch of black pepper boosts your body's curcumin absorption exponentially.",
    image: require('./assets/images/golden-milk-smoothie.jpg'),
    ingredients: [
      '1 cup Milk or plant-based alternative',
      '1 Frozen ripe banana',
      '1/2 teaspoon Ground turmeric',
      '1/4 teaspoon Ground ginger',
      '1/4 teaspoon Ground cinnamon',
      '1 tablespoon Almond butter',
      'A tiny pinch of black pepper',
    ],
    instructions: [
      'STEP 1: Load the Blender: Add your milk base, frozen banana slices, and almond butter into your blender.',
      'STEP 2: Add Spices: Drop in the turmeric, ginger, cinnamon, and that vital tiny pinch of black pepper.',
      'STEP 3: Blend and Pour: Blend on high for 45-60 seconds until silky smooth, pour into a tall glass with a straw, and sip your way to healing.',
    ],
    recipeSteps: [
      'STEP 1: Load the Blender: Add your milk base, frozen banana slices, and almond butter into your blender.',
      'STEP 2: Add Spices: Drop in the turmeric, ginger, cinnamon, and that vital tiny pinch of black pepper.',
      'STEP 3: Blend and Pour: Blend on high for 45-60 seconds until silky smooth, pour into a tall glass with a straw, and sip your way to healing.',
    ],
  },
  {
    id: 'pp-morning-4',
    title: 'Sweet Potato & Turkey Sausage Breakfast Hash',
    vibe: 'A savory, colorful, and deeply satisfying skillet built to fuel busy mornings.',
    benefits:
      'Sweet potatoes offer complex carbs for sustained energy without a blood sugar crash, while turkey sausage provides clean protein to build and repair tissue.',
    timeline: '15 mins prep | 20 mins cook',
    kitchenTip:
      'Chop your sweet potatoes and onions ahead of time during Sunday prep. When morning comes, you just have to toss everything into the skillet.',
    image: require('./assets/sweet-potato-hash.jpg'),
    ingredients: [
      '1 lb high-quality lean turkey sausage, crumbled',
      '2 medium sweet potatoes, peeled and cut into 1/2-inch cubes',
      '1 tbsp olive oil or avocado oil',
      '1/2 bell pepper (any color), diced',
      '1/2 medium yellow onion, diced',
      '1/2 cup canned black beans, rinsed and drained',
      '2 to 4 large eggs',
      'Fresh cilantro and hot sauce (to taste)',
    ],
    recipeSteps: [
      'Heat the olive oil in a large cast-iron skillet over medium-high heat.',
      'Add the cubed sweet potatoes, cover the skillet with a lid, and cook for 8 to 10 minutes, stirring occasionally, until they start to soften and brown.',
      'Remove the lid, drop in the crumbled turkey sausage, diced onions, and diced bell peppers. Cook for 6 to 8 minutes, breaking the sausage apart with a spatula, until meat is thoroughly cooked.',
      'Stir in the black beans and spread the hash flat across the skillet. Use your spoon to create 2 to 4 little pockets in the mixture.',
      'Crack a fresh egg directly into each pocket. Turn the heat down to medium, cover the skillet, and cook for 4 to 5 minutes until the egg whites are solid but the yolks remain beautifully runny.',
      'Remove from heat, dust with fresh cilantro, drizzle with hot sauce, and serve straight out of the skillet.',
    ],
  },
  {
    id: 'pp-morning-5',
    title: 'Quinoa & Coconut Breakfast Porridge',
    vibe: 'A warm, protein-packed grain bowl with a creamy, rich coconut finish.',
    benefits:
      'Quinoa is a complete protein containing all nine essential amino acids to help rebuild tissue, while coconut milk provides healthy fats for nutrient absorption.',
    timeline: '5 mins prep | 15 mins cook',
    kitchenTip:
      'Rinse your quinoa thoroughly before cooking to remove bitterness. Toasting the grains dry in the pot for 1 minute before adding coconut milk unlocks an incredible nutty flavor.',
    image: require('./assets/quinoa-coconut-porridge.jpg'),
    ingredients: [
      '1 cup pre-rinsed white or tricolor quinoa',
      '1 can (13.5 oz) light coconut milk',
      '1 cup water',
      '1/2 tsp ground cinnamon',
      '1 tbsp honey or agave nectar',
      '1/4 cup toasted unsweetened coconut flakes',
      'Handful of fresh raspberries and blueberries',
    ],
    recipeSteps: [
      'Place your rinsed quinoa into a medium saucepan over medium heat. Toast the dry grains for 1 minute, stirring constantly, until you hear faint popping and smell a nutty aroma.',
      'Pour in the coconut milk, water, and ground cinnamon. Stir well and bring the mixture up to a rolling boil.',
      'Once boiling, drop the heat down to low, cover the saucepan with a tight lid, and let it simmer softly for 15 minutes until the liquid is fully absorbed.',
      'Remove the pan from the heat source and let it sit covered for an additional 5 minutes to fluff up perfectly.',
      'Remove the lid, stir in your choice of sweetener, and ladle into cozy bowls. Top generously with toasted coconut flakes and fresh berries.',
    ],
  },
  {
    id: 'pp-morning-6',
    title: 'Baked Pumpkin Oat Blender Muffins',
    vibe: 'A cozy, high-fiber baked bite perfect for a nursing station snack.',
    benefits:
      'Pumpkin is rich in vitamin A for tissue repair, while oats and flax boost lactation and stable energy levels.',
    timeline: '5 mins prep | 25 mins bake',
    kitchenTip:
      "Bake these in a silicone muffin tray. You don't need paper liners and they pop right out cleanly with zero sticking.",
    image: require('./assets/pumpkin-oat-muffins.jpg'),
    ingredients: [
      '2 cups old-fashioned rolled oats',
      '1 cup pure canned pumpkin puree (not pie mix)',
      '2 large eggs',
      '1/3 cup pure maple syrup',
      '2 tbsp melted coconut oil',
      '1 tsp vanilla extract',
      '1 tsp baking soda',
      '1.5 tsp pumpkin pie spice',
      '1/4 tsp salt',
      '2 tbsp extra rolled oats (for sprinkling on top)',
    ],
    recipeSteps: [
      'Preheat your oven to 350°F (175°C) and place a silicone 12-cup muffin pan onto a sturdy baking sheet.',
      'Dump every single ingredient (except the 2 tbsp of sprinkle oats) directly into a high-speed blender container.',
      'Blend on high for 30 to 45 seconds until the batter is perfectly smooth, thick, and creamy.',
      'Divide the batter evenly among the 12 muffin cups. Sprinkle a tiny pinch of the raw rolled oats across the top of each muffin for a bakery-style look.',
      'Bake for 20 to 22 minutes until the tops bounce back lightly when pressed and a toothpick inserted in the center comes out clean.',
      'Let them cool inside the pan for 10 minutes, then easily pop them out onto a wire rack to finish cooling.',
    ],
  },
  {
    id: 'postpartum_cheddar_spinach_quesadilla',
    title: 'Cheddar & Spinach Breakfast Quesadilla',
    description:
      'A crispy, warm whole-wheat tortilla packed with fluffy scrambled eggs, melted sharp cheddar, and iron-dense wilted spinach.',
    vibe:
      'A crispy, warm whole-wheat tortilla packed with fluffy scrambled eggs, melted sharp cheddar, and iron-dense wilted spinach.',
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Childbirth involves significant blood loss, making immediate iron replenishment a critical priority to prevent fatigue. Warm wilted spinach provides an excellent plant-based source of iron and folate, while the eggs deliver complete proteins needed to repair pelvic floor and abdominal tissues. Sharp cheddar adds a rich dose of calcium to assist with uterine muscle recovery.',
    image: require('./assets/images/cheddar-spinach-quesadilla.jpg'),
    ingredients: [
      '1 Whole-wheat or flour tortilla',
      '2 Large eggs, whisked thoroughly',
      '1/2 cup Fresh baby spinach (washed meticulously)',
      '1/4 cup Shredded sharp cheddar cheese',
      '1 teaspoon Unsalted butter or olive oil',
      'Optional: Fresh tomato salsa and a dollop of Greek yogurt',
    ],
    instructions: [
      'STEP 1: Sauté and Scramble: Melt half the butter in a skillet over medium heat. Toss in your washed spinach until lightly wilted, pour in the whisked eggs, and scramble gently until fully cooked. Set aside.',
      'STEP 2: Assemble the Quesadilla: Clean the skillet, melt the remaining butter, and place the tortilla flat. Sprinkle half the cheddar cheese over one side, layer on the warm spinach and eggs, and top with the remaining cheese before folding the tortilla in half.',
      'STEP 3: Crisp and Melt: Cook for 2–3 minutes until the bottom is a beautiful golden brown, then flip carefully to crisp up the other side and fully melt the cheese layout.',
      'STEP 4: Slice and Serve: Slide the quesadilla onto a cutting board, slice into neat wedges, and serve hot with fresh salsa or Greek yogurt.',
    ],
    recipeSteps: [
      'STEP 1: Sauté and Scramble: Melt half the butter in a skillet over medium heat. Toss in your washed spinach until lightly wilted, pour in the whisked eggs, and scramble gently until fully cooked. Set aside.',
      'STEP 2: Assemble the Quesadilla: Clean the skillet, melt the remaining butter, and place the tortilla flat. Sprinkle half the cheddar cheese over one side, layer on the warm spinach and eggs, and top with the remaining cheese before folding the tortilla in half.',
      'STEP 3: Crisp and Melt: Cook for 2–3 minutes until the bottom is a beautiful golden brown, then flip carefully to crisp up the other side and fully melt the cheese layout.',
      'STEP 4: Slice and Serve: Slide the quesadilla onto a cutting board, slice into neat wedges, and serve hot with fresh salsa or Greek yogurt.',
    ],
  },
  {
    id: 'postpartum_pb_lactation_bites',
    title: 'Peanut Butter Cookie Lactation Bites',
    description:
      'Chewy, sweet, and satisfying no-bake energy bites packed with natural galactagogues to support healthy milk production.',
    vibe:
      'Chewy, sweet, and satisfying no-bake energy bites packed with natural galactagogues to support healthy milk production.',
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: These bites are an absolute lifesaver for breastfeeding mamas. Rolled oats and ground flaxseed are classic galactagogues, historically trusted to naturally boost breastmilk volume and quality. The creamy peanut butter serves as a source of clean protein and dense caloric energy to support the demanding physical workloads of lactation, while a touch of dark chocolate chips provides a blissful antioxidant release.',
    image: require('./assets/images/pb-lactation-bites.jpg'),
    ingredients: [
      '2 cups Old-fashioned rolled oats',
      '1 cup Creamy natural peanut butter',
      '1/2 cup Pure maple syrup or pasteurized honey',
      '1/4 cup Ground flaxseed meal',
      '1/3 cup Semi-sweet dark chocolate chips',
      '1 teaspoon Pure vanilla extract',
      'A pinch of sea salt',
    ],
    instructions: [
      'STEP 1: Combine the Base: In a large mixing bowl, stir together the rolled oats, ground flaxseed meal, and a pinch of sea salt until thoroughly combined.',
      'STEP 2: Bind the Dough: Add the creamy peanut butter, pure maple syrup or honey, and vanilla extract. Fold everything together vigorously until a thick, cohesive cookie-dough texture forms.',
      'STEP 3: Fold in Sweetness: Gently fold in your dark chocolate chips until evenly distributed throughout the mixture layout.',
      'STEP 4: Roll and Chill: Scoop out tablespoon-sized portions and roll them tightly into smooth spheres using your hands. Place the bites on a parchment-lined tray and chill in the refrigerator for at least 30 minutes to firm up before snacking. Store in an airtight container for up to 2 weeks!',
    ],
    recipeSteps: [
      'STEP 1: Combine the Base: In a large mixing bowl, stir together the rolled oats, ground flaxseed meal, and a pinch of sea salt until thoroughly combined.',
      'STEP 2: Bind the Dough: Add the creamy peanut butter, pure maple syrup or honey, and vanilla extract. Fold everything together vigorously until a thick, cohesive cookie-dough texture forms.',
      'STEP 3: Fold in Sweetness: Gently fold in your dark chocolate chips until evenly distributed throughout the mixture layout.',
      'STEP 4: Roll and Chill: Scoop out tablespoon-sized portions and roll them tightly into smooth spheres using your hands. Place the bites on a parchment-lined tray and chill in the refrigerator for at least 30 minutes to firm up before snacking. Store in an airtight container for up to 2 weeks!',
    ],
  },
  {
    id: 'postpartum_warm_berry_oatmeal_bowl',
    title: 'Warm Berry-Infused Oatmeal Bowl',
    description:
      'A deeply comforting, hearty bowl of rolled oats simmered to a creamy perfection and swirled with a warm, antioxidant-rich mixed berry compote.',
    vibe:
      'A deeply comforting, hearty bowl of rolled oats simmered to a creamy perfection and swirled with a warm, antioxidant-rich mixed berry compote.',
    isPremium: true,
    benefits:
      "Postpartum Healing Benefits: A substantial, warm bowl of fiber-rich oats is exactly what an early postpartum body needs to gently restart the digestive system and prevent postpartum constipation. Oats are an incredibly rich source of iron, beta-glucans, and complex carbohydrates, which work together to steadily fuel milk production and curb intense nursing hunger. The warm berry infusion adds a massive wave of Vitamin C, optimizing your body's cellular tissue repair and iron absorption simultaneously.",
    image: require('./assets/images/berry-infusions-oatmeal.jpg'),
    ingredients: [
      '1 cup Old-fashioned rolled oats (plenty of volume for hungry mamas)',
      '2 cups Almond milk, whole milk, or water',
      '1/2 cup Mixed berries (strawberries, blueberries, raspberries)',
      '1 tablespoon Pure maple syrup or honey',
      '1 tablespoon Chia seeds or pumpkin seeds (for healthy crunch and zinc)',
      '1/2 teaspoon Ground cinnamon',
    ],
    instructions: [
      'STEP 1: Simmer the Oats: In a small saucepan, bring your choice of milk or water to a gentle boil. Stir in the generous portion of rolled oats and turn the heat down to low. Simmer for 5–7 minutes, stirring occasionally, until beautifully thick, creamy, and high-volume.',
      'STEP 2: Swirl the Berry Infusion: In a separate small microwave-safe bowl or tiny saucepan, heat your mixed berries with a splash of water and the maple syrup for 1–2 minutes until they become hot, soft, and release their gorgeous purple juices.',
      'STEP 3: Assemble and Layer: Pour the abundant oatmeal base into a wide comforting bowl. Spoon the warm berry compote directly over the top, letting the antioxidant juices swirl beautifully into the creamy oats.',
      'STEP 4: Garnish and Enjoy Warm: Dust with ground cinnamon, scatter your chia or pumpkin seeds over the berries, and dive into this comforting bowl with a spoon while it is steaming hot.',
    ],
    recipeSteps: [
      'STEP 1: Simmer the Oats: In a small saucepan, bring your choice of milk or water to a gentle boil. Stir in the generous portion of rolled oats and turn the heat down to low. Simmer for 5–7 minutes, stirring occasionally, until beautifully thick, creamy, and high-volume.',
      'STEP 2: Swirl the Berry Infusion: In a separate small microwave-safe bowl or tiny saucepan, heat your mixed berries with a splash of water and the maple syrup for 1–2 minutes until they become hot, soft, and release their gorgeous purple juices.',
      'STEP 3: Assemble and Layer: Pour the abundant oatmeal base into a wide comforting bowl. Spoon the warm berry compote directly over the top, letting the antioxidant juices swirl beautifully into the creamy oats.',
      'STEP 4: Garnish and Enjoy Warm: Dust with ground cinnamon, scatter your chia or pumpkin seeds over the berries, and dive into this comforting bowl with a spoon while it is steaming hot.',
    ],
  },
];

/** Pregnant morning premium meals — local asset thumbnails + full recipes */
export const morningPregnantMeals = [
  {
    id: 'pregnant_spinach_cheddar_scramble',
    title: 'Sautéed Spinach & Pasteurized Cheddar Scramble',
    description:
      'A creamy, iron-rich egg scramble over thick-cut whole wheat toast — gentle, savory morning nourishment for growing mamas.',
    vibe:
      'A creamy, iron-rich egg scramble over thick-cut whole wheat toast — gentle, savory morning nourishment for growing mamas.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Iron-dense spinach helps support expanding blood volume as your baby grows, while pasteurized eggs deliver essential choline for fetal brain development.',
    image: require('./assets/images/spinach_cheddar_toast.jpg'),
    ingredients: [
      '2 large pasteurized eggs',
      '1 cup fresh organic spinach',
      '1/4 cup shredded pasteurized sharp cheddar cheese',
      '1 slice thick-cut whole wheat artisanal toast',
      '1 tsp olive oil',
      'Pinch of sea salt, black pepper, and micro-chives for garnish',
    ],
    instructions: [
      'Heat olive oil in a small non-stick skillet over medium-low heat.',
      'Add fresh spinach and sauté gently for 1-2 minutes until just wilted.',
      'Whisk eggs thoroughly in a small bowl, then pour into the skillet with the spinach.',
      'Cook low and slow, folding gently with a spatula until soft curds form.',
      'Sprinkle cheddar cheese over the top right before turning off the heat, letting it melt smoothly.',
      'Toast your whole wheat bread, plate it, and spoon the creamy scramble over the top. Garnish with pepper and micro-chives.',
    ],
    recipeSteps: [
      'Heat olive oil in a small non-stick skillet over medium-low heat.',
      'Add fresh spinach and sauté gently for 1-2 minutes until just wilted.',
      'Whisk eggs thoroughly in a small bowl, then pour into the skillet with the spinach.',
      'Cook low and slow, folding gently with a spatula until soft curds form.',
      'Sprinkle cheddar cheese over the top right before turning off the heat, letting it melt smoothly.',
      'Toast your whole wheat bread, plate it, and spoon the creamy scramble over the top. Garnish with pepper and micro-chives.',
    ],
  },
  {
    id: 'pregnant_cheesy_grits_eggs',
    title: 'Savory Cheesy Grits with Scrambled Eggs',
    description:
      'Velvety stone-ground grits crowned with soft scrambled eggs — a warm, grounding Southern-style breakfast for steady pregnancy energy.',
    vibe:
      'Velvety stone-ground grits crowned with soft scrambled eggs — a warm, grounding Southern-style breakfast for steady pregnancy energy.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Warm, stone-ground grits offer easily digestible complex carbohydrates for stable morning energy, while bone broth bases supply amino acids that support tissue growth for you and baby.',
    image: require('./assets/images/cheesy_grits_eggs.jpg'),
    ingredients: [
      '1/4 cup stone-ground yellow grits',
      '1 cup water or bone broth (for extra protein)',
      '2 tbsp organic butter',
      '1/3 cup shredded mild cheddar or gouda cheese',
      '2 large scrambled eggs',
      'Salt and fresh cracked pepper to taste',
    ],
    instructions: [
      'Bring water or bone broth to a rolling boil in a small saucepan with a pinch of salt.',
      'Slowly whisk in the grits, reduce heat to low, cover, and let simmer for 15-20 minutes, stirring occasionally until thick and creamy.',
      'Stir in the butter and cheddar cheese until completely melted and velvety.',
      'In a separate pan, scramble two eggs to a soft, fluffy texture.',
      'Spoon the warm, cheesy grits into a comforting bowl and top with the scrambled eggs.',
      'Season lightly with fresh black pepper and serve warm.',
    ],
    recipeSteps: [
      'Bring water or bone broth to a rolling boil in a small saucepan with a pinch of salt.',
      'Slowly whisk in the grits, reduce heat to low, cover, and let simmer for 15-20 minutes, stirring occasionally until thick and creamy.',
      'Stir in the butter and cheddar cheese until completely melted and velvety.',
      'In a separate pan, scramble two eggs to a soft, fluffy texture.',
      'Spoon the warm, cheesy grits into a comforting bowl and top with the scrambled eggs.',
      'Season lightly with fresh black pepper and serve warm.',
    ],
  },
  {
    id: 'pregnant_berry_chia_hemp_bowl',
    title: 'Berry Chia & Hemp Seed Pudding Bowl',
    description:
      'A cool, luxurious chia pudding layered with wild berries and hemp hearts — make-ahead Omega-3 fuel for busy pregnancy mornings.',
    vibe:
      'A cool, luxurious chia pudding layered with wild berries and hemp hearts — make-ahead Omega-3 fuel for busy pregnancy mornings.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Chia and hemp hearts provide Omega-3 fatty acids and plant-based protein to support fetal brain development and help ease pregnancy-related joint inflammation.',
    image: require('./assets/images/berry_chia_hemp_bowl.jpg'),
    ingredients: [
      '3 tbsp organic chia seeds',
      '1 cup unsweetened almond or coconut milk',
      '1 tbsp pure maple syrup or raw honey',
      '1/4 cup fresh wild blueberries and raspberries',
      '2 tbsp shelled hemp hearts',
      'Fresh mint leaf for garnish',
    ],
    instructions: [
      'In a mason jar or bowl, whisk together the chia seeds, plant milk, and maple syrup.',
      'Let the mixture sit for 5 minutes, give it one more thorough stir to prevent clumping, then cover and refrigerate for at least 2 hours (or overnight).',
      'Once set into a thick, luxurious pudding, spoon it into your serving bowl.',
      'Arrange fresh blueberries and raspberries beautifully across one side.',
      'Sprinkle the nutrient-dense hemp hearts heavily over the top.',
      'Garnish with a fresh mint leaf and enjoy cool.',
    ],
    recipeSteps: [
      'In a mason jar or bowl, whisk together the chia seeds, plant milk, and maple syrup.',
      'Let the mixture sit for 5 minutes, give it one more thorough stir to prevent clumping, then cover and refrigerate for at least 2 hours (or overnight).',
      'Once set into a thick, luxurious pudding, spoon it into your serving bowl.',
      'Arrange fresh blueberries and raspberries beautifully across one side.',
      'Sprinkle the nutrient-dense hemp hearts heavily over the top.',
      'Garnish with a fresh mint leaf and enjoy cool.',
    ],
  },
  {
    id: 'pregnant_salsa_chicken_breakfast_tacos',
    title: 'Breakfast Tacos with Eggs & Salsa Chicken',
    description:
      'Warm corn tortillas layered with soft scrambled eggs, mild salsa chicken, avocado, and cilantro — a savory, handheld morning feast.',
    vibe:
      'Warm corn tortillas layered with soft scrambled eggs, mild salsa chicken, avocado, and cilantro — a savory, handheld morning feast.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Lean protein from chicken supports healthy maternal tissue growth, while avocado delivers healthy fats crucial for absorbing fat-soluble vitamins like A, D, E, and K during pregnancy.',
    image: require('./assets/images/salsa_chicken_tacos.jpg'),
    ingredients: [
      '2 organic corn or flour tortillas',
      '1/2 cup shredded chicken breast tossed in mild salsa',
      '2 large eggs, scrambled softly',
      '1/4 fresh avocado, sliced',
      '1 tbsp crumbled cotija or pasteurized fresco cheese',
      'Fresh cilantro for garnish',
    ],
    instructions: [
      'Warm the salsa chicken gently in a small skillet over medium-low heat until heated through, then set aside.',
      'In a separate non-stick pan, cook your whisked eggs over low heat, folding gently until soft and fluffy.',
      'Warm the tortillas directly over a low flame or in a dry pan for 30 seconds on each side until pliable.',
      'Assemble the tacos by dividing the soft scrambled eggs and warm salsa chicken evenly between the tortillas.',
      'Top each taco with fresh avocado slices and a sprinkle of crumbled pasteurized cheese.',
      'Garnish with fresh torn cilantro leaves and serve immediately with extra salsa if desired.',
    ],
    recipeSteps: [
      'Warm the salsa chicken gently in a small skillet over medium-low heat until heated through, then set aside.',
      'In a separate non-stick pan, cook your whisked eggs over low heat, folding gently until soft and fluffy.',
      'Warm the tortillas directly over a low flame or in a dry pan for 30 seconds on each side until pliable.',
      'Assemble the tacos by dividing the soft scrambled eggs and warm salsa chicken evenly between the tortillas.',
      'Top each taco with fresh avocado slices and a sprinkle of crumbled pasteurized cheese.',
      'Garnish with fresh torn cilantro leaves and serve immediately with extra salsa if desired.',
    ],
  },
  {
    id: 'pregnant_lox_cream_cheese_bagel',
    title: 'Smoked Salmon (Lox) Bagel with Full-Fat Cream Cheese',
    description:
      'A classic whole-grain bagel topped with velvety cream cheese, wild lox, capers, and dill — elegant Omega-3 nourishment for pregnancy mornings.',
    vibe:
      'A classic whole-grain bagel topped with velvety cream cheese, wild lox, capers, and dill — elegant Omega-3 nourishment for pregnancy mornings.',
    isPremium: true,
    benefits:
      "Pregnancy Nourishment Benefits: Wild-caught salmon is packed with DHA and Omega-3 fatty acids that cross the placenta to support your baby's cognitive and visual development while helping stabilize mood swings during pregnancy.",
    image: require('./assets/images/lox_cream_cheese_bagel.jpg'),
    ingredients: [
      '1 artisanal whole grain bagel',
      '2 oz premium wild-caught smoked salmon (lox)',
      '2 tbsp full-fat pasteurized cream cheese',
      '2 thin slices of red onion',
      '1 tsp capers, drained',
      'Fresh dill sprigs and a squeeze of fresh lemon',
    ],
    instructions: [
      'Slice the whole grain bagel in half and toast to your desired golden crispness.',
      'Spread a thick, even layer of full-fat pasteurized cream cheese across both warm toasted halves.',
      'Layer the smoked salmon slices gently over the cream cheese foundation.',
      'Top with thinly sliced red onion rings and scatter the capers evenly over the fish.',
      'Garnish with a few sprigs of fresh dill and add a light, bright squeeze of fresh lemon juice right before serving.',
    ],
    recipeSteps: [
      'Slice the whole grain bagel in half and toast to your desired golden crispness.',
      'Spread a thick, even layer of full-fat pasteurized cream cheese across both warm toasted halves.',
      'Layer the smoked salmon slices gently over the cream cheese foundation.',
      'Top with thinly sliced red onion rings and scatter the capers evenly over the fish.',
      'Garnish with a few sprigs of fresh dill and add a light, bright squeeze of fresh lemon juice right before serving.',
    ],
  },
  {
    id: 'pregnant_banana_berry_smoothie',
    title: 'Banana and Berry Smoothie',
    description:
      'A velvety frozen banana and mixed berry blend with hemp seeds — bright, antioxidant-rich hydration in a chilled glass.',
    vibe:
      'A velvety frozen banana and mixed berry blend with hemp seeds — bright, antioxidant-rich hydration in a chilled glass.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Bananas supply crucial potassium to ease pregnancy muscle cramps and fatigue, while mixed berries deliver antioxidants that support immune health and reduce inflammation.',
    image: require('./assets/images/banana_berry_smoothie.jpg'),
    ingredients: [
      '1 ripe frozen banana',
      '1/2 cup mixed organic berries (strawberries, raspberries, blackberries)',
      '1 cup unsweetened almond milk or Greek yogurt',
      '1 tbsp organic hemp seeds',
      '1 tsp pure honey or maple syrup (optional)',
    ],
    instructions: [
      'Peel and slice your frozen banana into manageable chunks.',
      'Wash the fresh mixed berries thoroughly and add them directly into your high-speed blender container.',
      'Add the banana chunks, pour in the almond milk, and toss in the nutrient-dense hemp seeds.',
      'Secure the blender lid and blend on high speed for 45-60 seconds until completely velvety and smooth.',
      'Pour into a chilled glass and top with a few extra fresh berries or a sprinkle of hemp hearts for a beautiful aesthetic.',
    ],
    recipeSteps: [
      'Peel and slice your frozen banana into manageable chunks.',
      'Wash the fresh mixed berries thoroughly and add them directly into your high-speed blender container.',
      'Add the banana chunks, pour in the almond milk, and toss in the nutrient-dense hemp seeds.',
      'Secure the blender lid and blend on high speed for 45-60 seconds until completely velvety and smooth.',
      'Pour into a chilled glass and top with a few extra fresh berries or a sprinkle of hemp hearts for a beautiful aesthetic.',
    ],
  },
];

/** Pregnant noon / lunch meals — local asset thumbnails + full recipes */
export const lunchPregnantMeals = [
  {
    id: 'pregnant_turkey_sloppy_joes',
    title: 'Ground Turkey Sloppy Joes',
    description:
      'A savory, high-protein sloppy joe on whole wheat brioche — warm, satisfying, and cooked thoroughly for prenatal safety.',
    vibe:
      'A savory, high-protein sloppy joe on whole wheat brioche — warm, satisfying, and cooked thoroughly for prenatal safety.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Lean ground turkey provides an abundance of zinc and vital protein to support maternal tissue expansion, while cooked bell peppers offer Vitamin C to aid in iron absorption.',
    image: require('./assets/images/turkey_sloppy_joes.jpg'),
    ingredients: [
      '1 lb lean ground turkey',
      '1/2 cup finely diced sweet onion',
      '1/2 cup finely diced green bell pepper',
      '1 can (8 oz) organic tomato sauce',
      '2 tbsp tomato paste',
      '1 tbsp pure maple syrup or coconut aminos',
      '1 tsp garlic powder',
      '4 whole wheat brioche buns',
    ],
    instructions: [
      'Heat a large skillet over medium heat and add the ground turkey, breaking it apart with a spatula.',
      'Add the finely diced onions and bell peppers directly into the turkey while it browns, cooking for 5-7 minutes until the vegetables are tender.',
      'Drain any excess fat from the skillet.',
      'Pour in the tomato sauce, tomato paste, maple syrup, and garlic powder. Stir thoroughly to combine all ingredients.',
      'Reduce heat to low and let simmer uncovered for 10-12 minutes until the sauce thickens into a rich, savory glaze.',
      'Toast your whole wheat brioche buns lightly, then spoon a generous portion of the hot turkey sloppy joe mixture onto each bun and serve warm.',
    ],
    recipeSteps: [
      'Heat a large skillet over medium heat and add the ground turkey, breaking it apart with a spatula.',
      'Add the finely diced onions and bell peppers directly into the turkey while it browns, cooking for 5-7 minutes until the vegetables are tender.',
      'Drain any excess fat from the skillet.',
      'Pour in the tomato sauce, tomato paste, maple syrup, and garlic powder. Stir thoroughly to combine all ingredients.',
      'Reduce heat to low and let simmer uncovered for 10-12 minutes until the sauce thickens into a rich, savory glaze.',
      'Toast your whole wheat brioche buns lightly, then spoon a generous portion of the hot turkey sloppy joe mixture onto each bun and serve warm.',
    ],
  },
  {
    id: 'pregnant_chicken_pesto_pasta',
    title: 'Warm Pasta Salad with Chicken & Pesto',
    description:
      'Steaming rotini tossed with grilled chicken, wilted spinach, cherry tomatoes, and basil pesto — a fiber-rich pregnancy power lunch.',
    vibe:
      'Steaming rotini tossed with grilled chicken, wilted spinach, cherry tomatoes, and basil pesto — a fiber-rich pregnancy power lunch.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Using chickpea or whole wheat pasta dramatically increases fiber to aid prenatal digestion, while basil pesto offers antioxidant properties alongside high-quality clean proteins from chicken.',
    image: require('./assets/images/chicken_pesto_pasta.jpg'),
    ingredients: [
      '8 oz whole wheat or chickpea rotini pasta',
      '2 cups pre-cooked grilled chicken breast, sliced',
      '1/2 cup prepared basil pesto',
      '1 cup organic cherry tomatoes, halved',
      '2 cups fresh baby spinach',
      '1/4 cup toasted pine nuts',
      '1/4 cup shredded pasteurized parmesan cheese',
    ],
    instructions: [
      'Bring a large pot of salted water to a boil. Cook the rotini pasta according to the package directions, then drain, reserving 1/4 cup of warm pasta water.',
      'While the pasta is still steaming hot, return it to the pot and toss in the fresh baby spinach, allowing the residual heat to gently wilt the greens.',
      'Add the sliced grilled chicken breast, halved cherry tomatoes, and basil pesto to the pot.',
      'Gently stir all ingredients together, adding a splash of the reserved warm pasta water if needed to loosen the pesto into a smooth, even sauce.',
      'Transfer the warm pasta salad to a serving bowl.',
      'Top with a sprinkle of toasted pine nuts and shredded pasteurized parmesan cheese right before serving.',
    ],
    recipeSteps: [
      'Bring a large pot of salted water to a boil. Cook the rotini pasta according to the package directions, then drain, reserving 1/4 cup of warm pasta water.',
      'While the pasta is still steaming hot, return it to the pot and toss in the fresh baby spinach, allowing the residual heat to gently wilt the greens.',
      'Add the sliced grilled chicken breast, halved cherry tomatoes, and basil pesto to the pot.',
      'Gently stir all ingredients together, adding a splash of the reserved warm pasta water if needed to loosen the pesto into a smooth, even sauce.',
      'Transfer the warm pasta salad to a serving bowl.',
      'Top with a sprinkle of toasted pine nuts and shredded pasteurized parmesan cheese right before serving.',
    ],
  },
  {
    id: 'pregnant_tomato_soup_grilled_cheese',
    title: 'Creamy Tomato Soup & Classic Grilled Cheese',
    description:
      'Silky organic tomato soup paired with a golden pasteurized cheddar grilled cheese — deeply comforting and nausea-gentle.',
    vibe:
      'Silky organic tomato soup paired with a golden pasteurized cheddar grilled cheese — deeply comforting and nausea-gentle.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Cooked tomato lycopene provides excellent cellular protection, while warm sourdough paired with pasteurized cheese offers a deeply comforting, nausea-safe lunch option.',
    image: require('./assets/images/tomato_soup_grilled_cheese.jpg'),
    ingredients: [
      '1 can (28 oz) organic crushed tomatoes',
      '1/2 cup low-sodium vegetable or bone broth',
      '1/4 cup heavy cream or full-fat coconut milk',
      '1 tsp dried basil',
      '2 slices whole grain sourdough bread',
      '2 slices pasteurized sharp cheddar cheese',
      '1 tbsp organic butter',
    ],
    instructions: [
      'In a medium saucepan, combine the crushed tomatoes, vegetable or bone broth, and dried basil over medium heat. Bring to a gentle simmer for 10 minutes.',
      'Remove the soup from the heat and use an immersion blender to process until perfectly silky and smooth.',
      'Stir in the heavy cream or coconut milk gently, then return to low heat to keep warm.',
      'Butter one side of each slice of sourdough bread evenly.',
      'Place one slice butter-side down in a skillet, layer with the pasteurized cheddar cheese slices, and top with the second bread slice, butter-side up.',
      'Grill over medium-low heat for 3-4 minutes per side until the bread is a deep golden brown and the cheddar is thoroughly melted. Serve sliced alongside a warm bowl of the soup.',
    ],
    recipeSteps: [
      'In a medium saucepan, combine the crushed tomatoes, vegetable or bone broth, and dried basil over medium heat. Bring to a gentle simmer for 10 minutes.',
      'Remove the soup from the heat and use an immersion blender to process until perfectly silky and smooth.',
      'Stir in the heavy cream or coconut milk gently, then return to low heat to keep warm.',
      'Butter one side of each slice of sourdough bread evenly.',
      'Place one slice butter-side down in a skillet, layer with the pasteurized cheddar cheese slices, and top with the second bread slice, butter-side up.',
      'Grill over medium-low heat for 3-4 minutes per side until the bread is a deep golden brown and the cheddar is thoroughly melted. Serve sliced alongside a warm bowl of the soup.',
    ],
  },
  {
    id: 'pregnant_turkey_provolone_melt',
    title: 'Steaming Hot Turkey & Provolone Melt',
    description:
      'A golden pressed melt with listeria-safe steaming hot turkey, pasteurized provolone, and fresh tomato on artisan whole grain bread.',
    vibe:
      'A golden pressed melt with listeria-safe steaming hot turkey, pasteurized provolone, and fresh tomato on artisan whole grain bread.',
    isPremium: true,
    benefits:
      "Pregnancy Nourishment Benefits: Heating deli meat until steaming hot ensures absolute safety during pregnancy, while whole grains supply B-vitamins to help sustain mama's afternoon energy levels.",
    image: require('./assets/images/turkey_provolone_melt.jpg'),
    ingredients: [
      '3-4 slices premium deli turkey breast',
      '2 slices pasteurized provolone cheese',
      '2 slices whole grain artisanal bread',
      '1 tbsp olive oil mayonnaise or basil pesto',
      '2 slices fresh tomato',
      '1 tsp organic butter',
    ],
    instructions: [
      'CRUCIAL PRENATAL STEP: Place the deli turkey slices in a skillet or microwave and heat thoroughly until steaming hot throughout (reaching 165°F) to ensure complete safety against listeria bacteria.',
      'Spread the olive oil mayonnaise or basil pesto evenly across the inner sides of both slices of whole grain bread.',
      'Layer the steaming hot turkey slices over one slice of bread, top with fresh tomato slices, and cover with the pasteurized provolone cheese.',
      'Close the sandwich and butter the outer surfaces of the bread lightly.',
      'Place the sandwich into a preheated skillet over medium heat.',
      'Grill for approximately 3 minutes on each side, pressing down gently with a spatula, until the provolone cheese is entirely melted and bubbly and the bread is perfectly toasted.',
    ],
    recipeSteps: [
      'CRUCIAL PRENATAL STEP: Place the deli turkey slices in a skillet or microwave and heat thoroughly until steaming hot throughout (reaching 165°F) to ensure complete safety against listeria bacteria.',
      'Spread the olive oil mayonnaise or basil pesto evenly across the inner sides of both slices of whole grain bread.',
      'Layer the steaming hot turkey slices over one slice of bread, top with fresh tomato slices, and cover with the pasteurized provolone cheese.',
      'Close the sandwich and butter the outer surfaces of the bread lightly.',
      'Place the sandwich into a preheated skillet over medium heat.',
      'Grill for approximately 3 minutes on each side, pressing down gently with a spatula, until the provolone cheese is entirely melted and bubbly and the bread is perfectly toasted.',
    ],
  },
  {
    id: 'pregnant_hard_boiled_eggs_seasoning',
    title: 'Hard-Boiled Egg with Everything Bagel Seasoning',
    description:
      'Fully cooked pasteurized eggs dusted with everything bagel seasoning — a clean, choline-rich lunch with crisp cucumber and carrots.',
    vibe:
      'Fully cooked pasteurized eggs dusted with everything bagel seasoning — a clean, choline-rich lunch with crisp cucumber and carrots.',
    isPremium: true,
    benefits:
      "Pregnancy Nourishment Benefits: Fully cooked hard-boiled eggs provide an excellent, safe source of highly bioavailable choline, which is absolutely vital for baby's neural tube and brain architecture development.",
    image: require('./assets/images/boiled_eggs_seasoning.jpg'),
    ingredients: [
      '2 large pasteurized eggs',
      '1 tsp everything bagel seasoning (sesame seeds, poppy seeds, garlic, onion, sea salt)',
      '1 cup fresh cucumber slices',
      '1/2 cup baby carrots',
    ],
    instructions: [
      'Place the eggs in a small saucepan and cover them completely with cold water by at least an inch.',
      'Bring the water to a full, rolling boil over high heat.',
      'Once boiling, turn off the heat completely, cover the pan with a lid, and let the eggs sit undisturbed for exactly 11-12 minutes to ensure the yolks are fully and safely cooked through.',
      'Transfer the eggs immediately into a bowl filled with ice water for 5 minutes to halt the cooking process.',
      'Gently tap and peel the shell off each egg, then slice them cleanly in half.',
      'Arrange the egg halves on a clean lunch plate, dust the exposed yolks heavily with everything bagel seasoning, and serve alongside fresh, crisp cucumber slices and baby carrots.',
    ],
    recipeSteps: [
      'Place the eggs in a small saucepan and cover them completely with cold water by at least an inch.',
      'Bring the water to a full, rolling boil over high heat.',
      'Once boiling, turn off the heat completely, cover the pan with a lid, and let the eggs sit undisturbed for exactly 11-12 minutes to ensure the yolks are fully and safely cooked through.',
      'Transfer the eggs immediately into a bowl filled with ice water for 5 minutes to halt the cooking process.',
      'Gently tap and peel the shell off each egg, then slice them cleanly in half.',
      'Arrange the egg halves on a clean lunch plate, dust the exposed yolks heavily with everything bagel seasoning, and serve alongside fresh, crisp cucumber slices and baby carrots.',
    ],
  },
  {
    id: 'pregnant_greek_yogurt_walnuts_honey',
    title: 'Greek Yogurt with Walnuts & Honey',
    description:
      'Chilled full-fat pasteurized Greek yogurt crowned with raw walnuts, pure honey, and cinnamon — a calcium-rich midday refresh.',
    vibe:
      'Chilled full-fat pasteurized Greek yogurt crowned with raw walnuts, pure honey, and cinnamon — a calcium-rich midday refresh.',
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Full-fat Greek yogurt supplies a massive dose of bone-building calcium and probiotics for maternal gut health, while walnuts offer plant-based ALA Omega-3s essential for infant ocular development.',
    image: require('./assets/images/greek_yogurt_walnuts.jpg'),
    ingredients: [
      '1 cup plain, full-fat pasteurized Greek yogurt',
      '1/4 cup raw organic walnut halves, roughly chopped',
      '1 tbsp high-quality pure honey',
      'A pinch of ground cinnamon',
    ],
    instructions: [
      'Spoon the chilled, full-fat pasteurized Greek yogurt into a comfortable serving bowl, smoothing out the surface with the back of your spoon.',
      'Scatter the chopped raw walnut halves evenly across the top of the yogurt layer.',
      'Drizzle the pure honey slowly over the walnuts and yogurt in a beautiful spiral pattern.',
      'Finish the bowl with a light dusting of ground cinnamon for subtle warmth.',
      'Serve immediately while chilled as a refreshing, nutrient-rich midday meal.',
    ],
    recipeSteps: [
      'Spoon the chilled, full-fat pasteurized Greek yogurt into a comfortable serving bowl, smoothing out the surface with the back of your spoon.',
      'Scatter the chopped raw walnut halves evenly across the top of the yogurt layer.',
      'Drizzle the pure honey slowly over the walnuts and yogurt in a beautiful spiral pattern.',
      'Finish the bowl with a light dusting of ground cinnamon for subtle warmth.',
      'Serve immediately while chilled as a refreshing, nutrient-rich midday meal.',
    ],
  },
];

/** Pregnant meal plan map — morning · noon */
export const pregnantMealPlan = {
  morning: morningPregnantMeals,
  noon: lunchPregnantMeals,
};

/** Postpartum noon / lunch meals — local images + full recipes */
export const lunchPostpartumMeals = [
  {
    id: 'pp-lunch-1',
    title: 'Nourishing Lentil, Spinach & Vegetable Soup',
    vibe: 'A deeply comforting, hearty bowl that warms you from the inside out.',
    benefits:
      'Lentils are an exceptional source of plant-based protein to build tissue and fiber for digestion. Spinach provides essential iron reserves, and the broth is deeply hydrating for recovery.',
    timeline: '15 mins prep | 45 mins simmer',
    kitchenTip:
      'This soup freezes beautifully. Double the batch, freeze it in individual portions, and simply pop one into a saucepan when you need a zero-prep, nutrient-dense lunch.',
    image: require('./assets/images/lentil-spinach-soup.jpg'),
    ingredients: [
      '1 cup dried green or brown lentils, rinsed thoroughly',
      '1 tbsp avocado oil or olive oil',
      '1 large yellow onion, diced',
      '2 large carrots, diced',
      '2 celery stalks, diced',
      '2 garlic cloves, minced',
      '1 tsp dried oregano',
      '1/2 tsp ground cumin',
      '1/2 tsp ground turmeric',
      '6 cups organic vegetable broth',
      '2 cups water',
      '3 packed cups fresh baby spinach',
      '1 tbsp fresh lemon juice',
      'Sea salt and cracked black pepper, to taste',
      'Fresh parsley (for garnish)',
    ],
    recipeSteps: [
      'In a large soup pot or Dutch oven, heat the avocado oil over medium heat. Add the diced onion, carrots, and celery. Sauté for 6 to 8 minutes, until the vegetables begin to soften.',
      'Stir in the minced garlic, dried oregano, cumin, and turmeric. Cook for 1 full minute until the spices are fragrant.',
      'Add the thoroughly rinsed lentils, vegetable broth, and water. Stir well and bring the entire pot up to a boil.',
      'Once boiling, immediately reduce the heat to low, cover the pot with a lid, and let it simmer softly for 35 to 45 minutes until the lentils are completely tender.',
      'Remove the pot from the heat. Stir in the packing cups of fresh baby spinach, the lemon juice, and season generously with sea salt and black pepper.',
      'Ladle the piping hot soup into warm bowls and garnish with fresh chopped parsley.',
    ],
  },
  {
    id: 'pp-lunch-2',
    title: 'Baked Avocado Egg Boats with Ground Turkey',
    vibe: 'A vibrant, protein-packed skillet lunch that balances creamy fats and savory comfort.',
    benefits:
      'Avocados provide essential monounsaturated healthy fats for brain health and sustained satiety, while the egg and ground turkey offer clean protein for postpartum tissue repair.',
    timeline: '10 mins prep | 15 mins cook',
    kitchenTip:
      'To keep your avocados stable in the skillet while baking, crumble a tiny bit of foil under the curved base to create a perfectly balanced dock that prevents them from tipping over.',
    image: require('./assets/images/avocado-egg-boats.jpg'),
    ingredients: [
      '2 large, ripe organic avocados',
      '4 large organic eggs',
      '1/2 lb lean ground turkey',
      '1/2 cup diced yellow onion',
      '2 garlic cloves, minced',
      '1/2 tsp chili powder',
      '1/4 tsp dried oregano',
      '2 tbsp fresh cilantro, chopped (for garnish)',
      'Lime wedges (for serving)',
    ],
    recipeSteps: [
      'Preheat your oven to 425°F (220°C). Prepare a small, clean cast-iron skillet for baking.',
      'In a separate small skillet over medium heat, sauté the ground turkey, diced yellow onion, and minced garlic with the chili powder and dried oregano. Cook for 8–10 minutes, breaking the turkey apart, until thoroughly browned.',
      'Carefully slice the avocados in half lengthwise. Remove the pit. Use a spoon to scoop out about 1 additional tablespoon of avocado flesh from the center, widening the hollow to fit the egg.',
      'Nestle the four avocado halves tightly into the prepared cast-iron skillet.',
      'Gently crack one egg directly into each avocado hollow, ensuring the yolk is centered.',
      'Top each egg liberally with the prepared ground turkey mixture.',
      'Place the skillet into the oven and bake for 12–15 minutes, until the egg whites are completely set but the yolks remain beautifully runny.',
      'Remove from heat, garnish generously with fresh chopped cilantro, and serve with lime wedges.',
    ],
  },
  {
    id: 'pp-lunch-3',
    title: 'Slow-Cooker Chicken & Wild Rice Soup',
    vibe: 'A warm, soothing, and velvety bowl that restores energy without any kitchen effort.',
    benefits:
      'Shredded chicken provides premium collagen-building amino acids to heal connective tissues, while wild rice offers dense B-vitamins and complex carbs to combat fatigue.',
    timeline: '10 mins prep | 4 hrs slow cook',
    kitchenTip:
      'To keep your wild rice from absorbing every drop of broth and getting mushy over time, cook the rice separately or add it in during the final 45 minutes of the slow cooker cycle.',
    image: require('./assets/images/chicken-wild-rice-soup.jpg'),
    ingredients: [
      '1 lb organic chicken breasts or thighs',
      '1 cup wild rice blend (thoroughly rinsed)',
      '1 medium yellow onion, diced',
      '3 large carrots, sliced into rounds',
      '3 celery stalks, sliced',
      '3 garlic cloves, minced',
      '1 tsp dried thyme',
      '1 tsp dried rosemary',
      '1 bay leaf',
      '6 cups organic low-sodium chicken bone broth',
      '1/2 cup full-fat coconut milk or heavy cream (optional)',
      'Sea salt and black pepper, to taste',
      'Fresh parsley, chopped (for garnish)',
    ],
    recipeSteps: [
      'Place the raw chicken breasts, rinsed wild rice, diced yellow onion, sliced carrots, celery, and minced garlic into the base of your slow cooker.',
      'Season everything with the dried thyme, dried rosemary, sea salt, and black pepper. Toss in the single bay leaf.',
      'Pour the chicken bone broth evenly over all the ingredients. Stir gently to distribute the spices.',
      'Secure the slow cooker lid and set it to cook on HIGH for 3.5 to 4 hours (or on LOW for 6 to 7 hours) until the rice is fully blossomed.',
      'Carefully remove the chicken breasts from the broth. Use two forks to shred the meat into bite-sized pieces, then slide it back into the soup.',
      'If you prefer a rich, velvety finish, pour in the coconut milk or heavy cream during the final 5 minutes and stir well. Discard the bay leaf, ladle into deep bowls, and garnish with fresh parsley.',
    ],
  },
  {
    id: 'pp-lunch-4',
    title: 'Sheet Pan Lemon Garlic Salmon & Asparagus',
    vibe: 'A bright, fresh, and exceptionally nutrient-dense one-pan meal that minimizes cleanup.',
    benefits:
      'Salmon is a premier source of high-quality Omega-3 fatty acids, critical for maternal brain health and mood stability, while asparagus provides massive doses of folic acid.',
    timeline: '10 mins prep | 15 mins cook',
    kitchenTip:
      'To ensure both the salmon and asparagus finish cooking at the exact same time, cut the tough, woody ends off the asparagus and try to find fillets that are about 1 inch thick.',
    image: require('./assets/images/salmon-asparagus-sheet-pan.jpg'),
    ingredients: [
      '2 large, wild-caught salmon fillets (approx. 6–8 oz each, 1-inch thick)',
      '1 bunch fresh asparagus spears, tough ends trimmed',
      '2 tbsp high-quality olive oil or avocado oil',
      '3 garlic cloves, minced',
      '1 tbsp fresh parsley, finely chopped',
      '1 tsp dried dill',
      '1 medium lemon, sliced into rounds',
      'Sea salt and cracked black pepper, to taste',
      'Lemon wedges (for serving)',
    ],
    recipeSteps: [
      'Preheat your oven to 400°F (200°C) and line a large, rimmed metal sheet pan with parchment paper.',
      'Carefully pat the salmon fillets completely dry with a paper towel and place them onto one half of the prepared sheet pan.',
      'On the other half of the pan, arrange the trimmed asparagus spears in a tight single layer.',
      'In a small bowl, whisk together the olive oil, minced garlic, dried dill, sea salt, and cracked black pepper. Drizzle this emulsion generously over both the salmon and the asparagus.',
      'Layer the fresh lemon slices neatly across the top of each salmon fillet.',
      'Place the sheet pan into the oven and roast for 12 to 15 minutes, until the asparagus is tender and the salmon easily flakes apart with a fork.',
      'Remove from heat, garnish generously with fresh chopped parsley, and serve immediately.',
    ],
  },
  {
    id: 'pp-lunch-5',
    title: 'Baked Quinoa & Broccoli Protein Patties',
    vibe: 'A crispy, savory, and incredibly easy-to-grab lunch bite that pairs perfectly with a side dip.',
    benefits:
      'Quinoa provides a complete plant-based protein profile with all nine essential amino acids to rebuild tissue, while broccoli delivers massive amounts of fiber and Vitamin C.',
    timeline: '15 mins prep | 20 mins bake',
    kitchenTip:
      'To prevent the patties from falling apart, make sure your cooked quinoa has cooled completely before mixing, and squeeze out any excess moisture from the steamed broccoli.',
    image: require('./assets/images/quinoa-broccoli-patties.jpg'),
    ingredients: [
      '2 cups cooked quinoa, completely cooled',
      '1.5 cups fresh broccoli florets, steamed and finely chopped',
      '1 cup sharp cheddar cheese, shredded',
      '2 large organic eggs, beaten',
      '1/4 cup almond flour or breadcrumbs',
      '1/2 tsp garlic powder',
      '1/2 tsp onion powder',
      'Sea salt and cracked black pepper, to taste',
      'Plain Greek yogurt (optional, for dipping sauce)',
    ],
    recipeSteps: [
      'Preheat your oven to 375°F (190°C) and line a large, rimmed metal sheet pan with parchment paper.',
      'Steam your broccoli florets until tender, drain them thoroughly, chop them into tiny, fine pieces, and pat dry.',
      'In a large mixing bowl, combine the completely cooled cooked quinoa, finely chopped broccoli, shredded cheese, almond flour, garlic powder, onion powder, sea salt, and black pepper.',
      'Pour the beaten eggs over the mixture and stir vigorously until everything is evenly moistened and sticks together.',
      'Use your hands or a large cookie scoop to portion out the mixture, shaping them into tight balls and gently flattening them into round patties about 1/2-inch thick.',
      'Arrange the patties evenly on the prepared sheet pan. Bake for 18 to 20 minutes, flipping them carefully halfway through, until both sides are crisp and golden-brown.',
    ],
  },
  {
    id: 'pp-lunch-6',
    title: 'Loaded Turkey & Black Bean Tacos with Citrus Cabbage Slaw',
    vibe: 'A bright, fresh, and incredibly satisfying street-style taco platter that hits every savory craving.',
    benefits:
      'Lean ground turkey and black beans offer a dual punch of iron and clean protein for muscle recovery, while avocado brings critical healthy monounsaturated fats.',
    timeline: '15 mins prep | 10 mins cook',
    kitchenTip:
      'Warm your tortillas directly over an open gas flame or on a dry skillet for 30 seconds per side until they get a slight char. It softens them and unlocks a smoky flavor profile.',
    image: require('./assets/images/turkey-black-bean-tacos.jpg'),
    ingredients: [
      '1/2 lb lean ground turkey (or lean ground beef)',
      '1/2 cup canned black beans, rinsed and drained',
      '1 tbsp olive oil',
      '1 tsp chili powder',
      '1/2 tsp ground cumin',
      '1/2 tsp garlic powder',
      '4 small corn or flour tortillas',
      '1 cup shredded green or purple cabbage',
      '1 ripe avocado, sliced',
      '1 medium tomato, diced',
      '1/2 cup sharp cheddar or cotija cheese, shredded',
      '1 tbsp fresh lime juice',
      '2 cups mixed salad greens (for the side salad)',
      'Sea salt and black pepper, to taste',
    ],
    recipeSteps: [
      'Heat the olive oil in a medium skillet over medium-high heat. Add the ground turkey, breaking it apart, and season with chili powder, cumin, garlic powder, sea salt, and black pepper. Sauté for 6 to 8 minutes.',
      'Stir the rinsed black beans directly into the turkey skillet during the final 2 minutes of cooking, lowering the heat to warm them through completely.',
      'In a small bowl, toss the shredded cabbage with fresh lime juice and a pinch of salt to create a quick, bright citrus slaw.',
      'Warm or lightly char your tortillas using your kitchen tip technique, then lay them out on a clean serving platter.',
      'Assemble the tacos by layering the warm turkey and black bean mixture into the base of each tortilla, then topping them evenly with the citrus cabbage slaw, diced tomatoes, fresh avocado slices, and shredded cheese.',
      'Toss your mixed salad greens with a light drizzle of olive oil and lime juice, place it right next to the tacos on the plate, and serve immediately.',
    ],
  },
  {
    id: 'postpartum_chicken_fiesta_bowl',
    title: 'Black Bean, Corn, and Grilled Chicken Fiesta Bowl',
    description:
      'A vibrant, satisfying recovery bowl loaded with lean grilled chicken breast, fiber-rich black beans, sweet corn, and crisp peppers over a fluffy bed of brown rice.',
    vibe:
      'A vibrant, satisfying recovery bowl loaded with lean grilled chicken breast, fiber-rich black beans, sweet corn, and crisp peppers over a fluffy bed of brown rice.',
    benefits:
      "Postpartum Healing Benefits: Lean grilled chicken breast provides a massive source of clean protein and amino acids crucial for rebuilding cellular tissue, repairing abdominal muscles, and supporting the metabolic demands of milk production. Black beans supply essential iron and dietary fiber to keep digestion moving smoothly, while sweet corn and bell peppers deliver a blast of antioxidants and Vitamin C to naturally enhance iron absorption and bolster mama's immune health.",
    image: require('./assets/images/chicken-fiesta-bowl.jpg'),
    ingredients: [
      '4 oz Grilled chicken breast, sliced',
      '1/2 cup Low-sodium black beans (rinsed and drained)',
      '1/2 cup Sweet corn kernels (fresh, frozen, or canned)',
      '1 cup Cooked brown rice or quinoa base',
      '1/4 cup Red bell pepper and red onion, finely diced',
      'Fresh cilantro leaves (meticulously washed) for garnish',
      'Drizzle of fresh lime juice and a dollop of avocado crema',
    ],
    instructions: [
      'STEP 1: Prep the Grain Base: Warm up your pre-cooked fluffy brown rice or quinoa and layer it substantially at the bottom of a wide serving bowl.',
      'STEP 2: Arrange the Toppings: Section out your bowl beautifully by placing the sliced grilled chicken, rinsed black beans, sweet corn, and diced bell peppers side-by-side over the grain base.',
      'STEP 3: Dress and Garnish: Drizzle a generous squeeze of fresh lime juice over the entire bowl layout, drop on your washed fresh cilantro leaves, and add a dollop of smooth avocado crema.',
      'STEP 4: Toss and Feast: Serve at a comfortable room temperature or warm, letting mama mix the savory, crisp textures together for a deeply fulfilling, nutrient-rich meal.',
    ],
    recipeSteps: [
      'STEP 1: Prep the Grain Base: Warm up your pre-cooked fluffy brown rice or quinoa and layer it substantially at the bottom of a wide serving bowl.',
      'STEP 2: Arrange the Toppings: Section out your bowl beautifully by placing the sliced grilled chicken, rinsed black beans, sweet corn, and diced bell peppers side-by-side over the grain base.',
      'STEP 3: Dress and Garnish: Drizzle a generous squeeze of fresh lime juice over the entire bowl layout, drop on your washed fresh cilantro leaves, and add a dollop of smooth avocado crema.',
      'STEP 4: Toss and Feast: Serve at a comfortable room temperature or warm, letting mama mix the savory, crisp textures together for a deeply fulfilling, nutrient-rich meal.',
    ],
  },
  {
    id: 'postpartum_classic_blt_sourdough',
    title: 'Classic BLT on Sprouted Sourdough',
    description:
      'Crisp, smoky turkey or high-quality bacon layered with juicy sliced ripe tomatoes, fresh crisp lettuce, and a light spread of avocado oil mayo on toasted sprouted sourdough.',
    vibe:
      'Crisp, smoky turkey or high-quality bacon layered with juicy sliced ripe tomatoes, fresh crisp lettuce, and a light spread of avocado oil mayo on toasted sprouted sourdough.',
    benefits:
      "Postpartum Healing Benefits: Sprouted sourdough is exceptionally gentle on the early postpartum digestive tract, offering higher bioavailable nutrients and easier breakdown than standard breads. Crisp, mineral-rich lettuce and juicy vine-ripened tomatoes provide immediate cellular hydration and vital Vitamin C to help stitch tissue back together, while smoky bacon or turkey bacon delivers a highly satisfying, comforting caloric reward that rewards a nursing mama's hard work.",
    image: require('./assets/images/classic-blt-sourdough.jpg'),
    ingredients: [
      '2 Slices of artisanal sprouted sourdough bread, toasted',
      '3-4 Slices of crispy cooked bacon or high-protein turkey bacon',
      '2 Thick slices of fresh vine-ripened tomato',
      '2 Leaves of crisp, fresh romaine or butter lettuce (washed meticulously)',
      '1 tablespoon Avocado oil mayonnaise or Greek yogurt spread',
      'Served with a side of light sea salt potato chips and a crunchy pickle spear',
    ],
    instructions: [
      'STEP 1: Toast and Spread: Bring your sprouted sourdough slices to a warm, golden-brown toast. Spread your avocado oil mayonnaise evenly across the inside faces of both slices.',
      'STEP 2: Build the Foundation: Layer your hot, crispy cooked bacon or turkey bacon along the bottom slice of sourdough layout.',
      'STEP 3: Stack the Freshness: Carefully arrange your washed crisp lettuce leaves and thick tomato slices directly over the bacon layer, dusting the tomatoes with a tiny pinch of flaky sea salt.',
      'STEP 4: Close and Slice: Top the sandwich with the remaining slice of sourdough, press down gently, slice diagonally with a sharp knife, and serve immediately alongside crisp chips and a pickle spear.',
    ],
    recipeSteps: [
      'STEP 1: Toast and Spread: Bring your sprouted sourdough slices to a warm, golden-brown toast. Spread your avocado oil mayonnaise evenly across the inside faces of both slices.',
      'STEP 2: Build the Foundation: Layer your hot, crispy cooked bacon or turkey bacon along the bottom slice of sourdough layout.',
      'STEP 3: Stack the Freshness: Carefully arrange your washed crisp lettuce leaves and thick tomato slices directly over the bacon layer, dusting the tomatoes with a tiny pinch of flaky sea salt.',
      'STEP 4: Close and Slice: Top the sandwich with the remaining slice of sourdough, press down gently, slice diagonally with a sharp knife, and serve immediately alongside crisp chips and a pickle spear.',
    ],
  },
  {
    id: 'postpartum_charcuterie_plate',
    title: 'The Postpartum "Charcuterie" Plate',
    description:
      'The ultimate, no-cook grazing board loaded with premium sliced prosciutto, oven-roasted turkey, aged pasteurized cheddar, creamy brie, whole-grain seed crackers, crunchy almonds, and iron-dense dried figs and apricots.',
    vibe:
      'The ultimate, no-cook grazing board loaded with premium sliced prosciutto, oven-roasted turkey, aged pasteurized cheddar, creamy brie, whole-grain seed crackers, crunchy almonds, and iron-dense dried figs and apricots.',
    benefits:
      'Postpartum Healing Benefits: This platter is designed for maximum nutrient density with absolute zero cooking required. Early postpartum mamas need constant, easy-to-grab energy. Prosciutto and roasted turkey provide dense, high-quality proteins for ongoing cellular tissue repair, while dried apricots and figs serve as an incredibly potent source of non-heme iron to directly rebuild blood volume lost during delivery. Raw walnuts and almonds supply anti-inflammatory Omega-3 fatty acids to help combat postpartum brain fog and support emotional hormone regulation.',
    image: require('./assets/images/postpartum-charcuterie.jpg'),
    ingredients: [
      '3-4 Slices of high-quality premium Prosciutto or Jamón',
      '3-4 Slices of oven-roasted deli turkey breast',
      'A small wedge of pasteurized Brie cheese and sharp Cheddar slices',
      'A handful of raw almonds and walnuts (rich in healthy fats)',
      '3-4 Dried Turkish apricots and dried figs (high-fiber iron boosters)',
      'A small handful of fresh red grapes and sliced strawberries (washed thoroughly)',
      'A serving of artisanal whole-grain seed crackers',
      'A small side ramekin of pure honey or beet hummus with cucumber sticks',
    ],
    instructions: [
      'STEP 1: Prep the Board: Grab a clean wooden cutting board or large ceramic plate to act as your layout canvas.',
      'STEP 2: Arrange the Proteins and Cheeses: Artfully roll or drape your prosciutto and turkey slices on one side of the board. Place your pasteurized cheddar slices and brie wedge nearby.',
      'STEP 3: Fill the Gaps with Color: Scatter your washed fresh grapes, strawberries, crunchy almonds, walnuts, and dried iron-rich fruits right into the center loops of the board layout.',
      "STEP 4: Garnish and Graze: Place a stack of whole-grain seed crackers alongside a small dish of honey or hummus. Serve cool at a moment's notice—perfect for snacking with one hand while nursing or resting.",
    ],
    recipeSteps: [
      'STEP 1: Prep the Board: Grab a clean wooden cutting board or large ceramic plate to act as your layout canvas.',
      'STEP 2: Arrange the Proteins and Cheeses: Artfully roll or drape your prosciutto and turkey slices on one side of the board. Place your pasteurized cheddar slices and brie wedge nearby.',
      'STEP 3: Fill the Gaps with Color: Scatter your washed fresh grapes, strawberries, crunchy almonds, walnuts, and dried iron-rich fruits right into the center loops of the board layout.',
      "STEP 4: Garnish and Graze: Place a stack of whole-grain seed crackers alongside a small dish of honey or hummus. Serve cool at a moment's notice—perfect for snacking with one hand while nursing or resting.",
    ],
  },
];

/** Postpartum night / dinner meals — local images + full recipes */
export const dinnerPostpartumMeals = [
  {
    id: 'pp-dinner-1',
    title: 'Slow-Cooker Pot Roast with Harvest Root Vegetables',
    vibe: 'A deeply grounding, meltingly tender beef roast that comforts the soul.',
    benefits:
      'Beef is an exceptional postpartum source of highly bioavailable heme iron and zinc to replenish maternal blood volumes and support cellular tissue repair.',
    timeline: '15 mins prep | 6 hrs slow cook',
    kitchenTip:
      'Searing the beef roast in a smoking hot skillet for 2–3 minutes per side before placing it into the slow cooker is the secret step. It locks in the rich juices and deepens the final broth flavor.',
    image: require('./assets/images/slow-cooker-pot-roast.jpg'),
    ingredients: [
      '2.5 to 3 lbs grass-fed beef chuck roast',
      '1 tbsp avocado oil (for searing)',
      '3 medium sweet potatoes, scrubbed and cubed',
      '2 large carrots, cut into thick rounds',
      '1 large red onion, sliced into thick wedges',
      '1 yellow bell pepper, chopped into large pieces',
      '4 garlic cloves, smashed',
      '2 cups organic beef bone broth',
      '2 tbsp tomato paste',
      '2 sprigs fresh rosemary',
      '3 sprigs fresh thyme',
      'Sea salt and cracked black pepper, to taste',
    ],
    recipeSteps: [
      'Generously season all sides of the beef chuck roast with sea salt and cracked black pepper.',
      'Heat avocado oil in a large skillet over high heat. Sear the roast for 3 minutes on each side until a deep, golden-brown crust forms, then transfer it into the slow cooker.',
      'Arrange the cubed sweet potatoes, carrots, red onion, bell pepper, and smashed garlic cloves tightly around and on top of the beef.',
      'In a measuring cup, whisk together the beef bone broth and tomato paste until smooth, then pour it over the meat and vegetables.',
      'Nestle the fresh rosemary and thyme sprigs directly into the liquid. Cover with the lid and cook on LOW for 6 to 8 hours (or HIGH for 4 to 5 hours) until the beef is fork-tender.',
      'Discard the herb stems. Slice or shred the beef with two forks and serve it piping hot over a generous pile of the slow-cooked root vegetables and rich pan juices.',
    ],
  },
  {
    id: 'pp-dinner-2',
    title: 'Comforting Cheesy Chicken & Broccoli Casserole',
    vibe: 'A warm, bubbly, and deeply nostalgic bake that delivers pure comfort.',
    benefits:
      'Chicken provides dense lean protein for muscle and cellular recovery, while broccoli brings essential vitamins and fiber. The wholesome dairy base offers calcium reserves to support nursing mamas.',
    timeline: '15 mins prep | 25 mins bake',
    kitchenTip:
      'If you want to save a massive amount of time on a busy weeknight, grab a high-quality pre-cooked rotisserie chicken, shred it down, and toss it straight into the mix instead of cooking breasts from scratch.',
    image: require('./assets/images/chicken-broccoli-casserole.jpg'),
    ingredients: [
      '1.5 lbs organic chicken breasts, cut into bite-sized cubes',
      '3 cups fresh broccoli florets, chopped small',
      '1 tbsp olive oil',
      '1 small yellow onion, diced',
      '2 garlic cloves, minced',
      '1 cup uncooked white jasmine rice or quinoa',
      '2 cups organic low-sodium chicken broth (to cook the rice)',
      '1.5 cups sharp cheddar cheese, shredded and divided',
      '1/2 cup plain Greek yogurt or sour cream',
      '1/2 tsp paprika',
      '1/2 tsp garlic powder',
      'Sea salt and cracked black pepper, to taste',
    ],
    recipeSteps: [
      'Preheat your oven to 375°F (190°C) and lightly grease a 9x13-inch ceramic baking dish.',
      'In a medium saucepan, bring the chicken broth to a boil, add the rice or quinoa, cover, reduce heat to low, and simmer for 15 minutes until fully cooked.',
      'While the rice cooks, heat olive oil in a large skillet over medium-high heat. Add the cubed chicken, diced onion, minced garlic, paprika, garlic powder, salt, and pepper. Sauté for 6 to 8 minutes until the chicken is thoroughly cooked through.',
      'Steam your chopped broccoli florets for just 3 minutes so they remain bright green and slightly crisp.',
      'In a massive mixing bowl, combine the cooked rice, sautéed chicken and onion mixture, steamed broccoli, Greek yogurt, and 1 cup of the shredded cheddar cheese. Stir vigorously until evenly coated and creamy.',
      'Transfer the mixture into your prepared baking dish, smoothing it out flat with a spatula. Scatter the remaining 1/2 cup of cheddar cheese evenly across the top.',
      'Bake for 20 to 25 minutes until the cheese is completely melted, bubbly, and starting to turn golden-brown around the edges. Let it cool for 5 minutes before scooping.',
    ],
  },
  {
    id: 'pp-dinner-3',
    title: 'Sheet Pan Garlic Butter Chicken Thighs & Roasted Sweet Potatoes',
    vibe: 'A vibrant, rich, and deeply satisfying one-pan dinner packed with comforting savory flavors.',
    benefits:
      'Juicy chicken thighs provide essential amino acids, iron, and fats necessary for cellular recovery, while roasted sweet potatoes deliver excellent complex carbohydrates to steady blood sugar and sustain energy levels.',
    timeline: '15 mins prep | 30 mins bake',
    kitchenTip:
      'Toss the sweet potatoes, peppers, and onions in avocado oil first and spread them out evenly. Giving the ingredients enough breathing room on the sheet pan ensures they get beautifully roasted and caramelized rather than steamed.',
    image: require('./assets/images/garlic-butter-chicken-sweet-potatoes.jpg'),
    ingredients: [
      '4 bone-in, skin-on organic chicken thighs (approx. 1.5 lbs)',
      '2 large sweet potatoes, scrubbed and cut into 1-inch cubes',
      '1 medium red onion, cut into thick wedges',
      '1 bell pepper (yellow or orange), chopped into large pieces',
      '4 tbsp unsalted high-quality butter, melted',
      '4 garlic cloves, minced',
      '1 tbsp fresh rosemary, finely chopped',
      '1 tsp dried thyme',
      '1 lemon, sliced into wheels (plus extra wedges for serving)',
      'Sea salt and cracked black pepper, to taste',
      'Fresh parsley, chopped (for garnish)',
    ],
    recipeSteps: [
      'Preheat your oven to 400°F (200°C) and line a large, rimmed metal sheet pan with parchment paper or aluminum foil.',
      'Pat the chicken thighs completely dry with paper towels to ensure the skin gets maximum crunch. Season all sides generously with sea salt and black pepper.',
      'In a small bowl, whisk together the melted butter, minced garlic, chopped fresh rosemary, and dried thyme.',
      'Place the cubed sweet potatoes, red onion wedges, and chopped bell peppers onto the sheet pan. Drizzle them with half of the garlic butter mixture and toss thoroughly to coat.',
      'Nestle the seasoned chicken thighs directly among the vegetables on the pan. Brush the remaining garlic butter mixture evenly over the top of each thigh.',
      'Scatter the lemon slices across the pan and roast for 30 to 35 minutes, until the sweet potatoes are tender and the chicken skin is crispy and golden with an internal temperature of 165°F.',
      'Remove from heat, garnish generously with parsley, and serve hot with fresh lemon wedges on the side.',
    ],
  },
  {
    id: 'pp-dinner-4',
    title: 'Baked Spinach & Three Cheese Stuffed Shells',
    vibe: 'A warm, saucy, and deeply comforting Italian bake that feels like a hug on a plate.',
    benefits:
      'Fresh spinach delivers critical iron and folate reserves for postpartum cellular repair, while the three-cheese ricotta base provides excellent calcium and protein to support nursing mamas.',
    timeline: '20 mins prep | 25 mins bake',
    kitchenTip:
      'Boil your jumbo shells for about 2 minutes less than the package instructions specifies. They will finish cooking and absorb the savory marinara sauce perfectly while baking in the oven without getting mushy.',
    image: require('./assets/images/spinach-stuffed-shells.png'),
    ingredients: [
      '12-14 jumbo pasta shells',
      '10 oz fresh baby spinach, chopped and wilted (or frozen spinach, thawed and squeezed dry)',
      '15 oz high-quality ricotta cheese',
      '1 cup shredded mozzarella cheese, divided',
      '1/2 cup grated Parmesan cheese, divided',
      '1 large organic egg, beaten',
      '2 garlic cloves, minced',
      '2.5 cups organic marinara sauce',
      '1/2 tsp dried oregano',
      'Sea salt and cracked black pepper, to taste',
      'Fresh basil leaves, torn (for garnish)',
    ],
    recipeSteps: [
      'Preheat your oven to 375°F (190°C) and evenly spread 1 cup of the marinara sauce across the bottom of a large ceramic baking dish.',
      'Bring a large pot of salted water to a boil and cook the jumbo shells until just before al dente (about 8-9 minutes). Drain and rinse with cold water.',
      'If using fresh spinach, sauté it in a small skillet with a splash of olive oil and the minced garlic until completely wilted. Let it cool slightly.',
      'In a large mixing bowl, vigorously stir together the ricotta cheese, 1/2 cup of the mozzarella, 1/4 cup of the Parmesan, the beaten egg, wilted garlic spinach, dried oregano, sea salt, and black pepper.',
      'Spoon a generous amount of the spinach-cheese mixture into each cooked pasta shell and arrange them neatly in a single layer inside the sauced baking dish.',
      'Pour the remaining marinara sauce evenly over the stuffed shells, then scatter the rest of the mozzarella and Parmesan cheese generously across the top.',
      'Cover with foil and bake for 20 minutes. Remove the foil and bake for an additional 5-7 minutes until the cheese is completely melted, bubbly, and beautifully golden-brown. Garnish with fresh torn basil before serving.',
    ],
  },
  {
    id: 'pp-dinner-5',
    title: 'Slow-Cooker Turkey & Grass-Fed Beef Chili',
    vibe: 'A deeply nourishing, savory-sweet, and exceptionally satisfying bowl that requires zero effort.',
    benefits:
      'The strategic turkey/beef blend offers premium iron, protein, and collagen reserves. Legumes add high fiber for digestion, while the robust spice base provides potent antioxidants to steady maternal immunity.',
    timeline: '15 mins prep | 6 hrs slow cook',
    kitchenTip:
      'Searing both the ground turkey and grass-fed beef in a hot skillet with the chili spices before adding them to the slow cooker is the pro-move. This crucial step deepens the savory flavor and locks in moisture.',
    image: require('./assets/images/turkey-beef-chili.jpg'),
    ingredients: [
      '1/2 lb lean ground turkey',
      '1/2 lb grass-fed ground beef (85/15)',
      '2 large carrots, cut into thick rounds',
      '1 small yellow onion, diced',
      '2 bell peppers (one red, one green), chopped into large pieces',
      '4 garlic cloves, minced',
      '2 tbsp tomato paste',
      '3 tsp chili powder',
      '2 tsp ground cumin',
      '1 tsp smoked paprika',
      '1 tsp dried oregano',
      'Sea salt and cracked black pepper, to taste',
      '2 cups water (or low-sodium chicken bone broth)',
      'Fresh cilantro and lime wedges (for garnish)',
    ],
    recipeSteps: [
      'Heat a large skillet over high heat. Add the ground turkey and grass-fed beef, breaking them apart, and season with chili powder, cumin, smoked paprika, dried oregano, sea salt, and black pepper. Sauté for 6 to 8 minutes.',
      'Stir the tomato paste and water/broth directly into the hot skillet during the final 1 minute of cooking, scraping up any flavorful bits. Transfer this full savory base into your slow cooker.',
      'Arrange the round carrots, diced yellow onion, chopped red and green bell peppers, and minced garlic tightly into the pot, stirring gently to integrate.',
      'Secure the slow cooker lid and set it to cook on HIGH for 3.5 to 4 hours (or on LOW for 6 to 7 hours) until the chili is rich, thick, and perfectly tender.',
      'Lower the heat and let the chili warm through completely.',
      'Remove from heat, garnish generously with fresh chopped cilantro, and serve piping hot with fresh lime wedges on the side.',
    ],
  },
  {
    id: 'pp-dinner-6',
    title: 'Baked Ginger-Soy Glazed Cod & Jasmine Rice',
    vibe: 'A clean, savory, and beautifully light dinner plate that balances bright ginger notes with sweet umami.',
    benefits:
      'Cod is an excellent source of clean, easily digestible lean protein and selenium, while fresh ginger offers powerful anti-inflammatory benefits to soothe digestion and support postpartum recovery.',
    timeline: '10 mins prep | 15 mins bake',
    kitchenTip:
      "To get that gorgeous, high-end restaurant caramelization on your fish, turn your oven to BROIL during the final 2 minutes of baking. Watch it closely so the sweet glaze doesn't burn!",
    image: require('./assets/images/ginger-soy-cod.jpg'),
    ingredients: [
      '2 wild-caught cod fillets (approx. 6 oz each)',
      '1 cup white jasmine rice, thoroughly rinsed',
      '2 cups water (to cook the rice)',
      '2 tbsp low-sodium soy sauce or liquid aminos',
      '1 tbsp raw honey or maple syrup',
      '1 tbsp fresh ginger, grated',
      '2 garlic cloves, minced',
      '1 tsp sesame oil',
      '2 green onions, thinly sliced (for garnish)',
      '1 tsp toasted sesame seeds (for garnish)',
      'Sea salt and white pepper, to taste',
    ],
    recipeSteps: [
      'Preheat your oven to 400°F (200°C) and line a small baking dish with parchment paper.',
      'In a medium saucepan, combine the rinsed jasmine rice and water. Bring to a boil, cover, reduce heat to low, and let simmer quietly for 15 minutes until fluffy.',
      'In a small bowl, whisk together the soy sauce, raw honey, grated ginger, minced garlic, and sesame oil to create your glaze.',
      'Pat the cod fillets completely dry with paper towels, season lightly with a pinch of sea salt and white pepper, and arrange them in the prepared baking dish.',
      'Pour the ginger-soy glaze generously over the fish, ensuring both fillets are completely coated.',
      'Bake for 12 to 14 minutes, until the fish flakes easily with a fork. Optional: Broil for the final 2 minutes to caramelize the top edges.',
      'Serve hot by placing a cod fillet right over a bed of fluffy jasmine rice, spooning the extra pan glaze on top, and garnishing with green onions and sesame seeds.',
    ],
  },
  {
    id: 'postpartum_turkey_spinach_meatballs',
    title: 'Turkey & Spinach Meatballs over Marinara',
    description:
      'Tender, baked lean ground turkey meatballs packed with chopped iron-dense spinach, served over a rich bed of warm, traditional savory marinara sauce.',
    vibe:
      'Tender, baked lean ground turkey meatballs packed with chopped iron-dense spinach, served over a rich bed of warm, traditional savory marinara sauce.',
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Ground turkey is an excellent source of lean protein and tryptophan, which naturally aids in the synthesis of serotonin to support postpartum mood stabilization and emotional well-being. Finely minced spinach loaded directly into the meatballs offers crucial iron reserves to steadily rebuild blood volume post-delivery, while the cooked tomato marinara provides a high dose of vitamin C to maximize iron bio-absorption and lycopene for deep cellular recovery.',
    image: require('./assets/images/turkey-spinach-meatballs.jpg'),
    ingredients: [
      '1 lb Lean ground turkey',
      '1 cup Fresh baby spinach, steamed and finely minced',
      '1/2 cup Rolled oats or almond flour (for binding texture)',
      '1 Large egg, beaten',
      '1 teaspoon Garlic powder and dried oregano',
      '2 cups Low-sodium marinara sauce, warmed',
      'Optional: A dust of grated pasteurized parmesan cheese',
    ],
    instructions: [
      'STEP 1: Prep the Mixture: In a large mixing bowl, thoroughly blend the lean ground turkey, finely minced cooked spinach, oats or almond flour, beaten egg, garlic powder, oregano, and a pinch of salt.',
      'STEP 2: Shape and Bake: Roll the seasoned mixture layout into 12-14 evenly sized meatballs. Place them on a parchment-lined baking sheet and bake at 400°F (200°C) for 15-20 minutes until the internal temperature is completely safe and fully cooked through.',
      'STEP 3: Warm the Marinara: In a medium skillet or saucepan, bring your rich tomato marinara sauce to a low, comforting simmer over medium-low heat.',
      'STEP 4: Assemble and Serve: Plop the baked hot meatballs directly into the simmering sauce layer, coating them beautifully. Serve warm in a shallow bowl, topped with a gentle dust of pasteurized parmesan cheese.',
    ],
    recipeSteps: [
      'STEP 1: Prep the Mixture: In a large mixing bowl, thoroughly blend the lean ground turkey, finely minced cooked spinach, oats or almond flour, beaten egg, garlic powder, oregano, and a pinch of salt.',
      'STEP 2: Shape and Bake: Roll the seasoned mixture layout into 12-14 evenly sized meatballs. Place them on a parchment-lined baking sheet and bake at 400°F (200°C) for 15-20 minutes until the internal temperature is completely safe and fully cooked through.',
      'STEP 3: Warm the Marinara: In a medium skillet or saucepan, bring your rich tomato marinara sauce to a low, comforting simmer over medium-low heat.',
      'STEP 4: Assemble and Serve: Plop the baked hot meatballs directly into the simmering sauce layer, coating them beautifully. Serve warm in a shallow bowl, topped with a gentle dust of pasteurized parmesan cheese.',
    ],
  },
  {
    id: 'postpartum_shrimp_garlic_scampi',
    title: 'Shrimp & Garlic Scampi over Angel Hair',
    description:
      'Plump, succulent shrimp sautéed in a fragrant garlic, lemon, and olive oil reduction, tossed elegantly over a delicate nest of angel hair pasta.',
    vibe:
      'Plump, succulent shrimp sautéed in a fragrant garlic, lemon, and olive oil reduction, tossed elegantly over a delicate nest of angel hair pasta.',
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Shrimp is an incredible seafood choice for recovery, delivering a dense supply of premium protein, selenium, and zinc to support cellular tissue healing and optimize thyroid function post-delivery. Garlic acts as a natural immune defender and circulatory booster, historically celebrated for its gentle warming properties during early postpartum. The touch of fresh lemon juice supplies refreshing vitamin C to boost systemic collagen production.',
    image: require('./assets/images/shrimp-garlic-scampi.jpg'),
    ingredients: [
      '6-8 oz Large shrimp, peeled and deveined',
      '2 oz Angel hair pasta (or whole-wheat alternative)',
      '3-4 Cloves of fresh garlic, finely minced',
      '1 tablespoon Extra virgin olive oil',
      '1 tablespoon Unsalted butter',
      'Squeeze of fresh lemon juice and 1/2 teaspoon lemon zest',
      'Fresh parsley (meticulously washed and chopped) and a pinch of red pepper flakes',
    ],
    instructions: [
      'STEP 1: Cook the Pasta: Bring a medium pot of salted water to a rolling boil. Drop the angel hair pasta and cook for just 4-5 minutes until al dente. Drain, reserving a splash of pasta water, and set aside.',
      'STEP 2: Sauté the Shrimp: Melt the butter and olive oil together in a skillet over medium heat. Add the minced garlic and a pinch of red pepper flakes, cooking for 1 minute until highly fragrant. Add the shrimp in a flat layer and cook for 2 minutes per side until pink, opaque, and perfectly curled.',
      'STEP 3: Toss and Emulsify: Pour in the fresh lemon juice, lemon zest, and a splash of your reserved pasta water. Slide the cooked angel hair directly into the skillet layout, tossing quickly for 1 minute to coat the strands in the savory garlic emulsion.',
      'STEP 4: Plate and Garnish: Twirl the glossy pasta onto a plate, arrange the succulent shrimp over the top, scatter your chopped fresh parsley, and serve warm immediately.',
    ],
    recipeSteps: [
      'STEP 1: Cook the Pasta: Bring a medium pot of salted water to a rolling boil. Drop the angel hair pasta and cook for just 4-5 minutes until al dente. Drain, reserving a splash of pasta water, and set aside.',
      'STEP 2: Sauté the Shrimp: Melt the butter and olive oil together in a skillet over medium heat. Add the minced garlic and a pinch of red pepper flakes, cooking for 1 minute until highly fragrant. Add the shrimp in a flat layer and cook for 2 minutes per side until pink, opaque, and perfectly curled.',
      'STEP 3: Toss and Emulsify: Pour in the fresh lemon juice, lemon zest, and a splash of your reserved pasta water. Slide the cooked angel hair directly into the skillet layout, tossing quickly for 1 minute to coat the strands in the savory garlic emulsion.',
      'STEP 4: Plate and Garnish: Twirl the glossy pasta onto a plate, arrange the succulent shrimp over the top, scatter your chopped fresh parsley, and serve warm immediately.',
    ],
  },
  {
    id: 'postpartum_creamy_tuscan_chicken',
    title: 'Creamy Tuscan Chicken Thighs with Jasmine Rice',
    description:
      'Tender, juicy pan-seared chicken thighs simmered in a rich, velvety cream sauce with sun-dried tomatoes and fresh spinach, served alongside fluffy jasmine rice.',
    vibe:
      'Tender, juicy pan-seared chicken thighs simmered in a rich, velvety cream sauce with sun-dried tomatoes and fresh spinach, served alongside fluffy jasmine rice.',
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Chicken thighs are exceptionally well-suited for early postpartum recovery, offering a higher concentration of iron and zinc than chicken breast to directly aid blood replenishment and tissue stitching. Searing the chicken with skin-on or utilizing thighs provides crucial fat-soluble vitamins and collagen-building proteins. The iron-dense baby spinach and antioxidant-rich sun-dried tomatoes balance the velvety sauce, while premium jasmine rice provides an easily digestible carbohydrate base to rapidly restore depleted glycogen stores for exhausted mamas.',
    image: require('./assets/images/creamy-tuscan-chicken.jpg'),
    ingredients: [
      '3-4 Bone-in, skin-on or boneless chicken thighs',
      '1 cup Cooked fragrant jasmine rice base',
      '1 cup Fresh baby spinach (washed meticulously)',
      '1/4 cup Sun-dried tomatoes, chopped',
      '1/2 cup Heavy cream or full-fat coconut milk alternative',
      '2 Cloves of fresh garlic, minced',
      '1/2 cup Low-sodium chicken bone broth (for extra collagen)',
      '1 tablespoon Olive oil, Italian seasoning, salt, and pepper',
    ],
    instructions: [
      'STEP 1: Sear the Chicken: Season your chicken thighs with salt, pepper, and Italian seasoning. Heat olive oil in a skillet over medium-high heat and sear the thighs for 5-6 minutes per side until beautifully golden brown and cooked through. Remove and set aside.',
      'STEP 2: Build the Tuscan Sauce: Lower the skillet heat to medium. Toss in your minced garlic and chopped sun-dried tomatoes, sautéing for 1 minute until fragrant. Pour in the rich chicken bone broth and heavy cream, bringing the layout to a smooth simmer.',
      'STEP 3: Wilt and Combine: Drop your washed baby spinach directly into the simmering cream base, stirring gently for 1-2 minutes until beautifully wilted. Slide the golden chicken thighs back into the skillet to absorb the pan juices.',
      'STEP 4: Plate and Serve: Spoon a substantial bed of warm, fluffy jasmine rice onto a shallow plate. Arrange the juicy chicken thighs alongside it, ladle a generous coat of the creamy Tuscan sauce over everything, and serve warm immediately.',
    ],
    recipeSteps: [
      'STEP 1: Sear the Chicken: Season your chicken thighs with salt, pepper, and Italian seasoning. Heat olive oil in a skillet over medium-high heat and sear the thighs for 5-6 minutes per side until beautifully golden brown and cooked through. Remove and set aside.',
      'STEP 2: Build the Tuscan Sauce: Lower the skillet heat to medium. Toss in your minced garlic and chopped sun-dried tomatoes, sautéing for 1 minute until fragrant. Pour in the rich chicken bone broth and heavy cream, bringing the layout to a smooth simmer.',
      'STEP 3: Wilt and Combine: Drop your washed baby spinach directly into the simmering cream base, stirring gently for 1-2 minutes until beautifully wilted. Slide the golden chicken thighs back into the skillet to absorb the pan juices.',
      'STEP 4: Plate and Serve: Spoon a substantial bed of warm, fluffy jasmine rice onto a shallow plate. Arrange the juicy chicken thighs alongside it, ladle a generous coat of the creamy Tuscan sauce over everything, and serve warm immediately.',
    ],
  },
];

export const lilBitesPostpartumMeals = [
  {
    id: 'lil_bites_broccoli_cheddar_rice_balls',
    category: 'toddler_kid',
    title: 'Broccoli & Cheddar Rice Balls',
    description:
      'Warm cheesy rice balls with hidden broccoli — a satisfying, grasp-friendly bite for little hands and tired mamas.',
    vibe:
      'Warm cheesy rice balls with hidden broccoli — a satisfying, grasp-friendly bite for little hands and tired mamas.',
    whyMamasLoveIt:
      'Broccoli provides essential vitamins while short-grain rice and cheddar cheese make a highly satisfying, easy-to-grasp finger food for little hands.',
    benefits:
      'Broccoli provides essential vitamins while short-grain rice and cheddar cheese make a highly satisfying, easy-to-grasp finger food for little hands.',
    kitchenTip:
      'Use tiny cut-outs of nori sheets or black olives to add little eyes and a smile onto each ball, turning them into cute little rice characters.',
    image: require('./assets/images/broccoli_cheddar_rice_balls.jpg'),
    ingredients: [
      '2 cups cooked short-grain white or brown rice (warm)',
      '1 cup broccoli florets, steamed and finely chopped',
      '1 cup shredded cheddar cheese',
      '1/4 tsp garlic powder',
      'Pinch of salt',
      'Small pieces of nori (seaweed) or black olives for cute face details',
    ],
    instructions: [
      'In a large mixing bowl, combine the warm cooked rice, finely chopped steamed broccoli, shredded cheddar cheese, garlic powder, and a pinch of salt.',
      'Mix thoroughly while the rice is warm so the cheese melts slightly and acts as a binder.',
      'Using clean, damp hands, scoop out about 2 tablespoons of the mixture and compress it firmly, rolling it into a tight, smooth ball.',
      'Repeat until you have formed all your rice balls. Place them on a serving plate.',
    ],
    recipeSteps: [
      'In a large mixing bowl, combine the warm cooked rice, finely chopped steamed broccoli, shredded cheddar cheese, garlic powder, and a pinch of salt.',
      'Mix thoroughly while the rice is warm so the cheese melts slightly and acts as a binder.',
      'Using clean, damp hands, scoop out about 2 tablespoons of the mixture and compress it firmly, rolling it into a tight, smooth ball.',
      'Repeat until you have formed all your rice balls. Place them on a serving plate.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_corn_black_bean_quesadilla',
    category: 'toddler_kid',
    title: 'Sweet Corn & Black Bean Quesadilla Triangles',
    description:
      'Golden quesadilla wedges with sweet corn and black beans — playful, protein-rich, and easy for toddlers to hold.',
    vibe:
      'Golden quesadilla wedges with sweet corn and black beans — playful, protein-rich, and easy for toddlers to hold.',
    whyMamasLoveIt:
      'A brilliant blend of plant-based protein from black beans and fiber from sweet corn, wrapped up in an easy-to-hold finger food.',
    benefits:
      'A brilliant blend of plant-based protein from black beans and fiber from sweet corn, wrapped up in an easy-to-hold finger food.',
    kitchenTip:
      'Arrange the triangles on a plate and use olive slices for eyes and small red pepper strips to build funny little animal faces on the quesadillas.',
    image: require('./assets/images/corn_black_bean_quesadilla.jpg'),
    ingredients: [
      '2 whole wheat or flour tortillas',
      '1/2 cup shredded Monterey Jack or cheddar cheese',
      '1/4 cup canned sweet corn, drained',
      '1/4 cup black beans, rinsed and drained',
      '1 tsp mild taco seasoning',
      'Sliced olives and red bell pepper pieces for decoration',
    ],
    instructions: [
      'In a small bowl, toss the sweet corn, black beans, and mild taco seasoning together.',
      'Place one tortilla flat in a dry skillet over medium heat.',
      'Sprinkle half of the cheese evenly over the tortilla, then scatter the corn and bean mixture over the cheese.',
      'Top with the remaining cheese and place the second tortilla on top.',
      'Cook for 3-4 minutes until the bottom is golden brown, then carefully flip and cook for another 2-3 minutes until the cheese is completely melted.',
      'Transfer to a cutting board and cut into neat triangle wedges.',
    ],
    recipeSteps: [
      'In a small bowl, toss the sweet corn, black beans, and mild taco seasoning together.',
      'Place one tortilla flat in a dry skillet over medium heat.',
      'Sprinkle half of the cheese evenly over the tortilla, then scatter the corn and bean mixture over the cheese.',
      'Top with the remaining cheese and place the second tortilla on top.',
      'Cook for 3-4 minutes until the bottom is golden brown, then carefully flip and cook for another 2-3 minutes until the cheese is completely melted.',
      'Transfer to a cutting board and cut into neat triangle wedges.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_star_turkey_sliders',
    category: 'toddler_kid',
    title: 'Star-Cut Turkey & Cheese Sliders',
    description:
      'Mini star-shaped turkey and cheddar sliders — protein-packed lunch magic that turns sandwiches into an adventure.',
    vibe:
      'Mini star-shaped turkey and cheddar sliders — protein-packed lunch magic that turns sandwiches into an adventure.',
    whyMamasLoveIt:
      'Protein-packed and instantly engaging. Cutting food into familiar star shapes turns an ordinary lunchtime sandwich into an exciting treat.',
    benefits:
      'Protein-packed and instantly engaging. Cutting food into familiar star shapes turns an ordinary lunchtime sandwich into an exciting treat.',
    kitchenTip:
      'Secure the slider layers with a kid-safe wooden toothpick topped with a tiny piece of cheese, and serve with star-shaped sweet potato pieces on the side.',
    image: require('./assets/images/star_turkey_cheese_sliders.jpg'),
    ingredients: [
      '6 slices of whole wheat artisanal bread',
      '3 slices of mild cheddar cheese',
      '3-4 slices of oven-roasted turkey breast',
      '1 tbsp organic butter or mild mayo',
      'Star-shaped cookie cutters',
    ],
    instructions: [
      'Lay the slices of whole wheat bread flat on a clean workspace.',
      'Use a large star-shaped cookie cutter to cut out star shapes from each slice of bread.',
      'Use the same star cutter to carefully shape the mild cheddar cheese and turkey slices.',
      'Assemble the mini sliders by spreading a thin layer of butter or mild mayo on the star bread pieces, then layering the turkey star and cheese star inside.',
    ],
    recipeSteps: [
      'Lay the slices of whole wheat bread flat on a clean workspace.',
      'Use a large star-shaped cookie cutter to cut out star shapes from each slice of bread.',
      'Use the same star cutter to carefully shape the mild cheddar cheese and turkey slices.',
      'Assemble the mini sliders by spreading a thin layer of butter or mild mayo on the star bread pieces, then layering the turkey star and cheese star inside.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_diy_lunchables_kit',
    category: 'toddler_kid',
    title: 'DIY Lunchables Kit',
    description:
      'A build-your-own cracker stack bento — interactive, separated, and perfect for picky eaters and busy mamas.',
    vibe:
      'A build-your-own cracker stack bento — interactive, separated, and perfect for picky eaters and busy mamas.',
    whyMamasLoveIt:
      'Encourages fine motor skills through interactive assembly, while keeping protein, healthy fats, and complex carbohydrates separated for picky eaters.',
    benefits:
      'Encourages fine motor skills through interactive assembly, while keeping protein, healthy fats, and complex carbohydrates separated for picky eaters.',
    kitchenTip:
      'Let the kids build their own cracker stacks at the table! Giving them control over assembly boosts their excitement for eating fresh foods.',
    image: require('./assets/images/diy_lunchables_kit.jpg'),
    ingredients: [
      '12 whole grain round crackers',
      '4 slices of organic ham or turkey, cut into fun shapes',
      '4 slices of cheddar or provolone cheese',
      '1/2 cup cucumber slices (cut into stars or flowers)',
      '1/4 cup mild dipping sauce or hummus',
    ],
    instructions: [
      'Use mini cookie cutters (bears, hearts, or stars) to cut your cheese and lunch meats into playful designs.',
      'Slice the cucumbers and use a flower or star cutter to reshape them into finger-friendly pieces.',
      'Grab a fun, divided kid’s plate or a small bento box.',
      'Separate the ingredients into their own compartments: crackers in one, shaped meats in another, cheese shapes in a third, and veggies in the fourth.',
    ],
    recipeSteps: [
      'Use mini cookie cutters (bears, hearts, or stars) to cut your cheese and lunch meats into playful designs.',
      'Slice the cucumbers and use a flower or star cutter to reshape them into finger-friendly pieces.',
      'Grab a fun, divided kid’s plate or a small bento box.',
      'Separate the ingredients into their own compartments: crackers in one, shaped meats in another, cheese shapes in a third, and veggies in the fourth.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_apple_cinnamon_oat_balls',
    category: 'toddler_kid',
    title: 'Apple Cinnamon Oat Balls',
    description:
      'No-bake apple cinnamon oat bites — naturally sweet, fiber-rich, and gentle on tiny tummies and mama’s too.',
    vibe:
      'No-bake apple cinnamon oat bites — naturally sweet, fiber-rich, and gentle on tiny tummies and mama’s too.',
    whyMamasLoveIt:
      'Naturally sweet and packed with dietary fiber from oats and fresh apples to support gentle digestion for both toddler and mama.',
    benefits:
      'Naturally sweet and packed with dietary fiber from oats and fresh apples to support gentle digestion for both toddler and mama.',
    kitchenTip:
      'Arrange the sweet oat balls on a platter with fresh blueberries and raspberries, forming a colorful snack train or a little edible caterpillar.',
    image: require('./assets/images/apple_cinnamon_oat_balls.jpg'),
    ingredients: [
      '1 cup rolled oats',
      '1/2 cup sweet apple puree or unsweetened applesauce',
      '1/4 cup almond or sunflower seed butter',
      '1/4 cup dried apples or raisins, finely minced',
      '1/2 tsp ground cinnamon',
      '1 tbsp pure honey or maple syrup',
    ],
    instructions: [
      'In a medium mixing bowl, thoroughly combine the rolled oats, apple puree, seed butter, minced dried fruit, cinnamon, and honey.',
      'Stir until the mixture forms a thick, sticky dough that holds together easily.',
      'Place the bowl in the refrigerator for 15-20 minutes to let the oats hydrate and firm up.',
      'Scoop out tablespoon-sized portions and roll them smoothly between your palms into bite-sized balls.',
    ],
    recipeSteps: [
      'In a medium mixing bowl, thoroughly combine the rolled oats, apple puree, seed butter, minced dried fruit, cinnamon, and honey.',
      'Stir until the mixture forms a thick, sticky dough that holds together easily.',
      'Place the bowl in the refrigerator for 15-20 minutes to let the oats hydrate and firm up.',
      'Scoop out tablespoon-sized portions and roll them smoothly between your palms into bite-sized balls.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_veggie_mac_n_cheese',
    category: 'toddler_kid',
    title: 'Veggie Mac and Cheese with Chicken Nuggets',
    description:
      'Hidden-veggie golden mac crowned with crispy nuggets — comfort food with a secret nutrient boost kids adore.',
    vibe:
      'Hidden-veggie golden mac crowned with crispy nuggets — comfort food with a secret nutrient boost kids adore.',
    whyMamasLoveIt:
      'The sweet vegetable puree blends seamlessly into the cheese sauce for an invisible nutrient boost, alongside high-protein nuggets that kids love.',
    benefits:
      'The sweet vegetable puree blends seamlessly into the cheese sauce for an invisible nutrient boost, alongside high-protein nuggets that kids love.',
    kitchenTip:
      'Line the chicken nuggets around the bowl like a sunny crown, or let little ones dip each nugget into the cheesy pasta center.',
    image: require('./assets/images/veggie_mac_n_cheese.jpg'),
    ingredients: [
      '8 oz elbow macaroni (chickpea or whole wheat)',
      '1 cup butternut squash or carrot puree',
      '1 cup shredded mild cheddar cheese',
      '1/4 cup milk',
      '6-8 organic star-shaped or regular chicken nuggets',
      '1/2 cup steamed peas and corn',
    ],
    instructions: [
      'Cook the elbow macaroni in boiling water according to package directions, then drain.',
      'While the pasta is hot, return it to the pot over low heat and stir in the butternut squash puree, milk, and shredded cheddar cheese.',
      'Stir continuously until the cheese melts into a smooth, hidden-veggie golden sauce.',
      'Bake or air-fry your chicken nuggets according to package instructions until crisp and golden.',
      'Toss the steamed peas and corn directly into the cheesy pasta for extra color.',
      'Spoon the warm veggie mac and cheese into a serving bowl and arrange the crispy chicken nuggets right on top.',
    ],
    recipeSteps: [
      'Cook the elbow macaroni in boiling water according to package directions, then drain.',
      'While the pasta is hot, return it to the pot over low heat and stir in the butternut squash puree, milk, and shredded cheddar cheese.',
      'Stir continuously until the cheese melts into a smooth, hidden-veggie golden sauce.',
      'Bake or air-fry your chicken nuggets according to package instructions until crisp and golden.',
      'Toss the steamed peas and corn directly into the cheesy pasta for extra color.',
      'Spoon the warm veggie mac and cheese into a serving bowl and arrange the crispy chicken nuggets right on top.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_grilled_cheese_cream_cheese',
    category: 'toddler_kid',
    title: 'Grilled Cheese with Cream Cheese',
    description:
      'Double-cheese animal-shaped grilled sandwiches — velvety inside, golden outside, and irresistibly toddler-friendly.',
    vibe:
      'Double-cheese animal-shaped grilled sandwiches — velvety inside, golden outside, and irresistibly toddler-friendly.',
    whyMamasLoveIt:
      'The cream cheese creates an extra velvety, melt-in-your-mouth interior texture that is incredibly comforting and easier for younger kids to chew.',
    benefits:
      'The cream cheese creates an extra velvety, melt-in-your-mouth interior texture that is incredibly comforting and easier for younger kids to chew.',
    kitchenTip:
      'Use tiny dollops of cream cheese and small fruit pieces on top of the crust to give your cheese animals little eyes and whiskers.',
    image: require('./assets/images/grilled_cheese_cream_cheese.jpg'),
    ingredients: [
      '4 slices of soft whole grain bread',
      '2 tbsp whipped cream cheese',
      '2 slices of pasteurized American or cheddar cheese',
      '1 tbsp organic butter',
      'Animal-shaped sandwich cutters',
    ],
    instructions: [
      'Spread a smooth, even layer of whipped cream cheese on the inner sides of all bread slices.',
      'Place a slice of cheddar or American cheese in the center to create a double-cheese filling, then close the sandwiches.',
      'Butter the outer surfaces of the bread lightly.',
      'Heat a skillet over medium-low heat and grill the sandwiches for 3 minutes on each side until golden brown and beautifully gooey.',
      'Remove from heat and immediately press your animal sandwich cutter (like a bear or a cat) into the sandwich to create fun shapes.',
    ],
    recipeSteps: [
      'Spread a smooth, even layer of whipped cream cheese on the inner sides of all bread slices.',
      'Place a slice of cheddar or American cheese in the center to create a double-cheese filling, then close the sandwiches.',
      'Butter the outer surfaces of the bread lightly.',
      'Heat a skillet over medium-low heat and grill the sandwiches for 3 minutes on each side until golden brown and beautifully gooey.',
      'Remove from heat and immediately press your animal sandwich cutter (like a bear or a cat) into the sandwich to create fun shapes.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_sloppy_joe_pasta',
    category: 'toddler_kid',
    title: 'Sloppy Joe Pasta',
    description:
      'Spiral pasta coated in savory sloppy joe ragu with hidden veggies — less mess, more smiles, more nutrition.',
    vibe:
      'Spiral pasta coated in savory sloppy joe ragu with hidden veggies — less mess, more smiles, more nutrition.',
    whyMamasLoveIt:
      'Spiral pasta holds onto the savory meat sauce flawlessly, making it far less messy for toddlers to eat while packing in finely grated antioxidant-rich veggies.',
    benefits:
      'Spiral pasta holds onto the savory meat sauce flawlessly, making it far less messy for toddlers to eat while packing in finely grated antioxidant-rich veggies.',
    kitchenTip:
      'Melt a round circle of cheese in the center and use sliced vegetables to fashion a cute bear face right on top of the pasta pile.',
    image: require('./assets/images/sloppy_joe_pasta.jpg'),
    ingredients: [
      '1/2 lb lean ground turkey or beef',
      '1.5 cups rotini or fusilli pasta',
      '1 cup organic tomato sauce',
      '1 tbsp tomato paste',
      '1/2 cup finely grated carrots and zucchini',
      '1/4 cup shredded cheese for topping',
    ],
    instructions: [
      'Bring a pot of water to a boil and cook your spiral pasta until tender, then drain.',
      'In a separate skillet, brown the ground meat over medium heat until cooked entirely through, breaking it down into tiny, kid-friendly crumbles.',
      'Stir the finely grated carrots and zucchini directly into the meat, cooking for 3 minutes until soft.',
      'Pour in the tomato sauce and tomato paste, lowering the heat to let it simmer into a thick, sweet, savory ragu.',
      'Toss the drained spiral pasta directly into the sloppy joe sauce until every noodle is well-coated.',
      'Plate the pasta and sprinkle with a touch of shredded cheese.',
    ],
    recipeSteps: [
      'Bring a pot of water to a boil and cook your spiral pasta until tender, then drain.',
      'In a separate skillet, brown the ground meat over medium heat until cooked entirely through, breaking it down into tiny, kid-friendly crumbles.',
      'Stir the finely grated carrots and zucchini directly into the meat, cooking for 3 minutes until soft.',
      'Pour in the tomato sauce and tomato paste, lowering the heat to let it simmer into a thick, sweet, savory ragu.',
      'Toss the drained spiral pasta directly into the sloppy joe sauce until every noodle is well-coated.',
      'Plate the pasta and sprinkle with a touch of shredded cheese.',
    ],
    isKidFriendly: true,
  },
  {
    id: 'lil_bites_pbj_on_a_stick',
    category: 'toddler_kid',
    title: 'PB&J on a Stick with Strawberries and Bananas',
    description:
      'Mini PB&J bites threaded with fruit on kid-safe sticks — interactive, colorful, and nourishing for the whole village.',
    vibe:
      'Mini PB&J bites threaded with fruit on kid-safe sticks — interactive, colorful, and nourishing for the whole village.',
    whyMamasLoveIt:
      'Transforms a classic sandwich into an interactive fruit-forward kabob, delivering healthy fats, clean protein, and raw vitamins in a fun structure.',
    benefits:
      'Transforms a classic sandwich into an interactive fruit-forward kabob, delivering healthy fats, clean protein, and raw vitamins in a fun structure.',
    kitchenTip:
      'Arrange the skewers in a colorful fan pattern on a bright plate alongside a small bowl of vanilla yogurt for dipping.',
    image: require('./assets/images/pbj_on_a_stick.jpg'),
    ingredients: [
      '2 slices of soft whole wheat bread',
      '1.5 tbsp creamy peanut butter or sunflower seed butter',
      '1 tbsp all-natural strawberry jam',
      '4 fresh strawberries, hulled and halved',
      '1 ripe banana, sliced into thick coins',
      'Kid-safe wooden skewers or paper cake-pop sticks',
    ],
    instructions: [
      'Assemble a standard peanut butter and jam sandwich using the bread, seed butter, and strawberry jam.',
      'Using a small circle or star cookie cutter, cut the sandwich into several bite-sized mini shapes.',
      'Prepare your fruit by washing the strawberries and slicing your banana coins to match the thickness of the mini sandwiches.',
      'Take your kid-safe skewer and carefully alternate sliding a mini PB&J bite, a banana coin, and a strawberry half onto the stick.',
      'Repeat until the skewer is filled up, leaving space at the bottom for little hands to hold.',
    ],
    recipeSteps: [
      'Assemble a standard peanut butter and jam sandwich using the bread, seed butter, and strawberry jam.',
      'Using a small circle or star cookie cutter, cut the sandwich into several bite-sized mini shapes.',
      'Prepare your fruit by washing the strawberries and slicing your banana coins to match the thickness of the mini sandwiches.',
      'Take your kid-safe skewer and carefully alternate sliding a mini PB&J bite, a banana coin, and a strawberry half onto the stick.',
      'Repeat until the skewer is filled up, leaving space at the bottom for little hands to hold.',
    ],
    isKidFriendly: true,
  },
];

/** Postpartum Mama — meals by tab + Lil Bites */
export const postpartumMealPlan = {
  morning: morningPostpartumMeals,
  noon: lunchPostpartumMeals,
  night: dinnerPostpartumMeals,
  lil_bites: lilBitesPostpartumMeals,
};

const POSTPARTUM_TAB_TO_SLOT = {
  morning: 'morning',
  afternoon: 'noon',
  night: 'night',
};

export function getPostpartumMealsForTab(tabId) {
  const slot = POSTPARTUM_TAB_TO_SLOT[tabId] || tabId;
  return (postpartumMealPlan[slot] || []).map((meal) => ({ ...meal, category: slot }));
}

export const postpartumMealsData = [
  ...postpartumMealPlan.morning.map((meal) => ({ ...meal, category: 'morning' })),
  ...postpartumMealPlan.noon.map((meal) => ({ ...meal, category: 'noon' })),
  ...postpartumMealPlan.night.map((meal) => ({ ...meal, category: 'night' })),
  ...postpartumMealPlan.lil_bites.map((meal) => ({ ...meal, category: 'toddler_kid' })),
];

export const lilBitesRecipes = lilBitesPostpartumMeals;

export const toddlerMealsData = lilBitesRecipes;

const CATEGORY_BY_TAB = {
  morning: 'morning',
  afternoon: 'noon',
  night: 'night',
  toddler_kid: 'toddler_kid',
};

function enrichKitchenMeal(meal) {
  const slug = encodeURIComponent(meal.title);
  const isKidFriendly = meal.isKidFriendly === true || meal.category === 'toddler_kid';
  const hasLilBiteCopy = Boolean(meal.vibe && meal.whyMamasLoveIt && meal.kitchenTip);
  const postpartumBenefit = meal.benefits || meal.lactationBoost;
  const recipeSteps = meal.recipeSteps || meal.instructions;
  const mealDescription = meal.description || meal.vibe;
  const hasDetailedRecipe =
    Array.isArray(meal.ingredients) &&
    meal.ingredients.length > 0 &&
    Array.isArray(recipeSteps) &&
    recipeSteps.length > 0;
  const hasPostpartumCopy = Boolean(
    mealDescription && postpartumBenefit && (meal.kitchenTip || hasDetailedRecipe)
  );
  const highlightTags = Array.isArray(meal.tags) ? meal.tags : [];
  const dietaryTags = resolveMealDietaryTags(meal);
  const prepMatch = meal.timeline?.match(/(\d+)\s*mins?\s*prep/i);
  const prepMinutes = prepMatch
    ? parseInt(prepMatch[1], 10)
    : isKidFriendly
      ? 15
      : 20;

  return assignKitchenImage({
    ...meal,
    benefits: postpartumBenefit,
    lactationBoost: postpartumBenefit,
    isKidFriendly,
    subtitle: mealDescription,
    description: mealDescription,
    prepMinutes,
    servings: 2,
    tags: {
      pregnant: meal.tags?.pregnant || ['protein', 'hydration'],
      dietary: dietaryTags,
      highlights: highlightTags,
    },
    ingredients: hasDetailedRecipe
      ? meal.ingredients
      : hasLilBiteCopy
        ? [
            ...highlightTags,
            'Gather fresh ingredients for this Little Bites recipe.',
            'Season gently and prep at a calm, unhurried pace.',
          ]
        : hasPostpartumCopy
          ? [
              meal.timeline,
              'Gather nourishing ingredients for this postpartum recovery meal.',
            ]
          : [
              'Gather fresh ingredients for this village rotation meal.',
              'Season gently with salt, pepper, and herbs to taste.',
              'Prepare at a calm pace — nourishment is the goal.',
            ],
    instructions: hasDetailedRecipe ? recipeSteps : undefined,
    steps: hasDetailedRecipe
      ? recipeSteps
      : hasLilBiteCopy
        ? [meal.whyMamasLoveIt, meal.kitchenTip]
        : hasPostpartumCopy
          ? [postpartumBenefit, meal.kitchenTip]
          : [
              'Prep ingredients with care and wash produce thoroughly.',
              'Cook or assemble following your preferred gentle method.',
              'Plate warmly, breathe, and enjoy mindfully.',
            ],
    instacartUrl: `https://www.instacart.com/store/s?k=${slug}`,
    amazonUrl: `https://www.amazon.com/s?k=${slug}&tag=calmmamavilla-20`,
  });
}

/** Screen-ready roster — stable ids, locked image URIs, no catalog duplication */
export const TODDLER_KITCHEN_RECIPES = toddlerMealsData.map(enrichKitchenMeal);

// Unified source-of-truth (rotation + toddler/kid)
export const MAMA_KITCHEN_RECIPES = [
  ...mealsData,
  ...postpartumMealsData,
  ...toddlerMealsData,
].map(enrichKitchenMeal);

// Use the real category id so UI ↔ data stays 1:1
export const KITCHEN_LITTLE_BITES_TAB = 'toddler_kid';

export const KITCHEN_CATEGORY_BY_TIME = CATEGORY_BY_TAB;

export function filterKitchenRecipes(recipes, dietaryFilter, timeOfDay) {
  let result = recipes;

  if (timeOfDay === KITCHEN_LITTLE_BITES_TAB) {
    result = result.filter((r) => r.category === 'toddler_kid' || r.isKidFriendly);
  } else {
    const category = CATEGORY_BY_TAB[timeOfDay];
    if (category) {
      result = result.filter((r) => r.category === category);
    }
  }

  if (dietaryFilter) {
    result = result.filter((r) => mealMatchesDietaryFilter(r, dietaryFilter));
  }

  return result;
}

export function getDefaultKitchenTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}
