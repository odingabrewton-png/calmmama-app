import { Platform } from 'react-native';

/** Google Fonts bundle — injected on web when Cloud Nursery mounts */
export const NURSERY_FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,700&family=Pacifico&display=swap';

let nurseryFontsInjected = false;

export function injectNurseryWebFonts() {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || nurseryFontsInjected) {
    return;
  }
  if (document.getElementById('calmmama-nursery-fonts')) {
    nurseryFontsInjected = true;
    return;
  }
  const link = document.createElement('link');
  link.id = 'calmmama-nursery-fonts';
  link.rel = 'stylesheet';
  link.href = NURSERY_FONT_STYLESHEET;
  document.head.appendChild(link);
  nurseryFontsInjected = true;
}

const fraunces = Platform.select({
  web: { fontFamily: 'Fraunces, Georgia, "Palatino Linotype", serif' },
  ios: { fontFamily: 'Georgia' },
  android: { fontFamily: 'serif' },
  default: { fontFamily: 'Georgia' },
});

const pacifico = Platform.select({
  web: { fontFamily: 'Pacifico, "Segoe Script", "Brush Script MT", cursive' },
  ios: { fontFamily: 'Snell Roundhand' },
  android: { fontFamily: 'cursive' },
  default: { fontFamily: 'cursive' },
});

const comfortaa = Platform.select({
  web: { fontFamily: 'Comfortaa, "Trebuchet MS", sans-serif' },
  ios: { fontFamily: 'Avenir Next' },
  android: { fontFamily: 'sans-serif' },
  default: { fontFamily: 'sans-serif' },
});

/** Main tracker title — soft 70s display serif */
export const retroPageTitle = {
  ...fraunces,
  fontStyle: 'italic',
  fontWeight: '700',
};

/** Subtitle & segment toggle */
export const retroSoft = {
  ...comfortaa,
  fontWeight: '600',
};

/** Hub card titles — playful script */
export const retroHubTitle = {
  ...pacifico,
  fontWeight: '400',
};

/** Timeline & accent labels */
export const retroAccent = {
  ...fraunces,
  fontStyle: 'italic',
  fontWeight: '600',
};
