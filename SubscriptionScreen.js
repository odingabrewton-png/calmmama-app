import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { openStripeCheckout, redeemVipPromoCode } from './membershipAccess';

export const SUBSCRIPTION_PLANS = {
  monthly: 'monthly',
  yearly: 'yearly',
  gift: 'gift',
};

const PLAN_OPTIONS = [
  {
    id: SUBSCRIPTION_PLANS.monthly,
    title: 'General Access',
    price: '$5.99 / month',
    caption: 'Everyday Village tools — bloom, sanctuary, and soft community support.',
    bestValue: false,
    cta: 'Upgrade ($5.99/mo)',
    stripeKey: 'monthly',
  },
  {
    id: SUBSCRIPTION_PLANS.yearly,
    title: 'Founding Mother',
    price: '$25 / year',
    caption: 'Founding 40 status, launch gifts, AI Oracle, and full registry perks.',
    bestValue: true,
    cta: 'Upgrade to Founding Mother ($25/yr)',
    stripeKey: 'annual',
  },
  {
    id: SUBSCRIPTION_PLANS.gift,
    title: 'Gift to a Mama',
    price: '$15 one-time',
    caption: 'Sponsor a beautiful mama with Founding-level access as a gift.',
    bestValue: false,
    cta: 'Gift a Mama ($15)',
    stripeKey: 'gift',
  },
];

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
});

const SANS = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "SF Pro Text", sans-serif' },
  ios: { fontFamily: 'System' },
  default: { fontFamily: 'sans-serif' },
});

function PricingCard({ plan, selected, onSelect }) {
  const isBest = plan.bestValue;
  const isSelected = selected === plan.id;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSelect(plan.id)}
      style={[
        styles.planCard,
        isSelected && styles.planCardSelected,
        isBest && styles.planCardBest,
      ]}
    >
      {isBest ? (
        <View style={styles.bestValueBanner}>
          <Text style={styles.bestValueText}>Best Value</Text>
        </View>
      ) : null}
      <Text style={[styles.planTitle, SERIF]}>{plan.title}</Text>
      <Text style={[styles.planPrice, SERIF]}>{plan.price}</Text>
      <Text style={[styles.planCaption, SERIF]}>{plan.caption}</Text>
    </TouchableOpacity>
  );
}

export default function SubscriptionScreen({
  visible,
  onClose,
  onCheckout,
  onVipRedeemed,
  initialPlan = SUBSCRIPTION_PLANS.yearly,
  memberEmail = null,
}) {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoBusy, setPromoBusy] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedPlan(initialPlan);
      setCodeExpanded(false);
      setPromoCode('');
      setPromoError('');
      setPromoBusy(false);
      expandAnim.setValue(0);
    }
  }, [visible, initialPlan, expandAnim]);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: codeExpanded ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [codeExpanded, expandAnim]);

  const handleCheckout = async () => {
    const plan = PLAN_OPTIONS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    const opened = await openStripeCheckout(plan.stripeKey, { email: memberEmail });
    if (opened) {
      onCheckout?.(selectedPlan, { deferredUnlock: true });
      return;
    }

    if (onCheckout) {
      onCheckout(selectedPlan);
      return;
    }

    Alert.alert(
      'CalmMama Circle',
      `Checkout for ${plan?.title ?? 'premium'} will connect shortly.`,
    );
  };

  const handleRedeemPromo = async () => {
    if (promoBusy) return;
    setPromoError('');
    setPromoBusy(true);
    try {
      const result = await redeemVipPromoCode(promoCode, { email: memberEmail });
      if (!result.ok) {
        setPromoError(result.error || "That code isn't quite right. Try again mama!");
        return;
      }
      // Bypass Stripe — unlock Pro + celebratory modal via parent.
      onVipRedeemed?.(result.membership, result);
    } finally {
      setPromoBusy(false);
    }
  };

  const selected = PLAN_OPTIONS.find((p) => p.id === selectedPlan);
  const inputMaxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 118],
  });
  const inputOpacity = expandAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.4, 1],
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <LinearGradient
        colors={['#E8EFE9', '#F5E8DF', '#EDE4F0', '#F8EDE4']}
        locations={[0, 0.35, 0.68, 1]}
        style={styles.gradientRoot}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={12} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.eyebrow, SERIF]}>CALMMAMA PREMIUM</Text>
          <Text style={[styles.title, SERIF]}>Upgrade your Village access</Text>
          <Text style={[styles.subtitle, SERIF]}>
            Free Explorer is a beautiful start. Unlock AI Oracle, full registry perks, and founding
            badges whenever you are ready.
          </Text>

          <View style={styles.planStack}>
            {PLAN_OPTIONS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan}
                onSelect={setSelectedPlan}
              />
            ))}
          </View>

          <View style={styles.foundingCodeBlock}>
            <TouchableOpacity
              onPress={() => {
                setCodeExpanded((open) => !open);
                if (promoError) setPromoError('');
              }}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ expanded: codeExpanded }}
              hitSlop={8}
            >
              <Text style={[styles.foundingCodeLink, SANS]}>
                {codeExpanded ? 'Hide Founding Mother Code' : 'Have a Founding Mother Code?'}
              </Text>
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.foundingCodePanel,
                {
                  maxHeight: inputMaxHeight,
                  opacity: inputOpacity,
                  overflow: 'hidden',
                },
              ]}
              pointerEvents={codeExpanded ? 'auto' : 'none'}
            >
              <View style={styles.promoRow}>
                <TextInput
                  style={[styles.promoInput, SANS]}
                  value={promoCode}
                  onChangeText={(text) => {
                    setPromoCode(text);
                    if (promoError) setPromoError('');
                  }}
                  placeholder="Enter your code"
                  placeholderTextColor="#9AA89A"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  returnKeyType="done"
                  onSubmitEditing={handleRedeemPromo}
                  editable={!promoBusy}
                  accessibilityLabel="Founding Mother code"
                />
                <TouchableOpacity
                  style={[styles.promoBtn, promoBusy && styles.promoBtnDisabled]}
                  onPress={handleRedeemPromo}
                  activeOpacity={0.88}
                  disabled={promoBusy || !String(promoCode || '').trim()}
                >
                  <Text style={[styles.promoBtnText, SANS]}>
                    {promoBusy ? '…' : 'Redeem'}
                  </Text>
                </TouchableOpacity>
              </View>
              {promoError ? <Text style={[styles.promoError, SANS]}>{promoError}</Text> : null}
            </Animated.View>
          </View>

          <Text style={styles.finePrint}>
            Secure Stripe checkout · Cancel anytime · Return to /app after payment to unlock
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.9}>
            <Text style={styles.checkoutBtnText}>
              {selected?.cta || 'Unlock Premium Access'}
            </Text>
          </TouchableOpacity>
          <Pressable onPress={onClose} style={styles.footerGhost}>
            <Text style={styles.footerGhostText}>Not right now</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const ROSE_GOLD = '#C4A574';
