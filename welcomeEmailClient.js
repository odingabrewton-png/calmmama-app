/**
 * Client-side Resend welcome dispatch for Free Explorer + waitlist signup.
 * Uses EXPO_PUBLIC_RESEND_API_KEY — never blocks app redirect on failure.
 */

import { Platform } from 'react-native';
import { APP_ACCESS_URL } from './membershipAccess';

// Metro-friendly require of the shared CJS template/dispatch module.
// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const welcomeEmail = require('./welcomeEmail');

const {
  sendWelcomeMamaEmail,
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

/**
 * @param {{ email: string, firstName?: string, reason?: string }} opts
 * @returns {Promise<{ ok: boolean, id?: string, skipped?: boolean, error?: string }>}
 */
export async function dispatchWelcomeMamaEmail({ email, firstName, reason = 'signup' } = {}) {
  const to = String(email || '').trim();
  if (!to) return { ok: false, skipped: true, error: 'missing email' };

  // Native builds can skip until a server proxy exists; web waitlist is the primary path.
  if (Platform.OS !== 'web') {
    return { ok: false, skipped: true, error: 'web only' };
  }

  try {
    const result = await sendWelcomeMamaEmail({
      to,
      firstName,
      appUrl: APP_ACCESS_URL,
      apiKey: readPublicResendKey(),
      from: DEFAULT_FROM,
    });

    if (result.ok) {
      console.log('[CalmMama] Resend welcome sent', { reason, id: result.id });
    } else if (!result.skipped) {
      console.warn('[CalmMama] Resend welcome issue (non-blocking)', reason, result.error);
    }

    return result;
  } catch (err) {
    console.warn('[CalmMama] Resend welcome threw (non-blocking)', err?.message || err);
    return { ok: false, skipped: true, error: err?.message || 'throw' };
  }
}

export { WELCOME_SUBJECT, DEFAULT_FROM };
