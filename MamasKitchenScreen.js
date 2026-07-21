import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Linking,
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import {
  MAMA_KITCHEN_RECIPES,
  mealsData,
  toddlerMealsData,
  getPostpartumMealsForTab,
  KITCHEN_FILTERS,
  getDefaultKitchenTimeOfDay,
  KITCHEN_LITTLE_BITES_TAB,
} from './mealsData';
import { getTherapeuticMeals } from './mealsTherapeuticMap';
import PremiumGateOverlay from './PremiumGateOverlay';
import { KITCHEN_SERIF } from './designTypography';
import { mealMatchesDietaryFilter, resolveMealDietaryTags } from './kitchenDietaryTags';
import { VILLAGE_SNAPPY_SPRING, VILLAGE_USE_NATIVE_DRIVER } from './villageScreenTransitions';
import { Image } from 'expo-image';
import { LIST_PERF } from './tabShellConfig';
import {
  warmPregnantKitchenImages,
  warmPregnantKitchenTabImages,
  PREGNANT_KITCHEN_TAB_IMAGES,
} from './pregnantKitchenImagePreload';
import AppleOatsImage from './assets/images/apple-cinnamon-oats.jpg';
import OmeletteImage from './assets/images/spinach-feta-omelette.jpg';
import AvocadoToastImage from './assets/images/avocado-toast-egg.jpg';
import SmoothieImage from './assets/images/pb-banana-smoothie.jpg';
import PancakesImage from './assets/images/whole-grain-pancakes.jpg';
import BurritoImage from './assets/images/loaded-breakfast-burrito.jpg';
import TurkeyMeltImage from './assets/images/turkey-cheddar-melt.jpg';
import SalmonSaladImage from './assets/images/salmon-avocado-salad.jpg';
import ChickenWrapImage from './assets/images/mediterranean-chicken-wrap.jpg';
import TacosImage from './assets/images/warm-turkey-beef-tacos.jpg';
import PaniniImage from './assets/images/ham-swiss-panini.jpg';
import MiniPizzasImage from './assets/images/english-muffin-mini-pizzas.jpg';
import BurgerDinnerImage from './assets/images/well-done-burger-wedges.jpg';
import PestoPastaImage from './assets/images/rotisserie-pesto-pasta.jpg';
import AlfredoPastaImage from './assets/images/chicken-broccoli-alfredo.jpg';
import SloppyJoesImage from './assets/images/ground-chicken-sloppy-joes.jpg';
import SheetPanGnocchiImage from './assets/images/sheet-pan-gnocchi.jpg';
import TahiniToastImage from './assets/images/tahini-honey-toast.jpg';
import ChiliCrispAvocadoToastImage from './assets/images/chili-crisp-avocado-toast.jpg';
import GoldenMilkSmoothieImage from './assets/images/golden-milk-smoothie.jpg';
import SpinachQuesadillaImage from './assets/images/cheddar-spinach-quesadilla.jpg';
import LactationBitesImage from './assets/images/pb-lactation-bites.jpg';
import BerryOatmealImage from './assets/images/berry-infusions-oatmeal.jpg';
import ChickenFiestaBowlImage from './assets/images/chicken-fiesta-bowl.jpg';
import ClassicBltImage from './assets/images/classic-blt-sourdough.jpg';
import PostpartumCharcuterieImage from './assets/images/postpartum-charcuterie.jpg';
import TurkeyMeatballsImage from './assets/images/turkey-spinach-meatballs.jpg';
import ShrimpScampiImage from './assets/images/shrimp-garlic-scampi.jpg';
import CreamyTuscanChickenImage from './assets/images/creamy-tuscan-chicken.jpg';
import SpinachCheddarToastImage from './assets/images/spinach_cheddar_toast.jpg';
import CheesyGritsEggsImage from './assets/images/cheesy_grits_eggs.jpg';
import BerryChiaHempBowlImage from './assets/images/berry_chia_hemp_bowl.jpg';
import SalsaChickenTacosImage from './assets/images/salsa_chicken_tacos.jpg';
import LoxCreamCheeseBagelImage from './assets/images/lox_cream_cheese_bagel.jpg';
import BananaBerrySmoothieImage from './assets/images/banana_berry_smoothie.jpg';
import TurkeySloppyJoesImage from './assets/images/turkey_sloppy_joes.jpg';
import ChickenPestoPastaImage from './assets/images/chicken_pesto_pasta.jpg';
import TomatoSoupGrilledCheeseImage from './assets/images/tomato_soup_grilled_cheese.jpg';
import TurkeyProvoloneMeltImage from './assets/images/turkey_provolone_melt.jpg';
import BoiledEggsSeasoningImage from './assets/images/boiled_eggs_seasoning.jpg';
import GreekYogurtWalnutsImage from './assets/images/greek_yogurt_walnuts.jpg';
import * as Haptics from 'expo-haptics';

function isPremiumKitchenRecipe(recipe, tabId, index) {
  if (recipe?.__pad) return false;
  if (recipe?.isPremium === true) return true;
  return index >= 3;
}

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const PHONE_MAX_W = 480;
const H_PAD = 16;
const GRID_GAP = 12;
const THREE_COL_BREAKPOINT = 360;
const GLASS_PANEL = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.35)',
};

const RECIPE_LOOKUP = new Map(MAMA_KITCHEN_RECIPES.map((recipe) => [recipe.id, recipe]));

function buildIngredientShopUrls(title) {
  const slug = encodeURIComponent(String(title || 'groceries').trim() || 'groceries');
  return {
    instacartUrl: `https://www.instacart.com/store/s?k=${slug}`,
    amazonUrl: `https://www.amazon.com/s?k=${slug}&tag=calmmamavilla-20`,
  };
}

function enrichMeal(meal) {
  const enriched = RECIPE_LOOKUP.get(meal.id);
  const localSteps = Array.isArray(meal.instructions)
    ? meal.instructions
    : Array.isArray(meal.recipeSteps)
      ? meal.recipeSteps
      : [];
  const ingredients = Array.isArray(meal.ingredients)
    ? meal.ingredients
    : Array.isArray(enriched?.ingredients)
      ? enriched.ingredients
      : [];
  const shopUrls = buildIngredientShopUrls(meal.title || enriched?.title);
  const merged = {
    ...meal,
    description: meal.description ?? meal.vibe ?? enriched?.description ?? enriched?.subtitle,
    benefits: meal.benefits ?? meal.lactationBoost ?? enriched?.benefits ?? enriched?.lactationBoost,
    isPremium: meal.isPremium === true,
    ingredients,
    instructions: localSteps.length
      ? localSteps
      : Array.isArray(enriched?.instructions)
        ? enriched.instructions
        : enriched?.recipeSteps ?? enriched?.steps ?? [],
    instacartUrl: meal.instacartUrl || enriched?.instacartUrl || shopUrls.instacartUrl,
    amazonUrl: meal.amazonUrl || enriched?.amazonUrl || shopUrls.amazonUrl,
  };
  const dietary =
    Array.isArray(meal.dietary) && meal.dietary.length
      ? meal.dietary
      : enriched?.tags?.dietary?.length
        ? enriched.tags.dietary
        : resolveMealDietaryTags(merged);
  return {
    ...merged,
    dietary,
    tags: {
      pregnant: enriched?.tags?.pregnant ?? ['protein', 'hydration'],
      dietary,
      highlights: enriched?.tags?.highlights ?? [],
    },
  };
}

const BOOT_MEALS_CACHE = {
  morning: mealsData.filter((item) => item.category === 'morning').map(enrichMeal),
  noon: mealsData.filter((item) => item.category === 'noon').map(enrichMeal),
  night: mealsData.filter((item) => item.category === 'night').map(enrichMeal),
  pregnantMorning: null,
  pregnantLunch: null,
  pregnantDinner: null,
};

const POSTPARTUM_TAB_CACHE = {};

const POSTPARTUM_MORNING_HEALING_HEAD = [
  {
    id: 'postpartum_tahini_honey_toast',
    title: 'Tahini & Honey Drizzled Toast',
    description:
      'A creamy, nutty, and subtly sweet artisanal toast packed with healthy fats and essential minerals for early recovery.',
    image: TahiniToastImage,
    benefits:
      "Postpartum Healing Benefits: Sesame tahini is an ancient postpartum powerhouse. It is exceptionally rich in highly absorbable calcium and healthy fats, which are vital for replenishing bone density depleted during childbirth and promoting a rich, steady breastmilk supply. The pure honey provides a gentle, easily digestible glycogen boost to help restore tired muscles.",
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
  },
  {
    id: 'postpartum_chili_crisp_avocado_toast',
    title: 'Chili Crisp Avocado Toast with a Fried Egg',
    description:
      'Creamy mashed avocado over crispy sourdough, topped with a fried egg and a warm, savory drizzle of chili crisp.',
    image: ChiliCrispAvocadoToastImage,
    benefits:
      "Postpartum Healing Benefits: Eggs are nature's premium source of Choline and high-quality protein, essential for repairing stretched tissues and supporting continuous infant brain development via breastmilk. The healthy monounsaturated fats in avocado aid in postpartum hormone stabilization and help keep energy levels steady throughout sleepless nights.",
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
  },
  {
    id: 'postpartum_golden_milk_smoothie',
    title: 'Golden Milk Turmeric Smoothie',
    description:
      'A vibrant, velvety cold smoothie blended with warming, traditional anti-inflammatory spices.',
    image: GoldenMilkSmoothieImage,
    benefits:
      "Postpartum Healing Benefits: This smoothie acts as a deep tissue anti-inflammatory tonic. Turmeric (haridra) and ginger are celebrated in traditional postpartum recovery to dramatically soothe joint soreness, reduce systemic swelling, and actively protect nursing mamas against clogged ducts and mastitis. The tiny pinch of black pepper boosts your body's curcumin absorption exponentially.",
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
  },
];

