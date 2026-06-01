import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const MOBILE_WEB_MAX_WIDTH = 768;

/** Locks html/body/#root to dynamic viewport height on mobile browsers. */
export function injectMobileWebViewport() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('calmmama-mobile-viewport')) return;

  const style = document.createElement('style');
  style.id = 'calmmama-mobile-viewport';
  style.textContent = `
    html, body, #root {
      min-height: 100dvh;
      height: 100dvh;
    }
    @supports not (height: 100dvh) {
      html, body, #root {
        min-height: 100vh;
        height: 100vh;
      }
    }
  `;
  document.head.appendChild(style);
}

export function useMobileWebLayout() {
  const [isMobileWeb, setIsMobileWeb] = useState(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
    return window.innerWidth <= MOBILE_WEB_MAX_WIDTH;
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const onResize = () => {
      setIsMobileWeb(window.innerWidth <= MOBILE_WEB_MAX_WIDTH);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobileWeb;
}

export function getWebWrapperStyle() {
  if (Platform.OS !== 'web') return null;
  return {
    minHeight: '100dvh',
    height: '100dvh',
    width: '100vw',
  };
}

export function getIphoneFrameStyle(isMobileWeb) {
  if (Platform.OS !== 'web') return null;

  if (isMobileWeb) {
    return {
      width: '100%',
      maxWidth: '100%',
      height: '100dvh',
      minHeight: '100dvh',
      maxHeight: '100dvh',
      borderRadius: 0,
      borderWidth: 0,
    };
  }

  return {
    height: '92dvh',
    minHeight: '92dvh',
  };
}

export function getBottomNavStyle(isMobileWeb) {
  if (Platform.OS !== 'web') return null;

  return {
    position: isMobileWeb ? 'fixed' : 'absolute',
    zIndex: 9999,
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
  };
}

export function getShellFooterLinksStyle(isMobileWeb) {
  if (Platform.OS !== 'web' || !isMobileWeb) return null;

  return {
    position: 'fixed',
    bottom: 'calc(56px + env(safe-area-inset-bottom, 16px))',
    zIndex: 9998,
  };
}
