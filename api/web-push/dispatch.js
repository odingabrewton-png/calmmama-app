/**
 * GET/POST /api/web-push/dispatch
 * Auth: Authorization: Bearer ${CRON_SECRET} (same as newsletter cron)
 * Sends due village reminders to stored web-push subscribers.
 */

const { assertCronAuthorized } = require('../../weeklyNewsletter');
const { dispatchDueVillagePush } = require('../../webPushService');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const auth = assertCronAuthorized(req);
  if (!auth.ok) {
    res.status(auth.status).json({ ok: false, error: auth.error });
    return;
  }

  try {
    const result = await dispatchDueVillagePush({ windowMinutes: 8 });
    const status = result.ok ? 200 : result.reason === 'missing-vapid' ? 503 : 500;
    res.status(status).json(result);
  } catch (err) {
    console.warn('[CalmMama] web-push dispatch error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected dispatch error' });
  }
};
