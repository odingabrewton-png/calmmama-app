import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SUBSCRIPTION_PLANS = {
  monthly: 'monthly',
  yearly: 'yearly',
  gift: 'gift',
};

const PLAN_OPTIONS = [
  {
    id: SUBSCRIPTION_PLANS.monthly,
    title: 'Monthly Circle',
    price: '$9.99 / month',
    caption: 'Flexible support, cancel anytime.',
    bestValue: false,
  },
  {
    id: SUBSCRIPTION_PLANS.yearly,
    title: 'Yearly Village Pass',
    price: '$59.99 / year',
    caption: 'Save over 50%. Complete peace of mind for the toddler years.',
    bestValue: true,
  },
  {
    id: SUBSCRIPTION_PLANS.gift,
    title: 'Gift to a Mama',
    price: '$39.99 / year',
    caption: 'Sponsor a beautiful mama in your life with a full year of premium access.',
    bestValue: false,
  },
];

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  default: { fontFamily: 'serif' },
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
  initialPlan = SUBSCRIPTION_PLANS.yearly,
}) {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  useEffect(() => {
    if (visible) setSelectedPlan(initialPlan);
  }, [visible, initialPlan]);

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout(selectedPlan);
      return;
    }
    const plan = PLAN_OPTIONS.find((p) => p.id === selectedPlan);
    Alert.alert(
      'CalmMama Circle',
      `Checkout for ${plan?.title ?? 'premium'} will connect to the App Store soon.`
    );
  };

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
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={12} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.eyebrow, SERIF]}>CALMMAMA PREMIUM</Text>
          <Text style={[styles.title, SERIF]}>Join the CalmMama Circle</Text>
          <Text style={[styles.subtitle, SERIF]}>
            Mamas aren&apos;t meant to do this alone. Unlock your village.
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

          <Text style={styles.finePrint}>
            Cancel anytime · Secure checkout · Restore purchases on device
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.9}>
            <Text style={styles.checkoutBtnText}>Unlock Premium Access</Text>
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#6A7A68',
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A382E',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5A6A62',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  planStack: {
    gap: 14,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 198, 188, 0.45)',
    ...Platform.select({
      ios: {
        shadowColor: '#2A382E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  planCardSelected: {
    borderColor: 'rgba(92, 122, 104, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  planCardBest: {
    borderColor: ROSE_GOLD,
    borderWidth: 2,
    paddingTop: 26,
    ...Platform.select({
      ios: {
        shadowColor: ROSE_GOLD,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  bestValueBanner: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    backgroundColor: ROSE_GOLD,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROSE_GOLD_GLOW,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FFF9F4',
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A382E',
    marginBottom: 6,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D5246',
    marginBottom: 6,
  },
  planCaption: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6A7A68',
    fontStyle: 'italic',
  },
  finePrint: {
    fontSize: 11,
    color: '#8A9A92',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    borderTopWidth: 1,
    borderTopColor: ROSE_GOLD_SOFT,
    backgroundColor: 'rgba(255, 252, 248, 0.88)',
  },
  checkoutBtn: {
    backgroundColor: 'rgba(92, 122, 104, 0.92)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(92, 122, 104, 0.25)',
  },
  checkoutBtnText: {
    color: '#FFF9F4',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerGhost: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerGhostText: {
    fontSize: 13,
    color: '#6A7A68',
    fontWeight: '600',
  },
});
