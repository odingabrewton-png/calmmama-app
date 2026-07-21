import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SmoothOmbreBackground from './SmoothOmbreBackground';
import PWAInstallPrompt from './PWAInstallPrompt';
import {
  DESKTOP_PHONE,
  useDesktopPhoneScale,
  useDesktopWebLayout,
  useViewportSize,
} from './mobileWebLayout';

const TAG_GENERAL_ID = '21294780';
const TAG_FOUNDING_ID = '21294779';
const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/test_dRmbJ1dsd89l2jTb0P9EI03',
  gift: 'https://buy.stripe.com/test_fZu3cv5ZL61d2jT1qf9EI01',
  annual: 'https://buy.stripe.com/test_eVq28rgEp0GT5w5fh59EI02',
};

const CHARCOAL = '#3d443a';
const SAGE_TEXT = '#6e7e65';
const PURPLE = '#9a75d5';
const PURPLE_SOFT = '#c4a8ef';
const PURPLE_DEEP = '#7b5bb8';
const FROST = 'rgba(253, 251, 247, 0.65)';
const CONTENT_MAX = 1120;
/** Soft garden rain — solid blooms only (no 💮 stamp / outline glyphs). */
const PETAL_EMOJIS = ['🌸', '🌷', '🌼', '🪷', '🌸', '🌿', '🍃', '🌼', '🌷', '🌸'];

const FEATURES = [
  {
    id: 'oracle',
    icon: '✦',
    title: 'The Baby Name Oracle',
    body: 'Find the perfect energetic match for your baby through a mindful, vibe-checked exploration.',
  },
  {
    id: 'registry',
    icon: '🎁',
    title: 'The Village Registry',
    body: 'Curate the essentials you actually need, selected with grace and shared with ease.',
  },
  {
    id: 'movement',
    icon: '🪷',
    title: 'Nurturing Movement',
    body: 'Gentle, trimester-safe flows and prenatal yoga designed to restore your nervous system.',
  },
];

const SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", "Iowan Old Style", serif' },
  default: {},
});

const SANS = Platform.select({
  web: { fontFamily: '"Avenir Next", "Segoe UI", system-ui, sans-serif' },
  default: {},
});

const frostSurface = Platform.select({
  web: {
    backgroundColor: FROST,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  default: {
    backgroundColor: FROST,
  },
});

/** True only when launched as an installed Home Screen / PWA — not a normal browser tab. */
function readInstalledAppMode() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    const displayStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches === true;
    const iosStandalone = window.navigator?.standalone === true;
    return !!(displayStandalone || iosStandalone);
  } catch (_) {
    return false;
  }
}

/** Phone browsers should always get the marketing page (even with “Request Desktop Website”). */
function readIsPhoneBrowser() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    const ua = String(window.navigator?.userAgent || '');
    if (/iPhone|iPod/i.test(ua)) return true;
    if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
    if (window.matchMedia?.('(max-width: 768px)')?.matches) return true;
    return false;
  } catch (_) {
    return false;
  }
}

function buildPetalSpecs(count = 36) {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i + 1) * 17;
    // Even column spread + light jitter so rain fills the full width
    const column = (i / count) * 100;
    const jitter = ((seed * 13) % 700) / 100 - 3.5;
    return {
      id: `petal-${i}`,
      emoji: PETAL_EMOJIS[i % PETAL_EMOJIS.length],
      leftPct: Math.max(0, Math.min(98, column + jitter)),
      size: 12 + ((seed * 13) % 18),
      opacity: 0.32 + (((seed * 7) % 38) / 100),
      duration: 9000 + ((seed * 53) % 10000),
      delay: (seed * 29) % 8000,
      drift: -42 + ((seed * 11) % 84),
      spin: 90 + ((seed * 19) % 280),
      startOffset: ((seed * 41) % 55),
    };
  });
}

