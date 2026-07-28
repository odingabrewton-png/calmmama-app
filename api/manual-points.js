/**
 * Claim queued manual Crown Points for the signed-in mama email.
 *
 * POST body: { email }
 */

const { claimManualPoints, isValidEmail, normalizeEmail } = require('../../mamaPointsCloud');

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
  const email = normalizeEmail(body.email || req.query?.email);
  if (!isValidEmail(email)) {
    res.status(400).json({ ok: false, error: 'Valid email required' });
    return;
  }

  try {
    const result = await claimManualPoints({ email });
    const status = result.ok ? 200 : 502;
    res.status(status).json(result);
  } catch (err) {
    console.warn('[CalmMama] manual points claim error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected manual points claim error' });
  }
};

module.exports.config = {
  maxDuration: 20,
};
