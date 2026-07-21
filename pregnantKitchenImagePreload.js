import { Image } from 'expo-image';
import { InteractionManager, Platform } from 'react-native';

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

/** Prefer full-resolution decode — do not crush kitchen photos in the cache. */
export const PREGNANT_KITCHEN_DECODE_MAX_WIDTH = 1600;

export const PREGNANT_KITCHEN_MORNING_IMAGES = [
  AppleOatsImage,
  OmeletteImage,
  AvocadoToastImage,
  SmoothieImage,
  PancakesImage,
  BurritoImage,
];

export const PREGNANT_KITCHEN_LUNCH_IMAGES = [
  TurkeyMeltImage,
  SalmonSaladImage,
  ChickenWrapImage,
  TacosImage,
  PaniniImage,
  MiniPizzasImage,
];

export const PREGNANT_KITCHEN_DINNER_IMAGES = [
  BurgerDinnerImage,
  PestoPastaImage,
  AlfredoPastaImage,
  SloppyJoesImage,
  SheetPanGnocchiImage,
];

export const PREGNANT_KITCHEN_TAB_IMAGES = {
  morning: PREGNANT_KITCHEN_MORNING_IMAGES,
  afternoon: PREGNANT_KITCHEN_LUNCH_IMAGES,
  night: PREGNANT_KITCHEN_DINNER_IMAGES,
};

const PREGNANT_KITCHEN_IMAGES = [
  ...PREGNANT_KITCHEN_MORNING_IMAGES,
  ...PREGNANT_KITCHEN_LUNCH_IMAGES,
  ...PREGNANT_KITCHEN_DINNER_IMAGES,
];

const loaded = new Set();
let backgroundWarmScheduled = false;

function loadKitchenImage(moduleId) {
  if (loaded.has(moduleId)) return Promise.resolve();
  loaded.add(moduleId);
  // Decode at full useful size so grid + recipe sheet stay sharp on retina.
  return Image.loadAsync(moduleId, { maxWidth: PREGNANT_KITCHEN_DECODE_MAX_WIDTH }).catch(() => {});
}

/** Decode one pregnant kitchen tab before the user lands on it. */
export function warmPregnantKitchenTabImages(tabId) {
  const images = PREGNANT_KITCHEN_TAB_IMAGES[tabId];
  if (!images?.length) return Promise.resolve();
  return Promise.all(images.map(loadKitchenImage));
}

function scheduleBackgroundKitchenWarm() {
  if (backgroundWarmScheduled) return;
  backgroundWarmScheduled = true;

  InteractionManager.runAfterInteractions(() => {
    Promise.all([
      warmPregnantKitchenTabImages('afternoon'),
      warmPregnantKitchenTabImages('night'),
    ]).catch(() => {});
  });
}

/**
 * Morning tab first (default Kitchen view), then noon + night after interactions settle.
 * Uses loadAsync so bundled JPGs decode into expo-image's memory/disk cache.
 */
export function warmPregnantKitchenImages() {
  if (Platform.OS === 'web') return Promise.resolve();
  return warmPregnantKitchenTabImages('morning').then(() => {
    scheduleBackgroundKitchenWarm();
  });
}

/** Eagerly warm every pregnant kitchen thumbnail (e.g. first Kitchen tab open). */
export function warmAllPregnantKitchenImages() {
  return Promise.all(PREGNANT_KITCHEN_IMAGES.map(loadKitchenImage));
}
