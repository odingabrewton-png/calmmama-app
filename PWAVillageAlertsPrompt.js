/**
 * Gentle PWA banner:
 * - Safari (not installed): tip to Share → Add to Home Screen
 * - Standalone PWA: Enable Village Notifications for Web Push readiness
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CALM_MAMA_PASTEL } from './calmMamaPastelPalette';
import {
  enableVillageWebPush,
  isIosSafariBrowser,
  isPwaStandaloneMode,
  notificationPermissionState,
  registerVillageServiceWorker,
  resyncVillageWebPushSubscription,
} from './pwaWebPush';

const DISMISS_INSTALL_KEY = 'calmmama.pwa.installTip.dismissed';
const DISMISS_PUSH_KEY = 'calmmama.pwa.pushBanner.dismissed';

function canUseDom() {
  return typeof window !== 'undefined';
}

function readDismissed(key) {
  if (!canUseDom()) return false;
  try {
    return window.sessionStorage?.getItem(key) === '1';
  } catch (_) {
    return false;
  }
}

function writeDismissed(key) {
  if (!canUseDom()) return;
  try {
    window.sessionStorage?.setItem(key, '1');
  } catch (_) {
    /* ignore */
  }
}

function PWAVillageAlertsPrompt() {
  const [mode, setMode] = useState(null); // 'install' | 'push' | 'done' | null
  const [busy, setBusy] = useState(false);
  const [statusLine, setStatusLine] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web' || !canUseDom()) return undefined;

    registerVillageServiceWorker().catch(() => {});

    const standalone = isPwaStandaloneMode();
    const iosFamily = isIosSafariBrowser();
    const permission = notificationPermissionState();
    const pushCapable =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;

    if (!standalone && iosFamily && !readDismissed(DISMISS_INSTALL_KEY)) {
      setMode('install');
      return undefined;
    }

    // Already granted — quietly re-sync subscription so daytime pushes keep working.
    if (permission === 'granted' && pushCapable) {
      resyncVillageWebPushSubscription().catch(() => {});
      if (standalone || !iosFamily) {
        setMode(null);
      }
      return undefined;
    }

    if (
      permission !== 'granted' &&
      !readDismissed(DISMISS_PUSH_KEY) &&
      (standalone || (pushCapable && !iosFamily))
    ) {
      setMode('push');
      return undefined;
    }

    return undefined;
  }, []);

  const dismiss = useCallback(() => {
    if (mode === 'install') writeDismissed(DISMISS_INSTALL_KEY);
    if (mode === 'push') writeDismissed(DISMISS_PUSH_KEY);
    setMode(null);
  }, [mode]);

  const handleEnableNotifications = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStatusLine('');
    try {
      const result = await enableVillageWebPush();
      if (result.ok && result.permission === 'granted') {
        setStatusLine(
          result.subscribed
            ? 'Village alerts enabled — daytime reminders can reach you now. 🔔'
            : 'Notifications enabled on this device. Keep the Village open for soft daytime nudges. 🔔',
        );
        setMode('done');
        writeDismissed(DISMISS_PUSH_KEY);
        setTimeout(() => setMode(null), 3200);
      } else if (result.reason === 'denied') {
        setStatusLine('Notifications were blocked — enable them in Settings anytime.');
      } else {
        setStatusLine('Could not enable alerts yet — try again from your Home Screen app.');
      }
    } finally {
      setBusy(false);
    }
  }, [busy]);

  if (Platform.OS !== 'web') return null;
  if (!mode) return null;

  if (mode === 'install') {
    return (
      <View style={styles.host} pointerEvents="box-none">
        <View style={styles.banner}>
          <Text style={styles.eyebrow}>UNLOCK VILLAGE ALERTS</Text>
          <Text style={styles.copy}>
            Tap the Share button ↗️ and select &apos;Add to Home Screen&apos; to unlock full village
            alerts &amp; rewards!
          </Text>
          <View style={styles.row}>
            <Pressable onPress={dismiss} style={styles.ghostBtn} accessibilityRole="button">
              <Text style={styles.ghostBtnText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (mode === 'push' || mode === 'done') {
    return (
      <View style={styles.host} pointerEvents="box-none">
        <View style={styles.banner}>
          <Text style={styles.eyebrow}>CALM MAMA ON YOUR HOME SCREEN</Text>
          <Text style={styles.copy}>
            {mode === 'done'
              ? statusLine || 'You are set — soft village alerts can reach you now.'
              : 'Enable Village Notifications so kitchen, bloom, and lounge reminders can find you.'}
          </Text>
          {mode === 'push' ? (
            <View style={styles.row}>
              <Pressable
                onPress={handleEnableNotifications}
                style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Enable Village Notifications"
                disabled={busy}
              >
                <Text style={styles.primaryBtnText}>
                  {busy ? 'Enabling…' : 'Enable Village Notifications 🔔'}
                </Text>
              </Pressable>
              <Pressable onPress={dismiss} style={styles.ghostBtn} accessibilityRole="button">
                <Text style={styles.ghostBtnText}>Not now</Text>
              </Pressable>
            </View>
          ) : null}
          {statusLine && mode === 'push' ? (
            <Text style={styles.status}>{statusLine}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  return null;
}

export default memo(PWAVillageAlertsPrompt);

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.select({ web: 88, default: 96 }),
    zIndex: 120,
    elevation: 120,
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 232, 0.55)',
    backgroundColor: 'rgba(255, 249, 244, 0.96)',
    ...Platform.select({
      web: {
        boxShadow: '0 14px 36px rgba(61, 68, 58, 0.16)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
      default: {
        shadowColor: '#3d443a',
        shadowOpacity: 0.14,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      },
    }),
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: CALM_MAMA_PASTEL.lavender,
    textAlign: 'center',
    marginBottom: 6,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3d443a',
    textAlign: 'center',
    fontWeight: '600',
  },
  row: {
    marginTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: CALM_MAMA_PASTEL.sage,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#2F3A32',
    fontWeight: '800',
    fontSize: 14,
  },
  ghostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  ghostBtnText: {
    color: 'rgba(61, 68, 58, 0.55)',
    fontWeight: '600',
    fontSize: 13,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(61, 68, 58, 0.7)',
    textAlign: 'center',
  },
});