const POSTPARTUM_MORNING_PREMIUM_TAIL = [
  {
    id: 'postpartum_cheddar_spinach_quesadilla',
    title: 'Cheddar & Spinach Breakfast Quesadilla',
    description:
      'A crispy, warm whole-wheat tortilla packed with fluffy scrambled eggs, melted sharp cheddar, and iron-dense wilted spinach.',
    image: SpinachQuesadillaImage,
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Childbirth involves significant blood loss, making immediate iron replenishment a critical priority to prevent fatigue. Warm wilted spinach provides an excellent plant-based source of iron and folate, while the eggs deliver complete proteins needed to repair pelvic floor and abdominal tissues. Sharp cheddar adds a rich dose of calcium to assist with uterine muscle recovery.',
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
  },
  {
    id: 'postpartum_pb_lactation_bites',
    title: 'Peanut Butter Cookie Lactation Bites',
    description:
      'Chewy, sweet, and satisfying no-bake energy bites packed with natural galactagogues to support healthy milk production.',
    image: LactationBitesImage,
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: These bites are an absolute lifesaver for breastfeeding mamas. Rolled oats and ground flaxseed are classic galactagogues, historically trusted to naturally boost breastmilk volume and quality. The creamy peanut butter serves as a source of clean protein and dense caloric energy to support the demanding physical workloads of lactation, while a touch of dark chocolate chips provides a blissful antioxidant release.',
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
  },
  {
    id: 'postpartum_warm_berry_oatmeal_bowl',
    title: 'Warm Berry-Infused Oatmeal Bowl',
    description:
      'A deeply comforting, hearty bowl of rolled oats simmered to a creamy perfection and swirled with a warm, antioxidant-rich mixed berry compote.',
    image: BerryOatmealImage,
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: A substantial, warm bowl of fiber-rich oats is exactly what an early postpartum body needs to gently restart the digestive system and prevent postpartum constipation. Oats are an incredibly rich source of iron, beta-glucans, and complex carbohydrates, which work together to steadily fuel milk production and curb intense nursing hunger. The warm berry infusion adds a massive wave of Vitamin C, optimizing your body\'s cellular tissue repair and iron absorption simultaneously.',
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
  },
];

const POSTPARTUM_LUNCH_RECOVERY_TAIL = [
  {
    id: 'postpartum_chicken_fiesta_bowl',
    title: 'Black Bean, Corn, and Grilled Chicken Fiesta Bowl',
    description:
      'A vibrant, satisfying recovery bowl loaded with lean grilled chicken breast, fiber-rich black beans, sweet corn, and crisp peppers over a fluffy bed of brown rice.',
    image: ChickenFiestaBowlImage,
    benefits:
      "Postpartum Healing Benefits: Lean grilled chicken breast provides a massive source of clean protein and amino acids crucial for rebuilding cellular tissue, repairing abdominal muscles, and supporting the metabolic demands of milk production. Black beans supply essential iron and dietary fiber to keep digestion moving smoothly, while sweet corn and bell peppers deliver a blast of antioxidants and Vitamin C to naturally enhance iron absorption and bolster mama's immune health.",
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
  },
  {
    id: 'postpartum_classic_blt_sourdough',
    title: 'Classic BLT on Sprouted Sourdough',
    description:
      'Crisp, smoky turkey or high-quality bacon layered with juicy sliced ripe tomatoes, fresh crisp lettuce, and a light spread of avocado oil mayo on toasted sprouted sourdough.',
    image: ClassicBltImage,
    benefits:
      "Postpartum Healing Benefits: Sprouted sourdough is exceptionally gentle on the early postpartum digestive tract, offering higher bioavailable nutrients and easier breakdown than standard breads. Crisp, mineral-rich lettuce and juicy vine-ripened tomatoes provide immediate cellular hydration and vital Vitamin C to help stitch tissue back together, while smoky bacon or turkey bacon delivers a highly satisfying, comforting caloric reward that rewards a nursing mama's hard work.",
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
  },
  {
    id: 'postpartum_charcuterie_plate',
    title: 'The Postpartum "Charcuterie" Plate',
    description:
      'The ultimate, no-cook grazing board loaded with premium sliced prosciutto, oven-roasted turkey, aged pasteurized cheddar, creamy brie, whole-grain seed crackers, crunchy almonds, and iron-dense dried figs and apricots.',
    image: PostpartumCharcuterieImage,
    benefits:
      'Postpartum Healing Benefits: This platter is designed for maximum nutrient density with absolute zero cooking required. Early postpartum mamas need constant, easy-to-grab energy. Prosciutto and roasted turkey provide dense, high-quality proteins for ongoing cellular tissue repair, while dried apricots and figs serve as an incredibly potent source of non-heme iron to directly rebuild blood volume lost during delivery. Raw walnuts and almonds supply anti-inflammatory Omega-3 fatty acids to help combat postpartum brain fog and support emotional hormone regulation.',
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
      "STEP 1: Prep the Board: Grab a clean wooden cutting board or large ceramic plate to act as your layout canvas.",
      'STEP 2: Arrange the Proteins and Cheeses: Artfully roll or drape your prosciutto and turkey slices on one side of the board. Place your pasteurized cheddar slices and brie wedge nearby.',
      'STEP 3: Fill the Gaps with Color: Scatter your washed fresh grapes, strawberries, crunchy almonds, walnuts, and dried iron-rich fruits right into the center loops of the board layout.',
      "STEP 4: Garnish and Graze: Place a stack of whole-grain seed crackers alongside a small dish of honey or hummus. Serve cool at a moment's notice—perfect for snacking with one hand while nursing or resting.",
    ],
  },
];

const POSTPARTUM_DINNER_PREMIUM_TAIL = [
  {
    id: 'postpartum_turkey_spinach_meatballs',
    title: 'Turkey & Spinach Meatballs over Marinara',
    description:
      'Tender, baked lean ground turkey meatballs packed with chopped iron-dense spinach, served over a rich bed of warm, traditional savory marinara sauce.',
    image: TurkeyMeatballsImage,
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Ground turkey is an excellent source of lean protein and tryptophan, which naturally aids in the synthesis of serotonin to support postpartum mood stabilization and emotional well-being. Finely minced spinach loaded directly into the meatballs offers crucial iron reserves to steadily rebuild blood volume post-delivery, while the cooked tomato marinara provides a high dose of vitamin C to maximize iron bio-absorption and lycopene for deep cellular recovery.',
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
  },
  {
    id: 'postpartum_shrimp_garlic_scampi',
    title: 'Shrimp & Garlic Scampi over Angel Hair',
    description:
      'Plump, succulent shrimp sautéed in a fragrant garlic, lemon, and olive oil reduction, tossed elegantly over a delicate nest of angel hair pasta.',
    image: ShrimpScampiImage,
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Shrimp is an incredible seafood choice for recovery, delivering a dense supply of premium protein, selenium, and zinc to support cellular tissue healing and optimize thyroid function post-delivery. Garlic acts as a natural immune defender and circulatory booster, historically celebrated for its gentle warming properties during early postpartum. The touch of fresh lemon juice supplies refreshing vitamin C to boost systemic collagen production.',
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
  },
  {
    id: 'postpartum_creamy_tuscan_chicken',
    title: 'Creamy Tuscan Chicken Thighs with Jasmine Rice',
    description:
      'Tender, juicy pan-seared chicken thighs simmered in a rich, velvety cream sauce with sun-dried tomatoes and fresh spinach, served alongside fluffy jasmine rice.',
    image: CreamyTuscanChickenImage,
    isPremium: true,
    benefits:
      'Postpartum Healing Benefits: Chicken thighs are exceptionally well-suited for early postpartum recovery, offering a higher concentration of iron and zinc than chicken breast to directly aid blood replenishment and tissue stitching. Searing the chicken with skin-on or utilizing thighs provides crucial fat-soluble vitamins and collagen-building proteins. The iron-dense baby spinach and antioxidant-rich sun-dried tomatoes balance the velvety sauce, while premium jasmine rice provides an easily digestible carbohydrate base to rapidly restore depleted glycogen stores for exhausted mamas.',
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
  },
];

const LITTLE_BITES_TAB = {
  id: KITCHEN_LITTLE_BITES_TAB,
  label: 'Little Bites',
  emoji: '🧸',
};

