/**
 * Client-side Resend welcome + audience contact for Free Explorer + waitlist signup.
 * Uses EXPO_PUBLIC_RESEND_API_KEY — never blocks app redirect on failure.
 */

import { Platform } from 'react-native';

// Metro-friendly require of the shared CJS template/dispatch module.
// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const welcomeEmail = require('./welcomeEmail');

const {
  sendWelcomeMamaEmail,
  addResendAudienceContact,
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

/**
 * @param {{ email: string, firstName?: string, reason?: string }} opts
 * @returns {Promise<{ ok: boolean, id?: string, skipped?: boolean, error?: string, audience?: object }>}
 */
export async function dispatchWelcomeMamaEmail({ email, firstName, reason = 'signup' } = {}) {
  const to = String(email || '').trim();
  if (!to) return { ok: false, skipped: true, error: 'missing email' };

  // Native builds can skip until a server proxy exists; web waitlist is the primary path.
  if (Platform.OS !== 'web') {
    return { ok: false, skipped: true, error: 'web only' };
  }

  const apiKey = readPublicResendKey();

  try {
    const [result, audience] = await Promise.all([
      sendWelcomeMamaEmail({
        to,
        firstName,
        apiKey,
        from: DEFAULT_FROM,
      }),
      addResendAudienceContact({
        email: to,
        firstName,
        apiKey,
        audienceId: readPublicAudienceId(),
      }),
    ]);

    if (result.ok) {
      console.log('[CalmMama] Resend welcome sent', { reason, id: result.id });
    } else if (!result.skipped) {
      console.warn('[CalmMama] Resend welcome issue (non-blocking)', reason, result.error);
    }

    if (audience.ok) {
      console.log('[CalmMama] Resend audience contact added', { reason, id: audience.id });
    } else if (!audience.skipped) {
      console.warn('[CalmMama] Resend audience issue (non-blocking)', reason, audience.error);
    }

    return { ...result, audience };
  } catch (err) {
    console.warn('[CalmMama] Resend welcome threw (non-blocking)', err?.message || err);
    return { ok: false, skipped: true, error: err?.message || 'throw' };
  }
}

export { WELCOME_SUBJECT, DEFAULT_FROM };
