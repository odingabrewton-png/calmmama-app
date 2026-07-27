/**
 * Web PWA helpers — service worker registration + Web Push subscription (iOS 16.4+ standalone).
 */

const SW_PATH = '/sw.js';
const SW_CACHE_BUST = 'v3';
const SUBSCRIPTION_STORAGE_KEY = 'calmmama.webPush.subscription';
const PERMISSION_STORAGE_KEY = 'calmmama.webPush.permission';

function canUseDom() {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

export function isWebPlatform() {
  return canUseDom();
}

export function isPwaStandaloneMode() {
  if (!canUseDom()) return false;
  try {
    if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
    if (window.navigator?.standalone === true) return true;
  } catch (_) {
    /* ignore */
  }
  return false;
}

export function isIosSafariBrowser() {
  if (!canUseDom()) return false;
  const ua = String(window.navigator?.userAgent || '');
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (window.navigator?.platform === 'MacIntel' && (window.navigator?.maxTouchPoints || 0) > 1);
  if (!iOS) return false;
  // Chrome/Firefox on iOS still use WebKit; treat as Safari-family for A2HS tips.
  return true;
}

export function notificationPermissionState() {
  if (!canUseDom() || typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export async function registerVillageServiceWorker() {
  if (!canUseDom()) return null;
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register(`${SW_PATH}?v=${SW_CACHE_BUST}`, {
      scope: '/',
      updateViaCache: 'none',
    });

    // Pull newer SW immediately after each page load / deploy.
    try {
      registration.update();
    } catch (_) {
      /* ignore */
    }

    // When a new worker takes control, reload once so the hashed bundle swaps in.
    if (!window.__calmmamaSwReloadBound) {
      window.__calmmamaSwReloadBound = true;
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    return registration;
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[CalmMama PWA] Service worker registration failed:', err);
    }
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function readStoredSubscription() {
  if (!canUseDom()) return null;
  try {
    const raw = window.localStorage?.getItem(SUBSCRIPTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function storeSubscription(subscriptionJson) {
  if (!canUseDom()) return;
  try {
    if (subscriptionJson) {
      window.localStorage?.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionJson));
    }
    window.localStorage?.setItem(PERMISSION_STORAGE_KEY, Notification.permission);
  } catch (_) {
    /* ignore */
  }
}

async function postSubscriptionToServer(subscriptionJson) {
  const endpoint = String(process.env.EXPO_PUBLIC_PUSH_SUBSCRIBE_URL || '').trim();
  if (!endpoint || !subscriptionJson) return { ok: false, reason: 'no-endpoint' };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscriptionJson,
        platform: 'web',
        standalone: isPwaStandaloneMode(),
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (_) {
    return { ok: false, reason: 'network' };
  }
}

/**
 * Request notification permission and (when VAPID is configured) create a push subscription.
 */
export async function enableVillageWebPush() {
  if (!canUseDom()) {
    return { ok: false, reason: 'no-dom' };
  }
  if (typeof Notification === 'undefined') {
    return { ok: false, reason: 'unsupported' };
  }

  const registration = await registerVillageServiceWorker();
  if (!registration) {
    return { ok: false, reason: 'no-sw' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    storeSubscription(null);
    return { ok: false, reason: 'denied', permission };
  }

  // Immediate local confirmation so mama sees alerts work even before remote push keys exist.
  try {
    await registration.showNotification('Calm Mama Village', {
      body: 'Village alerts are on — soft reminders can reach you here. 🔔',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'calmmama-web-push-enabled',
      data: { url: '/' },
    });
  } catch (_) {
    /* some browsers require user gesture + granted only */
  }

  const vapidKey = String(process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || '').trim();
  if (!vapidKey || !registration.pushManager) {
    storeSubscription(null);
    return {
      ok: true,
      permission: 'granted',
      subscribed: false,
      reason: vapidKey ? 'no-push-manager' : 'missing-vapid',
    };
  }

  try {
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }));

    const json = subscription?.toJSON?.() || subscription;
    storeSubscription(json);
    await postSubscriptionToServer(json);
    return { ok: true, permission: 'granted', subscribed: true, subscription: json };
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[CalmMama PWA] Push subscribe failed:', err);
    }
    return { ok: true, permission: 'granted', subscribed: false, reason: 'subscribe-failed' };
  }
}

/**
 * Show a local notification in the PWA / mobile browser when OS moment banners are unavailable.
 */
export async function presentVillageWebNotification({
  title = 'Calm Mama Village',
  body = '',
  route = '/',
  tag = 'calmmama-village-moment',
} = {}) {
  if (!canUseDom() || typeof Notification === 'undefined') {
    return { ok: false, reason: 'unsupported' };
  }
  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  const message = String(body || '').trim();
  if (!message) return { ok: false, reason: 'empty' };

  const url =
    route === 'nursery'
      ? '/?village=nursery'
      : route === 'kitchen'
        ? '/?village=kitchen'
        : route === 'tracker'
          ? '/?village=tracker'
          : route === 'midnight_lounge'
            ? '/?village=lounge'
            : route?.startsWith?.('/')
              ? route
              : '/';

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        body: message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag,
        renotify: true,
        data: { url },
      });
      return { ok: true, via: 'sw' };
    }
    // eslint-disable-next-line no-new
    new Notification(title, { body: message, icon: '/logo192.png' });
    return { ok: true, via: 'notification-api' };
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[CalmMama PWA] Web moment notification failed:', err);
    }
    return { ok: false, reason: 'show-failed' };
  }
}

export function getStoredWebPushSubscription() {
  return readStoredSubscription();
}