const PREGNANT_MAMA_MORNING_MEALS = [
  {
    id: 'apple-oats_01',
    title: 'Apple Cinnamon Walnut Overnight Oats',
    description:
      'A creamy, high-fiber start: rolled oats infused with warm cinnamon, diced apple chunks, and crunchy walnuts.',
    image: AppleOatsImage,
    ingredients: [
      '1/2 cup Rolled Oats (certified gluten-free if needed)',
      '1/2 cup Unsweetened Almond or Oat Milk',
      '1/2 teaspoon Ground Cinnamon',
      '1/4 teaspoon Vanilla Extract',
      '1 tablespoon Chia Seeds (optional, for extra thickness)',
      '1/2 small Apple (e.g., Gala), diced or grated',
      '1 tablespoon Maple Syrup or Honey',
      '1/4 cup Chopped Walnuts',
    ],
    instructions: [
      'STEP 1: The Base: In a small bowl or clean mason jar, combine the rolled oats, chia seeds, ground cinnamon, vanilla extract, and your milk choice. Stir until well combined.',
      'STEP 2: The Infusion: Gently fold in the diced (or grated) apple and your chosen sweetener (maple syrup or honey).',
      'STEP 3: The Chill: Seal the container tightly with a lid and place it in the refrigerator for at least 4 hours, or ideally, overnight (8+ hours), allowing the oats to soften completely.',
      'STEP 4: The Finish: In the morning, remove the jar from the fridge. Give the oats a quick stir. If they are too thick, add a splash of milk. Top generously with the chopped walnuts and a final dash of cinnamon right before serving.',
    ],
  },
  {
    id: 'omelette_01',
    title: 'Spinach & Feta Omelette',
    description:
      'A fluffy, protein-packed three-egg omelette folded over fresh sautéed baby spinach and creamy, tangy feta cheese.',
    image: OmeletteImage,
    ingredients: [
      '3 Large Eggs',
      '2 cups Fresh Baby Spinach',
      '2 tablespoons Feta Cheese, crumbled',
      '1 tablespoon Milk or Heavy Cream (optional, for fluffiness)',
      '1 teaspoon Olive Oil',
      'Salt and Black Pepper to taste',
    ],
    instructions: [
      'STEP 1: Prep the Veggies: Heat olive oil in a non-stick skillet over medium-high heat. Add the fresh baby spinach and sauté for 1-2 minutes, until just wilted. Remove the spinach from the skillet and set aside. Wipe the skillet clean.',
      'STEP 2: Beat the Base: In a small bowl, crack the three eggs. Add the optional milk/cream, a pinch of salt, and a few cracks of fresh black pepper. Whisk vigorously for about 1 minute until the mixture is light, airy, and slightly frothy.',
      'STEP 3: Cook the Omelette: Pour the egg mixture into the clean non-stick skillet over medium heat. Tilt the pan to spread the egg evenly. Let cook undisturbed for about 2 minutes, until the edges are set and the bottom is golden.',
      'STEP 4: Fold and Serve: Scatter the wilted spinach and crumbled feta cheese over ONE HALF of the omelette. Use a spatula to gently lift the other half and fold it over the filling. Cook for another 30 seconds to let the cheese slightly soften. Slide the omelette onto a plate and enjoy immediately.',
    ],
  },
  {
    id: 'toast_01',
    title: 'Avocado Toast with Fried Egg',
    description:
      'A balanced power start: toasted artisanal sourdough topped with seasoned mashed avocado and a perfect sunny-side-up egg.',
    image: AvocadoToastImage,
    ingredients: [
      '1 thick slice Artisan Sourdough Bread',
      '1/2 Ripe Avocado',
      '1 teaspoon Fresh Chives, minced',
      '1 teaspoon Lemon Juice',
      'Pinch of Red Pepper Flakes',
      '1 Large Egg',
      'Salt and Black Pepper to taste',
    ],
    instructions: [
      'STEP 1: Toast the Foundation: Place the artisan sourdough slice into a toaster or under a broiler and toast until deeply golden brown and very crispy. This provides a sturdy base.',
      'STEP 2: Master the Mash: While the bread toasts, cut the avocado in half and scoop the flesh into a small bowl. Add the lemon juice (to prevent browning), salt, and black pepper. Mash with a fork until desired consistency—smooth yet textured is usually best.',
      'STEP 3: Spread and Garnish: Spread the seasoned avocado mash evenly over the warm, crispy toast. Immediately top with the fresh minced chives.',
      'STEP 4: Top with Protein: In a small non-stick pan, fry the egg to your preference (sunny-side-up is classic). Carefully place the cooked egg atop the avocado. Garnish with a final pinch of red pepper flakes and serve.',
    ],
  },
  {
    id: 'smoothie_01',
    title: 'Peanut Butter & Banana Smoothie',
    description:
      'A thick, high-energy blend of creamy peanut butter, ripe banana, oats, and honey, topped with crushed peanuts.',
    image: SmoothieImage,
    ingredients: [
      '1 Ripe Banana, frozen in chunks',
      '2 tablespoons Natural Peanut Butter',
      '1/2 cup Unsweetened Milk (e.g., Soy or Dairy)',
      '1/4 cup Rolled Oats (or Quick Oats)',
      '1 teaspoon Chia Seeds (optional, for thickening)',
      '1 teaspoon Honey or Maple Syrup (optional)',
    ],
    instructions: [
      'STEP 1: Layer the Blender: Start by adding the liquid (milk) first to the blender canister. Then, add the frozen banana chunks, peanut butter, oats, chia seeds (if using), and your sweetener (honey/maple syrup). Placing the liquid at the bottom helps the blending process start smoothly.',
      'STEP 2: Blend and Thicken: Secure the lid and blend on high speed for 45-60 seconds, or until completely smooth, creamy, and unified. If the smoothie is too thick, add an extra splash of milk and blend again for 5 seconds.',
      'STEP 3: Pour and Top: Pour the smoothie immediately into a cold glass. Top with a few extra banana slices or the crushed roasted peanuts (like in the image) for a final touch of texture and flavor.',
    ],
  },
  {
    id: 'pancakes_01',
    title: 'Whole Grain Pancakes with Almond Butter',
    description:
      'Hearty whole grain pancakes layered with rich almond butter, maple syrup drizzle, and sweet, fresh strawberry slices.',
    image: PancakesImage,
    ingredients: [
      '1 cup Whole Grain Pancake Mix (or use Whole Wheat Flour and leavening agents)',
      '1 cup Milk (or buttermilk alternative)',
      '1 tablespoon Melted Coconut Oil or Butter',
      '1 tablespoon Maple Syrup',
      '3/4 cup Fresh Strawberries, sliced',
      '1/4 cup Natural Almond Butter',
    ],
    instructions: [
      'STEP 1: Prepare the Batter: In a medium bowl, whisk together the whole grain pancake mix, milk (using buttermilk enhances fluffiness), and melted coconut oil or butter. Whisk until just combined. A few small lumps are perfectly fine and help keep the pancakes tender.',
      'STEP 2: Heat the Griddle: Lightly grease a non-stick skillet or griddle with cooking spray and heat over medium heat.',
      'STEP 3: Cook the Pancakes: Pour 1/4 cup portions of the batter onto the hot griddle for each pancake. Cook for about 2-3 minutes, until small bubbles form and begin to pop on the surface and the edges look set and dry. Use a spatula to flip and cook the other side for 1-2 minutes, until golden.',
      'STEP 4: Stack and Garnish: Place two warm pancakes on a plate. Spread 1-2 tablespoons of natural almond butter between the layers and another dollop on top. Drizzle generously with pure maple syrup and serve with the fresh sliced strawberries on the side.',
    ],
  },
  {
    id: 'burrito_01',
    title: 'Loaded Breakfast Burrito',
    description:
      'A hearty, protein-packed flour tortilla stuffed with fluffy scrambled eggs, savory sausage, crisp bacon, roasted potatoes, black beans, corn, and melted cheddar cheese.',
    image: BurritoImage,
    ingredients: [
      '1 Large Flour Tortilla',
      '2 Large Eggs',
      '2 tablespoons Breakfast Sausage, cooked and crumbled',
      '1 strip cooked Bacon, crumbled',
      '1/4 cup Roasted Potatoes or Hashbrowns, diced',
      '2 tablespoons Black Beans, rinsed',
      '1 tablespoon Sweet Corn kernels',
      '1/4 cup Cheddar Cheese, shredded',
      '1 tablespoon Fresh Cilantro, chopped',
      'Salsa and Guacamole for serving',
    ],
    instructions: [
      'STEP 1: Prep the Fillings: Warm a small non-stick skillet over medium heat. Crisp your diced potatoes and warm through the black beans, corn, crumbled sausage, and bacon. Set them aside in a warm bowl.',
      'STEP 2: Scramble the Eggs: Whisk the eggs with a tiny pinch of salt and pepper. Pour into the skillet over medium-low heat and scramble gently until fluffy and just set. Do not overcook.',
      'STEP 3: Warm and Layer: Lightly heat the flour tortilla on a flat griddle for 15 seconds on each side so it becomes pliable. Lay it flat, then layer the shredded cheddar cheese across the center, followed by the warm potatoes, beans, corn, sausage, bacon, and fluffy scrambled eggs. Top with fresh cilantro.',
      'STEP 4: Roll and Sear: Fold in the left and right sides of the tortilla, then tightly roll from the bottom up to enclose the fillings. Place the burrito seam-side down on the hot griddle for 1-2 minutes until golden brown and sealed. Serve immediately with salsa and guacamole on the side.',
    ],
  },
];

const PREGNANT_MAMA_MORNING_PREMIUM_MEALS = [
  {
    id: 'pregnant_spinach_cheddar_scramble',
    title: 'Sautéed Spinach & Pasteurized Cheddar Scramble',
    description:
      'A creamy, iron-rich egg scramble over thick-cut whole wheat toast — gentle, savory morning nourishment for growing mamas.',
    image: SpinachCheddarToastImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Iron-dense spinach helps support expanding blood volume as your baby grows, while pasteurized eggs deliver essential choline for fetal brain development.',
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
  },
  {
    id: 'pregnant_cheesy_grits_eggs',
    title: 'Savory Cheesy Grits with Scrambled Eggs',
    description:
      'Velvety stone-ground grits crowned with soft scrambled eggs — a warm, grounding Southern-style breakfast for steady pregnancy energy.',
    image: CheesyGritsEggsImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Warm, stone-ground grits offer easily digestible complex carbohydrates for stable morning energy, while bone broth bases supply amino acids that support tissue growth for you and baby.',
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
  },
  {
    id: 'pregnant_berry_chia_hemp_bowl',
    title: 'Berry Chia & Hemp Seed Pudding Bowl',
    description:
      'A cool, luxurious chia pudding layered with wild berries and hemp hearts — make-ahead Omega-3 fuel for busy pregnancy mornings.',
    image: BerryChiaHempBowlImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Chia and hemp hearts provide Omega-3 fatty acids and plant-based protein to support fetal brain development and help ease pregnancy-related joint inflammation.',
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
  },
  {
    id: 'pregnant_salsa_chicken_breakfast_tacos',
    title: 'Breakfast Tacos with Eggs & Salsa Chicken',
    description:
      'Warm corn tortillas layered with soft scrambled eggs, mild salsa chicken, avocado, and cilantro — a savory, handheld morning feast.',
    image: SalsaChickenTacosImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Lean protein from chicken supports healthy maternal tissue growth, while avocado delivers healthy fats crucial for absorbing fat-soluble vitamins like A, D, E, and K during pregnancy.',
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
  },
  {
    id: 'pregnant_lox_cream_cheese_bagel',
    title: 'Smoked Salmon (Lox) Bagel with Full-Fat Cream Cheese',
    description:
      'A classic whole-grain bagel topped with velvety cream cheese, wild lox, capers, and dill — elegant Omega-3 nourishment for pregnancy mornings.',
    image: LoxCreamCheeseBagelImage,
    isPremium: true,
    benefits:
      "Pregnancy Nourishment Benefits: Wild-caught salmon is packed with DHA and Omega-3 fatty acids that cross the placenta to support your baby's cognitive and visual development while helping stabilize mood swings during pregnancy.",
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
  },
  {
    id: 'pregnant_banana_berry_smoothie',
    title: 'Banana and Berry Smoothie',
    description:
      'A velvety frozen banana and mixed berry blend with hemp seeds — bright, antioxidant-rich hydration in a chilled glass.',
    image: BananaBerrySmoothieImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Bananas supply crucial potassium to ease pregnancy muscle cramps and fatigue, while mixed berries deliver antioxidants that support immune health and reduce inflammation.',
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
  },
];

