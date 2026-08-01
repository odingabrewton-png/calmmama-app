/**
 * POST /api/web-push/subscribe
 * Body: { subscription, journey?, timeZone?, platform? }
 */

const { upsertSubscription } = require('../../webPushService');

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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const result = await upsertSubscription({
      subscription: body.subscription || body,
      journey: body.journey,
      timeZone: body.timeZone || body.timezone,
      platform: body.platform || 'web',
    });
    res.status(result.status || (result.ok ? 200 : 400)).json(result);
  } catch (err) {
    console.warn('[CalmMama] web-push subscribe error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected subscribe error' });
  }
};
