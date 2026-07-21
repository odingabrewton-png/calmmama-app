import { prefetchBundledAsset } from './resolveBundledAsset';

export const ORACLE_BACKGROUND_SOURCE = require('./assets/baby_oracle_bg.png');

let preloaded = false;

export function preloadOracleBackground() {
  if (preloaded) return;
  preloaded = true;
  prefetchBundledAsset(ORACLE_BACKGROUND_SOURCE);
}