const PREGNANT_MAMA_LUNCH_MEALS = [
  {
    id: 'lunch_turkey_melt',
    title: 'Warm "Deli-Style" Turkey & Cheddar Melt',
    description: 'A comforting, safe lunch favorite stacked on whole-grain bread.',
    image: TurkeyMeltImage,
    safety_facts:
      "The Safety Fix: Cold cuts are a known risk for Listeria, but you don't have to skip them entirely.",
    ingredients: [
      'Whole-grain bread',
      'Sliced turkey breast',
      'Pasteurized cheddar cheese',
      'Sliced tomatoes',
      'Avocado',
    ],
    instructions: [
      'STEP 1: Heat the Meat: Place the sliced turkey breast in a pan or toaster oven.',
      'STEP 2: Steam/Toast: Heat the meat until it is completely steaming hot (165°F) to ensure it is 100% safe.',
      'STEP 3: Assemble: Place the pasteurized cheddar cheese and steaming hot turkey on your whole-grain bread.',
      'STEP 4: Garnish: Finish with fresh sliced tomatoes and creamy avocado, then serve warm.',
    ],
  },
  {
    id: 'lunch_salmon_salad',
    title: 'Fully Cooked Salmon Avocado Salad',
    description: 'A nutrient-dense, pregnancy-safe lunch packed with Omega-3s and healthy fats.',
    image: SalmonSaladImage,
    safety_facts:
      "The Safety Fix: Salmon is low in mercury and packed with DHA for baby's brain development, but it must be cooked all the way through (no rare centers or raw smoked salmon).",
    ingredients: [
      'Baked or grilled salmon filet',
      'Washed romaine lettuce',
      'Diced cucumbers',
      'Avocado',
      'Pasteurized olive oil and lemon vinaigrette',
    ],
    instructions: [
      'STEP 1: Cook Completely: Bake or grill your salmon filet until it is cooked all the way through, ensuring there are no rare centers.',
      'STEP 2: Prepare the Veggies: Thoroughly wash your romaine lettuce, then chop it and place it in a large salad bowl along with the diced cucumbers.',
      'STEP 3: Assemble and Flake: Flake the fully cooked salmon filet cleanly over the bed of prepared lettuce and cucumbers, and top with fresh avocado slices.',
      'STEP 4: Toss and Serve: Drizzle with the pasteurized olive oil and lemon vinaigrette, toss gently to combine, and enjoy immediately.',
    ],
  },
  {
    id: 'lunch_chicken_wrap',
    title: 'Pasteurized Mediterranean Chicken Wrap',
    description: 'A fresh, crisp wrap loaded with lean protein, fiber, and Mediterranean flavors.',
    image: ChickenWrapImage,
    safety_facts:
      'The Safety Fix: Use fully grilled chicken breast and ensure the feta cheese is made from pasteurized milk (most crumbled feta in US supermarkets is). Avoid raw sprouts in the wrap.',
    ingredients: [
      'Cubed grilled chicken',
      'Cucumbers',
      'Tomatoes',
      'Pasteurized feta cheese',
      'Hummus',
      'Whole-wheat tortilla',
    ],
    instructions: [
      'STEP 1: Prep the Protein: Ensure your chicken breast is fully grilled and cooked through, then cut it into clean, bite-sized cubes.',
      'STEP 2: Combine Fillings: In a mixing bowl, gently toss the cubed grilled chicken, diced cucumbers, diced tomatoes, and crumbled pasteurized feta cheese together with a spoonful of smooth hummus until well coated.',
      'STEP 3: Assemble the Wrap: Lay your whole-wheat tortilla flat on a clean surface and spread the Mediterranean chicken mixture evenly across the center.',
      'STEP 4: Roll and Serve: Tightly fold in the sides and roll the tortilla from the bottom up into a snug wrap. Slice diagonally and serve fresh.',
    ],
  },
  {
    id: 'lunch_tacos',
    title: 'Warm Ground Turkey or Beef Tacos',
    description: 'A comforting, flavor-packed taco night favorite made completely safe for pregnancy.',
    image: TacosImage,
    safety_facts:
      'The Safety Fix: Ensure ground beef or turkey is cooked thoroughly to an internal temperature of 160°F–165°F (no pink remaining) to eliminate any bacterial risk. Use pasteurized cheese or sour cream, and ensure all raw toppings like lettuce and tomatoes are washed meticulously.',
    ingredients: [
      'Lean ground turkey or ground beef',
      'Taco seasoning mix (low sodium preferred)',
      'Corn or flour tortillas',
      'Shredded pasteurized cheddar or cotija cheese',
      'Meticulously washed shredded lettuce',
      'Diced tomatoes',
      'Pasteurized sour cream or Greek yogurt',
    ],
    instructions: [
      'STEP 1: Cook the Meat Thoroughly: Brown your ground turkey or beef in a skillet over medium-high heat, breaking it apart with a spatula. Ensure it cooks all the way through to 160°F–165°F with absolutely zero pink remaining.',
      'STEP 2: Season and Simmer: Drain any excess fat from the pan, stir in the taco seasoning and a splash of water, and let it simmer for 3–5 minutes until beautifully thickened.',
      'STEP 3: Warm the Tortillas: Heat your corn or flour tortillas on a dry griddle or skillet for about 15–30 seconds per side until warm and pliable.',
      'STEP 4: Build Safely: Fill your warm tortillas with the steaming hot seasoned meat, then layer on your pasteurized cheese, thoroughly washed lettuce, diced tomatoes, and a dollop of pasteurized sour cream. Serve immediately while warm.',
    ],
  },
  {
    id: 'lunch_panini',
    title: '"Steaming Hot" Ham & Swiss Panini',
    description: 'A deeply comforting pressed favorite made completely safe with steaming hot meat.',
    image: PaniniImage,
    safety_facts:
      'The Safety Fix: It is 100% safe to enjoy high-quality cold cuts during pregnancy! The key is to ensure the meat is thoroughly heated until it is completely steaming hot (reaching an internal temperature of 165°F), effectively eliminating any Listeria risk. By combining diligent thorough heating with trusted ingredients and pasteurized cheese, you can confidently savor this classic favorite.',
    ingredients: [
      '2 thick slices Artisan Sourdough Bread',
      '4 oz (approx. 5 slices) Trusted Deli-Style Ham',
      '2 slices Swiss Cheese (ensure pasteurized)',
      '1 tablespoon Dijonnaise (or your preferred sauce)',
      '1 teaspoon Butter, softened',
      'Fresh arugula or simple side salad for serving',
    ],
    instructions: [
      'STEP 1: The Critical Step (Heat for Safety): Thoroughly steam or pan-fry the trusted deli ham slices over high heat. Ensure the meat reaches a fully steaming temperature of at least 165°F before assembly to guarantee complete safety.',
      'STEP 2: Construct the Panini: Take the artisan sourdough slices. Spread the Dijonnaise evenly on the unbuttered side of one slice.',
      'STEP 3: Layer the Warmth: Layer one slice of Swiss cheese on the base slice. Add the freshly steamed, hot ham. Top with the second slice of Swiss cheese and the final sourdough piece.',
      'STEP 4: Press and Serve: Lightly butter the outside of the completed sandwich. Press in a panini grill or a non-stick skillet over medium-high heat. Cook for 3-4 minutes until the sourdough is golden-brown and crispy, and the Swiss cheese is thoroughly melted. Serve immediately while still steaming!',
    ],
  },
  {
    id: 'lunch_mini_pizzas',
    title: 'English Muffin "Mini Pizzas"',
    description: 'A nostalgic, satisfyingly crispy lunch craving made completely safe and wholesome for pregnancy.',
    image: MiniPizzasImage,
    safety_facts:
      'The Safety Fix: Cured toppings like pepperoni carry a small risk of Listeria and Toxoplasmosis when cold. For complete safety, bake or broil your mini pizzas until the cheese is bubbling and the pepperoni slices are thoroughly cooked and sizzling hot (165°F). Always ensure your shredded mozzarella is made from pasteurized milk.',
    ingredients: [
      '1 Whole-wheat English muffin, split in half',
      '4 tablespoons Pasteurized pizza sauce or marinara',
      '1/2 cup Shredded pasteurized mozzarella cheese',
      '6-8 slices Sliced pepperoni (cooked until sizzling hot)',
      'Pinch of dried oregano or Italian seasoning',
      'Fresh basil leaves for garnish (meticulously washed)',
    ],
    instructions: [
      "STEP 1: Toast the Base: Pre-heat your oven or toaster oven to 400°F. Lightly toast the split English muffin halves beforehand so they stay crisp and don't get soggy under the sauce.",
      'STEP 2: Layer the Toppings: Spoon 2 tablespoons of pizza sauce evenly over each toasted muffin half. Generously sprinkle with your pasteurized shredded mozzarella cheese, then top with the pepperoni slices.',
      'STEP 3: Bake and Sizzle (Heat for Safety): Place the mini pizzas into the oven and bake for 8–10 minutes, or until the cheese is completely melted and bubbling, and the pepperoni slices are completely cooked through, crispy, and sizzling hot.',
      'STEP 4: Cool and Garnish: Carefully remove the pizzas from the oven. Sprinkle with a pinch of dried oregano, top with fresh, washed basil leaves, let cool for a minute, and serve.',
    ],
  },
];

const PREGNANT_MAMA_LUNCH_PREMIUM_MEALS = [
  {
    id: 'pregnant_turkey_sloppy_joes',
    title: 'Ground Turkey Sloppy Joes',
    description:
      'A savory, high-protein sloppy joe on whole wheat brioche — warm, satisfying, and cooked thoroughly for prenatal safety.',
    image: TurkeySloppyJoesImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Lean ground turkey provides an abundance of zinc and vital protein to support maternal tissue expansion, while cooked bell peppers offer Vitamin C to aid in iron absorption.',
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
  },
  {
    id: 'pregnant_chicken_pesto_pasta',
    title: 'Warm Pasta Salad with Chicken & Pesto',
    description:
      'Steaming rotini tossed with grilled chicken, wilted spinach, cherry tomatoes, and basil pesto — a fiber-rich pregnancy power lunch.',
    image: ChickenPestoPastaImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Using chickpea or whole wheat pasta dramatically increases fiber to aid prenatal digestion, while basil pesto offers antioxidant properties alongside high-quality clean proteins from chicken.',
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
  },
  {
    id: 'pregnant_tomato_soup_grilled_cheese',
    title: 'Creamy Tomato Soup & Classic Grilled Cheese',
    description:
      'Silky organic tomato soup paired with a golden pasteurized cheddar grilled cheese — deeply comforting and nausea-gentle.',
    image: TomatoSoupGrilledCheeseImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Cooked tomato lycopene provides excellent cellular protection, while warm sourdough paired with pasteurized cheese offers a deeply comforting, nausea-safe lunch option.',
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
  },
  {
    id: 'pregnant_turkey_provolone_melt',
    title: 'Steaming Hot Turkey & Provolone Melt',
    description:
      'A golden pressed melt with listeria-safe steaming hot turkey, pasteurized provolone, and fresh tomato on artisan whole grain bread.',
    image: TurkeyProvoloneMeltImage,
    isPremium: true,
    benefits:
      "Pregnancy Nourishment Benefits: Heating deli meat until steaming hot ensures absolute safety during pregnancy, while whole grains supply B-vitamins to help sustain mama's afternoon energy levels.",
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
  },
  {
    id: 'pregnant_hard_boiled_eggs_seasoning',
    title: 'Hard-Boiled Egg with Everything Bagel Seasoning',
    description:
      'Fully cooked pasteurized eggs dusted with everything bagel seasoning — a clean, choline-rich lunch with crisp cucumber and carrots.',
    image: BoiledEggsSeasoningImage,
    isPremium: true,
    benefits:
      "Pregnancy Nourishment Benefits: Fully cooked hard-boiled eggs provide an excellent, safe source of highly bioavailable choline, which is absolutely vital for baby's neural tube and brain architecture development.",
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
  },
  {
    id: 'pregnant_greek_yogurt_walnuts_honey',
    title: 'Greek Yogurt with Walnuts & Honey',
    description:
      'Chilled full-fat pasteurized Greek yogurt crowned with raw walnuts, pure honey, and cinnamon — a calcium-rich midday refresh.',
    image: GreekYogurtWalnutsImage,
    isPremium: true,
    benefits:
      'Pregnancy Nourishment Benefits: Full-fat Greek yogurt supplies a massive dose of bone-building calcium and probiotics for maternal gut health, while walnuts offer plant-based ALA Omega-3s essential for infant ocular development.',
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
  },
];

