const { getDefaultConfig } = require('expo/metro-config');

/** Standard Expo Metro config — no custom Hermes/web engine overrides. */
module.exports = getDefaultConfig(__dirname);
