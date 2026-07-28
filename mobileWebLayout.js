import React, { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { CALM_MAMA_PASTEL, CALM_MAMA_PASTEL_CYCLE_MS } from './calmMamaPastelPalette';

/** Viewport wider than this → Shots.so desktop marketing canvas */
export const DESKTOP_BREAKPOINT = 768;

/** Floating device — exact iPhone marketing frame */
export const DESKTOP_PHONE = Object.freeze({
  width: 390,
  height: 844,
  borderRadius: 40,
  bezel: 10,
  bezelColor: '#1C1F1A',
});

/** @deprecated use DESKTOP_BREAKPOINT */
export const MOBILE_WEB_MAX_WIDTH = DESKTOP_BREAKPOINT;

function readWindowSize() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      width: window.innerWidth || Dimensions.get('window').width,
      height: window.innerHeight || Dimensions.get('window').height,
    };
  }
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

/** Subscribe to browser / device size without layout thrash. */
export function useViewportSize() {
  const [size, setSize] = useState(readWindowSize);

  useEffect(() => {
    let timer = null;
    const onChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setSize(readWindowSize()), 120);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', onChange);
      return () => {
        if (timer) clearTimeout(timer);
        window.removeEventListener('resize', onChange);
      };
    }

    const sub = Dimensions.addEventListener('change', onChange);
    return () => {
      if (timer) clearTimeout(timer);
      sub?.remove?.();
    };
  }, []);

  return size;
}

export function useMobileWebLayout() {
  const { width } = useViewportSize();
  return Platform.OS === 'web' && width <= DESKTOP_BREAKPOINT;
}

/** True only on wide desktop / tablet browsers — native + phone web stay full-bleed. */
export function useDesktopWebLayout() {
  const { width } = useViewportSize();
  return Platform.OS === 'web' && width > DESKTOP_BREAKPOINT;
}

/** Scale the 390×844 frame for the desktop landing right column. */
export function useDesktopPhoneScale() {
  const { width, height } = useViewportSize();
  if (Platform.OS !== 'web') return 1;
  const contentMax = 1200;
  const rowW = Math.min(width - 80, contentMax);
  const phoneColW = rowW * 0.54;
  const padY = 72;
  const scaleW = (phoneColW - 24) / DESKTOP_PHONE.width;
  const scaleH = (height - padY) / DESKTOP_PHONE.height;
  return Math.min(1, scaleW, scaleH);
}

function ensureViewportFitCover() {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    document.head.appendChild(meta);
  }
  const content = String(meta.getAttribute('content') || '');
  if (!/viewport-fit\s*=\s*cover/i.test(content)) {
    meta.setAttribute(
      'content',
      content
        ? `${content.replace(/,?\s*$/, '')}, viewport-fit=cover`
        : 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover',
    );
  }
}

/**
 * Edge-to-edge web shell:
 * - Forces viewport-fit=cover (kills notched letterbox bars)
 * - Transparent html/body/#root (no flat sage strips)
 * - Fixed DOM ombre behind React so top/bottom always blend with the animation
 */
export function injectMobileWebViewport() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (typeof window !== 'undefined' && window.__calmmamaViewportInjected) {
    ensureViewportFitCover();
    return;
  }

  ensureViewportFitCover();

  const cycleMs = CALM_MAMA_PASTEL_CYCLE_MS;
  const sage = CALM_MAMA_PASTEL.sage;
  const lavender = CALM_MAMA_PASTEL.lavender;
  const peach = CALM_MAMA_PASTEL.peach;

  const css = `
    html {
      height: 100%;
      height: 100dvh;
      width: 100%;
      margin: 0;
      padding: 0;
      background: transparent;
    }
    body {
      min-height: 100%;
      min-height: 100dvh;
      height: 100%;
      height: 100dvh;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
    }
    #root {
      min-height: 100%;
      min-height: 100dvh;
      height: 100%;
      height: 100dvh;
      width: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      flex: 1;
      background: transparent !important;
      position: relative;
      z-index: 1;
    }
    /* Full-viewport animated ombre — no flat sage bands at top/bottom */
    #calmmama-body-ombre {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      background: linear-gradient(
        155deg,
        ${sage} 0%,
        ${lavender} 35%,
        ${peach} 70%,
        ${sage} 100%
      );
      background-size: 300% 300%;
      animation: calmmamaOmbreShift ${cycleMs}ms ease-in-out infinite;
    }
    #calmmama-body-ombre .wash { display: none; }
    @keyframes calmmamaOmbreShift {
      0% { background-position: 0% 40%; }
      50% { background-position: 100% 60%; }
      100% { background-position: 0% 40%; }
    }
    @supports not (height: 100dvh) {
      html, body, #root, #calmmama-body-ombre {
        min-height: 100vh;
        height: 100vh;
      }
    }
  `;

  let style = document.getElementById('calmmama-mobile-viewport');
  if (!style) {
    style = document.createElement('style');
    style.id = 'calmmama-mobile-viewport';
    document.head.appendChild(style);
  }
  style.textContent = css;

  // theme-color follows soft mid wash so iOS chrome doesn’t paint a hard sage bar
  let theme = document.querySelector('meta[name="theme-color"]');
  if (!theme) {
    theme = document.createElement('meta');
    theme.setAttribute('name', 'theme-color');
    document.head.appendChild(theme);
  }
  theme.setAttribute('content', lavender);

  let layer = document.getElementById('calmmama-body-ombre');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'calmmama-body-ombre';
    layer.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(layer, document.body.firstChild);
  }

  if (typeof window !== 'undefined') {
    window.__calmmamaViewportInjected = true;
  }
}

export function getWebWrapperStyle() {
  if (Platform.OS !== 'web') return null;
  return {
    width: '100%',
    height: '100%',
    minHeight: '100dvh',
    backgroundColor: 'transparent',
  };
}

export function getIphoneFrameStyle(isMobileWeb) {
  if (Platform.OS !== 'web') return null;

  if (isMobileWeb) {
    return {
      width: '100%',
      height: '100%',
      minHeight: '100dvh',
      maxWidth: '100%',
      maxHeight: '100%',
      borderRadius: 0,
      borderWidth: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent',
    };
  }

  return {
    width: DESKTOP_PHONE.width,
    height: DESKTOP_PHONE.height,
    borderRadius: DESKTOP_PHONE.borderRadius,
    borderWidth: DESKTOP_PHONE.bezel,
    borderColor: DESKTOP_PHONE.bezelColor,
  };
}

export function getBottomNavStyle() {
  if (Platform.OS !== 'web') return null;
  return {
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
  };
}

export function getShellFooterLinksStyle() {
  return null;
}
