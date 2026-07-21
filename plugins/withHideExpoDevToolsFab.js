const { withInfoPlist, AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const FAB_INFO_PLIST_KEY = 'EXDevMenuShowFloatingActionButton';
const FAB_MANIFEST_KEY = 'EXDevMenuShowFloatingActionButton';

/** Disable the Expo dev-client floating Tools button at the native layer. */
function withHideExpoDevToolsFab(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults[FAB_INFO_PLIST_KEY] = false;
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      FAB_MANIFEST_KEY,
      'false'
    );
    return config;
  });

  return config;
}

module.exports = withHideExpoDevToolsFab;
