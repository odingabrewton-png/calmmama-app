import { Image, Platform } from 'react-native';

/**
 * Resolve a Metro `require()` asset to `{ uri }` on native + web.
 * `Image.resolveAssetSource` is native-only and crashes on Expo web.
 */
export function resolveBundledAssetSource(asset) {
  if (asset == null) return null;

  if (typeof asset === 'string') {
    return { uri: asset };
  }

  if (typeof asset === 'object') {
    if (typeof asset.uri === 'string') return { uri: asset.uri, width: asset.width, height: asset.height };
    if (typeof asset.default === 'string') return { uri: asset.default };
    if (asset.default && typeof asset.default.uri === 'string') {
      return { uri: asset.default.uri, width: asset.default.width, height: asset.default.height };
    }
  }

  try {
    if (typeof Image.resolveAssetSource === 'function') {
      const resolved = Image.resolveAssetSource(asset);
      if (resolved?.uri) return resolved;
    }
  } catch (_) {
    /* fall through */
  }

  if (typeof asset === 'number') {
    try {
      const { getAssetByID } = require('@react-native/assets-registry/registry');
      const meta = getAssetByID(asset);
      if (!meta) return null;

      const type = !meta.type ? '' : `.${meta.type}`;
      const assetPath = __DEV__
        ? `${meta.httpServerLocation}/${meta.name}${type}`
        : `${String(meta.httpServerLocation || '').replace(/\.\.\//g, '_')}/${meta.name}${type}`;

      if (Platform.OS === 'web') {
        try {
          const fromUrl = new URL(assetPath, 'https://expo.dev');
          return { uri: fromUrl.toString().replace(fromUrl.origin, ''), width: meta.width, height: meta.height };
        } catch (_) {
          return { uri: assetPath, width: meta.width, height: meta.height };
        }
      }

      return { uri: assetPath, width: meta.width, height: meta.height };
    } catch (_) {
      return null;
    }
  }

  return null;
}

export function prefetchBundledAsset(asset) {
  const resolved = resolveBundledAssetSource(asset);
  if (!resolved?.uri || typeof Image.prefetch !== 'function') {
    return Promise.resolve();
  }
  return Image.prefetch(resolved.uri).catch(() => {});
}
