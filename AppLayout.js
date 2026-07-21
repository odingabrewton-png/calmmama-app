import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import RootWebLandingWrapper from './RootWebLandingWrapper';
import { getWebWrapperStyle, injectMobileWebViewport } from './mobileWebLayout';

/**
 * Root shell:
 * - Web (desktop + mobile browser + installed PWA) → RootWebLandingWrapper
 *   (wrapper routes: marketing vs direct app for standalone)
 * - Native iOS/Android → full-bleed app canvas
 */
export default function AppLayout({ children, showNotch = true }) {
  const webWrapperStyle = getWebWrapperStyle();

  useEffect(() => {
    injectMobileWebViewport();
  }, []);

  if (Platform.OS === 'web') {
    return (
      <RootWebLandingWrapper showNotch={showNotch}>{children}</RootWebLandingWrapper>
    );
  }

  return (
    <View style={[styles.masterCanvas, webWrapperStyle, styles.mobileFill]}>
      <View style={styles.mobileCanvas}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  masterCanvas: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  mobileFill: {
    width: '100%',
    height: '100%',
  },
  mobileCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 2,
  },
});