const PREGNANT_MAMA_DINNER_MEALS = [
  {
    id: 'dinner_well_done_burger',
    title: 'Turkey or Beef Burgers (Well-Done) with Baked Potato Wedges',
    description:
      'A hearty, satisfying classic cooked thoroughly for safety and served alongside crispy seasoned potato wedges.',
    image: BurgerDinnerImage,
    safety_facts:
      'The Safety Fix: Ground meat is highly vulnerable to bacteria, meaning medium or rare patties are off the table during pregnancy. Always cook your turkey or beef burger completely well-done until it reaches an internal temperature of 160°F for beef or 165°F for turkey (absolutely no pink remaining). Make sure your cheese is pasteurized and your raw toppings are washed meticulously.',
    ingredients: [
      'Lean ground beef or ground turkey',
      'Burger buns (whole-wheat preferred)',
      'Pasteurized cheddar cheese slices',
      'Meticulously washed lettuce and tomato slices',
      '2 large Russet potatoes (cut into wedges)',
      '1 tablespoon olive oil',
      'Garlic powder, onion powder, salt, and pepper to taste',
    ],
    instructions: [
      'STEP 1: Bake the Potato Wedges: Preheat your oven to 425°F. Toss the cut potato wedges in olive oil, garlic powder, onion powder, salt, and pepper. Spread them evenly on a baking sheet and roast for 25–30 minutes, flipping halfway through until crispy and golden brown.',
      'STEP 2: Form and Season the Patties: Shape your ground turkey or beef into uniform patties and season both sides generously with salt, pepper, and garlic powder.',
      'STEP 3: Cook Thoroughly (Heat for Safety): Heat a skillet or grill over medium-high heat. Cook the patties for 5–6 minutes per side. Use a digital meat thermometer to verify the centers reach a safe 160°F for beef or 165°F for turkey, leaving absolutely zero pink remaining.',
      'STEP 4: Melt and Assemble: Place a slice of pasteurized cheddar cheese on the patty during the last minute of cooking to melt. Assemble on a toasted bun with your carefully washed lettuce, tomato, and a side of your hot baked wedges.',
    ],
  },
  {
    id: 'dinner_rotisserie_pesto',
    title: '15-Minute Rotisserie Chicken & Pesto Pasta',
    description:
      'A deeply satisfying, high-protein weeknight save using trusted pre-cooked ingredients for speed and safety.',
    image: PestoPastaImage,
    safety_facts:
      'The Safety Fix: It is 100% safe to enjoy pre-cooked rotisserie chicken during pregnancy! Store-bought rotisserie chicken is cooked completely through. By simply reheating it in your hot pesto pasta sauce (reaching a safe steaming hot 165°F), you effectively eliminate any potential risk of Listeria. This provides mama with a fast, nutritious, and absolutely secure meal option.',
    ingredients: [
      '8 oz Trusted Store-Bought Rotisserie Chicken, shredded (skin removed)',
      '8 oz Whole Wheat Penne Pasta',
      '1/4 cup Pasteurized Basil Pesto (US commercial brands are pasteurized)',
      '1/2 cup Cherry tomatoes, halved (meticulously washed)',
      '1 tablespoon Olive oil',
      'Fresh basil leaves and grated parmesan (ensure pasteurized) for serving',
    ],
    instructions: [
      'STEP 1: Cook the Pasta: Boil the whole wheat penne in heavily salted water until al dente. Reserve 1/4 cup of the starchy pasta water, then drain the penne.',
      'STEP 2: Prepare the Chicken (Heat for Safety): While the pasta is cooking, heat the olive oil in a large skillet over medium-high heat. Add the meticulously washed cherry tomatoes and the shredded rotisserie chicken. Heat for 2–3 minutes, ensuring the chicken pieces are thoroughly warmed and steaming hot (reaching 165°F) for absolute safety.',
      'STEP 3: Sizzle the Sauce: Pour the commercial pasteurized pesto sauce into the hot skillet with the chicken and tomatoes. Add the starchy pasta water and stir for 1 minute until a cohesive, smooth sauce forms.',
      'STEP 4: Toss and Serve: Add the drained penne directly to the skillet and toss vigorously to combine. Heat for 1 more minute, letting the pasta soak up the safe, steaming hot sauce. Serve immediately, garnished with fresh basil leaves and pasteurized parmesan.',
    ],
  },
  {
    id: 'dinner_chicken_alfredo',
    title: 'Creamy Pasteurized Alfredo with Grilled Chicken and Broccoli',
    description:
      'A comforting, rich, and creamy restaurant-style pasta dish made entirely safe with fully cooked protein and pasteurized dairy.',
    image: AlfredoPastaImage,
    safety_facts:
      'The Safety Fix: Rich cream sauces are entirely safe as long as the heavy cream, butter, and parmesan cheese are made from pasteurized milk (almost all commercial store-bought versions in the US are). Ensure the chicken breast is fully grilled and reaches an internal temperature of 165°F, and that the fresh broccoli florets are washed meticulously before steaming.',
    ingredients: [
      '2 Chicken breasts (approx. 8 oz), fully grilled and sliced',
      '8 oz Fettuccine or penne pasta',
      '2 cups Broccoli florets (meticulously washed)',
      '1 cup Heavy cream (ensure pasteurized)',
      '1/2 cup Grated parmesan cheese (ensure pasteurized)',
      '4 tablespoons Butter',
      '2 cloves Garlic, minced',
      'Pinch of black pepper and nutmeg',
    ],
    instructions: [
      'STEP 1: Cook the Pasta and Broccoli: Bring a large pot of salted water to a boil. Cook the fettuccine according to package directions. In the last 3 minutes of boiling, toss in your washed broccoli florets to steam them right alongside the pasta. Drain together and set aside.',
      'STEP 2: Grill the Chicken safely (Heat for Safety): Season your chicken breasts with salt, pepper, and garlic powder. Grill or pan-sear over medium-high heat until they are fully cooked through, reaching an internal temperature of 165°F with no pink remaining. Slice into clean strips.',
      'STEP 3: Build the Pasteurized Alfredo Sauce: In a deep skillet, melt the butter over medium heat. Add minced garlic and cook for 1 minute. Pour in the pasteurized heavy cream and bring to a gentle simmer for 3–4 minutes. Whisk in the pasteurized parmesan cheese until melted, smooth, and bubbling hot.',
      'STEP 4: Toss and Plate: Add the cooked pasta, steamed broccoli, and sliced grilled chicken directly into the hot alfredo sauce. Toss thoroughly for 1–2 minutes until the entire dish is steaming hot and beautifully coated. Serve immediately.',
    ],
  },
  {
    id: 'dinner_chicken_sloppy_joes',
    title: 'Ground Chicken Sloppy Joes on Whole Wheat Buns',
    description:
      'A lean, protein-packed twist on a classic comfort food, simmered in a sweet and savory tomato sauce.',
    image: SloppyJoesImage,
    safety_facts:
      'The Safety Fix: Ground poultry carries a higher risk of bacterial contamination, making thorough cooking non-negotiable during pregnancy. Always cook your ground chicken entirely through until it reaches a safe internal temperature of 165°F (with absolutely no pink remaining) before simmering it in the sauce. Ensure all fresh veggies like peppers and onions are washed meticulously.',
    ingredients: [
      '1 lb Lean ground chicken',
      '1/2 Yellow onion, finely diced (meticulously washed)',
      '1/2 Green bell pepper, finely diced (meticulously washed)',
      '8 oz Can tomato sauce',
      '1/4 cup Tomato ketchup',
      '1 tablespoon Brown sugar',
      '1 tablespoon Worcestershire sauce',
      'Whole wheat hamburger buns',
    ],
    instructions: [
      'STEP 1: Sauté the Aromatics: Heat a splash of olive oil in a large skillet over medium-high heat. Toss in your washed, diced onions and bell peppers, cooking for 3–4 minutes until soft and translucent.',
      'STEP 2: Brown and Cook Completely (Heat for Safety): Add the ground chicken to the skillet. Break it apart with a wooden spoon and brown it thoroughly. Ensure it cooks all the way through to an internal temperature of 165°F, leaving absolutely zero pink remaining to eliminate any bacterial risk.',
      'STEP 3: Simmer the Sauce: Pour in the tomato sauce, ketchup, brown sugar, and Worcestershire sauce. Stir beautifully to coat the chicken, turn the heat down to low, and let it simmer for 5–7 minutes until thick and rich.',
      'STEP 4: Assemble and Serve: Spoon the hot, steaming sloppy joe mixture generously onto your whole wheat buns and serve warm immediately.',
    ],
  },
  {
    id: 'dinner_sheet_pan_gnocchi',
    title: '15-Minute Crispy Sheet Pan Gnocchi',
    description:
      'A lightning-fast, comforting dinner featuring shelf-stable potato gnocchi roasted until crisp on the outside and tender inside.',
    image: SheetPanGnocchiImage,
    safety_facts:
      'The Safety Fix: This vegetarian meal is completely safe and low-risk! Just make sure your shredded cheese or parmesan garnish is made from pasteurized milk (standard for US commercial stores). Additionally, ensure all raw produce like cherry tomatoes, bell peppers, and zucchini are washed meticulously to remove any traces of soil-borne bacteria before roasting.',
    ingredients: [
      '16 oz Package shelf-stable potato gnocchi (no boiling required)',
      '1 cup Cherry tomatoes (meticulously washed)',
      '1 Bell pepper, chopped (meticulously washed)',
      '1 Small zucchini, diced (meticulously washed)',
      '2 tablespoons Olive oil',
      '1 teaspoon Italian seasoning',
      'Salt and black pepper to taste',
      '1/4 cup Pasteurized shredded mozzarella or parmesan cheese',
    ],
    instructions: [
      'STEP 1: Prep and Preheat: Preheat your oven to 425°F. Line a large baking sheet with parchment paper for easy cleanup.',
      'STEP 2: Toss and Season: Directly on the sheet pan, combine the dry shelf-stable gnocchi (straight from the package) with your washed cherry tomatoes, chopped bell peppers, and diced zucchini.',
      'STEP 3: Coat and Roast: Drizzle everything with olive oil and sprinkle with Italian seasoning, salt, and pepper. Toss thoroughly so everything is coated, and spread it out into a single layer. Roast for 12–15 minutes until the gnocchi is beautifully plump, golden, and slightly crisp on the edges, and the tomatoes begin to burst.',
      'STEP 4: Garnish and Serve Hot: Remove the sheet pan from the oven, immediately sprinkle with your pasteurized cheese so it melts over the heat, and serve hot.',
    ],
  },
];

