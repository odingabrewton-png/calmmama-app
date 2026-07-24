/**
 * Membership / Free Explorer access — shared by landing + in-app upgrade flows.
 * Persists tier in AsyncStorage (+ web localStorage mirror) and opens Stripe Checkout
 * (Checkout Sessions with promotion codes for monthly/annual; Payment Links as fallback).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import { buildAdminUser } from './adminAccess';

export const MEMBERSHIP_TIERS = Object.freeze({
  FREE_EXPLORER: 'free_explorer',
  GENERAL: 'general',
  FOUNDING40: 'founding40',
  FOUNDING_MOTHER: 'founding_mother',
  VIP_LIFETIME: 'vip_lifetime',
});

export const VIP_PROMO_CODES = Object.freeze(['VILLAGEMAMA', 'FOUNDINGQUEEN', 'CALMVIP']);
export const FOUNDING_MOTHER_CODE = 'FOUNDINGQUEEN';
export const FOUNDING_MOTHER_PLAN = 'founding_mother';
export const VIP_LIFETIME_PLAN = 'vip_lifetime';
export const VIP_ACTIVATED_TOAST = 'VIP Access Activated! Welcome home, Queen 🌸👑';
export const FOUNDING_MOTHER_WELCOME =
  'Welcome Founding Mother! Your lifetime access is active 🌸👑';
export const FOUNDING_MOTHER_CODE_ERROR = "That code isn't quite right. Try again mama!";
export const VIP_WELCOME_POINTS = 500;

export const STRIPE_LINKS = Object.freeze({
  monthly: 'https://buy.stripe.com/test_dRmbJ1dsd89l2jTb0P9EI03',
  gift: 'https://buy.stripe.com/test_fZu3cv5ZL61d2jT1qf9EI01',
  annual: 'https://buy.stripe.com/test_eVq28rgEp0GT5w5fh59EI02',
});

/** Permanent Free Explorer / installed-app entry URL (also used in Resend welcome emails). */
export const APP_ACCESS_PATH = '/app';
export const APP_ACCESS_URL = 'https://calmmamavillage.com/app';

const STORAGE_KEY = 'calmmama.membership';
const PENDING_UPGRADE_KEY = 'calmmama.pendingUpgrade';

function canUseWebStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

