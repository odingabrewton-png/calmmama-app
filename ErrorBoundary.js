import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';

function resolveHmrUnavailableReason(error) {
  if (Platform.OS !== 'web') {
    return null;
  }

  const message = error?.message || String(error || '');
  const isHmrError =
    message.includes('HMR') ||
    message.includes('hot update') ||
    message.includes('Fast Refresh');

  if (!isHmrError) {
    return null;
  }

  return 'Hot reload is unavailable in this session. Tap below to recover without reloading.';
}

/**
 * Root error boundary — surfaces render crashes with the exact message
 * and React component stack for debugging.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      componentStack: '',
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      componentStack: errorInfo?.componentStack || '',
    });

    if (typeof console !== 'undefined') {
      console.error('[CalmMama Village ErrorBoundary]', error, errorInfo?.componentStack);
    }
  }

  handleReload = () => {
    if (typeof console !== 'undefined') {
      console.warn('[CalmMama Village ErrorBoundary] Recovering from render error.');
    }
    this.setState({ hasError: false, error: null, componentStack: '' });
  };

  render() {
    const { hasError, error, componentStack } = this.state;

    if (hasError && error) {
      const message = error?.message || String(error);
      const hmrUnavailableReason = resolveHmrUnavailableReason(error);

      return (
        <View style={styles.wrap}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.eyebrow}>CALMMAMA VILLAGE · DEBUG PANEL</Text>
            <Text style={styles.title}>The village paused on a rendering snag</Text>
            <Text style={styles.subtitle}>
              This screen caught an error before the app could finish loading. Details below are
              safe to screenshot for debugging on your live deploy.
            </Text>

            {hmrUnavailableReason ? (
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Hot reload notice</Text>
                <Text style={styles.mono}>{hmrUnavailableReason}</Text>
              </View>
            ) : null}

            <View style={styles.block}>
              <Text style={styles.blockLabel}>Error message</Text>
              <Text style={styles.mono} selectable>
                {message}
              </Text>
            </View>

            {error?.stack ? (
              <View style={styles.block}>
                <Text style={styles.blockLabel}>JavaScript stack</Text>
                <Text style={styles.monoSmall} selectable>
                  {error.stack}
                </Text>
              </View>
            ) : null}

            {componentStack ? (
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Component stack</Text>
                <Text style={styles.monoSmall} selectable>
                  {componentStack.trim()}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.reloadBtn} onPress={this.handleReload} activeOpacity={0.88}>
              <Text style={styles.reloadBtnText}>Reload village</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#BAC6BC',
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        minHeight: '100vh',
        width: '100vw',
      },
      default: {},
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#6B5588',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2A382E',
    lineHeight: 26,
    marginBottom: 8,
    ...Platform.select({
      web: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic' },
    }),
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4A5C50',
    fontStyle: 'italic',
    marginBottom: 18,
  },
  block: {
    backgroundColor: 'rgba(255, 252, 248, 0.88)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 198, 188, 0.45)',
  },
  blockLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#6B5588',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  mono: {
    fontSize: 13,
    lineHeight: 20,
    color: '#A35338',
    fontWeight: '700',
    ...Platform.select({
      web: { fontFamily: 'Consolas, "Courier New", monospace' },
      default: {},
    }),
  },
  monoSmall: {
    fontSize: 10,
    lineHeight: 15,
    color: '#3D5246',
    ...Platform.select({
      web: { fontFamily: 'Consolas, "Courier New", monospace', whiteSpace: 'pre-wrap' },
      default: {},
    }),
  },
  reloadBtn: {
    marginTop: 8,
    backgroundColor: '#5C7A68',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
