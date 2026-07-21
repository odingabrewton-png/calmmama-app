import { Platform } from 'react-native';

/** Mama's Kitchen — soft cookbook serif */
export const KITCHEN_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif', letterSpacing: 0.2 },
  ios: { fontFamily: 'Georgia', letterSpacing: 0.2 },
  default: { fontFamily: 'serif', letterSpacing: 0.2 },
});

/** Village Network — friendly community sans */
export const VILLAGE_COMMUNITY = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, "Avenir Next", sans-serif', fontWeight: '700' },
  ios: { fontFamily: 'System', fontWeight: '700' },
  android: { fontFamily: 'sans-serif-medium', fontWeight: '700' },
  default: { fontWeight: '700' },
});

/** Daily Sanctuary — airy zen minimal */
export const SANCTUARY_ZEN = Platform.select({
  web: { fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: 0.3, lineHeight: 24 },
  ios: { fontFamily: 'System', letterSpacing: 0.3, lineHeight: 24 },
  android: { fontFamily: 'sans-serif', letterSpacing: 0.3, lineHeight: 24 },
  default: { letterSpacing: 0.3, lineHeight: 24 },
});
