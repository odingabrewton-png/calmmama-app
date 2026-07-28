/**
 * Client-side Resend welcome + audience contact for Free Explorer + waitlist signup.
 * Prefers the server `/api/welcome-email` route (includes founder signup notice).
 * Falls back to direct Resend when the API is unavailable.
 */

import { Platform } from 'react-native';

// Metro-friendly require of the shared CJS template/dispatch module.
// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const welcomeEmail = require('./welcomeEmail');

const {
  sendWelcomeMamaEmail,
  addResendAudienceContact,
  sendAdminMamaSignupNotice,
  WELCOME_SUBJECT,
  DEFAULT_FROM,
} = welcomeEmail;

function readPublicResendKey() {
  try {
    return String(process.env.EXPO_PUBLIC_RESEND_API_KEY || '').trim();
  } catch (_) {
    return '';
  }
}

function readPublicAudienceId() {
  try {
    return String(process.env.EXPO_PUBLIC_RESEND_AUDIENCE_ID || '').trim();
  } catch (_) {
    return '';
  }
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

async function postWelcomeApi(payload) {
  const origin = getApiOrigin();
  const res = await fetch(`${origin}/api/welcome-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, error: data.error || `HTTP ${res.status}`, data };
  }
  return { ok: true, data };
}

/**
 * @param {{ email: string, firstName?: string, reason?: string, tier?: string, source?: string, sendWelcome?: boolean }} opts
 */
export async function dispatchWelcomeMamaEmail({
  email,
  firstName,
  reason = 'signup',
  tier,
  source = 'web',
  sendWelcome = true,
} = {}) {
  const to = String(email || '').trim();
  if (!to) return { ok: false, skipped: true, error: 'missing email' };

  const payload = {
    email: to,
    firstName,
    reason,
    tier,
    source: source || (Platform.OS === 'web' ? 'web' : 'native'),
    notifyOnly: !sendWelcome,
  };

  try {
    const apiResult = await postWelcomeApi(payload);
    if (apiResult.ok) {
      console.log('[CalmMama] welcome-email API ok', { reason, notifyOnly: !sendWelcome });
      return { ok: true, via: 'api', ...apiResult.data };
    }
    console.warn('[CalmMama] welcome-email API issue — falling back', apiResult.error);
  } catch (err) {
    console.warn('[CalmMama] welcome-email API threw — falling back', err?.message || err);
  }

  const apiKey = readPublicResendKey();
  try {
    const adminNoticePromise = sendAdminMamaSignupNotice({
      mamaEmail: to,
      firstName,
      reason,
      tier,
      source: payload.source,
      apiKey,
      from: DEFAULT_FROM,
    });
    const audiencePromise = addResendAudienceContact({
      email: to,
      firstName,
      apiKey,
      audienceId: readPublicAudienceId(),
    });
    const welcomePromise = sendWelcome
      ? sendWelcomeMamaEmail({
          to,
          firstName,
          apiKey,
          from: DEFAULT_FROM,
        })
      : Promise.resolve({ ok: true, skipped: true });

    const [result, adminNotice, audience] = await Promise.all([
      welcomePromise,
      adminNoticePromise,
      audiencePromise,
    ]);

    if (result.ok && !result.skipped) {
      console.log('[CalmMama] Resend welcome sent', { reason, id: result.id });
    } else if (!result.skipped && result.error) {
      console.warn('[CalmMama] Resend welcome issue (non-blocking)', reason, result.error);
    }

    if (adminNotice?.ok && !adminNotice.skipped) {
      console.log('[CalmMama] Admin signup notice sent', { reason, id: adminNotice.id });
    } else if (adminNotice && !adminNotice.skipped) {
      console.warn('[CalmMama] Admin signup notice issue', adminNotice.error);
    }

    if (audience?.ok) {
      console.log('[CalmMama] Resend audience contact added', { reason, id: audience.id });
    }

    return { ...result, audience, adminNotice };
  } catch (err) {
    console.warn('[CalmMama] Resend welcome threw (non-blocking)', err?.message || err);
    return { ok: false, skipped: true, error: err?.message || 'throw' };
  }
}

/** Founder-only notice when a mama saves email in-app (no welcome mail). */
export async function dispatchAdminMamaSignupNotice({
  email,
  firstName,
  reason = 'profile_email',
  tier,
  source = 'in_app',
} = {}) {
  return dispatchWelcomeMamaEmail({
    email,
    firstName,
    reason,
    tier,
    source,
    sendWelcome: false,
  });
}

export { WELCOME_SUBJECT, DEFAULT_FROM };