function readWebJson(key) {
  if (!canUseWebStorage()) return null;
  try {
    const raw = window.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function writeWebJson(key, value) {
  if (!canUseWebStorage()) return;
  try {
    window.localStorage?.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* ignore */
  }
}

function writeSessionJson(key, value) {
  if (!canUseWebStorage()) return;
  try {
    window.sessionStorage?.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* ignore */
  }
}

function readSessionJson(key) {
  if (!canUseWebStorage()) return null;
  try {
    const raw = window.sessionStorage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function isPremiumTier(tier) {
  return (
    tier === MEMBERSHIP_TIERS.GENERAL ||
    tier === MEMBERSHIP_TIERS.FOUNDING40 ||
    tier === MEMBERSHIP_TIERS.FOUNDING_MOTHER ||
    tier === MEMBERSHIP_TIERS.VIP_LIFETIME
  );
}

export function isFoundingMotherCode(raw) {
  return normalizeVipPromoCode(raw) === FOUNDING_MOTHER_CODE;
}

export function normalizeVipPromoCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function isValidVipPromoCode(raw) {
  return VIP_PROMO_CODES.includes(normalizeVipPromoCode(raw));
}

/** Feature gates: VIP lifetime + Stripe Pro both unlock paywalls. */
export function hasPremiumAccess({ isPro, isSubscribed } = {}) {
  return Boolean(isPro || isSubscribed);
}

export function membershipFromPlanId(planId) {
  if (planId === VIP_LIFETIME_PLAN || planId === 'vip') {
    return {
      tier: MEMBERSHIP_TIERS.VIP_LIFETIME,
      planId: VIP_LIFETIME_PLAN,
      subscriptionPlan: VIP_LIFETIME_PLAN,
      membershipTier: MEMBERSHIP_TIERS.VIP_LIFETIME,
      isPro: true,
      isSubscribed: true,
    };
  }
  if (planId === FOUNDING_MOTHER_PLAN || planId === 'founding_mother') {
    return {
      tier: MEMBERSHIP_TIERS.FOUNDING_MOTHER,
      planId: FOUNDING_MOTHER_PLAN,
      subscriptionPlan: FOUNDING_MOTHER_PLAN,
      membershipTier: MEMBERSHIP_TIERS.FOUNDING_MOTHER,
      isPro: true,
      isSubscribed: true,
    };
  }
  if (planId === 'yearly' || planId === 'annual' || planId === 'gift') {
    return {
      tier: MEMBERSHIP_TIERS.FOUNDING40,
      planId: planId === 'gift' ? 'gift' : 'yearly',
      subscriptionPlan: planId === 'gift' ? 'gift' : 'yearly',
      isPro: true,
      isSubscribed: true,
    };
  }
  if (planId === 'monthly' || planId === 'general') {
    return {
      tier: MEMBERSHIP_TIERS.GENERAL,
      planId: 'monthly',
      subscriptionPlan: 'monthly',
      isPro: true,
      isSubscribed: true,
    };
  }
  return {
    tier: MEMBERSHIP_TIERS.FREE_EXPLORER,
    planId: null,
    subscriptionPlan: null,
    isPro: false,
    isSubscribed: false,
  };
}

/**
 * Redeem a Founding Mother / VIP code — bypasses Stripe entirely.
 * FOUNDINGQUEEN → founding_mother lifetime Pro.
 * Other VIP codes → vip_lifetime.
 */
export async function redeemVipPromoCode(rawCode, { email } = {}) {
  const normalized = normalizeVipPromoCode(rawCode);
  if (!normalized) {
    return { ok: false, error: FOUNDING_MOTHER_CODE_ERROR };
  }

  if (isFoundingMotherCode(normalized)) {
    const membership = membershipFromPlanId(FOUNDING_MOTHER_PLAN);
    const saved = await saveMembershipProfile({
      ...membership,
      email: email || null,
      promoCode: normalized,
    });
    return {
      ok: true,
      membership: saved,
      toast: FOUNDING_MOTHER_WELCOME,
      variant: 'founding_mother',
      bypassStripe: true,
    };
  }

  if (!isValidVipPromoCode(normalized)) {
    return { ok: false, error: FOUNDING_MOTHER_CODE_ERROR };
  }

  const membership = membershipFromPlanId(VIP_LIFETIME_PLAN);
  const saved = await saveMembershipProfile({
    ...membership,
    email: email || null,
    promoCode: normalized,
  });
  return {
    ok: true,
    membership: saved,
    toast: VIP_ACTIVATED_TOAST,
    variant: 'vip',
    bypassStripe: true,
  };
}

export async function saveMembershipProfile(profile) {
  const planId = profile?.planId ?? profile?.subscriptionPlan ?? null;
  const isVip = planId === VIP_LIFETIME_PLAN || profile?.tier === MEMBERSHIP_TIERS.VIP_LIFETIME;
  const isFoundingMother =
    planId === FOUNDING_MOTHER_PLAN ||
    profile?.tier === MEMBERSHIP_TIERS.FOUNDING_MOTHER ||
    profile?.membershipTier === MEMBERSHIP_TIERS.FOUNDING_MOTHER;
  const isPro = Boolean(
    profile?.isPro ||
      profile?.isSubscribed ||
      isPremiumTier(profile?.tier) ||
      isPremiumTier(profile?.membershipTier) ||
      isVip ||
      isFoundingMother,
  );
  const adminIdentity = buildAdminUser({ email: profile?.email, role: profile?.role });
  const resolvedTier =
    profile?.tier ||
    profile?.membershipTier ||
    (isFoundingMother
      ? MEMBERSHIP_TIERS.FOUNDING_MOTHER
      : isVip
        ? MEMBERSHIP_TIERS.VIP_LIFETIME
        : MEMBERSHIP_TIERS.FREE_EXPLORER);
  const next = {
    tier: resolvedTier,
    membershipTier: resolvedTier,
    email: adminIdentity.email,
    role: adminIdentity.role,
    planId,
    subscriptionPlan: profile?.subscriptionPlan ?? planId,
    isPro,
    isSubscribed: Boolean(profile?.isSubscribed || isPro),
    promoCode: profile?.promoCode ? normalizeVipPromoCode(profile.promoCode) : null,
    adminTest: Boolean(profile?.adminTest),
    updatedAt: new Date().toISOString(),
  };
  writeWebJson(STORAGE_KEY, next);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_) {
    /* ignore */
  }
  return next;
}

export async function loadMembershipProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* fall through */
  }
  return readWebJson(STORAGE_KEY);
}

/** True when URL path is the permanent /app entry (or legacy ?app=1). */
export function readForceAppMode() {
  if (!canUseWebStorage()) return false;
  try {
    const path = String(window.location?.pathname || '');
    if (path === APP_ACCESS_PATH || path.startsWith(`${APP_ACCESS_PATH}/`)) return true;
    const params = new URLSearchParams(window.location?.search || '');
    if (params.get('app') === '1' || params.get('welcome') === 'explorer') return true;
    return false;
  } catch (_) {
    return false;
  }
}

export function buildAppAccessHref(extraParams = {}) {
  if (!canUseWebStorage()) return APP_ACCESS_URL;
  try {
    const url = new URL(APP_ACCESS_PATH, window.location.origin);
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value != null && value !== '') url.searchParams.set(key, String(value));
    });
    return url.toString();
  } catch (_) {
    return APP_ACCESS_URL;
  }
}

