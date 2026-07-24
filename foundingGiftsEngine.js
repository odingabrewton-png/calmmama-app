import { Platform } from 'react-native';
import { FOUNDING_GIFTS_CAP } from './foundingGiftsConfig';
import { isAdmin, loadAdminSession, shouldIsolateAdminAnalytics } from './adminAccess';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const LOCAL_COUNT_KEY = 'calmmama_founding_gifts_count';
const LOCAL_CLAIMED_KEY = 'calmmama_founding_gifts_user_claimed';
const ADMIN_LOCAL_CLAIMED_KEY = 'calmmama_founding_gifts_admin_test_claimed';

let memoryClaimCount = 0;

async function isAdminSandboxActive(user) {
  try {
    const session = await loadAdminSession();
    return shouldIsolateAdminAnalytics(session, user);
  } catch (_) {
    return false;
  }
}

function readLocal(key) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

function writeLocal(key, value) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

function getLocalClaimCount() {
  const raw = readLocal(LOCAL_COUNT_KEY);
  const parsed = parseInt(raw, 10);
  if (Number.isFinite(parsed)) {
    memoryClaimCount = Math.min(FOUNDING_GIFTS_CAP, Math.max(0, parsed));
  }
  return memoryClaimCount;
}

function setLocalClaimCount(count) {
  memoryClaimCount = Math.min(FOUNDING_GIFTS_CAP, Math.max(0, count));
  writeLocal(LOCAL_COUNT_KEY, String(memoryClaimCount));
  return memoryClaimCount;
}

export function isFoundingGiftsAvailable(claimCount) {
  return claimCount < FOUNDING_GIFTS_CAP;
}

export function hasUserClaimedFoundingGift() {
  return readLocal(LOCAL_CLAIMED_KEY) === '1';
}

export function markUserClaimedFoundingGift() {
  writeLocal(LOCAL_CLAIMED_KEY, '1');
}

export async function fetchFoundingGiftsClaimCount() {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/founding-gifts/count`);
      if (res.ok) {
        const data = await res.json();
        const count = Math.min(FOUNDING_GIFTS_CAP, Math.max(0, Number(data?.count) || 0));
        setLocalClaimCount(count);
        return count;
      }
    } catch {
      /* fall through to local store */
    }
  }
  return getLocalClaimCount();
}

export async function submitFoundingGiftClaim({ mamaName, email, user } = {}) {
  const adminUser = user || { email };
  if (await isAdminSandboxActive(adminUser) || isAdmin(adminUser)) {
    // Device-only claim — does not increment public founding gift analytics.
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ADMIN_LOCAL_CLAIMED_KEY, '1');
    }
    return getLocalClaimCount();
  }

  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/founding-gifts/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mamaName, email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || 'Unable to claim founding gift.');
    }
    const data = await res.json();
    const count = Math.min(FOUNDING_GIFTS_CAP, Math.max(0, Number(data?.count) || FOUNDING_GIFTS_CAP));
    setLocalClaimCount(count);
    markUserClaimedFoundingGift();
    return count;
  }

  const next = getLocalClaimCount() + 1;
  if (next > FOUNDING_GIFTS_CAP) {
    throw new Error('All founding sister gifts have been claimed.');
  }
  setLocalClaimCount(next);
  markUserClaimedFoundingGift();
  return next;
}
