/**
 * Web-safe shim for react-native/Libraries/Image/resolveAssetSource.
 * Metro aliases the native deep-import here on web so expo-video / expo-asset
 * never call a missing Image.resolveAssetSource.
 */
import { getAssetByID } from '@react-native/assets-registry/registry';

function resolveAssetSource(source) {
  if (source == null || typeof source === 'object') {
    return source;
  }

  const asset = getAssetByID(source);
  if (!asset) {
    return null;
  }

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
}

resolveAssetSource.setCustomSourceTransformer = function setCustomSourceTransformer() {
  /* no-op on web */
};

export default resolveAssetSource;
export { resolveAssetSource };
