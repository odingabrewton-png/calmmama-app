const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** Standard Expo Metro config + web shim for Image.resolveAssetSource. */
const config = getDefaultConfig(__dirname);

const resolveAssetSourceShim = path.resolve(__dirname, 'shims/resolveAssetSource.web.js');
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'react-native/Libraries/Image/resolveAssetSource' ||
      moduleName.endsWith('/Libraries/Image/resolveAssetSource') ||
      moduleName.endsWith('/Libraries/Image/resolveAssetSource.js'))
  ) {
    return {
      filePath: resolveAssetSourceShim,
      type: 'sourceFile',
    };
  }

  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
