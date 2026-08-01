/**
 * Client helpers — load / save baby registry progress keyed by mama email.
 * Fresh emails start at 0%; only that mama's adds increase her %.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCAL_PREFIX = 'calmmama.babyRegistry.v1:';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 1) return 1;
  return Math.round(n * 1000) / 1000;
}

function emptyRegistry(email) {
  return {
    email: normalizeEmail(email) || null,
    progress: 0,
    items: [],
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function localKey(email) {
  return `${LOCAL_PREFIX}${normalizeEmail(email)}`;
}

function getApiOrigin() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      return String(window.location?.origin || '').replace(/\/$/, '');
    } catch (_) {
      /* ignore */
    }
  }
  return 'https://calmmamavillage.com';
}

async function readLocalRegistry(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return emptyRegistry(normalized);
  try {
    const raw = await AsyncStorage.getItem(localKey(normalized));
    if (!raw) return emptyRegistry(normalized);
    const parsed = JSON.parse(raw);
    return {
      ...emptyRegistry(normalized),
      progress: clampProgress(parsed?.progress),
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      completedAt: parsed?.completedAt || null,
      updatedAt: parsed?.updatedAt || new Date().toISOString(),
    };
  } catch (_) {
    return emptyRegistry(normalized);
  }
}

async function writeLocalRegistry(email, registry) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return;
  try {
    await AsyncStorage.setItem(
      localKey(normalized),
      JSON.stringify({
        email: normalized,
        progress: clampProgress(registry?.progress),
        items: Array.isArray(registry?.items) ? registry.items.slice(-80) : [],
        completedAt: registry?.completedAt || null,
        updatedAt: registry?.updatedAt || new Date().toISOString(),
      }),
    );
  } catch (_) {
    /* ignore */
  }
}

async function postMamaRegistry(payload) {
  const origin = getApiOrigin();
  const res = await fetch(`${origin}/api/mama-registry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, error: data.error || `HTTP ${res.status}`, data };
  }
  return { ok: true, ...data };
}

/** Load this email's registry (local first, then cloud). Missing → fresh 0%. */
export async function loadMamaRegistry(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: true, registry: emptyRegistry(null), skipped: true };
  }

  const local = await readLocalRegistry(normalized);

  try {
    const cloud = await postMamaRegistry({ email: normalized, action: 'restore' });
    if (cloud.ok && cloud.registry) {
      const cloudProgress = clampProgress(cloud.registry.progress);
      const localProgress = clampProgress(local.progress);
      // Prefer the higher of local vs cloud so offline bumps aren't lost.
      const merged = {
        ...emptyRegistry(normalized),
        ...cloud.registry,
        progress: Math.max(cloudProgress, localProgress),
        items:
          Array.isArray(cloud.registry.items) && cloud.registry.items.length
            ? cloud.registry.items
            : local.items,
        completedAt: cloud.registry.completedAt || local.completedAt,
      };
      await writeLocalRegistry(normalized, merged);
      return { ok: true, registry: merged, via: cloud.via || 'cloud' };
    }
  } catch (_) {
    /* use local */
  }

  return { ok: true, registry: local, via: 'local' };
}

/** Persist progress for this email (local + cloud). */
export async function saveMamaRegistry({
  email,
  progress,
  items,
  completedAt,
  source = 'app',
} = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, skipped: true, error: 'missing email' };
  }

  const registry = {
    email: normalized,
    progress: clampProgress(progress),
    items: Array.isArray(items) ? items.slice(-80) : [],
    completedAt:
      completedAt ||
      (clampProgress(progress) >= 1 ? new Date().toISOString() : null),
    updatedAt: new Date().toISOString(),
  };

  await writeLocalRegistry(normalized, registry);

  try {
    const cloud = await postMamaRegistry({
      action: 'save',
      email: normalized,
      progress: registry.progress,
      items: registry.items,
      completedAt: registry.completedAt,
      source,
    });
    return { ok: Boolean(cloud.ok), registry, via: cloud.via || 'local', cloud };
  } catch (err) {
    return { ok: true, registry, via: 'local', error: err?.message || 'network error' };
  }
}

export { clampProgress, emptyRegistry, normalizeEmail, isValidEmail };
