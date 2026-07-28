/**
 * Admin-only: send a single test weekly newsletter to an allowlisted admin email.
 * Does not iterate the public Resend audience or touch production analytics.
 *
 * POST body: { email: string, firstName?: string }
 * Auth: email must be the admin allowlist address.
 */

const { sendAdminTestNewsletter } = require('../../weeklyNewsletter');
const { resolveResendApiKey } = require('../../welcomeEmail');

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
    const apiKey = resolveResendApiKey();
    if (!apiKey) {
      res.status(503).json({
        ok: false,
        adminTest: true,
        error: 'Resend API key not configured',
        hint: 'Set EXPO_PUBLIC_RESEND_API_KEY or RESEND_API_KEY on Vercel.',
      });
      return;
    }

    const result = await sendAdminTestNewsletter({
      to: email,
      firstName: body.firstName || 'Admin',
      apiKey,
      from: process.env.RESEND_FROM || undefined,
    });

    const status = result.ok ? 200 : 502;
    const invalidKey = /api key is invalid|invalid api key|unauthorized/i.test(
      String(result.error || ''),
    );
    res.status(status).json({
      ...result,
      isolated: true,
      analyticsExcluded: true,
      hint: result.ok
        ? undefined
        : invalidKey
          ? 'Create a new key in Resend → API Keys, then set RESEND_API_KEY (and EXPO_PUBLIC_RESEND_API_KEY) on Vercel Production and Redeploy.'
          : result.error || 'Resend rejected the send — verify domain + RESEND_FROM.',
    });
  } catch (err) {
    console.warn('[CalmMama] admin test newsletter error', err?.message || err);
    res.status(500).json({
      ok: false,
      error: 'Unexpected admin newsletter error',
      adminTest: true,
    });
  }
};

module.exports.config = {
  maxDuration: 20,
};
