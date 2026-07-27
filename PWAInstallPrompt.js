import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CALM_MAMA_PASTEL } from './calmMamaPastelPalette';
import { useDesktopWebLayout } from './mobileWebLayout';

const CREAM = 'rgba(253, 251, 247, 0.65)';
const CHARCOAL = '#3d443a';
const PASTEL_PURPLE = '#9a75d5';
const SAGE_BORDER = 'rgba(156, 184, 156, 0.55)';
const STORAGE_KEY = 'calmmama.pwaInstall.dismissed';

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isPwaStandalone() {
  if (!canUseDom()) return false;
  try {
    if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
    if (window.navigator?.standalone === true) return true;
    if (typeof document.referrer === 'string' && document.referrer.includes('android-app://')) {
      return true;
    }
  } catch (_) {
    /* ignore */
  }
  return false;
}

/** iPhone / iPod Safari (and iOS Chrome UIWebView family) — not iPad desktop mode. */
export function isIosPhoneBrowser() {
  if (!canUseDom()) return false;
  const ua = String(window.navigator?.userAgent || '');
  if (/iPad/i.test(ua)) return false;
  if (/iPhone|iPod/i.test(ua)) return true;
  return false;
}

export function isIosSafariFamily() {
  if (!canUseDom()) return false;
  const ua = String(window.navigator?.userAgent || '');
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (window.navigator?.platform === 'MacIntel' && (window.navigator?.maxTouchPoints || 0) > 1)
  );
}

function readDismissed() {
  if (!canUseDom()) return false;
  try {
    return window.sessionStorage?.getItem(STORAGE_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function writeDismissed() {
  if (!canUseDom()) return;
  try {
    window.sessionStorage?.setItem(STORAGE_KEY, '1');
  } catch (_) {
    /* ignore */
  }
}

/**
 * Mobile-web install framework:
 * - Absolutely positioned iOS Share / Add-to-Home-Screen slide-up sheet
 * - Optional onBindPrimary so the landing page can place a full-width scroll CTA
 * - No floating absolute button (that lives in the marketing ScrollView)
 */
function PWAInstallPrompt({ onBindPrimary, autoOpenIosSheet = true }) {
  const isDesktopWeb = useDesktopWebLayout();
  const [ready, setReady] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const deferredPromptRef = useRef(null);

  const sheetY = useRef(new Animated.Value(28)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  const isiOSPhone = Platform.OS === 'web' && isIosPhoneBrowser();

  const openGuide = useCallback(() => {
    setGuideOpen(true);
    setReady(true);
    sheetY.setValue(40);
    sheetOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [sheetOpacity, sheetY]);

  const dismiss = useCallback(() => {
    writeDismissed();
    Animated.parallel([
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 24,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setGuideOpen(false);
      }
    });
  }, [sheetOpacity, sheetY]);

  const handlePrimary = useCallback(async () => {
    if (isiOSPhone) {
      if (!guideOpen) openGuide();
      return;
    }

    const promptEvent = deferredPromptRef.current;
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        deferredPromptRef.current = null;
        if (choice?.outcome === 'accepted') dismiss();
      } catch (_) {
        openGuide();
      }
      return;
    }

    openGuide();
  }, [dismiss, guideOpen, isiOSPhone, openGuide]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !canUseDom()) return undefined;
    if (isPwaStandalone() || isDesktopWeb) return undefined;

    setReady(true);

    const onBeforeInstall = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS: slide-up Share instruction sheet (distinct from the in-page CTA button)
    if (autoOpenIosSheet && isiOSPhone && !readDismissed()) {
      openGuide();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, [autoOpenIosSheet, isDesktopWeb, isiOSPhone, openGuide]);

  useEffect(() => {
    if (typeof onBindPrimary === 'function') {
      onBindPrimary(handlePrimary);
    }
  }, [handlePrimary, onBindPrimary]);

  useEffect(() => {
    if (!ready || !guideOpen) {
      pulseLoop.current?.stop?.();
      pulse.setValue(1);
      return undefined;
    }

    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.045,
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
    pulseLoop.current.start();
    return () => pulseLoop.current?.stop?.();
  }, [ready, guideOpen, pulse]);

  if (Platform.OS !== 'web') return null;
  if (isDesktopWeb) return null;
  if (isPwaStandalone()) return null;
  if (!guideOpen) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={styles.sheetLayer} pointerEvents="box-none">
        <Pressable style={styles.scrim} onPress={dismiss} accessibilityLabel="Dismiss" />
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetY }],
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.eyebrow}>Calm Mama Village</Text>
          <Text style={styles.title}>Keep your village one tap away</Text>

          <View style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Tap the Share button ↗️ and select &apos;Add to Home Screen&apos; to unlock full
              village alerts &amp; rewards!
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Open the Home Screen app, then tap <Text style={styles.focus}>Enable Village Notifications 🔔</Text>{' '}
              for soft reminders.
            </Text>
          </View>

          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Pressable
              onPress={handlePrimary}
              accessibilityRole="button"
              accessibilityLabel="Add to Home Screen"
              style={({ pressed }) => [styles.pulseBtnOuter, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={[CALM_MAMA_PASTEL.sage, '#B5CDB5', CALM_MAMA_PASTEL.sage]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.pulseBtn}
              >
                <Text style={styles.pulseBtnLabel}>Add to Home Screen</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Pressable onPress={dismiss} style={styles.dismissLink}>
            <Text style={styles.dismissLinkText}>Maybe later</Text>
          </Pressable>

          {isiOSPhone ? (
            <View style={styles.chevronWrap} pointerEvents="none">
              <View style={styles.chevronStem} />
              <View style={styles.chevronTip} />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
}

export default memo(PWAInstallPrompt);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    elevation: 80,
    backgroundColor: 'transparent',
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 31, 26, 0.28)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.select({ web: 28, default: 34 }),
    borderWidth: 1,
    borderColor: SAGE_BORDER,
    ...Platform.select({
      web: {
        backgroundColor: CREAM,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 -12px 40px rgba(61, 68, 58, 0.18)',
      },
      default: {
        backgroundColor: CREAM,
        shadowColor: '#3d443a',
        shadowOpacity: 0.16,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -8 },
        elevation: 16,
      },
    }),
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 68, 58, 0.22)',
    marginBottom: 14,
  },
  eyebrow: {
    color: PASTEL_PURPLE,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: CHARCOAL,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(154, 117, 213, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNum: {
    color: PASTEL_PURPLE,
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    color: CHARCOAL,
    fontSize: 15,
    lineHeight: 22,
  },
  focus: {
    fontWeight: '700',
    color: PASTEL_PURPLE,
  },
  pulseBtnOuter: {
    marginTop: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pulseBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  pulseBtnLabel: {
    color: CHARCOAL,
    fontSize: 15,
    fontWeight: '700',
  },
  dismissLink: {
    alignSelf: 'center',
    marginTop: 14,
    padding: 8,
  },
  dismissLinkText: {
    color: CHARCOAL,
    opacity: 0.55,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  chevronWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  chevronStem: {
    width: 3,
    height: 18,
    backgroundColor: PASTEL_PURPLE,
    borderRadius: 2,
  },
  chevronTip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: PASTEL_PURPLE,
  },
});
