/**
 * Calm Mama Village — secure admin identification + sandbox isolation.
 * Client UI gating is convenience only; public mutations must stay isolated.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const ADMIN_EMAIL = 'odingabrewton@gmail.com';
export const ADMIN_ROLE = 'admin';
export const ADMIN_SESSION_KEY = 'calmmama.adminSession';

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

export function normalizeAdminEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

/**
 * Canonical admin check:
 * `user?.email === 'odingabrewton@gmail.com' || user?.role === 'admin'`
 *
 * Note: role is only trusted after buildAdminUser() (allowlisted email).
 */
export function isAdmin(user) {
  return (
    normalizeAdminEmail(user?.email) === ADMIN_EMAIL || user?.role === ADMIN_ROLE
  );
}

/**
 * Build a safe user identity for persistence.
 * Spoofed role=admin without the allowlisted email is demoted to member.
 */
export function buildAdminUser({ email, role } = {}) {
  const normalizedEmail = normalizeAdminEmail(email);
  if (normalizedEmail === ADMIN_EMAIL) {
    return { email: normalizedEmail, role: ADMIN_ROLE };
  }
  return {
    email: normalizedEmail || null,
    role: 'member',
  };
}

export function readAdminUserFromMembership(membership) {
  return buildAdminUser({
    email: membership?.email,
    role: membership?.role,
  });
}

export async function loadAdminSession() {
  try {
    const raw = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* fall through */
  }
  return readWebJson(ADMIN_SESSION_KEY) || { sandbox: false, updatedAt: null };
}

export async function saveAdminSession(patch = {}) {
  const prev = (await loadAdminSession()) || {};
  const next = {
    sandbox: Boolean(patch.sandbox ?? prev.sandbox),
    updatedAt: new Date().toISOString(),
  };
  writeWebJson(ADMIN_SESSION_KEY, next);
  try {
    await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
  } catch (_) {
    /* ignore */
  }
  return next;
}

/** True when admin tools are active — skip public analytics / shared counters. */
export function shouldIsolateAdminAnalytics(session, user) {
  if (!isAdmin(user)) return false;
  return Boolean(session?.sandbox);
}

export function getAppVersionLabel() {
  try {
    const fromEnv = String(process.env.EXPO_PUBLIC_APP_VERSION || '').trim();
    if (fromEnv) return fromEnv;
  } catch (_) {
    /* ignore */
  }
  return '1.0.0';
}

export function getVercelEnvironmentLabel() {
  try {
    const explicit = String(
      process.env.EXPO_PUBLIC_VERCEL_ENV ||
        process.env.VERCEL_ENV ||
        process.env.NODE_ENV ||
        '',
    )
      .trim()
      .toLowerCase();
    if (explicit === 'production' || explicit === 'preview' || explicit === 'development') {
      return explicit;
    }
  } catch (_) {
    /* ignore */
  }

  if (canUseWebStorage()) {
    try {
      const host = String(window.location?.hostname || '').toLowerCase();
      if (!host || host === 'localhost' || host === '127.0.0.1') return 'development';
      if (host.includes('vercel.app') && host.includes('-git-')) return 'preview';
      if (host.includes('calmmamavillage.com') || host.includes('vercel.app')) return 'production';
    } catch (_) {
      /* ignore */
    }
  }

  return __DEV__ ? 'development' : 'production';
}
