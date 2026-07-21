import { Platform } from 'react-native';
import { warmOracleAmbientAudio } from './useOracleAmbientSound';
import { prefetchBundledAsset } from './resolveBundledAsset';

const CLOUD_IMAGE = require('./assets/soul-cloud-lavender.png');

let screenPreload = null;

/** Kick off JS chunk + cloud asset before the mama taps the ritual card. */
export function warmPregnancyOracle() {
  if (Platform.OS !== 'web') {
    try {
      warmOracleAmbientAudio();
    } catch (_) {
      /* ambient audio optional */
    }
    prefetchBundledAsset(CLOUD_IMAGE);
  }

  if (!screenPreload) {
    screenPreload = import('./screens/TwoAMPregnancyOracleScreen').catch((error) => {
      screenPreload = null;
      if (__DEV__ && typeof console !== 'undefined') {
        console.warn('[CalmMama] pregnancy oracle preload failed', error);
      }
      return null;
    });
  }
  return screenPreload;
}