const ROSE_GOLD_SOFT = 'rgba(196, 165, 116, 0.35)';
const ROSE_GOLD_GLOW = 'rgba(196, 165, 116, 0.55)';

const styles = StyleSheet.create({
  gradientRoot: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.4)',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#5A6A62',
    fontWeight: '600',
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: '#8A7A6A',
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: '#3D443A',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6E7E65',
    marginBottom: 22,
  },
  planStack: {
    gap: 12,
  },
  planCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 198, 188, 0.55)',
  },
  planCardSelected: {
    borderColor: ROSE_GOLD,
    backgroundColor: 'rgba(255, 252, 248, 0.95)',
    ...Platform.select({
      web: { boxShadow: `0 8px 24px ${ROSE_GOLD_SOFT}` },
      default: {
        shadowColor: ROSE_GOLD_GLOW,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  planCardBest: {
    borderColor: 'rgba(196, 165, 116, 0.65)',
  },
  bestValueBanner: {
    alignSelf: 'flex-start',
    backgroundColor: ROSE_GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  bestValueText: {
    color: '#FFF9F2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 18,
    color: '#3D443A',
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 22,
    color: '#5A4A3A',
    fontWeight: '700',
    marginBottom: 6,
  },
  planCaption: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6E7E65',
  },
  foundingCodeBlock: {
    marginTop: 22,
    alignItems: 'center',
  },
  foundingCodeLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A4A',
    textDecorationLine: 'underline',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  foundingCodePanel: {
    width: '100%',
    marginTop: 12,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 198, 188, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#3D443A',
    letterSpacing: 0.6,
  },
  promoBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: ROSE_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnDisabled: {
    opacity: 0.55,
  },
  promoBtnText: {
    color: '#FFF9F2',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  promoError: {
    marginTop: 8,
    fontSize: 13,
    color: '#B45A5A',
    fontWeight: '600',
    textAlign: 'center',
  },
  finePrint: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 17,
    color: '#8A968A',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 198, 188, 0.35)',
    backgroundColor: 'rgba(255, 252, 248, 0.82)',
  },
  checkoutBtn: {
    backgroundColor: '#3D443A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFF9F2',
    fontSize: 15,
    fontWeight: '700',
  },
  footerGhost: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerGhostText: {
    color: '#8A968A',
    fontSize: 14,
  },
});
