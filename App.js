import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
  Easing,
  Platform,
  Alert,
  Linking,
} from 'react-native';
// Official transparent logo — offline Base64 data URI (generated in calmmamaLogoBase64.js)
import {
  CALMMAMA_OFFICIAL_LOGO,
  CALMMAMA_VILLAGE_BADGE,
} from './calmmamaLogoBase64';
import WeeklyBloomScreen from './WeeklyBloomScreen';
import VillageBrandHeader from './VillageBrandHeader';
import CosmicNebulaBackdrop from './CosmicNebulaBackdrop';
import CalmMamaOmbreBackdrop from './CalmMamaOmbreBackdrop';
import SoulSanctuaryScreen from './SoulSanctuaryScreen';
import CloudNurseryScreen from './CloudNurseryScreen';
import VillageCommunityPortal from './VillageCommunityPortal';
import MamaIdentityCard from './MamaIdentityCard';
import MamasKitchenScreen from './MamasKitchenScreen';
import BirthdayBoutiqueModal from './BirthdayBoutiqueModal';
import { isBirthdayToday } from './mamaBirthdayUtils';
import { MAMA_KITCHEN_RECIPES } from './mealsData';
import {
  collectTherapeuticTagsFromSymptoms,
  collectTherapeuticTagsFromVibes,
  getTherapeuticMeals,
  getTherapeuticHeadlineForSymptoms,
  getTherapeuticHeadlineForVibes,
} from './mealsTherapeuticMap';
import {
  animateVillageTabFlow,
  configureVillageLayoutTransition,
  getVillageTabFlowStyle,
  runVillageTabTransition,
  useVillagePressTransition,
} from './villageScreenTransitions';
import { VILLAGE_IN_OUT_SIN } from './villageEasing';
import {
  getBottomNavStyle,
  getIphoneFrameStyle,
  getShellFooterLinksStyle,
  getWebWrapperStyle,
  injectMobileWebViewport,
  useMobileWebLayout,
} from './mobileWebLayout';
import { injectNurseryWebFonts, retroHubTitle } from './nurseryRetroFonts';
import { getVillageRemedy } from './villageRemedyTips';
import { REGISTRY_CURATED_PRODUCTS } from './registryData';
import {
  COMMUNITY_POSTS_SEED,
  BASKET_OFFERINGS,
  BASKET_SEEKING,
} from './villageCommunityData';

const AMAZON_ASSOCIATE_TAG = 'calmmamavilla-20';
const VILLAGE_CHOICE_THRESHOLD = 3;
const REGISTRY_ASSET_PLACEHOLDERS = [
  require('./assets/soul-cloud-sage.png'),
  require('./assets/soul-cloud-peach.png'),
  require('./assets/soul-cloud-lavender.png'),
];

function resolveRegistryImageSource(item, index) {
  if (item.imageUrl) return { uri: item.imageUrl };
  if (item.imageSource) return item.imageSource;
  return REGISTRY_ASSET_PLACEHOLDERS[index % REGISTRY_ASSET_PLACEHOLDERS.length];
}

const REGISTRY_INVENTORY = REGISTRY_CURATED_PRODUCTS.map((item, index) => ({
  ...item,
  imageSource: resolveRegistryImageSource(item, index),
}));

function buildAmazonAffiliateUrl(url) {
  if (!url) return url;
  // Amazon associate tag is `tag=xxxx-20` for most URLs. Keep it safe & non-destructive.
  try {
    const u = new URL(url);
    u.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
    return u.toString();
  } catch {
    const stripped = url.replace(/([?&])tag=[^&]*&?/g, '$1').replace(/[?&]$/, '');
    const hasQuery = stripped.includes('?');
    return `${stripped}${hasQuery ? '&' : '?'}tag=${AMAZON_ASSOCIATE_TAG}`;
  }
}

function safeOpenUrl(url) {
  if (!url) return;
  Linking.openURL(url).catch(() => {
    Alert.alert('Link unavailable', 'That link could not be opened right now.');
  });
}

const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'PLACEHOLDER_FOR_LIVE_STRIPE_KEY';

const STRIPE_CHECKOUT_CONFIG = {
  publishableKey: stripePublishableKey,
  currency: 'usd',
  merchantName: 'CalmMama Village',
};

const SHIPPING_FLAT_CENTS = 599;
const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

const PREGNANT_PULSE_MESSAGES = [
  'You are allowed to rest today — the village sees you, mama. 🌸',
  'Someone nearby whispered a gentle blessing for you this morning. 💗',
  'Your body is doing sacred work. Breathe — you are not alone. 🌿',
  'A mama in your circle saved her first nursery treasure today. Your turn can wait. 🏡',
  'However today feels, it counts. The village holds space for all of it. ✨',
  'Soft wins matter here. One sip of water, one deep breath — enough for now. 💧',
];

const POSTPARTUM_PULSE_MESSAGES = [
  'Your 2 a.m. feeding is sacred work. The night-shift sisterhood is with you. 🌙',
  'You are doing enough — even when it doesn\'t feel like it. We see you. 💗',
  'A mama near you just refilled her water. Permission granted for you too. ☕',
  'The village is holding a quiet cheer for every diaper, cuddle, and tear today. 🍼',
  'Rest is not a reward — it is part of healing. The village agrees. 🌿',
  'Your tenderness is changing a little life. That is everything. ✨',
];

function getVillagePulseMessage(userJourney) {
  const pool = userJourney === 'postpartum' ? POSTPARTUM_PULSE_MESSAGES : PREGNANT_PULSE_MESSAGES;
  const slot = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
  return pool[slot % pool.length];
}

const APOTHECARY_PRODUCTS = [
  {
    id: 'sunrise-village-candle',
    kind: 'candle',
    title: 'Sunrise Village Candle',
    size: '10 oz',
    price: 28.0,
    scentProfile:
      'Iced Berry Lemonade — Crisp lemon zest, sparkling citrus, and sun-sweetened berries over a clean iced finish.',
    ritualNotes:
      'Light at golden hour. Let iced berry and bright citrus lift your morning — a refreshing ritual for new beginnings and gentle self-celebration.',
    imageSource: require('./assets/apothecary-sunrise-candle.png'),
    collection: 'sunrise',
  },
  {
    id: 'sunrise-wild-berry-scrub',
    kind: 'scrub',
    title: "Sunrise Village 'Wild Berry Sunrise' Body Scrub",
    size: '8 oz',
    price: 24.0,
    scentProfile:
      'Wild Berry Sunrise — Exfoliating natural sugar cane crystals infused with crushed field berries to awaken stretching skin.',
    imageSource: require('./assets/apothecary-village-scrub.png'),
    collection: 'sunrise',
  },
  {
    id: 'sweet-dreams-cloud9-candle',
    kind: 'candle',
    title: "Sweet Dreams Village 'Cloud 9' Candle",
    size: '10 oz',
    price: 28.0,
    scentProfile:
      'Cloud 9 Lavender & Oatmilk — A deeply soothing, creamy blanket of crushed lavender buds, rich oatmilk, and comforting warm vanilla to settle late-night racing minds.',
    ritualNotes:
      'Best burned after the nursery hush. Breathe in three slow counts, exhale the day, and let lavender-oatmilk calm your nervous system into rest.',
    imageSource: require('./assets/apothecary-cloud9-candle.png'),
    collection: 'sweet-dreams',
  },
  {
    id: 'sweet-dreams-cloud9-scrub',
    kind: 'scrub',
    title: "Sweet Dreams Village 'Cloud 9' Body Scrub",
    size: '8 oz',
    price: 24.0,
    scentProfile:
      'Cloud 9 Evening Ritual — A velvety nourishing scrub utilizing magnesium-rich minerals and oat extracts to prepare a tired mother for deep sleep.',
    imageSource: require('./assets/apothecary-village-scrub.png'),
    collection: 'sweet-dreams',
  },
  {
    id: 'sanctuary-ritual-bundle',
    kind: 'bundle',
    title: 'The Sanctuary Ritual Bundle',
    size: 'Custom Size Set',
    price: 46.0,
    description:
      'The Gift of Sanctuary — Choose any 10oz Village Candle and pair it with its matching 8oz exfoliating bath scrub for the ultimate maternal wellness ritual.',
    imageSource: require('./assets/apothecary-sanctuary-bundle.png'),
    collection: 'bundle',
  },
];

const APOTHECARY_CANDLES = APOTHECARY_PRODUCTS.filter((p) => p.kind === 'candle');
const APOTHECARY_SCRUBS = APOTHECARY_PRODUCTS.filter((p) => p.kind === 'scrub');

function getApothecaryProduct(productId) {
  return APOTHECARY_PRODUCTS.find((p) => p.id === productId);
}

function getCartLineUnitPrice(product, line) {
  if (!product) return 0;
  const discount = line.discountPercent || 0;
  return product.price * (1 - discount / 100);
}

function buildStripeLineItems(cart) {
  return cart
    .map((line) => {
      const product = getApothecaryProduct(line.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.title,
        size: line.size,
        quantity: line.quantity,
        unitAmount: Math.round(getCartLineUnitPrice(product, line) * 100),
        currency: STRIPE_CHECKOUT_CONFIG.currency,
      };
    })
    .filter(Boolean);
}

function calcCartSubtotalCents(cart) {
  return buildStripeLineItems(cart).reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
}

function calcShippingCents(subtotalCents) {
  if (!subtotalCents) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

function buildStripePaymentPayload(cart, shippingAddress, paymentMethodId, customerName, customerEmail) {
  const lineItems = buildStripeLineItems(cart);
  const subtotal = lineItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const shippingCents = calcShippingCents(subtotal);
  const amount = subtotal + shippingCents;
  return {
    amount,
    subtotal,
    shippingCents,
    currency: STRIPE_CHECKOUT_CONFIG.currency,
    items: lineItems,
    shippingDetails: {
      address: shippingAddress,
      name: customerName || '',
      email: customerEmail || '',
    },
    payment_method: paymentMethodId || null,
    metadata: {
      merchant: STRIPE_CHECKOUT_CONFIG.merchantName,
      source: 'calmmama-village-apothecary',
    },
  };
}

async function processStripeCheckout(paymentPayload) {
  if (!stripePublishableKey || stripePublishableKey.includes('PLACEHOLDER')) {
    return {
      success: false,
      error: 'Stripe publishable key not configured. Replace PLACEHOLDER_FOR_LIVE_STRIPE_KEY.',
      paymentPayload,
    };
  }
  // Production hook: create PaymentIntent via your secure backend, then confirm with Stripe SDK.
  // Example: const { clientSecret } = await fetch('/api/create-payment-intent', { method: 'POST', body: JSON.stringify(paymentPayload) });
  // return stripe.confirmCardPayment(clientSecret, { payment_method: paymentPayload.payment_method });
  return { success: false, error: 'Stripe SDK endpoint not wired yet.', paymentPayload };
}

function formatUsd(amount) {
  return `$${amount.toFixed(2)}`;
}

/** Strip marketing scent names — show only ingredient/experience copy in the Sanctum */
function getCandleSensoryDescription(scentProfile) {
  if (!scentProfile) return '';
  const dashIndex = scentProfile.indexOf(' — ');
  if (dashIndex >= 0) return scentProfile.slice(dashIndex + 3).trim();
  return scentProfile
    .replace(/^Iced Berry Lemonade\s*[—–-]\s*/i, '')
    .replace(/^Cloud 9 Lavender & Oatmilk\s*[—–-]\s*/i, '')
    .trim();
}

function playSoftSuccessChime() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // Preview-only chime; silent fallback if audio is blocked
      }
    }, 700);
  } catch {
    // Preview-only chime; silent fallback if audio is blocked
  }
}

function cartLineKey(productId, size) {
  return `${productId}::${size}`;
}

function isPastDueDate(dueDateStr, weeksPregnant) {
  const weeks = parseInt(String(weeksPregnant), 10) || 0;
  if (weeks >= 40) return true;
  if (!dueDateStr?.trim()) return false;
  const parsed = Date.parse(dueDateStr.trim());
  if (!Number.isNaN(parsed)) return Date.now() > parsed;
  return false;
}

function BirthGraduationPrompt({ visible, reason, onConfirm, onDismiss }) {
  if (!visible) return null;

  const isPastDue = reason === 'past-due';
  const title = isPastDue ? 'Your due date has passed 🌸' : 'Did your little one arrive early?';
  const message = isPastDue
    ? 'Has baby arrived? When you’re ready, we’ll gently shift your village into postpartum mode — your Cloud Nursery tracker will be waiting.'
    : 'Sometimes babies bloom ahead of schedule. If you’ve given birth, tap below and we’ll open your postpartum sanctuary.';

  return (
    <View style={styles.birthPromptOverlay}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onDismiss} activeOpacity={1} />
      <View style={styles.birthPromptCard}>
        <Text style={styles.birthPromptTitle}>{title}</Text>
        <Text style={styles.birthPromptMessage}>{message}</Text>
        <TouchableOpacity style={styles.birthPromptConfirmBtn} onPress={onConfirm} activeOpacity={0.88}>
          <Text style={styles.birthPromptConfirmText}>Yes — baby is here 💗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.birthPromptDismissBtn} onPress={onDismiss} activeOpacity={0.85}>
          <Text style={styles.birthPromptDismissText}>
            {isPastDue ? 'Not yet — still blooming' : 'Still pregnant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ApothecaryProductDetailModal({
  product,
  anim,
  onClose,
  onAddToCart,
}) {
  if (!product) return null;

  const copy = product.scentProfile || product.description || '';
  const isSunrise = product.id === 'sunrise-village-candle';
  const isCloud9 = product.id === 'sweet-dreams-cloud9-candle';

  return (
    <Animated.View style={[styles.apothecaryOverlay, styles.apothecaryDetailOverlay, { opacity: anim.opacity }]}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[
          styles.apothecaryDetailModal,
          {
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { translateX: anim.translateX },
              { translateY: anim.translateY },
            ],
          },
        ]}
      >
        {product.imageSource ? (
          <Image source={product.imageSource} style={styles.apothecaryDetailHeroImage} resizeMode="cover" />
        ) : null}

        <ScrollView
          style={styles.apothecaryDetailScroll}
          contentContainerStyle={styles.apothecaryDetailScrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.apothecaryDetailTopRow}>
            <Text
              style={[
                styles.apothecaryDetailTitle,
                isSunrise && styles.apothecaryDetailTitlePeach,
                isCloud9 && styles.apothecaryDetailTitleLavender,
              ]}
            >
              {product.title}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.apothecaryClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.apothecaryDetailSizePrice}>
            {product.size} · {formatUsd(product.price)}
          </Text>
          <Text style={styles.apothecaryDetailLabel}>Sensory experience</Text>
          <Text style={styles.apothecaryDetailScent}>
            {product.kind === 'candle'
              ? getCandleSensoryDescription(copy)
              : copy}
          </Text>
          {product.ritualNotes ? (
            <>
              <Text style={styles.apothecaryDetailLabel}>Ritual notes</Text>
              <Text style={styles.apothecaryDetailRitual}>{product.ritualNotes}</Text>
            </>
          ) : null}
        </ScrollView>

        <TouchableOpacity
          style={styles.apothecaryDetailAddBtn}
          onPress={() => onAddToCart(product.id)}
          activeOpacity={0.88}
        >
          <Text style={styles.apothecaryDetailAddText}>Add to Sanctuary Basket</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function VillageCandleSanctumLayer({
  visible,
  anim,
  candles,
  onClose,
  onSelectCandle,
  onAddToCart,
  onOpenCart,
  cartItemCount,
}) {
  if (!visible) return null;

  return (
    <Animated.View style={[styles.candleSanctumOverlay, { opacity: anim.opacity }]}>
      <Animated.View
        style={[
          styles.candleSanctumSheet,
          {
            transform: [{ translateY: anim.translateY }],
          },
        ]}
      >
        <View style={styles.candleSanctumHeader}>
          <View style={styles.candleSanctumHeaderText}>
            <Text style={styles.candleSanctumEyebrow}>DEEP LAYER · VILLAGE CANDLES</Text>
            <Text style={styles.candleSanctumTitle}>The Candle Sanctum</Text>
            <Text style={styles.candleSanctumSub}>
              Hand-poured soy rituals — tap any candle for the full sensory story.
            </Text>
          </View>
          <View style={styles.candleSanctumHeaderActions}>
            <TouchableOpacity
              style={styles.candleSanctumCartBtn}
              onPress={onOpenCart}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.candleSanctumCartIcon}>🧺</Text>
              {cartItemCount > 0 ? (
                <View style={styles.candleSanctumCartBadge}>
                  <Text style={styles.candleSanctumCartBadgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.candleSanctumClose}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.candleSanctumScroll}
          contentContainerStyle={styles.candleSanctumScrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {candles.map((candle) => (
            <View key={candle.id} style={styles.candleSanctumCard}>
              <TouchableOpacity
                onPress={() => onSelectCandle(candle.id)}
                activeOpacity={0.92}
              >
                {candle.imageSource ? (
                  <Image source={candle.imageSource} style={styles.candleSanctumCardImage} resizeMode="cover" />
                ) : null}
                <View style={styles.candleSanctumCardBody}>
                  <Text style={styles.candleSanctumCardMeta}>
                    {candle.size} · {formatUsd(candle.price)}
                  </Text>
                  <Text style={styles.candleSanctumCardScent}>
                    {getCandleSensoryDescription(candle.scentProfile)}
                  </Text>
                  <Text style={styles.candleSanctumCardCta}>Open full candle page →</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.candleSanctumQuickAdd}
                onPress={() => onAddToCart(candle.id)}
                activeOpacity={0.88}
              >
                <Text style={styles.candleSanctumQuickAddText}>+ Add to Sanctuary Basket</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.candleSanctumFooterNote}>
            <Text style={styles.candleSanctumFooterText}>
              More ritual copy, burn guides, and seasonal drops can live here as you grow the collection.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const DEFAULT_MAMA_DISCOVERY = {
  heartSpace:
    'Slow mornings with honey tea, a chapter of fiction, and permission to nap without guilt.',
  centerRitual:
    'Three deep belly breaths at the kitchen window, then one song that always makes me feel held.',
};

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const ONBOARDING_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Times New Roman", serif' },
  default: {},
});

const ONBOARDING_WELCOME_FONT = {
  ...retroHubTitle,
  fontSize: 34,
  lineHeight: 46,
  letterSpacing: 0.4,
};

function startLogoPulseLoop(pulseAnim, loopRef) {
  loopRef.current?.stop();
  pulseAnim.setValue(0.95);
  loopRef.current = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.03,
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ])
  );
  loopRef.current.start();
}