export function enterLiveApp(extraParams = {}) {
  if (!canUseWebStorage()) return;
  window.location.assign(buildAppAccessHref(extraParams));
}

/**
 * Create a hosted Checkout Session (monthly / annual) with promotion codes enabled.
 * Falls back to Payment Links when the API is unavailable.
 * Gift still uses the Payment Link.
 *
 * Success return (Checkout Session + Payment Links):
 *   https://calmmamavillage.com/app?upgraded=1&plan=monthly|annual
 */
export async function openStripeCheckout(planKey, { email } = {}) {
  const key = planKey === 'yearly' ? 'annual' : planKey;
  if (!STRIPE_LINKS[key] && key !== 'monthly' && key !== 'annual') return false;

  writeSessionJson(PENDING_UPGRADE_KEY, {
    plan: key,
    email: email || null,
    at: Date.now(),
  });

  // Prefer Checkout Sessions API for subscriptions so allow_promotion_codes works.
  if (canUseWebStorage() && (key === 'monthly' || key === 'annual')) {
    try {
      const origin = window.location?.origin || undefined;
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: key,
          email: email || undefined,
          origin,
        }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok && data?.url) {
        window.location.assign(data.url);
        return true;
      }
      console.warn(
        '[CalmMama] checkout-session unavailable, falling back to Payment Link',
        data?.error || response.status,
      );
    } catch (err) {
      console.warn(
        '[CalmMama] checkout-session request failed, falling back to Payment Link',
        err?.message || err,
      );
    }
  }

  const href = STRIPE_LINKS[key];
  if (!href) return false;

  try {
    const url = new URL(href);
    if (email) url.searchParams.set('prefilled_email', email);
    if (canUseWebStorage()) {
      window.location.assign(url.toString());
      return true;
    }
  } catch (_) {
    /* fall through */
  }

  Linking.openURL(href).catch(() => {});
  return true;
}

/**
 * Consume Stripe success return (?upgraded=1&plan=monthly|annual|gift).
 * Configure each Payment Link success URL in Stripe Dashboard to:
 *   https://calmmamavillage.com/app?upgraded=1&plan=monthly
 *   https://calmmamavillage.com/app?upgraded=1&plan=annual
 */
export async function consumeStripeUpgradeReturn() {
  let plan = null;
  const pending = readSessionJson(PENDING_UPGRADE_KEY);

  if (canUseWebStorage()) {
    try {
      const params = new URLSearchParams(window.location?.search || '');
      if (params.get('upgraded') === '1' || params.get('checkout') === 'success') {
        plan = params.get('plan') || params.get('tier') || pending?.plan || 'monthly';
      }
    } catch (_) {
      /* ignore */
    }
  }

  if (!plan) return null;

  const normalized =
    plan === 'yearly' || plan === 'founding40' || plan === 'annual'
      ? 'annual'
      : plan === 'gift'
        ? 'gift'
        : 'monthly';

  const membership = membershipFromPlanId(
    normalized === 'annual' ? 'yearly' : normalized === 'gift' ? 'gift' : 'monthly',
  );

  const saved = await saveMembershipProfile({
    ...membership,
    email: pending?.email || null,
  });

  try {
    if (canUseWebStorage()) {
      window.sessionStorage?.removeItem(PENDING_UPGRADE_KEY);
      // Strip Stripe return params so refresh does not re-trigger unlock UX.
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (_) {
    /* ignore */
  }

  return saved;
}