BOOT_MEALS_CACHE.pregnantMorning = [
  ...PREGNANT_MAMA_MORNING_MEALS,
  ...PREGNANT_MAMA_MORNING_PREMIUM_MEALS,
];
BOOT_MEALS_CACHE.pregnantLunch = [
  ...PREGNANT_MAMA_LUNCH_MEALS,
  ...PREGNANT_MAMA_LUNCH_PREMIUM_MEALS,
];
BOOT_MEALS_CACHE.pregnantDinner = PREGNANT_MAMA_DINNER_MEALS;

function getBootMealsForCategory(category) {
  return BOOT_MEALS_CACHE[category] ?? [];
}

function getPostpartumTabMeals(tabId) {
  if (!POSTPARTUM_TAB_CACHE[tabId]) {
    let meals = getPostpartumMealsForTab(tabId);
    if (tabId === 'morning') {
      meals = [
        ...POSTPARTUM_MORNING_HEALING_HEAD,
        ...meals.slice(3, 6),
        ...POSTPARTUM_MORNING_PREMIUM_TAIL,
      ];
    } else if (tabId === 'afternoon') {
      meals = [...meals.slice(0, 6), ...POSTPARTUM_LUNCH_RECOVERY_TAIL];
    } else if (tabId === 'night') {
      meals = [...meals.slice(0, 6), ...POSTPARTUM_DINNER_PREMIUM_TAIL];
    }
    POSTPARTUM_TAB_CACHE[tabId] = meals.map(enrichMeal);
  }
  return POSTPARTUM_TAB_CACHE[tabId];
}

function IconLittleBites({ size = 17 }) {
  return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{LITTLE_BITES_TAB.emoji}</Text>;
}

const THEME = {
  sage: '#5C7A68',
  gold: '#C4A574',
  goldSoft: 'rgba(196, 165, 116, 0.28)',
  goldGlow: 'rgba(196, 165, 116, 0.45)',
  ink: '#4A3E3D',
  inkSoft: '#5C6E63',
  cream: 'rgba(255, 252, 248, 0.88)',
  glass: 'rgba(255, 255, 255, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.45)',
  instacart: '#43B02A',
  amazon: '#232F3E',
  amazonSmile: '#FF9900',
};

function useGridLayout() {
  const [screenW, setScreenW] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setScreenW(window.width));
    return () => sub?.remove?.();
  }, []);

  const contentW = Math.min(screenW, PHONE_MAX_W);
  const columns = screenW >= THREE_COL_BREAKPOINT ? 3 : 2;
  const cellW = Math.floor((contentW - H_PAD * 2 - GRID_GAP * (columns - 1)) / columns);

  return { contentW, columns, cellW, screenW };
}

/* ── Minimal line-art tab icons ── */
function IconRisingSun({ color = THEME.ink, size = 18 }) {
  return (
    <View style={[iconStyles.wrap, { width: size, height: size }]}>
      <View style={[iconStyles.horizon, { backgroundColor: color, width: size * 0.9 }]} />
      <View
        style={[
          iconStyles.sunArc,
          { borderColor: color, width: size * 0.55, height: size * 0.28, bottom: size * 0.22 },
        ]}
      />
      <View style={[iconStyles.ray, { backgroundColor: color, top: 0, height: size * 0.22 }]} />
      <View style={[iconStyles.ray, { backgroundColor: color, top: 2, left: 2, height: size * 0.16, transform: [{ rotate: '-28deg' }] }]} />
      <View style={[iconStyles.ray, { backgroundColor: color, top: 2, right: 2, height: size * 0.16, transform: [{ rotate: '28deg' }] }]} />
    </View>
  );
}