const SANCTUARY_SYMPTOMS = [
  { id: 'fatigue', emoji: '🥱', label: 'Fatigue' },
  { id: 'nausea', emoji: '🤢', label: 'Nausea' },
  { id: 'heartburn', emoji: '⚡', label: 'Heartburn' },
  { id: 'connected', emoji: '🕊️', label: 'Connected' },
  { id: 'foggy', emoji: '🧠', label: 'Foggy' },
];

const DEFAULT_NESTING_TASKS = [
  { id: 1, text: 'Pack hospital bag', done: false },
  { id: 2, text: 'Set up birth plan', done: false },
  { id: 3, text: 'Wash baby clothes', done: false },
];

const POSTPARTUM_VIBES = [
  { id: 'empty', emoji: '☕', label: 'Running on Empty' },
  { id: 'grounded', emoji: '🌤️', label: 'Grounded' },
  { id: 'overwhelmed', emoji: '🌀', label: 'Overwhelmed' },
  { id: 'healing', emoji: '🌸', label: 'Healing' },
];

const DEFAULT_MAMA_WINS = [
  { id: 1, text: 'Take a warm, uninterrupted shower 🚿', done: false },
  { id: 2, text: 'Eat a nourishing meal with two hands 🍲', done: false },
  { id: 3, text: 'Breathe fresh air outside 🌿', done: false },
  { id: 4, text: 'Take postpartum recovery care / vitamins 💊', done: false },
];

