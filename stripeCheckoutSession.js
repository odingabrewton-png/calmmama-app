/**
 * Stripe Checkout Session helper for Monthly + Annual Village subscriptions.
 * Enables Stripe promotion codes on hosted Checkout via allow_promotion_codes.
 */

const Stripe = require('stripe');

const SUBSCRIPTION_PLANS = Object.freeze({
  monthly: 'monthly',
  annual: 'annual',
});

function normalizePlan(plan) {
  const raw = String(plan || '')
    .trim()
    .toLowerCase();
  if (raw === 'yearly' || raw === 'founding40' || raw === 'annual') {
    return SUBSCRIPTION_PLANS.annual;
  }
  if (raw === 'monthly' || raw === 'general') {
    return SUBSCRIPTION_PLANS.monthly;
  }
  return null;
}

function resolvePriceId(plan) {
  if (plan === SUBSCRIPTION_PLANS.monthly) {
    return (
      process.env.STRIPE_PRICE_MONTHLY ||
      process.env.STRIPE_PRICE_ID_MONTHLY ||
      process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY ||
      ''
    ).trim();
  }
  if (plan === SUBSCRIPTION_PLANS.annual) {
    return (
      process.env.STRIPE_PRICE_ANNUAL ||
      process.env.STRIPE_PRICE_YEARLY ||
      process.env.STRIPE_PRICE_ID_ANNUAL ||
      process.env.EXPO_PUBLIC_STRIPE_PRICE_ANNUAL ||
      ''
    ).trim();
  }
  return '';
}

function resolveSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET ||
    ''
  ).trim();
}

function resolveAppOrigin(req) {
  const fromEnv = (
    process.env.STRIPE_CHECKOUT_ORIGIN ||
    process.env.APP_ORIGIN ||
    process.env.EXPO_PUBLIC_APP_ORIGIN ||
    ''
  ).trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const proto = String(req?.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '')
    .split(',')[0]
    .trim();
  if (host) return `${proto}://${host}`;

  return 'https://calmmamavillage.com';
}

/**
 * Create a Stripe Checkout Session for monthly or annual subscription.
 * Both plans set allow_promotion_codes: true so customers can enter promo codes.
 *
 * @param {{ plan: string, email?: string, origin?: string }} opts
 * @returns {Promise<{ ok: boolean, url?: string, sessionId?: string, plan?: string, error?: string, status?: number }>}
 */
async function createSubscriptionCheckoutSession({ plan, email, origin } = {}) {
  const normalizedPlan = normalizePlan(plan);
  if (!normalizedPlan) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid plan. Use "monthly" or "annual".',
    };
  }

  const secretKey = resolveSecretKey();
  if (!secretKey) {
    return {
      ok: false,
      status: 503,
      error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).',
    };
  }

  const priceId = resolvePriceId(normalizedPlan);
  if (!priceId) {
    return {
      ok: false,
      status: 503,
      error:
        normalizedPlan === SUBSCRIPTION_PLANS.monthly
          ? 'Missing STRIPE_PRICE_MONTHLY environment variable.'
          : 'Missing STRIPE_PRICE_ANNUAL environment variable.',
    };
  }

  const appOrigin = String(origin || '')
    .trim()
    .replace(/\/$/, '') || 'https://calmmamavillage.com';
  const successUrl = `${appOrigin}/app?upgraded=1&plan=${normalizedPlan}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appOrigin}/app?checkout=cancelled&plan=${normalizedPlan}`;

  const stripe = new Stripe(secretKey);

  const sessionParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    // Enable "Add promotion code" on Stripe-hosted Checkout for both monthly + annual.
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan: normalizedPlan,
      source: 'calmmama_checkout_session',
    },
    subscription_data: {
      metadata: {
        plan: normalizedPlan,
      },
    },
  };

  const trimmedEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (trimmedEmail && trimmedEmail.includes('@')) {
    sessionParams.customer_email = trimmedEmail;
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    if (!session?.url) {
      return {
        ok: false,
        status: 502,
        error: 'Stripe did not return a checkout URL.',
      };
    }
    return {
      ok: true,
      url: session.url,
      sessionId: session.id,
      plan: normalizedPlan,
    };
  } catch (err) {
    console.warn('[CalmMama] Stripe checkout.sessions.create failed', err?.message || err);
    return {
      ok: false,
      status: 502,
      error: err?.message || 'Unable to create Stripe Checkout Session.',
    };
  }
}

module.exports = {
  SUBSCRIPTION_PLANS,
  normalizePlan,
  resolvePriceId,
  resolveSecretKey,
  resolveAppOrigin,
  createSubscriptionCheckoutSession,
};
