/**
 * Native-safe reload helper for Expo/Metro HMR.
 *
 * IMPORTANT: Do NOT invent a stub `location` object on native.
 * Expo's buildUrlForBundle.native.ts treats `typeof location !== 'undefined'`
 * as meaning `location.origin` exists — a stub without origin crashes
 * lazy imports with: Cannot read property 'replace' of undefined.
 *
 * We only attach `reload` onto an already-real location, and otherwise let
 * Expo's patched hmr.ts fall through to DevSettings.reload().
 */
import { DevSettings, Platform } from 'react-native';

function safeDevReload() {
  try {
    if (typeof DevSettings?.reload === 'function') {
      DevSettings.reload();
      return;
    }
  } catch (err) {
    console.warn('[CalmMama] DevSettings.reload() failed', err);
  }
  console.warn('[CalmMama] Reload requested but unavailable on this runtime');
}

function patchExistingLocationReload(target) {
  if (!target || typeof target !== 'object') return;
  const loc = target.location;
  if (!loc || typeof loc !== 'object') return;
  // Only patch when origin is present — i.e. a real (or complete) Location.
  if (!loc.origin && typeof loc.href !== 'string') return;
  if (typeof loc.reload === 'function') return;

  try {
    loc.reload = safeDevReload;
  } catch (err) {
    console.warn('[CalmMama] Could not patch location.reload', err);
  }
}

export function installNativeReloadPolyfill() {
  if (Platform.OS === 'web') return;

  const root = typeof globalThis !== 'undefined' ? globalThis : global;

  // If a previous bad stub location was installed (no origin), remove it so
  // Expo's native bundle URL builder can fall back to getDevServer().
  const scrubBadStub = (target) => {
    if (!target || typeof target !== 'object') return;
    const loc = target.location;
    if (!loc || typeof loc !== 'object') return;
    if (loc.origin || typeof loc.href === 'string') return;
    try {
      delete target.location;
    } catch {
      try {
        target.location = undefined;
      } catch {
        // ignore frozen globals
      }
    }
  };

  scrubBadStub(root);
  if (root.window) scrubBadStub(root.window);

  patchExistingLocationReload(root);
  if (root.window) patchExistingLocationReload(root.window);
}

installNativeReloadPolyfill();
