/**
 * Vercel serverless: create Stripe Checkout Session (monthly | annual).
 * POST /api/stripe/checkout-session
 * Body: { plan: 'monthly' | 'annual', email?: string }
 *
 * Both plans set allow_promotion_codes: true on sessions.create.
 */

const {
  createSubscriptionCheckoutSession,
  resolveAppOrigin,
} = require('../../stripeCheckoutSession');

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
    const plan = body.plan || body.tier || req.query?.plan;
    const email = body.email || body.customer_email || req.query?.email;
    const origin = body.origin || resolveAppOrigin(req);

    const result = await createSubscriptionCheckoutSession({ plan, email, origin });
    const status = result.ok ? 200 : result.status || 500;
    res.status(status).json(result);
  } catch (err) {
    console.warn('[CalmMama] checkout-session route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected checkout error' });
  }
};
