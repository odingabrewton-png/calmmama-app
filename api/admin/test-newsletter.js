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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const email = normalizeEmail(req.body?.email || req.query?.email);
  if (email !== ADMIN_EMAIL) {
    res.status(403).json({
      ok: false,
      error: 'Forbidden — admin allowlist only',
      adminTest: true,
    });
    return;
  }

  try {
    const result = await sendAdminTestNewsletter({
      to: email,
      firstName: req.body?.firstName || 'Admin',
      apiKey: resolveResendApiKey(),
      from: process.env.RESEND_FROM || undefined,
    });

    const status = result.ok ? 200 : 502;
    res.status(status).json({
      ...result,
      isolated: true,
      analyticsExcluded: true,
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
