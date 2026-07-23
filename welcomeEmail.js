/**
 * Calm Mama Village — Resend welcome email (Free Explorer + waitlist signup).
 * Template + dispatch used by the web client and the optional production API route.
 */

const APP_ACCESS_URL = 'https://calmmamavillage.com/app';
const DEFAULT_FROM = 'Calm Mama Village <onboarding@resend.dev>';
const WELCOME_SUBJECT = 'Welcome home, beautiful mama 🌸';

function resolveResendApiKey(explicitKey) {
  const fromArg = String(explicitKey || '').trim();
  if (fromArg) return fromArg;
  try {
    return String(
      process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY || '',
    ).trim();
  } catch (_) {
    return '';
  }
}

/** Soft lavender/blush gradient card — exact branded HTML for Resend. */
function buildWelcomeMamaEmailHtml() {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin: 0; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #e8dff5; background-image: linear-gradient(135deg, #fce1e4 0%, #e8dff5 50%, #fcf4dd 100%);">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 28px; padding: 40px 30px; text-align: center; box-shadow: 0 10px 30px rgba(110, 80, 140, 0.08);">
    <tr><td align="center" style="padding-bottom: 12px;"><span style="font-size: 42px;">🌸👑</span></td></tr>
    <tr><td align="center" style="padding-bottom: 16px;"><h1 style="color: #4a3b5c; font-size: 26px; font-weight: 700; margin: 0;">Welcome Home, Beautiful Mama</h1></td></tr>
    <tr><td align="center" style="padding-bottom: 24px;"><p style="color: #7d6b91; font-size: 15px; line-height: 1.6; margin: 0;">Your digital sanctuary is ready for you. Take a deep breath, settle in, and explore your peaceful space built just for this journey.</p></td></tr>
    <tr><td align="center" style="padding-top: 10px; padding-bottom: 30px;"><a href="https://calmmamavillage.com/app" target="_blank" style="background-color: #8a63be; background-image: linear-gradient(135deg, #8a63be 0%, #6e48a0 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 99px; font-weight: 600; font-size: 16px; display: inline-block;">Step Inside Your Sanctuary ✨</a></td></tr>
  </table>
</body>
</html>
`;
}

/**
 * Dispatch welcome email via Resend HTTP API.
 * @returns {{ ok: boolean, id?: string, skipped?: boolean, error?: string }}
 */
async function sendWelcomeMamaEmail({
  to,
  firstName,
  apiKey,
  from = DEFAULT_FROM,
} = {}) {
  const recipientEmail = String(to || '').trim().toLowerCase();
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return { ok: false, error: 'Invalid email address' };
  }

  const key = resolveResendApiKey(apiKey);
  if (!key) {
    console.warn('[CalmMama] Resend API key missing — welcome email skipped');
    return { ok: false, skipped: true, error: 'EXPO_PUBLIC_RESEND_API_KEY not configured' };
  }

  const welcomeHtml = buildWelcomeMamaEmailHtml();
  const fetchFn = typeof fetch === 'function' ? fetch : null;
  if (!fetchFn) {
    return { ok: false, error: 'fetch unavailable' };
  }

  try {
    const response = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: String(from || DEFAULT_FROM),
        to: recipientEmail,
        subject: WELCOME_SUBJECT,
        html: welcomeHtml,
        ...(firstName
          ? { tags: [{ name: 'mama_first_name', value: String(firstName).slice(0, 48) }] }
          : {}),
      }),
    });

    const raw = await response.text().catch(() => '');
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (_) {
      parsed = null;
    }

    if (!response.ok) {
      const message = parsed?.message || parsed?.error || raw || `HTTP ${response.status}`;
      console.warn('[CalmMama] Resend welcome failed', response.status, message);
      return { ok: false, error: String(message) };
    }

    return { ok: true, id: parsed?.id || null };
  } catch (err) {
    console.warn('[CalmMama] Resend welcome network error', err?.message || err);
    return { ok: false, error: err?.message || 'network error' };
  }
}

module.exports = {
  APP_ACCESS_URL,
  DEFAULT_FROM,
  WELCOME_SUBJECT,
  buildWelcomeMamaEmailHtml,
  sendWelcomeMamaEmail,
  resolveResendApiKey,
};