function getPregnancyTrimester(weeksPregnant) {
  const week = parseInt(String(weeksPregnant), 10);
  if (Number.isNaN(week) || week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

function formatKickElapsed(ms) {
  if (!ms || ms < 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function TherapeuticMealFeed({ meals, headline, onOpenKitchen }) {
  if (!meals?.length) return null;

  return (
    <View style={styles.therapeuticFeedCard}>
      <Text style={styles.therapeuticFeedTitle}>🍲 Village nourishment for you</Text>
      <Text style={styles.therapeuticFeedSub}>{headline}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.therapeuticFeedRow}
      >
        {meals.map((meal) => (
          <View key={meal.id} style={styles.therapeuticMealTile}>
            <Image source={{ uri: meal.imageUrl }} style={styles.therapeuticMealImage} resizeMode="cover" />
            <Text style={styles.therapeuticMealTitle} numberOfLines={2}>
              {meal.title}
            </Text>
            <Text style={styles.therapeuticMealMeta}>{meal.prepMinutes} min · {meal.servings} servings</Text>
          </View>
        ))}
      </ScrollView>
      {onOpenKitchen ? (
        <TouchableOpacity style={styles.therapeuticKitchenLink} onPress={onOpenKitchen} activeOpacity={0.88}>
          <Text style={styles.therapeuticKitchenLinkText}>Open full rotation in Mama&apos;s Kitchen →</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function VillagePulseBar({ userJourney }) {
  const [pulseCopy, setPulseCopy] = useState(() => getVillagePulseMessage(userJourney));

  useEffect(() => {
    setPulseCopy(getVillagePulseMessage(userJourney));
    const rotate = setInterval(() => {
      setPulseCopy(getVillagePulseMessage(userJourney));
    }, 1000 * 60 * 60 * 3);
    return () => clearInterval(rotate);
  }, [userJourney]);

  return (
    <View
      style={[
        styles.villagePulseCapsule,
        userJourney === 'postpartum' ? styles.villagePulseCapsuleNight : styles.villagePulseCapsuleDay,
      ]}
    >
      <Text style={[styles.villagePulseEyebrow, userJourney === 'postpartum' && styles.villagePulseEyebrowNight]}>
        VILLAGE PULSE
      </Text>
      <Text style={[styles.villagePulseText, userJourney === 'postpartum' && styles.villagePulseTextNight]}>
        {pulseCopy}
      </Text>
    </View>
  );
}

function SoulSanctuaryEntryCard({ onEnter }) {
  const { animatedStyle, runTransition } = useVillagePressTransition();

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.soulEntryCard}
        onPress={() => runTransition(onEnter)}
        activeOpacity={0.92}
      >
        <Text style={styles.soulEntryEyebrow}>PREMIUM SANCTUARY SPACE</Text>
        <Text style={[styles.soulEntryTitle, ONBOARDING_SERIF]}>The Soul Sanctuary</Text>
        <Text style={[styles.soulEntryDesc, ONBOARDING_SERIF]}>
          Drift among mood clouds, journal your heart, and talk with your village companion under the stars.
        </Text>
        <Text style={styles.soulEntryCta}>Enter the cosmic sanctuary →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function VillageRemedyPopup({ symptom, visible, onDismissed }) {
  const remedy = symptom ? getVillageRemedy(symptom.id) : null;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const driftTimerRef = useRef(null);
  const dismissingRef = useRef(false);

  const driftAway = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    if (driftTimerRef.current) {
      clearTimeout(driftTimerRef.current);
      driftTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: -90,
        duration: 1100,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      dismissingRef.current = false;
      onDismissed();
    });
  }, [opacity, translateY, scale, onDismissed]);

  useEffect(() => {
    if (!visible || !symptom || !remedy) return undefined;

    dismissingRef.current = false;
    opacity.setValue(0);
    translateY.setValue(28);
    scale.setValue(0.92);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      const readMs = Math.min(14000, Math.max(5000, (remedy.tip?.length || 0) * 48 + 3500));
      driftTimerRef.current = setTimeout(driftAway, readMs);
    });

    return () => {
      if (driftTimerRef.current) {
        clearTimeout(driftTimerRef.current);
        driftTimerRef.current = null;
      }
    };
  }, [visible, symptom, remedy, opacity, translateY, scale, driftAway]);

  if (!visible || !symptom || !remedy) return null;

  return (
    <View style={styles.villageRemedyOverlay} pointerEvents="box-none">
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={driftAway} activeOpacity={1} />
      <Animated.View
        style={[
          styles.villageRemedyPopupCard,
          {
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <View style={styles.villageRemedyHeader}>
          <View style={styles.villageRemedyBadge}>
            <Text style={styles.villageRemedyBadgeText}>🌿 Village Remedy</Text>
          </View>
          <Text style={styles.villageRemedySymptom}>
            {symptom.emoji} {symptom.label}
          </Text>
        </View>
        <Text style={styles.villageRemedyTitle}>{remedy.title}</Text>
        <Text style={styles.villageRemedyBody}>{remedy.tip}</Text>
        <TouchableOpacity style={styles.villageRemedyDismissBtn} onPress={driftAway} activeOpacity={0.88}>
          <Text style={styles.villageRemedyDismissText}>Got it — drift away 🌸</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/** Pregnant Daily tab — symptom, kick counter, nesting checklist */
function renderPregnantDailyTracker({
  panelStyle,
  weeksPregnant,
  selectedSymptoms,
  onToggleSymptom,
  symptomHistory,
  kickSession,
  kickSessionLog,
  onLogKick,
  onSaveKickSession,
  nestingTasks,
  onToggleNestingTask,
  newNestingTask,
  onNewNestingTaskChange,
  onAddNestingTask,
  therapeuticMeals,
  therapeuticHeadline,
  onOpenKitchen,
}) {
  const trimester = getPregnancyTrimester(weeksPregnant);
  const trimesterLabels = {
    1: 'First trimester — gentle flutters',
    2: 'Second trimester — growing patterns',
    3: 'Third trimester — active kick counts',
  };
  const kickGoal = trimester === 3 ? 10 : trimester === 2 ? 6 : 4;
  const sessionElapsed =
    kickSession.startedAt != null ? Date.now() - kickSession.startedAt : 0;

  return (
    <View style={panelStyle}>
      <View style={styles.dailyTabHeader}>
        <Text style={styles.dailyTabTitle}>✨ Daily Village</Text>
        <Text style={styles.dailyTabSub}>Symptoms, kicks & nesting — all in one gentle place</Text>
      </View>

      <View style={styles.homeGlassCard}>
        <Text style={styles.homeCardTitle}>🤰 Quick Daily Symptom Tracker</Text>
        <Text style={styles.homeCardHint}>Tap how you're feeling today — saved softly to your log</Text>
        <View style={styles.symptomRow}>
          {SANCTUARY_SYMPTOMS.map((symptom) => {
            const active = selectedSymptoms.includes(symptom.id);
            return (
              <TouchableOpacity
                key={symptom.id}
                style={[styles.symptomChip, active && styles.symptomChipActive]}
                onPress={() => onToggleSymptom(symptom.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                <Text style={[styles.symptomLabel, active && styles.symptomLabelActive]}>
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {symptomHistory.length > 0 ? (
          <View style={styles.symptomHistoryBox}>
            <Text style={styles.symptomHistoryTitle}>Today's gentle log</Text>
            {symptomHistory.slice(0, 5).map((entry) => (
              <Text key={entry.id} style={styles.symptomHistoryLine}>
                {entry.emoji} {entry.label} · {entry.time}
              </Text>
            ))}
          </View>
        ) : null}

        <TherapeuticMealFeed
          meals={therapeuticMeals}
          headline={therapeuticHeadline}
          onOpenKitchen={onOpenKitchen}
        />
      </View>

      <View style={styles.homeGlassCard}>
        <Text style={styles.homeCardTitle}>👣 The Kick Counter</Text>
        <Text style={styles.homeCardHint}>{trimesterLabels[trimester]}</Text>
        <View style={styles.kickMetaRow}>
          <Text style={styles.kickMetaPill}>Week {weeksPregnant || '—'}</Text>
          <Text style={styles.kickMetaPill}>T{trimester}</Text>
          <Text style={styles.kickMetaPill}>Goal {kickGoal}</Text>
        </View>
        <View style={styles.kickStatsRow}>
          <View style={styles.kickStat}>
            <Text style={styles.kickStatValue}>{kickSession.count}</Text>
            <Text style={styles.kickStatLabel}>Kicks logged</Text>
          </View>
          <View style={styles.kickStat}>
            <Text style={styles.kickStatValue}>{formatKickElapsed(sessionElapsed)}</Text>
            <Text style={styles.kickStatLabel}>Session time</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.kickFootBtn} onPress={onLogKick} activeOpacity={0.88}>
          <Text style={styles.kickFootIcon}>👣</Text>
          <Text style={styles.kickFootLabel}>Tap a kick</Text>
        </TouchableOpacity>
        {kickSession.count > 0 ? (
          <TouchableOpacity style={styles.kickResetBtn} onPress={onSaveKickSession}>
            <Text style={styles.kickResetText}>Save session & start new</Text>
          </TouchableOpacity>
        ) : null}

        {kickSessionLog.length > 0 ? (
          <View style={styles.kickLogSection}>
            <Text style={styles.kickLogTitle}>Saved kick timeline</Text>
            <ScrollView
              style={styles.kickLogScroll}
              contentContainerStyle={styles.kickLogScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {kickSessionLog.map((entry) => (
                <View key={entry.id} style={styles.kickLogRow}>
                  <View style={styles.kickLogRowMain}>
                    <Text style={styles.kickLogCount}>{entry.count} kicks</Text>
                    <Text style={styles.kickLogDuration}>{formatKickElapsed(entry.durationMs)}</Text>
                  </View>
                  <Text style={styles.kickLogMeta}>
                    Week {entry.week} · T{entry.trimester} · Goal {entry.goal} · {entry.dateLabel} · {entry.timeLabel}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <View style={styles.homeGlassCard}>
        <Text style={styles.homeCardTitle}>📝 Nesting Intentions Checklist</Text>
        <Text style={styles.homeCardHint}>Check off cozy preparations at your own pace</Text>
        {nestingTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.nestingRow}
            onPress={() => onToggleNestingTask(task.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.nestingCheck, task.done && styles.nestingCheckOn]}>
              {task.done ? <Text style={styles.nestingCheckMark}>✓</Text> : null}
            </View>
            <Text style={[styles.nestingText, task.done && styles.nestingTextDone]}>{task.text}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.nestingAddRow}>
          <TextInput
            style={styles.nestingInput}
            placeholder="Add a nesting intention…"
            placeholderTextColor="#7A8E82"
            value={newNestingTask}
            onChangeText={onNewNestingTaskChange}
            onSubmitEditing={onAddNestingTask}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.nestingAddBtn} onPress={onAddNestingTask}>
            <Text style={styles.nestingAddBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function MamaWinRow({ task, onToggle }) {
  const fadeAnim = useRef(new Animated.Value(task.done ? 0.5 : 1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: task.done ? 0.48 : 1,
      duration: 340,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [task.done, fadeAnim]);

  return (
    <TouchableOpacity style={styles.nestingRow} onPress={onToggle} activeOpacity={0.85}>
      <View style={[styles.nestingCheck, task.done && styles.nestingCheckOn]}>
        {task.done ? <Text style={styles.nestingCheckMark}>✓</Text> : null}
      </View>
      <Animated.Text
        style={[
          styles.nestingText,
          task.done && styles.nestingTextDone,
          { opacity: fadeAnim },
        ]}
      >
        {task.text}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const WIN_CELEBRATION_SPARKLES = ['✨', '🌸', '💐', '🦋', '🌷', '💖', '☀️', '🌿', '⭐', '🎀', '💫', '🌼'];

const FIREWORK_PARTICLES = WIN_CELEBRATION_SPARKLES.map((emoji, index) => {
  const spread = (index - (WIN_CELEBRATION_SPARKLES.length - 1) / 2) * 0.48;
  const angle = -Math.PI / 2 + spread;
  const power = 52 + (index % 5) * 14;
  const endX = Math.cos(angle) * power;
  const endY = Math.sin(angle) * power - 18;
  const peakX = endX * 0.45;
  const peakY = endY - 42 - (index % 4) * 10;
  return { emoji, endX, endY, peakX, peakY, spin: index % 2 === 0 ? 12 : -10 };
});

const FIREWORK_BURST_EASING = Easing.bezier(0.22, 0.85, 0.18, 1);

/** Prevents dev Strict Mode (and re-renders) from firing the celebration twice */
let lastWinsCelebrationKey = '';

function FireworksBurst({ burstProgress, celebrationMessage, messageFade }) {
  const messageOpacity = messageFade;
  const messageScale = messageFade.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <View style={styles.fireworksStage} pointerEvents="none">
      <View style={styles.fireworksOrigin}>
        {FIREWORK_PARTICLES.map((particle, index) => {
          const tx = burstProgress.interpolate({
            inputRange: [0, 0.28, 0.52, 0.8, 1],
            outputRange: [0, particle.peakX * 0.35, particle.peakX, particle.endX * 0.92, particle.endX],
          });
          const ty = burstProgress.interpolate({
            inputRange: [0, 0.28, 0.52, 0.8, 1],
            outputRange: [0, particle.peakY * 0.25, particle.peakY, particle.endY * 0.88, particle.endY],
          });
          const opacity = burstProgress.interpolate({
            inputRange: [0, 0.1, 0.35, 0.62, 0.88, 1],
            outputRange: [0, 0.85, 1, 1, 0.45, 0],
          });
          const scale = burstProgress.interpolate({
            inputRange: [0, 0.18, 0.42, 0.72, 1],
            outputRange: [0.35, 1.08, 1.02, 0.88, 0.4],
          });
          const rotate = burstProgress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${particle.spin}deg`],
          });

          return (
            <Animated.Text
              key={`${particle.emoji}-${index}`}
              style={[
                styles.fireworkParticle,
                {
                  opacity,
                  transform: [{ translateX: tx }, { translateY: ty }, { scale }, { rotate }],
                },
              ]}
            >
              {particle.emoji}
            </Animated.Text>
          );
        })}
      </View>
      {celebrationMessage ? (
        <View style={styles.fireworksMessageStack}>
          <Animated.Text
            style={[
              celebrationMessage === 'cheer' ? styles.fireworksPopText : styles.fireworksPopSubtext,
              { opacity: messageOpacity, transform: [{ scale: messageScale }] },
            ]}
          >
            {celebrationMessage === 'cheer'
              ? 'Way to go, Mama!'
              : 'Take time to celebrate yourself.'}
          </Animated.Text>
        </View>
      ) : null}
    </View>
  );
}

/** Postpartum Daily tab — vibe check & mama wins */
function PostpartumDailyTracker({
  panelStyle,
  selectedVibes,
  onToggleVibe,
  vibeHistory,
  mamaWinsTasks,
  onToggleMamaWin,
  therapeuticMeals,
  therapeuticHeadline,
  onOpenKitchen,
}) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState(null);
  const burstAnim = useRef(new Animated.Value(0)).current;
  const messageFade = useRef(new Animated.Value(0)).current;
  const celebrationTimers = useRef([]);
  const allWinsDone =
    mamaWinsTasks.length > 0 && mamaWinsTasks.every((task) => task.done);

  const clearCelebrationTimers = () => {
    celebrationTimers.current.forEach(clearTimeout);
    celebrationTimers.current = [];
  };

  const scheduleCelebration = (fn, delayMs) => {
    const id = setTimeout(fn, delayMs);
    celebrationTimers.current.push(id);
  };

  const fadeCelebrationMessage = (toValue, durationMs = 650, onDone) => {
    Animated.timing(messageFade, {
      toValue,
      duration: durationMs,
      easing: toValue ? Easing.out(Easing.cubic) : VILLAGE_IN_OUT_SIN,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished && onDone) onDone();
    });
  };

  useEffect(() => {
    if (!allWinsDone) {
      lastWinsCelebrationKey = '';
      clearCelebrationTimers();
      setShowFireworks(false);
      setCelebrationMessage(null);
      burstAnim.setValue(0);
      messageFade.setValue(0);
      return undefined;
    }

    const celebrationKey = mamaWinsTasks.map((t) => `${t.id}:${t.done}`).join('|');
    if (lastWinsCelebrationKey === celebrationKey) return undefined;
    lastWinsCelebrationKey = celebrationKey;

    setShowFireworks(true);
    setCelebrationMessage('cheer');
    burstAnim.setValue(0);
    messageFade.setValue(0);
    fadeCelebrationMessage(1, 750);

    Animated.timing(burstAnim, {
      toValue: 1,
      duration: 4800,
      easing: FIREWORK_BURST_EASING,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    scheduleCelebration(() => {
      fadeCelebrationMessage(0, 600, () => setCelebrationMessage(null));
    }, 2800);

    scheduleCelebration(() => {
      setCelebrationMessage('rest');
      fadeCelebrationMessage(1, 750);
    }, 3550);

    scheduleCelebration(() => {
      fadeCelebrationMessage(0, 700, () => {
        setCelebrationMessage(null);
        setShowFireworks(false);
      });
    }, 6900);

    return () => {
      clearCelebrationTimers();
      burstAnim.stopAnimation();
      messageFade.stopAnimation();
    };
  }, [allWinsDone, mamaWinsTasks, burstAnim, messageFade]);

  return (
    <View style={panelStyle}>
      <View style={styles.dailyTabHeader}>
        <Text style={styles.dailyTabTitle}>✨ Daily Village</Text>
        <Text style={styles.dailyTabSub}>Vibes & mama-first wins — all in one gentle place</Text>
      </View>

      <View style={styles.homeGlassCard}>
        <Text style={styles.homeCardTitle}>🌸 Postpartum Daily Vibe Check</Text>
        <Text style={styles.homeCardHint}>How is your heart today? Tap softly — we remember.</Text>
        <View style={styles.symptomRow}>
          {POSTPARTUM_VIBES.map((vibe) => {
            const active = selectedVibes.includes(vibe.id);
            return (
              <TouchableOpacity
                key={vibe.id}
                style={[styles.vibeChip, active && styles.vibeChipActive]}
                onPress={() => onToggleVibe(vibe.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.symptomEmoji}>{vibe.emoji}</Text>
                <Text style={[styles.symptomLabel, active && styles.vibeLabelActive]}>
                  {vibe.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {vibeHistory.length > 0 ? (
          <View style={styles.symptomHistoryBox}>
            <Text style={styles.symptomHistoryTitle}>Today's vibe log</Text>
            {vibeHistory.slice(0, 5).map((entry) => (
              <Text key={entry.id} style={styles.symptomHistoryLine}>
                {entry.emoji} {entry.label} · {entry.time}
              </Text>
            ))}
          </View>
        ) : null}

        <TherapeuticMealFeed
          meals={therapeuticMeals}
          headline={therapeuticHeadline}
          onOpenKitchen={onOpenKitchen}
        />
      </View>

      <View style={[styles.homeGlassCard, styles.winsCard]}>
        <Text style={styles.homeCardTitle}>📝 Mama-First Daily Wins</Text>
        <Text style={styles.homeCardHint}>Micro-intentions that honor you, not just output</Text>
        <View style={styles.winsCardBody}>
          {mamaWinsTasks.map((task) => (
            <MamaWinRow
              key={task.id}
              task={task}
              onToggle={() => onToggleMamaWin(task.id)}
            />
          ))}
          {showFireworks ? (
            <FireworksBurst
              burstProgress={burstAnim}
              celebrationMessage={celebrationMessage}
              messageFade={messageFade}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function RegistryItemImage({ item, style, emojiStyle, resizeMode = 'cover' }) {
  const [failed, setFailed] = useState(false);

  if (!item?.imageSource || failed) {
    return <Text style={emojiStyle}>{item?.imageEmoji || '🎁'}</Text>;
  }

  return (
    <Image
      source={item.imageSource}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}

/** Home → script wordmark; everything else → village badge */
function RegistryNestListItem({ item, registryVouches, expandedRegistryNotes, onToggleRegistryNotes }) {
  const v = registryVouches?.[item.id] || { count: 0, notes: [] };
  const hasNotes = (v.notes || []).length > 0;
  const isChoice = v.count >= VILLAGE_CHOICE_THRESHOLD;
  const notesOpen = !!expandedRegistryNotes?.[item.id];

  return (
    <View style={styles.registryGridCard}>
      <View style={styles.registryGridThumb}>
        <RegistryItemImage
          item={item}
          style={styles.registryThumbImage}
          emojiStyle={styles.registryGridThumbEmoji}
        />
      </View>
      <Text style={styles.registryGridCategory}>{item.category}</Text>
      <Text style={styles.registryGridTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.registryLinksRow}>
        <TouchableOpacity
          style={[styles.registryLinkPill, styles.registryLinkAmazon]}
          onPress={() => safeOpenUrl(buildAmazonAffiliateUrl(item.links?.amazon))}
          activeOpacity={0.88}
        >
          <Text style={styles.registryLinkText}>📦 Amazon</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.registryLinkPill, styles.registryLinkTarget]}
          onPress={() => safeOpenUrl(item.links?.target)}
          activeOpacity={0.88}
        >
          <Text style={styles.registryLinkText}>🎯 Target</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.registryLinkPill, styles.registryLinkBabylist]}
          onPress={() => safeOpenUrl(item.links?.babylist)}
          activeOpacity={0.88}
        >
          <Text style={styles.registryLinkText}>👶 Baby Registry</Text>
        </TouchableOpacity>
      </View>

      {hasNotes ? (
        <TouchableOpacity
          style={styles.villageChoiceBadge}
          onPress={() => onToggleRegistryNotes(item.id)}
          activeOpacity={0.88}
        >
          <Text style={styles.villageChoiceText}>
            {isChoice ? 'Village Choice ✨' : 'Postpartum wisdom ✨'}
          </Text>
          <Text style={styles.villageChoiceChevron}>{notesOpen ? '▾' : '▸'}</Text>
        </TouchableOpacity>
      ) : null}

      {hasNotes && notesOpen ? (
        <View style={styles.villageChoiceNotes}>
          {(v.notes || []).slice(0, 4).map((n) => (
            <View key={n.id} style={styles.villageChoiceNoteRow}>
              <Text style={styles.villageChoiceNoteAuthor}>{n.author}:</Text>
              <Text style={styles.villageChoiceNoteText}>{n.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function getShowSplitAppHeader(activeTab, inSoulSanctuary) {
  return !(activeTab === 'sanctuary' && inSoulSanctuary);
}

function renderSplitAppHeader(pulseAnim) {
  return (
    <VillageBrandHeader
      logoUri={CALMMAMA_OFFICIAL_LOGO}
      pulseAnim={pulseAnim}
      variant="sanctuary"
      sanctuaryMode
      notchSafe
    />
  );
}

function FlowPanel({ anim, children, embedded }) {
  const flowStyle = getVillageTabFlowStyle(anim);

  return (
    <Animated.View
      style={[embedded ? styles.flowEmbedded : styles.flowFill, flowStyle]}
    >
      {children}
    </Animated.View>
  );
}

function renderMainTabContent({
  activeTab,
  userJourney,
  mamaName,
  weeksPregnant,
  dueDate,
  babyAge,
  nurseryLogs,
  nurseryPerspective,
  onNurseryPerspectiveChange,
  onAddNurseryLog,
  hydrationOz,
  hydrationGoal,
  onHydrationChange,
  recoveryChecks,
  onToggleRecoveryCheck,
  minutesForMe,
  onMinutesForMeChange,
  weightEntries,
  setWeeksPregnant,
  setWeightEntries,
  onOpenBirthPrompt,
  embedded,
  inSoulSanctuary,
  onEnterSoulSanctuary,
  onExitSoulSanctuary,
  journalLogs,
  onSaveJournalEntry,
  selectedSymptoms,
  onToggleSymptom,
  symptomHistory,
  kickSession,
  kickSessionLog,
  onLogKick,
  onSaveKickSession,
  nestingTasks,
  onToggleNestingTask,
  newNestingTask,
  onNewNestingTaskChange,
  onAddNestingTask,
  selectedPostpartumVibes,
  onTogglePostpartumVibe,
  postpartumVibeHistory,
  mamaWinsTasks,
  onToggleMamaWin,
  onOpenVillagePortal,
  pulseAnim,
  mamaBirthday,
  onBirthdayChange,
  approximateCity,
  mamaDiscovery,
  profilePhotoUri,
  onPickProfilePhoto,
  registryDeck,
  registryWishlist,
  onRegistrySkip,
  onRegistrySave,
  registryVouches,
  registryVouchDraft,
  onRegistryVouchDraftChange,
  onRegistryVouch,
  expandedRegistryNotes,
  onToggleRegistryNotes,
  onOpenCandleSanctum,
  onAddToCart,
  kitchenTherapeuticTags,
  onOpenKitchenTab,
  onSaveDiscoveryField,
  kitchenListHeaderPrefix,
}) {
  const panelStyle = embedded ? styles.scrollContent : styles.scrollContentFlex;

  const therapeuticMeals =
    kitchenTherapeuticTags?.length > 0
      ? getTherapeuticMeals(MAMA_KITCHEN_RECIPES, kitchenTherapeuticTags, 6)
      : [];
  const pregnantTherapeuticHeadline = getTherapeuticHeadlineForSymptoms(selectedSymptoms);
  const postpartumTherapeuticHeadline = getTherapeuticHeadlineForVibes(selectedPostpartumVibes);

  if (activeTab === 'home') {
    const currentRegistry = registryDeck?.[0] || null;
    const currentVouch = currentRegistry ? registryVouches?.[currentRegistry.id] : null;
    const currentVouchCount = currentVouch?.count || 0;

    return (
      <View style={panelStyle}>
        <VillagePulseBar userJourney={userJourney} />

        <View style={styles.homeSectionCard}>
          <Text style={styles.homeSectionTitle}>
            {userJourney === 'postpartum' ? '💬 Mamas Seeking Village Wisdom' : '👶 Village Baby Registry Game'}
          </Text>
          <Text style={styles.homeSectionSub}>
            {userJourney === 'postpartum'
              ? 'Pregnant mamas are asking for your real-world advice — vouch and leave a loving note on each item.'
              : 'Postpartum mamas vouch + leave love notes. Pregnant mamas unlock essentials into the Nest below.'}
          </Text>

          {currentRegistry ? (
            userJourney === 'postpartum' ? (
              <View style={styles.registryPostpartumCard}>
                <View style={styles.registryPostpartumBanner}>
                  <Text style={styles.registryPostpartumBannerText}>A pregnant mama is asking for your wisdom</Text>
                </View>
                <View style={styles.registryWidgetTopRow}>
                  <View style={styles.registryPostpartumImage}>
                    <RegistryItemImage
                      item={currentRegistry}
                      style={styles.registryPostpartumImageFill}
                      emojiStyle={styles.registryWidgetEmoji}
                    />
                  </View>
                  <View style={styles.registryWidgetMeta}>
                    <Text style={styles.registryWidgetCategory}>{currentRegistry.category}</Text>
                    <Text style={styles.registryWidgetTitle}>{currentRegistry.title}</Text>
                    <Text style={styles.registryWidgetRating}>
                      {currentVouchCount > 0
                        ? `${currentVouchCount} postpartum mamas vouched`
                        : 'Be the first to share your real-world tip ✨'}
                    </Text>
                  </View>
                </View>

                <View style={styles.registryPostpartumNote}>
                  <Text style={styles.registryWidgetNoteLabel}>
                    From Postpartum Mama {currentRegistry.curatedBy}
                  </Text>
                  <Text style={styles.registryWidgetNoteText}>
                    “{currentRegistry.tip}”
                  </Text>
                </View>

                <View style={styles.registryVouchBox}>
                  <Text style={styles.registryVouchTitle}>Leave a loving note</Text>
                  <TextInput
                    style={styles.registryVouchInput}
                    value={registryVouchDraft}
                    onChangeText={onRegistryVouchDraftChange}
                    placeholder="Your postpartum tip (kind + specific)…"
                    placeholderTextColor="#6E8578"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.registryVouchBtn}
                    onPress={() => onRegistryVouch(currentRegistry.id)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.registryVouchBtnText}>Vouch for this item ✨</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.registryPregnantCard}>
                <View style={styles.registryPregnantHero}>
                  <RegistryItemImage
                    item={currentRegistry}
                    style={styles.registryPregnantHeroImg}
                    emojiStyle={styles.registryPregnantHeroEmoji}
                  />
                </View>
                <Text style={styles.registryPregnantCategory}>{currentRegistry.category}</Text>
                <Text style={styles.registryPregnantTitle}>{currentRegistry.title}</Text>
                <Text style={styles.registryPregnantVouchLine}>
                  {currentVouchCount > 0
                    ? `Vouched by ${currentVouchCount} postpartum mamas in the village`
                    : 'Fresh on the deck — unlock if it feels right for your nest'}
                </Text>

                <View style={styles.registryPregnantNote}>
                  <Text style={styles.registryPregnantNoteLabel}>
                    Village wisdom from {currentRegistry.curatedBy}
                  </Text>
                  <Text style={styles.registryPregnantNoteText} numberOfLines={4}>
                    “{currentRegistry.tip}”
                  </Text>
                </View>

                <View style={styles.registryActionRow}>
                  <TouchableOpacity
                    style={[styles.registryActionBtn, styles.registrySkipBtn]}
                    onPress={() => onRegistrySkip(currentRegistry.id)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.registrySkipIcon}>✕</Text>
                    <Text style={styles.registryActionLabel}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.registryActionBtn, styles.registryUnlockBtn]}
                    onPress={() => onRegistrySave(currentRegistry)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.registryUnlockIcon}>♥</Text>
                    <Text style={styles.registryActionLabel}>Unlock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : (
            <View style={styles.homeEmptyNote}>
              <Text style={styles.homeEmptyNoteText}>
                {userJourney === 'postpartum'
                  ? 'You\'ve shared wisdom on every item today. New mama questions will bloom here soon.'
                  : 'You\'ve explored the village registry deck. Your Nest below keeps everything you unlocked.'}
              </Text>
            </View>
          )}
        </View>

        {userJourney === 'pregnant' ? (
        <View style={styles.registryNestWrap}>
          <Text style={styles.registryNestTitle}>My Village Registry Nest</Text>
          <Text style={styles.registryNestSub}>
            Your unlocked essentials — scroll inside the nest window. Village Choice items include postpartum notes.
          </Text>

          {registryWishlist?.length ? (
            <View style={styles.registryNestScrollWindow}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={styles.registryNestListContent}
              >
                {registryWishlist.map((item) => (
                  <RegistryNestListItem
                    key={String(item.id)}
                    item={item}
                    registryVouches={registryVouches}
                    expandedRegistryNotes={expandedRegistryNotes}
                    onToggleRegistryNotes={onToggleRegistryNotes}
                  />
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.registryNestEmpty}>
              <Text style={styles.registryNestEmptyText}>
                Tap ♥ on the game card to unlock items into your Nest.
              </Text>
            </View>
          )}

          <Text style={styles.registryFtcDisclosure}>
            Disclosure: As an Amazon Associate, CalmMama Village earns a small commission from qualifying purchases.
          </Text>
        </View>
        ) : null}

      </View>
    );
  }

  if (activeTab === 'sanctuary') {
    if (inSoulSanctuary) {
      return (
        <SoulSanctuaryScreen
          mamaName={mamaName}
          onExit={onExitSoulSanctuary}
          journalLogs={journalLogs}
          onSaveJournalEntry={onSaveJournalEntry}
        />
      );
    }

    return (
      <View style={panelStyle}>
        <SoulSanctuaryEntryCard onEnter={onEnterSoulSanctuary} />
      </View>
    );
  }

  if (activeTab === 'daily' && userJourney === 'pregnant') {
    return renderPregnantDailyTracker({
      panelStyle,
      weeksPregnant,
      selectedSymptoms,
      onToggleSymptom,
      symptomHistory,
      kickSession,
      kickSessionLog,
      onLogKick,
      onSaveKickSession,
      nestingTasks,
      onToggleNestingTask,
      newNestingTask,
      onNewNestingTaskChange,
      onAddNestingTask,
      therapeuticMeals,
      therapeuticHeadline: pregnantTherapeuticHeadline,
      onOpenKitchen: onOpenKitchenTab,
    });
  }

  if (activeTab === 'daily' && userJourney === 'postpartum') {
    return (
      <View style={panelStyle}>
        <PostpartumDailyTracker
          panelStyle={styles.postpartumDailyInner}
          selectedVibes={selectedPostpartumVibes}
          onToggleVibe={onTogglePostpartumVibe}
          vibeHistory={postpartumVibeHistory}
          mamaWinsTasks={mamaWinsTasks}
          onToggleMamaWin={onToggleMamaWin}
          therapeuticMeals={therapeuticMeals}
          therapeuticHeadline={postpartumTherapeuticHeadline}
          onOpenKitchen={onOpenKitchenTab}
        />
      </View>
    );
  }

  if (activeTab === 'tracker' && userJourney === 'pregnant') {
    return (
      <View style={panelStyle}>
        <WeeklyBloomScreen
          embedded={embedded}
          initialWeek={weeksPregnant}
          mamaName={mamaName}
          dueDate={dueDate}
          weightEntries={weightEntries}
          onWeekChange={setWeeksPregnant}
          onOpenBirthPrompt={onOpenBirthPrompt}
          onAddWeight={(entry) =>
            setWeightEntries((prev) => {
              const rest = prev.filter((e) => e.week !== entry.week);
              return [...rest, entry].sort((a, b) => a.week - b.week);
            })
          }
        />
      </View>
    );
  }

  if (activeTab === 'nursery' && userJourney === 'postpartum') {
    return (
      <View style={panelStyle}>
        <CloudNurseryScreen
          babyAge={babyAge}
          nurseryLogs={nurseryLogs}
          nurseryPerspective={nurseryPerspective}
          onPerspectiveChange={onNurseryPerspectiveChange}
          onAddLog={onAddNurseryLog}
          hydrationOz={hydrationOz}
          hydrationGoal={hydrationGoal}
          onHydrationChange={onHydrationChange}
          recoveryChecks={recoveryChecks}
          onToggleRecoveryCheck={onToggleRecoveryCheck}
          minutesForMe={minutesForMe}
          onMinutesForMeChange={onMinutesForMeChange}
        />
      </View>
    );
  }

  if (activeTab === 'kitchen') {
    return (
      <MamasKitchenScreen
        therapeuticTags={kitchenTherapeuticTags}
        listHeaderPrefix={kitchenListHeaderPrefix}
      />
    );
  }

  if (activeTab === 'profile') {
    return (
      <View style={panelStyle}>
        <MamaIdentityCard
          mamaName={mamaName}
          mamaBirthday={mamaBirthday}
          onBirthdayChange={onBirthdayChange}
          approximateCity={approximateCity}
          userJourney={userJourney}
          weeksPregnant={weeksPregnant}
          dueDate={dueDate}
          babyAge={babyAge}
          discovery={mamaDiscovery}
          onSaveDiscoveryField={onSaveDiscoveryField}
          profilePhotoUri={profilePhotoUri}
          onPickProfilePhoto={onPickProfilePhoto}
          onOpenVillagePortal={onOpenVillagePortal}
          onOpenCandleSanctum={onOpenCandleSanctum}
          candles={APOTHECARY_CANDLES}
          onGraduation={() => {}}
          showGraduation={false}
        />
      </View>
    );
  }

  return (
    <View style={panelStyle}>
      <Text style={styles.homeSectionTitle}>🏡 Welcome to CalmMama Village</Text>
      <Text style={styles.homeSectionSub}>
        Tap <Text style={{ fontWeight: '800' }}>Home</Text> in the nav bar to open your village dashboard.
      </Text>
    </View>
  );
}

const ABOUT_VILLAGE_COPY =
  'Welcome to your sacred maternal sanctuary. CalmMama Village was built by a community of hearts to guide, protect, and uplift you through every single step of your pregnancy and postpartum blooming journey. You are seen, you are safe, and you are never alone.';

const CONTACT_VILLAGE_COPY =
  'Have a question or need a direct ear? Our village support lines are always open. Reach out to us anytime at founder.calmmamavillage@gmail.com or tap below to send an encrypted village message panel note.';

const LEGAL_PRIVACY_COPY =
  'All wellness tracking notes, journal entries, and sanctuary data utilize secure local device encryption. Your heart-data is never sold to third-party ad networks or data brokers.';

const LEGAL_TERMS_COPY =
  'CalmMama Village maintains a zero-tolerance policy for harassment, hate speech, bullying, and predatory behavior on every community board and village thread. Each post includes 🚨 User Blocking & Reporting flag tools so mamas can shield themselves while moderation reviews reports. By using this app you agree to our End User License Agreement and to treat every mama with dignity.';

const LEGAL_MEDICAL_COPY =
  'CalmMama Village provides wellness tracking and community support. It does not replace professional medical advice, diagnosis, or treatment.';

const INFO_MODAL_TITLES = {
  about: '🌸 About Us',
  contact: '📬 Contact Us',
  legal: '🛡️ Legal & Safety',
};

function SanctuaryCartDrawer({
  visible,
  cart,
  drawerAnim,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onProceedCheckout,
}) {
  if (!visible) return null;

  const subtotal = cart.reduce((sum, line) => {
    const product = getApothecaryProduct(line.productId);
    return sum + getCartLineUnitPrice(product, line) * line.quantity;
  }, 0);
  const subtotalCents = calcCartSubtotalCents(cart);
  const shippingCents = calcShippingCents(subtotalCents);
  const orderTotal = subtotal + shippingCents / 100;

  return (
    <Animated.View style={[styles.cartDrawerBackdrop, { opacity: drawerAnim.opacity }]}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[
          styles.cartDrawerPanel,
          {
            transform: [{ translateX: drawerAnim.translateX }],
          },
        ]}
      >
        <View style={styles.cartDrawerHeader}>
          <Text style={styles.cartDrawerTitle}>🧺 Sanctuary Basket</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.cartDrawerClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.cartDrawerScroll}
          contentContainerStyle={styles.cartDrawerScrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {cart.length === 0 ? (
            <Text style={styles.cartDrawerEmpty}>
              Your Sanctuary Basket is resting empty. Add a hand-poured candle from the Sanctum on Home.
            </Text>
          ) : (
            cart.map((line) => {
              const product = getApothecaryProduct(line.productId);
              if (!product) return null;
              const lineTotal = getCartLineUnitPrice(product, line) * line.quantity;
              const hasDiscount = (line.discountPercent || 0) > 0;
              return (
                <View key={cartLineKey(line.productId, line.size)} style={styles.cartLineCard}>
                  <View style={styles.cartLineTop}>
                    {product.imageSource ? (
                      <Image source={product.imageSource} style={styles.cartLineImage} resizeMode="contain" />
                    ) : null}
                    <View style={styles.cartLineMeta}>
                      <Text style={styles.cartLineTitle}>{product.title}</Text>
                      <Text style={styles.cartLineSize}>{line.size}</Text>
                      <Text style={styles.cartLinePrice}>
                        {hasDiscount
                          ? `${formatUsd(getCartLineUnitPrice(product, line))} each · ${line.discountPercent}% off`
                          : `${formatUsd(product.price)} each`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cartLineActions}>
                    <View style={styles.cartQtyRow}>
                      <TouchableOpacity
                        style={styles.cartQtyBtn}
                        onPress={() => onDecrement(line.productId, line.size)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.cartQtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.cartQtyValue}>{line.quantity}</Text>
                      <TouchableOpacity
                        style={styles.cartQtyBtn}
                        onPress={() => onIncrement(line.productId, line.size)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.cartQtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartLineTotal}>{formatUsd(lineTotal)}</Text>
                    <TouchableOpacity onPress={() => onRemove(line.productId, line.size)} activeOpacity={0.85}>
                      <Text style={styles.cartRemoveText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.cartDrawerFooter}>
          <View style={styles.cartSubtotalRow}>
            <Text style={styles.cartSubtotalLabel}>Subtotal</Text>
            <Text style={styles.cartSubtotalValue}>{formatUsd(subtotal)}</Text>
          </View>
          {cart.length > 0 ? (
            <>
              <View style={styles.cartSubtotalRow}>
                <Text style={styles.cartSubtotalLabel}>Shipping</Text>
                <Text style={styles.cartSubtotalValue}>
                  {shippingCents === 0 ? 'Free' : formatUsd(shippingCents / 100)}
                </Text>
              </View>
              <View style={[styles.cartSubtotalRow, styles.cartTotalRow]}>
                <Text style={styles.cartTotalLabel}>Total</Text>
                <Text style={styles.cartTotalValue}>{formatUsd(orderTotal)}</Text>
              </View>
              <Text style={styles.cartShippingHint}>
                Free shipping on orders over $50 · Candles ship in 3–5 days
              </Text>
            </>
          ) : null}
          <TouchableOpacity
            style={[styles.cartCheckoutBtn, cart.length === 0 && styles.cartCheckoutBtnDisabled]}
            onPress={onProceedCheckout}
            disabled={cart.length === 0}
            activeOpacity={0.88}
          >
            <Text style={styles.cartCheckoutBtnText}>Proceed to Secure Checkout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function CheckoutOverlay({
  visible,
  anim,
  cart,
  shippingAddress,
  onShippingChange,
  checkoutName,
  onCheckoutNameChange,
  checkoutEmail,
  onCheckoutEmailChange,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvc,
  onCardCvcChange,
  paymentPayload,
  checkoutProcessing,
  onClose,
  onPlaceOrder,
}) {
  if (!visible) return null;

  const subtotalCents = paymentPayload?.subtotal || 0;
  const shippingCents = paymentPayload?.shippingCents || 0;
  const subtotalDisplay = formatUsd(subtotalCents / 100);
  const shippingDisplay =
    shippingCents === 0 ? 'Free' : formatUsd(shippingCents / 100);
  const totalDisplay = paymentPayload?.amount
    ? formatUsd(paymentPayload.amount / 100)
    : '$0.00';

  return (
    <Animated.View style={[styles.checkoutOverlay, { opacity: anim.opacity }]}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[
          styles.checkoutCard,
          {
            opacity: anim.opacity,
            transform: [{ scale: anim.scale }, { translateY: anim.translateY }],
          },
        ]}
      >
        <View style={styles.checkoutTopRow}>
          <Text style={styles.checkoutTitle}>💳 Candle Checkout</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.checkoutClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkoutSecurityBanner}>
          <Text style={styles.checkoutSecurityText}>
            🔒 Encrypted checkout — your payment details stay protected.
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.checkoutScrollContent}
        >
          <View style={styles.checkoutSummaryCard}>
            <Text style={styles.checkoutSummaryTitle}>Your ritual order</Text>
            {cart.map((line) => {
              const product = getApothecaryProduct(line.productId);
              if (!product) return null;
              const lineTotal = getCartLineUnitPrice(product, line) * line.quantity;
              const hasDiscount = (line.discountPercent || 0) > 0;
              return (
                <View key={cartLineKey(line.productId, line.size)} style={styles.checkoutLineRow}>
                  {product.imageSource ? (
                    <Image source={product.imageSource} style={styles.checkoutLineImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.checkoutLineMeta}>
                    <Text style={styles.checkoutLineTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.checkoutLineQty}>
                      {line.size} · Qty {line.quantity}
                      {hasDiscount ? ` · ${line.discountPercent}% birthday off` : ''}
                    </Text>
                  </View>
                  <Text style={styles.checkoutLinePrice}>{formatUsd(lineTotal)}</Text>
                </View>
              );
            })}
            <View style={styles.checkoutDivider} />
            <Text style={styles.checkoutSummaryLine}>Subtotal · {subtotalDisplay}</Text>
            <Text style={styles.checkoutSummaryLine}>Shipping · {shippingDisplay}</Text>
            <Text style={styles.checkoutSummaryTotal}>Total · {totalDisplay}</Text>
          </View>

          <Text style={styles.checkoutFieldLabel}>Your name</Text>
          <TextInput
            style={styles.checkoutInput}
            placeholder="Full name for shipping"
            placeholderTextColor="rgba(122, 148, 133, 0.72)"
            value={checkoutName}
            onChangeText={onCheckoutNameChange}
          />

          <Text style={styles.checkoutFieldLabel}>Email</Text>
          <TextInput
            style={styles.checkoutInput}
            placeholder="Order confirmation email"
            placeholderTextColor="rgba(122, 148, 133, 0.72)"
            value={checkoutEmail}
            onChangeText={onCheckoutEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.checkoutFieldLabel}>Shipping address</Text>
          <TextInput
            style={styles.checkoutInput}
            placeholder="Street, city, state, zip"
            placeholderTextColor="rgba(122, 148, 133, 0.72)"
            value={shippingAddress}
            onChangeText={onShippingChange}
            multiline
          />

          <Text style={styles.checkoutFieldLabel}>Card information</Text>
          <TextInput
            style={styles.checkoutInput}
            placeholder="Card number"
            placeholderTextColor="rgba(122, 148, 133, 0.72)"
            value={cardNumber}
            onChangeText={onCardNumberChange}
            keyboardType="number-pad"
          />
          <View style={styles.checkoutCardRow}>
            <TextInput
              style={[styles.checkoutInput, styles.checkoutInputHalf]}
              placeholder="MM/YY"
              placeholderTextColor="rgba(122, 148, 133, 0.72)"
              value={cardExpiry}
              onChangeText={onCardExpiryChange}
            />
            <TextInput
              style={[styles.checkoutInput, styles.checkoutInputHalf]}
              placeholder="CVC"
              placeholderTextColor="rgba(122, 148, 133, 0.72)"
              value={cardCvc}
              onChangeText={onCardCvcChange}
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>

          <Text style={styles.checkoutStripeHint}>
            Village candles ship within 3–5 business days. Free shipping on orders over $50.
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={[styles.checkoutPlaceBtn, checkoutProcessing && styles.checkoutPlaceBtnDisabled]}
          onPress={onPlaceOrder}
          disabled={checkoutProcessing}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutPlaceBtnText}>
            {checkoutProcessing ? 'Processing…' : `Place Order · ${totalDisplay}`}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function VillageInfoModal({
  type,
  contactHeartNote,
  onContactHeartNoteChange,
  onSendHeartNote,
  onDestroyAccount,
  anim,
  onClose,
}) {
  if (!type) return null;

  const isContact = type === 'contact';
  const isLegal = type === 'legal';
  const isAbout = type === 'about';

  return (
    <Animated.View style={[styles.infoModalOverlay, { opacity: anim.opacity }]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.infoModalCard,
          {
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { translateX: anim.translateX },
              { translateY: anim.translateY },
            ],
          },
        ]}
      >
        <View style={styles.infoModalTopRow}>
          <Text style={styles.infoModalTitle}>{INFO_MODAL_TITLES[type] || 'CalmMama Village'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.infoModalClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.infoModalScroll}
          contentContainerStyle={styles.infoModalScrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {isAbout ? <Text style={styles.infoModalBody}>{ABOUT_VILLAGE_COPY}</Text> : null}

          {isContact ? (
            <>
              <Text style={styles.infoModalBody}>{CONTACT_VILLAGE_COPY}</Text>
              <TextInput
                style={styles.infoModalInput}
                placeholder="Type your heart-note to our team here..."
                placeholderTextColor="rgba(122, 148, 133, 0.72)"
                value={contactHeartNote}
                onChangeText={onContactHeartNoteChange}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.infoModalSendBtn} onPress={onSendHeartNote} activeOpacity={0.88}>
                <Text style={styles.infoModalSendText}>Send Note</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {isLegal ? (
            <View style={styles.infoModalLegalSections}>
              <View style={styles.infoModalLegalBlock}>
                <Text style={styles.infoModalLegalHeading}>Privacy Policy</Text>
                <Text style={styles.infoModalBody}>{LEGAL_PRIVACY_COPY}</Text>
              </View>
              <View style={styles.infoModalLegalBlock}>
                <Text style={styles.infoModalLegalHeading}>Terms of Service & EULA</Text>
                <Text style={styles.infoModalBody}>{LEGAL_TERMS_COPY}</Text>
              </View>
              <View style={styles.infoModalLegalBlock}>
                <Text style={styles.infoModalLegalHeading}>Medical Disclaimer</Text>
                <Text style={styles.infoModalBody}>{LEGAL_MEDICAL_COPY}</Text>
              </View>
              <TouchableOpacity onPress={onDestroyAccount} activeOpacity={0.85}>
                <Text style={styles.infoModalDeleteText}>Permanently Delete My Account & Wipe Data</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        <TouchableOpacity style={styles.infoModalDismissBtn} onPress={onClose} activeOpacity={0.88}>
          <Text style={styles.infoModalDismissText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

export default function App() {
  // STATE MANAGEMENT
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userJourney, setUserJourney] = useState('pregnant'); // 'pregnant' or 'postpartum'
  const [activeTab, setActiveTab] = useState('home');
  const [inSoulSanctuary, setInSoulSanctuary] = useState(false);
  
  // USER FIELDS
  const [mamaName, setMamaName] = useState('Mama');
  const [mamaBirthday, setMamaBirthday] = useState(null);
  const [approximateCity, setApproximateCity] = useState('Greater Austin area');
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [mamaDiscovery, setMamaDiscovery] = useState(DEFAULT_MAMA_DISCOVERY);
  const [registryDeck, setRegistryDeck] = useState(() => REGISTRY_INVENTORY.map((item) => ({ ...item })));
  const [registryWishlist, setRegistryWishlist] = useState([]);
  const [registryVouches, setRegistryVouches] = useState(() => {
    const seed = {};
    REGISTRY_INVENTORY.forEach((p) => {
      seed[p.id] = { count: 0, notes: [] };
    });
    return seed;
  });
  const [registryVouchDraft, setRegistryVouchDraft] = useState('');
  const [apothecaryDetailProductId, setApothecaryDetailProductId] = useState(null);
  const apothecaryDetailOpacity = useRef(new Animated.Value(0)).current;
  const apothecaryDetailScale = useRef(new Animated.Value(0.92)).current;
  const apothecaryDetailTranslateX = useRef(new Animated.Value(0)).current;
  const apothecaryDetailTranslateY = useRef(new Animated.Value(18)).current;

  const [candleSanctumOpen, setCandleSanctumOpen] = useState(false);
  const candleSanctumOpacity = useRef(new Animated.Value(0)).current;
  const candleSanctumTranslateY = useRef(new Animated.Value(420)).current;

  const [cart, setCart] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const cartDrawerOpacity = useRef(new Animated.Value(0)).current;
  const cartDrawerTranslateX = useRef(new Animated.Value(320)).current;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutShipping, setCheckoutShipping] = useState('');
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('');
  const [checkoutCardExpiry, setCheckoutCardExpiry] = useState('');
  const [checkoutCardCvc, setCheckoutCardCvc] = useState('');
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState(null);
  const checkoutOpacity = useRef(new Animated.Value(0)).current;
  const checkoutScale = useRef(new Animated.Value(0.9)).current;
  const checkoutTranslateY = useRef(new Animated.Value(24)).current;

  const [birthPromptOpen, setBirthPromptOpen] = useState(false);
  const [birthPromptReason, setBirthPromptReason] = useState('early');
  const [birthPromptDismissed, setBirthPromptDismissed] = useState(false);
  const [birthdayBoutiqueOpen, setBirthdayBoutiqueOpen] = useState(false);
  const [birthdayModalDismissedYear, setBirthdayModalDismissedYear] = useState(null);
  const [remedyPopupSymptomId, setRemedyPopupSymptomId] = useState(null);

  const [infoModalType, setInfoModalType] = useState(null);
  const [contactHeartNote, setContactHeartNote] = useState('');
  const infoModalOpacity = useRef(new Animated.Value(0)).current;
  const infoModalScale = useRef(new Animated.Value(0.88)).current;
  const infoModalTranslateX = useRef(new Animated.Value(-10)).current;
  const infoModalTranslateY = useRef(new Animated.Value(42)).current;
  const [weeksPregnant, setWeeksPregnant] = useState('24');
  const [dueDate, setDueDate] = useState('October 2026');
  const [babyAge, setBabyAge] = useState('2 Months');
  const [nurseryLogs, setNurseryLogs] = useState([]);
  const [nurseryPerspective, setNurseryPerspective] = useState('baby');
  const [hydrationOz, setHydrationOz] = useState(0);
  const [hydrationGoal] = useState(64);
  const [recoveryChecks, setRecoveryChecks] = useState({
    hydration: false,
    sitzBath: false,
    vitamins: false,
    meds: false,
  });
  const [minutesForMe, setMinutesForMe] = useState(0);
  const nurseryLogIdRef = useRef(0);
  const [weightEntries, setWeightEntries] = useState([
    { week: 20, weight: 142 },
    { week: 22, weight: 145 },
    { week: 24, weight: 148 },
  ]);
  const [journalLogs, setJournalLogs] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [kickSession, setKickSession] = useState({ count: 0, startedAt: null });
  const [kickSessionLog, setKickSessionLog] = useState([]);
  const kickLogIdRef = useRef(0);
  const [kitchenTherapeuticTags, setKitchenTherapeuticTags] = useState(null);
  const [nestingTasks, setNestingTasks] = useState(DEFAULT_NESTING_TASKS);
  const [newNestingTask, setNewNestingTask] = useState('');
  const nestingTaskIdRef = useRef(3);
  const symptomLogIdRef = useRef(0);
  const [selectedPostpartumVibes, setSelectedPostpartumVibes] = useState([]);
  const [postpartumVibeHistory, setPostpartumVibeHistory] = useState([]);
  const [mamaWinsTasks, setMamaWinsTasks] = useState(DEFAULT_MAMA_WINS);
  const postpartumVibeLogIdRef = useRef(0);
  const [, setKickTick] = useState(0);
  const [inVillagePortal, setInVillagePortal] = useState(false);
  const [villagePortalTab, setVillagePortalTab] = useState('constellation');
  const [selectedVillageMamaId, setSelectedVillageMamaId] = useState(null);
  const [communityPosts, setCommunityPosts] = useState(() =>
    COMMUNITY_POSTS_SEED.map((post) => ({ ...post, replies: [...(post.replies || [])] }))
  );
  const [expandedThreads, setExpandedThreads] = useState({});
  const [threadDrafts, setThreadDrafts] = useState({});
  const [newCommunityPostDraft, setNewCommunityPostDraft] = useState('');
  const [expandedRegistryNotes, setExpandedRegistryNotes] = useState({});
  const [basketOfferings, setBasketOfferings] = useState(() => [...BASKET_OFFERINGS]);
  const [basketSeeking, setBasketSeeking] = useState(() => [...BASKET_SEEKING]);
  const [newBasketDraft, setNewBasketDraft] = useState('');
  const [basketShareMode, setBasketShareMode] = useState('offering');
  const communityReplyIdRef = useRef(100);
  const communityPostIdRef = useRef(10);
  const basketListingIdRef = useRef(10);

  const showSplitAppHeader = getShowSplitAppHeader(activeTab, inSoulSanctuary);
  const isMobileWeb = useMobileWebLayout();
  const webWrapperStyle = getWebWrapperStyle();
  const iphoneFrameStyle = getIphoneFrameStyle(isMobileWeb);
  const bottomNavStyle = getBottomNavStyle(isMobileWeb);
  const shellFooterLinksStyle = getShellFooterLinksStyle(isMobileWeb);

  useEffect(() => {
    try {
      injectMobileWebViewport();
      injectNurseryWebFonts();
    } catch (fontError) {
      if (Platform.OS === 'web' && typeof console !== 'undefined') {
        console.warn('[CalmMama Village] Web font injection skipped:', fontError);
      }
    }
  }, []);

  useEffect(() => {
    if (!kickSession.startedAt) return undefined;
    const interval = setInterval(() => setKickTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [kickSession.startedAt]);

  useEffect(() => {
    if (userJourney !== 'pregnant' || birthPromptDismissed || birthPromptOpen) return;
    if (isPastDueDate(dueDate, weeksPregnant)) {
      setBirthPromptReason('past-due');
      setBirthPromptOpen(true);
    }
  }, [userJourney, dueDate, weeksPregnant, birthPromptDismissed, birthPromptOpen]);

  useEffect(() => {
    if (!isOnboarded || birthdayBoutiqueOpen || inVillagePortal) return;
    if (!isBirthdayToday(mamaBirthday)) return;
    const year = new Date().getFullYear();
    if (birthdayModalDismissedYear === year) return;

    const timer = setTimeout(() => setBirthdayBoutiqueOpen(true), 900);
    return () => clearTimeout(timer);
  }, [
    isOnboarded,
    mamaBirthday,
    birthdayModalDismissedYear,
    birthdayBoutiqueOpen,
    inVillagePortal,
  ]);

  // BACKGROUND, LOGO & FLOW TRANSITION DRIVERS
  const colorAnim = useRef(new Animated.Value(0)).current;
  const nebulaAnim = useRef(new Animated.Value(0)).current;
  const nebulaLoopRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0.95)).current;
  const pulseLoopRef = useRef(null);
  const shellEnterAnim = useRef(new Animated.Value(1)).current;
  const flowAnim = useRef(new Animated.Value(1)).current;
  const flowReady = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.inOut(Easing.linear),
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 10000,
          easing: Easing.inOut(Easing.linear),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [colorAnim]);

  useEffect(() => {
    startLogoPulseLoop(pulseAnim, pulseLoopRef);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const onVisible = () => {
          if (document.visibilityState === 'visible') {
            startLogoPulseLoop(pulseAnim, pulseLoopRef);
          }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
          pulseLoopRef.current?.stop();
          document.removeEventListener('visibilitychange', onVisible);
        };
      } catch (visibilityError) {
        console.warn('[CalmMama Village] Visibility listener skipped:', visibilityError);
      }
    }

    return () => pulseLoopRef.current?.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (!isOnboarded) return;
    startLogoPulseLoop(pulseAnim, pulseLoopRef);
  }, [activeTab, userJourney, isOnboarded, pulseAnim]);

  useEffect(() => {
    if (!inSoulSanctuary) {
      nebulaLoopRef.current?.stop();
      nebulaAnim.setValue(0);
      return;
    }
    nebulaLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(nebulaAnim, {
          toValue: 1,
          duration: 14000,
          easing: Easing.inOut(Easing.linear),
          useNativeDriver: false,
        }),
        Animated.timing(nebulaAnim, {
          toValue: 0,
          duration: 14000,
          easing: Easing.inOut(Easing.linear),
          useNativeDriver: false,
        }),
      ])
    );
    nebulaLoopRef.current.start();
    return () => nebulaLoopRef.current?.stop();
  }, [inSoulSanctuary, nebulaAnim]);

  useEffect(() => {
    if (activeTab !== 'sanctuary' && inSoulSanctuary) {
      setInSoulSanctuary(false);
    }
  }, [activeTab, inSoulSanctuary]);

  // Gentle rise-in after onboarding — never fade main content to opacity 0
  useEffect(() => {
    if (!isOnboarded) return;
    shellEnterAnim.setValue(0.96);
    Animated.timing(shellEnterAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [isOnboarded, shellEnterAnim]);

  // Journey / onboarding context — fade-in only (tab presses use runVillageTabTransition)
  useEffect(() => {
    if (!isOnboarded) return;
    animateVillageTabFlow(flowAnim, flowReady);
  }, [userJourney, isOnboarded, flowAnim]);

  const runTabTransition = useCallback(
    (nextTab) => {
      if (nextTab === activeTab) return;
      runVillageTabTransition(flowAnim, flowReady, () => {
        setInSoulSanctuary(false);
        setInVillagePortal(false);
        setActiveTab(nextTab);
      });
    },
    [activeTab, flowAnim]
  );

  const shellOpacity = shellEnterAnim;
  const shellLift = shellEnterAnim.interpolate({
    inputRange: [0.9, 1],
    outputRange: [12, 0],
  });

  const handleTogglePostpartumVibe = (vibeId) => {
    const option = POSTPARTUM_VIBES.find((v) => v.id === vibeId);
    if (!option) return;

    setSelectedPostpartumVibes((prev) => {
      const isActive = prev.includes(vibeId);
      const next = isActive ? prev.filter((id) => id !== vibeId) : [...prev, vibeId];
      const tags = collectTherapeuticTagsFromVibes(next);
      setKitchenTherapeuticTags(tags.length ? tags : null);

      if (isActive) {
        return next;
      }
      const now = new Date();
      postpartumVibeLogIdRef.current += 1;
      setPostpartumVibeHistory((history) =>
        [
          {
            id: postpartumVibeLogIdRef.current,
            vibeId,
            emoji: option.emoji,
            label: option.label,
            time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            date: now.toLocaleDateString(),
          },
          ...history,
        ].slice(0, 40)
      );
      return next;
    });
  };

  const handleToggleMamaWin = (taskId) => {
    setMamaWinsTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    );
  };

  const handleRegistrySkip = (productId) => {
    setRegistryDeck((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleRegistrySave = (product) => {
    setRegistryWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, { ...product, savedAt: Date.now() }];
    });
    setRegistryDeck((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleRegistryVouch = (productId) => {
    const note = registryVouchDraft.trim();
    if (!note) return;
    setRegistryVouches((prev) => {
      const next = { ...prev };
      const entry = next[productId] || { count: 0, notes: [] };
      next[productId] = {
        count: entry.count + 1,
        notes: [
          { id: `${productId}-n${entry.count + 1}`, author: mamaName, text: note, ts: Date.now() },
          ...(entry.notes || []),
        ].slice(0, 8),
      };
      return next;
    });
    setRegistryVouchDraft('');
  };

  const cartItemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const handleAddToCart = (productId) => {
    const product = getApothecaryProduct(productId);
    if (!product) return;
    setCart((prev) => {
      const key = cartLineKey(productId, product.size);
      const existing = prev.find((line) => cartLineKey(line.productId, line.size) === key);
      if (existing) {
        return prev.map((line) =>
          cartLineKey(line.productId, line.size) === key
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...prev, { productId, size: product.size, quantity: 1 }];
    });
    if (!cartDrawerOpen) {
      setTimeout(() => handleOpenCartDrawer(), 150);
    }
  };

  const handleOpenCartDrawer = () => {
    setCartDrawerOpen(true);
    cartDrawerOpacity.setValue(0);
    cartDrawerTranslateX.setValue(320);
    Animated.parallel([
      Animated.timing(cartDrawerOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(cartDrawerTranslateX, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const handleCloseCartDrawer = () => {
    Animated.parallel([
      Animated.timing(cartDrawerOpacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(cartDrawerTranslateX, {
        toValue: 320,
        duration: 360,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => setCartDrawerOpen(false));
  };

  const handleIncrementCart = (productId, size) => {
    const key = cartLineKey(productId, size);
    setCart((prev) =>
      prev.map((line) =>
        cartLineKey(line.productId, line.size) === key
          ? { ...line, quantity: line.quantity + 1 }
          : line
      )
    );
  };

  const handleDecrementCart = (productId, size) => {
    const key = cartLineKey(productId, size);
    setCart((prev) =>
      prev
        .map((line) =>
          cartLineKey(line.productId, line.size) === key
            ? { ...line, quantity: line.quantity - 1 }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId, size) => {
    const key = cartLineKey(productId, size);
    setCart((prev) => prev.filter((line) => cartLineKey(line.productId, line.size) !== key));
  };

  const handleOpenCheckout = () => {
    if (!cart.length) return;
    setCartDrawerOpen(false);
    cartDrawerOpacity.setValue(0);
    cartDrawerTranslateX.setValue(320);
    setCheckoutOpen(true);
    checkoutOpacity.setValue(0);
    checkoutScale.setValue(0.9);
    checkoutTranslateY.setValue(24);
    Animated.parallel([
      Animated.timing(checkoutOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(checkoutScale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(checkoutTranslateY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const handleCloseCheckout = () => {
    Animated.parallel([
      Animated.timing(checkoutOpacity, {
        toValue: 0,
        duration: 360,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(checkoutScale, {
        toValue: 0.94,
        duration: 360,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(checkoutTranslateY, {
        toValue: -20,
        duration: 360,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => setCheckoutOpen(false));
  };

  const checkoutPaymentPayload = buildStripePaymentPayload(
    cart,
    checkoutShipping,
    stripePaymentMethodId,
    checkoutName,
    checkoutEmail
  );

  const handlePlaceOrder = async () => {
    if (!checkoutName.trim()) {
      Alert.alert('Almost there', 'Please add your name for shipping.');
      return;
    }
    if (!checkoutEmail.trim() || !checkoutEmail.includes('@')) {
      Alert.alert('Almost there', 'Please add a valid email for your order confirmation.');
      return;
    }
    if (!checkoutShipping.trim()) {
      Alert.alert('Almost there', 'Please add your shipping address.');
      return;
    }
    if (!checkoutCardNumber.trim() || checkoutCardNumber.replace(/\s/g, '').length < 12) {
      Alert.alert('Almost there', 'Please enter your card number.');
      return;
    }
    if (!checkoutCardExpiry.trim() || !checkoutCardCvc.trim()) {
      Alert.alert('Almost there', 'Please enter card expiry and CVC.');
      return;
    }

    const paymentMethodId =
      stripePaymentMethodId ||
      (checkoutCardNumber.trim()
        ? `pm_preview_${checkoutCardNumber.replace(/\s/g, '').slice(-4)}`
        : null);
    const paymentPayload = buildStripePaymentPayload(
      cart,
      checkoutShipping,
      paymentMethodId,
      checkoutName,
      checkoutEmail
    );

    setCheckoutProcessing(true);
    const result = await processStripeCheckout(paymentPayload);

    if (!result.success) {
      setCheckoutProcessing(false);
      if (stripePublishableKey.includes('PLACEHOLDER')) {
        setCart([]);
        setCheckoutName('');
        setCheckoutEmail('');
        setCheckoutShipping('');
        setCheckoutCardNumber('');
        setCheckoutCardExpiry('');
        setCheckoutCardCvc('');
        setStripePaymentMethodId(null);
        handleCloseCheckout();
        playSoftSuccessChime();
        Alert.alert(
          'Order received (preview)',
          'Stripe live keys are not configured yet. Your cart was cleared — production checkout will process payment when wired.'
        );
        return;
      }
      Alert.alert('Payment unavailable', result.error || 'Unable to process payment right now.');
      return;
    }

    setCart([]);
    setCheckoutName('');
    setCheckoutEmail('');
    setCheckoutShipping('');
    setCheckoutCardNumber('');
    setCheckoutCardExpiry('');
    setCheckoutCardCvc('');
    setStripePaymentMethodId(null);
    setCheckoutProcessing(false);
    handleCloseCheckout();
    playSoftSuccessChime();
    Alert.alert('Order placed', 'Thank you, Mama. Your village candle order is on its way.');
  };

  const handleOpenCandleSanctum = () => {
    setCandleSanctumOpen(true);
    candleSanctumOpacity.setValue(0);
    candleSanctumTranslateY.setValue(420);
    Animated.parallel([
      Animated.timing(candleSanctumOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(candleSanctumTranslateY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const handleCloseCandleSanctum = () => {
    Animated.parallel([
      Animated.timing(candleSanctumOpacity, {
        toValue: 0,
        duration: 360,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(candleSanctumTranslateY, {
        toValue: 420,
        duration: 420,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => setCandleSanctumOpen(false));
  };

  const handleOpenApothecaryProduct = (productId) => {
    setApothecaryDetailProductId(productId);
    apothecaryDetailOpacity.setValue(0);
    apothecaryDetailScale.setValue(0.92);
    apothecaryDetailTranslateX.setValue(0);
    apothecaryDetailTranslateY.setValue(18);
    Animated.parallel([
      Animated.timing(apothecaryDetailOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(apothecaryDetailScale, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(apothecaryDetailTranslateY, {
        toValue: 0,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const handleCloseApothecaryProduct = () => {
    Animated.parallel([
      Animated.timing(apothecaryDetailOpacity, {
        toValue: 0,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(apothecaryDetailScale, {
        toValue: 0.94,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(apothecaryDetailTranslateX, {
        toValue: 34,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(apothecaryDetailTranslateY, {
        toValue: -72,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => setApothecaryDetailProductId(null));
  };

  const handleOpenInfoModal = (type) => {
    setInfoModalType(type);
    infoModalOpacity.setValue(0);
    infoModalScale.setValue(0.86);
    infoModalTranslateX.setValue(0);
    infoModalTranslateY.setValue(0);
    Animated.parallel([
      Animated.timing(infoModalOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(infoModalScale, {
        toValue: 1,
        duration: 640,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const handleCloseInfoModal = () => {
    Animated.parallel([
      Animated.timing(infoModalOpacity, {
        toValue: 0,
        duration: 720,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(infoModalScale, {
        toValue: 0.9,
        duration: 720,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(infoModalTranslateX, {
        toValue: 34,
        duration: 720,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(infoModalTranslateY, {
        toValue: -96,
        duration: 720,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      infoModalTranslateX.setValue(0);
      infoModalTranslateY.setValue(0);
      setInfoModalType(null);
    });
  };

  const handleSendHeartNote = () => {
    const note = contactHeartNote.trim();
    if (!note) {
      Alert.alert('Heart-note', 'Share a few words for our team — we are listening.');
      return;
    }
    Alert.alert(
      'Note received',
      'Your village heart-note is queued for our support team. (Preview mode — message not sent yet.)'
    );
    setContactHeartNote('');
  };

  const handleDestroyAccount = () => {
    Alert.alert(
      'Permanently Delete Account?',
      'This wipes all local journals, nursery logs, registry items, and returns you to onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            setInfoModalType(null);
            setInSoulSanctuary(false);
            setInVillagePortal(false);
            setApothecaryDetailProductId(null);
            setCandleSanctumOpen(false);
            setActiveTab('home');
            setUserJourney('pregnant');
            setJournalLogs([]);
            setNurseryLogs([]);
            setRegistryWishlist([]);
            setRegistryDeck(REGISTRY_INVENTORY.map((item) => ({ ...item })));
            setRegistryVouches(() => {
              const seed = {};
              REGISTRY_INVENTORY.forEach((p) => {
                seed[p.id] = { count: 0, notes: [] };
              });
              return seed;
            });
            setExpandedRegistryNotes({});
            setRegistryVouchDraft('');
            setCart([]);
            setCartDrawerOpen(false);
            setCheckoutOpen(false);
            setCheckoutShipping('');
            setCheckoutCardNumber('');
            setCheckoutCardExpiry('');
            setCheckoutCardCvc('');
            setCommunityPosts(
              COMMUNITY_POSTS_SEED.map((post) => ({ ...post, replies: [...(post.replies || [])] }))
            );
            setProfilePhotoUri(null);
            setSelectedSymptoms([]);
            setSymptomHistory([]);
            setKickSession({ count: 0, startedAt: null });
            setNestingTasks(DEFAULT_NESTING_TASKS);
            setSelectedPostpartumVibes([]);
            setPostpartumVibeHistory([]);
            setMamaWinsTasks(DEFAULT_MAMA_WINS);
            setIsOnboarded(false);
          },
        },
      ]
    );
  };

  const handleOpenVillagePortal = () => {
    try {
      configureVillageLayoutTransition();
    } catch (layoutError) {
      if (Platform.OS === 'web' && typeof console !== 'undefined') {
        console.warn('[CalmMama Village] Layout transition skipped on web:', layoutError);
      }
    }
    setVillagePortalTab('constellation');
    setSelectedVillageMamaId(null);
    setInVillagePortal(true);
  };

  const handlePickProfilePhoto = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        const file = event.target?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          Alert.alert('Photo only', 'Please choose an image file for your profile picture.');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setProfilePhotoUri(reader.result);
          }
        };
        reader.onerror = () => {
          Alert.alert('Upload failed', 'We could not read that photo. Please try another image.');
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }
    Alert.alert(
      'Profile photo',
      'Photo upload is available in the web preview. Choose a photo from your device gallery.'
    );
  };

  const handleCloseVillagePortal = () => {
    setInVillagePortal(false);
  };

  const handleToggleThread = (postId) => {
    setExpandedThreads((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleToggleRegistryNotes = (productId) => {
    setExpandedRegistryNotes((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleThreadDraftChange = (postId, text) => {
    setThreadDrafts((prev) => ({ ...prev, [postId]: text }));
  };

  const handleAddBasketListing = () => {
    const detail = newBasketDraft.trim();
    if (!detail) return;
    basketListingIdRef.current += 1;
    const title =
      detail.length > 52 ? `${detail.slice(0, 52).trim()}…` : detail;
    const item = {
      id: `b${basketListingIdRef.current}`,
      title,
      detail,
      tag: basketShareMode === 'offering' ? 'Offering' : 'Seeking',
      sharedBy: mamaName,
    };
    if (basketShareMode === 'offering') {
      setBasketOfferings((prev) => [item, ...prev]);
    } else {
      setBasketSeeking((prev) => [item, ...prev]);
    }
    setNewBasketDraft('');
  };

  const handleAddCommunityPost = () => {
    const body = newCommunityPostDraft.trim();
    if (!body) return;
    communityPostIdRef.current += 1;
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setCommunityPosts((prev) => [
      {
        id: `p${communityPostIdRef.current}`,
        author: mamaName,
        time: `Just now · ${time}`,
        body,
        replies: [],
      },
      ...prev,
    ]);
    setNewCommunityPostDraft('');
  };

  const handleAddThreadReply = (postId) => {
    const text = (threadDrafts[postId] || '').trim();
    if (!text) return;
    communityReplyIdRef.current += 1;
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [
                ...(post.replies || []),
                {
                  id: `r${communityReplyIdRef.current}`,
                  author: mamaName,
                  text,
                  time,
                },
              ],
            }
          : post
      )
    );
    setThreadDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCoordinateBasket = () => {
    alert(
      'Village Support Hub opened — coordinate pickup safely inside the sanctuary. Exact addresses stay encrypted.'
    );
  };

  const handleToggleSymptom = (symptomId) => {
    const option = SANCTUARY_SYMPTOMS.find((s) => s.id === symptomId);
    if (!option) return;

    const isActive = selectedSymptoms.includes(symptomId);
    if (isActive) {
      if (remedyPopupSymptomId === symptomId) {
        setRemedyPopupSymptomId(null);
      }
      const next = selectedSymptoms.filter((id) => id !== symptomId);
      setSelectedSymptoms(next);
      const tags = collectTherapeuticTagsFromSymptoms(next);
      setKitchenTherapeuticTags(tags.length ? tags : null);
      return;
    }

    setRemedyPopupSymptomId(symptomId);
    const now = new Date();
    symptomLogIdRef.current += 1;
    setSymptomHistory((history) =>
      [
        {
          id: symptomLogIdRef.current,
          symptomId,
          emoji: option.emoji,
          label: option.label,
          time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          date: now.toLocaleDateString(),
        },
        ...history,
      ].slice(0, 40)
    );
    const next = [...selectedSymptoms, symptomId];
    setSelectedSymptoms(next);
    const tags = collectTherapeuticTagsFromSymptoms(next);
    setKitchenTherapeuticTags(tags.length ? tags : null);
  };

  const handleLogKick = () => {
    setKickSession((prev) => ({
      count: prev.count + 1,
      startedAt: prev.startedAt ?? Date.now(),
    }));
  };

  const handleSaveKickSession = () => {
    setKickSession((prev) => {
      if (prev.count > 0 && prev.startedAt) {
        const now = Date.now();
        kickLogIdRef.current += 1;
        const trimester = getPregnancyTrimester(weeksPregnant);
        setKickSessionLog((log) =>
          [
            {
              id: kickLogIdRef.current,
              count: prev.count,
              durationMs: now - prev.startedAt,
              goal: trimester === 3 ? 10 : trimester === 2 ? 6 : 4,
              week: weeksPregnant,
              trimester,
              savedAt: now,
              dateLabel: new Date(now).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              }),
              timeLabel: new Date(now).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              }),
            },
            ...log,
          ].slice(0, 40)
        );
      }
      return { count: 0, startedAt: null };
    });
  };

  const handleSaveDiscoveryField = (fieldId, value) => {
    setMamaDiscovery((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleBirthdayChange = (birthday) => {
    setMamaBirthday(birthday);
  };

  const handleCloseBirthdayBoutique = () => {
    setBirthdayBoutiqueOpen(false);
    setBirthdayModalDismissedYear(new Date().getFullYear());
  };

  const handleFinalizeBirthdayGoodies = ({ productIds, discountPercent }) => {
    if (!productIds?.length) return;

    setCart((prev) => {
      let next = [...prev];
      productIds.forEach((productId) => {
        const product = getApothecaryProduct(productId);
        if (!product) return;
        const key = cartLineKey(productId, product.size);
        const existing = next.find(
          (line) =>
            cartLineKey(line.productId, line.size) === key &&
            (line.discountPercent || 0) === (discountPercent || 0)
        );
        if (existing) {
          next = next.map((line) =>
            line === existing ? { ...line, quantity: line.quantity + 1 } : line
          );
        } else {
          next.push({
            productId,
            size: product.size,
            quantity: 1,
            discountPercent: discountPercent || 0,
            birthdayBundle: true,
          });
        }
      });
      return next;
    });

    setBirthdayBoutiqueOpen(false);
    setBirthdayModalDismissedYear(new Date().getFullYear());
    setCartDrawerOpen(false);
    setTimeout(() => handleOpenCheckout(), 200);
  };

  const handleOpenKitchenTab = () => {
    runTabTransition('kitchen');
  };

  const handleToggleNestingTask = (taskId) => {
    setNestingTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    );
  };

  const handleAddNestingTask = () => {
    const text = newNestingTask.trim();
    if (!text) return;
    nestingTaskIdRef.current += 1;
    setNestingTasks((prev) => [...prev, { id: nestingTaskIdRef.current, text, done: false }]);
    setNewNestingTask('');
  };

  const appendNurseryLog = (entry) => {
    const now = new Date();
    nurseryLogIdRef.current += 1;
    setNurseryLogs((prev) => [
      {
        id: nurseryLogIdRef.current,
        timestamp: now.getTime(),
        time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        category: entry.category || nurseryPerspective,
        type: entry.type,
        notes: entry.notes,
      },
      ...prev,
    ]);
  };

  const handleToggleRecoveryCheck = (key, next) => {
    setRecoveryChecks((prev) => ({ ...prev, [key]: next }));
  };

  const handleGraduationSwitch = () => {
    setBirthPromptOpen(false);
    setUserJourney('postpartum');
    setActiveTab('nursery');
    setBabyAge('Newborn');
    Alert.alert(
      '🌟 Welcome to Postpartum',
      'Your Cloud Nursery tracker is now live. We are so glad you and baby are here.'
    );
  };

  const handleOpenBirthPrompt = () => {
    setBirthPromptReason('early');
    setBirthPromptOpen(true);
  };

  const handleDismissBirthPrompt = () => {
    setBirthPromptOpen(false);
    setBirthPromptDismissed(true);
  };

  const handleCompleteOnboarding = () => {
    setIsOnboarded(true);
  };

  // 📋 ONBOARDING VIEW ENGINE
  if (!isOnboarded) {
    return (
      <View style={[styles.webWrapper, webWrapperStyle]}>
        <View style={[styles.iphoneFrame, iphoneFrameStyle]}>
          <StatusBar barStyle="dark-content" />
          {Platform.OS === 'web' ? <View style={styles.iphoneNotch} /> : null}
          
          <CalmMamaOmbreBackdrop phaseAnim={colorAnim} />

          <SafeAreaView style={styles.screenForeground}>
            <ScrollView
              style={styles.transparentScroll}
              contentContainerStyle={styles.onboardingScroll}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <VillageBrandHeader
                logoUri={CALMMAMA_VILLAGE_BADGE}
                pulseAnim={pulseAnim}
                variant="onboarding"
              />

              <Text style={[styles.obWelcomeTitle, ONBOARDING_WELCOME_FONT]}>Welcome, beautiful mama</Text>
              <Text style={[styles.obWelcomeSub, ONBOARDING_SERIF]}>
                A soft sanctuary for your pregnancy and postpartum journey — curated with love.
              </Text>

              <Text style={[styles.obSectionLabel, ONBOARDING_SERIF]}>Tell us where you are</Text>
              <View style={styles.obPersonaRow}>
                <TouchableOpacity
                  style={[styles.obPersonaCard, userJourney === 'pregnant' && styles.obPersonaCardActive]}
                  onPress={() => setUserJourney('pregnant')}
                  activeOpacity={0.9}
                >
                  <View style={styles.obPersonaOrb}>
                    <Text style={styles.obPersonaEmoji}>🤰</Text>
                  </View>
                  <Text style={[styles.obPersonaLabel, userJourney === 'pregnant' && styles.obPersonaLabelActive]}>
                    Pregnant
                  </Text>
                  <Text style={styles.obPersonaHint}>Bloom week by week</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.obPersonaCard, userJourney === 'postpartum' && styles.obPersonaCardActive]}
                  onPress={() => setUserJourney('postpartum')}
                  activeOpacity={0.9}
                >
                  <View style={styles.obPersonaOrb}>
                    <Text style={styles.obPersonaEmoji}>👶</Text>
                  </View>
                  <Text style={[styles.obPersonaLabel, userJourney === 'postpartum' && styles.obPersonaLabelActive]}>
                    Postpartum
                  </Text>
                  <Text style={styles.obPersonaHint}>Cloud nursery & recovery</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.glassFormGroup}>
                <Text style={[styles.obFormTitle, ONBOARDING_SERIF]}>Your village profile</Text>
                <Text style={styles.formLabel}>Mama nickname</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="What should we call you?"
                  placeholderTextColor="#8A9E92"
                  onChangeText={setMamaName}
                />

                {userJourney === 'pregnant' ? (
                  <View>
                    <Text style={styles.formLabel}>Weeks pregnant</Text>
                    <TextInput
                      style={styles.formInput}
                      defaultValue={weeksPregnant}
                      keyboardType="numeric"
                      onChangeText={setWeeksPregnant}
                    />
                    <Text style={styles.formLabel}>Estimated due date</Text>
                    <TextInput style={styles.formInput} defaultValue={dueDate} onChangeText={setDueDate} />
                  </View>
                ) : (
                  <View>
                    <Text style={styles.formLabel}>Baby&apos;s current age</Text>
                    <TextInput style={styles.formInput} defaultValue={babyAge} onChangeText={setBabyAge} />
                  </View>
                )}
              </View>

              <View style={styles.secureDetailsBox}>
                <Text style={styles.secureDetailsIcon}>🔒</Text>
                <Text style={styles.secureDetailsText}>On-device encryption vault active</Text>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCompleteOnboarding}
                activeOpacity={0.92}
                accessibilityRole="button"
              >
                <Text style={styles.submitBtnText}>Welcome to the Village</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bypassLink}
                onPress={handleCompleteOnboarding}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.bypassLinkText}>Skip for now — let me browse first →</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  // 🏡 PRIMARY SANCTUARY DASHBOARD SCREEN SHELL
  const mainTabContentProps = {
    activeTab,
    userJourney,
    mamaName,
    weeksPregnant,
    dueDate,
    babyAge,
    nurseryLogs,
    nurseryPerspective,
    onNurseryPerspectiveChange: setNurseryPerspective,
    onAddNurseryLog: appendNurseryLog,
    hydrationOz,
    hydrationGoal,
    onHydrationChange: setHydrationOz,
    recoveryChecks,
    onToggleRecoveryCheck: handleToggleRecoveryCheck,
    minutesForMe,
    onMinutesForMeChange: setMinutesForMe,
    weightEntries,
    setWeeksPregnant,
    setWeightEntries,
    onOpenBirthPrompt: handleOpenBirthPrompt,
    embedded: true,
    inSoulSanctuary,
    onEnterSoulSanctuary: () => setInSoulSanctuary(true),
    onExitSoulSanctuary: () => setInSoulSanctuary(false),
    journalLogs,
    onSaveJournalEntry: (entry) =>
      setJournalLogs((prev) =>
        [...prev, entry]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 30)
      ),
    selectedSymptoms,
    onToggleSymptom: handleToggleSymptom,
    symptomHistory,
    kickSession,
    kickSessionLog,
    onLogKick: handleLogKick,
    onSaveKickSession: handleSaveKickSession,
    nestingTasks,
    onToggleNestingTask: handleToggleNestingTask,
    newNestingTask,
    onNewNestingTaskChange: setNewNestingTask,
    onAddNestingTask: handleAddNestingTask,
    selectedPostpartumVibes,
    onTogglePostpartumVibe: handleTogglePostpartumVibe,
    postpartumVibeHistory,
    mamaWinsTasks,
    onToggleMamaWin: handleToggleMamaWin,
    onOpenVillagePortal: handleOpenVillagePortal,
    pulseAnim,
    mamaBirthday,
    onBirthdayChange: handleBirthdayChange,
    approximateCity,
    mamaDiscovery,
    profilePhotoUri,
    onPickProfilePhoto: handlePickProfilePhoto,
    registryDeck,
    registryWishlist,
    onRegistrySkip: handleRegistrySkip,
    onRegistrySave: handleRegistrySave,
    registryVouches,
    registryVouchDraft,
    onRegistryVouchDraftChange: setRegistryVouchDraft,
    onRegistryVouch: handleRegistryVouch,
    expandedRegistryNotes,
    onToggleRegistryNotes: handleToggleRegistryNotes,
    onOpenCandleSanctum: handleOpenCandleSanctum,
    onAddToCart: handleAddToCart,
    kitchenTherapeuticTags,
    onOpenKitchenTab: handleOpenKitchenTab,
    onSaveDiscoveryField: handleSaveDiscoveryField,
    kitchenListHeaderPrefix: showSplitAppHeader
      ? renderSplitAppHeader(pulseAnim)
      : null,
  };

  return (
    <View style={[styles.webWrapper, webWrapperStyle]}>
      <View style={[styles.iphoneFrame, iphoneFrameStyle]}>
        <StatusBar barStyle={inSoulSanctuary && activeTab === 'sanctuary' ? 'light-content' : 'dark-content'} />
        {Platform.OS === 'web' ? <View style={styles.iphoneNotch} /> : null}
        {inSoulSanctuary && activeTab === 'sanctuary' && !inVillagePortal ? (
          <CosmicNebulaBackdrop phaseAnim={nebulaAnim} />
        ) : (
          <CalmMamaOmbreBackdrop phaseAnim={colorAnim} />
        )}

        <SafeAreaView style={styles.screenForeground}>
          <View style={styles.shellLayout}>
            {inVillagePortal ? (
              <VillageCommunityPortal
                villageLogoUri={CALMMAMA_OFFICIAL_LOGO}
                pulseAnim={pulseAnim}
                villagePortalTab={villagePortalTab}
                onVillagePortalTabChange={setVillagePortalTab}
                onClose={handleCloseVillagePortal}
                communityPosts={communityPosts}
                expandedThreads={expandedThreads}
                threadDrafts={threadDrafts}
                newPostDraft={newCommunityPostDraft}
                onNewPostDraftChange={setNewCommunityPostDraft}
                onAddCommunityPost={handleAddCommunityPost}
                onToggleThread={handleToggleThread}
                onThreadDraftChange={handleThreadDraftChange}
                onAddThreadReply={handleAddThreadReply}
                onCoordinateBasket={handleCoordinateBasket}
                basketOfferings={basketOfferings}
                basketSeeking={basketSeeking}
                newBasketDraft={newBasketDraft}
                onNewBasketDraftChange={setNewBasketDraft}
                basketShareMode={basketShareMode}
                onBasketShareModeChange={setBasketShareMode}
                onAddBasketListing={handleAddBasketListing}
                selectedVillageMamaId={selectedVillageMamaId}
                onSelectVillageMama={setSelectedVillageMamaId}
              />
            ) : (
              <View style={styles.mainShell}>
                <Animated.View
                  style={[
                    styles.mainShellBody,
                    { opacity: shellOpacity, transform: [{ translateY: shellLift }] },
                  ]}
                >
                  {activeTab === 'kitchen' ? (
                    <FlowPanel anim={flowAnim} embedded={false}>
                      {renderMainTabContent(mainTabContentProps)}
                    </FlowPanel>
                  ) : (
                    <ScrollView
                      style={styles.mainScroll}
                      contentContainerStyle={styles.mainScrollContent}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                    >
                      {showSplitAppHeader
                        ? renderSplitAppHeader(pulseAnim)
                        : null}
                      <FlowPanel anim={flowAnim} embedded>
                        {renderMainTabContent(mainTabContentProps)}
                      </FlowPanel>
                    </ScrollView>
                  )}
                </Animated.View>
              </View>
            )}

            {(activeTab === 'home' || activeTab === 'profile' || candleSanctumOpen) && !inVillagePortal ? (
              <TouchableOpacity
                style={styles.homeCartFloating}
                onPress={handleOpenCartDrawer}
                activeOpacity={0.85}
              >
                <Text style={styles.homeCartIcon}>🧺</Text>
                {cartItemCount > 0 ? (
                  <View style={styles.homeCartBadge}>
                    <Text style={styles.homeCartBadgeText}>
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}

            <View style={[styles.shellFooterLinks, shellFooterLinksStyle]}>
              <TouchableOpacity onPress={() => handleOpenInfoModal('about')} activeOpacity={0.75}>
                <Text style={styles.shellFooterLinkText}>About Us</Text>
              </TouchableOpacity>
              <Text style={styles.shellFooterDot}>•</Text>
              <TouchableOpacity onPress={() => handleOpenInfoModal('contact')} activeOpacity={0.75}>
                <Text style={styles.shellFooterLinkText}>Contact Us</Text>
              </TouchableOpacity>
              <Text style={styles.shellFooterDot}>•</Text>
              <TouchableOpacity onPress={() => handleOpenInfoModal('legal')} activeOpacity={0.75}>
                <Text style={styles.shellFooterLinkText}>Legal & Safety</Text>
              </TouchableOpacity>
            </View>

            <SanctuaryCartDrawer
              visible={cartDrawerOpen}
              cart={cart}
              drawerAnim={{
                opacity: cartDrawerOpacity,
                translateX: cartDrawerTranslateX,
              }}
              onClose={handleCloseCartDrawer}
              onIncrement={handleIncrementCart}
              onDecrement={handleDecrementCart}
              onRemove={handleRemoveFromCart}
              onProceedCheckout={handleOpenCheckout}
            />

            <VillageCandleSanctumLayer
              visible={candleSanctumOpen}
              candles={APOTHECARY_CANDLES}
              anim={{
                opacity: candleSanctumOpacity,
                translateY: candleSanctumTranslateY,
              }}
              onClose={handleCloseCandleSanctum}
              onSelectCandle={handleOpenApothecaryProduct}
              onAddToCart={handleAddToCart}
              onOpenCart={handleOpenCartDrawer}
              cartItemCount={cartItemCount}
            />

            <BirthGraduationPrompt
              visible={birthPromptOpen && userJourney === 'pregnant'}
              reason={birthPromptReason}
              onConfirm={handleGraduationSwitch}
              onDismiss={handleDismissBirthPrompt}
            />

            <BirthdayBoutiqueModal
              visible={birthdayBoutiqueOpen && isOnboarded && !inVillagePortal}
              mamaName={mamaName}
              candles={APOTHECARY_CANDLES}
              scrubs={APOTHECARY_SCRUBS}
              onClose={handleCloseBirthdayBoutique}
              onFinalize={handleFinalizeBirthdayGoodies}
            />

            <VillageRemedyPopup
              symptom={SANCTUARY_SYMPTOMS.find((s) => s.id === remedyPopupSymptomId) || null}
              visible={
                Boolean(remedyPopupSymptomId) &&
                activeTab === 'daily' &&
                userJourney === 'pregnant' &&
                !inVillagePortal
              }
              onDismissed={() => setRemedyPopupSymptomId(null)}
            />

            {apothecaryDetailProductId ? (
              <ApothecaryProductDetailModal
                product={getApothecaryProduct(apothecaryDetailProductId)}
                anim={{
                  opacity: apothecaryDetailOpacity,
                  scale: apothecaryDetailScale,
                  translateX: apothecaryDetailTranslateX,
                  translateY: apothecaryDetailTranslateY,
                }}
                onClose={handleCloseApothecaryProduct}
                onAddToCart={handleAddToCart}
              />
            ) : null}

            <CheckoutOverlay
              visible={checkoutOpen}
              anim={{
                opacity: checkoutOpacity,
                scale: checkoutScale,
                translateY: checkoutTranslateY,
              }}
              cart={cart}
              shippingAddress={checkoutShipping}
              onShippingChange={setCheckoutShipping}
              checkoutName={checkoutName}
              onCheckoutNameChange={setCheckoutName}
              checkoutEmail={checkoutEmail}
              onCheckoutEmailChange={setCheckoutEmail}
              cardNumber={checkoutCardNumber}
              onCardNumberChange={setCheckoutCardNumber}
              cardExpiry={checkoutCardExpiry}
              onCardExpiryChange={setCheckoutCardExpiry}
              cardCvc={checkoutCardCvc}
              onCardCvcChange={setCheckoutCardCvc}
              paymentPayload={checkoutPaymentPayload}
              checkoutProcessing={checkoutProcessing}
              onClose={handleCloseCheckout}
              onPlaceOrder={handlePlaceOrder}
            />

            {infoModalType ? (
              <VillageInfoModal
                type={infoModalType}
                contactHeartNote={contactHeartNote}
                onContactHeartNoteChange={setContactHeartNote}
                onSendHeartNote={handleSendHeartNote}
                onDestroyAccount={handleDestroyAccount}
                onClose={handleCloseInfoModal}
                anim={{
                  opacity: infoModalOpacity,
                  scale: infoModalScale,
                  translateX: infoModalTranslateX,
                  translateY: infoModalTranslateY,
                }}
              />
            ) : null}

            <View style={[styles.bottomNav, bottomNavStyle]}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => runTabTransition('home')}
            >
              <Text style={[styles.navIcon, activeTab === 'home' && styles.activeText]}>🏡</Text>
              <Text style={[styles.navText, activeTab === 'home' && styles.activeText]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => runTabTransition('kitchen')}
            >
              <Text style={[styles.navIcon, activeTab === 'kitchen' && styles.activeText]}>🍳</Text>
              <Text style={[styles.navText, activeTab === 'kitchen' && styles.activeText]}>Kitchen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => runTabTransition('sanctuary')}
            >
              <Text style={[styles.navIcon, activeTab === 'sanctuary' && styles.activeText]}>🕊️</Text>
              <Text style={[styles.navText, activeTab === 'sanctuary' && styles.activeText]}>Sanctuary</Text>
            </TouchableOpacity>

            {userJourney === 'pregnant' ? (
              <>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => runTabTransition('daily')}
                >
                  <Text style={[styles.navIcon, activeTab === 'daily' && styles.activeText]}>✨</Text>
                  <Text style={[styles.navText, activeTab === 'daily' && styles.activeText]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => runTabTransition('tracker')}
                >
                  <Text style={[styles.navIcon, activeTab === 'tracker' && styles.activeText]}>🌱</Text>
                  <Text style={[styles.navText, activeTab === 'tracker' && styles.activeText]}>Bloom</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => runTabTransition('daily')}
                >
                  <Text style={[styles.navIcon, activeTab === 'daily' && styles.activeText]}>✨</Text>
                  <Text style={[styles.navText, activeTab === 'daily' && styles.activeText]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => runTabTransition('nursery')}
                >
                  <Text style={[styles.navIcon, activeTab === 'nursery' && styles.activeText]}>☁️</Text>
                  <Text style={[styles.navText, activeTab === 'nursery' && styles.activeText]}>Nursery</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.navItem} onPress={() => runTabTransition('profile')}>
              <Text style={[styles.navIcon, activeTab === 'profile' && styles.activeText]}>👤</Text>
              <Text style={[styles.navText, activeTab === 'profile' && styles.activeText]}>Me</Text>
            </TouchableOpacity>
          </View>
          </View>

        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // CONTAINER SHELL DEFINITIONS
  webWrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        backgroundColor: '#BAC6BC',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        height: '100dvh',
        overflow: 'hidden',
      },
      default: {
        width: '100%',
        backgroundColor: 'transparent',
      },
    }),
  },
  iphoneFrame: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    ...Platform.select({
      web: {
        width: 355,
        minHeight: '92dvh',
        height: '92dvh',
        maxHeight: 750,
        borderRadius: 40,
        borderWidth: 10,
        borderColor: '#242424',
      },
      default: {
        flex: 1,
        width: '100%',
        borderRadius: 0,
        borderWidth: 0,
        maxHeight: undefined,
      },
    }),
  },
  iphoneNotch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -45 }],
    width: 90,
    height: 22,
    backgroundColor: '#242424',
    borderRadius: 12,
    zIndex: 999,
  },

  screenForeground: {
    flex: 1,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  shellLayout: {
    flex: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { position: 'relative', minHeight: 0 },
      default: {},
    }),
  },
  mainShell: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 16px))',
      },
      default: {},
    }),
  },
  mainShellBody: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  mainScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainScrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        paddingBottom: 'calc(104px + env(safe-area-inset-bottom, 16px))',
      },
      default: {
        paddingBottom: 104,
      },
    }),
  },
  flowFill: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  flowEmbedded: {
    backgroundColor: 'transparent',
  },
  homeIntroCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.42)',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.48)',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 10px 26px rgba(92, 122, 104, 0.08)' },
      default: { elevation: 3 },
    }),
  },
  homeIntroEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: '#5C7A68',
    letterSpacing: 0.7,
  },
  homeIntroTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '900',
    color: '#2A382E',
  },
  homeIntroSub: {
    marginTop: 8,
    fontSize: 11,
    color: '#4A5C50',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  homeSectionCard: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.28)',
    marginBottom: 12,
  },
  homeSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2A382E',
  },
  homeSectionSub: {
    marginTop: 6,
    fontSize: 11,
    color: '#4A5C50',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  homeEmptyNote: {
    backgroundColor: 'rgba(210, 190, 225, 0.28)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.22)',
  },
  homeEmptyNoteText: {
    fontSize: 11,
    color: '#3D5246',
    lineHeight: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  apothecaryPanel: {
    backgroundColor: 'rgba(210, 190, 225, 0.32)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.28)',
    marginBottom: 14,
    ...Platform.select({
      web: { boxShadow: '0 10px 26px rgba(139, 116, 168, 0.12)' },
      default: { elevation: 3 },
    }),
  },
  apothecaryPanelHint: {
    fontSize: 11,
    color: '#6E8578',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 16,
  },
  candleSanctumPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  candleSanctumPreviewTile: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
    alignItems: 'center',
  },
  candleSanctumPreviewImage: {
    width: '100%',
    height: 72,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(210, 190, 225, 0.12)',
  },
  candleSanctumPreviewLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4A5E52',
    textAlign: 'center',
    lineHeight: 13,
  },
  candleSanctumEntryCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C7A68',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  candleSanctumOverlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(36, 48, 40, 0.52)',
    zIndex: 1120,
    justifyContent: 'flex-end',
  },
  candleSanctumSheet: {
    height: '92%',
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(186, 152, 138, 0.35)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 -12px 40px rgba(92, 122, 104, 0.18)',
      },
      default: { elevation: 16 },
    }),
  },
  candleSanctumHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(186, 198, 188, 0.35)',
  },
  candleSanctumHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  candleSanctumHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  candleSanctumCartBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
  },
  candleSanctumCartIcon: {
    fontSize: 16,
  },
  candleSanctumCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C46B5A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  candleSanctumCartBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  candleSanctumEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#8B74A8',
  },
  candleSanctumTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: '#2A382E',
  },
  candleSanctumSub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#5C7A68',
    fontStyle: 'italic',
  },
  candleSanctumClose: {
    fontSize: 20,
    fontWeight: '800',
    color: '#B8958A',
  },
  candleSanctumScroll: {
    flex: 1,
  },
  candleSanctumScrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  candleSanctumCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
    overflow: 'hidden',
  },
  candleSanctumCardImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(210, 190, 225, 0.12)',
  },
  candleSanctumCardBody: {
    padding: 18,
  },
  candleSanctumCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A382E',
    marginBottom: 6,
  },
  candleSanctumCardMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C7A68',
    marginBottom: 8,
  },
  candleSanctumCardScent: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4A5C50',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  candleSanctumCardCta: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B74A8',
  },
  candleSanctumQuickAdd: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: '#5C7A68',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  candleSanctumQuickAddText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  candleSanctumFooterNote: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(210, 190, 225, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.2)',
  },
  candleSanctumFooterText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#5C7A68',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  apothecaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  apothecaryGridCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
    overflow: 'hidden',
  },
  apothecaryGridTapArea: {
    flex: 1,
  },
  apothecaryGridImage: {
    width: '100%',
    height: 96,
    borderRadius: 12,
    backgroundColor: 'rgba(210, 190, 225, 0.15)',
    marginBottom: 10,
  },
  apothecaryGridBody: {
    paddingBottom: 8,
  },
  apothecaryGridTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2A382E',
    lineHeight: 15,
    minHeight: 32,
  },
  apothecaryGridMeta: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#5C7A68',
  },
  apothecaryGridAddBtn: {
    marginTop: 6,
    backgroundColor: 'rgba(186, 214, 198, 0.45)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
  },
  apothecaryGridAddText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3D5246',
  },
  apothecaryDetailModal: {
    width: '92%',
    maxWidth: 340,
    maxHeight: '84%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 252, 248, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 152, 138, 0.38)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 24px 56px rgba(92, 122, 104, 0.22)',
      },
      default: { elevation: 14 },
    }),
  },
  apothecaryDetailVideoWrap: {
    height: 180,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#87CEEB',
  },
  apothecaryDetailVideo: {
    width: '100%',
    height: '100%',
  },
  apothecaryDetailVideoWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 220, 190, 0.28)',
  },
  apothecaryDetailHeroImage: {
    width: '100%',
    height: 220,
    backgroundColor: 'rgba(210, 190, 225, 0.12)',
  },
  apothecaryDetailScroll: {
    maxHeight: 280,
  },
  apothecaryDetailScrollContent: {
    padding: 18,
  },
  apothecaryDetailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  apothecaryDetailTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#2A382E',
    paddingRight: 8,
  },
  apothecaryDetailTitlePeach: {
    color: '#9A5C42',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  apothecaryDetailTitleLavender: {
    color: '#6B5A8E',
  },
  apothecaryDetailSizePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C7A68',
    marginBottom: 12,
  },
  apothecaryDetailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8B74A8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  apothecaryDetailScent: {
    fontSize: 13,
    lineHeight: 20,
    color: '#3D5246',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  apothecaryDetailRitual: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4A5C50',
    marginBottom: 8,
  },
  apothecaryDetailAddBtn: {
    margin: 18,
    marginTop: 0,
    backgroundColor: '#5C7A68',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  apothecaryDetailAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  apothecaryEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8B74A8',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  apothecaryTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '900',
    color: '#2A382E',
  },
  apothecaryPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  apothecaryPreviewTile: {
    flex: 1,
    backgroundColor: 'rgba(255, 252, 248, 0.55)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
  },
  apothecaryPreviewEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  apothecaryPreviewText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3D5246',
    textAlign: 'center',
    lineHeight: 14,
  },
  apothecaryCta: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#5C7A68',
    textAlign: 'center',
  },
  apothecaryOverlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(42, 56, 46, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    zIndex: 999,
  },
  apothecaryDetailOverlay: {
    zIndex: 1180,
  },
  apothecaryModal: {
    width: '100%',
    maxHeight: '78%',
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 116, 168, 0.38)',
    ...Platform.select({
      web: { boxShadow: '0 18px 46px rgba(92, 122, 104, 0.24)' },
      default: { elevation: 10 },
    }),
  },
  apothecaryModalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  apothecaryModalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2A382E',
  },
  apothecaryClose: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8B74A8',
  },
  apothecaryProductCard: {
    backgroundColor: 'rgba(210, 190, 225, 0.22)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.22)',
    marginBottom: 12,
  },
  apothecaryProductTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  apothecaryProductImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 252, 248, 0.7)',
  },
  apothecaryProductMeta: {
    flex: 1,
  },
  apothecaryProductSizePrice: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#5C7A68',
  },
  apothecaryProductTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2A382E',
    marginBottom: 8,
  },
  apothecaryProductDesc: {
    fontSize: 11,
    color: '#3D5246',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  apothecaryClaimBtn: {
    marginTop: 12,
    backgroundColor: '#5C7A68',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  apothecaryClaimBtnAlt: {
    marginTop: 12,
    backgroundColor: '#8B74A8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  apothecaryClaimText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  homeCartFloating: {
    position: 'absolute',
    top: 38,
    right: 14,
    zIndex: 45,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 252, 248, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(186, 152, 138, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 6px 18px rgba(92, 122, 104, 0.14)' },
      default: { elevation: 4 },
    }),
  },
  homeCartIcon: {
    fontSize: 18,
  },
  homeCartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C4896E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  homeCartBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cartDrawerBackdrop: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(42, 56, 46, 0.38)',
    zIndex: 1250,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cartDrawerPanel: {
    width: '86%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: 'rgba(255, 252, 248, 0.9)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(186, 152, 138, 0.35)',
    paddingTop: 16,
    paddingBottom: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '-12px 0 40px rgba(92, 122, 104, 0.18)',
      },
      default: { elevation: 16 },
    }),
  },
  cartDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cartDrawerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3D5246',
  },
  cartDrawerClose: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B8958A',
  },
  cartDrawerScroll: {
    flex: 1,
  },
  cartDrawerScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cartDrawerEmpty: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6E8578',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  cartLineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
    marginBottom: 10,
  },
  cartLineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cartLineImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(210, 190, 225, 0.2)',
  },
  cartLineMeta: {
    flex: 1,
  },
  cartLineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
  },
  cartLineSize: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    color: '#5C7A68',
  },
  cartLinePrice: {
    marginTop: 2,
    fontSize: 10,
    color: '#6E8578',
  },
  cartLineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  cartQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartQtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(186, 214, 198, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.25)',
  },
  cartQtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3D5246',
    lineHeight: 18,
  },
  cartQtyValue: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
  },
  cartLineTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5E52',
  },
  cartRemoveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C46B5A',
  },
  cartDrawerFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 198, 188, 0.35)',
  },
  cartSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartSubtotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5E52',
  },
  cartSubtotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2A382E',
  },
  cartTotalRow: {
    marginBottom: 6,
  },
  cartTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A382E',
  },
  cartTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2A382E',
  },
  cartShippingHint: {
    fontSize: 10,
    color: '#7A9084',
    fontStyle: 'italic',
    lineHeight: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  cartCheckoutBtn: {
    backgroundColor: '#5C7A68',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cartCheckoutBtnDisabled: {
    opacity: 0.45,
  },
  cartCheckoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.25,
  },
  checkoutOverlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(36, 48, 40, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1300,
  },
  checkoutSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
  },
  checkoutSummaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5E52',
    marginBottom: 8,
  },
  checkoutSummaryLine: {
    fontSize: 11,
    color: '#5C7A68',
    marginBottom: 4,
  },
  checkoutSummaryTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
    marginTop: 4,
  },
  checkoutLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutLineImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: 'rgba(210, 190, 225, 0.12)',
  },
  checkoutLineMeta: {
    flex: 1,
    paddingRight: 8,
  },
  checkoutLineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2A382E',
    lineHeight: 16,
  },
  checkoutLineQty: {
    fontSize: 10,
    color: '#6A8074',
    marginTop: 2,
  },
  checkoutLinePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5E52',
  },
  checkoutDivider: {
    height: 1,
    backgroundColor: 'rgba(186, 198, 188, 0.35)',
    marginVertical: 10,
  },
  birthPromptOverlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(36, 48, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1400,
  },
  birthPromptCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'rgba(255, 252, 250, 0.96)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 190, 210, 0.45)',
    ...Platform.select({
      web: { boxShadow: '0 12px 40px rgba(92, 122, 104, 0.2)' },
      default: { elevation: 12 },
    }),
  },
  birthPromptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A382E',
    textAlign: 'center',
    lineHeight: 22,
  },
  birthPromptMessage: {
    fontSize: 12,
    color: '#5C6E63',
    lineHeight: 18,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  birthPromptConfirmBtn: {
    marginTop: 16,
    backgroundColor: '#5C7A68',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  birthPromptConfirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  birthPromptDismissBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  birthPromptDismissText: {
    fontSize: 11,
    color: '#7A9084',
    fontWeight: '600',
  },
  checkoutCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkoutInputHalf: {
    flex: 1,
  },
  checkoutStripeHint: {
    fontSize: 10,
    color: '#8A9E92',
    fontStyle: 'italic',
    lineHeight: 15,
    marginBottom: 6,
  },
  checkoutPlaceBtnDisabled: {
    opacity: 0.55,
  },
  checkoutCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 252, 248, 0.94)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 152, 138, 0.38)',
    maxHeight: '88%',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 24px 56px rgba(92, 122, 104, 0.22)',
      },
      default: { elevation: 14 },
    }),
  },
  checkoutTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkoutTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3D5246',
  },
  checkoutClose: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B8958A',
  },
  checkoutSecurityBanner: {
    backgroundColor: 'rgba(186, 214, 198, 0.35)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.22)',
  },
  checkoutSecurityText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#3D5246',
    fontWeight: '600',
    textAlign: 'center',
  },
  checkoutScrollContent: {
    paddingBottom: 8,
  },
  checkoutFieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5C7A68',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  checkoutInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143, 168, 150, 0.35)',
    padding: 18,
    fontSize: 12,
    color: '#2A382E',
    marginBottom: 14,
    minHeight: 48,
  },
  checkoutPayRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  checkoutPayPill: {
    flex: 1,
    backgroundColor: 'rgba(210, 190, 225, 0.28)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.25)',
  },
  checkoutPayPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A5E52',
  },
  checkoutPlaceBtn: {
    marginTop: 10,
    backgroundColor: '#8B74A8',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkoutPlaceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  registryWidgetCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.58)',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
  },
  registryPregnantCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.62)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.55)',
    alignItems: 'center',
  },
  registryPregnantHero: {
    width: 140,
    height: 140,
    borderRadius: 24,
    backgroundColor: 'rgba(210, 190, 225, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  registryPregnantHeroImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  registryPregnantHeroEmoji: {
    fontSize: 56,
  },
  registryPregnantCategory: {
    fontSize: 9,
    fontWeight: '900',
    color: '#5C7A68',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  registryPregnantTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F2E24',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  registryPregnantVouchLine: {
    fontSize: 11,
    color: '#6B3D2E',
    fontStyle: 'italic',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  registryPregnantNote: {
    width: '100%',
    backgroundColor: 'rgba(210, 190, 225, 0.28)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.2)',
    marginBottom: 4,
  },
  registryPregnantNoteLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8B74A8',
    marginBottom: 8,
    textAlign: 'center',
  },
  registryPregnantNoteText: {
    fontSize: 12,
    color: '#3D5246',
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  registryPostpartumCard: {
    backgroundColor: 'rgba(255, 252, 248, 0.58)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.35)',
  },
  registryPostpartumBanner: {
    backgroundColor: 'rgba(233, 168, 137, 0.22)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.35)',
  },
  registryPostpartumBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B3D2E',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  registryPostpartumImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: 'rgba(233, 168, 137, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  registryPostpartumImageFill: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  registryPostpartumNote: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.22)',
  },
  registryWidgetTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  registryWidgetImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(210, 190, 225, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registryWidgetImg: {
    width: '90%',
    height: '90%',
  },
  registryWidgetEmoji: {
    fontSize: 34,
  },
  registryWidgetMeta: {
    flex: 1,
    minWidth: 0,
  },
  registryWidgetCategory: {
    fontSize: 9,
    fontWeight: '900',
    color: '#5C7A68',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  registryWidgetTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2E24',
    lineHeight: 18,
  },
  registryWidgetRating: {
    marginTop: 6,
    fontSize: 10,
    color: '#6B3D2E',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  registryWidgetNote: {
    marginTop: 12,
    backgroundColor: 'rgba(210, 190, 225, 0.34)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.22)',
  },
  registryWidgetNoteLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8B74A8',
    marginBottom: 6,
  },
  registryWidgetNoteText: {
    fontSize: 11,
    color: '#3D5246',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  registryActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  registryActionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  registrySkipBtn: {
    backgroundColor: 'rgba(186, 214, 198, 0.55)',
    borderColor: 'rgba(92, 122, 104, 0.35)',
  },
  registryUnlockBtn: {
    backgroundColor: 'rgba(210, 190, 225, 0.55)',
    borderColor: 'rgba(139, 116, 168, 0.35)',
  },
  registrySkipIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#5C7A68',
    marginBottom: 2,
  },
  registryUnlockIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8B74A8',
    marginBottom: 2,
  },
  registryActionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2A382E',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  registryVouchBox: {
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.28)',
  },
  registryVouchTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2A382E',
    marginBottom: 8,
  },
  registryVouchInput: {
    backgroundColor: 'rgba(255, 252, 248, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    padding: 12,
    minHeight: 66,
    fontSize: 12,
    color: '#1F2E24',
    textAlignVertical: 'top',
  },
  registryVouchBtn: {
    marginTop: 10,
    backgroundColor: '#8B74A8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  registryVouchBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  registryNestWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    marginBottom: 12,
  },
  registryNestScrollWindow: {
    height: 240,
    maxHeight: 240,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 252, 248, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
  },
  registryNestListContent: {
    padding: 15,
    gap: 10,
  },
  registryFtcDisclosure: {
    marginTop: 12,
    fontSize: 10,
    lineHeight: 15,
    color: '#7A9485',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  registryNestTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2A382E',
  },
  registryNestSub: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 11,
    color: '#4A5C50',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  registryGridCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 252, 248, 0.6)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 168, 137, 0.24)',
  },
  registryGridThumb: {
    height: 64,
    borderRadius: 14,
    backgroundColor: 'rgba(186, 214, 198, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  registryThumbImage: {
    width: '100%',
    height: 64,
    borderRadius: 14,
  },
  registryGridThumbEmoji: {
    fontSize: 28,
  },
  registryGridCategory: {
    fontSize: 9,
    fontWeight: '900',
    color: '#5C7A68',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  registryGridTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2E24',
    lineHeight: 16,
    minHeight: 34,
  },
  registryLinksRow: {
    marginTop: 10,
    gap: 8,
  },
  registryLinkPill: {
    borderRadius: 999,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  registryLinkAmazon: {
    backgroundColor: 'rgba(186, 214, 198, 0.52)',
    borderColor: 'rgba(92, 122, 104, 0.32)',
  },
  registryLinkTarget: {
    backgroundColor: 'rgba(210, 190, 225, 0.52)',
    borderColor: 'rgba(139, 116, 168, 0.32)',
  },
  registryLinkBabylist: {
    backgroundColor: 'rgba(233, 168, 137, 0.26)',
    borderColor: 'rgba(163, 83, 56, 0.22)',
  },
  registryLinkText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2A382E',
  },
  villageChoiceBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 214, 140, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 140, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  villageChoiceText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B3D2E',
  },
  villageChoiceChevron: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B3D2E',
  },
  villageChoiceNotes: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 252, 248, 0.68)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
  },
  villageChoiceNoteRow: {
    marginBottom: 8,
  },
  villageChoiceNoteAuthor: {
    fontSize: 9,
    fontWeight: '900',
    color: '#5C7A68',
    marginBottom: 3,
  },
  villageChoiceNoteText: {
    fontSize: 11,
    color: '#2A382E',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  registryNestEmpty: {
    backgroundColor: 'rgba(210, 190, 225, 0.22)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 116, 168, 0.22)',
    marginTop: 10,
  },
  registryNestEmptyText: {
    fontSize: 11,
    color: '#3D5246',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  transparentScroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ONBOARDING — premium welcome flow
  onboardingScroll: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
  },
  obWelcomeEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: '#5C7A68',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 14,
  },
  obWelcomeTitle: {
    fontSize: 34,
    color: '#3D5246',
    textAlign: 'center',
    lineHeight: 46,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  obWelcomeSub: {
    fontSize: 14,
    color: '#4A5C50',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    maxWidth: 300,
    alignSelf: 'center',
    marginBottom: 28,
    paddingHorizontal: 6,
  },
  obSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#3D5246',
    marginBottom: 14,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  obPersonaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  obPersonaCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    ...Platform.select({
      web: { boxShadow: '0 8px 22px rgba(80, 100, 88, 0.08)' },
      default: { elevation: 2 },
    }),
  },
  obPersonaCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(92, 122, 104, 0.45)',
    borderWidth: 1.5,
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(92, 122, 104, 0.14)' },
      default: { elevation: 5 },
    }),
  },
  obPersonaOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232, 218, 244, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(154, 122, 184, 0.22)',
  },
  obPersonaEmoji: {
    fontSize: 28,
  },
  obPersonaLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5C50',
    letterSpacing: 0.3,
  },
  obPersonaLabelActive: {
    color: '#2A382E',
  },
  obPersonaHint: {
    fontSize: 9,
    color: '#6B7F73',
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  glassFormGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    marginBottom: 18,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        boxShadow: '0 10px 30px rgba(92, 122, 104, 0.08)',
      },
      default: {
        shadowColor: '#5C7A68',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  obFormTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#2A382E',
    marginBottom: 14,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C7A68',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2A382E',
    fontWeight: '500',
    marginBottom: 4,
  },
  secureDetailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 218, 244, 0.35)',
    alignSelf: 'center',
  },
  secureDetailsIcon: {
    fontSize: 13,
  },
  secureDetailsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5E4878',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: '#5C7A68',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Platform.select({
      web: { boxShadow: '0 10px 24px rgba(92, 122, 104, 0.22)' },
      default: {
        shadowColor: '#3C5044',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  bypassLink: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 8,
  },
  bypassLinkText: {
    fontSize: 11,
    color: '#4A5C50',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  infoModalScroll: {
    maxHeight: 340,
  },
  infoModalScrollContent: {
    paddingBottom: 4,
  },
  infoModalLegalSections: {
    gap: 4,
  },
  infoModalLegalBlock: {
    marginBottom: 8,
  },
  infoModalLegalHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5E52',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  infoModalDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C46B5A',
    textAlign: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  scrollContentFlex: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#152219',
    marginBottom: 8,
  },
  sosCard: {
    backgroundColor: '#FCEBE3',
    borderColor: '#F5CEBD',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  sosTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B4E34',
  },
  sosText: {
    fontSize: 12,
    color: '#733E2B',
    lineHeight: 16,
    marginVertical: 6,
  },
  sosButton: {
    backgroundColor: '#9B4E34',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bloomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EAE5',
  },
  bloomWeekText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4C5C51',
  },
  bloomBodyText: {
    fontSize: 12,
    color: '#5C6E63',
    lineHeight: 16,
    marginTop: 4,
  },
  nurseryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAE5',
  },
  nurseryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#152219',
    marginBottom: 4,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F9F7',
    paddingVertical: 5,
  },
  logType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A291F',
  },
  logNotes: {
    fontSize: 11,
    color: '#5A6E62',
    fontStyle: 'italic',
  },
  profileOpHeader: {
    paddingTop: 38,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  profileOpTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2E24',
    letterSpacing: 0.2,
  },
  profileOpSub: {
    fontSize: 11,
    color: '#5C6E63',
    marginTop: 4,
    fontStyle: 'italic',
  },
  profileIdentityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 12,
  },
  profilePersonaText: {
    fontSize: 12,
    color: '#5C6D63',
    marginTop: 2,
    textAlign: 'center',
  },
  findVillageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 14,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(163, 83, 56, 0.12)' },
      default: {
        shadowColor: '#A35338',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  findVillageEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  findVillageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A382E',
    textAlign: 'center',
    letterSpacing: 0.3,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  findVillageDesc: {
    fontSize: 11,
    color: '#4A5C50',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    fontStyle: 'italic',
  },
  findVillageCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A35338',
    marginTop: 12,
    letterSpacing: 0.2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 18,
  },
  profileNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#152219',
  },
  graduationCard: {
    backgroundColor: '#EBF3FA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDDFED',
  },
  gradTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B4A61',
  },
  gradDesc: {
    fontSize: 11,
    color: '#4B6275',
    lineHeight: 15,
    marginVertical: 4,
  },
  gradButton: {
    backgroundColor: '#2B4A61',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  gradButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  dailyTabHeader: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 2,
  },
  dailyTabTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2E24',
    letterSpacing: 0.3,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  dailyTabSub: {
    fontSize: 11,
    color: '#5C6E63',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  villagePulseCapsule: {
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 4px 24px rgba(255, 160, 180, 0.18)',
      },
      default: {
        shadowColor: '#E8A0B8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  villagePulseCapsuleDay: {
    backgroundColor: 'rgba(255, 248, 252, 0.55)',
    borderColor: 'rgba(255, 190, 210, 0.45)',
  },
  villagePulseCapsuleNight: {
    backgroundColor: 'rgba(52, 44, 72, 0.42)',
    borderColor: 'rgba(180, 165, 220, 0.4)',
    ...Platform.select({
      web: { boxShadow: '0 4px 24px rgba(120, 100, 180, 0.22)' },
      default: { shadowColor: '#9A88C8' },
    }),
  },
  villagePulseEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#8B6B7A',
    marginBottom: 4,
  },
  villagePulseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A3D32',
    textAlign: 'center',
    lineHeight: 17,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  villagePulseTextNight: {
    color: '#F0EAF8',
  },
  villagePulseEyebrowNight: {
    color: '#C4B8DC',
  },
  weeklyInsightText: {
    fontSize: 12,
    color: '#3D5246',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  postpartumDailyInner: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  homeGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 14,
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(42, 56, 46, 0.06)' },
      default: {
        shadowColor: '#2A382E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  homeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2E24',
    letterSpacing: 0.2,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  homeCardHint: {
    fontSize: 11,
    color: '#5C6E63',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  symptomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomChip: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    marginBottom: 8,
  },
  symptomChipActive: {
    backgroundColor: 'rgba(233, 168, 137, 0.35)',
    borderColor: 'rgba(163, 83, 56, 0.45)',
  },
  villageRemedyOverlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(36, 48, 40, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    zIndex: 1250,
  },
  villageRemedyPopupCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#D1FAE5',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(94, 168, 130, 0.4)',
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(72, 130, 100, 0.22)' },
      default: {
        shadowColor: '#5C9A78',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  villageRemedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  villageRemedyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(72, 130, 100, 0.25)',
  },
  villageRemedyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2F5E48',
    letterSpacing: 0.6,
  },
  villageRemedySymptom: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D6B54',
  },
  villageRemedyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F4032',
    marginBottom: 6,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  villageRemedyBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#2A4D3C',
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  villageRemedyDismissBtn: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(72, 130, 100, 0.28)',
  },
  villageRemedyDismissText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F5E48',
    fontStyle: 'italic',
  },
  vibeChip: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 198, 188, 0.4)',
    marginBottom: 8,
  },
  vibeChipActive: {
    backgroundColor: 'rgba(233, 168, 137, 0.28)',
    borderColor: '#C4785A',
    borderWidth: 2,
  },
  vibeLabelActive: {
    color: '#6B3D2E',
    fontWeight: '800',
  },
  winsCard: {
    overflow: 'visible',
  },
  winsCardBody: {
    position: 'relative',
    overflow: 'visible',
  },
  fireworksStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
    zIndex: 20,
  },
  fireworksOrigin: {
    position: 'absolute',
    bottom: 36,
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireworkParticle: {
    position: 'absolute',
    fontSize: 18,
  },
  fireworksMessageStack: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  fireworksPopText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6B3D2E',
    textAlign: 'center',
    letterSpacing: 0.2,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  fireworksPopSubtext: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#5C6E63',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
    }),
  },
  symptomEmoji: {
    fontSize: 22,
  },
  symptomLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4A5C50',
    marginTop: 4,
    textAlign: 'center',
  },
  symptomLabelActive: {
    color: '#3D291F',
  },
  symptomHistoryBox: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  symptomHistoryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C6E63',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  symptomHistoryLine: {
    fontSize: 11,
    color: '#3D4F44',
    marginBottom: 3,
  },
  kickMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  kickMetaPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A5C50',
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
  },
  kickStatsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  kickStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    alignItems: 'center',
  },
  kickStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A382E',
  },
  kickStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5C6E63',
    marginTop: 2,
  },
  kickFootBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233, 168, 137, 0.28)',
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(163, 83, 56, 0.25)',
  },
  kickFootIcon: {
    fontSize: 36,
  },
  kickFootLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5A4034',
    marginTop: 4,
  },
  kickResetBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  kickResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E8578',
    textDecorationLine: 'underline',
  },
  kickLogSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 198, 188, 0.45)',
  },
  kickLogTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#5C7A68',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  kickLogScroll: {
    maxHeight: 160,
  },
  kickLogScrollContent: {
    paddingBottom: 4,
  },
  kickLogRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.35)',
  },
  kickLogRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kickLogCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A382E',
  },
  kickLogDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C7A68',
  },
  kickLogMeta: {
    fontSize: 10,
    color: '#5C6E63',
    fontStyle: 'italic',
  },
  therapeuticFeedCard: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 198, 188, 0.4)',
  },
  therapeuticFeedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A382E',
    marginBottom: 4,
  },
  therapeuticFeedSub: {
    fontSize: 11,
    color: '#5C6E63',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 16,
  },
  therapeuticFeedRow: {
    gap: 10,
    paddingRight: 8,
  },
  therapeuticMealTile: {
    width: 132,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
  },
  therapeuticMealImage: {
    width: '100%',
    height: 72,
    backgroundColor: 'rgba(232, 218, 244, 0.5)',
  },
  therapeuticMealTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2A382E',
    paddingHorizontal: 8,
    paddingTop: 8,
    lineHeight: 14,
  },
  therapeuticMealMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5C7A68',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 4,
  },
  therapeuticKitchenLink: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  therapeuticKitchenLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5C7A68',
    textDecorationLine: 'underline',
  },
  nestingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.45)',
  },
  nestingCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#7A9186',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
  },
  nestingCheckOn: {
    backgroundColor: '#5C7A68',
    borderColor: '#5C7A68',
  },
  nestingCheckMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  nestingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2E24',
  },
  nestingTextDone: {
    color: '#7A8E82',
    textDecorationLine: 'line-through',
  },
  nestingAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nestingInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.5)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#152219',
    marginRight: 8,
  },
  nestingAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#5C7A68',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nestingAddBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  soulEntryCard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(11, 16, 38, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.35)',
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(75, 0, 130, 0.25)' },
      default: {
        shadowColor: '#4B0082',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 5,
      },
    }),
  },
  soulEntryEyebrow: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(233, 184, 212, 0.9)',
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  soulEntryTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#F8F4FF',
    textAlign: 'center',
    marginTop: 8,
  },
  soulEntryDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  soulEntryCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E9B8D4',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  shellFooterLinks: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 152, 138, 0.1)',
    ...Platform.select({
      web: {
        bottom: 'calc(56px + env(safe-area-inset-bottom, 16px))',
      },
      default: {
        bottom: 56,
      },
    }),
  },
  shellFooterLinkText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#A89A90',
    letterSpacing: 0.12,
  },
  shellFooterDot: {
    fontSize: 8,
    color: '#B5C4BA',
    marginHorizontal: 6,
    opacity: 0.9,
  },
  infoModalOverlay: {
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
      default: { ...StyleSheet.absoluteFillObject },
    }),
    backgroundColor: 'rgba(58, 72, 62, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1100,
  },
  infoModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 252, 248, 0.88)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 152, 138, 0.35)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 20px 50px rgba(122, 148, 133, 0.22)',
      },
      default: { elevation: 12 },
    }),
  },
  infoModalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 4,
  },
  infoModalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A5E52',
    flex: 1,
    paddingRight: 8,
  },
  infoModalClose: {
    fontSize: 17,
    fontWeight: '800',
    color: '#B8958A',
  },
  infoModalBody: {
    fontSize: 13,
    lineHeight: 21,
    color: '#4A5C50',
    fontStyle: 'italic',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  infoModalInput: {
    minHeight: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143, 168, 150, 0.35)',
    padding: 20,
    fontSize: 12,
    color: '#3D5246',
    marginBottom: 12,
  },
  infoModalSendBtn: {
    backgroundColor: '#8FA896',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  infoModalSendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  infoModalDismissBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoModalDismissText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A68B7E',
    letterSpacing: 0.2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    paddingTop: 4,
    ...Platform.select({
      web: {
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      },
      default: {
        paddingBottom: 2,
      },
    }),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 15,
    opacity: 0.35,
  },
  navText: {
    fontSize: 8,
    color: '#5A6E62',
    fontWeight: '600',
  },
  activeText: {
    color: '#152219',
    fontWeight: '800',
    opacity: 1,
  },
});