import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import CalmmamaDevMenu from 'calmmama-dev-menu';

let hideTimer = null;
let appStateSub = null;

function getDevMenuPreferencesModule() {
  return requireOptionalNativeModule('DevMenuPreferences');
}

async function hideViaCalmmamaModule() {
  if (!CalmmamaDevMenu?.setToolsFabVisible) return false;
  try {
    return (await CalmmamaDevMenu.setToolsFabVisible(false)) === true;
  } catch {
    return false;
  }
}

async function showViaCalmmamaModule() {
  if (!CalmmamaDevMenu?.setToolsFabVisible) return false;
  try {
    return (await CalmmamaDevMenu.setToolsFabVisible(true)) === true;
  } catch {
    return false;
  }
}

async function hideViaExpoPreferences() {
  const DevMenuPreferences = getDevMenuPreferencesModule();
  if (!DevMenuPreferences?.setPreferencesAsync) return false;
  try {
    await DevMenuPreferences.setPreferencesAsync({
      showFloatingActionButton: false,
    });
    return true;
  } catch {
    return false;
  }
}

async function showViaExpoPreferences() {
  const DevMenuPreferences = getDevMenuPreferencesModule();
  if (!DevMenuPreferences?.setPreferencesAsync) return false;
  try {
    await DevMenuPreferences.setPreferencesAsync({
      showFloatingActionButton: true,
    });
    return true;
  } catch {
    return false;
  }
}

export function isDevToolsFabControlAvailable() {
  if (Platform.OS === 'web') return false;
  if (CalmmamaDevMenu?.isToolsFabControlAvailable?.()) return true;
  if (getDevMenuPreferencesModule()?.setPreferencesAsync) return true;
  return false;
}

/** Hide the blue Expo dev-client Tools FAB (gear icon, top corner). */
export async function hideDevToolsCircle() {
  if (Platform.OS === 'web') return true;
  if (await hideViaCalmmamaModule()) return true;
  return hideViaExpoPreferences();
}

export async function hideDevToolsCircleWithRetry(maxAttempts = 20, intervalMs = 250) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (await hideDevToolsCircle()) {
      return true;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, intervalMs);
    });
  }
  return false;
}

export async function showDevToolsCircle() {
  if (Platform.OS === 'web') return;
  if (await showViaCalmmamaModule()) return;
  await showViaExpoPreferences();
}

/** Keep trying until a native hook is ready. */
export function startHidingDevToolsCircleForScreenshots() {
  let attempts = 0;
  const maxAttempts = 80;

  const tick = () => {
    attempts += 1;
    hideDevToolsCircle().then((hidden) => {
      if (hidden && hideTimer) {
        clearInterval(hideTimer);
        hideTimer = null;
      } else if (attempts >= maxAttempts && hideTimer) {
        clearInterval(hideTimer);
        hideTimer = null;
      }
    });
  };

  tick();
  if (hideTimer) clearInterval(hideTimer);
  hideTimer = setInterval(tick, 250);

  if (appStateSub) appStateSub.remove();
  appStateSub = AppState.addEventListener('change', (state) => {
    if (state === 'active') tick();
  });

  return () => {
    if (hideTimer) {
      clearInterval(hideTimer);
      hideTimer = null;
    }
    appStateSub?.remove();
    appStateSub = null;
  };
}
