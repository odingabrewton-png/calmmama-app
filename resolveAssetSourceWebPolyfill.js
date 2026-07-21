/**
 * Expo web does not attach Image.resolveAssetSource (native-only).
 * Several warm/preload paths and libraries still call it and crash with:
 *   "resolveAssetSource is not a function"
 * Install this BEFORE App boots.
 */
import { Image, Platform } from 'react-native';

function resolveAssetSourceWeb(source) {
  if (source == null || typeof source === 'object') {
    return source;
  }

  try {
    const { getAssetByID } = require('@react-native/assets-registry/registry');
    const asset = getAssetByID(source);
    if (!asset) return null;

    const type = !asset.type ? '' : `.${asset.type}`;
    const assetPath = __DEV__
      ? `${asset.httpServerLocation}/${asset.name}${type}`
      : `${String(asset.httpServerLocation || '').replace(/\.\.\//g, '_')}/${asset.name}${type}`;

    try {
      const base =
        typeof globalThis.location?.href === 'string'
          ? globalThis.location.href
          : 'https://expo.dev';
      const fromUrl = new URL(assetPath, base);
      return {
        uri: fromUrl.toString().replace(fromUrl.origin, '') || assetPath,
        width: asset.width,
        height: asset.height,
        scale: Array.isArray(asset.scales) ? asset.scales[asset.scales.length - 1] : 1,
      };
    } catch (_) {
      return {
        uri: assetPath,
        width: asset.width,
        height: asset.height,
        scale: 1,
      };
    }
  } catch (_) {
    return null;
  }
}

export function installResolveAssetSourceWebPolyfill() {
  if (Platform.OS !== 'web') return;

  const attach = (target) => {
    if (!target || typeof target !== 'object' && typeof target !== 'function') return;
    if (typeof target.resolveAssetSource === 'function') return;
    try {
      target.resolveAssetSource = resolveAssetSourceWeb;
    } catch (_) {
      /* non-writable */
    }
  };

  attach(Image);
  // Some interop paths expose the component as Image.default
  if (Image && Image.default) {
    attach(Image.default);
  }

  // Patch deep RN import used by expo-video's non-web resolveAssetSource fallback
  try {
    const deep = require('react-native/Libraries/Image/resolveAssetSource');
    if (deep && typeof deep.default !== 'function') {
      deep.default = resolveAssetSourceWeb;
    } else if (deep && typeof deep !== 'function' && typeof deep.default === 'undefined') {
      // module shape { __esModule, default: undefined }
      Object.defineProperty(deep, 'default', {
        configurable: true,
        writable: true,
        value: resolveAssetSourceWeb,
      });
    }
  } catch (_) {
    /* deep path unavailable — Image patch is enough for app code */
  }
}

installResolveAssetSourceWebPolyfill();
