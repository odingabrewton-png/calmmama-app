/**
 * Admin-only: queue manual Crown Points for a mama by email (glitch recovery).
 *
 * POST body: { email, recipientEmail, amount, note? }
 * Auth: email must be the admin allowlist address.
 */

const {
  isAdminEmail,
  normalizeEmail,
  grantManualPoints,
} = require('../../mamaPointsCloud');

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
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const body = parseBody(req);
  const adminEmail = normalizeEmail(body.email || req.query?.email);
  if (!isAdminEmail(adminEmail)) {
    res.status(403).json({
      ok: false,
      error: 'Forbidden — admin allowlist only',
      adminTest: true,
    });
    return;
  }

  try {
    const result = await grantManualPoints({
      recipientEmail: body.recipientEmail,
      amount: body.amount,
      note: body.note,
      grantedBy: adminEmail,
    });
    const status = result.ok ? 200 : result.error?.includes('Forbidden') ? 403 : 400;
    res.status(status).json({
      ...result,
      adminTest: true,
      isolated: true,
    });
  } catch (err) {
    console.warn('[CalmMama] admin manual points error', err?.message || err);
    res.status(500).json({
      ok: false,
      error: 'Unexpected admin manual points error',
      adminTest: true,
    });
  }
};

module.exports.config = {
  maxDuration: 20,
};
