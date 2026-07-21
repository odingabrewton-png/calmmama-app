import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  hideDevToolsCircleWithRetry,
  isDevToolsFabControlAvailable,
  showDevToolsCircle,
} from './hideDevToolsCircle';

const DEV = typeof __DEV__ !== 'undefined' && __DEV__;
const REBUILD_HINT =
  'Rebuild your dev app once so the hide button can talk to Expo natively:\n\nnpx expo run:ios\n\n(or npx expo run:android)';

/**
 * Dev-only floating toggle for the Expo Tools circle (blue gear, top corner).
 */
export default function DevToolsScreenshotToggle() {
  const insets = useSafeAreaInsets();
  const [toolsHidden, setToolsHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nativeReady, setNativeReady] = useState(() => isDevToolsFabControlAvailable());

  useEffect(() => {
    if (nativeReady) return undefined;
    const timer = setInterval(() => {
      if (isDevToolsFabControlAvailable()) {
        setNativeReady(true);
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [nativeReady]);

  const showRebuildAlert = useCallback(() => {
    Alert.alert(
      'One-time rebuild needed',
      REBUILD_HINT,
      [{ text: 'OK' }]
    );
  }, []);

  const handleHide = useCallback(async () => {
    if (busy) return;
    if (!nativeReady) {
      showRebuildAlert();
      return;
    }
    setBusy(true);
    const ok = await hideDevToolsCircleWithRetry(12, 200);
    setToolsHidden(ok);
    setCollapsed(ok);
    if (!ok) {
      Alert.alert(
        'Could not hide Tools circle',
        `Try manually: tap the blue Tools circle → turn off “Tools button”.\n\n${REBUILD_HINT}`
      );
    }
    setBusy(false);
  }, [busy, nativeReady, showRebuildAlert]);

  const handleShow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    await showDevToolsCircle();
    setToolsHidden(false);
    setCollapsed(false);
    setBusy(false);
  }, [busy]);

  if (!DEV || Platform.OS === 'web') {
    return null;
  }

  const bottom = Math.max(insets.bottom, 12) + 72;

  if (collapsed && toolsHidden) {
    return (
      <Pressable
        style={[styles.dot, { bottom, left: 12 }]}
        onPress={() => setCollapsed(false)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Show dev tools toggle"
      >
        <View style={styles.dotInner} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, { bottom, left: 12 }]} pointerEvents="box-none">
      <Pressable
        style={[styles.pill, !nativeReady && styles.pillWarn]}
        onPress={toolsHidden ? handleShow : handleHide}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={toolsHidden ? 'Show Expo tools circle' : 'Hide Expo tools circle'}
      >
        {busy ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.pillText}>
            {toolsHidden
              ? 'Show Expo Tools'
              : nativeReady
                ? 'Hide Expo Tools'
                : 'Hide Expo Tools (rebuild)'}
          </Text>
        )}
      </Pressable>
      {!nativeReady ? (
        <Pressable onPress={showRebuildAlert}>
          <Text style={styles.hint}>Tap for rebuild steps — required once.</Text>
        </Pressable>
      ) : null}
      {toolsHidden ? (
        <Pressable onPress={() => setCollapsed(true)} hitSlop={8}>
          <Text style={styles.minimize}>Minimize</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 99999,
    alignItems: 'flex-start',
    maxWidth: 240,
  },
  pill: {
    backgroundColor: 'rgba(42, 56, 46, 0.88)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 132,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillWarn: {
    backgroundColor: 'rgba(120, 72, 48, 0.92)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  hint: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(42, 56, 46, 0.82)',
    backgroundColor: 'rgba(255, 252, 248, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  minimize: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(42, 56, 46, 0.55)',
    paddingVertical: 2,
  },
  dot: {
    position: 'absolute',
    zIndex: 99999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(42, 56, 46, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
