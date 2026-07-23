/**
 * Membership / Free Explorer access — shared by landing + in-app upgrade flows.
 * Persists tier in AsyncStorage (+ web localStorage mirror) and opens Stripe Payment Links.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

export const MEMBERSHIP_TIERS = Object.freeze({
  FREE_EXPLORER: 'free_explorer',
  GENERAL: 'general',
  FOUNDING40: 'founding40',
});

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
  return tier === MEMBERSHIP_TIERS.GENERAL || tier === MEMBERSHIP_TIERS.FOUNDING40;
}

export function membershipFromPlanId(planId) {
  if (planId === 'yearly' || planId === 'annual' || planId === 'gift') {
    return {
      tier: MEMBERSHIP_TIERS.FOUNDING40,
      planId: planId === 'gift' ? 'gift' : 'yearly',
      isSubscribed: true,
    };
  }
  if (planId === 'monthly' || planId === 'general') {
    return {
      tier: MEMBERSHIP_TIERS.GENERAL,
      planId: 'monthly',
      isSubscribed: true,
    };
  }
  return {
    tier: MEMBERSHIP_TIERS.FREE_EXPLORER,
    planId: null,
    isSubscribed: false,
  };
}

export async function saveMembershipProfile(profile) {
  const next = {
    tier: profile?.tier || MEMBERSHIP_TIERS.FREE_EXPLORER,
    email: String(profile?.email || '').trim().toLowerCase() || null,
    planId: profile?.planId ?? null,
    isSubscribed: Boolean(profile?.isSubscribed ?? isPremiumTier(profile?.tier)),
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
 * Open Stripe Payment Link for monthly / annual / gift.
 * Stores pending upgrade so a success return URL can unlock access.
 *
 * Configure each Payment Link success URL in Stripe to:
 *   https://calmmamavillage.com/app?upgraded=1&plan=monthly
 *   https://calmmamavillage.com/app?upgraded=1&plan=annual
 */
export function openStripeCheckout(planKey, { email } = {}) {
  const key = planKey === 'yearly' ? 'annual' : planKey;
  const href = STRIPE_LINKS[key];
  if (!href) return false;

  writeSessionJson(PENDING_UPGRADE_KEY, {
    plan: key,
    email: email || null,
    at: Date.now(),
  });

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
        plan = params.get('plan') || params.get('tier') || pending?.plan || null;
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
      const url = new URL(window.location.href);
      ['upgraded', 'checkout', 'plan', 'tier', 'welcome'].forEach((key) => {
        url.searchParams.delete(key);
      });
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  } catch (_) {
    /* ignore */
  }

  return saved;
}