function FallingPetal({ spec, fallDistance }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let loop;

    const start = () => {
      if (cancelled) return;
      progress.setValue(0);
      loop = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: spec.duration,
          easing: Easing.linear,
          useNativeDriver: true,
          delay: spec.delay,
        }),
      );
      loop.start();
    };

    const t = setTimeout(start, 16);
    return () => {
      cancelled = true;
      clearTimeout(t);
      loop?.stop?.();
      progress.stopAnimation();
    };
  }, [progress, spec.delay, spec.duration]);

  const startY = -40 - (spec.startOffset || 0);

  const style = {
    position: 'absolute',
    left: `${spec.leftPct}%`,
    top: startY,
    opacity: spec.opacity,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, fallDistance - startY + 80],
        }),
      },
      {
        translateX: progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, spec.drift, spec.drift * 0.35],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${spec.spin}deg`],
        }),
      },
    ],
  };

  return (
    <Animated.Text style={[style, { fontSize: spec.size }]} pointerEvents="none">
      {spec.emoji}
    </Animated.Text>
  );
}

/** Shared petal rain — desktop landing + mobile browser landing. */
export const RainingFlowerPetals = memo(function RainingFlowerPetals({ count = 36 }) {
  const { height, width } = useViewportSize();
  // Cover full viewport (and tall scroll canvases) edge to edge
  const fallDistance = Math.max(
    height || 800,
    width || 0,
    Platform.OS === 'web' && typeof document !== 'undefined'
      ? Math.max(document.documentElement?.scrollHeight || 0, document.body?.scrollHeight || 0)
      : 0,
    900,
  );
  const specs = useMemo(() => buildPetalSpecs(count), [count]);

  return (
    <View style={petalStyles.layer} pointerEvents="none">
      {specs.map((spec) => (
        <FallingPetal key={spec.id} spec={spec} fallDistance={fallDistance} />
      ))}
    </View>
  );
});

function FrostCard({ children, style }) {
  return <View style={[styles.frostCard, style]}>{children}</View>;
}

function InstallPill({ label, onPress, glowing = false, style, contentStyle, pulsing = false }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulsing) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, pulse]);

  return (
    <Animated.View style={[{ transform: [{ scale: pulse }] }, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.ctaOuter,
          glowing && styles.ctaGlow,
          pressed && styles.ctaPressed,
        ]}
      >
        <LinearGradient
          colors={[PURPLE_SOFT, PURPLE, PURPLE_DEEP]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ctaGradient, contentStyle]}
        >
          <Text style={styles.ctaLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function WaitlistFormCard({
  signupTier,
  setSignupTier,
  contactInfo,
  setContactInfo,
  isSubmitted,
  setIsSubmitted,
  isSubmitting = false,
  checkoutPlan,
  setCheckoutPlan,
  onSubmit,
  compact = false,
}) {
  const isFounding = signupTier === 'founding40';
  const waitlistDescription = isFounding
    ? 'Join the Founding Mother tier for full Village access, premium oracle features, and launch-day gifts 👑'
    : 'Join our open waitlist for Village updates and launch alerts 🤍';
  const waitlistButtonLabel = isSubmitting
    ? 'Saving your spot…'
    : isFounding
      ? checkoutPlan === 'annual'
        ? 'Join the Village (Annual) 👑'
        : 'Join the Village ($5.99/mo) 👑'
      : 'Join Waitlist 🌸';
  const successTitle = 'Welcome to the Village! 🌸';
  const successBody = "We've saved your spot for Village updates and launch-day alerts.";

  return (
    <FrostCard style={[styles.frostedFormCard, compact && styles.frostedFormCardMobile]}>
      <View style={styles.tierToggleRow}>
        <Pressable
          onPress={() => {
            if (isSubmitting) return;
            setSignupTier('general');
            setIsSubmitted(false);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isFounding }}
          style={[styles.tierTab, !isFounding && styles.tierTabActive]}
        >
          <Text style={[styles.tierTabText, !isFounding && styles.tierTabTextActive, SANS]}>
            General Waitlist
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (isSubmitting) return;
            setSignupTier('founding40');
            setIsSubmitted(false);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: isFounding }}
          style={[styles.tierTab, isFounding && styles.tierTabActiveFounding]}
        >
          <Text
            style={[styles.tierTabText, isFounding && styles.tierTabTextActiveFounding, SANS]}
          >
            Founding 40 Club 👑
          </Text>
        </Pressable>
      </View>

      {isSubmitted ? (
        <View style={styles.successBlock}>
          <Text style={[styles.successTitle, SERIF]}>{successTitle}</Text>
          <Text style={[styles.successBody, SANS]}>{successBody}</Text>
          <Pressable
            onPress={() => setIsSubmitted(false)}
            style={styles.successAgain}
            accessibilityRole="button"
          >
            <Text style={[styles.successAgainText, SANS]}>Add another contact</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={[styles.waitlistDescription, SANS]}>{waitlistDescription}</Text>
          {isFounding ? (
            <View style={styles.billingToggleRow}>
              <Pressable
                onPress={() => {
                  if (!isSubmitting) setCheckoutPlan('monthly');
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: checkoutPlan === 'monthly' }}
                style={[
                  styles.billingOption,
                  checkoutPlan === 'monthly' && styles.billingOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.billingOptionText,
                    checkoutPlan === 'monthly' && styles.billingOptionTextActive,
                    SANS,
                  ]}
                >
                  Monthly · $5.99
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!isSubmitting) setCheckoutPlan('annual');
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: checkoutPlan === 'annual' }}
                style={[
                  styles.billingOption,
                  checkoutPlan === 'annual' && styles.billingOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.billingOptionText,
                    checkoutPlan === 'annual' && styles.billingOptionTextActive,
                    SANS,
                  ]}
                >
                  Annual
                </Text>
              </Pressable>
            </View>
          ) : null}
          <TextInput
            value={contactInfo}
            onChangeText={setContactInfo}
            placeholder="Enter your email address..."
            placeholderTextColor="rgba(110, 126, 101, 0.55)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            style={[styles.waitlistInput, SANS]}
            onSubmitEditing={() => onSubmit()}
            returnKeyType="done"
            accessibilityLabel="Email for launch waitlist"
          />
          <InstallPill
            label={waitlistButtonLabel}
            onPress={isSubmitting ? undefined : () => onSubmit()}
            pulsing={!isSubmitting}
            style={styles.waitlistBtn}
          />
          <Pressable
            onPress={isSubmitting ? undefined : () => onSubmit('gift')}
            disabled={isSubmitting}
            accessibilityRole="button"
            style={styles.giftButton}
          >
            <Text style={[styles.giftButtonText, SANS]}>Gift a Mama 🎁</Text>
          </Pressable>
        </>
      )}
    </FrostCard>
  );
}

/**
 * Web marketing shell:
 * - Installed PWA / standalone → app only
 * - Desktop browser → dual-column Shots.so landing
 * - Mobile browser → vertical marketing + waitlist (install via Share guide)
 */
function RootWebLandingWrapper({ children, showNotch = true }) {
  const isDesktopWidth = useDesktopWebLayout();
  const { width: viewportW, height: viewportH } = useViewportSize();
  const phoneScale = useDesktopPhoneScale();
  const columnScale = Math.min(
    phoneScale,
    Math.max(0.55, (Math.min(viewportH, 900) - 80) / DESKTOP_PHONE.height),
  );
  const compact = viewportW < 1100;

  const [isInstalledAppMode, setIsInstalledAppMode] = useState(readInstalledAppMode);
  const [isPhoneBrowser, setIsPhoneBrowser] = useState(readIsPhoneBrowser);
  const floatY = useRef(new Animated.Value(0)).current;
  const floatTilt = useRef(new Animated.Value(0)).current;
  const deferredPromptRef = useRef(null);
  const [installHint, setInstallHint] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [signupTier, setSignupTier] = useState('general');
  const [checkoutPlan, setCheckoutPlan] = useState('monthly');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const installPrimaryRef = useRef(() => {});

  const bindInstallPrimary = useCallback((handler) => {
    installPrimaryRef.current = typeof handler === 'function' ? handler : () => {};
  }, []);

  const handleMobileInstallPress = useCallback(() => {
    try {
      installPrimaryRef.current?.();
    } catch (_) {
      /* ignore */
    }
  }, []);

  // Desktop canvas only on wide non-phone browsers; phones always get mobile marketing.
  const isDesktop = isDesktopWidth && !isPhoneBrowser;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const checkMode = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsInstalledAppMode(!!isStandalone);
      setIsPhoneBrowser(readIsPhoneBrowser());
    };
    checkMode();

    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onMq = () => checkMode();
    mq?.addEventListener?.('change', onMq);
    mq?.addListener?.(onMq);
    window.addEventListener('resize', checkMode);

    return () => {
      mq?.removeEventListener?.('change', onMq);
      mq?.removeListener?.(onMq);
      window.removeEventListener('resize', checkMode);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    if (isInstalledAppMode) return undefined;

    const onBeforeInstall = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setInstallHint('');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatY, {
            toValue: -10,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatTilt, {
            toValue: 1,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatY, {
            toValue: 5,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatTilt, {
            toValue: 0,
            duration: 3400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    floatLoop.start();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      floatLoop.stop();
    };
  }, [floatY, floatTilt, isInstalledAppMode]);

  const phoneMotionStyle = {
    transform: [
      { translateY: floatY },
      {
        rotate: floatTilt.interpolate({
          inputRange: [0, 1],
          outputRange: ['-1.4deg', '1.2deg'],
        }),
      },
      { scale: columnScale },
    ],
  };

  const handleInstall = useCallback(async () => {
    const promptEvent = deferredPromptRef.current;
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        deferredPromptRef.current = null;
        if (choice?.outcome === 'accepted') {
          setInstallHint('Welcome home — your sanctuary is on your device.');
        }
      } catch (_) {
        setInstallHint('Use your browser’s install icon in the address bar.');
      }
      return;
    }
    setInstallHint(
      'Look for the install icon in your browser’s address bar, or open the menu → Install app.',
    );
  }, []);

  const handleWaitlistSubmit = useCallback(async (checkoutOverride) => {
    if (isSubmitting) return;

    const value = String(contactInfo || '').trim();
    if (!value) {
      Alert.alert('Almost there', 'Please enter your email address to save your spot.');
      return;
    }

    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!looksLikeEmail) {
      Alert.alert(
        'Email needed',
        'Please enter a valid email address so we can add you to the village waitlist.',
      );
      return;
    }

    const requestedCheckout =
      typeof checkoutOverride === 'string'
        ? checkoutOverride
        : signupTier === 'founding40'
          ? checkoutPlan
          : null;
    const activeTagId = requestedCheckout ? TAG_FOUNDING_ID : TAG_GENERAL_ID;
    setIsSubmitting(true);

    const showError = (title, message) => {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    try {
      const response = await window.fetch(
        `https://api.convertkit.com/v3/tags/${activeTagId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            api_secret: '-xoTOTkQ7noQ46t6HWj9D71o-FNL06yC_11_o6j1ONc',
            email: value,
            skip_incentive: true,
          }),
        },
      );

      const raw = await response.text().catch(() => '');
      let parsed = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (_) {
        parsed = null;
      }

      if (!response.ok) {
        console.warn('ConvertKit subscribe failed', response.status, raw);
        const kitMessage =
          parsed?.message || parsed?.error || parsed?.errors?.[0] || raw || `HTTP ${response.status}`;
        showError(
          'Couldn’t save your spot',
          response.status === 401
            ? `Kit rejected the API secret (401). Paste your real V3 API Secret from Kit → Settings → Advanced → API.\n\n${kitMessage}`
            : `Kit could not add this email.\n\n${kitMessage}`,
        );
        return;
      }

      console.log(`🚀 ROUTING TO LIST [${signupTier.toUpperCase()}]:`, {
        email: value,
        tagId: activeTagId,
        tier: signupTier,
        checkout: requestedCheckout,
      });
      setContactInfo('');

      if (!requestedCheckout) {
        setIsSubmitted(true);
        return;
      }

      if (typeof window !== 'undefined') {
        window.location.href = STRIPE_LINKS[requestedCheckout];
        return;
      }

      showError('Checkout unavailable', 'Please open this page in your browser to continue.');
    } catch (err) {
      console.warn('ConvertKit subscribe network error', err);
      showError(
        'Couldn’t save your spot',
        'Network hiccup — check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [checkoutPlan, contactInfo, isSubmitting, signupTier]);

  const openPrivacy = useCallback(() => {
    Linking.openURL('mailto:founder.calmmamavillage@gmail.com?subject=Privacy%20Policy').catch(
      () => {},
    );
  }, []);

  // —— Installed home-screen app: skip all marketing ——
  if (isInstalledAppMode) {
    return <View style={styles.installedAppRoot}>{children}</View>;
  }

  const waitlistProps = {
    signupTier,
    setSignupTier,
    contactInfo,
    setContactInfo,
    isSubmitted,
    setIsSubmitted,
    isSubmitting,
    checkoutPlan,
    setCheckoutPlan,
    onSubmit: handleWaitlistSubmit,
  };

  // —— Mobile browser: edge-to-edge marketing + waitlist ——
  if (!isDesktop) {
    return (
      <View style={styles.mobileRoot}>
        <View style={styles.mobileAmbient} pointerEvents="none">
          <View style={styles.mobileOmbreFill}>
            <SmoothOmbreBackground />
          </View>
          <View style={styles.ambientVeil} />
          <RainingFlowerPetals count={32} />
        </View>

        <ScrollView
          style={styles.mobileScroll}
          contentContainerStyle={styles.mobileScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
        >
          <View style={styles.mobileColumn}>
            <Text style={[styles.mobileEyebrow, SANS]}>Calm Mama Village</Text>
            <Text style={[styles.mobileHeadline, SERIF]}>
              Your Digital Sanctuary.{'\n'}Softly, Beautifully.
            </Text>
            <Text style={[styles.mobileSubtitle, SANS]}>
              Track your weekly bloom, curate your village registry, and find daily grace in
              quiet-hour connection. Welcome home, beautiful mama.
            </Text>

            <WaitlistFormCard {...waitlistProps} compact />

            <FrostCard style={styles.mobilePreviewCard}>
              <View style={styles.mobilePreviewNotch} />
              <Text style={[styles.mobilePreviewTitle, SERIF]}>Inside your sanctuary</Text>
              <Text style={[styles.mobilePreviewBody, SANS]}>
                Weekly bloom tracking · Village registry · Name oracle · Midnight lounge · Gentle
                movement — all waiting for you on your Home Screen.
              </Text>
              <View style={styles.mobilePreviewChipRow}>
                {['Bloom', 'Oracle', 'Lounge'].map((chip) => (
                  <View key={chip} style={styles.mobilePreviewChip}>
                    <Text style={[styles.mobilePreviewChipText, SANS]}>{chip}</Text>
                  </View>
                ))}
              </View>
            </FrostCard>

            <FrostCard style={styles.mobileInstallHintCard}>
              <Text style={[styles.mobileInstallHintTitle, SERIF]}>
                Add Calm Mama to Home Screen
              </Text>
              <Text style={[styles.mobileInstallHintBody, SANS]}>
                Tap Share 📤 at the bottom of Safari, then choose{' '}
                <Text style={styles.legalLink}>Add to Home Screen</Text> — your village opens like a
                native app, soft and ready.
              </Text>
            </FrostCard>

            {/* End-of-page CTA — in document flow (not floating/absolute) */}
            <InstallPill
              label="Add to Home Screen"
              onPress={handleMobileInstallPress}
              glowing
              pulsing
              style={styles.mobileInstallCta}
              contentStyle={styles.mobileInstallCtaGradient}
            />

            <Text style={[styles.mobileLegal, SANS]}>
              By joining, you agree to our{' '}
              <Text style={styles.legalLink} onPress={openPrivacy}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </ScrollView>

        {/* iOS Share opt-in slide-up — absolute, separate from scroll CTA */}
        <PWAInstallPrompt onBindPrimary={bindInstallPrimary} autoOpenIosSheet />
      </View>
    );
  }

  // —— Desktop browser: dual-column landing with live phone ——
  return (
    <View style={styles.masterCanvas}>
      <View style={styles.ambientStage} pointerEvents="none">
        <SmoothOmbreBackground />
        <View style={styles.ambientVeil} />
        <RainingFlowerPetals count={40} />
      </View>

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.heroRow}>
            <View style={styles.copyColumn}>
              <Text style={styles.eyebrow}>Calm Mama Village</Text>
              <Text style={[styles.headline, compact && styles.headlineCompact, SERIF]}>
                Your Digital Sanctuary.{'\n'}Softly, Beautifully.
              </Text>
              <Text style={[styles.subtitle, compact && styles.subtitleCompact, SANS]}>
                Track your weekly bloom, curate your village registry, and find daily grace in
                quiet-hour connection. Welcome home, beautiful mama.
              </Text>

              <WaitlistFormCard {...waitlistProps} />
              {installHint ? <Text style={styles.installHint}>{installHint}</Text> : null}
            </View>

            <View style={styles.phoneColumn}>
              <Animated.View style={[styles.phoneFloatWrap, phoneMotionStyle]}>
                <View style={styles.phoneMockupBorder}>
                  {showNotch ? (
                    <View style={styles.iphoneNotch} pointerEvents="none" />
                  ) : null}
                  <View style={styles.phoneScreen}>{children}</View>
                </View>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, SANS]}>Inside your village</Text>
          <Text style={[styles.sectionTitle, SERIF]}>Soft tools for tender days</Text>
          <View style={styles.featureRow}>
            {FEATURES.map((feature) => (
              <FrostCard key={feature.id} style={styles.featureCard}>
                <View style={styles.featureIconOrb}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={[styles.featureTitle, SERIF]}>{feature.title}</Text>
                <Text style={[styles.featureBody, SANS]}>{feature.body}</Text>
              </FrostCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <FrostCard style={styles.midnightCard}>
            <View style={styles.midnightIcons}>
              <Text style={styles.midnightEmoji}>🌙</Text>
              <Text style={styles.midnightEmoji}>🍵</Text>
            </View>
            <Text style={[styles.midnightTitle, SERIF]}>For the Quietest Hours.</Text>
            <Text style={[styles.midnightBody, SANS]}>
              Midnight feedings, late-night worries—we’re here. Connect with your village in the
              “Midnight Lounge,” where we trade gentle rituals, support, and quiet-hour rest. You
              are never alone.
            </Text>
          </FrostCard>
        </View>

        <View style={[styles.section, styles.finalSection]}>
          <FrostCard style={styles.finalCard}>
            <Text style={[styles.finalLine, SERIF]}>You Matter, Mama.</Text>
            <Text style={[styles.finalLineSoft, SERIF]}>Welcome to your village.</Text>
            <InstallPill
              label="Claim Your Sanctuary (Install Now)"
              onPress={handleInstall}
              glowing
              style={styles.finalCta}
            />
            <Text style={[styles.legalLine, SANS]}>
              By installing, you agree to our{' '}
              <Text style={styles.legalLink} onPress={openPrivacy}>
                Privacy Policy
              </Text>
              .
            </Text>
          </FrostCard>
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(RootWebLandingWrapper);

const creamShadow = Platform.select({
  web: {
    boxShadow: '0 22px 56px rgba(61, 68, 58, 0.10), 0 6px 18px rgba(61, 68, 58, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  default: {
    shadowColor: '#3d443a',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
});

const petalStyles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
});

const styles = StyleSheet.create({
  installedAppRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mobileRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: { minHeight: '100dvh' },
      default: {},
    }),
  },
  mobileAmbient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  mobileOmbreFill: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'transparent',
  },
  mobileScroll: {
    flex: 1,
    zIndex: 2,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        height: '100%',
        maxHeight: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
      default: {},
    }),
  },
  mobileScrollContent: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    margin: 0,
    paddingHorizontal: 0,
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: 'transparent',
  },
  mobileColumn: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  masterCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: Platform.OS === 'web' ? '100dvh' : undefined,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientStage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  ambientVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  pageScroll: {
    flex: 1,
    zIndex: 2,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        height: '100%',
        maxHeight: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
      default: {},
    }),
  },
  pageContent: {
    alignItems: 'center',
    paddingBottom: 72,
    backgroundColor: 'transparent',
  },
  mobileEyebrow: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  mobileHeadline: {
    color: CHARCOAL,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 12,
  },
  mobileSubtitle: {
    color: SAGE_TEXT,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 22,
  },
  mobilePreviewCard: {
    marginTop: 18,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  mobilePreviewNotch: {
    width: 84,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(28, 31, 26, 0.35)',
    marginBottom: 18,
  },
  mobilePreviewTitle: {
    color: CHARCOAL,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  mobilePreviewBody: {
    color: SAGE_TEXT,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  mobilePreviewChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mobilePreviewChip: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: 'rgba(154, 117, 213, 0.16)',
  },
  mobilePreviewChipText: {
    color: PURPLE_DEEP,
    fontSize: 12,
    fontWeight: '600',
  },
  mobileInstallHintCard: {
    marginTop: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  mobileInstallHintTitle: {
    color: CHARCOAL,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  mobileInstallHintBody: {
    color: SAGE_TEXT,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  mobileInstallCta: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 18,
  },
  mobileInstallCtaGradient: {
    width: '100%',
    minWidth: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  mobileLegal: {
    marginTop: 20,
    color: SAGE_TEXT,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.85,
  },
  section: {
    width: '100%',
    maxWidth: CONTENT_MAX,
    paddingHorizontal: 40,
    marginTop: 28,
  },
  heroSection: {
    marginTop: 20,
    minHeight: Platform.OS === 'web' ? '92vh' : 720,
    justifyContent: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  copyColumn: {
    width: '46%',
    maxWidth: 520,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: 24,
  },
  eyebrow: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    marginBottom: 16,
    ...SANS,
  },
  headline: {
    color: CHARCOAL,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 54,
    marginBottom: 18,
  },
  headlineCompact: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: SAGE_TEXT,
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.12,
    marginBottom: 26,
    maxWidth: 440,
  },
  subtitleCompact: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  frostedFormCard: {
    width: '100%',
    maxWidth: 440,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  frostedFormCardMobile: {
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  tierToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 252, 248, 0.45)',
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(154, 117, 213, 0.18)',
  },
  tierTab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierTabActive: {
    backgroundColor: 'rgba(154, 117, 213, 0.22)',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(154, 117, 213, 0.18)' },
      default: {},
    }),
  },
  tierTabActiveFounding: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(184, 148, 60, 0.2)' },
      default: {},
    }),
  },
  tierTabText: {
    color: SAGE_TEXT,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  tierTabTextActive: {
    color: PURPLE_DEEP,
    fontWeight: '700',
  },
  tierTabTextActiveFounding: {
    color: '#8a6a1a',
    fontWeight: '700',
  },
  waitlistDescription: {
    color: SAGE_TEXT,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  billingToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  billingOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(154, 117, 213, 0.24)',
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 252, 248, 0.45)',
  },
  billingOptionActive: {
    borderColor: 'rgba(138, 106, 26, 0.52)',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  billingOptionText: {
    color: SAGE_TEXT,
    fontSize: 12,
    fontWeight: '600',
  },
  billingOptionTextActive: {
    color: '#8a6a1a',
    fontWeight: '700',
  },
  waitlistInput: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: CHARCOAL,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(154, 117, 213, 0.28)',
    backgroundColor: 'rgba(255, 252, 248, 0.72)',
    ...Platform.select({
      web: { outlineStyle: 'none', backdropFilter: 'blur(8px)' },
      default: {},
    }),
  },
  waitlistBtn: {
    alignSelf: 'stretch',
  },
  giftButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  giftButtonText: {
    color: PURPLE_DEEP,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  successBlock: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  successTitle: {
    color: CHARCOAL,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 10,
  },
  successBody: {
    color: SAGE_TEXT,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  successAgain: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  successAgainText: {
    color: PURPLE,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  ctaOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          '0 14px 36px rgba(154, 117, 213, 0.42), 0 4px 12px rgba(61, 68, 58, 0.10)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: PURPLE,
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      },
    }),
  },
  ctaGlow: {
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 0 1px rgba(196, 168, 239, 0.45), 0 16px 44px rgba(154, 117, 213, 0.5), 0 4px 14px rgba(61, 68, 58, 0.08)',
      },
      default: {},
    }),
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  ctaGradient: {
    paddingVertical: 15,
    paddingHorizontal: 28,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#FFFcf8',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    ...SANS,
  },
  installHint: {
    marginTop: 12,
    color: SAGE_TEXT,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 380,
  },
  phoneColumn: {
    width: '54%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: DESKTOP_PHONE.height * 0.65,
  },
  phoneFloatWrap: {
    width: DESKTOP_PHONE.width,
    height: DESKTOP_PHONE.height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneMockupBorder: {
    width: DESKTOP_PHONE.width,
    height: DESKTOP_PHONE.height,
    borderRadius: DESKTOP_PHONE.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: DESKTOP_PHONE.bezel,
    borderColor: DESKTOP_PHONE.bezelColor,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        boxShadow:
          '0 36px 80px rgba(28, 31, 26, 0.32), 0 12px 28px rgba(28, 31, 26, 0.16)',
      },
      default: {
        shadowColor: '#1C1F1A',
        shadowOffset: { width: 0, height: 26 },
        shadowOpacity: 0.26,
        shadowRadius: 42,
        elevation: 22,
      },
    }),
  },
  phoneScreen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
    borderRadius: DESKTOP_PHONE.borderRadius - DESKTOP_PHONE.bezel,
  },
  iphoneNotch: {
    position: 'absolute',
    top: 11,
    left: '50%',
    marginLeft: -48,
    width: 96,
    height: 26,
    backgroundColor: DESKTOP_PHONE.bezelColor,
    borderRadius: 16,
    zIndex: 40,
  },
  frostCard: {
    borderRadius: 32,
    ...frostSurface,
    ...creamShadow,
  },
  sectionEyebrow: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: CHARCOAL,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  featureCard: {
    flex: 1,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'flex-start',
    marginHorizontal: 8,
  },
  featureIconOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(154, 117, 213, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureTitle: {
    color: CHARCOAL,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 10,
  },
  featureBody: {
    color: SAGE_TEXT,
    fontSize: 15,
    lineHeight: 23,
  },
  midnightCard: {
    paddingVertical: 44,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  midnightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  midnightEmoji: {
    fontSize: 28,
    marginHorizontal: 8,
  },
  midnightTitle: {
    color: CHARCOAL,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: 16,
  },
  midnightBody: {
    color: SAGE_TEXT,
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 720,
  },
  finalSection: {
    marginTop: 40,
    marginBottom: 24,
  },
  finalCard: {
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  finalLine: {
    color: CHARCOAL,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 38,
    textAlign: 'center',
  },
  finalLineSoft: {
    color: SAGE_TEXT,
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  finalCta: {
    alignSelf: 'center',
  },
  legalLine: {
    marginTop: 18,
    color: SAGE_TEXT,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.85,
  },
  legalLink: {
    color: PURPLE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
