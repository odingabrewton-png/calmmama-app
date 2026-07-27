import { enableScreens } from 'react-native-screens';

// Custom keep-alive tabs — native screen containers fight our off-screen show/hide.
enableScreens(false);

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
  Easing,
  Platform,
  Alert,
  Linking,
  Modal,
  Pressable,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Official transparent logo — offline Base64 data URI (generated in calmmamaLogoBase64.js)
import {
  CALMMAMA_OFFICIAL_LOGO,
  CALMMAMA_VILLAGE_BADGE,
} from './calmmamaLogoBase64';
import WeeklyBloomScreen from './WeeklyBloomScreen'; // layout locked — pregnantBloomLayoutConfig.js
import AppBrandHeader from './AppBrandHeader';
import VillageOmbreBackdrop from './VillageOmbreBackdrop';
import PWAVillageAlertsPrompt from './PWAVillageAlertsPrompt';
import { CALM_MAMA_PASTEL } from './calmMamaPastelPalette';
import CloudNurseryScreen from './CloudNurseryScreen';
import LittleHorizonsScreen from './LittleHorizonsScreen';
import PregnancySanctuaryModal from './PregnancySanctuaryModal';
import PostpartumNurseryWelcomeModal from './PostpartumNurseryWelcomeModal';
import { DEFAULT_NURSERY_SURVIVAL_TASKS } from './NurserySwipeChecklist';
import NurserySwipeChecklist from './NurserySwipeChecklist';
import SubscriptionScreen from './SubscriptionScreen';
import VillageCommunityPortal from './src/VillageCommunityPortal';
import MamasKitchenScreen from './MamasKitchenScreen';
import HomeScreen from './HomeScreen';
import HomeModeToggle from './HomeModeToggle';
import BirthdayBoutiqueModal from './BirthdayBoutiqueModal';
import CelebrationConfetti from './CelebrationConfetti';
import TabFreezeBoundary from './TabFreezeBoundary';
import { TAB_NAV_PERF } from './tabShellConfig';
import LegalComplianceModal from './LegalComplianceModal';
import AnimatedLogoHeader from './AnimatedLogoHeader';
import OnboardingStageScreen from './OnboardingStageScreen';
import WelcomeDashboardView from './WelcomeDashboardView';
import {
  applyProfileSnapshot,
  buildProfileSnapshot,
  clearAllVillageStorage,
  loadBootState,
  saveVillageProfile,
  setHasCompletedOnboarding,
} from './villageStorage';
import { VillageRewardsProvider, useVillageRewards } from './VillageRewardsContext';
import PremiumUpgradeWelcomeModal from './PremiumUpgradeWelcomeModal';
import { normalizeTimeCapsuleEntries, normalizeTimeCapsuleEntry } from './timeCapsuleStorage';
import { NOTIFICATION_ROUTES } from './notificationConfig';
import { claimWeeklyBloomReminder } from './weeklyBloomReminder';
import {
  cancelAllVillageNotifications,
  bootstrapVillageNotifications,
  consumeInitialNotificationRoute,
  isKnownNotificationRoute,
  subscribeToNotificationResponses,
  syncVillageNotificationSchedule,
} from './villageNotificationScheduler';
import { getHomeJourneyPhase, showsLittleBitesKitchen } from './homeJourneyUtils';
import {
  ACTIVE_MODES,
  buildSanctuaryJourneyContext,
  createChildEntry,
  deriveActiveMode,
  getEffectiveUserJourney,
  hasPregnancyTrack,
  HOME_TRACKS,
  normalizeChildren,
  normalizeCurrentPregnancy,
} from './mamaJourneyProfile';
import {
  fetchFoundingGiftsClaimCount,
  submitFoundingGiftClaim,
  isFoundingGiftsAvailable,
  hasUserClaimedFoundingGift,
} from './foundingGiftsEngine';
import {
  getSubscriptionProductId,
  isYearlyFoundingGiftTier,
  isPremiumSubscribed,
} from './subscriptionConfig';
import {
  MEMBERSHIP_TIERS,
  VIP_LIFETIME_PLAN,
  VIP_WELCOME_POINTS,
  consumeStripeUpgradeReturn,
  loadMembershipProfile,
  membershipFromPlanId,
  openStripeCheckout,
  redeemVipPromoCode,
  saveMembershipProfile,
} from './membershipAccess';
import {
  ADMIN_EMAIL,
  buildAdminUser,
  isAdmin,
  saveAdminSession,
} from './adminAccess';
import { normalizeJournalStage } from './sanctuaryJournalPrompts';
import LotusFlowerButton from './LotusFlowerButton';

import MidnightLoungeScreen from './MidnightLoungeScreen'; // layout locked — midnightLoungeLayoutConfig.js
const PostpartumInfantHome = lazy(() => import('./PostpartumInfantHome'));
const VillageTimeCapsule = lazy(() => import('./VillageTimeCapsule'));
import PostpartumHomePollModal from './PostpartumHomePollModal';

function AppStatusBar() {
  return (
    <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
  );
}

/** Consume newsletter → Soul Sanctuary deep link (?sanctuary=1&journalPrompt=…). */
function consumeSanctuaryJournalDeepLink() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location?.search || '');
    const wantsSanctuary =
      params.get('sanctuary') === '1' || params.get('emailPrompt') === '1';
    const wantsRewards = params.get('rewards') === '1';
    if (!wantsSanctuary && !wantsRewards) return null;

    const prompt = String(params.get('journalPrompt') || '').trim();
    const stage = normalizeJournalStage(params.get('stage') || 'pregnant');

    const next = new URL(window.location.href);
    ['sanctuary', 'emailPrompt', 'journalPrompt', 'stage', 'promptId', 'pts', 'rewards'].forEach(
      (key) => {
        next.searchParams.delete(key);
      },
    );
    const search = next.searchParams.toString();
    window.history.replaceState(
      {},
      document.title,
      `${next.pathname}${search ? `?${search}` : ''}`,
    );

    return { prompt, stage, openRewards: wantsRewards, openJournal: wantsSanctuary };
  } catch (_) {
    return null;
  }
}
/** Consume PWA notification deep link (?village=nursery|kitchen|tracker|lounge). */
function consumeVillageTabDeepLink() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location?.search || '');
    const village = String(params.get('village') || '').trim().toLowerCase();
    if (!village) return null;

    const routeByVillage = {
      nursery: NOTIFICATION_ROUTES.NURSERY,
      kitchen: NOTIFICATION_ROUTES.KITCHEN,
      tracker: NOTIFICATION_ROUTES.BLOOM,
      lounge: NOTIFICATION_ROUTES.MIDNIGHT_LOUNGE,
      home: NOTIFICATION_ROUTES.HOME,
    };
    const route = routeByVillage[village];
    if (!route) return null;

    const next = new URL(window.location.href);
    next.searchParams.delete('village');
    const search = next.searchParams.toString();
    window.history.replaceState(
      {},
      document.title,
      `${next.pathname}${search ? `?${search}` : ''}`,
    );
    return route;
  } catch (_) {
    return null;
  }
}

import { isBirthdayToday } from './mamaBirthdayUtils';
import { MAMA_KITCHEN_RECIPES } from './mealsData';
import { getPostpartumDailyWins, getPostpartumWinsDayKey } from './postpartumDailyWins';
import { getToddlerDailyAnchors, getToddlerAnchorsDayKey } from './toddlerDailyAnchors';
import {
  loadToddlerDailyState,
  saveToddlerDailyState,
} from './toddlerDailyStorage';
import { getPostpartumVibeMeals } from './postpartumVibeKitchen';
import { getPregnantSymptomMeals } from './pregnantSymptomKitchen';
import {
  collectTherapeuticTagsFromSymptoms,
  collectTherapeuticTagsFromVibes,
  getTherapeuticMeals,
  getTherapeuticHeadlineForSymptoms,
  getTherapeuticHeadlineForVibes,
} from './mealsTherapeuticMap';
import {
  animateBottomNavHide,
  animateBottomNavShow,
  animateMidnightLoungeClose,
  animateMidnightLoungeOpen,
  animateVillageTabFlow,
  getPregnantVillageTabFlowStyle,
  getVillageTabFlowStyle,
  runNativeOpacitySceneSwap,
  runPregnantVillageTabTransition,
  runVillageTabTransition,
  suppressVillageLayoutAnimation,
  useVillagePressTransition,
} from './villageScreenTransitions';
import { logNativeCheckpoint, guardPromise } from './nativeRuntimeGuard';
import { warmMidnightLounge } from './midnightLoungePreload';
import { warmBloomVideos } from './bloomVideoPlayerPool';
import { warmPregnantKitchenImages, warmAllPregnantKitchenImages } from './pregnantKitchenImagePreload';
import { warmPostpartumHome } from './postpartumHomePreload';
import { warmPregnantHome } from './pregnantHomePreload';
import {
  PREGNANT_DAILY_CARDS,
  PREGNANT_DAILY_LAYOUT,
  PREGNANT_DAILY_LAYOUT_LOCKED,
  PREGNANT_DAILY_STACK,
} from './pregnantDailyLayoutConfig';
import {
  getBottomNavStyle,
  injectMobileWebViewport,
  useMobileWebLayout,
} from './mobileWebLayout';
import AppLayout from './AppLayout';
import { injectNurseryWebFonts, retroHubTitle } from './nurseryRetroFonts';
import { getVillageRemedy } from './villageRemedyTips';
import { REGISTRY_CURATED_PRODUCTS } from './registryData';
import {
  COMMUNITY_POSTS_SEED,
  BASKET_OFFERINGS,
  BASKET_SEEKING,
} from './villageCommunityData';

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
  groundedActivities:
    'Gentle walks, watercolor journaling, and ten minutes of quiet on the porch.',
  villageShares:
    'The Midnight Library, Call the Midwife, and any podcast that made me feel less alone.',
};

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * TEMP layout audit — forces intake → feature highlights on every cold start.
 * Set to `false` before production release.
 */
const FORCE_ONBOARDING_LAYOUT_AUDIT =
  typeof __DEV__ !== 'undefined' ? __DEV__ : false;

const ONBOARDING_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Times New Roman", serif' },
  default: {},
});

