import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TAB_NAV_PERF } from './tabShellConfig';

let Freeze = ({ children }) => children;
try {
  // eslint-disable-next-line global-require
  Freeze = require('react-freeze').Freeze;
} catch (_) {
  /* react-freeze optional */
}

/**
 * Keep-alive panel. Never use translateX/scale — those read as warping text
 * when two scenes are composited over the living ombre.
 *
 * Inactive panels must NOT rely on opacity alone: VideoView / <video> surfaces
 * ignore parent opacity and punch through transparent Home scroll gaps.
 */
function TabFreezeBoundary({
  isActive,
  freezeOnBlur = TAB_NAV_PERF.freezeOnBlur,
  children,
}) {
  const panel = (
    <View
      style={[styles.panel, isActive ? styles.panelActive : styles.panelInactive]}
      pointerEvents={isActive ? 'auto' : 'none'}
      collapsable={false}
      removeClippedSubviews={!isActive}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
      // RN-web: hide from layout/compositing so <video> cannot leak under Home.
      aria-hidden={!isActive}
    >
      {children}
    </View>
  );

  if (freezeOnBlur && !isActive) {
    return <Freeze freeze>{panel}</Freeze>;
  }

  return panel;
}

export default React.memo(TabFreezeBoundary);

const styles = StyleSheet.create({
  panel: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  panelActive: {
    zIndex: 2,
    opacity: 1,
    ...Platform.select({
      web: { visibility: 'visible' },
      default: {},
    }),
  },
  panelInactive: {
    zIndex: 0,
    opacity: 0,
    ...Platform.select({
      web: {
        // opacity:0 is not enough for HTML video / VideoView on web.
        visibility: 'hidden',
        pointerEvents: 'none',
      },
      // Native: VideoView is unmounted while Bloom is inactive (ModularBabyGrowth).
      default: {},
    }),
  },
});
