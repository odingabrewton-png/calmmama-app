/**
 * Client helpers — claim admin-queued manual Crown Points by email.
 */

import { Platform } from 'react-native';
import { postAdminApi } from './adminAccess';

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

/** Claim any pending manual points queued for this mama email. */
export async function claimMamaManualPoints({ email } = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, skipped: true, error: 'missing email' };
  }
  try {
    const origin = getApiOrigin();
    const res = await fetch(`${origin}/api/manual-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: normalized }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error || `HTTP ${res.status}`,
        hint: data.hint,
      };
    }
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: err?.message || 'network error' };
  }
}

/** Admin: queue manual points for another mama by email. */
export async function grantMamaManualPoints({
  adminEmail,
  recipientEmail,
  amount,
  note = '',
} = {}) {
  const result = await postAdminApi('/api/admin/manual-points', {
    email: normalizeEmail(adminEmail),
    recipientEmail: normalizeEmail(recipientEmail),
    amount,
    note,
  });
  if (!result.ok) {
    return {
      ok: false,
      error: result.error || result.data?.error || 'Grant failed',
      hint: result.hint || result.data?.hint,
    };
  }
  return {
    ok: true,
    ...(result.data || {}),
    message: result.data?.message || 'Manual points queued',
  };
}