function IconFullSun({ color = THEME.ink, size = 18 }) {
  return (
    <View style={[iconStyles.wrap, { width: size, height: size }]}>
      <View style={[iconStyles.fullSun, { borderColor: color, width: size * 0.52, height: size * 0.52 }]} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <View
          key={deg}
          style={[
            iconStyles.sunRay,
            {
              backgroundColor: color,
              transform: [{ rotate: `${deg}deg` }, { translateY: -(size * 0.38) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function IconCrescentMoon({ color = THEME.ink, size = 18 }) {
  return (
    <View style={[iconStyles.wrap, { width: size, height: size }]}>
      <View style={[iconStyles.moonOuter, { borderColor: color, width: size * 0.62, height: size * 0.62 }]} />
      <View
        style={[
          iconStyles.moonInner,
          {
            backgroundColor: '#F7F3EE',
            width: size * 0.48,
            height: size * 0.48,
            right: size * 0.04,
            top: size * 0.04,
          },
        ]}
      />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  horizon: { position: 'absolute', bottom: 2, height: 1.5, borderRadius: 1 },
  sunArc: {
    position: 'absolute',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  ray: { position: 'absolute', width: 1.5, borderRadius: 1 },
  fullSun: { borderRadius: 999, borderWidth: 1.5 },
  sunRay: { position: 'absolute', width: 1.5, height: 4, borderRadius: 1 },
  moonOuter: { borderRadius: 999, borderWidth: 1.5 },
  moonInner: { position: 'absolute', borderRadius: 999 },
});

const MEAL_TABS = [
  { id: 'morning', label: 'Morning', Icon: IconRisingSun },
  { id: 'afternoon', label: 'Noon', Icon: IconFullSun },
  { id: 'night', label: 'Night', Icon: IconCrescentMoon },
];

const KITCHEN_IMAGE_PLACEHOLDER = require('./assets/icon.png');

const RecipeMealImage = memo(function RecipeMealImage({
  item,
  style,
  priority = 'normal',
  instant = false,
}) {
  const asset = item?.image ?? item?.imageUrl;
  const source =
    typeof asset === 'string'
      ? { uri: asset }
      : asset != null
        ? asset
        : KITCHEN_IMAGE_PLACEHOLDER;

  return (
    <Image
      source={source}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={item?.id}
      priority={priority}
      transition={instant ? 0 : 60}
      allowDownscaling={false}
      placeholderContentFit="cover"
      accessibilityLabel={item?.title || 'Recipe image'}
    />
  );
});

const GridMealTile = memo(
  function GridMealTile({ recipe, cellW, onPress, locked = false, onLockedPress }) {
    if (recipe?.__pad) return <View style={{ width: cellW }} pointerEvents="none" />;

    const handlePress = () => {
      if (locked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        onLockedPress?.();
        return;
      }
      onPress(recipe);
    };

    return (
      <TouchableOpacity
        style={[styles.gridTile, styles.gridGlassCard, { width: cellW }]}
        onPress={handlePress}
        activeOpacity={0.92}
      >
        <View style={styles.gridImageWrap}>
          <RecipeMealImage
            item={recipe}
            style={[styles.gridImage, locked && styles.gridImageLocked]}
            priority={recipe.__imagePriority ?? 'normal'}
            instant
          />
          {locked ? <PremiumGateOverlay compact /> : null}
        </View>
        <Text style={[styles.gridLabel, locked && styles.gridLabelLocked]} numberOfLines={2}>
          {recipe.title}
        </Text>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.recipe?.id === next.recipe?.id &&
    prev.recipe?.image === next.recipe?.image &&
    prev.recipe?.__pad === next.recipe?.__pad &&
    prev.recipe?.isPremium === next.recipe?.isPremium &&
    prev.cellW === next.cellW &&
    prev.locked === next.locked &&
    prev.onPress === next.onPress &&
    prev.onLockedPress === next.onLockedPress,
);

const KITCHEN_FILTER_CHIPS = [{ id: '__all__', label: 'All' }, ...KITCHEN_FILTERS];

const KitchenEmptyState = memo(function KitchenEmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No meals for this time</Text>
      <Text style={styles.emptySub}>Try another tab or adjust filters.</Text>
    </View>
  );
});

const KitchenMealGrid = memo(
  function KitchenMealGrid({ gridData, columns, renderItem, listHeader, listKey, listRef }) {
    return (
      <FlatList
        ref={listRef}
        key={listKey}
        data={gridData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader || null}
        ListEmptyComponent={KitchenEmptyState}
        {...LIST_PERF}
      />
    );
  },
  (prev, next) =>
    prev.gridData === next.gridData &&
    prev.columns === next.columns &&
    prev.renderItem === next.renderItem &&
    prev.listHeader === next.listHeader &&
    prev.listKey === next.listKey &&
    prev.listRef === next.listRef,
);

const HybridKitchenHeader = memo(function HybridKitchenHeader({
  activeTab,
  onTabChange,
  filtersOpen,
  onToggleFilters,
  activeFilter,
  onFilterChange,
  tabHighlightX,
  tabSlotW,
  onTabTrackLayout,
  showLittleBites = false,
}) {
  const filterCount = activeFilter ? 1 : 0;
  const tabs = showLittleBites
    ? [...MEAL_TABS, { ...LITTLE_BITES_TAB, Icon: IconLittleBites }]
    : MEAL_TABS;

  return (
    <View style={styles.headerWrap}>
      <View style={styles.glassCapsule}>
        <View style={styles.tabTrack} onLayout={onTabTrackLayout}>
          {tabSlotW > 0 ? (
            <Animated.View
              style={[
                styles.tabHighlight,
                {
                  width: tabSlotW,
                  transform: [{ translateX: tabHighlightX }],
                },
              ]}
            />
          ) : null}

          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.Icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabSlot}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.88}
              >
                <Icon color={active ? THEME.ink : 'rgba(92, 122, 104, 0.55)'} size={17} />
                <Text style={[styles.tabSublabel, active && styles.tabSublabelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.filtersBtn} onPress={onToggleFilters} activeOpacity={0.88}>
          <Text style={styles.filtersBtnText}>
            Filters {filtersOpen ? '▴' : '▽'}
            {filterCount ? ' ·' : ''}
          </Text>
          {filterCount ? <View style={styles.filtersDot} /> : null}
        </TouchableOpacity>
      </View>

      {filtersOpen ? (
        <FlatList
          horizontal
          data={KITCHEN_FILTER_CHIPS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.filterPanel}
          contentContainerStyle={styles.filterPanelContent}
          renderItem={({ item }) => {
            const isAll = item.id === '__all__';
            const on = isAll ? activeFilter === null : activeFilter === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, on && styles.filterChipActive]}
                onPress={() => onFilterChange(isAll ? null : on ? null : item.id)}
              >
                <Text style={[styles.filterChipText, on && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          {...LIST_PERF}
        />
      ) : null}
    </View>
  );
});

function InstacartLogoMark() {
  return (
    <View style={styles.logoInstacart}>
      <Text style={styles.logoInstacartText}>instacart</Text>
    </View>
  );
}

function AmazonFreshLogoMark() {
  return (
    <View style={styles.logoAmazonRow}>
      <Text style={styles.logoAmazonText}>amazon</Text>
      <Text style={styles.logoAmazonFresh}>fresh</Text>
    </View>
  );
}

function openIngredientShopLink(url) {
  if (url) Linking.openURL(url).catch(() => {});
}

function stripKitchenFactPrefix(text) {
  return String(text || '')
    .replace(/^The Safety Fix:\s*/i, '')
    .replace(/^Postpartum Healing Benefits:\s*/i, '')
    .replace(/^Pregnancy Nourishment Benefits:\s*/i, '')
    .trim();
}

function MealDetailSheet({
  recipe,
  visible,
  onClose,
  badgeAnim,
  contentW,
  isPregnantKitchen = false,
}) {
  const [checked, setChecked] = useState(() => new Set());
  const dragY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && recipe) {
      setChecked(new Set());
      dragY.setValue(0);
    }
  }, [visible, recipe?.id, dragY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) dragY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 110 || gesture.vy > 0.75) {
          onClose();
          dragY.setValue(0);
          return;
        }
        Animated.spring(dragY, {
          toValue: 0,
          ...VILLAGE_SNAPPY_SPRING,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      },
    })
  ).current;

  if (!recipe) return null;

  const toggleIngredient = (item) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const badgeScale = badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const useSideBySide = contentW >= 380;
  const ingredientList = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const stepList = Array.isArray(recipe?.instructions) ? recipe.instructions : [];
  const shopUrls = buildIngredientShopUrls(recipe.title);
  const instacartUrl = recipe.instacartUrl || shopUrls.instacartUrl;
  const amazonUrl = recipe.amazonUrl || shopUrls.amazonUrl;
  const pregnantSafetyFact = isPregnantKitchen
    ? stripKitchenFactPrefix(recipe.safety_facts || recipe.benefits)
    : '';
  const postpartumBenefits = !isPregnantKitchen
    ? stripKitchenFactPrefix(recipe.benefits)
    : '';
  const postpartumSafetyFix =
    !isPregnantKitchen && recipe.safety_facts
      ? stripKitchenFactPrefix(recipe.safety_facts)
      : '';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <Animated.View
        style={[styles.modalScreen, { transform: [{ translateY: dragY }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.sheetCloseFab}
          onPress={onClose}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Close recipe"
        >
          <Text style={styles.sheetCloseFabIcon}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.sheetScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetScroll}
        >
          <View style={styles.sheetHeroWrap}>
            <RecipeMealImage item={recipe} style={styles.sheetHero} />
          </View>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>{recipe.title}</Text>
            {recipe.prepMinutes ? (
              <Animated.View style={[styles.prepBadge, { transform: [{ scale: badgeScale }] }]}>
                <Text style={styles.prepBadgeText}>{recipe.prepMinutes} min prep</Text>
              </Animated.View>
            ) : null}
          </View>

          {recipe.description ? (
            <Text style={styles.sheetDescription}>{recipe.description}</Text>
          ) : null}

          {isPregnantKitchen && pregnantSafetyFact ? (
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsLabel}>Safety Fact for Pregnant Mama</Text>
              <Text style={styles.benefitsText}>{pregnantSafetyFact}</Text>
            </View>
          ) : null}

          {!isPregnantKitchen && postpartumSafetyFix ? (
            <View style={styles.safetyFactsCard}>
              <Text style={styles.safetyFactsLabel}>The Safety Fix</Text>
              <Text style={styles.safetyFactsText}>{postpartumSafetyFix}</Text>
            </View>
          ) : null}

          {!isPregnantKitchen && postpartumBenefits ? (
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsLabel}>Postpartum Healing Benefits</Text>
              <Text style={styles.benefitsText}>{postpartumBenefits}</Text>
            </View>
          ) : null}

          <View style={[styles.contentZone, useSideBySide && styles.contentZoneRow]}>
            <View style={[styles.contentCol, useSideBySide && styles.contentColHalf]}>
              <Text style={styles.zoneLabel}>Ingredients</Text>
              <View style={styles.zoneCard}>
                {ingredientList.map((item, i) => {
                  const done = checked.has(item);
                  return (
                    <TouchableOpacity
                      key={`${recipe.id}-ing-${i}`}
                      style={styles.checkRow}
                      onPress={() => toggleIngredient(item)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkBox, done && styles.checkBoxDone]}>
                        {done ? <Text style={styles.checkMark}>✓</Text> : null}
                      </View>
                      <Text style={[styles.checkText, done && styles.checkTextDone]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[styles.contentCol, useSideBySide && styles.contentColHalf]}>
              <Text style={styles.zoneLabel}>Recipe Steps</Text>
              <View style={styles.zoneCard}>
                {stepList.map((step, i) => (
                  <View key={`${recipe.id}-step-${i}`} style={styles.stepRow}>
                    <View style={styles.stepTimeline}>
                      <View style={styles.stepDot} />
                      {i < stepList.length - 1 ? <View style={styles.stepLine} /> : null}
                    </View>
                    <View style={styles.stepBody}>
                      <Text style={styles.stepNum}>Step {i + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backToKitchenBtn}
            onPress={onClose}
            activeOpacity={0.9}
            accessibilityRole="button"
          >
            <Text style={styles.backToKitchenBtnText}>Back to Kitchen Feed</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sheetFooter}>
          <Text style={styles.footerHeading}>Order Ingredients via:</Text>
          <View style={styles.footerBtns}>
            <TouchableOpacity
              style={styles.shopBtnInstacart}
              onPress={() => openIngredientShopLink(instacartUrl)}
              activeOpacity={0.9}
              accessibilityRole="link"
              accessibilityLabel="Order ingredients on Instacart"
            >
              <InstacartLogoMark />
              <Text style={styles.shopBtnCaption}>Instacart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shopBtnAmazon}
              onPress={() => openIngredientShopLink(amazonUrl)}
              activeOpacity={0.9}
              accessibilityRole="link"
              accessibilityLabel="Order ingredients on Amazon Fresh"
            >
              <AmazonFreshLogoMark />
              <Text style={styles.shopBtnCaption}>Amazon Fresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

function MamasKitchenScreen({
  therapeuticTags,
  isToddlerKitchen = false,
  isPostpartumKitchen = false,
  isPregnantKitchen = false,
  isSubscribed = false,
  onRequestUpgrade,
}) {
  const { columns, cellW, contentW } = useGridLayout();
  const showLittleBitesTab = isToddlerKitchen && !isPregnantKitchen;
  const [activeTab, setActiveTab] = useState(() =>
    showLittleBitesTab ? KITCHEN_LITTLE_BITES_TAB : getDefaultKitchenTimeOfDay()
  );
  const [activeFilter, setActiveFilter] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabTrackW, setTabTrackW] = useState(0);

  const prepBadgeAnim = useRef(new Animated.Value(0)).current;
  const tabHighlightX = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const tabSwitchingRef = useRef(false);
  const mealListRef = useRef(null);

  useEffect(() => {
    if (!isPregnantKitchen) return;
    warmPregnantKitchenTabImages(activeTab);
  }, [isPregnantKitchen, activeTab]);

  useEffect(() => {
    if (isPregnantKitchen) {
      warmPregnantKitchenImages();
    }
  }, [isPregnantKitchen]);

  const kitchenTabs = useMemo(
    () =>
      showLittleBitesTab
        ? [...MEAL_TABS, { ...LITTLE_BITES_TAB, Icon: IconLittleBites }]
        : MEAL_TABS,
    [showLittleBitesTab]
  );

  useEffect(() => {
    if (showLittleBitesTab) {
      setActiveTab(KITCHEN_LITTLE_BITES_TAB);
    } else if (activeTab === KITCHEN_LITTLE_BITES_TAB) {
      setActiveTab(getDefaultKitchenTimeOfDay());
    }
  }, [showLittleBitesTab]);

  useEffect(() => {
    if (isPregnantKitchen && activeTab === KITCHEN_LITTLE_BITES_TAB) {
      setActiveTab('morning');
    }
  }, [isPregnantKitchen, activeTab]);

  const tabIndex = kitchenTabs.findIndex((t) => t.id === activeTab);
  const tabSlotW = tabTrackW > 0 ? tabTrackW / kitchenTabs.length : 0;

  useEffect(() => {
    if (tabSlotW <= 0) return;
    Animated.timing(tabHighlightX, {
      toValue: Math.max(0, tabIndex) * tabSlotW,
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
    }).start();
  }, [tabIndex, tabSlotW, tabHighlightX]);

  const filteredMeals = useMemo(() => {
    const tabCategory = activeTab === 'afternoon' ? 'noon' : activeTab;
    let base;

    if (isPregnantKitchen && activeTab === 'morning') {
      base = BOOT_MEALS_CACHE.pregnantMorning;
    } else if (isPregnantKitchen && activeTab === 'afternoon') {
      base = BOOT_MEALS_CACHE.pregnantLunch;
    } else if (isPregnantKitchen && activeTab === 'night') {
      base = BOOT_MEALS_CACHE.pregnantDinner;
    } else if (activeTab === KITCHEN_LITTLE_BITES_TAB) {
      base = toddlerMealsData.map(enrichMeal);
    } else if (isPostpartumKitchen) {
      base = getPostpartumTabMeals(activeTab);
    } else {
      base = getBootMealsForCategory(tabCategory);
    }

    if (activeFilter) {
      base = base.filter((r) => mealMatchesDietaryFilter(r, activeFilter));
    }

    if (therapeuticTags?.length) {
      base = getTherapeuticMeals(base, therapeuticTags, 150);
    }

    return base;
  }, [activeFilter, activeTab, isPostpartumKitchen, isPregnantKitchen, therapeuticTags]);

  const gridData = useMemo(() => {
    const items = filteredMeals.map((item) => {
      if (
        isPregnantKitchen &&
        (activeTab === 'morning' || activeTab === 'afternoon' || activeTab === 'night')
      ) {
        return { ...item, __imagePriority: 'high' };
      }
      return item;
    });
    const rem = items.length % columns;
    if (rem !== 0) {
      for (let i = 0; i < columns - rem; i += 1) {
        items.push({ id: `__pad_${i}`, __pad: true });
      }
    }
    return items;
  }, [filteredMeals, columns, isPregnantKitchen, activeTab]);

  const handleTabChange = useCallback(
    (tabId) => {
      if (tabId === activeTab || tabSwitchingRef.current) return;

      if (isPregnantKitchen && PREGNANT_KITCHEN_TAB_IMAGES[tabId]) {
        warmPregnantKitchenTabImages(tabId);
      }

      tabSwitchingRef.current = true;
      contentFade.stopAnimation();
      Animated.timing(contentFade, {
        toValue: 0,
        duration: 220,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (!finished) {
          tabSwitchingRef.current = false;
          return;
        }
        setActiveTab(tabId);
        mealListRef.current?.scrollToOffset?.({ offset: 0, animated: false });
        contentFade.setValue(0);
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
        }).start(() => {
          tabSwitchingRef.current = false;
        });
      });
    },
    [activeTab, contentFade, isPregnantKitchen],
  );

  const openRecipe = useCallback(
    (recipe) => {
      setSelectedRecipe(recipe);
      setSheetOpen(true);
      prepBadgeAnim.setValue(0);
      Animated.spring(prepBadgeAnim, {
        toValue: 1,
        delay: 120,
        ...VILLAGE_SNAPPY_SPRING,
        useNativeDriver: VILLAGE_USE_NATIVE_DRIVER,
      }).start();
    },
    [prepBadgeAnim]
  );

  const closeRecipe = useCallback(() => {
    prepBadgeAnim.setValue(0);
    setSheetOpen(false);
    setSelectedRecipe(null);
  }, [prepBadgeAnim]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const locked =
        !isSubscribed && (item.isPremium === true || isPremiumKitchenRecipe(item, activeTab, index));
      return (
        <GridMealTile
          recipe={item}
          cellW={cellW}
          onPress={openRecipe}
          locked={locked}
          onLockedPress={onRequestUpgrade}
        />
      );
    },
    [activeTab, cellW, isSubscribed, onRequestUpgrade, openRecipe]
  );

  const kitchenListHeader = useMemo(
    () => (
      <HybridKitchenHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        tabHighlightX={tabHighlightX}
        tabSlotW={tabSlotW}
        onTabTrackLayout={(e) => setTabTrackW(e.nativeEvent.layout.width)}
        showLittleBites={showLittleBitesTab}
      />
    ),
    [
      activeFilter,
      activeTab,
      filtersOpen,
      handleTabChange,
      showLittleBitesTab,
      tabHighlightX,
      tabSlotW,
    ]
  );

  const gridListKey = `kitchen-grid-${columns}`;

  return (
    <View style={styles.root}>
      {kitchenListHeader}

      <Animated.View
        style={[
          styles.gridFadeWrap,
          {
            opacity: contentFade.interpolate({
              inputRange: [0, 1],
              outputRange: [0.18, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: contentFade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <KitchenMealGrid
          listKey={gridListKey}
          gridData={gridData}
          columns={columns}
          renderItem={renderItem}
          listRef={mealListRef}
        />
      </Animated.View>

      <MealDetailSheet
        recipe={selectedRecipe}
        visible={sheetOpen}
        onClose={closeRecipe}
        badgeAnim={prepBadgeAnim}
        contentW={contentW}
        isPregnantKitchen={isPregnantKitchen}
      />
    </View>
  );
}

export function getPregnantKitchenCatalogMeals() {
  return [
    ...PREGNANT_MAMA_MORNING_MEALS,
    ...PREGNANT_MAMA_MORNING_PREMIUM_MEALS,
    ...PREGNANT_MAMA_LUNCH_MEALS,
    ...PREGNANT_MAMA_LUNCH_PREMIUM_MEALS,
    ...PREGNANT_MAMA_DINNER_MEALS,
  ].map(enrichMeal);
}

export default memo(
  MamasKitchenScreen,
  (prev, next) =>
    prev.therapeuticTags === next.therapeuticTags &&
    prev.isToddlerKitchen === next.isToddlerKitchen &&
    prev.isPostpartumKitchen === next.isPostpartumKitchen &&
    prev.isPregnantKitchen === next.isPregnantKitchen &&
    prev.isSubscribed === next.isSubscribed &&
    prev.onRequestUpgrade === next.onRequestUpgrade,
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: PHONE_MAX_W,
    alignSelf: 'center',
  },
  gridFadeWrap: {
    flex: 1,
    minHeight: 0,
  },
  headerWrap: {
    flexShrink: 0,
    zIndex: 30,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 6,
    ...Platform.select({
      web: { position: 'sticky', top: 0 },
      default: {},
    }),
  },
  glassCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 6,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(60, 80, 68, 0.1)',
      },
      default: {
        shadowColor: '#3C5044',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  tabTrack: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    minHeight: 44,
  },
  tabHighlight: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 0,
    borderRadius: 999,
    backgroundColor: THEME.goldSoft,
    borderWidth: 1,
    borderColor: THEME.goldGlow,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    zIndex: 1,
  },
  tabSublabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: 'rgba(92, 122, 104, 0.55)',
    textTransform: 'uppercase',
  },
  tabSublabelActive: {
    color: THEME.ink,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.12)',
    marginLeft: 4,
  },
  filtersBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.inkSoft,
    letterSpacing: 0.2,
  },
  filtersDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.gold,
    marginLeft: 4,
  },
  filterPanel: {
    marginTop: 8,
    maxHeight: 44,
  },
  filterPanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: H_PAD,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.14)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: THEME.sage,
    borderColor: THEME.sage,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.inkSoft,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  feed: {
    flex: 1,
    minHeight: 0,
  },
  feedContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    paddingBottom: 28,
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  gridTile: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  gridGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingTop: 6,
    paddingHorizontal: 6,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 18px rgba(74, 62, 61, 0.08)',
      },
      default: {
        shadowColor: '#4A3E3D',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  gridImageWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    width: '100%',
    height: 168,
    ...Platform.select({
      web: { boxShadow: '0 3px 14px rgba(50, 70, 58, 0.1)' },
      default: { elevation: 2 },
    }),
  },
  gridImage: {
    width: '100%',
    height: 168,
    borderRadius: 16,
  },
  gridLabel: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '600',
    color: THEME.ink,
    textAlign: 'center',
    lineHeight: 16,
    width: '100%',
    ...KITCHEN_SERIF,
  },
  gridImageLocked: {
    opacity: 0.78,
  },
  gridLabelLocked: {
    color: THEME.inkSoft,
    opacity: 0.75,
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 218, 244, 0.35)',
  },
  imageFallbackEmoji: { fontSize: 24 },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.ink,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.inkSoft,
    marginTop: 4,
  },
  modalScreen: {
    flex: 1,
    backgroundColor: THEME.cream,
  },
  sheetCloseFab: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { backdropFilter: 'blur(8px)' },
      default: {},
    }),
  },
  sheetCloseFabIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.ink,
    lineHeight: 20,
  },
  sheetHeroWrap: {
    marginTop: 8,
  },
  backToKitchenBtn: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(92, 122, 104, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
  },
  backToKitchenBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.sage,
    letterSpacing: 0.2,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 22, 19, 0.58)',
    ...Platform.select({
      web: { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' },
      default: {},
    }),
  },
  sheetPanel: {
    maxHeight: '92%',
    backgroundColor: THEME.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(92, 122, 104, 0.22)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScroll: {
    paddingHorizontal: H_PAD,
    paddingBottom: 28,
  },
  sheetHero: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    backgroundColor: 'rgba(92, 122, 104, 0.08)',
    marginBottom: 14,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: THEME.ink,
    lineHeight: 28,
    marginRight: 10,
    ...KITCHEN_SERIF,
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(74, 62, 61, 0.78)',
    marginBottom: 16,
    ...KITCHEN_SERIF,
  },
  safetyFactsCard: {
    backgroundColor: 'rgba(92, 122, 104, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.28)',
    padding: 14,
    marginBottom: 16,
  },
  safetyFactsLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: THEME.sage,
    marginBottom: 8,
    ...KITCHEN_SERIF,
  },
  safetyFactsText: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.ink,
    fontWeight: '500',
    ...KITCHEN_SERIF,
  },
  prepBadge: {
    backgroundColor: THEME.sage,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginTop: 2,
  },
  prepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  benefitsCard: {
    backgroundColor: 'rgba(196, 165, 116, 0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(196, 165, 116, 0.32)',
  },
  benefitsLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8B6F47',
    marginBottom: 8,
    ...KITCHEN_SERIF,
  },
  benefitsText: {
    fontSize: 14,
    lineHeight: 23,
    color: 'rgba(74, 62, 61, 0.88)',
    fontWeight: '500',
    fontStyle: 'italic',
    ...KITCHEN_SERIF,
  },
  contentZone: {
    gap: 16,
  },
  contentZoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentCol: {
    flex: 1,
  },
  contentColHalf: {
    flex: 1,
    marginRight: 8,
  },
  zoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: THEME.sage,
    marginBottom: 8,
  },
  zoneCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(92, 122, 104, 0.35)',
    marginTop: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 122, 104, 0.06)',
  },
  checkBoxDone: {
    backgroundColor: THEME.sage,
    borderColor: THEME.sage,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: THEME.ink,
  },
  checkTextDone: {
    color: THEME.inkSoft,
    textDecorationLine: 'line-through',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepTimeline: {
    width: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.gold,
    borderWidth: 2,
    borderColor: THEME.goldSoft,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(196, 165, 116, 0.35)',
    marginVertical: 4,
    minHeight: 20,
  },
  stepBody: {
    flex: 1,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.gold,
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  stepText: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.ink,
    flexShrink: 1,
  },
  sheetFooter: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(92, 122, 104, 0.12)',
    backgroundColor: THEME.cream,
  },
  footerHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.inkSoft,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopBtnInstacart: {
    flex: 1,
    backgroundColor: THEME.instacart,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 6,
  },
  shopBtnAmazon: {
    flex: 1,
    backgroundColor: THEME.amazon,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 6,
  },
  shopBtnCaption: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoInstacart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  logoInstacartText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#008000',
    letterSpacing: -0.3,
  },
  logoAmazonRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoAmazonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAmazonFresh: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.amazonSmile,
    marginLeft: 3,
    fontStyle: 'italic',
  },
});
