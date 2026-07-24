/**
 * Alias for Stripe subscription Checkout Session create.
 * POST /api/checkout — same behavior as /api/stripe/checkout-session.
 * Monthly + Annual both use allow_promotion_codes: true.
 */

module.exports = require('./stripe/checkout-session');