function startLogoPulseLoop(pulseAnim, loopRef) {
  // Don't snap the logo to 0.95 on every Home/journey enter — that reads as a header glitch.
  if (loopRef.current) return;
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

const DEFAULT_NURSERY_SURVIVAL_CHECKLIST = DEFAULT_NURSERY_SURVIVAL_TASKS.map((task) => ({
  ...task,
  done: false,
}));

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

const TODDLER_VIBES = [
  { id: 'whirlwind', emoji: '🌀', label: 'Whirlwind Energy' },
  { id: 'teething', emoji: '🦷', label: 'Teething/Fussy' },
  { id: 'calm', emoji: '✨', label: 'Calm Exploration' },
  { id: 'emotions', emoji: '😮‍💨', label: 'Big Emotions' },
];

const DEFAULT_TODDLER_WINS = getToddlerDailyAnchors();

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

function therapeuticMealImageSource(meal) {
  if (meal?.image != null && typeof meal.image !== 'string') return meal.image;
  if (typeof meal?.imageUrl === 'string' && meal.imageUrl.length > 0) {
    return { uri: meal.imageUrl };
  }
  if (typeof meal?.image === 'string' && meal.image.length > 0) {
    return { uri: meal.image };
  }
  return null;
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
        {meals.map((meal) => {
          const source = therapeuticMealImageSource(meal);
          return (
            <View key={meal.id} style={styles.therapeuticMealTile}>
              {source ? (
                <Image source={source} style={styles.therapeuticMealImage} resizeMode="cover" />
              ) : (
                <View style={[styles.therapeuticMealImage, styles.therapeuticMealImageFallback]} />
              )}
              <Text style={styles.therapeuticMealTitle} numberOfLines={2}>
                {meal.title}
              </Text>
              <Text style={styles.therapeuticMealMeta}>
                {meal.prepMinutes ?? 20} min · {meal.servings ?? 2} servings
              </Text>
            </View>
          );
        })}
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

function VillageRemedyPopup({ symptom, remedy, visible, onDismissed }) {
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

/** Pregnant Daily tab — layout locked (pregnantDailyLayoutConfig.js). Say "UNLOCK DAILY LAYOUT" to edit structure. */
function renderPregnantDailyTracker({
  panelStyle,
  weeksPregnant,
  selectedSymptoms,
  onToggleSymptom,
  onDeselectSymptom,
  symptomHistory,
  kickSession,
  kickSessionLog,
  onLogKick,
  onSaveKickSession,
  onOpenPregnancySanctuary,
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
    <ScrollView
      style={styles.pregnantDailyScroll}
      contentContainerStyle={[panelStyle, styles.pregnantDailyScrollContent]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      nestedScrollEnabled
    >
      <View style={styles.dailyTabHeader} nativeID={PREGNANT_DAILY_STACK[0]}>
        <Text style={styles.dailyTabTitle}>✨ Daily Village</Text>
        <Text style={styles.dailyTabSub}>Symptoms, kicks & Pregnancy Sanctuary — all in one gentle place</Text>
      </View>

      <View style={styles.homeGlassCard} nativeID={PREGNANT_DAILY_CARDS.symptom}>
        <Text style={styles.homeCardTitle}>🤰 Quick Daily Symptom Tracker</Text>
        <Text style={styles.homeCardHint}>Tap for a village remedy — tap again for another tip. Long-press to remove.</Text>
        <View style={styles.symptomRow}>
          {SANCTUARY_SYMPTOMS.map((symptom) => {
            const active = selectedSymptoms.includes(symptom.id);
            return (
              <TouchableOpacity
                key={symptom.id}
                style={[styles.symptomChip, active && styles.symptomChipActive]}
                onPress={() => onToggleSymptom(symptom.id)}
                onLongPress={() => onDeselectSymptom?.(symptom.id)}
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

      <View style={styles.homeGlassCard} nativeID={PREGNANT_DAILY_CARDS.kick}>
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

      <View style={styles.homeGlassCard} nativeID={PREGNANT_DAILY_CARDS.nesting}>
        <Text style={styles.homeCardTitle}>🕊️ Pregnancy Sanctuary</Text>
        <Text style={styles.homeCardHint}>
          Doula tips, birth plan templates, and a contraction timer — open your soft prep space.
        </Text>
        <TouchableOpacity
          style={styles.pregnancySanctuaryBtn}
          onPress={() => onOpenPregnancySanctuary?.()}
          activeOpacity={0.88}
        >
          <Text style={styles.pregnancySanctuaryBtnEmoji}>🌿</Text>
          <View style={styles.pregnancySanctuaryBtnCopy}>
            <Text style={styles.pregnancySanctuaryBtnTitle}>Enter Pregnancy Sanctuary</Text>
            <Text style={styles.pregnancySanctuaryBtnSub}>
              Weekly doula wisdom · Birth plan · Contraction timer
            </Text>
          </View>
          <Text style={styles.pregnancySanctuaryBtnChevron}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

const FLOWER_FIREWORK_EMOJIS = [
  '🌸',
  '🌷',
  '🌼',
  '💐',
  '🪷',
  '🌺',
  '🏵️',
  '💮',
  '🌻',
  '🌿',
  '✨',
  '💗',
  '✿',
  '❀',
  '💫',
  '🦋',
];

function buildFlowerParticles(emojis, { spread = 0.48, powerBase = 52, powerStep = 14, lift = 42 }) {
  return emojis.map((emoji, index) => {
    const spreadOffset = (index - (emojis.length - 1) / 2) * spread;
    const angle = -Math.PI / 2 + spreadOffset;
    const power = powerBase + (index % 5) * powerStep;
    const endX = Math.cos(angle) * power * (0.85 + (index % 3) * 0.08);
    // Soft gravity: settle lower after the peak so petals drift down smoothly.
    const endY = Math.sin(angle) * power * 0.55 + 36 + (index % 4) * 8;
    const peakX = endX * 0.42;
    const peakY = Math.sin(angle) * power - lift - (index % 4) * 12;
    return {
      emoji,
      endX,
      endY,
      peakX,
      peakY,
      spin: index % 2 === 0 ? 22 + (index % 5) * 4 : -(18 + (index % 4) * 5),
    };
  });
}

const FLOWER_BURST_INNER = buildFlowerParticles(FLOWER_FIREWORK_EMOJIS.slice(0, 8), {
  spread: 0.42,
  powerBase: 68,
  lift: 62,
});
const FLOWER_BURST_MID = buildFlowerParticles(FLOWER_FIREWORK_EMOJIS.slice(4, 14), {
  spread: 0.55,
  powerBase: 88,
  powerStep: 12,
  lift: 74,
});
const FLOWER_BURST_OUTER = buildFlowerParticles(FLOWER_FIREWORK_EMOJIS, {
  spread: 0.68,
  powerBase: 112,
  powerStep: 16,
  lift: 92,
});

const FIREWORK_BURST_EASING = Easing.bezier(0.16, 0.84, 0.22, 1);

function renderFlowerParticles(burstProgress, particles, fontSize) {
  return particles.map((particle, index) => {
    const tx = burstProgress.interpolate({
      inputRange: [0, 0.18, 0.42, 0.72, 1],
      outputRange: [0, particle.peakX * 0.35, particle.peakX, particle.endX * 0.92, particle.endX],
    });
    const ty = burstProgress.interpolate({
      inputRange: [0, 0.16, 0.38, 0.68, 1],
      outputRange: [0, particle.peakY * 0.28, particle.peakY, particle.endY * 0.55, particle.endY],
    });
    const opacity = burstProgress.interpolate({
      inputRange: [0, 0.05, 0.18, 0.58, 0.84, 1],
      outputRange: [0, 1, 1, 0.95, 0.45, 0],
    });
    const scale = burstProgress.interpolate({
      inputRange: [0, 0.1, 0.32, 0.7, 1],
      outputRange: [0.12, 1.18, 1.05, 0.92, 0.55],
    });
    const rotate = burstProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${particle.spin}deg`],
    });

    return (
      <Animated.View
        key={`${particle.emoji}-${fontSize}-${index}`}
        style={[
          styles.fireworkParticleWrap,
          {
            opacity,
            transform: [{ translateX: tx }, { translateY: ty }, { scale }, { rotate }],
          },
        ]}
      >
        <Text style={[styles.fireworkParticleEmoji, { fontSize }]}>{particle.emoji}</Text>
      </Animated.View>
    );
  });
}

function FireworksBurst({ burstProgress, bloomProgress, midProgress }) {
  return (
    <View style={styles.fireworksStage} pointerEvents="none" collapsable={false}>
      <View style={styles.fireworksOrigin} collapsable={false}>
        {renderFlowerParticles(burstProgress, FLOWER_BURST_INNER, 34)}
        {renderFlowerParticles(midProgress || bloomProgress, FLOWER_BURST_MID, 30)}
        {renderFlowerParticles(bloomProgress, FLOWER_BURST_OUTER, 40)}
      </View>
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
  dailySub = 'Vibes & mama-first wins — all in one gentle place',
  vibeSectionTitle = '🌸 Postpartum Daily Vibe Check',
  vibeSectionHint = 'How is your heart today? Tap softly — we remember.',
  vibesList = POSTPARTUM_VIBES,
  winsSectionTitle = '📝 Mama-First Daily Wins',
  winsSectionHint = 'Micro-intentions that honor you, not just output',
  enableVibeNotes = false,
  onSaveVibeEntry,
  vibeHistoryTitle = "Today's vibe log",
}) {
  const { addPoints, notify } = useVillageRewards();
  const [showFireworks, setShowFireworks] = useState(false);
  const [noteModalVibe, setNoteModalVibe] = useState(null);
  const [vibeNoteDraft, setVibeNoteDraft] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const burstAnim = useRef(new Animated.Value(0)).current;
  const bloomAnim = useRef(new Animated.Value(0)).current;
  const midAnim = useRef(new Animated.Value(0)).current;
  const celebrationTimers = useRef([]);

  const clearCelebrationTimers = () => {
    celebrationTimers.current.forEach(clearTimeout);
    celebrationTimers.current = [];
  };

  const scheduleCelebration = (fn, delayMs) => {
    const id = setTimeout(fn, delayMs);
    celebrationTimers.current.push(id);
  };

  const startWinsCelebration = useCallback(() => {
    clearCelebrationTimers();
    burstAnim.stopAnimation();
    bloomAnim.stopAnimation();
    midAnim.stopAnimation();
    burstAnim.setValue(0);
    bloomAnim.setValue(0);
    midAnim.setValue(0);
    setShowFireworks(true);

    const startId = setTimeout(() => {
      Animated.parallel([
        Animated.timing(burstAnim, {
          toValue: 1,
          duration: 3000,
          easing: FIREWORK_BURST_EASING,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.sequence([
          Animated.delay(90),
          Animated.timing(midAnim, {
            toValue: 1,
            duration: 2900,
            easing: FIREWORK_BURST_EASING,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.delay(180),
          Animated.timing(bloomAnim, {
            toValue: 1,
            duration: 2800,
            easing: FIREWORK_BURST_EASING,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start();
    }, 48);
    celebrationTimers.current.push(startId);

    scheduleCelebration(() => setShowFireworks(false), 4500);
  }, [burstAnim, bloomAnim, midAnim]);

  const handleWinToggle = useCallback(
    (taskId) => {
      const task = mamaWinsTasks.find((item) => item.id === taskId);
      const markingDone = Boolean(task) && !task.done;
      const completesLastWin =
        markingDone && mamaWinsTasks.every((item) => item.id === taskId || item.done);

      onToggleMamaWin(taskId);

      if (completesLastWin) {
        startWinsCelebration();
        addPoints(5, 'dailyChecklist');
      } else if (markingDone) {
        const remaining = mamaWinsTasks.filter((item) => item.id !== taskId && !item.done).length;
        notify({
          category: 'checklist',
          title: 'Daily Checklist',
          message:
            remaining > 0
              ? `Win checked — ${remaining} left on today's soft list.`
              : 'Beautiful check — keep going.',
        });
      }
    },
    [mamaWinsTasks, onToggleMamaWin, startWinsCelebration, addPoints, notify]
  );

  const handleVibePress = useCallback(
    (vibe) => {
      const active = selectedVibes.includes(vibe.id);
      if (active) {
        onToggleVibe(vibe.id);
        return;
      }
      if (enableVibeNotes) {
        setNoteModalVibe(vibe);
        setVibeNoteDraft('');
        return;
      }
      onToggleVibe(vibe.id);
    },
    [enableVibeNotes, onToggleVibe, selectedVibes],
  );

  const handleSaveVibeNote = useCallback(() => {
    if (!noteModalVibe) return;
    const note = String(vibeNoteDraft || '').trim();
    if (typeof onSaveVibeEntry === 'function') {
      onSaveVibeEntry({
        vibeId: noteModalVibe.id,
        emoji: noteModalVibe.emoji,
        label: noteModalVibe.label,
        note,
      });
    } else {
      onToggleVibe(noteModalVibe.id);
    }
    setNoteModalVibe(null);
    setVibeNoteDraft('');
  }, [noteModalVibe, vibeNoteDraft, onSaveVibeEntry, onToggleVibe]);

  useEffect(() => () => {
    clearCelebrationTimers();
    burstAnim.stopAnimation();
    bloomAnim.stopAnimation();
  }, [burstAnim, bloomAnim]);

  const visibleHistory = historyExpanded ? vibeHistory.slice(0, 20) : vibeHistory.slice(0, 5);

  return (
    <View style={panelStyle}>
      <View style={styles.dailyTabHeader}>
        <Text style={styles.dailyTabTitle}>✨ Daily Village</Text>
        <Text style={styles.dailyTabSub}>{dailySub}</Text>
      </View>

      <View style={styles.homeGlassCard}>
        <Text style={styles.homeCardTitle}>{vibeSectionTitle}</Text>
        <Text style={styles.homeCardHint}>
          {enableVibeNotes
            ? `${vibeSectionHint} Tap a mood to add a short note about what your toddler is showing you — saved so you can reread anytime.`
            : vibeSectionHint}
        </Text>
        <View style={styles.symptomRow}>
          {vibesList.map((vibe) => {
            const active = selectedVibes.includes(vibe.id);
            return (
              <TouchableOpacity
                key={vibe.id}
                style={[styles.vibeChip, active && styles.vibeChipActive]}
                onPress={() => handleVibePress(vibe)}
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
            <Text style={styles.symptomHistoryTitle}>{vibeHistoryTitle}</Text>
            {visibleHistory.map((entry) => (
              <View key={entry.id} style={styles.vibeHistoryEntry}>
                <Text style={styles.symptomHistoryLine}>
                  {entry.emoji} {entry.label}
                  {entry.date ? ` · ${entry.date}` : ''}
                  {entry.time ? ` · ${entry.time}` : ''}
                </Text>
                {entry.note ? (
                  <Text style={styles.vibeHistoryNote}>{entry.note}</Text>
                ) : null}
              </View>
            ))}
            {vibeHistory.length > 5 ? (
              <TouchableOpacity
                onPress={() => setHistoryExpanded((open) => !open)}
                activeOpacity={0.8}
                style={styles.vibeHistoryToggle}
              >
                <Text style={styles.vibeHistoryToggleText}>
                  {historyExpanded ? 'Show less' : `Read earlier notes (${vibeHistory.length})`}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <TherapeuticMealFeed
          meals={therapeuticMeals}
          headline={therapeuticHeadline}
          onOpenKitchen={onOpenKitchen}
        />
      </View>

      <View style={[styles.homeGlassCard, styles.winsCard]}>
        <Text style={styles.homeCardTitle}>{winsSectionTitle}</Text>
        <Text style={styles.homeCardHint}>{winsSectionHint}</Text>
        <View style={styles.winsCardBody}>
          {mamaWinsTasks.map((task) => (
            <MamaWinRow
              key={task.id}
              task={task}
              onToggle={() => handleWinToggle(task.id)}
            />
          ))}
        </View>
      </View>

      <Modal
        visible={Boolean(noteModalVibe)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setNoteModalVibe(null);
          setVibeNoteDraft('');
        }}
      >
        <Pressable
          style={styles.vibeNoteBackdrop}
          onPress={() => {
            setNoteModalVibe(null);
            setVibeNoteDraft('');
          }}
        >
          <Pressable style={styles.vibeNoteCard} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.vibeNoteEyebrow}>TODDLER MOOD NOTE</Text>
            <Text style={styles.vibeNoteTitle}>
              {noteModalVibe ? `${noteModalVibe.emoji} ${noteModalVibe.label}` : ''}
            </Text>
            <Text style={styles.vibeNoteHint}>
              What is your toddler showing you right now? A few words help you remember this day.
            </Text>
            <TextInput
              style={styles.vibeNoteInput}
              value={vibeNoteDraft}
              onChangeText={setVibeNoteDraft}
              placeholder="e.g. Clung to me after daycare — needed closeness more than toys…"
              placeholderTextColor="#9AA89A"
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity
              style={styles.vibeNoteSaveBtn}
              onPress={handleSaveVibeNote}
              activeOpacity={0.9}
            >
              <Text style={styles.vibeNoteSaveText}>Save mood note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.vibeNoteSkipBtn}
              onPress={handleSaveVibeNote}
              activeOpacity={0.85}
            >
              <Text style={styles.vibeNoteSkipText}>Save without a note</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showFireworks}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setShowFireworks(false)}
      >
        <View style={styles.fireworkModalRoot} pointerEvents="none">
          <CelebrationConfetti active={showFireworks} density="rich" seed={88} />
          <FireworksBurst
            burstProgress={burstAnim}
            bloomProgress={bloomAnim}
            midProgress={midAnim}
          />
        </View>
      </Modal>
    </View>
  );
}

function renderSplitAppHeader(pulseAnim, { notchInsetExtra = 0, enableShine = true } = {}) {
  return (
    <AppBrandHeader
      logoUri={CALMMAMA_OFFICIAL_LOGO}
      pulseAnim={pulseAnim}
      variant="sanctuary"
      sanctuaryMode
      notchSafe
      notchInsetExtra={notchInsetExtra}
      enableShine={enableShine}
    />
  );
}

const FlowPanel = React.memo(function FlowPanel({
  anim,
  children,
  embedded,
  pregnantFlow,
}) {
  const style = embedded ? styles.flowEmbedded : styles.flowFill;
  if (!anim) {
    return <View style={style}>{children}</View>;
  }
  const flowStyle = pregnantFlow
    ? getPregnantVillageTabFlowStyle(anim)
    : getVillageTabFlowStyle(anim) || {};
  return (
    <Animated.View style={[style, flowStyle]}>
      {children}
    </Animated.View>
  );
});

const TabPane = React.memo(function TabPane({
  tabFlowAnim,
  tabContent,
  embedded,
  pregnantFlow,
}) {
  return (
    <View style={styles.tabPane}>
      <FlowPanel
        anim={tabFlowAnim}
        embedded={embedded}
        pregnantFlow={pregnantFlow}
      >
        {tabContent}
      </FlowPanel>
    </View>
  );
});

/** Keep-alive tab — skips re-render while inactive unless props/journey change */
const KeptAliveTab = React.memo(
  function KeptAliveTab({
    tabId,
    isActive,
    userJourney,
    mainTabContentProps,
    flowAnim,
  }) {
    const isKitchen = tabId === 'kitchen';
    // Pregnant journey: no shared flow animation on any tab — show/hide only.
    // Animated tab fades were blanking the stack and flashing Home.
    const tabFlowAnim =
      userJourney === 'pregnant'
        ? null
        : userJourney === 'postpartum' && (tabId === 'home' || isKitchen)
          ? flowAnim
          : isActive && tabId !== 'home'
            ? flowAnim
            : null;

    const tabContent = renderMainTabContent({
      ...mainTabContentProps,
      tabId,
      embedded: !isKitchen,
      isActive,
    });

    return (
      <TabFreezeBoundary
        isActive={isActive}
        freezeOnBlur={false}
      >
        <TabPane
          tabFlowAnim={tabFlowAnim}
          tabContent={tabContent}
          embedded={!isKitchen}
          pregnantFlow={false}
        />
      </TabFreezeBoundary>
    );
  },
  (prev, next) => {
    if (prev.tabId !== next.tabId) return false;
    if (prev.isActive !== next.isActive) return false;
    if (prev.userJourney !== next.userJourney) return false;
    if (prev.mainTabContentProps !== next.mainTabContentProps) return false;
    return true;
  }
);

function renderMainTabContent({
  tabId,
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
  minutesForMe,
  onMinutesForMeChange,
  goldenHourKeepsakes,
  onAddGoldenHourKeepsake,
  nurserySurvivalTasks,
  onToggleNurserySurvivalTask,
  weightEntries,
  setWeeksPregnant,
  setWeightEntries,
  onNotify,
  onOpenBirthPrompt,
  embedded,
  selectedSymptoms,
  onToggleSymptom,
  onDeselectSymptom,
  symptomHistory,
  kickSession,
  kickSessionLog,
  onLogKick,
  onSaveKickSession,
  onOpenPregnancySanctuary,
  activeMode = 'pregnant',
  children = [],
  onChildrenChange,
  selectedPostpartumVibes,
  onTogglePostpartumVibe,
  postpartumVibeHistory,
  selectedToddlerVibes,
  onToggleToddlerVibe,
  onSaveToddlerVibeEntry,
  toddlerVibeHistory,
  mamaWinsTasks,
  onToggleMamaWin,
  toddlerWinsTasks,
  onToggleToddlerWin,
  littleHorizonsHistory,
  onSaveLittleHorizonsEntry,
  pulseAnim,
  kitchenTherapeuticTags,
  onOpenKitchenTab,
  milestoneScrapbook,
  onSaveMilestoneEntry,
  timeCapsuleEntries,
  onSaveTimeCapsuleMonth,
  isSubscribed,
  isYearlyMember = false,
  onReleaseUpgradePrompt,
  onOpenSubscription,
  homeTrack = 'pregnant',
  onHomeTrackChange,
  isActive = true,
}) {
  const panelStyle = embedded ? styles.scrollContent : styles.scrollContentFlex;

  const therapeuticMeals =
    userJourney === 'postpartum' && selectedPostpartumVibes.length > 0
      ? getPostpartumVibeMeals(selectedPostpartumVibes, 6)
      : userJourney === 'pregnant' && selectedSymptoms.length > 0
        ? getPregnantSymptomMeals(selectedSymptoms, 6)
        : kitchenTherapeuticTags?.length > 0
          ? getTherapeuticMeals(MAMA_KITCHEN_RECIPES, kitchenTherapeuticTags, 6)
          : [];
  const pregnantTherapeuticHeadline = getTherapeuticHeadlineForSymptoms(selectedSymptoms);
  const postpartumTherapeuticHeadline = getTherapeuticHeadlineForVibes(selectedPostpartumVibes);
  const homePhase = getHomeJourneyPhase(userJourney, babyAge, { activeMode, homeTrack });
  const showHybridHomeToggle = activeMode === 'hybrid';

  const homeToggle = showHybridHomeToggle ? (
    <HomeModeToggle
      homeTrack={homeTrack}
      onChangeTrack={onHomeTrackChange}
      weeksPregnant={weeksPregnant}
      babyAge={babyAge}
    />
  ) : null;

  if (tabId === 'home') {
    if (homePhase === 'pregnant') {
      return <HomeScreen headerSlot={homeToggle} />;
    }

    if (homePhase === 'infant') {
      // Layout locked — postpartumInfantHomeLayoutConfig.js (newborn – under 1 yr)
      return (
        <Suspense fallback={<View style={styles.tabSuspenseFallback} />}>
          <PostpartumInfantHome
            babyAge={babyAge}
            mamaName={mamaName}
            entries={milestoneScrapbook}
            onSaveEntry={onSaveMilestoneEntry}
            headerSlot={homeToggle}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<View style={styles.tabSuspenseFallback} />}>
        <>
          <ScrollView
            style={styles.embeddedTabScroll}
            contentContainerStyle={styles.embeddedTabScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {homeToggle}
            <VillageTimeCapsule
              babyAge={babyAge}
              entries={timeCapsuleEntries}
              onSaveMonth={onSaveTimeCapsuleMonth}
              isPro={isSubscribed}
              isSubscribed={isSubscribed}
              onRequestUpgrade={onReleaseUpgradePrompt}
              onOpenSubscription={onOpenSubscription}
            />
          </ScrollView>
          <PostpartumHomePollModal active babyAge={babyAge} />
        </>
      </Suspense>
    );
  }

  if (tabId === 'daily' && userJourney === 'pregnant') {
    // Layout locked — pregnantDailyLayoutConfig.js
    return renderPregnantDailyTracker({
      panelStyle,
      weeksPregnant,
      selectedSymptoms,
      onToggleSymptom,
      onDeselectSymptom,
      symptomHistory,
      kickSession,
      kickSessionLog,
      onLogKick,
      onSaveKickSession,
      onOpenPregnancySanctuary,
      therapeuticMeals,
      therapeuticHeadline: pregnantTherapeuticHeadline,
      onOpenKitchen: onOpenKitchenTab,
    });
  }

  if (tabId === 'daily' && userJourney === 'postpartum' && homePhase === 'toddler') {
    return (
      <ScrollView
        style={styles.postpartumDailyScroll}
        contentContainerStyle={styles.postpartumDailyScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <PostpartumDailyTracker
          panelStyle={styles.postpartumDailyInner}
          selectedVibes={selectedToddlerVibes}
          onToggleVibe={onToggleToddlerVibe}
          vibeHistory={toddlerVibeHistory}
          mamaWinsTasks={toddlerWinsTasks}
          onToggleMamaWin={onToggleToddlerWin}
          therapeuticMeals={therapeuticMeals}
          therapeuticHeadline={postpartumTherapeuticHeadline}
          onOpenKitchen={onOpenKitchenTab}
          dailySub="Toddler routines & mama-first intentions"
          vibeSectionTitle="🌸 Mood Vibe Check"
          vibeSectionHint="How is your toddler day unfolding?"
          vibesList={TODDLER_VIBES}
          winsSectionTitle="📝 Daily Toddler Anchors"
          winsSectionHint="A fresh set of gentle anchors each day — check what you claimed."
          enableVibeNotes
          onSaveVibeEntry={onSaveToddlerVibeEntry}
          vibeHistoryTitle="Saved toddler mood notes"
        />
      </ScrollView>
    );
  }

  if (tabId === 'daily' && userJourney === 'postpartum') {
    return (
      <ScrollView
        style={styles.postpartumDailyScroll}
        contentContainerStyle={styles.postpartumDailyScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
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
      </ScrollView>
    );
  }

  if (tabId === 'tracker' && userJourney === 'pregnant') {
    // Layout locked — pregnantBloomLayoutConfig.js
    return (
      <WeeklyBloomScreen
        embedded={embedded}
        initialWeek={weeksPregnant}
        mamaName={mamaName}
        dueDate={dueDate}
        weightEntries={weightEntries}
        onWeekChange={setWeeksPregnant}
        onOpenBirthPrompt={onOpenBirthPrompt}
        onLogMeals={onOpenKitchenTab}
        isActive={isActive}
        onAddWeight={(entry) => {
          setWeightEntries((prev) => {
            const rest = prev.filter((e) => e.week !== entry.week);
            return [...rest, entry].sort((a, b) => a.week - b.week);
          });
          onNotify?.({
            category: 'bloom',
            title: 'Weekly Bloom',
            message: `Week ${entry.week} weight saved — your bloom is tracked.`,
          });
        }}
      />
    );
  }

  if (tabId === 'nursery' && userJourney === 'postpartum') {
    if (homePhase === 'toddler') {
      return (
        <ScrollView
          style={styles.postpartumNurseryScroll}
          contentContainerStyle={styles.postpartumNurseryScrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.postpartumNurseryInner}>
            <NurserySwipeChecklist
              tasks={nurserySurvivalTasks}
              onToggleTask={onToggleNurserySurvivalTask}
            />
            <LittleHorizonsScreen
              embedded
              babyAge={babyAge}
              history={littleHorizonsHistory}
              onSaveEntry={onSaveLittleHorizonsEntry}
              isPro={isSubscribed}
              isSubscribed={isSubscribed}
              isYearlyMember={isYearlyMember}
              onRequestUpgrade={onReleaseUpgradePrompt}
              onOpenSubscription={onOpenSubscription}
            />
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.postpartumNurseryScroll}
        contentContainerStyle={styles.postpartumNurseryScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <CloudNurseryScreen
          babyAge={babyAge}
          nurseryLogs={nurseryLogs}
          onAddLog={onAddNurseryLog}
          goldenHourKeepsakes={goldenHourKeepsakes}
          onAddGoldenHourKeepsake={onAddGoldenHourKeepsake}
          survivalTasks={nurserySurvivalTasks}
          onToggleSurvivalTask={onToggleNurserySurvivalTask}
        />
      </ScrollView>
    );
  }

  if (tabId === 'kitchen') {
    return (
      <MamasKitchenScreen
        therapeuticTags={kitchenTherapeuticTags}
        isToddlerKitchen={userJourney !== 'pregnant' && showsLittleBitesKitchen(babyAge)}
        isPostpartumKitchen={userJourney === 'postpartum'}
        isPregnantKitchen={userJourney === 'pregnant'}
        isPro={isSubscribed}
        isSubscribed={isSubscribed}
        onRequestUpgrade={onOpenSubscription}
      />
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

const CALMMAMA_INSTAGRAM_URL = 'https://www.instagram.com/calmmama_village/';

const CONTACT_VILLAGE_COPY =
  'Have a question or need a direct ear? Our village support lines are always open. Reach out to us anytime at founder.calmmamavillage@gmail.com or tap below to send an encrypted village message panel note.';

const SHELL_SCROLL_FOOTER_CLEARANCE = 150;

const INFO_MODAL_TITLES = {
  about: '🌸 About Us',
  contact: '📬 Contact Us',
  legal: '🛡️ Legal & Safety',
};

function ShellFooterLinks({ onOpenAbout, onOpenContact, onOpenLegal }) {
  return (
    <View style={styles.shellFooterLinks} pointerEvents="box-none">
      <TouchableOpacity onPress={onOpenAbout} activeOpacity={0.75}>
        <Text style={styles.shellFooterLinkText}>About Us</Text>
      </TouchableOpacity>
      <Text style={styles.shellFooterDot}>•</Text>
      <TouchableOpacity onPress={onOpenContact} activeOpacity={0.75}>
        <Text style={styles.shellFooterLinkText}>Contact Us</Text>
      </TouchableOpacity>
      <Text style={styles.shellFooterDot}>•</Text>
      <TouchableOpacity onPress={onOpenLegal} activeOpacity={0.75}>
        <Text style={styles.shellFooterLinkText}>Legal & Safety</Text>
      </TouchableOpacity>
    </View>
  );
}

const AppBottomTabBar = React.memo(function AppBottomTabBar({
  activeTab,
  userJourney,
  bottomNavStyle,
  midnightLoungeOpen,
  onTabPress,
  onOpenMidnightLounge,
}) {
  const handleHomePress = useCallback(() => onTabPress('home'), [onTabPress]);
  const handleKitchenPress = useCallback(() => onTabPress('kitchen'), [onTabPress]);
  const handleDailyPress = useCallback(() => onTabPress('daily'), [onTabPress]);
  const handleBloomPress = useCallback(() => onTabPress('tracker'), [onTabPress]);
  const handleNurseryPress = useCallback(() => onTabPress('nursery'), [onTabPress]);

  return (
    <View style={[styles.bottomNav, bottomNavStyle]}>
      <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
        <Text style={[styles.navIcon, activeTab === 'home' && styles.activeText]}>🏡</Text>
        <Text style={[styles.navText, activeTab === 'home' && styles.activeText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={handleKitchenPress}>
        <Text style={[styles.navIcon, activeTab === 'kitchen' && styles.activeText]}>🍳</Text>
        <Text style={[styles.navText, activeTab === 'kitchen' && styles.activeText]}>Kitchen</Text>
      </TouchableOpacity>

      <View style={styles.navLotusCenterSlot}>
        <LotusFlowerButton
          variant="lavender"
          hideLabel
          midnightLoungeOpen={midnightLoungeOpen}
          subtleBloom={userJourney === 'postpartum'}
          onPress={onOpenMidnightLounge}
        />
      </View>

      <TouchableOpacity style={styles.navItem} onPress={handleDailyPress}>
        <Text style={[styles.navIcon, activeTab === 'daily' && styles.activeText]}>✨</Text>
        <Text style={[styles.navText, activeTab === 'daily' && styles.activeText]}>Daily</Text>
      </TouchableOpacity>

      {userJourney === 'pregnant' ? (
        <TouchableOpacity style={styles.navItem} onPress={handleBloomPress}>
          <Text style={[styles.navIcon, activeTab === 'tracker' && styles.activeText]}>🌱</Text>
          <Text style={[styles.navText, activeTab === 'tracker' && styles.activeText]}>Bloom</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.navItem} onPress={handleNurseryPress}>
          <Text style={[styles.navIcon, activeTab === 'nursery' && styles.activeText]}>☁️</Text>
          <Text style={[styles.navText, activeTab === 'nursery' && styles.activeText]}>Nursery</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const MainTabShell = React.memo(function MainTabShell({
  activeTab,
  userJourney,
  mainTabContentProps,
  flowAnim,
  pulseAnim,
  tabSceneOpacity,
}) {
  const { babyAge } = mainTabContentProps;
  const journeyTab = userJourney === 'pregnant' ? 'tracker' : 'nursery';
  const tabIds = useMemo(
    () => ['home', 'kitchen', 'daily', journeyTab],
    [journeyTab]
  );
  // Keep Bloom (tracker) warm for pregnant mamas so the video never cold-mounts on tab enter.
  const [visitedTabs, setVisitedTabs] = useState(() => {
    const seed = new Set(['home', activeTab]);
    if (userJourney === 'pregnant') seed.add('tracker');
    return seed;
  });
  useEffect(() => {
    if (userJourney === 'pregnant') {
      setVisitedTabs((prev) => {
        if (prev.has('tracker') && prev.has(activeTab)) return prev;
        const next = new Set(prev);
        next.add('tracker');
        next.add(activeTab);
        return next;
      });
      return;
    }
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab, userJourney]);

  const mountedTabIds = useMemo(() => {
    return tabIds.filter((id) => id === activeTab || visitedTabs.has(id));
  }, [tabIds, activeTab, visitedTabs]);

  const sharedHeader = useMemo(
    () =>
      renderSplitAppHeader(pulseAnim, {
        notchInsetExtra: userJourney === 'pregnant' ? 18 : 0,
      }),
    [pulseAnim, userJourney],
  );

  return (
    <View style={styles.mainShell}>
      <View style={styles.mainShellBody}>
        {sharedHeader}
        <Animated.View
          style={[styles.tabStage, { opacity: tabSceneOpacity }]}
          collapsable={false}
        >
          {mountedTabIds.map((tabId) => (
            <KeptAliveTab
              key={tabId}
              tabId={tabId}
              isActive={activeTab === tabId}
              userJourney={userJourney}
              mainTabContentProps={mainTabContentProps}
              flowAnim={flowAnim}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
});

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
  anim,
  onClose,
}) {
  if (!type) return null;

  const isContact = type === 'contact';
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
          {isAbout ? (
            <>
              <Text style={styles.infoModalBody}>{ABOUT_VILLAGE_COPY}</Text>
              <TouchableOpacity
                style={styles.infoModalInstagramBtn}
                onPress={() => {
                  Linking.openURL(CALMMAMA_INSTAGRAM_URL).catch(() => {});
                }}
                activeOpacity={0.88}
                accessibilityRole="link"
                accessibilityLabel="Open CalmMama Village on Instagram"
              >
                <Text style={styles.infoModalInstagramBtnText}>Follow us on Instagram</Text>
                <Text style={styles.infoModalInstagramHandle}>@calmmama_village</Text>
              </TouchableOpacity>
            </>
          ) : null}

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
        </ScrollView>

        <TouchableOpacity style={styles.infoModalDismissBtn} onPress={onClose} activeOpacity={0.88}>
          <Text style={styles.infoModalDismissText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function UpgradeOfferSheet({
  visible,
  onClose,
  onUpgradeMonthly,
  onUpgradeFounding,
  onVipRedeemed,
  memberEmail = null,
}) {
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoBusy, setPromoBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCodeExpanded(false);
    setPromoCode('');
    setPromoError('');
    setPromoBusy(false);
  }, [visible]);

  const handleRedeemPromo = async () => {
    if (promoBusy) return;
    setPromoError('');
    setPromoBusy(true);
    try {
      const result = await redeemVipPromoCode(promoCode, { email: memberEmail });
      if (!result.ok) {
        setPromoError(result.error || "That code isn't quite right. Try again mama!");
        return;
      }
      onVipRedeemed?.(result.membership, result);
    } finally {
      setPromoBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.upgradeBackdrop} onPress={onClose}>
        <Pressable style={styles.upgradeSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.upgradeHandle} />
          <Text style={styles.upgradeEyebrow}>FREE EXPLORER</Text>
          <Text style={styles.upgradeTitle}>Unlock a little more village care</Text>
          <Text style={styles.upgradeBody}>
            Nursery checklist & baby logs stay free. Upgrade for birth plan tools, full kitchen,
            sanctuary prompts, time capsule archives, and Little Horizons victories.
          </Text>
          <TouchableOpacity
            style={styles.upgradePrimaryBtn}
            onPress={() => {
              onClose();
              onUpgradeFounding?.();
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.upgradePrimaryText}>Upgrade to Founding Mother ($25/yr)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.upgradeSecondaryBtn}
            onPress={() => {
              onClose();
              onUpgradeMonthly?.();
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.upgradeSecondaryText}>Upgrade ($5.99/mo)</Text>
          </TouchableOpacity>

          <View style={styles.foundingCodeBlock}>
            <TouchableOpacity
              onPress={() => {
                setCodeExpanded((open) => !open);
                if (promoError) setPromoError('');
              }}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ expanded: codeExpanded }}
              hitSlop={8}
            >
              <Text style={styles.foundingCodeLink}>
                {codeExpanded ? 'Hide Founding Mother Code' : 'Have a Founding Mother Code?'}
              </Text>
            </TouchableOpacity>

            {codeExpanded ? (
              <View style={styles.foundingCodePanel}>
                <View style={styles.foundingCodeRow}>
                  <TextInput
                    style={styles.foundingCodeInput}
                    value={promoCode}
                    onChangeText={(text) => {
                      setPromoCode(text);
                      if (promoError) setPromoError('');
                    }}
                    placeholder="Enter your code"
                    placeholderTextColor="#9AA89A"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    returnKeyType="done"
                    onSubmitEditing={handleRedeemPromo}
                    editable={!promoBusy}
                    accessibilityLabel="Founding Mother code"
                  />
                  <TouchableOpacity
                    style={[
                      styles.foundingCodeRedeemBtn,
                      (promoBusy || !String(promoCode || '').trim()) &&
                        styles.foundingCodeRedeemBtnDisabled,
                    ]}
                    onPress={handleRedeemPromo}
                    activeOpacity={0.88}
                    disabled={promoBusy || !String(promoCode || '').trim()}
                  >
                    <Text style={styles.foundingCodeRedeemText}>
                      {promoBusy ? '…' : 'Redeem'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {promoError ? <Text style={styles.foundingCodeError}>{promoError}</Text> : null}
              </View>
            ) : null}
          </View>

          <TouchableOpacity style={styles.upgradeGhostBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.upgradeGhostText}>Keep exploring free</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

if (__DEV__ && !PREGNANT_DAILY_LAYOUT_LOCKED) {
  console.warn('[App] PREGNANT_DAILY_LAYOUT_LOCKED is false — daily tab layout edits allowed');
}

export default function App() {
  return (
    <VillageRewardsProvider>
      <CalmMamaApp />
    </VillageRewardsProvider>
  );
}

function CalmMamaApp() {
  const { resetRewards, addPoints, grantTestPoints, rewards, notify } = useVillageRewards();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [bootHydrated, setBootHydrated] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('intake');
  const [isPro, setIsPro] = useState(false);
  const isSubscribed = isPro;
  const [userSubscriptionType, setUserSubscriptionType] = useState(null);
  const [subscriptionProductId, setSubscriptionProductId] = useState(null);
  const [membershipTier, setMembershipTier] = useState(MEMBERSHIP_TIERS.FREE_EXPLORER);
  const [memberEmail, setMemberEmail] = useState(null);
  const [memberRole, setMemberRole] = useState('member');
  const [upgradeSheetOpen, setUpgradeSheetOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [premiumWelcomeOpen, setPremiumWelcomeOpen] = useState(false);
  const [premiumWelcomePlan, setPremiumWelcomePlan] = useState(null);
  const [premiumWelcomeVariant, setPremiumWelcomeVariant] = useState('premium');
  const [userJourney, setUserJourney] = useState('pregnant');
  const [activeMode, setActiveMode] = useState(ACTIVE_MODES.PREGNANT);
  const [homeTrack, setHomeTrack] = useState(HOME_TRACKS.PREGNANT);
  const [currentPregnancy, setCurrentPregnancy] = useState({
    weeksPregnant: '24',
    dueDate: '',
  });
  const [children, setChildren] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [inMidnightLounge, setInMidnightLounge] = useState(false);
  const [midnightLoungeMounted, setMidnightLoungeMounted] = useState(false);
  const [loungeFocusTab, setLoungeFocusTab] = useState('home');
  const [loungeFocusToken, setLoungeFocusToken] = useState(0);
  const [sanctuaryJournalPrompt, setSanctuaryJournalPrompt] = useState('');
  const [autoOpenSanctuaryJournal, setAutoOpenSanctuaryJournal] = useState(false);
  const [postpartumLoungeOverlayActive, setPostpartumLoungeOverlayActive] = useState(false);
  const midnightLoungeOpacity = useRef(new Animated.Value(0)).current;
  const midnightLoungeScale = useRef(new Animated.Value(0.07)).current;
  const midnightLoungeTranslateY = useRef(new Animated.Value(110)).current;
  const midnightLoungeAnimatingRef = useRef(false);
  const bottomNavOpacity = useRef(new Animated.Value(1)).current;
  const bottomNavTranslateY = useRef(new Animated.Value(0)).current;
  const [guidanceHistory, setGuidanceHistory] = useState([]);
  
  // USER FIELDS
  const [mamaName, setMamaName] = useState('Mama');
  const [mamaBirthday, setMamaBirthday] = useState(null);
  const [approximateCity, setApproximateCity] = useState('Greater Austin area');
  const [usState, setUsState] = useState('TX');
  const [villageLatitude] = useState(30.2672);
  const [villageLongitude] = useState(-97.7431);
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
  const [foundingGiftsClaimCount, setFoundingGiftsClaimCount] = useState(0);
  const [foundingGiftsUserClaimed, setFoundingGiftsUserClaimed] = useState(() =>
    hasUserClaimedFoundingGift()
  );
  const [foundingGiftsClaiming, setFoundingGiftsClaiming] = useState(false);
  const [remedyPopupSymptomId, setRemedyPopupSymptomId] = useState(null);
  const [remedyPopupPickIndex, setRemedyPopupPickIndex] = useState(0);
  const remedyPickRef = useRef({});

  const [infoModalType, setInfoModalType] = useState(null);
  const [contactHeartNote, setContactHeartNote] = useState('');
  const infoModalOpacity = useRef(new Animated.Value(0)).current;
  const infoModalScale = useRef(new Animated.Value(0.88)).current;
  const infoModalTranslateX = useRef(new Animated.Value(-10)).current;
  const infoModalTranslateY = useRef(new Animated.Value(42)).current;
  const [weeksPregnant, setWeeksPregnant] = useState('24');
  const [dueDate, setDueDate] = useState('October 2026');
  const [babyAge, setBabyAge] = useState('Newborn');

  const effectiveJourney = useMemo(
    () => getEffectiveUserJourney(activeMode, homeTrack),
    [activeMode, homeTrack],
  );

  const sanctuaryJourneyContext = useMemo(
    () =>
      buildSanctuaryJourneyContext({
        activeMode,
        currentPregnancy,
        weeksPregnant,
        dueDate,
        children,
        babyAge,
      }),
    [activeMode, currentPregnancy, weeksPregnant, dueDate, children, babyAge],
  );

  useEffect(() => {
    setCurrentPregnancy(normalizeCurrentPregnancy(null, weeksPregnant, dueDate));
  }, [weeksPregnant, dueDate]);

  useEffect(() => {
    if (activeMode === ACTIVE_MODES.PREGNANT) return;
    if (!String(babyAge || '').trim()) return;
    setChildren((prev) => {
      if (!prev.length) return [createChildEntry({ ageLabel: babyAge })];
      const next = [...prev];
      next[0] = { ...next[0], ageLabel: babyAge };
      return next;
    });
  }, [babyAge, activeMode]);
  const [nurseryLogs, setNurseryLogs] = useState([]);
  const [nurseryPerspective, setNurseryPerspective] = useState('baby');
  const [hydrationOz, setHydrationOz] = useState(0);
  const [hydrationGoal] = useState(64);
  const [minutesForMe, setMinutesForMe] = useState(0);
  const nurseryLogIdRef = useRef(0);
  const [weightEntries, setWeightEntries] = useState([
    { week: 20, weight: 142 },
    { week: 22, weight: 145 },
    { week: 24, weight: 148 },
  ]);

  const applyMembership = useCallback((profile) => {
    if (!profile) return;
    setMembershipTier(
      profile.tier || profile.membershipTier || MEMBERSHIP_TIERS.FREE_EXPLORER,
    );
    const user = buildAdminUser({ email: profile.email, role: profile.role });
    setMemberEmail(user.email);
    setMemberRole(user.role);
    const nextIsPro = Boolean(profile.isPro || profile.isSubscribed);
    setIsPro(nextIsPro);
    const plan = profile.planId || profile.subscriptionPlan;
    if (plan) {
      setUserSubscriptionType(plan);
      setSubscriptionProductId(getSubscriptionProductId(plan));
    } else if (profile.isPro === false || profile.isSubscribed === false) {
      setUserSubscriptionType(null);
      setSubscriptionProductId(null);
    }
  }, []);

  const adminUser = useMemo(
    () => buildAdminUser({ email: memberEmail, role: memberRole }),
    [memberEmail, memberRole],
  );

  const isVipLifetime =
    userSubscriptionType === VIP_LIFETIME_PLAN ||
    userSubscriptionType === 'founding_mother' ||
    membershipTier === MEMBERSHIP_TIERS.VIP_LIFETIME ||
    membershipTier === MEMBERSHIP_TIERS.FOUNDING_MOTHER;

  const handleAccountEmailChange = useCallback(async (email) => {
    const user = buildAdminUser({ email });
    setMemberEmail(user.email);
    setMemberRole(user.role);
    try {
      const existing = (await loadMembershipProfile()) || {};
      await saveMembershipProfile({
        ...existing,
        email: user.email,
        role: user.role,
      });
      if (isAdmin(user)) {
        await saveAdminSession({ sandbox: true });
      }
    } catch (_) {
      /* non-blocking */
    }
  }, []);

  const handleSendTestNewsletter = useCallback(async () => {
    if (!isAdmin(adminUser)) {
      return { ok: false, error: 'Not authorized' };
    }
    await saveAdminSession({ sandbox: true });
    try {
      const res = await fetch('/api/admin/test-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          firstName: mamaName || 'Admin',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || 'Failed to send test newsletter' };
      }
      return {
        ok: true,
        message: `Test newsletter sent to ${ADMIN_EMAIL} (analytics excluded)`,
      };
    } catch (err) {
      return { ok: false, error: err?.message || 'Network error' };
    }
  }, [adminUser, mamaName]);

  const handleGrantTestPoints = useCallback(
    async (amount) => {
      if (!isAdmin(adminUser)) return { ok: false, error: 'Not authorized' };
      await saveAdminSession({ sandbox: true });
      const result = await grantTestPoints(amount);
      return {
        ok: Boolean(result?.awarded),
        message: result?.message || `Granted ${amount} test points`,
        adminTest: true,
      };
    },
    [adminUser, grantTestPoints],
  );

  const handleResetTestPoints = useCallback(async () => {
    if (!isAdmin(adminUser)) return { ok: false, error: 'Not authorized' };
    await saveAdminSession({ sandbox: true });
    await resetRewards();
    return { ok: true, message: 'Test points reset (sandbox)' };
  }, [adminUser, resetRewards]);

  const handleToggleVipLifetime = useCallback(
    async (enabled) => {
      if (!isAdmin(adminUser)) return { ok: false, error: 'Not authorized' };
      await saveAdminSession({ sandbox: true });
      if (enabled) {
        const saved = await saveMembershipProfile({
          ...membershipFromPlanId(VIP_LIFETIME_PLAN),
          email: adminUser.email,
          role: adminUser.role,
          adminTest: true,
        });
        applyMembership(saved);
        return { ok: true, message: 'VIP lifetime ON (device sandbox)' };
      }
      const saved = await saveMembershipProfile({
        tier: MEMBERSHIP_TIERS.FREE_EXPLORER,
        planId: null,
        subscriptionPlan: null,
        isPro: false,
        isSubscribed: false,
        email: adminUser.email,
        role: adminUser.role,
        adminTest: true,
      });
      applyMembership(saved);
      setIsPro(false);
      setUserSubscriptionType(null);
      setSubscriptionProductId(null);
      return { ok: true, message: 'VIP lifetime OFF' };
    },
    [adminUser, applyMembership],
  );

  const handleVipRedeemed = useCallback(
    (membership, result = {}) => {
      applyMembership(membership);
      const isFoundingMother =
        result?.variant === 'founding_mother' ||
        membership?.tier === MEMBERSHIP_TIERS.FOUNDING_MOTHER ||
        membership?.membershipTier === MEMBERSHIP_TIERS.FOUNDING_MOTHER;
      setPremiumWelcomeVariant(isFoundingMother ? 'founding_mother' : 'vip');
      setPremiumWelcomePlan(
        isFoundingMother ? 'Founding Mother · Lifetime Access' : 'VIP Lifetime Access',
      );
      setPremiumWelcomeOpen(true);
      setSubscriptionOpen(false);
      setUpgradeSheetOpen(false);
      // Stay in / return to the main app dashboard with Pro unlocked.
      if (typeof window !== 'undefined' && window.location?.pathname !== '/app') {
        try {
          window.history.replaceState({}, document.title, '/app');
        } catch (_) {
          /* ignore */
        }
      }
      setTimeout(() => {
        addPoints(VIP_WELCOME_POINTS, 'vipPromo');
      }, 400);
    },
    [applyMembership, addPoints],
  );

  const handleOpenSubscription = useCallback(() => {
    setSubscriptionOpen(true);
  }, []);

  const handleReleaseUpgradePrompt = useCallback(() => {
    setUpgradeSheetOpen(true);
  }, []);

  const handleUpgradeMonthly = useCallback(() => {
    void openStripeCheckout('monthly', { email: memberEmail });
  }, [memberEmail]);

  const handleUpgradeFounding = useCallback(() => {
    void openStripeCheckout('annual', { email: memberEmail });
  }, [memberEmail]);
  const [ventingHistory, setVentingHistory] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [kickSession, setKickSession] = useState({ count: 0, startedAt: null });
  const [kickSessionLog, setKickSessionLog] = useState([]);
  const kickLogIdRef = useRef(0);
  const [kitchenTherapeuticTags, setKitchenTherapeuticTags] = useState(null);
  const [pregnancySanctuaryOpen, setPregnancySanctuaryOpen] = useState(false);
  const [nurseryWelcomeOpen, setNurseryWelcomeOpen] = useState(false);
  const [nurserySurvivalTasks, setNurserySurvivalTasks] = useState(
    DEFAULT_NURSERY_SURVIVAL_CHECKLIST,
  );
  const nurserySurvivalDayRef = useRef(getPostpartumWinsDayKey());
  const symptomLogIdRef = useRef(0);
  const [selectedPostpartumVibes, setSelectedPostpartumVibes] = useState([]);
  const [postpartumVibeHistory, setPostpartumVibeHistory] = useState([]);
  const [mamaWinsTasks, setMamaWinsTasks] = useState(DEFAULT_MAMA_WINS);
  const [selectedToddlerVibes, setSelectedToddlerVibes] = useState([]);
  const [toddlerVibeHistory, setToddlerVibeHistory] = useState([]);
  const [toddlerWinsTasks, setToddlerWinsTasks] = useState(DEFAULT_TODDLER_WINS);
  const [littleHorizonsHistory, setLittleHorizonsHistory] = useState([]);
  const toddlerVibeLogIdRef = useRef(0);
  const toddlerWinsDayRef = useRef(getToddlerAnchorsDayKey());
  const toddlerDailyHydratedRef = useRef(false);
  const [milestoneScrapbook, setMilestoneScrapbook] = useState({});
  const [timeCapsuleEntries, setTimeCapsuleEntries] = useState({});
  const [goldenHourKeepsakes, setGoldenHourKeepsakes] = useState([]);
  const goldenHourIdRef = useRef(0);
  const postpartumVibeLogIdRef = useRef(0);
  const postpartumWinsDayRef = useRef(getPostpartumWinsDayKey());
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

  const isMobileWeb = useMobileWebLayout();
  const bottomNavStyle = getBottomNavStyle(isMobileWeb);

  useEffect(() => {
    if (userJourney !== 'postpartum') return undefined;

    const applyDailyWins = () => {
      const today = getPostpartumWinsDayKey();
      setMamaWinsTasks((prev) => {
        if (prev?.length && String(prev[0]?.id || '').startsWith(today)) {
          return prev;
        }
        postpartumWinsDayRef.current = today;
        return getPostpartumDailyWins();
      });
      if (nurserySurvivalDayRef.current !== today) {
        nurserySurvivalDayRef.current = today;
        setNurserySurvivalTasks(DEFAULT_NURSERY_SURVIVAL_CHECKLIST);
      }
    };

    applyDailyWins();
    const intervalId = setInterval(applyDailyWins, 60_000);
    return () => clearInterval(intervalId);
  }, [userJourney]);

  // Rotate Daily Toddler Anchors once per calendar day (same pattern as mama wins).
  useEffect(() => {
    if (userJourney !== 'postpartum') return undefined;

    const applyToddlerAnchors = () => {
      const today = getToddlerAnchorsDayKey();
      setToddlerWinsTasks((prev) => {
        if (prev?.length && String(prev[0]?.id || '').startsWith(today)) {
          return prev;
        }
        toddlerWinsDayRef.current = today;
        return getToddlerDailyAnchors();
      });
    };

    applyToddlerAnchors();
    const intervalId = setInterval(applyToddlerAnchors, 60_000);
    return () => clearInterval(intervalId);
  }, [userJourney]);

  // Hydrate toddler vibe notes + anchors from disk once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadToddlerDailyState();
      if (cancelled) return;
      toddlerDailyHydratedRef.current = true;
      setSelectedToddlerVibes(saved.selectedVibes || []);
      setToddlerVibeHistory(saved.vibeHistory || []);
      setToddlerWinsTasks(saved.winsTasks || getToddlerDailyAnchors());
      toddlerWinsDayRef.current = saved.winsDayKey || getToddlerAnchorsDayKey();
      if (saved.vibeHistory?.length) {
        const maxId = saved.vibeHistory.reduce((max, entry) => {
          const n = Number(entry?.id);
          return Number.isFinite(n) ? Math.max(max, n) : max;
        }, 0);
        toddlerVibeLogIdRef.current = maxId;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist toddler daily village whenever notes / anchors change.
  useEffect(() => {
    if (!toddlerDailyHydratedRef.current) return;
    saveToddlerDailyState({
      selectedVibes: selectedToddlerVibes,
      vibeHistory: toddlerVibeHistory,
      winsTasks: toddlerWinsTasks,
      winsDayKey: toddlerWinsDayRef.current || getToddlerAnchorsDayKey(),
    });
  }, [selectedToddlerVibes, toddlerVibeHistory, toddlerWinsTasks]);

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
    if (!isOnboarded || birthdayBoutiqueOpen) return;
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
  ]);

  // BACKGROUND, LOGO & FLOW TRANSITION DRIVERS
  const pulseAnim = useRef(new Animated.Value(0.95)).current;
  const pulseLoopRef = useRef(null);
  const shellEnterAnim = useRef(new Animated.Value(1)).current;
  const flowAnim = useRef(new Animated.Value(1)).current;
  const flowReady = useRef(false);
  const onboardingStepBlend = useRef(new Animated.Value(0)).current;
  /** Hardware-accelerated canvas for onboarding ↔ main and page fades (opacity only). */
  const sceneCanvasOpacity = useRef(new Animated.Value(1)).current;
  const tabSceneOpacity = useRef(new Animated.Value(1)).current;
  const sceneSwapLockRef = useRef(false);
  const enteringFromOnboardingRef = useRef(false);
  const shellBootSettledRef = useRef(false);
  const skipInitialFlowRef = useRef(true);
  const skipJourneyFlowAfterOnboardingRef = useRef(false);

  const pendingSanctuaryDeepLinkRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const boot = await loadBootState();
        if (!mounted) return;

        pendingSanctuaryDeepLinkRef.current = consumeSanctuaryJournalDeepLink();

        if (boot.profile) {
          applyProfileSnapshot(boot.profile, {
            setMamaName,
            setUserJourney,
            setWeeksPregnant,
            setDueDate,
            setBabyAge,
            setCurrentPregnancy,
            setChildren,
            setActiveMode,
            setHomeTrack,
            setMamaBirthday,
            setApproximateCity,
            setUsState,
            setMamaDiscovery,
            setProfilePhotoUri,
            setTimeCapsuleEntries: (entries) =>
              setTimeCapsuleEntries(normalizeTimeCapsuleEntries(entries)),
          });
        }

        // Membership: Stripe success return (?upgraded=1&plan=monthly|annual) unlocks Pro.
        const upgraded = await consumeStripeUpgradeReturn();
        if (upgraded) {
          applyMembership(upgraded);
          // Stripe return should land in the live app, not re-run onboarding.
          setIsOnboarded(true);
          setHasCompletedOnboarding(true).catch(() => {});
          setPremiumWelcomePlan(
            upgraded.planId === 'yearly' || upgraded.planId === 'annual'
              ? 'Founding / Annual plan'
              : upgraded.planId === 'gift'
                ? 'Gift membership'
                : 'Village Access · Monthly',
          );
          setPremiumWelcomeVariant('premium');
          setPremiumWelcomeOpen(true);
          // Soft delay so rewards hydrate before the upgrade bonus lands.
          setTimeout(() => {
            addPoints(250, 'subscriptionUpgrade');
          }, 400);
        } else {
          const membership = await loadMembershipProfile();
          if (membership) applyMembership(membership);
        }

        if (FORCE_ONBOARDING_LAYOUT_AUDIT) {
          await setHasCompletedOnboarding(false).catch(() => {});
          setOnboardingStep('intake');
          setIsOnboarded(false);
          if (__DEV__ && typeof console !== 'undefined') {
            console.info('[CalmMama Village] FORCE_ONBOARDING_LAYOUT_AUDIT — onboarding intake');
          }
        } else if (upgraded || boot.hasCompletedOnboarding) {
          setIsOnboarded(true);
        } else {
          setOnboardingStep('intake');
          setIsOnboarded(false);
        }
      } catch (err) {
        if (__DEV__ && typeof console !== 'undefined') {
          console.warn('[CalmMama Village] Boot hydrate failed:', err);
        }
        if (mounted) {
          setOnboardingStep('intake');
          setIsOnboarded(false);
        }
      } finally {
        if (mounted) {
          setBootHydrated(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [applyMembership, addPoints]);

  // Only reset intake when leaving the main app (e.g. delete account) —
  // never while mid-flow on the feature highlights step.
  const wasOnboardedRef = useRef(false);
  useEffect(() => {
    const wasOnboarded = wasOnboardedRef.current;
    wasOnboardedRef.current = isOnboarded;
    if (wasOnboarded && !isOnboarded) {
      onboardingStepBlend.setValue(0);
      setOnboardingStep('intake');
    }
  }, [isOnboarded, onboardingStepBlend]);

  useEffect(() => {
    if (!isOnboarded) return;
    const timer = setTimeout(() => {
      saveVillageProfile(
        buildProfileSnapshot({
          mamaName,
          userJourney: activeMode === ACTIVE_MODES.HYBRID ? ACTIVE_MODES.HYBRID : userJourney,
          weeksPregnant,
          dueDate,
          babyAge,
          currentPregnancy,
          children,
          activeMode,
          homeTrack,
          mamaBirthday,
          approximateCity,
          usState,
          mamaDiscovery,
          profilePhotoUri,
          timeCapsuleEntries,
        })
      ).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [
    isOnboarded,
    mamaName,
    userJourney,
    weeksPregnant,
    dueDate,
    babyAge,
    currentPregnancy,
    children,
    activeMode,
    homeTrack,
    mamaBirthday,
    approximateCity,
    usState,
    mamaDiscovery,
    profilePhotoUri,
    timeCapsuleEntries,
  ]);

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

  // Skip enter springs on cold boot — only animate after the shell has settled once.
  useEffect(() => {
    if (!bootHydrated || !isOnboarded) return;

    if (enteringFromOnboardingRef.current) {
      enteringFromOnboardingRef.current = false;
      shellEnterAnim.setValue(1);
      flowAnim.setValue(1);
      flowReady.current = true;
      return;
    }

    if (!shellBootSettledRef.current) {
      shellBootSettledRef.current = true;
      shellEnterAnim.setValue(1);
      flowAnim.setValue(1);
      flowReady.current = true;
    }
  }, [bootHydrated, isOnboarded, shellEnterAnim, flowAnim]);

  useEffect(() => {
    if (!isOnboarded) return;
    startLogoPulseLoop(pulseAnim, pulseLoopRef);
  }, [userJourney, isOnboarded, pulseAnim]);

  // Journey context — fade-in only (tab presses use runVillageTabTransition)
  useEffect(() => {
    if (!isOnboarded) return;
    if (skipJourneyFlowAfterOnboardingRef.current) {
      skipJourneyFlowAfterOnboardingRef.current = false;
      flowAnim.setValue(1);
      flowReady.current = true;
      return;
    }
    if (skipInitialFlowRef.current) {
      skipInitialFlowRef.current = false;
      flowAnim.setValue(1);
      flowReady.current = true;
      return;
    }
    animateVillageTabFlow(flowAnim, flowReady);
  }, [userJourney, isOnboarded, flowAnim]);

  useEffect(() => {
    if (!isOnboarded) return;
    // Defer heavy lounge mount so it doesn't compete with Home's first paint.
    let cancelled = false;
    const handle = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (cancelled) return;
        setMidnightLoungeMounted(true);
        guardPromise(warmMidnightLounge(userJourney), 'App:warmMidnightLounge');
      }, 600);
    });
    if (userJourney === 'pregnant') {
      guardPromise(
        import('./pregnancyOraclePreload').then(({ warmPregnancyOracle }) => warmPregnancyOracle()),
        'App:warmPregnancyOracle',
      );
      warmBloomVideos(weeksPregnant);
      warmPregnantKitchenImages();
    }
    return () => {
      cancelled = true;
      handle?.cancel?.();
    };
  }, [isOnboarded, userJourney, weeksPregnant]);

  useEffect(() => {
    if (userJourney !== 'postpartum') return;
    guardPromise(warmPostpartumHome(userJourney, babyAge), 'App:warmPostpartumHome');
  }, [userJourney, babyAge, isOnboarded]);

  const runTabTransition = useCallback(
    (nextTab) => {
      if (nextTab === activeTab) return;
      if (nextTab === 'tracker' && userJourney === 'pregnant') {
        warmBloomVideos(weeksPregnant);
      }

      const finishTabSwap = () => {
        setInMidnightLounge(false);
        bottomNavOpacity.setValue(1);
        bottomNavTranslateY.setValue(0);
        setInVillagePortal(false);
        setActiveTab(nextTab);
        if (nextTab === 'home' && userJourney === 'postpartum') {
          warmPostpartumHome(userJourney, babyAge);
        }
        if (nextTab === 'kitchen' && userJourney === 'pregnant') {
          requestAnimationFrame(() => warmAllPregnantKitchenImages());
        }
      };

      // Pregnant: instant tab swap — opacity fade was popping the Bloom video frame.
      if (userJourney === 'pregnant') {
        suppressVillageLayoutAnimation();
        flowAnim.stopAnimation();
        flowAnim.setValue(1);
        flowReady.current = true;
        tabSceneOpacity.setValue(1);
        finishTabSwap();
        return;
      }

      const runTransition =
        userJourney === 'postpartum'
          ? runPregnantVillageTabTransition
          : runVillageTabTransition;
      runTransition(flowAnim, flowReady, finishTabSwap);
    },
    [activeTab, flowAnim, bottomNavOpacity, bottomNavTranslateY, userJourney, weeksPregnant, babyAge, tabSceneOpacity]
  );

  const notificationNavRef = useRef({
    runTabTransition: () => {},
    openMidnightLounge: () => {},
  });
  const initialNotificationHandledRef = useRef(false);

  const handleNotificationRoute = useCallback((route) => {
    if (!route || !isKnownNotificationRoute(route)) return;

    setInVillagePortal(false);

    if (route === NOTIFICATION_ROUTES.MIDNIGHT_LOUNGE) {
      notificationNavRef.current.openMidnightLounge();
      return;
    }

    if (route === NOTIFICATION_ROUTES.BLOOM) {
      notificationNavRef.current.runTabTransition('tracker');
      return;
    }

    if (route === NOTIFICATION_ROUTES.NURSERY) {
      notificationNavRef.current.runTabTransition('nursery');
      return;
    }

    if (route === NOTIFICATION_ROUTES.KITCHEN) {
      notificationNavRef.current.runTabTransition('kitchen');
      return;
    }

    notificationNavRef.current.runTabTransition('home');
  }, []);

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

  const handleToggleToddlerVibe = (vibeId) => {
    const option = TODDLER_VIBES.find((v) => v.id === vibeId);
    if (!option) return;

    setSelectedToddlerVibes((prev) => {
      const isActive = prev.includes(vibeId);
      const next = isActive ? prev.filter((id) => id !== vibeId) : [...prev, vibeId];
      const tags = collectTherapeuticTagsFromVibes(next);
      setKitchenTherapeuticTags(tags.length ? tags : null);
      return next;
    });
  };

  const handleSaveToddlerVibeEntry = useCallback(
    ({ vibeId, emoji, label, note }) => {
      const option = TODDLER_VIBES.find((v) => v.id === vibeId);
      if (!option && !label) return;

      setSelectedToddlerVibes((prev) => {
        const next = prev.includes(vibeId) ? prev : [...prev, vibeId];
        const tags = collectTherapeuticTagsFromVibes(next);
        setKitchenTherapeuticTags(tags.length ? tags : null);
        return next;
      });

      const now = new Date();
      toddlerVibeLogIdRef.current += 1;
      setToddlerVibeHistory((history) =>
        [
          {
            id: toddlerVibeLogIdRef.current,
            vibeId,
            emoji: emoji || option?.emoji || '✨',
            label: label || option?.label || 'Mood',
            note: String(note || '').trim(),
            time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            date: now.toLocaleDateString(),
            at: now.toISOString(),
          },
          ...history,
        ].slice(0, 80),
      );

      notify({
        category: 'nursery',
        title: 'Toddler Mood Note',
        message: String(note || '').trim()
          ? 'Mood + note saved — you can reread it anytime.'
          : 'Mood saved to your toddler vibe journal.',
      });
    },
    [notify],
  );

  const handleToggleToddlerWin = (taskId) => {
    setToddlerWinsTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    );
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

  const handleOpenInfoModal = useCallback((type) => {
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
  }, [infoModalOpacity, infoModalScale, infoModalTranslateX, infoModalTranslateY]);

  const handleOpenAboutFooter = useCallback(() => handleOpenInfoModal('about'), [handleOpenInfoModal]);
  const handleOpenContactFooter = useCallback(() => handleOpenInfoModal('contact'), [handleOpenInfoModal]);
  const handleOpenLegalFooter = useCallback(() => handleOpenInfoModal('legal'), [handleOpenInfoModal]);

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
      'Delete Account',
      'Are you sure you want to permanently delete your account and data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            await clearAllVillageStorage();
            await resetRewards();
            await setHasCompletedOnboarding(false);
            setInfoModalType(null);
            setInMidnightLounge(false);
            setMidnightLoungeMounted(false);
            setPostpartumLoungeOverlayActive(false);
            setInVillagePortal(false);
            setApothecaryDetailProductId(null);
            setCandleSanctumOpen(false);
            setActiveTab('home');
            setUserJourney('pregnant');
            setActiveMode(ACTIVE_MODES.PREGNANT);
            setHomeTrack(HOME_TRACKS.PREGNANT);
            setCurrentPregnancy({ weeksPregnant: '24', dueDate: '' });
            setChildren([]);
            setMamaName('Mama');
            setMamaBirthday(null);
            setMemberEmail(null);
            setMemberRole('member');
            setIsPro(false);
            setUserSubscriptionType(null);
            setSubscriptionProductId(null);
            setMembershipTier(MEMBERSHIP_TIERS.FREE_EXPLORER);
            setMamaDiscovery(DEFAULT_MAMA_DISCOVERY);
            setGuidanceHistory([]);
            setVentingHistory([]);
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
            setNurserySurvivalTasks(DEFAULT_NURSERY_SURVIVAL_CHECKLIST);
            setPregnancySanctuaryOpen(false);
            setNurseryWelcomeOpen(false);
            setSelectedPostpartumVibes([]);
            setPostpartumVibeHistory([]);
            setMamaWinsTasks(getPostpartumDailyWins());
            setSelectedToddlerVibes([]);
            setToddlerVibeHistory([]);
            setToddlerWinsTasks(getToddlerDailyAnchors());
            setLittleHorizonsHistory([]);
            setOnboardingStep('intake');
            onboardingStepBlend.setValue(0);
            initialNotificationHandledRef.current = false;
            setIsOnboarded(false);
            cancelAllVillageNotifications().catch(() => {});
          },
        },
      ]
    );
  };

  const handleOpenVillagePortal = () => {
    setVillagePortalTab('constellation');
    setSelectedVillageMamaId(null);
    setInVillagePortal(true);
  };

  const handlePickProfilePhoto = async () => {
    try {
      const { pickProfilePhotoUri } = await import('./pickProfilePhoto');
      const uri = await pickProfilePhotoUri();
      if (uri) setProfilePhotoUri(uri);
    } catch (_) {
      Alert.alert('Upload failed', 'We could not update your profile photo. Please try again.');
    }
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
      const pickIndex = remedyPickRef.current[symptomId] ?? 0;
      remedyPickRef.current[symptomId] = pickIndex + 1;
      setRemedyPopupPickIndex(pickIndex);
      setRemedyPopupSymptomId(symptomId);
      return;
    }

    const pickIndex = remedyPickRef.current[symptomId] ?? 0;
    remedyPickRef.current[symptomId] = pickIndex + 1;
    setRemedyPopupPickIndex(pickIndex);
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

  const handleDeselectSymptom = (symptomId) => {
    if (!selectedSymptoms.includes(symptomId)) return;
    if (remedyPopupSymptomId === symptomId) {
      setRemedyPopupSymptomId(null);
    }
    const next = selectedSymptoms.filter((id) => id !== symptomId);
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

  const foundingGiftsYearlyEligible = isYearlyFoundingGiftTier(
    userSubscriptionType,
    subscriptionProductId
  );

  const handleSubscriptionCheckout = useCallback(
    async (planId, options = {}) => {
      const productId = getSubscriptionProductId(planId);
      setUserSubscriptionType(planId);
      setSubscriptionProductId(productId);
      setSubscriptionOpen(false);

      // Stripe Payment Link redirects away — unlock happens on ?upgraded=1 return.
      if (options?.deferredUnlock) {
        return;
      }

      const tier =
        planId === 'yearly' || planId === 'gift'
          ? MEMBERSHIP_TIERS.FOUNDING40
          : MEMBERSHIP_TIERS.GENERAL;
      const saved = await saveMembershipProfile({
        tier,
        planId,
        email: memberEmail,
        isSubscribed: isPremiumSubscribed(planId),
      });
      applyMembership(saved);
    },
    [applyMembership, memberEmail],
  );

  const refreshFoundingGiftsCount = useCallback(async () => {
    const count = await fetchFoundingGiftsClaimCount();
    setFoundingGiftsClaimCount(count);
    setFoundingGiftsUserClaimed(hasUserClaimedFoundingGift());
  }, []);

  const handleClaimFoundingGift = useCallback(async () => {
    if (!foundingGiftsYearlyEligible) return;
    if (!isFoundingGiftsAvailable(foundingGiftsClaimCount) || foundingGiftsUserClaimed) return;
    setFoundingGiftsClaiming(true);
    try {
      const nextCount = await submitFoundingGiftClaim({
        mamaName,
        email: checkoutEmail,
        user: adminUser,
      });
      setFoundingGiftsClaimCount(nextCount);
      setFoundingGiftsUserClaimed(true);
      Alert.alert(
        'Bundle claimed!',
        'Your founding sisters tote, pin & mug bundle is on its way. We will email shipping details soon.'
      );
    } catch (err) {
      Alert.alert('Unable to claim', err?.message || 'Please try again in a moment.');
      await refreshFoundingGiftsCount();
    } finally {
      setFoundingGiftsClaiming(false);
    }
  }, [
    adminUser,
    checkoutEmail,
    foundingGiftsClaimCount,
    foundingGiftsUserClaimed,
    foundingGiftsYearlyEligible,
    mamaName,
    refreshFoundingGiftsCount,
  ]);

  useEffect(() => {
    if (!inVillagePortal) return;
    refreshFoundingGiftsCount();
  }, [inVillagePortal, refreshFoundingGiftsCount]);

  const handleOpenMidnightLounge = useCallback((opts = {}) => {
    if (midnightLoungeAnimatingRef.current) return;

    const nextTab = opts?.tab === 'profile' ? 'profile' : 'home';
    setLoungeFocusTab(nextTab);
    setLoungeFocusToken((token) => token + 1);
    setAutoOpenSanctuaryJournal(Boolean(opts?.openJournal));
    if (typeof opts?.journalPrompt === 'string') {
      setSanctuaryJournalPrompt(opts.journalPrompt);
    }

    warmMidnightLounge(userJourney);
    setInVillagePortal(false);
    setMidnightLoungeMounted(true);
    midnightLoungeAnimatingRef.current = true;

    if (userJourney === 'pregnant') {
      setInMidnightLounge(true);
      Animated.parallel([
        animateMidnightLoungeOpen({
          opacity: midnightLoungeOpacity,
          scale: midnightLoungeScale,
          translateY: midnightLoungeTranslateY,
        }),
        animateBottomNavHide({
          opacity: bottomNavOpacity,
          translateY: bottomNavTranslateY,
        }),
      ]).start(() => {
        midnightLoungeAnimatingRef.current = false;
      });
      return;
    }

    if (userJourney === 'postpartum') {
      setPostpartumLoungeOverlayActive(true);
      setInMidnightLounge(true);
      Animated.parallel([
        animateMidnightLoungeOpen({
          opacity: midnightLoungeOpacity,
          scale: midnightLoungeScale,
          translateY: midnightLoungeTranslateY,
        }),
        animateBottomNavHide({
          opacity: bottomNavOpacity,
          translateY: bottomNavTranslateY,
        }),
      ]).start(() => {
        midnightLoungeAnimatingRef.current = false;
      });
      return;
    }

    setInMidnightLounge(true);
    Animated.parallel([
      animateMidnightLoungeOpen({
        opacity: midnightLoungeOpacity,
        scale: midnightLoungeScale,
        translateY: midnightLoungeTranslateY,
      }),
      animateBottomNavHide({
        opacity: bottomNavOpacity,
        translateY: bottomNavTranslateY,
      }),
    ]).start(() => {
      midnightLoungeAnimatingRef.current = false;
    });
  }, [
    userJourney,
    midnightLoungeOpacity,
    midnightLoungeScale,
    midnightLoungeTranslateY,
    bottomNavOpacity,
    bottomNavTranslateY,
  ]);

  useEffect(() => {
    if (!bootHydrated || !isOnboarded) return;
    const deep = pendingSanctuaryDeepLinkRef.current;
    if (!deep) return;
    pendingSanctuaryDeepLinkRef.current = null;

    if (deep.stage === 'hybrid') {
      setActiveMode(ACTIVE_MODES.HYBRID);
      setUserJourney(ACTIVE_MODES.HYBRID);
    } else if (deep.stage === 'postpartum') {
      setActiveMode(ACTIVE_MODES.POSTPARTUM);
      setUserJourney('postpartum');
      setHomeTrack(HOME_TRACKS.TODDLER);
    } else if (deep.openJournal) {
      setActiveMode(ACTIVE_MODES.PREGNANT);
      setUserJourney('pregnant');
      setHomeTrack(HOME_TRACKS.PREGNANT);
    }

    const timer = setTimeout(() => {
      if (deep.openRewards) {
        handleOpenMidnightLounge({ tab: 'profile' });
        return;
      }
      handleOpenMidnightLounge({
        openJournal: Boolean(deep.openJournal),
        journalPrompt: deep.prompt || '',
      });
    }, 420);
    return () => clearTimeout(timer);
  }, [bootHydrated, isOnboarded, handleOpenMidnightLounge]);

  const handleCloseMidnightLounge = useCallback(() => {
    if (midnightLoungeAnimatingRef.current || !inMidnightLounge) return;

    midnightLoungeAnimatingRef.current = true;
    setAutoOpenSanctuaryJournal(false);

    Animated.parallel([
      animateMidnightLoungeClose({
        opacity: midnightLoungeOpacity,
        scale: midnightLoungeScale,
        translateY: midnightLoungeTranslateY,
      }),
      animateBottomNavShow({
        opacity: bottomNavOpacity,
        translateY: bottomNavTranslateY,
      }),
    ]).start(({ finished }) => {
      midnightLoungeAnimatingRef.current = false;
      if (!finished) return;
      // Defer hide until bloom finishes — avoids z-index snap mid-animation
      setInMidnightLounge(false);
      setPostpartumLoungeOverlayActive(false);
      setLoungeFocusTab('home');
    });
  }, [
    inMidnightLounge,
    midnightLoungeOpacity,
    midnightLoungeScale,
    midnightLoungeTranslateY,
    bottomNavOpacity,
    bottomNavTranslateY,
  ]);

  useEffect(() => {
    notificationNavRef.current = {
      runTabTransition,
      openMidnightLounge: handleOpenMidnightLounge,
      closeMidnightLounge: handleCloseMidnightLounge,
    };
  }, [runTabTransition, handleOpenMidnightLounge, handleCloseMidnightLounge]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    bootstrapVillageNotifications()
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        unsubscribe = subscribeToNotificationResponses(handleNotificationRoute);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [handleNotificationRoute]);

  useEffect(() => {
    if (!isOnboarded || initialNotificationHandledRef.current) return;
    initialNotificationHandledRef.current = true;
    const villageRoute = consumeVillageTabDeepLink();
    if (villageRoute) {
      handleNotificationRoute(villageRoute);
      return;
    }
    consumeInitialNotificationRoute()
      .then((route) => {
        if (route) {
          handleNotificationRoute(route);
        }
      })
      .catch(() => {});
  }, [isOnboarded, handleNotificationRoute]);

  useEffect(() => {
    if (!isOnboarded) return;
    const journeyForNotifications =
      activeMode === ACTIVE_MODES.HYBRID
        ? 'hybrid'
        : effectiveJourney === 'postpartum'
          ? 'postpartum'
          : 'pregnant';
    syncVillageNotificationSchedule(journeyForNotifications).catch((err) => {
      if (__DEV__ && typeof console !== 'undefined') {
        console.warn('[CalmMama Village] Notification schedule sync failed:', err);
      }
    });
    if (Platform.OS === 'web') {
      import('./pwaWebPush')
        .then((mod) =>
          mod.resyncVillageWebPushSubscription?.({ journey: journeyForNotifications }),
        )
        .catch(() => {});
    }
  }, [isOnboarded, activeMode, effectiveJourney]);

  // Soft weekly Bloom reminder — once per calendar week for pregnant / hybrid mamas.
  useEffect(() => {
    if (!bootHydrated || !isOnboarded) return undefined;

    const pregnantTrack =
      effectiveJourney === 'pregnant' ||
      (activeMode === ACTIVE_MODES.HYBRID &&
        hasPregnancyTrack({ currentPregnancy, weeksPregnant, dueDate }));

    if (!pregnantTrack) return undefined;

    let cancelled = false;
    const timer = setTimeout(() => {
      claimWeeklyBloomReminder({ weeksPregnant })
        .then((reminder) => {
          if (cancelled || !reminder) return;
          notify({
            category: 'bloom',
            title: reminder.title,
            message: reminder.message,
            emoji: reminder.emoji,
            durationMs: 5600,
            onPress: () => {
              setInVillagePortal(false);
              if (activeMode === ACTIVE_MODES.HYBRID) {
                setHomeTrack(HOME_TRACKS.PREGNANT);
              }
              runTabTransition('tracker');
            },
          });
        })
        .catch(() => {
          /* non-blocking */
        });
    }, 1400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    bootHydrated,
    isOnboarded,
    effectiveJourney,
    activeMode,
    currentPregnancy,
    weeksPregnant,
    dueDate,
    notify,
    runTabTransition,
  ]);

  const handleOpenKitchenTab = () => {
    runTabTransition('kitchen');
  };

  const handleToggleNurserySurvivalTask = useCallback((taskId) => {
    setNurserySurvivalTasks((prev) =>
      prev.map((item) => (item.id === taskId ? { ...item, done: !item.done } : item)),
    );
  }, []);

  const handleOpenPregnancySanctuary = useCallback(() => {
    setPregnancySanctuaryOpen(true);
  }, []);

  const handleChildrenChange = useCallback((nextChildren) => {
    setChildren(nextChildren);
    const primary = Array.isArray(nextChildren) ? nextChildren[0] : null;
    if (primary?.ageLabel) {
      setBabyAge(primary.ageLabel);
    }
  }, []);

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
    const kind = String(entry?.type || entry?.category || 'care').toLowerCase();
    const label =
      kind.includes('feed') || kind.includes('breast') || kind.includes('bottle')
        ? 'Feeding logged'
        : kind.includes('diaper')
          ? 'Diaper change logged'
          : kind.includes('sleep') || kind.includes('nap')
            ? 'Sleep logged'
            : 'Nursery moment logged';
    notify({
      category: 'nursery',
      title: 'Cloud Nursery',
      message: `${label} — you're tending the village.`,
    });
  };

  const handleAddGoldenHourKeepsake = (item) => {
    goldenHourIdRef.current += 1;
    setGoldenHourKeepsakes((prev) => [
      { id: goldenHourIdRef.current, ...item },
      ...prev,
    ]);
  };

  const handleSelectOnboardingJourney = useCallback((journey) => {
    if (journey === 'hybrid') {
      setActiveMode(ACTIVE_MODES.HYBRID);
      setUserJourney(ACTIVE_MODES.HYBRID);
      setHomeTrack(HOME_TRACKS.PREGNANT);
      setCurrentPregnancy(normalizeCurrentPregnancy(null, weeksPregnant || '24', dueDate));
      const childAge =
        babyAge && babyAge !== 'Newborn' ? babyAge : '12-24 months';
      setBabyAge(childAge);
      setChildren([createChildEntry({ ageLabel: childAge })]);
      return;
    }
    if (journey === 'pregnant') {
      setActiveMode(ACTIVE_MODES.PREGNANT);
      setUserJourney('pregnant');
      setHomeTrack(HOME_TRACKS.PREGNANT);
      setCurrentPregnancy(normalizeCurrentPregnancy(null, weeksPregnant || '24', dueDate));
      setChildren([]);
      return;
    }
    setActiveMode(ACTIVE_MODES.POSTPARTUM);
    setUserJourney('postpartum');
    setHomeTrack(HOME_TRACKS.TODDLER);
    setChildren(normalizeChildren([], babyAge || 'Newborn'));
  }, [weeksPregnant, dueDate, babyAge]);

  const handleHomeTrackChange = useCallback((track) => {
    setHomeTrack(track);
  }, []);

  const handleGraduationSwitch = () => {
    setBirthPromptOpen(false);
    const newborn = createChildEntry({ ageLabel: 'Newborn', stage: 'infant' });
    setChildren((prev) => {
      const withoutDup = (prev || []).filter(
        (child) => String(child.ageLabel).toLowerCase() !== 'newborn',
      );
      return [newborn, ...withoutDup];
    });
    setBabyAge('Newborn');
    setCurrentPregnancy(null);
    setWeeksPregnant('');
    setDueDate('');
    setActiveMode(ACTIVE_MODES.POSTPARTUM);
    setUserJourney('postpartum');
    setHomeTrack(HOME_TRACKS.TODDLER);
    setActiveTab('nursery');
    setNurserySurvivalTasks(DEFAULT_NURSERY_SURVIVAL_CHECKLIST);
    nurserySurvivalDayRef.current = getPostpartumWinsDayKey();
    setNurseryWelcomeOpen(true);
  };

  const handleExploreNurseryWelcome = () => {
    setNurseryWelcomeOpen(false);
    setActiveTab('nursery');
  };

  const handleOpenBirthPrompt = () => {
    setBirthPromptReason('early');
    setBirthPromptOpen(true);
  };

  const handleDismissBirthPrompt = () => {
    setBirthPromptOpen(false);
    setBirthPromptDismissed(true);
  };

  const handleContinueOnboarding = () => {
    if (sceneSwapLockRef.current) return;
    sceneSwapLockRef.current = true;
    suppressVillageLayoutAnimation();

    // Navigate first — defer asset warm so a web asset bug can never block Continue.
    runNativeOpacitySceneSwap(sceneCanvasOpacity, () => {
      onboardingStepBlend.setValue(1);
      setOnboardingStep('welcome');
    }, {
      onComplete: () => {
        sceneSwapLockRef.current = false;
        setTimeout(() => {
          try {
            if (userJourney === 'postpartum') {
              warmPostpartumHome(userJourney, babyAge);
            } else if (userJourney === 'pregnant') {
              warmPregnantHome(userJourney, weeksPregnant);
            }
          } catch (_) {
            /* warm is best-effort */
          }
        }, 0);
      },
    });
  };

  const handleCompleteOnboarding = async () => {
    if (sceneSwapLockRef.current) return;
    sceneSwapLockRef.current = true;

    const profile = buildProfileSnapshot({
      mamaName,
      userJourney: activeMode === ACTIVE_MODES.HYBRID ? ACTIVE_MODES.HYBRID : userJourney,
      weeksPregnant,
      dueDate,
      babyAge,
      currentPregnancy,
      children,
      activeMode,
      homeTrack,
      mamaBirthday,
      approximateCity,
      usState,
      mamaDiscovery,
      profilePhotoUri,
    });

    const persistOnboarding = () => {
      guardPromise(
        (async () => {
          await setHasCompletedOnboarding(true);
          await saveVillageProfile(profile);
        })(),
        'onboarding:persistProfile',
      );
      import('./MidnightLoungeScreen');
    };

    suppressVillageLayoutAnimation();
    enteringFromOnboardingRef.current = true;
    skipJourneyFlowAfterOnboardingRef.current = true;
    shellEnterAnim.setValue(1);
    bottomNavOpacity.setValue(1);
    bottomNavTranslateY.setValue(0);
    flowAnim.setValue(1);
    flowReady.current = true;
    tabSceneOpacity.setValue(1);

    runNativeOpacitySceneSwap(sceneCanvasOpacity, () => {
      setActiveTab('home');
      setOnboardingStep('intake');
      onboardingStepBlend.setValue(0);
      setIsOnboarded(true);
      persistOnboarding();
      if (userJourney === 'postpartum') {
        void warmPostpartumHome(userJourney, babyAge);
      } else if (userJourney === 'pregnant') {
        void warmPregnantHome(userJourney, weeksPregnant);
      }
    }, {
      onComplete: () => {
        sceneSwapLockRef.current = false;
      },
    });
  };

  const mainTabContentProps = useMemo(
    () => ({
      userJourney: effectiveJourney,
      activeMode,
      homeTrack,
      onHomeTrackChange: handleHomeTrackChange,
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
      minutesForMe,
      onMinutesForMeChange: setMinutesForMe,
      goldenHourKeepsakes,
      onAddGoldenHourKeepsake: handleAddGoldenHourKeepsake,
      weightEntries,
      setWeeksPregnant,
      setWeightEntries,
      onNotify: notify,
      onOpenBirthPrompt: handleOpenBirthPrompt,
      embedded: true,
      selectedSymptoms,
      onToggleSymptom: handleToggleSymptom,
      onDeselectSymptom: handleDeselectSymptom,
      symptomHistory,
      kickSession,
      kickSessionLog,
      onLogKick: handleLogKick,
      onSaveKickSession: handleSaveKickSession,
      onOpenPregnancySanctuary: handleOpenPregnancySanctuary,
      children,
      onChildrenChange: handleChildrenChange,
      nurserySurvivalTasks,
      onToggleNurserySurvivalTask: handleToggleNurserySurvivalTask,
      selectedPostpartumVibes,
      onTogglePostpartumVibe: handleTogglePostpartumVibe,
      postpartumVibeHistory,
      selectedToddlerVibes,
      onToggleToddlerVibe: handleToggleToddlerVibe,
      onSaveToddlerVibeEntry: handleSaveToddlerVibeEntry,
      toddlerVibeHistory,
      mamaWinsTasks,
      onToggleMamaWin: handleToggleMamaWin,
      toddlerWinsTasks,
      onToggleToddlerWin: handleToggleToddlerWin,
      littleHorizonsHistory,
      onSaveLittleHorizonsEntry: (entry) =>
        setLittleHorizonsHistory((prev) => [entry, ...prev].slice(0, 80)),
      pulseAnim,
      kitchenTherapeuticTags,
      onOpenKitchenTab: handleOpenKitchenTab,
      milestoneScrapbook,
      onSaveMilestoneEntry: (id, data) =>
        setMilestoneScrapbook((prev) => ({ ...prev, [id]: data })),
      timeCapsuleEntries,
      onSaveTimeCapsuleMonth: (monthId, data) =>
        setTimeCapsuleEntries((prev) => ({
          ...prev,
          [monthId]: normalizeTimeCapsuleEntry(data),
        })),
      isSubscribed,
      isYearlyMember: foundingGiftsYearlyEligible,
      onReleaseUpgradePrompt: handleReleaseUpgradePrompt,
      onOpenSubscription: handleOpenSubscription,
    }),
    [
      effectiveJourney,
      activeMode,
      homeTrack,
      handleHomeTrackChange,
      mamaName,
      weeksPregnant,
      dueDate,
      babyAge,
      nurseryLogs,
      nurseryPerspective,
      hydrationOz,
      hydrationGoal,
      minutesForMe,
      goldenHourKeepsakes,
      weightEntries,
      guidanceHistory,
      ventingHistory,
      selectedSymptoms,
      symptomHistory,
      kickSession,
      kickSessionLog,
      nurserySurvivalTasks,
      handleToggleNurserySurvivalTask,
      handleOpenPregnancySanctuary,
      handleChildrenChange,
      children,
      selectedPostpartumVibes,
      postpartumVibeHistory,
      selectedToddlerVibes,
      toddlerVibeHistory,
      mamaWinsTasks,
      toddlerWinsTasks,
      handleSaveToddlerVibeEntry,
      littleHorizonsHistory,
      pulseAnim,
      kitchenTherapeuticTags,
      milestoneScrapbook,
      timeCapsuleEntries,
      isSubscribed,
      foundingGiftsYearlyEligible,
      handleReleaseUpgradePrompt,
      handleOpenSubscription,
      notify,
    ]
  );

  if (!bootHydrated) {
    return (
      <AppLayout>
        <AppStatusBar />
        <VillageOmbreBackdrop />
        <SafeAreaView style={styles.screenForeground} />
      </AppLayout>
    );
  }

  // Root switch: onboarding XOR tabs — never both (shared ombre stays outside the gate).
  const showOnboarding = !isOnboarded;
  const showMainApp = isOnboarded;
  const pregnantWelcomeHighlights =
    showOnboarding && userJourney === 'pregnant' && onboardingStep === 'welcome';
  const postpartumWelcomeHighlights =
    showOnboarding && userJourney === 'postpartum' && onboardingStep === 'welcome';
  const welcomeFullBleedHighlights = pregnantWelcomeHighlights || postpartumWelcomeHighlights;

  const edgeToEdgePregnantShell =
    !inVillagePortal &&
    !inMidnightLounge &&
    effectiveJourney === 'pregnant' &&
    isOnboarded;

  return (
    <AppLayout>
        <AppStatusBar />
        {/* Isolated sage/lavender/peach ombre — lives in VillageOmbreBackdrop.js only */}
        <VillageOmbreBackdrop />
        {Platform.OS === 'web' && isOnboarded ? <PWAVillageAlertsPrompt /> : null}

        {/* Single hardware-accelerated canvas — opacity fades only, then swap the child */}
        <Animated.View
          style={[styles.sceneCanvas, { opacity: sceneCanvasOpacity }]}
          collapsable={false}
        >
        {showMainApp ? (
        <View style={styles.mainAppReveal}>
        <SafeAreaView
          style={styles.screenForeground}
          edges={edgeToEdgePregnantShell ? ['left', 'right', 'bottom'] : undefined}
        >
          <View style={styles.shellLayout}>
            <View
              style={[styles.mainShellKeepAlive, inVillagePortal && styles.mainShellDimmed]}
              pointerEvents={inVillagePortal ? 'none' : 'auto'}
            >
              <MainTabShell
                activeTab={activeTab}
                userJourney={effectiveJourney}
                mainTabContentProps={mainTabContentProps}
                flowAnim={flowAnim}
                pulseAnim={pulseAnim}
                tabSceneOpacity={tabSceneOpacity}
              />
            </View>

            {inVillagePortal ? (
              <View style={styles.villagePortalOverlay}>
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
                  foundingGiftsClaimCount={foundingGiftsClaimCount}
                  foundingGiftsAvailable={isFoundingGiftsAvailable(foundingGiftsClaimCount)}
                  foundingGiftsYearlyEligible={foundingGiftsYearlyEligible}
                  foundingGiftsUserClaimed={foundingGiftsUserClaimed}
                  foundingGiftsClaiming={foundingGiftsClaiming}
                  onClaimFoundingGift={handleClaimFoundingGift}
                  onRefreshFoundingGiftsCount={refreshFoundingGiftsCount}
                  villageUserState={usState}
                  villageUserLatitude={villageLatitude}
                  villageUserLongitude={villageLongitude}
                  userJourney={userJourney}
                />
              </View>
            ) : null}

            {!inVillagePortal ? (
              <Animated.View
                style={{
                  opacity:
                    activeTab === 'home' || candleSanctumOpen ? bottomNavOpacity : 0,
                }}
                pointerEvents={
                  activeTab === 'home' || candleSanctumOpen ? 'box-none' : 'none'
                }
              >
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
              </Animated.View>
            ) : null}

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

            <PregnancySanctuaryModal
              visible={pregnancySanctuaryOpen && effectiveJourney === 'pregnant'}
              onClose={() => setPregnancySanctuaryOpen(false)}
              weeksPregnant={weeksPregnant}
              isPro={isPro}
              isSubscribed={isSubscribed}
              onRequestUpgrade={handleReleaseUpgradePrompt}
            />

            <PostpartumNurseryWelcomeModal
              visible={nurseryWelcomeOpen && userJourney === 'postpartum'}
              onExploreNursery={handleExploreNurseryWelcome}
              onDismiss={() => setNurseryWelcomeOpen(false)}
            />

            <BirthdayBoutiqueModal
              visible={birthdayBoutiqueOpen && isOnboarded}
              onClose={handleCloseBirthdayBoutique}
            />

            <UpgradeOfferSheet
              visible={upgradeSheetOpen}
              onClose={() => setUpgradeSheetOpen(false)}
              onUpgradeMonthly={handleUpgradeMonthly}
              onUpgradeFounding={handleUpgradeFounding}
              onVipRedeemed={handleVipRedeemed}
              memberEmail={memberEmail}
            />

            <SubscriptionScreen
              visible={subscriptionOpen}
              onClose={() => setSubscriptionOpen(false)}
              onCheckout={handleSubscriptionCheckout}
              onVipRedeemed={handleVipRedeemed}
              memberEmail={memberEmail}
            />

            <VillageRemedyPopup
              symptom={SANCTUARY_SYMPTOMS.find((s) => s.id === remedyPopupSymptomId) || null}
              remedy={
                remedyPopupSymptomId
                  ? getVillageRemedy(remedyPopupSymptomId, remedyPopupPickIndex)
                  : null
              }
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

            {infoModalType && infoModalType !== 'legal' ? (
              <VillageInfoModal
                type={infoModalType}
                contactHeartNote={contactHeartNote}
                onContactHeartNoteChange={setContactHeartNote}
                onSendHeartNote={handleSendHeartNote}
                onClose={handleCloseInfoModal}
                anim={{
                  opacity: infoModalOpacity,
                  scale: infoModalScale,
                  translateX: infoModalTranslateX,
                  translateY: infoModalTranslateY,
                }}
              />
            ) : null}

            {infoModalType === 'legal' ? (
              <LegalComplianceModal
                onClose={handleCloseInfoModal}
                onDestroyAccount={handleDestroyAccount}
                anim={{
                  opacity: infoModalOpacity,
                  scale: infoModalScale,
                  translateX: infoModalTranslateX,
                  translateY: infoModalTranslateY,
                }}
              />
            ) : null}

            {midnightLoungeMounted ? (
              <Animated.View
                style={[
                  styles.midnightLoungeOverlay,
                  (userJourney === 'postpartum'
                    ? !postpartumLoungeOverlayActive
                    : !inMidnightLounge) && styles.midnightLoungeCachedHidden,
                  {
                    opacity: midnightLoungeOpacity,
                    transform: [
                      { scale: midnightLoungeScale },
                      { translateY: midnightLoungeTranslateY },
                    ],
                  },
                ]}
                pointerEvents={inMidnightLounge ? 'auto' : 'none'}
              >
                  <MidnightLoungeScreen
                    onExit={handleCloseMidnightLounge}
                    initialTab={loungeFocusTab}
                    focusToken={loungeFocusToken}
                    userJourney={effectiveJourney}
                    activeMode={activeMode}
                    onSelectJourneyMode={handleSelectOnboardingJourney}
                    postpartumLotusOpen={effectiveJourney === 'postpartum' && inMidnightLounge}
                    mamaName={mamaName}
                    onMamaNameChange={setMamaName}
                    shortBio={mamaDiscovery?.heartSpace || ''}
                    onShortBioChange={(text) => handleSaveDiscoveryField('heartSpace', text)}
                    mamaBirthday={mamaBirthday}
                    onBirthdayChange={handleBirthdayChange}
                    profilePhotoUri={profilePhotoUri}
                    onPickProfilePhoto={handlePickProfilePhoto}
                    onOpenVillagePortal={handleOpenVillagePortal}
                    onDeleteAccount={handleDestroyAccount}
                    adminUser={adminUser}
                    accountEmail={memberEmail || ''}
                    onAccountEmailChange={handleAccountEmailChange}
                    isVipLifetime={isVipLifetime}
                    onToggleVipLifetime={handleToggleVipLifetime}
                    onSendTestNewsletter={handleSendTestNewsletter}
                    onGrantTestPoints={handleGrantTestPoints}
                    onResetTestPoints={handleResetTestPoints}
                    currentPoints={rewards?.points || 0}
                    littleOnes={children}
                    onChildrenChange={handleChildrenChange}
                    ventingHistory={ventingHistory}
                    onAppendVentingEntry={(entry) =>
                      setVentingHistory((prev) =>
                        [...prev, entry].sort(
                          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                        )
                      )
                    }
                    guidanceHistory={guidanceHistory}
                    onAppendGuidanceHistory={(entry) =>
                      setGuidanceHistory((prev) => [...prev, entry].slice(-50))
                    }
                    isPro={isPro}
                    isSubscribed={isPro}
                    onRequestUpgrade={handleReleaseUpgradePrompt}
                    journeyContext={sanctuaryJourneyContext}
                    initialJournalPrompt={sanctuaryJournalPrompt}
                    autoOpenJournal={autoOpenSanctuaryJournal}
                    renderVillagePortal={({ onClose }) => (
                      <VillageCommunityPortal
                        villageLogoUri={CALMMAMA_OFFICIAL_LOGO}
                        pulseAnim={pulseAnim}
                        villagePortalTab={villagePortalTab}
                        onVillagePortalTabChange={setVillagePortalTab}
                        onClose={onClose}
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
                        foundingGiftsClaimCount={foundingGiftsClaimCount}
                        foundingGiftsAvailable={isFoundingGiftsAvailable(foundingGiftsClaimCount)}
                        foundingGiftsYearlyEligible={foundingGiftsYearlyEligible}
                        foundingGiftsUserClaimed={foundingGiftsUserClaimed}
                        foundingGiftsClaiming={foundingGiftsClaiming}
                        onClaimFoundingGift={handleClaimFoundingGift}
                        onRefreshFoundingGiftsCount={refreshFoundingGiftsCount}
                        villageUserState={usState}
                        villageUserLatitude={villageLatitude}
                        villageUserLongitude={villageLongitude}
                        userJourney={userJourney}
                      />
                    )}
                  />
              </Animated.View>
            ) : null}

            {!inVillagePortal ? (
              <Animated.View
                pointerEvents={inMidnightLounge ? 'none' : 'auto'}
                style={[
                  styles.bottomChrome,
                  {
                    opacity: bottomNavOpacity,
                    transform: [{ translateY: bottomNavTranslateY }],
                  },
                ]}
              >
                {!inMidnightLounge ? (
                  <View style={styles.shellFooterDock} pointerEvents="box-none">
                    <ShellFooterLinks
                      onOpenAbout={handleOpenAboutFooter}
                      onOpenContact={handleOpenContactFooter}
                      onOpenLegal={handleOpenLegalFooter}
                    />
                  </View>
                ) : null}
                <AppBottomTabBar
                  activeTab={activeTab}
                  userJourney={effectiveJourney}
                  bottomNavStyle={bottomNavStyle}
                  midnightLoungeOpen={inMidnightLounge}
                  onTabPress={runTabTransition}
                  onOpenMidnightLounge={handleOpenMidnightLounge}
                />
              </Animated.View>
            ) : null}
          </View>

        </SafeAreaView>
        </View>
        ) : null}

        {showOnboarding ? (
          <View style={styles.onboardingOverlayShell}>
            <SafeAreaView
              style={styles.screenForeground}
              edges={['left', 'right']}
            >
              <View style={styles.onboardingSceneStack}>
                {onboardingStep === 'intake' ? (
                  <View style={styles.onboardingSceneLayer}>
                    <OnboardingStageScreen
                      logoUri={CALMMAMA_VILLAGE_BADGE}
                      pulseAnim={pulseAnim}
                      userJourney={userJourney}
                      onSelectJourney={handleSelectOnboardingJourney}
                      mamaName={mamaName}
                      onMamaNameChange={setMamaName}
                      weeksPregnant={weeksPregnant}
                      onWeeksPregnantChange={setWeeksPregnant}
                      dueDate={dueDate}
                      onDueDateChange={setDueDate}
                      babyAge={babyAge}
                      onBabyAgeChange={setBabyAge}
                      onContinue={handleContinueOnboarding}
                    />
                  </View>
                ) : (
                  <View style={styles.onboardingSceneLayer}>
                    <WelcomeDashboardView
                      logoUri={CALMMAMA_VILLAGE_BADGE}
                      mamaName={mamaName}
                      userJourney={userJourney}
                      onGetStarted={handleCompleteOnboarding}
                    />
                  </View>
                )}
              </View>
            </SafeAreaView>
          </View>
        ) : null}
        </Animated.View>

        {/* Web-only install overlay — transparent over living ombre */}
        {/* Install sheet disabled inside the live app to avoid unsolicited pop-ups. */}

        <PremiumUpgradeWelcomeModal
          visible={premiumWelcomeOpen}
          variant={premiumWelcomeVariant}
          planLabel={premiumWelcomePlan}
          onClose={() => setPremiumWelcomeOpen(false)}
        />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  // CONTAINER SHELL DEFINITIONS — outer frame lives in AppLayout.js
  screenForeground: {
    flex: 1,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  sceneCanvas: {
    flex: 1,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  mainAppReveal: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  onboardingScene: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  onboardingOverlayShell: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  onboardingSceneStack: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  onboardingSceneLayer: {
    flex: 1,
    width: '100%',
  },
  onboardingSceneLayerStacked: {
    ...StyleSheet.absoluteFillObject,
  },
  onboardingBackdropStack: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    pointerEvents: 'none',
  },
  onboardingBackdropLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  welcomeOnboardingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CALM_MAMA_PASTEL.peach,
  },
  guidanceBackdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F2',
  },
  expertGuidanceBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  oracleBackdropFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#0B0C10',
  },
  mindfulPauseBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#0A0910',
  },
  shellLayout: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    ...Platform.select({
      web: { minHeight: 0 },
      default: {},
    }),
  },
  mainShellKeepAlive: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  mainShellDimmed: {
    opacity: 0,
  },
  villagePortalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    backgroundColor: 'transparent',
  },
  mainShell: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        // Footer (~32) + tab bar (~56) + safe area
        paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 16px))',
      },
      default: {
        paddingBottom: 88,
      },
    }),
  },
  mainShellBody: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  tabStage: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tabSuspenseFallback: {
    flex: 1,
    minHeight: 120,
    backgroundColor: 'transparent',
  },
  tabPane: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  flowFill: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  flowEmbedded: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  embeddedTabScroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { overflowY: 'auto' },
      default: {},
    }),
  },
  embeddedTabScrollContent: {
    flexGrow: 1,
    paddingBottom: SHELL_SCROLL_FOOTER_CLEARANCE,
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
    zIndex: 11040,
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
    zIndex: 11030,
  },
  apothecaryDetailOverlay: {
    zIndex: 11045,
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
    zIndex: 11050,
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
    zIndex: 11060,
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
    zIndex: 11070,
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
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  obBrandBlock: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    gap: 0,
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
    lineHeight: 42,
    marginTop: 10,
    marginBottom: 0,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  obWelcomeSub: {
    fontSize: 14,
    color: '#4A5C50',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    maxWidth: 300,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 0,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#4A5E52',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  infoModalDeleteText: {
    fontSize: 14,
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
  homePregnantRoot: {
    backgroundColor: 'transparent',
    flexGrow: 1,
    marginTop: 2,
  },
  homePregnantShell: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  homeLinenCanvas: {
    backgroundColor: 'transparent',
  },
  homePregnantCanvas: {
    paddingHorizontal: 20,
    paddingTop: 0,
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
    paddingTop: PREGNANT_DAILY_LAYOUT.headerPadTop,
    paddingBottom: PREGNANT_DAILY_LAYOUT.headerPadBottom,
    paddingHorizontal: PREGNANT_DAILY_LAYOUT.headerPadHorizontal,
  },
  pregnantDailyScroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { overflowY: 'auto' },
      default: {},
    }),
  },
  pregnantDailyScrollContent: {
    flexGrow: 1,
    paddingBottom: PREGNANT_DAILY_LAYOUT.scrollFooterPad,
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
  postpartumDailyScroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { overflowY: 'auto' },
      default: {},
    }),
  },
  postpartumDailyScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: SHELL_SCROLL_FOOTER_CLEARANCE,
  },
  postpartumNurseryShell: {
    flex: 1,
    minHeight: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  postpartumNurseryInner: {
    flex: 1,
    minHeight: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  postpartumNurseryScroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { overflowY: 'auto' },
      default: {},
    }),
  },
  postpartumNurseryScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: SHELL_SCROLL_FOOTER_CLEARANCE,
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
    zIndex: 11055,
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
    position: 'relative',
  },
  winsCardBody: {
    position: 'relative',
    overflow: 'visible',
  },
  fireworkModalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireworksStage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  fireworksOrigin: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  fireworkParticleWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireworkParticleEmoji: {
    textAlign: 'center',
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
  vibeHistoryEntry: {
    marginBottom: 8,
  },
  vibeHistoryNote: {
    marginTop: 2,
    marginLeft: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#5A6A62',
    fontStyle: 'italic',
  },
  vibeHistoryToggle: {
    marginTop: 4,
    paddingVertical: 4,
  },
  vibeHistoryToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6A7A68',
    textDecorationLine: 'underline',
  },
  vibeNoteBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 42, 38, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  vibeNoteCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: 'rgba(255, 252, 248, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(196, 165, 116, 0.35)',
  },
  vibeNoteEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#8A6A4A',
    marginBottom: 6,
  },
  vibeNoteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D443A',
    marginBottom: 8,
  },
  vibeNoteHint: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6E7E65',
    marginBottom: 12,
  },
  vibeNoteInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 198, 188, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#3D443A',
    marginBottom: 12,
  },
  vibeNoteSaveBtn: {
    borderRadius: 14,
    backgroundColor: 'rgba(92, 122, 104, 0.92)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  vibeNoteSaveText: {
    color: '#FFF9F2',
    fontSize: 15,
    fontWeight: '800',
  },
  vibeNoteSkipBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  vibeNoteSkipText: {
    color: '#8A968A',
    fontSize: 13,
    fontWeight: '600',
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
  therapeuticMealImageFallback: {
    backgroundColor: 'rgba(232, 218, 244, 0.35)',
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
  pregnancySanctuaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(107, 143, 120, 0.35)',
  },
  pregnancySanctuaryBtnEmoji: {
    fontSize: 26,
  },
  pregnancySanctuaryBtnCopy: {
    flex: 1,
  },
  pregnancySanctuaryBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A382E',
  },
  pregnancySanctuaryBtnSub: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#5A6E58',
    fontWeight: '600',
  },
  pregnancySanctuaryBtnChevron: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B8F78',
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
  shellFooterLinksInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  shellFooterDock: {
    paddingTop: 7,
    paddingBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 252, 248, 0.28)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(186, 152, 138, 0.16)',
  },
  shellFooterLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
  shellFooterLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5C50',
    letterSpacing: 0.2,
  },
  shellFooterDot: {
    fontSize: 11,
    color: '#8A9A90',
    marginHorizontal: 7,
    opacity: 0.95,
  },
  bottomChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    backgroundColor: 'transparent',
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
    zIndex: 11050,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#4A5E52',
    flex: 1,
    paddingRight: 8,
  },
  infoModalClose: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B8958A',
  },
  infoModalBody: {
    fontSize: 16,
    lineHeight: 26,
    color: '#3D5246',
    fontStyle: 'italic',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  infoModalInstagramBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(143, 168, 150, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143, 168, 150, 0.4)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  infoModalInstagramBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3D5246',
    letterSpacing: 0.2,
  },
  infoModalInstagramHandle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#5C7A68',
  },
  infoModalInput: {
    minHeight: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143, 168, 150, 0.35)',
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#3D5246',
    marginBottom: 12,
  },
  infoModalSendBtn: {
    backgroundColor: '#8FA896',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  infoModalSendText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  infoModalDismissBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoModalDismissText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6F64',
    letterSpacing: 0.2,
  },
  bottomNav: {
    position: 'relative',
    minHeight: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 4,
    ...Platform.select({
      web: {
        zIndex: 1,
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      },
      default: {
        paddingBottom: 2,
      },
    }),
  },
  midnightLoungeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    backgroundColor: '#14121C',
  },
  midnightLoungeCachedHidden: {
    zIndex: -1,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLotusCenterSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -22,
    transform: [{ scale: 0.48 }],
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
  upgradeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 26, 0.42)',
    justifyContent: 'flex-end',
  },
  upgradeSheet: {
    backgroundColor: 'rgba(255, 252, 248, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderWidth: 1,
    borderColor: 'rgba(196, 165, 116, 0.28)',
  },
  upgradeHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(92, 122, 104, 0.25)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  upgradeEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: '#6A7A68',
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A382E',
    textAlign: 'center',
    marginBottom: 10,
  },
  upgradeBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5A6A62',
    textAlign: 'center',
    marginBottom: 18,
  },
  upgradePrimaryBtn: {
    backgroundColor: 'rgba(92, 122, 104, 0.9)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradePrimaryText: {
    color: '#FFF9F4',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  upgradeSecondaryBtn: {
    backgroundColor: 'rgba(154, 117, 213, 0.18)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(154, 117, 213, 0.35)',
  },
  upgradeSecondaryText: {
    color: '#6A4F9A',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  foundingCodeBlock: {
    marginTop: 6,
    marginBottom: 4,
    alignItems: 'center',
  },
  foundingCodeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6A4A',
    textDecorationLine: 'underline',
    textAlign: 'center',
    letterSpacing: 0.2,
    paddingVertical: 6,
  },
  foundingCodePanel: {
    width: '100%',
    marginTop: 8,
  },
  foundingCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foundingCodeInput: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 198, 188, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#3D443A',
    letterSpacing: 0.5,
  },
  foundingCodeRedeemBtn: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#C4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundingCodeRedeemBtnDisabled: {
    opacity: 0.55,
  },
  foundingCodeRedeemText: {
    color: '#FFF9F2',
    fontSize: 13,
    fontWeight: '800',
  },
  foundingCodeError: {
    marginTop: 8,
    fontSize: 13,
    color: '#B45A5A',
    fontWeight: '600',
    textAlign: 'center',
  },
  upgradeGhostBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  upgradeGhostText: {
    color: '#6A7A68',
    fontSize: 13,
    fontWeight: '600',
  },
});