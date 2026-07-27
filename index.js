import './nativeReloadPolyfill';
import './resolveAssetSourceWebPolyfill';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { logNativeError } from './nativeRuntimeGuard';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const reportUnhandled = (reason) => {
    logNativeError('unhandledrejection', reason);
  };
  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('unhandledrejection', (event) => {
      reportUnhandled(event?.reason);
    });
  }
}

enableScreens(false);
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { requireOptionalNativeModule } from 'expo';

import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { injectMobileWebViewport } from './mobileWebLayout';

// Paint edge-to-edge ombre before React mounts (kills flat sage letterbox bars)
if (Platform.OS === 'web') {
  injectMobileWebViewport();
}

function installWebFatalErrorReporter() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const isNoisyBrowserNoise = (message) => {
    const text = String(message || '');
    return (
      text.includes('ResizeObserver loop') ||
      text.includes('Script error.') ||
      text.includes('Loading CSS chunk') ||
      text.includes('Non-Error promise rejection')
    );
  };

  const mountOverlay = (error, details) => {
    const root = document.getElementById('root');
    if (!root || root.dataset.villageFatalError === '1') return;

    const message = error?.message || String(error || 'Unknown error');
    if (isNoisyBrowserNoise(message)) {
      if (typeof console !== 'undefined') {
        console.warn('[CalmMama Village] ignored non-fatal web noise:', message);
      }
      return;
    }

    // Keep React alive for recoverable issues — only hard-swap if the tree is gone.
    const hasLiveTree = root.childNodes && root.childNodes.length > 0;
    if (hasLiveTree) {
      if (typeof console !== 'undefined') {
        console.error('[CalmMama Village] runtime error (React still mounted):', message, details || error?.stack);
      }
      return;
    }

    const stack = error?.stack || details || '';
    root.dataset.villageFatalError = '1';

    root.innerHTML = `
      <div style="min-height:100vh;padding:24px;background:#BAC6BC;color:#2A382E;font-family:Georgia,serif;">
        <p style="font-size:10px;font-weight:800;letter-spacing:1px;color:#6B5588;margin:0 0 8px;">CALMMAMA VILLAGE · RUNTIME ERROR</p>
        <h1 style="font-size:20px;margin:0 0 10px;">The village hit an unexpected snag</h1>
        <p style="font-size:12px;line-height:18px;margin:0 0 16px;">This fallback appears for errors outside React render (effects, async handlers). Screenshot for debugging.</p>
        <pre style="white-space:pre-wrap;background:rgba(255,252,248,0.9);padding:14px;border-radius:12px;font-size:12px;color:#A35338;">${message}</pre>
        ${stack ? `<pre style="white-space:pre-wrap;background:rgba(255,252,248,0.9);padding:14px;border-radius:12px;font-size:10px;margin-top:12px;color:#3D5246;">${stack}</pre>` : ''}
        <button type="button" onclick="window.location.reload()" style="margin-top:16px;background:#5C7A68;color:#fff;border:none;border-radius:12px;padding:12px 18px;font-weight:800;cursor:pointer;">Reload village</button>
      </div>
    `;
  };

  window.addEventListener('error', (event) => {
    const message = event.error?.message || event.message || '';
    if (String(message).includes('resolveAssetSource is not a function')) {
      event.preventDefault?.();
      if (typeof console !== 'undefined') {
        console.warn('[CalmMama Village] suppressed resolveAssetSource web miss');
      }
      return;
    }
    mountOverlay(event.error || { message: event.message }, event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason || '');
    if (String(message).includes('resolveAssetSource is not a function')) {
      event.preventDefault?.();
      if (typeof console !== 'undefined') {
        console.warn('[CalmMama Village] suppressed resolveAssetSource rejection');
      }
      return;
    }
    mountOverlay(event.reason, event.reason?.stack);
  });
}

installWebFatalErrorReporter();

function registerWebServiceWorker() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  const run = () => {
    import('./pwaWebPush')
      .then((mod) => mod.registerVillageServiceWorker?.())
      .catch(() => {});
  };
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 1200);
  }
}

registerWebServiceWorker();

function Root() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences');
        if (DevMenuPreferences && typeof DevMenuPreferences.setPreferencesAsync === 'function') {
          DevMenuPreferences.setPreferencesAsync({
            showFloatingActionButton: false,
            showsAtLaunch: false
          }).catch((err) => console.log("DevMenu preferences suppressed safely:", err));
        }
      } catch (e) {
        console.log("DevMenu module not ready yet:", e);
      }
    }, 500); // 500ms safety window

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider style={styles.root}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // Transparent so VillageOmbreBackdrop (and html pastel wash) show through edges
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

registerRootComponent(Root);
