/**
 * Client helpers — backup / restore mama village profile by email.
 */

import { Platform } from 'react-native';
import {
  loadHasCompletedOnboarding,
  loadVillageProfile,
  saveVillageProfile,
  setHasCompletedOnboarding,
} from './villageStorage';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
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

export function isSparseVillageProfile(profile) {
  if (!profile || typeof profile !== 'object') return true;
  const name = String(profile.displayName || '').trim();
  const hasName = name && name.toLowerCase() !== 'mama';
  const hasJourney =
    profile.userJourney === 'pregnant' ||
    profile.userJourney === 'postpartum' ||
    profile.userJourney === 'hybrid';
  const hasChildren = Array.isArray(profile.children) && profile.children.length > 0;
  const hasPregnancy = Boolean(profile.weeksPregnant || profile.currentPregnancy?.weeksPregnant);
  const hasCity = Boolean(String(profile.approximateCity || '').trim());
  const hasPhoto = Boolean(profile.profilePhotoUri);
  return !(hasName || hasJourney || hasChildren || hasPregnancy || hasCity || hasPhoto);
}

async function postMamaProfile(payload) {
  const origin = getApiOrigin();
  const res = await fetch(`${origin}/api/mama-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, error: data.error || `HTTP ${res.status}`, hint: data.hint, data };
  }
  return { ok: true, ...data };
}

/** Backup local profile under this email for later reinstall restore. */
export async function upsertMamaCloudProfile({ email, profile, source = 'app' } = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !profile) {
    return { ok: false, skipped: true, error: 'missing email or profile' };
  }
  try {
    return await postMamaProfile({
      action: 'save',
      email: normalized,
      profile,
      source,
    });
  } catch (err) {
    return { ok: false, error: err?.message || 'network error' };
  }
}

/** Fetch cloud profile for email (does not write local storage). */
export async function fetchMamaCloudProfile(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'invalid email' };
  }
  try {
    return await postMamaProfile({
      action: 'restore',
      email: normalized,
    });
  } catch (err) {
    return { ok: false, error: err?.message || 'network error' };
  }
}

/**
 * When a mama re-enters her email after wiping the Home Screen app:
 * restore cloud snapshot into local storage if local is empty/sparse.
 * Otherwise backup the local profile to the cloud under that email.
 */
export async function syncMamaProfileWithEmail({
  email,
  profile,
  source = 'app',
  preferRestore = true,
} = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, skipped: true, error: 'invalid email' };
  }

  const localProfile = profile || (await loadVillageProfile());
  const onboarded = await loadHasCompletedOnboarding();
  const localSparse = isSparseVillageProfile(localProfile);

  if (preferRestore && (!onboarded || localSparse)) {
    const remote = await fetchMamaCloudProfile(normalized);
    if (remote.ok && remote.found && remote.profile) {
      await saveVillageProfile(remote.profile);
      await setHasCompletedOnboarding(true);
      return {
        ok: true,
        restored: true,
        profile: remote.profile,
        updatedAt: remote.updatedAt,
      };
    }
  }

  if (localProfile && !isSparseVillageProfile(localProfile)) {
    const saved = await upsertMamaCloudProfile({
      email: normalized,
      profile: localProfile,
      source,
    });
    return {
      ok: Boolean(saved.ok),
      restored: false,
      upserted: Boolean(saved.ok),
      error: saved.error,
      hint: saved.hint,
    };
  }

  return { ok: true, restored: false, upserted: false, found: false };
}
