import { SUBSCRIPTION_PLANS } from './SubscriptionScreen';

export const SUBSCRIPTION_PRODUCT_IDS = {
  [SUBSCRIPTION_PLANS.monthly]: 'com.calmmama.monthly',
  [SUBSCRIPTION_PLANS.yearly]: 'com.calmmama.yearly',
  [SUBSCRIPTION_PLANS.gift]: 'com.calmmama.gift',
};

export function getSubscriptionProductId(planId) {
  return SUBSCRIPTION_PRODUCT_IDS[planId] ?? null;
}

/** First 40 founding bundle — yearly inner circle only */
export function isYearlyFoundingGiftTier(userSubscriptionType, productId) {
  if (
    userSubscriptionType === SUBSCRIPTION_PLANS.yearly ||
    userSubscriptionType === 'yearly' ||
    userSubscriptionType === 'vip_lifetime' ||
    userSubscriptionType === 'vip'
  ) {
    return true;
  }
  const yearlyProductId = SUBSCRIPTION_PRODUCT_IDS[SUBSCRIPTION_PLANS.yearly];
  return productId === yearlyProductId || productId === 'com.calmmama.yearly';
}

export function isPremiumSubscribed(userSubscriptionType) {
  return (
    userSubscriptionType === SUBSCRIPTION_PLANS.monthly ||
    userSubscriptionType === SUBSCRIPTION_PLANS.yearly ||
    userSubscriptionType === SUBSCRIPTION_PLANS.gift ||
    userSubscriptionType === 'vip_lifetime' ||
    userSubscriptionType === 'vip'
  );
}
