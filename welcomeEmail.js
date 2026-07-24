/**
 * Calm Mama Village — Resend welcome email (Free Explorer + waitlist signup).
 * Template + dispatch used by the web client and the optional production API route.
 */

const APP_ACCESS_URL = 'https://calmmamavillage.com/app';
const DEFAULT_FROM = 'Calm Mama Village <onboarding@calmmamavillage.com>';
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

function resolveResendAudienceId(explicitId) {
  const fromArg = String(explicitId || '').trim();
  if (fromArg) return fromArg;
  try {
    return String(
      process.env.EXPO_PUBLIC_RESEND_AUDIENCE_ID || process.env.RESEND_AUDIENCE_ID || '',
    ).trim();
  } catch (_) {
    return '';
  }
}

/** Gmail-safe template: bgcolor attributes + embedded <style> for gradient where supported. */
function buildWelcomeMamaEmailHtml() {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Calm Mama Village</title>
  <style type="text/css">
    body, table, td {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .email-bg {
      background-color: #E8DFF5 !important;
      background-image: linear-gradient(135deg, #FCE1E4 0%, #E8DFF5 50%, #FCF4DD 100%) !important;
    }
  </style>
</head>
<body bgcolor="#E8DFF5" style="margin: 0; padding: 0; background-color: #E8DFF5;">
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#E8DFF5" class="email-bg" style="background-color: #E8DFF5; padding: 40px 12px;">
    <tr>
      <td align="center" bgcolor="#E8DFF5" class="email-bg">
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="max-width: 500px; background-color: #ffffff; border-radius: 28px; padding: 40px 28px; text-align: center; box-shadow: 0 10px 30px rgba(110, 80, 140, 0.08);">
          
          <tr>
            <td align="center" style="padding-bottom: 14px;">
              <span style="font-size: 42px; line-height: 1;">🌸👑</span>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <h1 style="color: #4A3B5C; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                Welcome Home, Beautiful Mama
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="color: #7D6B91; font-size: 15px; line-height: 1.6; margin: 0;">
                Your digital sanctuary is ready for you. Take a deep breath, settle in, and explore your peaceful space built just for this journey.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="https://calmmamavillage.com/app" target="_blank" style="background-color: #8A63BE; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 99px; font-weight: 600; font-size: 15px; display: inline-block;">
                Step Inside Your Sanctuary ✨
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="border-top: 1px solid #F2EBF9; padding-top: 20px;">
              <p style="color: #A493B8; font-size: 12px; margin: 0; line-height: 1.5;">
                With warmth & support,<br />
                <strong style="color: #7D6B91;">The Calm Mama Village Team</strong>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}

function buildWelcomeMamaEmailText() {
  return 'Welcome Home, Beautiful Mama! Your digital sanctuary is ready for you: https://calmmamavillage.com/app';
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
  const welcomeText = buildWelcomeMamaEmailText();
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
        text: welcomeText,
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

/**
 * Add (or upsert) a contact on the Resend Audience list used for broadcasts.
 * Non-fatal for signup — callers should not block redirect on failure.
 * @returns {{ ok: boolean, id?: string, skipped?: boolean, error?: string }}
 */
async function addResendAudienceContact({
  email,
  firstName,
  journey,
  apiKey,
  audienceId,
} = {}) {
  const userEmail = String(email || '').trim().toLowerCase();
  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return { ok: false, error: 'Invalid email address' };
  }

  const key = resolveResendApiKey(apiKey);
  if (!key) {
    return { ok: false, skipped: true, error: 'EXPO_PUBLIC_RESEND_API_KEY not configured' };
  }

  const listId = resolveResendAudienceId(audienceId);
  if (!listId) {
    return { ok: false, skipped: true, error: 'EXPO_PUBLIC_RESEND_AUDIENCE_ID not configured' };
  }

  const fetchFn = typeof fetch === 'function' ? fetch : null;
  if (!fetchFn) {
    return { ok: false, error: 'fetch unavailable' };
  }

  const payload = {
    email: userEmail,
    unsubscribed: false,
  };
  const name = String(firstName || '').trim();
  if (name) payload.first_name = name.slice(0, 48);
  const stage = String(journey || '')
    .trim()
    .toLowerCase();
  if (stage === 'pregnant' || stage === 'postpartum' || stage === 'hybrid') {
    payload.properties = { mama_journey: stage };
  }

  try {
    const response = await fetchFn(
      `https://api.resend.com/audiences/${encodeURIComponent(listId)}/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const raw = await response.text().catch(() => '');
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (_) {
      parsed = null;
    }

    // 409 = contact already on the list — treat as success for signup.
    if (!response.ok && response.status !== 409) {
      const message = parsed?.message || parsed?.error || raw || `HTTP ${response.status}`;
      console.warn('[CalmMama] Resend audience contact failed', response.status, message);
      return { ok: false, error: String(message) };
    }

    return { ok: true, id: parsed?.id || null };
  } catch (err) {
    console.warn('[CalmMama] Resend audience contact network error', err?.message || err);
    return { ok: false, error: err?.message || 'network error' };
  }
}

module.exports = {
  APP_ACCESS_URL,
  DEFAULT_FROM,
  WELCOME_SUBJECT,
  buildWelcomeMamaEmailHtml,
  buildWelcomeMamaEmailText,
  sendWelcomeMamaEmail,
  addResendAudienceContact,
  resolveResendApiKey,
  resolveResendAudienceId,
};
