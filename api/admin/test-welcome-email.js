/**
 * Admin-only: send a single welcome email smoke test to the allowlisted admin.
 * Skips Resend audience upsert so analytics stay isolated.
 *
 * POST body: { email: string, firstName?: string }
 */

const { sendWelcomeMamaEmail, resolveResendApiKey } = require('../../welcomeEmail');

const ADMIN_EMAIL = 'odingabrewton@gmail.com';

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (_) {
      return {};
    }
  }
  return req.body || {};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const body = parseBody(req);
  const email = normalizeEmail(body.email || req.query?.email);
  if (email !== ADMIN_EMAIL) {
    res.status(403).json({
      ok: false,
      error: 'Forbidden — admin allowlist only',
      adminTest: true,
    });
    return;
  }

  try {
    const result = await sendWelcomeMamaEmail({
      to: email,
      firstName: body.firstName || 'Admin',
      apiKey: resolveResendApiKey(),
      from: process.env.RESEND_FROM || undefined,
    });

    if (result.skipped || !result.ok) {
      res.status(result.skipped ? 503 : 502).json({
        ok: false,
        adminTest: true,
        isolated: true,
        analyticsExcluded: true,
        error: result.error || 'Failed to send welcome email',
        hint: result.skipped
          ? 'Set EXPO_PUBLIC_RESEND_API_KEY or RESEND_API_KEY on Vercel.'
          : undefined,
      });
      return;
    }

    res.status(200).json({
      ok: true,
      adminTest: true,
      isolated: true,
      analyticsExcluded: true,
      id: result.id || null,
      email,
    });
  } catch (err) {
    console.warn('[CalmMama] admin test welcome email error', err?.message || err);
    res.status(500).json({
      ok: false,
      error: 'Unexpected admin welcome email error',
      adminTest: true,
    });
  }
};

module.exports.config = {
  maxDuration: 20,
};
